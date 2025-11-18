"""
Payments API endpoints.

Handles payment processing for form submissions.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import get_db
from labuan_fsa.models.submission import FormSubmission
from labuan_fsa.models.payment import Payment as PaymentModel
from labuan_fsa.schemas.payment import (
    PaymentCreateRequest,
    PaymentCreateResponse,
    PaymentResponse,
    PaymentUpdateRequest,
    PaymentStatus,
)

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/submissions/{submission_id}/create", response_model=PaymentCreateResponse, status_code=201)
async def create_payment(
    submission_id: str,
    request: PaymentCreateRequest,
    db: AsyncSession = Depends(get_db),
) -> PaymentCreateResponse:
    """
    Create payment for a submission.

    Args:
        submission_id: Submission identifier
        request: Payment creation request
        db: Database session

    Returns:
        Payment creation response with payment details and payment gateway URL

    Raises:
        HTTPException: 404 if submission not found, 400 if payment already exists
    """
    # Get submission
    result = await db.execute(
        select(FormSubmission).where(FormSubmission.submission_id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

    # Check if payment already exists
    result = await db.execute(
        select(PaymentModel).where(PaymentModel.submission_id == submission.id)
    )
    existing_payment = result.scalar_one_or_none()

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail=f"Payment already exists for submission {submission_id}. Payment ID: {existing_payment.id}"
        )

    # Create payment record
    payment = PaymentModel(
        submission_id=submission.id,
        amount=request.amount,
        currency=request.currency,
        payment_method=request.payment_method,
        description=request.description or f"Payment for submission {submission_id}",
        status=PaymentStatus.PENDING,
        payment_gateway=request.payment_gateway or "stripe",  # Default to Stripe
        payment_metadata=request.payment_metadata or {},
    )

    # Update submission status to pending-payment
    submission.status = "pending-payment"
    submission.updated_at = datetime.now()

    db.add(payment)
    db.add(submission)
    await db.commit()
    await db.refresh(payment)
    await db.refresh(submission)

    # TODO: Initialize payment with payment gateway (Stripe, PayPal, etc.)
    # For now, return a mock payment URL
    payment_url = f"/payments/{payment.id}/process"

    return PaymentCreateResponse(
        payment_id=str(payment.id),
        submission_id=submission_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_url=payment_url,
        expires_at=payment.expires_at,
    )


@router.get("/submissions/{submission_id}", response_model=PaymentResponse)
async def get_payment_by_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    """
    Get payment for a submission.

    Args:
        submission_id: Submission identifier
        db: Database session

    Returns:
        Payment response

    Raises:
        HTTPException: 404 if submission or payment not found
    """
    # Get submission
    result = await db.execute(
        select(FormSubmission).where(FormSubmission.submission_id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

    # Get payment
    result = await db.execute(
        select(PaymentModel).where(PaymentModel.submission_id == submission.id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(
            status_code=404, detail=f"Payment not found for submission {submission_id}"
        )

    return PaymentResponse.model_validate(payment)


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    """
    Get payment by ID.

    Args:
        payment_id: Payment identifier
        db: Database session

    Returns:
        Payment response

    Raises:
        HTTPException: 404 if payment not found
    """
    result = await db.execute(select(PaymentModel).where(PaymentModel.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")

    return PaymentResponse.model_validate(payment)


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: UUID,
    request: PaymentUpdateRequest,
    db: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    """
    Update payment status (typically called by payment gateway webhook).

    Args:
        payment_id: Payment identifier
        request: Payment update request
        db: Database session

    Returns:
        Updated payment response

    Raises:
        HTTPException: 404 if payment not found
    """
    result = await db.execute(select(PaymentModel).where(PaymentModel.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")

    # Update payment fields
    if request.status:
        payment.status = request.status
        if request.status == PaymentStatus.COMPLETED:
            payment.paid_at = datetime.now()
            # Update submission status to pending-payment -> under-review
            if payment.submission.status == "pending-payment":
                payment.submission.status = "under-review"
        elif request.status == PaymentStatus.FAILED:
            payment.failed_at = datetime.now()
            payment.failure_reason = request.failure_reason

    if request.transaction_id:
        payment.transaction_id = request.transaction_id

    if request.payment_metadata:
        payment.payment_metadata = {**payment.payment_metadata, **request.payment_metadata}

    payment.updated_at = datetime.now()

    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/process", response_model=PaymentCreateResponse)
async def process_payment(
    payment_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> PaymentCreateResponse:
    """
    Process payment (initiate payment gateway transaction).

    Args:
        payment_id: Payment identifier
        db: Database session

    Returns:
        Payment response with payment gateway URL

    Raises:
        HTTPException: 404 if payment not found, 400 if payment already processed
    """
    result = await db.execute(select(PaymentModel).where(PaymentModel.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")

    if payment.status == PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Payment already completed")

    # TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
    # For now, return mock payment URL
    payment_url = f"/payments/{payment.id}/complete"

    return PaymentCreateResponse(
        payment_id=str(payment.id),
        submission_id=payment.submission.submission_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_url=payment_url,
        expires_at=payment.expires_at,
    )

