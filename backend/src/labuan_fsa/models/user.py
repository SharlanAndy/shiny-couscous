"""
User model.

Defines User model for authentication (optional feature).
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, String, func
from labuan_fsa.config import get_settings
from labuan_fsa.models.types import UUIDType

settings = get_settings()
is_sqlite = "sqlite" in settings.database.url.lower()
from sqlalchemy.orm import Mapped, mapped_column

from labuan_fsa.database import Base


class User(Base):
    """User account model (optional for authentication)."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    role: Mapped[str] = mapped_column(
        String(50), default="user", nullable=False
    )  # user, admin, reviewer
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    verification_expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

