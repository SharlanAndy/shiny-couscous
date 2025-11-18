"""
Database-aware type definitions.

Provides types that automatically adapt to the database backend:
- JSON/JSONB for SQLite vs PostgreSQL
- UUID for SQLite vs PostgreSQL
"""

from uuid import UUID

from sqlalchemy import JSON, String, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID

from labuan_fsa.config import get_settings

settings = get_settings()

# Determine database type from URL
database_url = settings.database.url
is_sqlite = "sqlite" in database_url.lower()


# JSON type that adapts to database backend
if is_sqlite:
    # SQLite only supports JSON (not JSONB)
    JSONType = JSON
else:
    # PostgreSQL supports JSONB (preferred for indexing)
    JSONType = JSONB


# UUID type that adapts to database backend
if is_sqlite:
    # SQLite doesn't support native UUID, use TypeDecorator
    class UUIDType(TypeDecorator):  # type: ignore
        """UUID type for SQLite compatibility."""

        impl = String
        cache_ok = True

        def load_dialect_impl(self, dialect):
            return dialect.type_descriptor(String(36))

        def process_bind_param(self, value, dialect):
            if value is None:
                return value
            elif isinstance(value, UUID):
                return str(value)
            else:
                return str(UUID(value))

        def process_result_value(self, value, dialect):
            if value is None:
                return value
            else:
                return UUID(value)
else:
    # PostgreSQL has native UUID support
    UUIDType = PGUUID

