"""
File upload API endpoints.

Handles file uploads, downloads, and deletion.
Supports both SQL database and JSON fallback.
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.config import get_settings
from labuan_fsa.database import get_db
from labuan_fsa.models.submission import FileUpload as FileUploadModel
from labuan_fsa.schemas.file import FileUploadResponse
from labuan_fsa.utils.validators import validate_file_upload

router = APIRouter(prefix="/api/files", tags=["Files"])

settings = get_settings()

# JSON database for file uploads
FILES_DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "files.json"
FILES_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_file_hash(file_content: bytes) -> str:
    """Calculate SHA-256 hash of file content."""
    return hashlib.sha256(file_content).hexdigest()


def _load_json_files() -> list:
    """Load files from JSON database."""
    if not FILES_DB_PATH.exists():
        return []
    
    try:
        with open(FILES_DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict) and 'items' in data:
                return data['items']
            elif isinstance(data, list):
                return data
            return []
    except Exception as e:
        print(f"Error loading files.json: {e}")
        return []


def _save_json_files(files: list) -> None:
    """Save files to JSON database."""
    data = {
        "version": "1.0.0",
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "items": files
    }
    with open(FILES_DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


async def save_file_locally(file: UploadFile, field_name: str) -> tuple[str, int]:
    """
    Save file to local storage.

    Returns:
        Tuple of (file_path, file_size)
    """
    # Create uploads directory if it doesn't exist
    upload_dir = Path(settings.storage.local_path)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ''
    unique_filename = f"{field_name}_{uuid4().hex[:16]}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save file
    file_content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(file_content)

    file_size = len(file_content)
    # Return absolute path for JSON storage
    return str(file_path.absolute()), file_size


@router.post("/upload", response_model=FileUploadResponse, status_code=201)
@router.post("", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    field_name: str = Query(..., alias="fieldName"),
    file_id: Optional[str] = Query(None, alias="fileId"),  # Accept custom file ID from frontend
    db: Optional[AsyncSession] = Depends(get_db),
) -> FileUploadResponse:
    """
    Upload a file.

    Args:
        file: File to upload
        field_name: Form field name (can be passed as query param or form data)
        db: Database session (optional, will use JSON fallback if None)

    Returns:
        File upload response with metadata

    Raises:
        HTTPException: 400 if file validation fails, 413 if file too large
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    # Get file extension
    file_extension = Path(file.filename).suffix.lower()

    # Validate file
    file_content = await file.read()
    await file.seek(0)  # Reset file pointer for saving

    is_valid, error_message = validate_file_upload(
        file_size=len(file_content),
        file_name=file.filename,
        allowed_extensions=settings.storage.allowed_extensions,
        max_size=settings.storage.max_file_size,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    # Calculate file hash
    file_hash = get_file_hash(file_content)

    # Save file (currently only local storage)
    if settings.storage.provider == 'local':
        file_path, file_size = await save_file_locally(file, field_name)
        storage_url = None
    else:
        # TODO: Implement cloud storage (S3, Azure, GCP)
        raise HTTPException(status_code=501, detail="Cloud storage not yet implemented")

    # Generate file ID - use custom format if provided, otherwise use UUID
    # Frontend uses format: "file-{timestamp}-{filename}" for compatibility
    if file_id:
        # Use the custom file ID from frontend (timestamp-based)
        file_uuid = uuid4()  # Still generate UUID for internal use
        file_id_str = file_id  # Use frontend's file ID format
    else:
        # Generate new UUID-based file ID
        file_uuid = uuid4()
        file_id_str = str(file_uuid)
    if db is not None:
        try:
            file_upload = FileUploadModel(
                id=file_uuid,  # Use UUID for database
                submission_id=UUID('00000000-0000-0000-0000-000000000000'),  # Temporary UUID
                field_name=field_name,
                file_name=file.filename,
                file_path=file_path,
                file_size=file_size,
                mime_type=file.content_type,
                storage_location=settings.storage.provider,
                storage_url=storage_url,
                file_hash=file_hash,
                uploaded_by=None,  # TODO: Get from authentication
            )

            db.add(file_upload)
            await db.commit()
            await db.refresh(file_upload)

            return FileUploadResponse(
                id=str(file_upload.id),  # Convert UUID to string
                file_id=file_id_str,  # Return the file ID format that frontend expects
                field_name=file_upload.field_name,
                file_name=file_upload.file_name,
                file_path=file_upload.file_path,
                file_size=file_upload.file_size,
                mime_type=file_upload.mime_type,
                storage_location=file_upload.storage_location,
                storage_url=file_upload.storage_url,
                uploaded_at=file_upload.uploaded_at,
                uploaded_by=file_upload.uploaded_by,
            )
        except Exception as e:
            print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    files = _load_json_files()
    
    file_data = {
        "id": str(file_uuid),  # Internal UUID
        "fileId": file_id_str,  # Use frontend's file ID format for compatibility
        "submissionId": "00000000-0000-0000-0000-000000000000",  # Temporary
        "fieldName": field_name,
        "fileName": file.filename,
        "filePath": file_path,
        "fileSize": file_size,
        "mimeType": file.content_type,
        "storageLocation": settings.storage.provider,
        "storageUrl": storage_url,
        "fileHash": file_hash,
        "uploadedAt": datetime.utcnow().isoformat() + "Z",
        "uploadedBy": None,
    }
    
    files.append(file_data)
    _save_json_files(files)
    
    uploaded_at_dt = datetime.utcnow()
    
    return FileUploadResponse(
        id=str(file_uuid),  # Convert UUID to string
        file_id=file_id_str,  # Return the file ID format that frontend expects
        field_name=field_name,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        storage_location=settings.storage.provider,
        storage_url=storage_url,
        uploaded_at=uploaded_at_dt,
        uploaded_by=None,
    )


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
):
    """
    Download a file.

    Args:
        file_id: File ID (UUID string)
        db: Database session (optional, will use JSON fallback if None)

    Returns:
        File content

    Raises:
        HTTPException: 404 if file not found
    """
    # Try SQL database first
    if db is not None:
        try:
            result = await db.execute(
                select(FileUploadModel).where(FileUploadModel.id == UUID(file_id))
            )
            file_upload = result.scalar_one_or_none()

            if file_upload:
                if settings.storage.provider == 'local':
                    file_path = Path(file_upload.file_path)
                    if not file_path.exists():
                        raise HTTPException(status_code=404, detail="File not found on disk")

                    return FileResponse(
                        path=str(file_path),
                        filename=file_upload.file_name,
                        media_type=file_upload.mime_type,
                    )
        except Exception as e:
            print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    files = _load_json_files()
    # Support both UUID and frontend's timestamp-based file ID format (e.g., "file-1763466093336-test-document.pdf")
    file_data = next((f for f in files if 
                      f.get("id") == file_id or 
                      f.get("fileId") == file_id or 
                      str(f.get("id")) == file_id or 
                      str(f.get("fileId")) == file_id or
                      (isinstance(f.get("fileId"), str) and file_id in f.get("fileId", ""))), None)
    
    if not file_data:
        raise HTTPException(status_code=404, detail=f"File not found: {file_id}")
    
    file_path = Path(file_data.get("filePath", ""))
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=str(file_path),
        filename=file_data.get("fileName", "file"),
        media_type=file_data.get("mimeType", "application/octet-stream"),
    )


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
):
    """
    Delete a file.

    Args:
        file_id: File ID (UUID string)
        db: Database session (optional, will use JSON fallback if None)

    Raises:
        HTTPException: 404 if file not found
    """
    # Try SQL database first
    if db is not None:
        try:
            result = await db.execute(
                select(FileUploadModel).where(FileUploadModel.id == UUID(file_id))
            )
            file_upload = result.scalar_one_or_none()

            if file_upload:
                # Delete file from storage
                if settings.storage.provider == 'local':
                    file_path = Path(file_upload.file_path)
                    if file_path.exists():
                        file_path.unlink()

                # Delete record
                await db.delete(file_upload)
                await db.commit()
                return None
        except Exception as e:
            print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    files = _load_json_files()
    # Support both UUID and frontend's timestamp-based file ID format (e.g., "file-1763466093336-test-document.pdf")
    file_data = next((f for f in files if 
                      f.get("id") == file_id or 
                      f.get("fileId") == file_id or 
                      str(f.get("id")) == file_id or 
                      str(f.get("fileId")) == file_id or
                      (isinstance(f.get("fileId"), str) and file_id in f.get("fileId", ""))), None)
    
    if not file_data:
        raise HTTPException(status_code=404, detail=f"File not found: {file_id}")
    
    # Delete file from storage
    if settings.storage.provider == 'local':
        file_path = Path(file_data.get("filePath", ""))
        if file_path.exists():
            file_path.unlink()
    
    # Remove from JSON database
    files = [f for f in files if f.get("id") != file_id and f.get("fileId") != file_id]
    _save_json_files(files)
    
    return None
