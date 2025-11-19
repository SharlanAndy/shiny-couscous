"""
Forms API endpoints.

Handles form listing, retrieval, and schema fetching for dynamic rendering.
"""

from typing import Optional
from uuid import UUID
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import get_db
from labuan_fsa.models.form import Form
from labuan_fsa.schemas.form import (
    FormCreate,
    FormResponse,
    FormSchemaResponse,
    FormUpdate,
)
from labuan_fsa.json_db import (
    get_forms as json_get_forms,
    get_form_by_id as json_get_form_by_id,
    create_form as json_create_form,
    update_form as json_update_form,
    initialize_default_data,
)

router = APIRouter(prefix="/api/forms", tags=["Forms"])


async def _try_sql_db(coro):
    """Try SQL database, fallback to JSON on error."""
    try:
        return await coro
    except Exception as e:
        print(f"⚠️  SQL database error, falling back to JSON: {e}")
        # Initialize default data if JSON DB is empty
        await initialize_default_data()
        return None


@router.get("", response_model=list[FormResponse])
async def list_forms(
    status: Optional[str] = Query(None, description="Filter by status: active, inactive, all"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Optional[AsyncSession] = Depends(get_db),
) -> list[FormResponse]:
    """
    List all available forms.

    Uses JSON database by default. Falls back to SQL database only if explicitly configured.

    Args:
        status: Filter by status (active, inactive, all)
        category: Filter by category
        search: Search by name or description
        page: Page number
        page_size: Page size
        db: Database session

    Returns:
        List of forms
    """
    # Helper function to convert JSON forms to FormResponse
    def _convert_json_forms(json_forms: list[dict]) -> list[FormResponse]:
        result_forms = []
        for f in json_forms:
            try:
                # Parse datetime strings
                created_at = datetime.fromisoformat(f.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00"))
                updated_at = datetime.fromisoformat(f.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00"))
                
                # Handle both isActive (camelCase) and is_active (snake_case) for backward compatibility
                is_active = f.get("isActive") if "isActive" in f else f.get("is_active", True)
                
                form_response = FormResponse(
                    id=UUID(f.get("id", str(uuid.uuid4()))),
                    form_id=f.get("formId", ""),
                    name=f.get("name", ""),
                    description=f.get("description"),
                    category=f.get("category"),
                    version=f.get("version", "1.0.0"),
                    is_active=is_active,
                    requires_auth=f.get("requiresAuth", False),
                    estimated_time=f.get("estimatedTime"),
                    created_at=created_at,
                    updated_at=updated_at,
                    created_by=f.get("createdBy"),
                    updated_by=f.get("updatedBy"),
                )
                result_forms.append(form_response)
            except Exception as e:
                print(f"⚠️  Error converting form {f.get('formId')}: {e}")
                continue
        return result_forms
    
    # Use JSON database by default (preferred for local development and GitHub-based storage)
    print("📄 Using JSON database (default)")
    await initialize_default_data()
    json_forms = await json_get_forms(status=status)
    
    # Apply additional filters
    if category:
        json_forms = [f for f in json_forms if f.get("category") == category]
    if search:
        search_lower = search.lower()
        json_forms = [
            f for f in json_forms
            if search_lower in f.get("name", "").lower() or search_lower in f.get("description", "").lower()
        ]
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_forms = json_forms[start:end]
    
    return _convert_json_forms(paginated_forms)


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> FormResponse:
    """
    Get form details.

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Form identifier
        db: Database session

    Returns:
        Form details

    Raises:
        HTTPException: 404 if form not found
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - using JSON database")
        await initialize_default_data()
        json_form = await json_get_form_by_id(form_id)
        
        if not json_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Convert to FormResponse format
        return FormResponse(
            id=UUID(json_form.get("id", str(uuid.uuid4()))),
            form_id=json_form.get("formId", ""),
            name=json_form.get("name", ""),
            description=json_form.get("description"),
            category=json_form.get("category"),
            version=json_form.get("version", "1.0.0"),
            is_active=json_form.get("isActive", True),
            requires_auth=json_form.get("requiresAuth", False),
            estimated_time=json_form.get("estimatedTime"),
            created_at=datetime.fromisoformat(json_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(json_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            created_by=json_form.get("createdBy"),
            updated_by=json_form.get("updatedBy"),
        )
    
    # Try SQL database first
    try:
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        form = result.scalar_one_or_none()
        if form:
            return FormResponse.model_validate(form)
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    await initialize_default_data()
    json_form = await json_get_form_by_id(form_id)
    
    if not json_form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
    
    # Convert to FormResponse format
    return FormResponse(
        id=UUID(json_form.get("id", str(uuid.uuid4()))),
        form_id=json_form.get("formId", ""),
        name=json_form.get("name", ""),
        description=json_form.get("description"),
        category=json_form.get("category"),
        version=json_form.get("version", "1.0.0"),
        is_active=json_form.get("isActive", True),
        requires_auth=json_form.get("requiresAuth", False),
        estimated_time=json_form.get("estimatedTime"),
        created_at=datetime.fromisoformat(json_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
        updated_at=datetime.fromisoformat(json_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
        created_by=json_form.get("createdBy"),
        updated_by=json_form.get("updatedBy"),
    )


@router.get("/{form_id}/schema", response_model=FormSchemaResponse)
async def get_form_schema(
    form_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> FormSchemaResponse:
    """
    Get complete form schema for dynamic rendering.

    This endpoint returns the complete form schema including all steps and fields,
    which the frontend uses to dynamically render the form.

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Form identifier
        db: Database session

    Returns:
        Complete form schema for rendering

    Raises:
        HTTPException: 404 if form not found
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - using JSON database")
        await initialize_default_data()
        json_form = await json_get_form_by_id(form_id)
        
        if not json_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Extract schema data
        schema_data = json_form.get("schemaData", {})
        
        # Build response
        return FormSchemaResponse(
            form_id=json_form.get("formId", ""),
            form_name=json_form.get("name", ""),
            version=json_form.get("version", "1.0.0"),
            steps=schema_data.get("steps", []),
            estimated_time=json_form.get("estimatedTime"),
            submit_button=schema_data.get("submitButton"),
        )
    
    # Try SQL database first
    try:
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        form = result.scalar_one_or_none()
        if form:
            # Extract schema data
            schema_data = form.schema_data
            
            # Build response
            return FormSchemaResponse(
                form_id=form.form_id,
                form_name=form.name,
                version=form.version,
                steps=schema_data.get("steps", []),
                estimated_time=form.estimated_time,
                submit_button=schema_data.get("submitButton"),
            )
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    await initialize_default_data()
    json_form = await json_get_form_by_id(form_id)
    
    if not json_form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
    
    # Extract schema data
    schema_data = json_form.get("schemaData", {})
    
    # Build response
    return FormSchemaResponse(
        form_id=json_form.get("formId", ""),
        form_name=json_form.get("name", ""),
        version=json_form.get("version", "1.0.0"),
        steps=schema_data.get("steps", []),
        estimated_time=json_form.get("estimatedTime"),
        submit_button=schema_data.get("submitButton"),
    )


@router.post("", response_model=FormResponse, status_code=201)
async def create_form(
    form_data: FormCreate,
    db: Optional[AsyncSession] = Depends(get_db),
) -> FormResponse:
    """
    Create a new form (Admin only).

    Falls back to JSON database if SQL database fails.

    Args:
        form_data: Form creation data
        db: Database session

    Returns:
        Created form

    Raises:
        HTTPException: 409 if form_id already exists
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - creating form in JSON database")
        await initialize_default_data()
        
        # Check if form_id already exists in JSON
        existing_json_form = await json_get_form_by_id(form_data.form_id)
        if existing_json_form:
            raise HTTPException(
                status_code=409, detail=f"Form with form_id '{form_data.form_id}' already exists"
            )
        
        # Create form in JSON database
        json_form_data = {
            "formId": form_data.form_id,
            "name": form_data.name,
            "description": form_data.description,
            "category": form_data.category,
            "version": form_data.version,
            "schemaData": form_data.schema_data,
            "isActive": form_data.is_active,
            "requiresAuth": form_data.requires_auth,
            "estimatedTime": form_data.estimated_time,
        }
        
        created_form = await json_create_form(json_form_data)
        
        # Convert to FormResponse format
        return FormResponse(
            id=UUID(created_form.get("id", str(uuid.uuid4()))),
            form_id=created_form.get("formId", ""),
            name=created_form.get("name", ""),
            description=created_form.get("description"),
            category=created_form.get("category"),
            version=created_form.get("version", "1.0.0"),
            is_active=created_form.get("isActive", True),
            requires_auth=created_form.get("requiresAuth", False),
            estimated_time=created_form.get("estimatedTime"),
            created_at=datetime.fromisoformat(created_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(created_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            created_by=created_form.get("createdBy"),
            updated_by=created_form.get("updatedBy"),
        )
    
    # Try SQL database first
    try:
        # Check if form_id already exists
        result = await db.execute(select(Form).where(Form.form_id == form_data.form_id))
        existing_form = result.scalar_one_or_none()

        if existing_form:
            raise HTTPException(
                status_code=409, detail=f"Form with form_id '{form_data.form_id}' already exists"
            )

        # Create form
        form = Form(
            form_id=form_data.form_id,
            name=form_data.name,
            description=form_data.description,
            category=form_data.category,
            version=form_data.version,
            schema_data=form_data.schema_data,
            is_active=form_data.is_active,
            requires_auth=form_data.requires_auth,
            estimated_time=form_data.estimated_time,
        )

        db.add(form)
        await db.commit()
        await db.refresh(form)

        return FormResponse.model_validate(form)
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Check if form_id already exists in JSON
        existing_json_form = await json_get_form_by_id(form_data.form_id)
        if existing_json_form:
            raise HTTPException(
                status_code=409, detail=f"Form with form_id '{form_data.form_id}' already exists"
            )
        
        # Create form in JSON database
        json_form_data = {
            "formId": form_data.form_id,
            "name": form_data.name,
            "description": form_data.description,
            "category": form_data.category,
            "version": form_data.version,
            "schemaData": form_data.schema_data,
            "isActive": form_data.is_active,
            "requiresAuth": form_data.requires_auth,
            "estimatedTime": form_data.estimated_time,
        }
        
        created_form = await json_create_form(json_form_data)
        
        # Convert to FormResponse format
        return FormResponse(
            id=UUID(created_form.get("id", str(uuid.uuid4()))),
            form_id=created_form.get("formId", ""),
            name=created_form.get("name", ""),
            description=created_form.get("description"),
            category=created_form.get("category"),
            version=created_form.get("version", "1.0.0"),
            is_active=created_form.get("isActive", True),
            requires_auth=created_form.get("requiresAuth", False),
            estimated_time=created_form.get("estimatedTime"),
            created_at=datetime.fromisoformat(created_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(created_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            created_by=created_form.get("createdBy"),
            updated_by=created_form.get("updatedBy"),
        )


@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: str,
    form_data: FormUpdate,
    db: Optional[AsyncSession] = Depends(get_db),
) -> FormResponse:
    """
    Update a form (Admin only).

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Form identifier
        form_data: Form update data
        db: Database session

    Returns:
        Updated form

    Raises:
        HTTPException: 404 if form not found
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - updating form in JSON database")
        await initialize_default_data()
        
        # Get existing form from JSON
        existing_form = await json_get_form_by_id(form_id)
        if not existing_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Prepare update data
        update_data = {}
        if form_data.name is not None:
            update_data["name"] = form_data.name
        if form_data.description is not None:
            update_data["description"] = form_data.description
        if form_data.category is not None:
            update_data["category"] = form_data.category
        if form_data.version is not None:
            update_data["version"] = form_data.version
        if form_data.schema_data is not None:
            update_data["schemaData"] = form_data.schema_data
        if form_data.is_active is not None:
            update_data["isActive"] = form_data.is_active
        if form_data.requires_auth is not None:
            update_data["requiresAuth"] = form_data.requires_auth
        if form_data.estimated_time is not None:
            update_data["estimatedTime"] = form_data.estimated_time
        
        # Update form in JSON database
        updated_form = await json_update_form(form_id, update_data)
        if not updated_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Convert to FormResponse format
        return FormResponse(
            id=UUID(updated_form.get("id", str(uuid.uuid4()))),
            form_id=updated_form.get("formId", ""),
            name=updated_form.get("name", ""),
            description=updated_form.get("description"),
            category=updated_form.get("category"),
            version=updated_form.get("version", "1.0.0"),
            is_active=updated_form.get("isActive", True),
            requires_auth=updated_form.get("requiresAuth", False),
            estimated_time=updated_form.get("estimatedTime"),
            created_at=datetime.fromisoformat(updated_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            created_by=updated_form.get("createdBy"),
            updated_by=updated_form.get("updatedBy"),
        )
    
    # Try SQL database first
    try:
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        form = result.scalar_one_or_none()

        if not form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

        # Update form fields
        if form_data.name is not None:
            form.name = form_data.name
        if form_data.description is not None:
            form.description = form_data.description
        if form_data.category is not None:
            form.category = form_data.category
        if form_data.version is not None:
            form.version = form_data.version
        if form_data.schema_data is not None:
            form.schema_data = form_data.schema_data
        if form_data.is_active is not None:
            form.is_active = form_data.is_active
        if form_data.requires_auth is not None:
            form.requires_auth = form_data.requires_auth
        if form_data.estimated_time is not None:
            form.estimated_time = form_data.estimated_time

        await db.commit()
        await db.refresh(form)

        return FormResponse.model_validate(form)
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Get existing form from JSON
        existing_form = await json_get_form_by_id(form_id)
        if not existing_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Prepare update data
        update_data = {}
        if form_data.name is not None:
            update_data["name"] = form_data.name
        if form_data.description is not None:
            update_data["description"] = form_data.description
        if form_data.category is not None:
            update_data["category"] = form_data.category
        if form_data.version is not None:
            update_data["version"] = form_data.version
        if form_data.schema_data is not None:
            update_data["schemaData"] = form_data.schema_data
        if form_data.is_active is not None:
            update_data["isActive"] = form_data.is_active
        if form_data.requires_auth is not None:
            update_data["requiresAuth"] = form_data.requires_auth
        if form_data.estimated_time is not None:
            update_data["estimatedTime"] = form_data.estimated_time
        
        # Update form in JSON database
        updated_form = await json_update_form(form_id, update_data)
        if not updated_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        # Convert to FormResponse format
        return FormResponse(
            id=UUID(updated_form.get("id", str(uuid.uuid4()))),
            form_id=updated_form.get("formId", ""),
            name=updated_form.get("name", ""),
            description=updated_form.get("description"),
            category=updated_form.get("category"),
            version=updated_form.get("version", "1.0.0"),
            is_active=updated_form.get("isActive", True),
            requires_auth=updated_form.get("requiresAuth", False),
            estimated_time=updated_form.get("estimatedTime"),
            created_at=datetime.fromisoformat(updated_form.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_form.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
            created_by=updated_form.get("createdBy"),
            updated_by=updated_form.get("updatedBy"),
        )

