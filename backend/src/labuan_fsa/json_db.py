"""
JSON file-based database handler.

This module provides a fallback database implementation using JSON files
when the primary SQL database is unavailable.

This is a workaround for connection issues and allows the application to
function with local file storage.
"""

import json
import uuid
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import asyncio
from functools import wraps

# Paths to JSON database files (separate files for each entity)
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FORMS_DB_PATH = DATA_DIR / "forms.json"
SUBMISSIONS_DB_PATH = DATA_DIR / "submissions.json"
USERS_DB_PATH = DATA_DIR / "users.json"

# Legacy path for backward compatibility
DB_PATH = DATA_DIR / "database.json"

# Lock for file operations
_file_lock = asyncio.Lock()

# Maximum file size before splitting (800KB - stay under 1MB GitHub limit)
MAX_FILE_SIZE = 800 * 1024


def async_file_operation(func):
    """Decorator to ensure thread-safe file operations."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        async with _file_lock:
            return await func(*args, **kwargs)
    return wrapper


def _is_split_file(file_path: Path) -> bool:
    """Check if a file path matches the split file pattern (e.g., forms.0.json)."""
    pattern = r'^(.+)\.(\d+)\.json$'
    return bool(re.match(pattern, file_path.name))


def _get_split_file_paths(base_path: Path, max_chunks: int = 100) -> List[Path]:
    """Get all potential split file paths for a given base file path."""
    paths = []
    base_name = base_path.stem  # filename without extension
    parent_dir = base_path.parent
    
    for i in range(max_chunks):
        split_path = parent_dir / f"{base_name}.{i}.json"
        paths.append(split_path)
    
    return paths


def _merge_split_files(split_files: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple split file chunks back into a single data structure."""
    if not split_files:
        return {}
    
    if len(split_files) == 1:
        # Single chunk - remove chunk metadata
        chunk = split_files[0]
        if 'chunkIndex' in chunk:
            chunk = chunk.copy()
            chunk.pop('chunkIndex', None)
            chunk.pop('totalChunks', None)
        return chunk
    
    # Multiple chunks - merge items arrays
    # Sort by chunkIndex
    sorted_chunks = sorted(split_files, key=lambda x: x.get('chunkIndex', 0))
    
    # Get metadata from first chunk
    merged = sorted_chunks[0].copy()
    merged.pop('chunkIndex', None)
    merged.pop('totalChunks', None)
    
    # Merge items arrays
    if 'items' in merged and isinstance(merged['items'], list):
        all_items = []
        for chunk in sorted_chunks:
            if 'items' in chunk and isinstance(chunk['items'], list):
                all_items.extend(chunk['items'])
        merged['items'] = all_items
    
    return merged


def _load_json_file(file_path: Path, default_value: list) -> list:
    """Load JSON array from file, handling both single files and split files."""
    # Check for split files first (they take precedence if they exist)
    split_paths = _get_split_file_paths(file_path, max_chunks=100)
    split_files = []
    
    for split_path in split_paths:
        if not split_path.exists():
            # Stop at first missing chunk
            break
        
        try:
            with open(split_path, 'r', encoding='utf-8') as f:
                chunk_data = json.load(f)
                # Extract chunk index from filename
                match = re.match(r'^.+\.(\d+)\.json$', split_path.name)
                if match:
                    chunk_index = int(match.group(1))
                    if isinstance(chunk_data, dict):
                        chunk_data['chunkIndex'] = chunk_index
                split_files.append(chunk_data)
        except (json.JSONDecodeError, IOError) as e:
            print(f"⚠️  Error loading split file {split_path}: {e}")
            break
    
    # If we found split files, prefer them (they're more complete/recent)
    if split_files:
        print(f"📦 Found {len(split_files)} split files for {file_path.name}, merging...")
        merged_data = _merge_split_files(split_files)
        
        # Extract items array from merged data
        if isinstance(merged_data, list):
            return merged_data
        elif isinstance(merged_data, dict) and "items" in merged_data:
            return merged_data["items"]
        elif isinstance(merged_data, dict) and "data" in merged_data:
            return merged_data["data"]
        else:
            return default_value.copy()
    
    # If no split files, try to read the main file
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Handle both array format and object with array format
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "items" in data:
                    return data["items"]
                elif isinstance(data, dict) and "data" in data:
                    return data["data"]
                else:
                    return default_value.copy()
        except (json.JSONDecodeError, IOError) as e:
            print(f"⚠️  Error loading JSON file {file_path}: {e}")
            return default_value.copy()
    
    # No main file and no split files found
    return default_value.copy()


