"""
Payment schemas.

Defines Pydantic schemas for payment-related data.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PaymentStatus(str, Enum):
    """Payment status enumeration."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentCreateRequest(BaseModel):
    """Schema for creating a payment."""

    amount: Decimal = Field(..., description="Payment amount", gt=0)
    currency: str = Field(default="USD", description="Payment currency (ISO 4217 code)")
    payment_method: str = Field(..., description="Payment method (e.g., 'credit_card', 'bank_transfer')")
    payment_gateway: Optional[str] = Field(
        default="stripe", description="Payment gateway (e.g., 'stripe', 'paypal')"
    )
    description: Optional[str] = Field(None, description="Payment description")
    payment_metadata: Optional[dict] = Field(None, description="Additional payment metadata", serialization_alias="metadata")


class PaymentCreateResponse(BaseModel):
    """Schema for payment creation response."""

    payment_id: str = Field(..., description="Payment identifier")
    submission_id: str = Field(..., description="Submission identifier")
    amount: Decimal = Field(..., description="Payment amount")
    currency: str = Field(..., description="Payment currency")
    status: str = Field(..., description="Payment status")
    payment_url: str = Field(..., description="URL to process payment")
    expires_at: Optional[datetime] = Field(None, description="Payment expiration date")


class PaymentUpdateRequest(BaseModel):
    """Schema for updating payment status."""

    status: Optional[PaymentStatus] = Field(None, description="Payment status")
    transaction_id: Optional[str] = Field(None, description="Payment gateway transaction ID")
    failure_reason: Optional[str] = Field(None, description="Failure reason if payment failed")
    payment_metadata: Optional[dict] = Field(None, description="Additional payment metadata", serialization_alias="metadata")


class PaymentResponse(BaseModel):
    """Schema for payment response."""

    id: UUID = Field(..., serialization_alias="paymentId")
    submission_id: str = Field(..., serialization_alias="submissionId")
    amount: Decimal
    currency: str
    payment_method: str = Field(..., serialization_alias="paymentMethod")
    payment_gateway: str = Field(..., serialization_alias="paymentGateway")
    status: str
    description: Optional[str] = None
    transaction_id: Optional[str] = Field(None, serialization_alias="transactionId")
    failure_reason: Optional[str] = Field(None, serialization_alias="failureReason")
    payment_metadata: dict = Field(default_factory=dict, serialization_alias="metadata")
    expires_at: Optional[datetime] = Field(None, serialization_alias="expiresAt")
    paid_at: Optional[datetime] = Field(None, serialization_alias="paidAt")
    failed_at: Optional[datetime] = Field(None, serialization_alias="failedAt")
    created_at: datetime = Field(..., serialization_alias="createdAt")
    updated_at: datetime = Field(..., serialization_alias="updatedAt")

    class Config:
        populate_by_name = True

