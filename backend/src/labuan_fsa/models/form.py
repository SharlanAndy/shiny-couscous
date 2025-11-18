"""
Form models.

Defines Form and FormVersion models for storing form definitions.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from labuan_fsa.config import get_settings
from labuan_fsa.database import Base
from labuan_fsa.models.types import JSONType, UUIDType

settings = get_settings()
is_sqlite = "sqlite" in settings.database.url.lower()


class Form(Base):
    """Form definition model."""

    __tablename__ = "forms"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    form_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0.0")
    schema_data: Mapped[dict] = mapped_column(JSONType, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    requires_auth: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    estimated_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    submissions: Mapped[list["FormSubmission"]] = relationship(
        "FormSubmission",
        back_populates="form",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    versions: Mapped[list["FormVersion"]] = relationship(
        "FormVersion",
        back_populates="form",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Form(id={self.id}, form_id='{self.form_id}', name='{self.name}')>"


class FormVersion(Base):
    """Form version history model."""

    __tablename__ = "form_versions"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    form_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("forms.form_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    schema_data: Mapped[dict] = mapped_column(JSONType, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    change_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    form: Mapped["Form"] = relationship("Form", back_populates="versions", lazy="selectin")

    def __repr__(self) -> str:
        return f"<FormVersion(id={self.id}, form_id='{self.form_id}', version='{self.version}')>"