def _estimate_json_size(data: Any) -> int:
    """Estimate JSON string size in bytes."""
    return len(json.dumps(data, ensure_ascii=False).encode('utf-8'))


def _split_data_into_chunks(file_path: Path, data: list) -> List[Dict[str, Any]]:
    """Split large data array into chunks if it exceeds MAX_FILE_SIZE."""
    # Create file data structure
    file_data = {
        "version": "1.0.0",
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "items": data
    }
    
    # Check if file needs splitting
    estimated_size = _estimate_json_size(file_data)
    if estimated_size <= MAX_FILE_SIZE:
        return [{"path": file_path, "data": file_data}]
    
    # Need to split - calculate items per chunk
    if not data:
        return [{"path": file_path, "data": file_data}]
    
    # Estimate size per item
    sample_item = data[0]
    item_size = _estimate_json_size(sample_item)
    # Add metadata overhead (version, lastUpdated, items wrapper)
    metadata_overhead = 200
    items_per_chunk = max(1, (MAX_FILE_SIZE - metadata_overhead) // (item_size + 100))  # 100 bytes safety margin
    
    chunks = []
    base_name = file_path.stem  # filename without extension
    parent_dir = file_path.parent
    
    # Split items into chunks
    for i in range(0, len(data), items_per_chunk):
        chunk_items = data[i:i + items_per_chunk]
        chunk_index = i // items_per_chunk
        
        chunk_path = parent_dir / f"{base_name}.{chunk_index}.json"
        chunk_data = {
            "version": file_data["version"],
            "lastUpdated": file_data["lastUpdated"],
            "items": chunk_items,
            "chunkIndex": chunk_index,
            "totalChunks": (len(data) + items_per_chunk - 1) // items_per_chunk,
        }
        
        chunks.append({"path": chunk_path, "data": chunk_data})
    
    return chunks


def _save_json_file(file_path: Path, data: list) -> None:
    """Save JSON array to file, automatically splitting if too large."""
    try:
        # Check if we need to split
        chunks = _split_data_into_chunks(file_path, data)
        
        if len(chunks) == 1:
            # Single file - save normally
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(chunks[0]["data"], f, indent=2, ensure_ascii=False)
            
            # Delete old split files if they exist
            split_paths = _get_split_file_paths(file_path, max_chunks=100)
            for split_path in split_paths:
                if split_path.exists():
                    try:
                        split_path.unlink()
                    except Exception as e:
                        print(f"⚠️  Error deleting old split file {split_path}: {e}")
        else:
            # Multiple chunks - save each chunk
            for chunk in chunks:
                with open(chunk["path"], 'w', encoding='utf-8') as f:
                    json.dump(chunk["data"], f, indent=2, ensure_ascii=False)
            
            # Delete old main file if it exists
            if file_path.exists():
                try:
                    file_path.unlink()
                except Exception as e:
                    print(f"⚠️  Error deleting old main file {file_path}: {e}")
            
            # Delete any old split files beyond the new count
            split_paths = _get_split_file_paths(file_path, max_chunks=100)
            for i in range(len(chunks), len(split_paths)):
                old_split_path = split_paths[i]
                if old_split_path.exists():
                    try:
                        old_split_path.unlink()
                    except Exception as e:
                        print(f"⚠️  Error deleting old split file {old_split_path}: {e}")
            
            print(f"📦 Split {file_path.name} into {len(chunks)} chunks")
    except IOError as e:
        print(f"⚠️  Error saving JSON file {file_path}: {e}")
        raise


def _load_db() -> Dict[str, Any]:
    """Load legacy combined database from file (for backward compatibility)."""
    if not DB_PATH.exists():
        return {
            "version": "1.0.0",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "lastUpdated": datetime.utcnow().isoformat() + "Z",
            "forms": [],
            "submissions": [],
            "users": []
        }
    
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"⚠️  Error loading legacy JSON database: {e}")
        return {
            "version": "1.0.0",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "lastUpdated": datetime.utcnow().isoformat() + "Z",
            "forms": [],
            "submissions": [],
            "users": []
        }


