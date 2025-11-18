"""
Submissions API endpoints.

Handles form submission validation, submission, and draft saving.
"""

from datetime import datetime
from typing import Optional
import uuid

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
from labuan_fsa.utils.uuid_helper import safe_uuid_convert
from labuan_fsa.json_db import (
    get_form_by_id as json_get_form_by_id,
    get_submissions as json_get_submissions,
    get_submission_by_id as json_get_submission_by_id,
    create_submission as json_create_submission,
    update_submission as json_update_submission,
    initialize_default_data,
)
from labuan_fsa.api.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Submissions"])


@router.post("/forms/{form_id}/validate", response_model=SubmissionValidateResponse)
async def validate_submission(
    form_id: str,
    request: SubmissionValidateRequest,
    db: Optional[AsyncSession] = Depends(get_db),
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
    async def _get_sql_form():
        if db is None:
            return None
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        return result.scalar_one_or_none()
    
    # Try SQL database first
    form = None
    form_schema_data = None
    try:
        form = await _get_sql_form()
        if form:
            form_schema_data = form.schema_data
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    if not form_schema_data:
        await initialize_default_data()
        json_form = await json_get_form_by_id(form_id)
        if not json_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        form_schema_data = json_form.get("schemaData", {})
    
    # Validate form data
    is_valid, errors = validate_form_data(form_schema_data, request.data)

    return SubmissionValidateResponse(valid=is_valid, errors=errors)


@router.post("/forms/{form_id}/submit", response_model=SubmissionCreateResponse, status_code=201)
async def submit_form(
    form_id: str,
    request: SubmissionCreate,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user),
) -> SubmissionCreateResponse:
    """
    Submit form data.

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Form identifier
        request: Submission request with form data and files
        db: Database session

    Returns:
        Submission response with submission ID

    Raises:
        HTTPException: 400 if validation fails, 404 if form not found
    """
    async def _get_sql_form():
        if db is None:
            return None
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        return result.scalar_one_or_none()
    
    # Try SQL database first
    form = None
    form_schema_data = None
    try:
        form = await _get_sql_form()
        if form:
            form_schema_data = form.schema_data
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    if not form_schema_data:
        await initialize_default_data()
        json_form = await json_get_form_by_id(form_id)
        if not json_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        form_schema_data = json_form.get("schemaData", {})
    
    # Validate form data
    is_valid, errors = validate_form_data(form_schema_data, request.data)

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={"valid": False, "errors": [error.model_dump() for error in errors]},
        )

    # Get user ID from authentication
    user_id = current_user.get("userId") if current_user else None
    
    # Generate submission ID
    submission_id = generate_submission_id()

    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - saving submission to JSON database")
        submission_data = {
            "id": submission_id,
            "formId": form_id,
            "submissionId": submission_id,
            "submittedData": request.data,
            "status": "submitted",
            "submittedBy": user_id,
            "submittedAt": datetime.utcnow().isoformat() + "Z",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
        }
        
        await json_create_submission(submission_data)

        return SubmissionCreateResponse(
            form_id=form_id,
            submission_id=submission_id,
            status="submitted",
            message="Form submitted successfully",
            submitted_at=datetime.now(),
            estimated_review_time="5-7 business days",
        )

    # Try SQL database first
    try:
        submission = FormSubmission(
            form_id=form_id,
            submission_id=submission_id,
            submitted_data=request.data,
            status="submitted",
            submitted_by=user_id,
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
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    # Extract files from submittedData (step-4-documents) and store in files array
    files_list = []
    if request.data and "step-4-documents" in request.data:
        doc_data = request.data.get("step-4-documents", {})
        if "documentChecklist" in doc_data:
            checklist = doc_data.get("documentChecklist", {})
            for doc_key, doc_info in checklist.items():
                if isinstance(doc_info, dict) and doc_info.get("uploaded") and doc_info.get("fileId"):
                    files_list.append({
                        "fieldName": doc_key,
                        "fileId": doc_info.get("fileId"),
                        "fileName": doc_info.get("fileName", doc_info.get("fileId"))
                    })
    
    # Also include files from request.files if provided
    if request.files:
        files_list.extend(request.files)
    
    submission_data = {
        "id": submission_id,
        "formId": form_id,
        "submissionId": submission_id,
        "submittedData": request.data,  # This includes ALL steps including Step 5
        "status": "submitted",
        "submittedBy": user_id,
        "files": files_list,  # Store extracted file information
        "submittedAt": datetime.utcnow().isoformat() + "Z",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    }
    
    await json_create_submission(submission_data)

    return SubmissionCreateResponse(
        form_id=form_id,
        submission_id=submission_id,
        status="submitted",
        message="Form submitted successfully",
        submitted_at=datetime.now(),
        estimated_review_time="5-7 business days",
    )


@router.post("/forms/{form_id}/draft", response_model=SubmissionResponse, status_code=201)
async def save_draft(
    form_id: str,
    request: SubmissionDraft,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user),
) -> SubmissionResponse:
    """
    Save draft submission.

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Form identifier
        request: Draft request with form data
        db: Database session

    Returns:
        Draft submission response

    Raises:
        HTTPException: 404 if form not found
    """
    async def _get_sql_form():
        if db is None:
            return None
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        return result.scalar_one_or_none()
    
    # Try SQL database first
    form = None
    try:
        form = await _get_sql_form()
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    if not form:
        await initialize_default_data()
        json_form = await json_get_form_by_id(form_id)
        if not json_form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")

    # Get user ID from authentication
    user_id = current_user.get("userId") if current_user else None
    
    # Generate submission ID
    submission_id = generate_submission_id()

    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - saving draft to JSON database")
        
        # Extract files from submittedData (step-4-documents) and store in files array
        files_list = []
        if request.data and "step-4-documents" in request.data:
            doc_data = request.data.get("step-4-documents", {})
            if "documentChecklist" in doc_data:
                checklist = doc_data.get("documentChecklist", {})
                for doc_key, doc_info in checklist.items():
                    if isinstance(doc_info, dict) and doc_info.get("uploaded") and doc_info.get("fileId"):
                        files_list.append({
                            "fieldName": doc_key,
                            "fileId": doc_info.get("fileId"),
                            "fileName": doc_info.get("fileName", doc_info.get("fileId"))
                        })
        
        # Also include files from request.files if provided
        if request.files:
            files_list.extend(request.files)
        
        submission_data = {
            "id": submission_id,
            "formId": form_id,
            "submissionId": submission_id,
            "submittedData": request.data,  # This includes ALL steps including Step 5
            "status": "draft",
            "submittedBy": user_id,
            "files": files_list,  # Store extracted file information
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
        }
        
        json_submission = await json_create_submission(submission_data)
        
        # Convert to SubmissionResponse format - use actual field names, not serialization aliases
        created_at_str = json_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
        updated_at_str = json_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        
        return SubmissionResponse(
            id=safe_uuid_convert(json_submission.get("id", submission_id)),
            form_id=json_submission.get("formId", form_id),
            submission_id=json_submission.get("submissionId", submission_id),
            submitted_data=json_submission.get("submittedData", request.data),
            status=json_submission.get("status", "draft"),
            submitted_by=json_submission.get("submittedBy"),
            submitted_at=None,
            created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
        )

    # Try SQL database first
    try:
        submission = FormSubmission(
            form_id=form_id,
            submission_id=submission_id,
            submitted_data=request.data,
            status="draft",
            submitted_by=user_id,
        )

        db.add(submission)
        await db.commit()
        await db.refresh(submission)

        # TODO: Link file uploads if provided
        # TODO: Create audit log entry

        return SubmissionResponse.model_validate(submission)
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Fallback to JSON database
    submission_data = {
        "id": submission_id,
        "formId": form_id,
        "submissionId": submission_id,
        "submittedData": request.data,
        "status": "draft",
        "submittedBy": user_id,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    }
    
    json_submission = await json_create_submission(submission_data)
    
    # Convert to SubmissionResponse format - use actual field names, not serialization aliases
    created_at_str = json_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
    updated_at_str = json_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
    
    return SubmissionResponse(
        id=safe_uuid_convert(json_submission.get("id", submission_id)),
        form_id=json_submission.get("formId", form_id),
        submission_id=json_submission.get("submissionId", submission_id),
        submitted_data=json_submission.get("submittedData", request.data),
        status=json_submission.get("status", "draft"),
        submitted_by=json_submission.get("submittedBy"),
        submitted_at=None,
        created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
        updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
    )


