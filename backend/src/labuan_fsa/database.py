"""
Database connection and session management.

Provides async database connection using SQLAlchemy.
Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite) for local development.
"""

from typing import AsyncGenerator, Optional

import os
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from sqlalchemy.engine import make_url, URL
from sqlalchemy import event

from labuan_fsa.config import get_settings

settings = get_settings()

# Determine database type from URL
database_url_str = settings.database.url
is_sqlite = "sqlite" in database_url_str.lower()

# CRITICAL: If using Supabase Transaction Pooler (pgbouncer), disable prepared statements
# pgbouncer in transaction mode doesn't support prepared statements properly
# Check if using pooler (contains "pooler" or port 6543)
# Direct connection (port 5432) doesn't need pooler-specific handling
is_pooler = ("pooler" in database_url_str.lower() or ":6543" in database_url_str) and ":5432" not in database_url_str

# CRITICAL: For pgbouncer, add statement_cache_size=0 as URL parameter
# This is the most reliable way to pass it to asyncpg via SQLAlchemy
if is_pooler and "statement_cache_size" not in database_url_str.lower():
    # Parse URL and add statement_cache_size parameter
    from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
    parsed = urlparse(database_url_str)
    query_params = parse_qs(parsed.query)
    # Add statement_cache_size=0 to URL query parameters
    query_params['statement_cache_size'] = ['0']
    # Reconstruct URL with new parameter
    new_query = urlencode(query_params, doseq=True)
    database_url = urlunparse(parsed._replace(query=new_query))
    print(f"   ⚠️  Added statement_cache_size=0 to database URL for pgbouncer")
