"""
Forms API endpoints.

Handles form listing, retrieval, and schema fetching for dynamic rendering.
"""

from typing import Optional
from uuid import UUID

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

router = APIRouter(prefix="/api/forms", tags=["Forms"])


@router.get("", response_model=list[FormResponse])
async def list_forms(
    status: Optional[str] = Query(None, description="Filter by status: active, inactive, all"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
) -> list[FormResponse]:
    """
    List all available forms.

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
    # Build query
    query = select(Form)

    # Apply filters
    if status == "active":
        query = query.where(Form.is_active == True)
    elif status == "inactive":
        query = query.where(Form.is_active == False)

    if category:
        query = query.where(Form.category == category)

    if search:
        query = query.where(Form.name.ilike(f"%{search}%"))

    # Execute query
    result = await db.execute(query)
    forms = result.scalars().all()

    # Pagination (simple implementation)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_forms = forms[start:end]

    return [FormResponse.model_validate(form) for form in paginated_forms]


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
) -> FormResponse:
    """
    Get form details.

    Args:
        form_id: Form identifier
        db: Database session

    Returns:
        Form details

    Raises:
        HTTPException: 404 if form not found
    """
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    return FormResponse.model_validate(form)


@router.get("/{form_id}/schema", response_model=FormSchemaResponse)
async def get_form_schema(
    form_id: str,
    db: AsyncSession = Depends(get_db),
) -> FormSchemaResponse:
    """
    Get complete form schema for dynamic rendering.

    This endpoint returns the complete form schema including all steps and fields,
    which the frontend uses to dynamically render the form.

    Args:
        form_id: Form identifier
        db: Database session

    Returns:
        Complete form schema for rendering

    Raises:
        HTTPException: 404 if form not found
    """
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    # Extract schema data
    schema_data = form.schema_data

    # Build response (use form_id as alias for construction, serializes as formId)
    response = FormSchemaResponse(
        form_id=form.form_id,  # Use alias (form_id) for construction, will serialize as formId
        form_name=form.name,
        version=form.version,
        steps=schema_data.get("steps", []),
        estimated_time=form.estimated_time,
        submit_button=schema_data.get("submitButton"),
    )

    return response


@router.post("", response_model=FormResponse, status_code=201)
async def create_form(
    form_data: FormCreate,
    db: AsyncSession = Depends(get_db),
) -> FormResponse:
    """
    Create a new form (Admin only).

    Args:
        form_data: Form creation data
        db: Database session

    Returns:
        Created form

    Raises:
        HTTPException: 409 if form_id already exists
    """
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


@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: str,
    form_data: FormUpdate,
    db: AsyncSession = Depends(get_db),
) -> FormResponse:
    """
    Update a form (Admin only).

    Args:
        form_id: Form identifier
        form_data: Form update data
        db: Database session

    Returns:
        Updated form

    Raises:
        HTTPException: 404 if form not found
    """
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