@router.put("/submissions/{submission_id}/draft", response_model=SubmissionResponse)
async def update_draft(
    submission_id: str,
    request: SubmissionDraft,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user),
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
    async def _get_sql_submission():
        if db is None:
            return None
        result = await db.execute(
            select(FormSubmission).where(FormSubmission.submission_id == submission_id)
        )
        return result.scalar_one_or_none()
    
    # Try SQL database first
    submission = None
    try:
        submission = await _get_sql_submission()
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Get user ID from authentication
    user_id = current_user.get("userId") if current_user else None
    
    # Fallback to JSON database
    if not submission:
        await initialize_default_data()
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Check authorization - user can only update their own drafts
        if user_id and json_submission.get("submittedBy") and json_submission.get("submittedBy") != user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own submissions",
            )
        
        # Allow updating drafts and rejected submissions (for resubmission)
        current_status = json_submission.get("status", "draft")
        if current_status not in ["draft", "rejected"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot update submission with status '{current_status}'. Only drafts and rejected submissions can be updated.",
            )
        
        # Update submission data - includes ALL steps including Step 5
        json_submission["submittedData"] = request.data
        json_submission["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        # Extract files from submittedData (step-4-documents) and store in files array
        files_list = []
        if request.data and "step-4-documents" in request.data:
            doc_data = request.data.get("step-4-documents", {})
            if "documentChecklist" in doc_data:
                checklist = doc_data.get("documentChecklist", {})
                for doc_key, doc_info in checklist.items():
                    if isinstance(doc_info, dict) and doc_info.get("uploaded") and doc_info.get("fileId"):
                        files_list.append({
                            "fieldName": doc_key,
                            "fileId": doc_info.get("fileId"),
                            "fileName": doc_info.get("fileName", doc_info.get("fileId"))
                        })
        
        # Also include files from request.files if provided
        if request.files:
            files_list.extend(request.files)
        
        # Update files array
        json_submission["files"] = files_list
        # Preserve submittedBy if it exists, otherwise set it
        if not json_submission.get("submittedBy") and user_id:
            json_submission["submittedBy"] = user_id
        
        updated_submission = await json_update_submission(submission_id, json_submission)
        
        # Convert to SubmissionResponse format - use actual field names, not serialization aliases
        created_at_str = updated_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
        updated_at_str = updated_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        submitted_at_str = updated_submission.get("submittedAt")
        
        return SubmissionResponse(
            id=safe_uuid_convert(updated_submission.get("id", submission_id)),
            form_id=updated_submission.get("formId", ""),
            submission_id=updated_submission.get("submissionId", submission_id),
            submitted_data=updated_submission.get("submittedData", request.data),
            status=updated_submission.get("status", "draft"),
            submitted_by=updated_submission.get("submittedBy"),
            submitted_at=datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00")) if submitted_at_str else None,
            created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
        )
    
    # Allow updating drafts and rejected submissions (for resubmission)
    if submission.status not in ["draft", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update submission with status '{submission.status}'. Only drafts and rejected submissions can be updated.",
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
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user),
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
    async def _get_sql_submissions():
        if db is None:
            return None
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
    
    # Try SQL database first
    try:
        result = await _get_sql_submissions()
        if result is not None:
            return result
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Get user ID from authentication
    user_id = current_user.get("userId") if current_user else None
    
    # Fallback to JSON database
    await initialize_default_data()
    json_submissions = await json_get_submissions(form_id=form_id, user_id=user_id)
    
    # Apply status filter
    if status:
        json_submissions = [s for s in json_submissions if s.get("status") == status]
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_submissions = json_submissions[start:end]
    
    # Convert to SubmissionResponse format
    result_submissions = []
    for sub in paginated_submissions:
        try:
            # Convert to SubmissionResponse format - use actual field names, not serialization aliases
            created_at_str = sub.get("createdAt", datetime.utcnow().isoformat() + "Z")
            updated_at_str = sub.get("updatedAt", datetime.utcnow().isoformat() + "Z")
            submitted_at_str = sub.get("submittedAt")
            
            submission_response = SubmissionResponse(
                id=safe_uuid_convert(sub.get("id")),
                form_id=sub.get("formId", ""),
                submission_id=sub.get("submissionId", ""),
                submitted_data=sub.get("submittedData", {}),
                status=sub.get("status", "draft"),
                submitted_by=sub.get("submittedBy"),
                submitted_at=datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00")) if submitted_at_str else None,
                created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
            )
            result_submissions.append(submission_response)
        except Exception as e:
            print(f"⚠️  Error converting submission {sub.get('submissionId')}: {e}")
            continue
    
    return result_submissions


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user),
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
    async def _get_sql_submission():
        if db is None:
            return None
        result = await db.execute(
            select(FormSubmission).where(FormSubmission.submission_id == submission_id)
        )
        return result.scalar_one_or_none()
    
    # Try SQL database first
    submission = None
    try:
        submission = await _get_sql_submission()
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
    
    # Get user ID from authentication
    user_id = current_user.get("userId") if current_user else None
    
    # Fallback to JSON database
    if not submission:
        await initialize_default_data()
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Check authorization - user can only view their own submissions (unless admin)
        if user_id and json_submission.get("submittedBy") and json_submission.get("submittedBy") != user_id:
            # Check if user is admin
            user_role = current_user.get("role") if current_user else None
            if user_role != "admin":
                raise HTTPException(
                    status_code=403,
                    detail="You can only view your own submissions",
                )
        
        # Convert to SubmissionResponse format - use actual field names, not serialization aliases
        created_at_str = json_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
        updated_at_str = json_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        submitted_at_str = json_submission.get("submittedAt")
        
        return SubmissionResponse(
            id=safe_uuid_convert(json_submission.get("id", submission_id)),
            form_id=json_submission.get("formId", ""),
            submission_id=json_submission.get("submissionId", submission_id),
            submitted_data=json_submission.get("submittedData", {}),
            status=json_submission.get("status", "draft"),
            submitted_by=json_submission.get("submittedBy"),
            submitted_at=datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00")) if submitted_at_str else None,
            created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
        )
    
    # TODO: Check authorization (user can only view their own submissions)

    return SubmissionResponse.model_validate(submission)