@async_file_operation
async def get_forms(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all forms, optionally filtered by status."""
    # Try separate file first, fallback to legacy combined file
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    # If empty, try to migrate from legacy file
    if not forms and DB_PATH.exists():
        legacy_db = _load_db()
        forms = legacy_db.get("forms", [])
        if forms:
            # Migrate to separate file
            _save_json_file(FORMS_DB_PATH, forms)
            print("📦 Migrated forms from legacy database.json to forms.json")
    
    if status == "active":
        forms = [f for f in forms if f.get("isActive", False)]
    elif status == "inactive":
        forms = [f for f in forms if not f.get("isActive", False)]
    
    return forms


@async_file_operation
async def get_form_by_id(form_id: str) -> Optional[Dict[str, Any]]:
    """Get a form by its form_id."""
    # Load directly from file to avoid recursion
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    # If empty, try to migrate from legacy file
    if not forms and DB_PATH.exists():
        legacy_db = _load_db()
        forms = legacy_db.get("forms", [])
        if forms:
            # Migrate to separate file
            _save_json_file(FORMS_DB_PATH, forms)
            print("📦 Migrated forms from legacy database.json to forms.json")
    
    for form in forms:
        if form.get("formId") == form_id:
            return form
    
    return None


@async_file_operation
async def create_form(form_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new form."""
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    # Generate ID if not provided
    if "id" not in form_data:
        form_data["id"] = str(uuid.uuid4())
    
    # Set timestamps
    now = datetime.utcnow().isoformat() + "Z"
    if "createdAt" not in form_data:
        form_data["createdAt"] = now
    if "updatedAt" not in form_data:
        form_data["updatedAt"] = now
    
    # Add to forms list
    forms.append(form_data)
    _save_json_file(FORMS_DB_PATH, forms)
    
    return form_data


@async_file_operation
async def update_form(form_id: str, form_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an existing form."""
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    for i, form in enumerate(forms):
        if form.get("formId") == form_id:
            # Update form data
            form.update(form_data)
            form["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            forms[i] = form
            _save_json_file(FORMS_DB_PATH, forms)
            return form
    
    return None


@async_file_operation
async def delete_form(form_id: str) -> bool:
    """Delete a form by its form_id."""
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    original_count = len(forms)
    forms = [f for f in forms if f.get("formId") != form_id]
    
    if len(forms) < original_count:
        _save_json_file(FORMS_DB_PATH, forms)
        return True
    
    return False


@async_file_operation
async def get_submissions(form_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get submissions, optionally filtered by form_id or user_id."""
    # Try separate file first, fallback to legacy combined file
    submissions = _load_json_file(SUBMISSIONS_DB_PATH, [])
    
    # If empty, try to migrate from legacy file
    if not submissions and DB_PATH.exists():
        legacy_db = _load_db()
        submissions = legacy_db.get("submissions", [])
        if submissions:
            # Migrate to separate file
            _save_json_file(SUBMISSIONS_DB_PATH, submissions)
            print("📦 Migrated submissions from legacy database.json to submissions.json")
    
    if form_id:
        submissions = [s for s in submissions if s.get("formId") == form_id]
    
    if user_id:
        # Filter by submittedBy field (not userId)
        submissions = [s for s in submissions if s.get("submittedBy") == user_id]
    
    return submissions


@async_file_operation
async def get_submission_by_id(submission_id: str) -> Optional[Dict[str, Any]]:
    """Get a submission by its ID."""
    # Load directly from file to avoid recursion
    submissions = _load_json_file(SUBMISSIONS_DB_PATH, [])
    
    # If empty, try to migrate from legacy file
    if not submissions and DB_PATH.exists():
        legacy_db = _load_db()
        submissions = legacy_db.get("submissions", [])
        if submissions:
            # Migrate to separate file
            _save_json_file(SUBMISSIONS_DB_PATH, submissions)
            print("📦 Migrated submissions from legacy database.json to submissions.json")
    
    for submission in submissions:
        if submission.get("id") == submission_id or submission.get("submissionId") == submission_id:
            return submission
    
    return None


@async_file_operation
async def create_submission(submission_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new submission."""
    submissions = _load_json_file(SUBMISSIONS_DB_PATH, [])
    
    # Generate ID if not provided
    if "id" not in submission_data:
        submission_data["id"] = str(uuid.uuid4())
    
    # Ensure submissionId matches id if not set
    if "submissionId" not in submission_data:
        submission_data["submissionId"] = submission_data["id"]
    
    # Set timestamps
    now = datetime.utcnow().isoformat() + "Z"
    if "createdAt" not in submission_data:
        submission_data["createdAt"] = now
    if "updatedAt" not in submission_data:
        submission_data["updatedAt"] = now
    
    # Add to submissions list
    submissions.append(submission_data)
    _save_json_file(SUBMISSIONS_DB_PATH, submissions)
    
    print(f"💾 Saved submission {submission_data.get('submissionId')} to submissions.json")
    
    return submission_data


@async_file_operation
async def update_submission(submission_id: str, submission_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an existing submission."""
    submissions = _load_json_file(SUBMISSIONS_DB_PATH, [])
    
    for i, submission in enumerate(submissions):
        if submission.get("id") == submission_id or submission.get("submissionId") == submission_id:
            # Update submission data
            submission.update(submission_data)
            submission["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            submissions[i] = submission
            _save_json_file(SUBMISSIONS_DB_PATH, submissions)
            print(f"💾 Updated submission {submission_id} in submissions.json")
            return submission
    
    return None


@async_file_operation
async def delete_submission(submission_id: str) -> bool:
    """Delete a submission by its ID."""
    submissions = _load_json_file(SUBMISSIONS_DB_PATH, [])
    
    original_count = len(submissions)
    submissions = [
        s for s in submissions 
        if s.get("id") != submission_id and s.get("submissionId") != submission_id
    ]
    
    if len(submissions) < original_count:
        _save_json_file(SUBMISSIONS_DB_PATH, submissions)
        return True
    
    return False


async def initialize_default_data() -> None:
    """Initialize default form data if database is empty."""
    # Check if forms already exist in separate file
    forms = _load_json_file(FORMS_DB_PATH, [])
    
    if forms:
        return
    
    # Try legacy file
    if DB_PATH.exists():
        legacy_db = _load_db()
        legacy_forms = legacy_db.get("forms", [])
        if legacy_forms:
            # Migrate to separate file
            _save_json_file(FORMS_DB_PATH, legacy_forms)
            print("📦 Migrated forms from legacy database.json to forms.json")
            return
    
    # Import seed function
    try:
        import sys
        from pathlib import Path
        scripts_dir = Path(__file__).parent.parent.parent / "scripts"
        sys.path.insert(0, str(scripts_dir))
        from seed_sample_form import create_labuan_company_management_form_schema
        
        schema_data = create_labuan_company_management_form_schema()
        
        form_data = {
            "id": str(uuid.uuid4()),
            "formId": schema_data["formId"],
            "name": schema_data["formName"],
            "description": "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
            "category": "Licensing",
            "version": schema_data["version"],
            "schemaData": schema_data,
            "isActive": True,
            "requiresAuth": True,
            "estimatedTime": "2-3 hours",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
            "createdBy": None,
            "updatedBy": None
        }
        
        _save_json_file(FORMS_DB_PATH, [form_data])
        
        print(f"✅ Initialized default form in forms.json")
        print(f"   Form ID: {form_data['formId']}")
    except Exception as e:
        print(f"⚠️  Error initializing default data: {e}")

