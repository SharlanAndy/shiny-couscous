"""
Audit log model.

Defines AuditLog model for system audit trail and compliance.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from labuan_fsa.config import get_settings
from labuan_fsa.database import Base
from labuan_fsa.models.types import JSONType, UUIDType

settings = get_settings()
is_sqlite = "sqlite" in settings.database.url.lower()


class AuditLog(Base):
    """Audit log model for system audit trail."""

    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(
        UUIDType(as_uuid=True) if not is_sqlite else UUIDType(),  # type: ignore
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid() if not is_sqlite else None,  # type: ignore
    )
    action_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # create, update, delete, review, approve, reject, login, logout
    entity_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # form, submission, user, file
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    user_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    changes: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    request_method: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    request_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    request_body: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    response_status: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False, index=True
    )

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action='{self.action_type}', entity='{self.entity_type}')>"

