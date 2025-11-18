"""
Submission models.

Defines FormSubmission and FileUpload models for storing submissions and file metadata.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from labuan_fsa.config import get_settings
from labuan_fsa.database import Base
from labuan_fsa.models.types import JSONType, UUIDType

settings = get_settings()
is_sqlite = "sqlite" in settings.database.url.lower()


class FormSubmission(Base):
    """Form submission model."""

    __tablename__ = "form_submissions"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    form_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("forms.form_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    submission_id: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    submitted_data: Mapped[dict] = mapped_column(JSONType, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="draft",
        index=True,
    )
    submitted_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(nullable=True, index=True)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requested_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
    form: Mapped["Form"] = relationship("Form", back_populates="submissions", lazy="selectin")
    file_uploads: Mapped[list["FileUpload"]] = relationship(
        "FileUpload",
        back_populates="submission",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    payment: Mapped[Optional["Payment"]] = relationship(
        "Payment",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<FormSubmission(id={self.id}, submission_id='{self.submission_id}', status='{self.status}')>"


class FileUpload(Base):
    """File upload metadata model."""

    __tablename__ = "file_uploads"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    submission_id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        ForeignKey("form_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    storage_location: Mapped[str] = mapped_column(
        String(50), default="local", nullable=False
    )
    storage_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    uploaded_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    submission: Mapped["FormSubmission"] = relationship(
        "FormSubmission", back_populates="file_uploads", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<FileUpload(id={self.id}, file_name='{self.file_name}', field_name='{self.field_name}')>"

