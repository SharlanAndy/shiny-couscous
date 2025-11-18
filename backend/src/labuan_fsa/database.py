"""
Database connection and session management.

Provides async database connection using SQLAlchemy.
Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite) for local development.
"""

from typing import AsyncGenerator

import os
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

# CRITICAL: If using Supabase Transaction Pooler (pgbouncer), disable prepared statements
# pgbouncer in transaction mode doesn't support prepared statements properly
# Check if using pooler (contains "pooler" or port 6543)
is_pooler = "pooler" in database_url.lower() or ":6543" in database_url

# Detect serverless environment (Vercel, AWS Lambda, etc.)
# Vercel sets VERCEL=1 or VERCEL_ENV or VERCEL_URL
# AWS Lambda sets AWS_LAMBDA_FUNCTION_NAME
# Also check production environment
vercel_env = os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("VERCEL_URL")
is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("APP_ENVIRONMENT") == "production"
is_serverless = (
    vercel_env is not None or 
    os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None or
    is_production  # Force serverless config in production (Vercel/Render)
)

# CRITICAL: In production/Vercel, ALWAYS use NullPool
# Connection pooling doesn't work in serverless functions
if is_production and not is_serverless:
    is_serverless = True
    print("⚠️  Production environment detected - forcing NullPool (serverless config)")

# Log detection for debugging
if is_serverless:
    print(f"🌐 Serverless environment detected:")
    print(f"   VERCEL={os.getenv('VERCEL')}")
    print(f"   VERCEL_ENV={os.getenv('VERCEL_ENV')}")
    print(f"   VERCEL_URL={os.getenv('VERCEL_URL')}")
    print(f"   ENVIRONMENT={os.getenv('ENVIRONMENT')}")
    print(f"   APP_ENVIRONMENT={os.getenv('APP_ENVIRONMENT')}")
    print(f"   Production={is_production}")

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
    # CRITICAL: Use NullPool for serverless environments (Vercel, Lambda, Production)
    # Connection pooling doesn't work in stateless serverless functions
    # and causes "Errno 99: Cannot assign requested address" errors
    if is_serverless:
        print("🌐 Serverless/Production environment - using NullPool for database connections")
        print(f"   Pool class: NullPool")
        print(f"   This prevents 'Errno 99' errors in serverless functions")
        
        # Use NullPool - no connection pooling in serverless
        # For asyncpg, connect_args should be minimal - timeout handled differently
        connect_args = {}
        if "postgresql" in database_url.lower():
            # asyncpg connection parameters
            connect_args = {
                "server_settings": {
                    "application_name": "labuan_fsa_serverless"
                },
                "command_timeout": 10,  # Command timeout in seconds
            }
            # CRITICAL: Disable prepared statements for pgbouncer (Transaction Pooler)
            # This must be passed as an integer, not a string
            if is_pooler:
                connect_args["statement_cache_size"] = 0
                print("⚠️  Transaction Pooler detected - disabling prepared statements (statement_cache_size=0)")
        
        engine = create_async_engine(
            database_url,
            echo=settings.database.echo,
            poolclass=NullPool,  # CRITICAL: No connection pooling
            pool_pre_ping=False,  # Not needed with NullPool
            connect_args=connect_args,
        )
    else:
        # Traditional server with connection pooling
        print("🖥️  Traditional server detected - using connection pooling")
        print(f"   Pool size: {settings.database.pool_size}")
        print(f"   Max overflow: {settings.database.max_overflow}")
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
    """
    Initialize database (create all tables).
    
    Note: All models must be imported before calling this function
    so that SQLAlchemy can register them with Base.metadata.
    """
    # Import all models to register them with Base.metadata
    # This ensures create_all() will create tables for all models
    # Using models.__init__ to import all models at once
    import labuan_fsa.models  # This imports all models via __init__.py
    
    print(f"🔧 Initializing database...")
    print(f"   Database URL: {database_url[:50]}..." if len(database_url) > 50 else f"   Database URL: {database_url}")
    print(f"   Is SQLite: {is_sqlite}")
    print(f"   Is Serverless: {is_serverless}")
    print(f"   Engine: {type(engine)}")
    print(f"   Pool class: {engine.pool.__class__.__name__ if hasattr(engine, 'pool') else 'N/A'}")
    
    try:
        # Test connection first
        print(f"🔄 Testing database connection...")
        async with engine.begin() as conn:
            # Test basic query (PostgreSQL only)
            if not is_sqlite:
                from sqlalchemy import text
                result = await conn.execute(text("SELECT 1"))
                print(f"✅ Database connection successful")
            
            # Create tables
            print(f"🔄 Creating/verifying database tables...")
            await conn.run_sync(Base.metadata.create_all)
            
        print(f"✅ Database tables created/verified successfully")
        print(f"   Tables in metadata: {list(Base.metadata.tables.keys())}")
    except Exception as e:
        # Always log full error details
        import traceback
        error_msg = f"❌ Database initialization error: {e}"
        print(error_msg)
        print(f"   Error type: {type(e).__name__}")
        print(f"   Full traceback:")
        for line in traceback.format_exc().split('\n'):
            print(f"   {line}")
        
        # Re-raise to be handled by caller
        raise ConnectionError(f"Database connection failed: {e}") from e


async def close_db() -> None:
    """Close database connection."""
    await engine.dispose()

