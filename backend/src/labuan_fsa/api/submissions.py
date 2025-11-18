"""
Submissions API endpoints.

Handles form submission validation, submission, and draft saving.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import get_db
from labuan_fsa.models.form import Form
from labuan_fsa.models.submission import FormSubmission
from labuan_fsa.schemas.submission import (
    SubmissionCreate,
    SubmissionCreateResponse,
    SubmissionDraft,
    SubmissionResponse,
    SubmissionValidateRequest,
    SubmissionValidateResponse,
)
from labuan_fsa.utils.validators import generate_submission_id, validate_form_data

router = APIRouter(prefix="/api", tags=["Submissions"])


@router.post("/forms/{form_id}/validate", response_model=SubmissionValidateResponse)
async def validate_submission(
    form_id: str,
    request: SubmissionValidateRequest,
    db: AsyncSession = Depends(get_db),
) -> SubmissionValidateResponse:
    """
    Validate submission data before submitting.

    Args:
        form_id: Form identifier
        request: Validation request with form data
        db: Database session

    Returns:
        Validation result with any errors

    Raises:
        HTTPException: 404 if form not found
    """
    # Get form
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    # Validate form data
    is_valid, errors = validate_form_data(form.schema_data, request.data)

    return SubmissionValidateResponse(valid=is_valid, errors=errors)


@router.post("/forms/{form_id}/submit", response_model=SubmissionCreateResponse, status_code=201)
async def submit_form(
    form_id: str,
    request: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
) -> SubmissionCreateResponse:
    """
    Submit form data.

    Args:
        form_id: Form identifier
        request: Submission request with form data and files
        db: Database session

    Returns:
        Submission response with submission ID

    Raises:
        HTTPException: 400 if validation fails, 404 if form not found
    """
    # Get form
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    # Validate form data
    is_valid, errors = validate_form_data(form.schema_data, request.data)

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={"valid": False, "errors": [error.model_dump() for error in errors]},
        )

    # Generate submission ID
    submission_id = generate_submission_id()

    # Create submission
    submission = FormSubmission(
        form_id=form_id,
        submission_id=submission_id,
        submitted_data=request.data,
        status="submitted",
        submitted_by=None,  # TODO: Get from authentication
        submitted_at=datetime.now(),
    )

    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # TODO: Link file uploads if provided
    # TODO: Send confirmation email
    # TODO: Create audit log entry

    return SubmissionCreateResponse(
        form_id=form_id,
        submission_id=submission_id,
        status="submitted",
        message="Form submitted successfully",
        submitted_at=submission.submitted_at or datetime.now(),
        estimated_review_time="5-7 business days",
    )


@router.post("/forms/{form_id}/draft", response_model=SubmissionResponse, status_code=201)
async def save_draft(
    form_id: str,
    request: SubmissionDraft,
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """
    Save draft submission.

    Args:
        form_id: Form identifier
        request: Draft request with form data
        db: Database session

    Returns:
        Draft submission response

    Raises:
        HTTPException: 404 if form not found
    """
    # Get form
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    form = result.scalar_one_or_none()

    if not form:
        raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    # Generate submission ID
    submission_id = generate_submission_id()

    # Create draft submission
    submission = FormSubmission(
        form_id=form_id,
        submission_id=submission_id,
        submitted_data=request.data,
        status="draft",
        submitted_by=None,  # TODO: Get from authentication
    )

    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # TODO: Link file uploads if provided
    # TODO: Create audit log entry

    return SubmissionResponse.model_validate(submission)


@router.put("/submissions/{submission_id}/draft", response_model=SubmissionResponse)
async def update_draft(
    submission_id: str,
    request: SubmissionDraft,
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """
    Update existing draft submission.

    Args:
        submission_id: Submission identifier
        request: Draft request with updated form data
        db: Database session

    Returns:
        Updated draft submission response

    Raises:
        HTTPException: 404 if submission not found, 400 if submission is not a draft
    """
    # Get submission
    result = await db.execute(
        select(FormSubmission).where(FormSubmission.submission_id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

    # Only allow updating drafts
    if submission.status != "draft":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update submission with status '{submission.status}'. Only drafts can be updated.",
        )

    # Update submission data
    submission.submitted_data = request.data
    submission.updated_at = datetime.now()

    await db.commit()
    await db.refresh(submission)

    # TODO: Update file uploads if provided
    # TODO: Create audit log entry

    return SubmissionResponse.model_validate(submission)


@router.get("/submissions", response_model=list[SubmissionResponse])
async def list_submissions(
    form_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[SubmissionResponse]:
    """
    List user's submissions.

    Args:
        form_id: Filter by form ID
        status: Filter by status
        page: Page number
        page_size: Page size
        db: Database session

    Returns:
        List of submissions
    """
    # Build query
    query = select(FormSubmission)

    # Apply filters
    if form_id:
        query = query.where(FormSubmission.form_id == form_id)
    if status:
        query = query.where(FormSubmission.status == status)

    # TODO: Filter by current user (from authentication)

    # Execute query
    result = await db.execute(query)
    submissions = result.scalars().all()

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_submissions = submissions[start:end]

    return [SubmissionResponse.model_validate(sub) for sub in paginated_submissions]


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """
    Get submission details.

    Args:
        submission_id: Submission ID
        db: Database session

    Returns:
        Submission details

    Raises:
        HTTPException: 404 if submission not found
    """
    result = await db.execute(
        select(FormSubmission).where(FormSubmission.submission_id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

    # TODO: Check authorization (user can only view their own submissions)

    return SubmissionResponse.model_validate(submission)

