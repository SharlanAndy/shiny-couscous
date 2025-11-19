"""
Admin API endpoints.

Handles admin operations: submission review, form management, audit logs, analytics.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import get_db
from labuan_fsa.models.submission import FormSubmission
from labuan_fsa.models.form import Form
from labuan_fsa.schemas.submission import SubmissionResponse, SubmissionUpdate
from labuan_fsa.json_db import (
    get_submissions as json_get_submissions,
    get_submission_by_id as json_get_submission_by_id,
    update_submission as json_update_submission,
    delete_submission as json_delete_submission,
    get_forms as json_get_forms,
    get_form_by_id as json_get_form_by_id,
    create_form as json_create_form,
    update_form as json_update_form,
    delete_form as json_delete_form,
    initialize_default_data,
)
from labuan_fsa.utils.uuid_helper import safe_uuid_convert
from labuan_fsa.api.auth import get_current_user
from labuan_fsa.auth_json import (
    get_all_users,
    get_user_by_id,
    update_user,
    get_all_admins,
    get_admin_by_id,
    update_admin,
    delete_admin,
    create_admin as create_admin_account,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


async def require_admin(current_user: Optional[dict] = Depends(get_current_user)) -> dict:
    """Require admin authentication for admin endpoints."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    role = current_user.get("role")
    if role not in ["admin", "superAdmin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


async def require_super_admin(current_user: Optional[dict] = Depends(get_current_user)) -> dict:
    """Require superAdmin authentication for superAdmin-only endpoints."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    if current_user.get("role") != "superAdmin":
        raise HTTPException(
            status_code=403,
            detail="SuperAdmin access required"
        )
    return current_user


@router.get("/submissions", response_model=list[SubmissionResponse])
async def list_all_submissions(
    form_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
) -> list[SubmissionResponse]:
    """
    List all submissions (Admin only).

    Falls back to JSON database if SQL database fails.

    Args:
        form_id: Filter by form ID
        status: Filter by status
        page: Page number
        page_size: Page size
        db: Database session

    Returns:
        List of submissions
    """
    # TODO: Add admin authentication check

    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - listing submissions from JSON database")
        await initialize_default_data()
        json_submissions = await json_get_submissions(form_id=form_id, user_id=None)
        
        # Apply status filter
        if status:
            json_submissions = [s for s in json_submissions if s.get("status") == status]
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_submissions = json_submissions[start:end]
        
        # Convert to SubmissionResponse format
        from datetime import datetime
        result_submissions = []
        for sub in paginated_submissions:
            try:
                submission_response = SubmissionResponse(
                    id=safe_uuid_convert(sub.get("id")),
                    form_id=sub.get("formId", ""),
                    submission_id=sub.get("submissionId", ""),
                    submitted_data=sub.get("submittedData", {}),
                    status=sub.get("status", "draft"),
                    submitted_by=sub.get("submittedBy"),
                    submitted_at=datetime.fromisoformat(sub.get("submittedAt", "").replace("Z", "+00:00")) if sub.get("submittedAt") else None,
                    created_at=datetime.fromisoformat(sub.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(sub.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
                )
                result_submissions.append(submission_response)
            except Exception as e:
                print(f"⚠️  Error converting submission {sub.get('submissionId')}: {e}")
                continue
        
        return result_submissions

    # Try SQL database first
    try:
        # Build query
        query = select(FormSubmission)

        # Apply filters
        if form_id:
            query = query.where(FormSubmission.form_id == form_id)
        if status:
            query = query.where(FormSubmission.status == status)

        # Execute query
        result = await db.execute(query)
        submissions = result.scalars().all()

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_submissions = submissions[start:end]

        return [SubmissionResponse.model_validate(sub) for sub in paginated_submissions]
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        json_submissions = await json_get_submissions(form_id=form_id, user_id=None)
        
        # Apply status filter
        if status:
            json_submissions = [s for s in json_submissions if s.get("status") == status]
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_submissions = json_submissions[start:end]
        
        # Convert to SubmissionResponse format
        from datetime import datetime
        result_submissions = []
        for sub in paginated_submissions:
            try:
                submission_response = SubmissionResponse(
                    id=safe_uuid_convert(sub.get("id")),
                    form_id=sub.get("formId", ""),
                    submission_id=sub.get("submissionId", ""),
                    submitted_data=sub.get("submittedData", {}),
                    status=sub.get("status", "draft"),
                    submitted_by=sub.get("submittedBy"),
                    submitted_at=datetime.fromisoformat(sub.get("submittedAt", "").replace("Z", "+00:00")) if sub.get("submittedAt") else None,
                    created_at=datetime.fromisoformat(sub.get("createdAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(sub.get("updatedAt", datetime.utcnow().isoformat() + "Z").replace("Z", "+00:00")),
                )
                result_submissions.append(submission_response)
            except Exception as e:
                print(f"⚠️  Error converting submission {sub.get('submissionId')}: {e}")
                continue
        
        return result_submissions


@router.put("/submissions/{submission_id}", response_model=SubmissionResponse)
async def review_submission(
    submission_id: str,
    update_data: SubmissionUpdate,
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
) -> SubmissionResponse:
    """
    Review a submission (Admin only).

    Falls back to JSON database if SQL database fails.

    Args:
        submission_id: Submission ID
        update_data: Update data (status, review_notes, requested_info)
        db: Database session

    Returns:
        Updated submission

    Raises:
        HTTPException: 404 if submission not found
    """
    # TODO: Add admin authentication check
    from datetime import datetime
    from uuid import UUID
    import uuid

    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - updating submission in JSON database")
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Check if submission is approved and prevent modification except for superAdmin
        current_status = json_submission.get("status", "draft")
        admin_role = admin_user.get("role", "admin")
        is_super_admin = admin_role == "superAdmin"
        
        if current_status == "approved" and not is_super_admin:
            raise HTTPException(
                status_code=403,
                detail="Cannot modify approved submissions. Only superAdmin can modify approved submissions."
            )
        
        # CRITICAL: Prevent approving/rejecting drafts - only submitted submissions can be reviewed
        if current_status == "draft" and update_data.status and update_data.status in ["approved", "rejected", "request_info"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot review submission with status 'draft'. Only submitted submissions can be reviewed. Please ensure the submission is submitted first."
            )
        
        # Update submission data
        if update_data.status is not None:
            json_submission["status"] = update_data.status
        if update_data.review_notes is not None:
            json_submission["reviewNotes"] = update_data.review_notes
        if update_data.requested_info is not None:
            json_submission["requestedInfo"] = update_data.requested_info
        
        # Get admin user ID from authentication
        admin_user_id = admin_user.get("userId") if admin_user else "admin"
        
        json_submission["reviewedAt"] = datetime.utcnow().isoformat() + "Z"
        json_submission["reviewedBy"] = admin_user_id
        json_submission["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        # Update in JSON database
        updated_submission = await json_update_submission(submission_id, json_submission)
        if not updated_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Convert to SubmissionResponse format - use actual field names, not serialization aliases
        created_at_str = updated_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
        updated_at_str = updated_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        submitted_at_str = updated_submission.get("submittedAt")
        reviewed_at_str = updated_submission.get("reviewedAt")
        
        return SubmissionResponse(
            id=safe_uuid_convert(updated_submission.get("id", submission_id)),
            form_id=updated_submission.get("formId", ""),
            submission_id=updated_submission.get("submissionId", submission_id),
            submitted_data=updated_submission.get("submittedData", {}),
            status=updated_submission.get("status", "draft"),
            submitted_by=updated_submission.get("submittedBy"),
            submitted_at=datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00")) if submitted_at_str else None,
            reviewed_by=updated_submission.get("reviewedBy"),
            reviewed_at=datetime.fromisoformat(reviewed_at_str.replace("Z", "+00:00")) if reviewed_at_str else None,
            review_notes=updated_submission.get("reviewNotes"),
            requested_info=updated_submission.get("requestedInfo"),
            created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
        )

    # Try SQL database first
    try:
        # Get submission
        result = await db.execute(
            select(FormSubmission).where(FormSubmission.submission_id == submission_id)
        )
        submission = result.scalar_one_or_none()

        if not submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

        # Check if submission is approved and prevent modification except for superAdmin
        admin_role = admin_user.get("role", "admin")
        is_super_admin = admin_role == "superAdmin"
        
        if submission.status == "approved" and not is_super_admin:
            raise HTTPException(
                status_code=403,
                detail="Cannot modify approved submissions. Only superAdmin can modify approved submissions."
            )

        # Update submission
        if update_data.status is not None:
            submission.status = update_data.status
        if update_data.review_notes is not None:
            submission.review_notes = update_data.review_notes
        if update_data.requested_info is not None:
            submission.requested_info = update_data.requested_info

        # Set reviewed_by and reviewed_at from authentication
        admin_user_id = admin_user.get("userId") if admin_user else "admin"
        submission.reviewed_at = datetime.utcnow()
        submission.reviewed_by = admin_user_id

        await db.commit()
        await db.refresh(submission)

        # TODO: Create audit log entry
        # TODO: Send notification email

        return SubmissionResponse.model_validate(submission)
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Check if submission is approved and prevent modification except for superAdmin
        current_status = json_submission.get("status", "draft")
        admin_role = admin_user.get("role", "admin")
        is_super_admin = admin_role == "superAdmin"
        
        if current_status == "approved" and not is_super_admin:
            raise HTTPException(
                status_code=403,
                detail="Cannot modify approved submissions. Only superAdmin can modify approved submissions."
            )
        
        # Update submission data
        if update_data.status is not None:
            json_submission["status"] = update_data.status
        if update_data.review_notes is not None:
            json_submission["reviewNotes"] = update_data.review_notes
        if update_data.requested_info is not None:
            json_submission["requestedInfo"] = update_data.requested_info
        
        # Get admin user ID from authentication
        admin_user_id = admin_user.get("userId") if admin_user else "admin"
        
        json_submission["reviewedAt"] = datetime.utcnow().isoformat() + "Z"
        json_submission["reviewedBy"] = admin_user_id
        json_submission["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        # Update in JSON database
        updated_submission = await json_update_submission(submission_id, json_submission)
        if not updated_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Convert to SubmissionResponse format - use actual field names, not serialization aliases
        created_at_str = updated_submission.get("createdAt", datetime.utcnow().isoformat() + "Z")
        updated_at_str = updated_submission.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        submitted_at_str = updated_submission.get("submittedAt")
        reviewed_at_str = updated_submission.get("reviewedAt")
        
        return SubmissionResponse(
            id=safe_uuid_convert(updated_submission.get("id", submission_id)),
            form_id=updated_submission.get("formId", ""),
            submission_id=updated_submission.get("submissionId", submission_id),
            submitted_data=updated_submission.get("submittedData", {}),
            status=updated_submission.get("status", "draft"),
            submitted_by=updated_submission.get("submittedBy"),
            submitted_at=datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00")) if submitted_at_str else None,
            reviewed_by=updated_submission.get("reviewedBy"),
            reviewed_at=datetime.fromisoformat(reviewed_at_str.replace("Z", "+00:00")) if reviewed_at_str else None,
            review_notes=updated_submission.get("reviewNotes"),
            requested_info=updated_submission.get("requestedInfo"),
            created_at=datetime.fromisoformat(created_at_str.replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(updated_at_str.replace("Z", "+00:00")),
        )


@router.get("/statistics")
async def get_statistics(
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Get admin dashboard statistics.

    Falls back to JSON database if SQL database fails.

    Args:
        db: Database session

    Returns:
        Statistics dictionary
    """
    # TODO: Add admin authentication check
    from datetime import datetime

    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - getting statistics from JSON database")
        await initialize_default_data()
        
        # Get all submissions and forms from JSON
        json_submissions = await json_get_submissions()
        json_forms = await json_get_forms()
        
        # Calculate statistics
        total_submissions = len(json_submissions)
        status_dict = {}
        for sub in json_submissions:
            status = sub.get("status", "draft")
            status_dict[status] = status_dict.get(status, 0) + 1
        
        # Get recent activity (last 10 submissions, sorted by created date)
        recent_submissions = sorted(
            json_submissions,
            key=lambda x: x.get("createdAt", ""),
            reverse=True
        )[:10]
        
        recent_activity = [
            {
                "id": sub.get("submissionId", ""),
                "type": "submission",
                "description": f"New submission {sub.get('submissionId', '')} for form {sub.get('formId', '')}",
                "timestamp": sub.get("submittedAt") or sub.get("createdAt", datetime.utcnow().isoformat() + "Z"),
            }
            for sub in recent_submissions
        ]
        
        return {
            "totalSubmissions": total_submissions,
            "pendingSubmissions": status_dict.get("under-review", 0) + status_dict.get("submitted", 0),
            "approvedSubmissions": status_dict.get("approved", 0),
            "rejectedSubmissions": status_dict.get("rejected", 0),
            "totalForms": len(json_forms),
            "recentActivity": recent_activity,
        }

    # Try SQL database first
    try:
        from sqlalchemy import func, case

        # Get total submissions
        total_result = await db.execute(select(func.count(FormSubmission.id)))
        total_submissions = total_result.scalar() or 0

        # Get submissions by status
        status_counts = await db.execute(
            select(
                FormSubmission.status,
                func.count(FormSubmission.id).label('count')
            ).group_by(FormSubmission.status)
        )
        status_dict = {row.status: row.count for row in status_counts}

        # Get recent activity (last 10 submissions)
        recent_result = await db.execute(
            select(FormSubmission)
            .order_by(FormSubmission.created_at.desc())
            .limit(10)
        )
        recent_submissions = recent_result.scalars().all()

        # Get total forms
        forms_result = await db.execute(select(func.count(Form.id)))
        total_forms = forms_result.scalar() or 0

        # Build recent activity
        recent_activity = [
            {
                "id": sub.submission_id,
                "type": "submission",
                "description": f"New submission {sub.submission_id} for form {sub.form_id}",
                "timestamp": sub.submitted_at.isoformat() if sub.submitted_at else sub.created_at.isoformat(),
            }
            for sub in recent_submissions
        ]

        return {
            "totalSubmissions": total_submissions,
            "pendingSubmissions": status_dict.get("under-review", 0),
            "approvedSubmissions": status_dict.get("approved", 0),
            "rejectedSubmissions": status_dict.get("rejected", 0),
            "totalForms": total_forms,
            "recentActivity": recent_activity,
        }
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Get all submissions and forms from JSON
        json_submissions = await json_get_submissions()
        json_forms = await json_get_forms()
        
        # Calculate statistics
        total_submissions = len(json_submissions)
        status_dict = {}
        for sub in json_submissions:
            status = sub.get("status", "draft")
            status_dict[status] = status_dict.get(status, 0) + 1
        
        # Get recent activity (last 10 submissions, sorted by created date)
        recent_submissions = sorted(
            json_submissions,
            key=lambda x: x.get("createdAt", ""),
            reverse=True
        )[:10]
        
        recent_activity = [
            {
                "id": sub.get("submissionId", ""),
                "type": "submission",
                "description": f"New submission {sub.get('submissionId', '')} for form {sub.get('formId', '')}",
                "timestamp": sub.get("submittedAt") or sub.get("createdAt", datetime.utcnow().isoformat() + "Z"),
            }
            for sub in recent_submissions
        ]
        
        return {
            "totalSubmissions": total_submissions,
            "pendingSubmissions": status_dict.get("under-review", 0) + status_dict.get("submitted", 0),
            "approvedSubmissions": status_dict.get("approved", 0),
            "rejectedSubmissions": status_dict.get("rejected", 0),
            "totalForms": len(json_forms),
            "recentActivity": recent_activity,
        }


@router.post("/seed-sample-form")
async def seed_sample_form_endpoint(
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Seed sample Labuan Company Management License form (Temporary endpoint).
    
    This endpoint creates the sample form in the production database.
    TODO: Add admin authentication check and remove after production setup.
    """
    # Import the schema creation function inline to avoid path issues
    def create_labuan_company_management_form_schema():
        """Create the Labuan Company Management License Application form schema."""
        import sys
        from pathlib import Path
        backend_dir = Path(__file__).parent.parent.parent.parent
        sys.path.insert(0, str(backend_dir / "scripts"))
        from seed_sample_form import create_labuan_company_management_form_schema as _create
        return _create()
    
    form_id = "labuan-company-management-license"
    schema_data = create_labuan_company_management_form_schema()
    from datetime import datetime
    import uuid
    
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - seeding form in JSON database")
        await initialize_default_data()
        
        # Check if form already exists in JSON
        existing_form = await json_get_form_by_id(form_id)
        
        form_data = {
            "formId": form_id,
            "name": schema_data["formName"],
            "description": "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
            "category": "Licensing",
            "version": schema_data["version"],
            "schemaData": schema_data,
            "isActive": True,
            "requiresAuth": True,
            "estimatedTime": "2-3 hours",
        }
        
        if existing_form:
            # Update existing form
            await json_update_form(form_id, form_data)
            return {"status": "success", "message": f"Form '{form_id}' updated", "formId": form_id}
        else:
            # Create new form
            await json_create_form(form_data)
            return {"status": "success", "message": f"Form '{form_id}' created", "formId": form_id}


@router.delete("/submissions/{submission_id}", status_code=204)
async def delete_submission(
    submission_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
):
    """
    Delete a submission (admin only).
    
    Only allows deletion of draft submissions for safety.
    
    Args:
        submission_id: Submission ID to delete
        db: Database session (optional, will use JSON fallback if None)
        admin_user: Admin user from authentication
    
    Returns:
        204 No Content on success
    
    Raises:
        HTTPException: 404 if submission not found, 400 if not a draft
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - deleting submission from JSON database")
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        current_status = json_submission.get("status", "draft")
        if current_status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{current_status}'. Only draft submissions can be deleted."
            )
        
        # Delete from JSON database
        deleted = await json_delete_submission(submission_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        return None
    
    # Try SQL database first
    try:
        result = await db.execute(
            select(FormSubmission).where(FormSubmission.submission_id == submission_id)
        )
        submission = result.scalar_one_or_none()
        
        if not submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        if submission.status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{submission.status}'. Only draft submissions can be deleted."
            )
        
        await db.delete(submission)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        current_status = json_submission.get("status", "draft")
        if current_status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{current_status}'. Only draft submissions can be deleted."
            )
        
        # Delete from JSON database
        deleted = await json_delete_submission(submission_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        return None
    
    # Try SQL database first
    try:
        # Check if form already exists
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        existing_form = result.scalar_one_or_none()
        
        if existing_form:
            existing_form.name = schema_data["formName"]
            existing_form.description = "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010"
            existing_form.category = "Licensing"
            existing_form.version = schema_data["version"]
            existing_form.schema_data = schema_data
            existing_form.is_active = True
            existing_form.requires_auth = True
            existing_form.estimated_time = "2-3 hours"
            await db.commit()
            return {"status": "success", "message": f"Form '{form_id}' updated", "formId": form_id}
        else:
            new_form = Form(
                form_id=form_id,
                name=schema_data["formName"],
                description="Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
                category="Licensing",
                version=schema_data["version"],
                schema_data=schema_data,
                is_active=True,
                requires_auth=True,
                estimated_time="2-3 hours",
            )
            db.add(new_form)
            await db.commit()
            await db.refresh(new_form)
            return {"status": "success", "message": f"Form '{form_id}' created", "formId": form_id}
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Check if form already exists in JSON
        existing_form = await json_get_form_by_id(form_id)
        
        form_data = {
            "formId": form_id,
            "name": schema_data["formName"],
            "description": "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
            "category": "Licensing",
            "version": schema_data["version"],
            "schemaData": schema_data,
            "isActive": True,
            "requiresAuth": True,
            "estimatedTime": "2-3 hours",
        }
        
        if existing_form:
            # Update existing form
            await json_update_form(form_id, form_data)
            return {"status": "success", "message": f"Form '{form_id}' updated", "formId": form_id}
        else:
            # Create new form
            await json_create_form(form_data)
            return {"status": "success", "message": f"Form '{form_id}' created", "formId": form_id}


@router.delete("/submissions/{submission_id}", status_code=204)
async def delete_submission(
    submission_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
):
    """
    Delete a submission (admin only).
    
    Only allows deletion of draft submissions for safety.
    
    Args:
        submission_id: Submission ID to delete
        db: Database session (optional, will use JSON fallback if None)
        admin_user: Admin user from authentication
    
    Returns:
        204 No Content on success
    
    Raises:
        HTTPException: 404 if submission not found, 400 if not a draft
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - deleting submission from JSON database")
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        current_status = json_submission.get("status", "draft")
        if current_status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{current_status}'. Only draft submissions can be deleted."
            )
        
        # Delete from JSON database
        deleted = await json_delete_submission(submission_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        return None
    
    # Try SQL database first
    try:
        result = await db.execute(
            select(FormSubmission).where(FormSubmission.submission_id == submission_id)
        )
        submission = result.scalar_one_or_none()
        
        if not submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        if submission.status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{submission.status}'. Only draft submissions can be deleted."
            )
        
        await db.delete(submission)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        # Get submission from JSON
        json_submission = await json_get_submission_by_id(submission_id)
        if not json_submission:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        # Only allow deletion of drafts for safety
        current_status = json_submission.get("status", "draft")
        if current_status != "draft":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete submission with status '{current_status}'. Only draft submissions can be deleted."
            )
        
        # Delete from JSON database
        deleted = await json_delete_submission(submission_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
        
        return None



# ============================================================
# User Management Endpoints
# ============================================================

@router.get("/users")
async def list_all_users(
    admin_user: dict = Depends(require_admin),
) -> list[dict]:
    """
    List all users (Admin only).
    
    Returns:
        List of users (without password hashes)
    """
    users = await get_all_users()
    return users


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Get user by ID (Admin only).
    
    Args:
        user_id: User ID
        
    Returns:
        User information
    """
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
    return user


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.put("/users/{user_id}")
async def update_user_info(
    user_id: str,
    request: UserUpdateRequest,
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Update user information (Admin only).
    
    Args:
        user_id: User ID
        request: User update data (name, email, is_active)
        
    Returns:
        Updated user information
    """
    try:
        user = await update_user(
            user_id,
            name=request.name,
            email=request.email,
            is_active=request.is_active,
            password=request.password
        )
        if not user:
            raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# Admin Management Endpoints
# ============================================================

class AdminCreateRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class AdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.get("/admins")
async def list_all_admins(
    admin_user: dict = Depends(require_admin),
) -> list[dict]:
    """
    List all admins (Admin only).
    
    Returns:
        List of admins (without password hashes)
    """
    admins = await get_all_admins()
    return admins


@router.get("/admins/{admin_id}")
async def get_admin(
    admin_id: str,
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Get admin by ID (Admin only).
    
    Args:
        admin_id: Admin ID
        
    Returns:
        Admin information
    """
    admin = await get_admin_by_id(admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail=f"Admin not found: {admin_id}")
    return admin


@router.post("/admins", status_code=201)
async def create_admin(
    request: AdminCreateRequest,
    admin_user: dict = Depends(require_super_admin),
) -> dict:
    """
    Create a new admin account (SuperAdmin only).
    
    Args:
        request: Admin creation data (email, password, name)
        
    Returns:
        Created admin information
    """
    try:
        admin = await create_admin_account(
            request.email,
            request.password,
            request.name
        )
        # Return admin without password hash
        return {
            "id": admin.get("id"),
            "email": admin.get("email"),
            "name": admin.get("name"),
            "role": admin.get("role", "admin"),
            "isActive": admin.get("isActive", True),
            "createdAt": admin.get("createdAt"),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/admins/{admin_id}")
async def update_admin_info(
    admin_id: str,
    request: AdminUpdateRequest,
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Update admin information (Admin only).
    
    Permissions:
    - superAdmin: Can edit all admins (name, email, is_active, password)
    - regular admin: Can only edit their own account (email, password)
    
    Args:
        admin_id: Admin ID
        request: Admin update data (name, email, is_active, password)
        
    Returns:
        Updated admin information
    """
    admin_role = admin_user.get("role", "admin")
    admin_user_id = admin_user.get("userId")
    is_super_admin = admin_role == "superAdmin"
    
    # Check permissions: non-superAdmin can only edit their own account
    if not is_super_admin and admin_id != admin_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own account. Only superAdmin can edit other admins."
        )
    
    # Non-superAdmin can only change email and password
    if not is_super_admin:
        if request.name is not None or request.is_active is not None:
            raise HTTPException(
                status_code=403,
                detail="You can only change email and password for your own account."
            )
    
    try:
        admin = await update_admin(
            admin_id,
            name=request.name if is_super_admin else None,
            email=request.email,
            is_active=request.is_active if is_super_admin else None,
            password=request.password
        )
        if not admin:
            raise HTTPException(status_code=404, detail=f"Admin not found: {admin_id}")
        return admin
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/admins/{admin_id}", status_code=204)
async def delete_admin_account(
    admin_id: str,
    admin_user: dict = Depends(require_super_admin),
):
    """
    Delete an admin account (SuperAdmin only).
    
    Args:
        admin_id: Admin ID
        
    Returns:
        None (204 No Content)
    """
    # Prevent deleting yourself
    if admin_user.get("userId") == admin_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own admin account"
        )
    
    deleted = await delete_admin(admin_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Admin not found: {admin_id}")
    return None


# ============================================================
# Settings Management Endpoints (Admin only)
# ============================================================

SETTINGS_PATH = Path(__file__).parent.parent.parent.parent / "data" / "settings.json"

def _load_settings() -> dict:
    """Load settings from JSON file."""
    if SETTINGS_PATH.exists():
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "siteName": "Labuan FSA E-Submission System",
        "siteUrl": "https://submission.labuanfsa.gov.my",
        "maintenanceMode": False,
        "allowRegistration": True,
        "requireEmailVerification": True,
        "maxFileSize": 10,
        "allowedFileTypes": [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
        "sessionTimeout": 30,
    }

@router.get("/roles", response_model=dict)
async def get_admin_roles():
    """
    Get admin roles configuration.
    
    Returns admin_roles.json content for role checking.
    """
    import json
    from pathlib import Path
    
    roles_path = Path(__file__).parent.parent.parent.parent / "data" / "admin_roles.json"
    
    if not roles_path.exists():
        return {
            "version": "1.0.0",
            "lastUpdated": datetime.now().isoformat(),
            "roles": []
        }
    
    try:
        with open(roles_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read admin roles: {str(e)}")

def _save_settings(settings: dict) -> None:
    """Save settings to JSON file."""
    settings["updatedAt"] = datetime.utcnow().isoformat() + "Z"
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2)

@router.get("/settings")
async def get_settings(
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Get system settings (Admin only).
    
    Returns:
        Current system settings
    """
    return _load_settings()

class SettingsUpdateRequest(BaseModel):
    siteName: Optional[str] = None
    siteUrl: Optional[str] = None
    maintenanceMode: Optional[bool] = None
    allowRegistration: Optional[bool] = None
    requireEmailVerification: Optional[bool] = None
    maxFileSize: Optional[int] = None
    allowedFileTypes: Optional[list[str]] = None
    sessionTimeout: Optional[int] = None

@router.put("/settings")
async def update_settings(
    request: SettingsUpdateRequest,
    admin_user: dict = Depends(require_admin),
) -> dict:
    """
    Update system settings (Admin only).
    
    Args:
        request: Settings update data
        
    Returns:
        Updated settings
    """
    settings = _load_settings()
    
    # Update only provided fields
    if request.siteName is not None:
        settings["siteName"] = request.siteName
    if request.siteUrl is not None:
        settings["siteUrl"] = request.siteUrl
    if request.maintenanceMode is not None:
        settings["maintenanceMode"] = request.maintenanceMode
    if request.allowRegistration is not None:
        settings["allowRegistration"] = request.allowRegistration
    if request.requireEmailVerification is not None:
        settings["requireEmailVerification"] = request.requireEmailVerification
    if request.maxFileSize is not None:
        settings["maxFileSize"] = request.maxFileSize
    if request.allowedFileTypes is not None:
        # Ensure extensions start with dot
        settings["allowedFileTypes"] = [
            ext if ext.startswith(".") else f".{ext}"
            for ext in request.allowedFileTypes
        ]
    if request.sessionTimeout is not None:
        settings["sessionTimeout"] = request.sessionTimeout
    
    _save_settings(settings)
    
    # Update runtime config if needed (import settings here to avoid circular import)
    from labuan_fsa.config import settings as app_settings
    if request.maxFileSize is not None:
        app_settings.storage.max_file_size = request.maxFileSize * 1024 * 1024
    if request.allowedFileTypes is not None:
        app_settings.storage.allowed_extensions = settings["allowedFileTypes"]
    
    return settings


# ============================================================
# Form Management Endpoints (Admin only)
# ============================================================

@router.delete("/forms/{form_id}", status_code=204)
async def delete_form(
    form_id: str,
    db: Optional[AsyncSession] = Depends(get_db),
    admin_user: dict = Depends(require_admin),
):
    """
    Delete a form (Admin only).
    
    Args:
        form_id: Form ID to delete
        db: Database session (optional, will use JSON fallback if None)
        admin_user: Admin user from authentication
        
    Returns:
        204 No Content on success
        
    Raises:
        HTTPException: 404 if form not found
    """
    # If no database connection, use JSON immediately
    if db is None:
        print("📄 No SQL database connection - deleting form from JSON database")
        await initialize_default_data()
        
        deleted = await json_delete_form(form_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        return None
    
    # Try SQL database first
    try:
        from sqlalchemy import delete
        result = await db.execute(select(Form).where(Form.form_id == form_id))
        form = result.scalar_one_or_none()
        
        if not form:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        
        await db.execute(delete(Form).where(Form.form_id == form_id))
        await db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️  SQL database error, using JSON fallback: {e}")
        
        # Fallback to JSON database
        await initialize_default_data()
        
        deleted = await json_delete_form(form_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Form not found: {form_id}")
        return None
