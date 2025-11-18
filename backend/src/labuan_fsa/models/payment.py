"""
Payment models.

Defines Payment model for storing payment information.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String, Text, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from labuan_fsa.config import get_settings
from labuan_fsa.database import Base
from labuan_fsa.models.types import JSONType, UUIDType

settings = get_settings()
is_sqlite = "sqlite" in settings.database.url.lower()


class Payment(Base):
    """Payment model."""

    __tablename__ = "payments"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    submission_id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        ForeignKey("form_submissions.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
        index=True,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_gateway: Mapped[str] = mapped_column(String(50), nullable=False, default="stripe")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_metadata: Mapped[dict] = mapped_column(JSONType, nullable=False, default=dict)  # Renamed from 'metadata' (reserved in SQLAlchemy)
    expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    failed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    submission: Mapped["FormSubmission"] = relationship(
        "FormSubmission", back_populates="payment", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, submission_id={self.submission_id}, amount={self.amount} {self.currency}, status={self.status})>"