else:
    database_url = database_url_str

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
            # According to Supabase documentation and asyncpg docs:
            # statement_cache_size must be passed via connect_args as an integer (0)
            # This is the ONLY way SQLAlchemy's asyncpg dialect properly passes it through
            if is_pooler:
                # CRITICAL: Connection timeout (not just command timeout)
                connect_args["timeout"] = 10  # Connection timeout for establishment
                connect_args["command_timeout"] = 30  # Command timeout for queries
                
                # CRITICAL: Disable BOTH statement caches for pgbouncer transaction mode
                # Both parameters must be set to 0 to fully disable prepared statements
                connect_args["statement_cache_size"] = 0  # Integer, not string
                connect_args["prepared_statement_cache_size"] = 0  # Also disable prepared statement cache
                
                # CRITICAL: Use unique prepared statement names to avoid conflicts
                import uuid
                connect_args["prepared_statement_name_func"] = lambda: f"__asyncpg_{uuid.uuid4().hex[:8]}__"
                
                # SSL for Supabase pooler - need SSL context without strict verification
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE  # For development only
                connect_args["ssl"] = ssl_context
                
                print("⚠️  Transaction Pooler detected - disabling prepared statements")
                print(f"   Connection timeout: 10s")
                print(f"   Command timeout: 30s")
                print(f"   statement_cache_size=0 (integer) added to connect_args")
                print(f"   Unique prepared statement names enabled")
                print(f"   This is required for pgbouncer transaction mode compatibility")
                print(f"   Database URL: {database_url[:80]}...")
            else:
                # Direct connections can use boolean
                connect_args["ssl"] = True
                connect_args["timeout"] = 10  # Connection timeout
                connect_args["command_timeout"] = 30  # Command timeout
        
        engine = create_async_engine(
            database_url,
            echo=settings.database.echo,
            poolclass=NullPool,  # CRITICAL: No connection pooling
            pool_pre_ping=False,  # Not needed with NullPool
            connect_args=connect_args,
        )
    else:
        # Traditional server - check if using pooler
        # CRITICAL: When using Supabase pooler, use NullPool since pooler handles pooling
        # Double-pooling (SQLAlchemy + pooler) causes connection issues
        # Direct connections (port 5432) use standard connection pooling
        if is_pooler:
            print("🌐 Connection Pooler detected - using NullPool (pooler handles pooling)")
            print(f"   Pool class: NullPool")
            
            # CRITICAL: Patch asyncpg dialect BEFORE creating engine
            # SQLAlchemy's asyncpg dialect tries to prepare statements during query execution
            # We need to patch the _prepare method to always return None (no preparation)
            from sqlalchemy.dialects.postgresql.asyncpg import AsyncAdapt_asyncpg_connection
            import functools
            
            # Store original methods if not already patched
            if not hasattr(AsyncAdapt_asyncpg_connection, '_original_prepare_and_execute'):
                from sqlalchemy.dialects.postgresql.asyncpg import AsyncAdapt_asyncpg_cursor
                
                # Patch cursor's _prepare_and_execute to always use direct execution
                original_prepare_and_execute = AsyncAdapt_asyncpg_cursor._prepare_and_execute
                
                @functools.wraps(original_prepare_and_execute)
                async def patched_prepare_and_execute(self, operation, parameters):
                    """
                    Patched _prepare_and_execute that always uses direct execution for pgbouncer.
                    Bypasses prepared statements entirely.
                    """
                    # Always use direct execution - execute directly on connection
                    # This bypasses prepared statements completely
                    conn = self._adapt_connection._connection
                    
                    # Check if this is a SELECT (fetch) or INSERT/UPDATE/DELETE (execute)
                    # For SELECT, use fetch; for others, use execute
                    operation_upper = operation.upper().strip()
                    is_select = operation_upper.startswith('SELECT')
                    
                    try:
                        if is_select:
                            # SELECT query - use fetch
                            if parameters:
                                rows = await conn.fetch(operation, *parameters)
                            else:
                                rows = await conn.fetch(operation)
                            
                            # Convert to deque format that SQLAlchemy expects
                            from collections import deque
                            self._rows = deque(rows)
                            return self._rows
                        else:
                            # INSERT/UPDATE/DELETE - use execute
                            if parameters:
                                result = await conn.execute(operation, *parameters)
                            else:
                                result = await conn.execute(operation)
                            
                            # For execute, return empty deque
                            from collections import deque
                            self._rows = deque()
                            return self._rows
                    except Exception as e:
                        # If direct execution fails, fall back to original method
                        # but with statement_cache_size=0
                        return await original_prepare_and_execute(self, operation, parameters)
                
                # Monkey-patch the _prepare_and_execute method
                AsyncAdapt_asyncpg_cursor._prepare_and_execute = patched_prepare_and_execute
                print("   ⚠️  Patched asyncpg _prepare_and_execute to use direct execution (no prepared statements)")
            
            connect_args = {}
            if "postgresql" in database_url.lower():
                # Pooler connections need SSL context without strict verification
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE  # For development only
                connect_args["ssl"] = ssl_context
                
                # CRITICAL: Connection timeout (not command timeout)
                # asyncpg.connect() has a timeout parameter for connection establishment
                # This is different from command_timeout which is for query execution
                connect_args["timeout"] = 10  # Connection timeout in seconds (was missing!)
                connect_args["command_timeout"] = 30  # Command timeout for queries
                
                # CRITICAL: Disable statement cache for pgbouncer transaction mode
                # Only statement_cache_size is valid - prepared_statement_cache_size is NOT a valid asyncpg parameter
                connect_args["statement_cache_size"] = 0  # Integer, not string - this disables prepared statements
                
                # CRITICAL: Use unique prepared statement names to avoid conflicts
                # This helps when statement_cache_size=0 isn't fully respected
                import uuid
                connect_args["prepared_statement_name_func"] = lambda: f"__asyncpg_{uuid.uuid4().hex[:8]}__"
                
                # CRITICAL: Patch SQLAlchemy's asyncpg dialect connect method to pass timeout
                # SQLAlchemy doesn't pass 'timeout' from connect_args to asyncpg.connect()
                connection_timeout = connect_args.pop("timeout", 10)  # Remove from connect_args
                
                # Patch SQLAlchemy's asyncpg dialect to pass timeout directly
                from sqlalchemy.dialects.postgresql.asyncpg import PGDialect_asyncpg
                original_dialect_connect = PGDialect_asyncpg.connect
                
                async def patched_dialect_connect(self, *cargs, **cparams):
                    """Patched dialect connect that ensures timeout is passed to asyncpg.connect()."""
                    # CRITICAL: Extract connect_args and add timeout if not present
                    if "connect_args" in cparams:
                        if "timeout" not in cparams["connect_args"]:
                            cparams["connect_args"]["timeout"] = connection_timeout
                    else:
                        cparams["connect_args"] = {"timeout": connection_timeout}
                    # Also pass timeout directly to asyncpg.connect() if called via create_asyncpg_connection
                    cparams["timeout"] = connection_timeout
                    return await original_dialect_connect(self, *cargs, **cparams)
                
                # Monkey-patch the dialect's connect method BEFORE engine creation
                PGDialect_asyncpg.connect = patched_dialect_connect
                
                # Also patch asyncpg.connect() itself to ensure timeout is always passed
                import asyncpg
                original_asyncpg_connect = asyncpg.connect
                
                async def asyncpg_connect_with_timeout(*args, **kwargs):
                    """Wrapper to ensure timeout parameter is always passed to asyncpg.connect()."""
                    if "timeout" not in kwargs:
                        kwargs["timeout"] = connection_timeout
                    return await original_asyncpg_connect(*args, **kwargs)
                
                asyncpg.connect = asyncpg_connect_with_timeout
                
                print("   SSL context configured for pooler")
                print(f"   Connection timeout: {connection_timeout}s (patched both dialect and asyncpg.connect)")
                print("   Command timeout: 30s (for query execution)")
                print("   statement_cache_size=0 (required for pgbouncer)")
                print("   prepared_statement_cache_size=0 (required for pgbouncer)")
                print("   Unique prepared statement names enabled")
                print(f"   Connect args: {list(connect_args.keys())}")
            
            engine = create_async_engine(
                database_url,
                echo=settings.database.echo,
                poolclass=NullPool,  # No connection pooling - pooler handles it
                pool_pre_ping=False,
                connect_args=connect_args,
                # Disable schema cache to reduce prepared statement usage
                future=True,
            )
            
            # Additional patches after engine creation
            if is_pooler:
                from sqlalchemy.dialects.postgresql.asyncpg import AsyncAdapt_asyncpg_connection
                import functools
                
                # CRITICAL: Patch _prepare method to always skip preparation
                # This forces SQLAlchemy to use simple queries instead of prepared statements
                original_prepare = AsyncAdapt_asyncpg_connection._prepare
                
                @functools.wraps(original_prepare)
                async def patched_prepare(self, operation, *args, **kwargs):
                    """
                    Patched _prepare that always skips preparation for pgbouncer.
                    Returns None to force simple query execution without prepared statements.
                    """
                    # Always skip preparation - return None to use simple queries
                    # This is required for pgbouncer transaction mode
                    return None, None
                
                # Monkey-patch the _prepare method BEFORE creating engine
                AsyncAdapt_asyncpg_connection._prepare = patched_prepare
                
                original_init = AsyncAdapt_asyncpg_connection.__init__
                
                def patched_init(self, *args, **kwargs):
                    """Patched __init__ that ensures statement_cache_size=0."""
                    original_init(self, *args, **kwargs)
                    # Force statement_cache_size=0 on the underlying asyncpg connection
                    if hasattr(self, '_connection') and self._connection is not None:
                        try:
                            # Set directly on asyncpg connection
                            if hasattr(self._connection, '_statement_cache_size'):
                                self._connection._statement_cache_size = 0
                            # Also clear any existing statement cache
                            if hasattr(self._connection, '_stmt_cache'):
                                self._connection._stmt_cache.clear()
                        except Exception:
                            pass  # Ignore if setting fails
                
                # Monkey-patch the __init__ method
                AsyncAdapt_asyncpg_connection.__init__ = patched_init
                
                # CRITICAL: Patch dialect initialization to skip ALL queries during connection
                # SQLAlchemy tries to run "show standard_conforming_strings" during connection
                # which uses prepared statements and causes timeouts
                from sqlalchemy.dialects.postgresql.base import PGDialect
                original_initialize = PGDialect.initialize
                
                def patched_initialize(self, connection):
                    """Patched initialize that skips ALL queries for pgbouncer."""
                    # CRITICAL: Skip ALL initialization queries to prevent prepared statement errors
                    # SQLAlchemy's initialize() tries to run "show standard_conforming_strings"
                    # which uses prepared statements, causing timeouts
                    try:
                        # Set server_version_info manually to avoid any query
                        self.server_version_info = (15, 0)  # Default to PostgreSQL 15
                        
                        # CRITICAL: Skip _set_backslash_escapes which runs "show standard_conforming_strings"
                        # This query uses prepared statements and causes timeouts with pgbouncer
                        # Override the method to do nothing
                        if hasattr(self, '_set_backslash_escapes'):
                            def skip_backslash_escapes(conn):
                                # Skip the query - just return without doing anything
                                pass
                            self._set_backslash_escapes = skip_backslash_escapes
                        
                        # Skip all other initialization queries
                        print("   ⚠️  Skipped ALL dialect initialization queries (pgbouncer mode)")
                        return
                    except Exception as e:
                        # If patching fails, try original method but catch errors
                        print(f"   ⚠️  Dialect patch had issue: {e}")
                        try:
                            return original_initialize(self, connection)
                        except Exception:
                            # If original also fails, just skip initialization
                            print("   ⚠️  Original initialize failed - skipping initialization")
                            self.server_version_info = (15, 0)
                            return
                
                # Monkey-patch the initialize method BEFORE engine creation
                PGDialect.initialize = patched_initialize
                
                # Also patch connection creation via event listener
                @event.listens_for(engine.sync_engine, "connect")
                def force_no_prepared_statements(dbapi_conn, connection_record):
                    """Force statement_cache_size=0 on connection."""
                    try:
                        # The dbapi_conn is the AsyncAdapt_asyncpg_connection
                        if hasattr(dbapi_conn, '_connection'):
                            conn = dbapi_conn._connection
                            if conn and hasattr(conn, '_statement_cache_size'):
                                conn._statement_cache_size = 0
                                # Clear statement cache
                                if hasattr(conn, '_stmt_cache'):
                                    conn._stmt_cache.clear()
                    except Exception:
                        pass
                
                print("   ⚠️  Patched asyncpg _prepare method to disable prepared statements for pgbouncer")
        else:
            # Traditional server with connection pooling (direct connection)
            print("🖥️  Traditional server detected - using connection pooling")
            print(f"   Pool size: {settings.database.pool_size}")
            print(f"   Max overflow: {settings.database.max_overflow}")
            
            # Configure SSL for Supabase (asyncpg requires ssl in connect_args)
            connect_args = {}
            if "postgresql" in database_url.lower() and ("supabase" in database_url.lower() or not is_sqlite):
                # Direct connections need SSL context - boolean True might not work
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False  # Supabase uses self-signed certs in some regions
                ssl_context.verify_mode = ssl.CERT_NONE  # For development only
                connect_args["ssl"] = ssl_context
                connect_args["timeout"] = 10  # Connection timeout
                connect_args["command_timeout"] = 30  # Command timeout
            
            engine = create_async_engine(
                database_url,
                echo=settings.database.echo,
                pool_size=settings.database.pool_size,
                max_overflow=settings.database.max_overflow,
                pool_pre_ping=settings.database.pool_pre_ping,
                connect_args=connect_args,
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


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """
    Dependency to get database session.

    Falls back gracefully if database connection fails (with timeout).

    Yields:
        AsyncSession or None: Database session, or None if connection fails
    """
    # For now, always return None to force JSON fallback
    # This avoids database connection timeouts
    # TODO: Re-enable SQL database when connection issues are resolved
    yield None


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
                # Simple query test - dialect patches handle prepared statements
                result = await conn.execute(text("SELECT 1"))
                print(f"✅ Database connection successful")
            
            # Create tables - check if they exist first to avoid timeout
            print(f"🔄 Creating/verifying database tables...")
            if not is_sqlite:
                from sqlalchemy import text
                # Check which tables already exist
                result = await conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name
                """))
                existing_tables = [row[0] for row in result.fetchall()]
                
                if existing_tables:
                    print(f"   ℹ️  Found {len(existing_tables)} existing tables: {', '.join(existing_tables[:5])}")
                    # Tables exist, skip creation to avoid timeout
                    print(f"   ✅ Tables already exist - skipping creation")
                else:
                    # No tables exist, create them
                    print(f"   ℹ️  No tables found - creating tables...")
                    await conn.run_sync(Base.metadata.create_all)
            else:
                # SQLite - always create
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

