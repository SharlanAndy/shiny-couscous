"""
Database connection and session management.

Provides async database connection using SQLAlchemy.
Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite) for local development.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from labuan_fsa.config import get_settings

settings = get_settings()

# Determine database type from URL
database_url = settings.database.url
is_sqlite = "sqlite" in database_url.lower()

# Create async engine
# SQLite requires NullPool and different connection parameters
if is_sqlite:
    # Ensure SQLite URL uses aiosqlite driver for async
    if database_url.startswith("sqlite:///"):
        # Convert sqlite:/// to sqlite+aiosqlite:///
        sqlite_url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///")
    elif database_url.startswith("sqlite+aiosqlite:///"):
        # Already in correct format
        sqlite_url = database_url
    else:
        # Fallback: try to ensure aiosqlite driver
        sqlite_url = database_url.replace("sqlite://", "sqlite+aiosqlite://")
    
    engine = create_async_engine(
        sqlite_url,
        echo=settings.database.echo,
        poolclass=NullPool,  # SQLite doesn't support connection pooling
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL or other databases
    engine = create_async_engine(
        database_url,
        echo=settings.database.echo,
        pool_size=settings.database.pool_size,
        max_overflow=settings.database.max_overflow,
        pool_pre_ping=settings.database.pool_pre_ping,
    )

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database (create all tables)."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        # Re-raise to be handled by caller
        raise ConnectionError(f"Database connection failed: {e}") from e


async def close_db() -> None:
    """Close database connection."""
    await engine.dispose()

