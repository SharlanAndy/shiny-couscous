#!/usr/bin/env python3
"""
Test PostgreSQL connection and table operations.

Usage:
    # Test direct asyncpg connection
    python scripts/test_db_connection.py

    # Test with DATABASE_URL environment variable
    DATABASE_URL="postgresql://user:pass@host:5432/db" python scripts/test_db_connection.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add src to path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

async def test_direct_connection(db_url: str):
    """Test direct asyncpg connection."""
    try:
        import asyncpg
        
        print("\n" + "="*60)
        print("🔍 TEST 1: Direct asyncpg Connection")
        print("="*60)
        print(f"   URL: {db_url[:50]}...")
        
        # Connect
        print("\n🔄 Connecting to database...")
        conn = await asyncpg.connect(db_url)
        print("✅ Connection successful!")
        
        # Test query
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Database version: {version.split(',')[0]}")
        
        # Check existing tables
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        print(f"\n📊 Existing tables:")
        if tables:
            for table in tables:
                print(f"   - {table['table_name']}")
        else:
            print("   (no tables found)")
        
        # Test CREATE TABLE
        print("\n🔄 Testing CREATE TABLE...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS test_connection_table (
                id SERIAL PRIMARY KEY,
                test_data TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        print("✅ Table created successfully!")
        
        # Test INSERT
        await conn.execute("""
            INSERT INTO test_connection_table (test_data) 
            VALUES ('Test connection successful')
            ON CONFLICT DO NOTHING
        """)
        print("✅ Data inserted successfully!")
        
        # Test SELECT
        count = await conn.fetchval("SELECT COUNT(*) FROM test_connection_table")
        print(f"✅ Table has {count} row(s)")
        
        # Test DROP TABLE
        print("\n🔄 Testing DROP TABLE...")
        await conn.execute("DROP TABLE IF EXISTS test_connection_table")
        print("✅ Table deleted successfully!")
        
        await conn.close()
        print("\n✅ Test 1 PASSED - Direct connection works!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test 1 FAILED: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False


async def test_sqlalchemy_connection(db_url: str):
    """Test SQLAlchemy connection."""
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine, NullPool
        
        print("\n" + "="*60)
        print("🔍 TEST 2: SQLAlchemy Connection (NullPool)")
        print("="*60)
        print(f"   URL: {db_url[:50]}...")
        
        # Create engine with NullPool (like serverless)
        engine = create_async_engine(
            db_url,
            poolclass=NullPool,
            echo=False,
        )
        print("✅ Engine created with NullPool")
        
        # Test connection
        async with engine.begin() as conn:
            # Test query
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Database version: {version.split(',')[0]}")
            
            # Check tables
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = result.fetchall()
            print(f"\n📊 Existing tables:")
            if tables:
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("   (no tables found)")
            
            # Test CREATE TABLE
            print("\n🔄 Testing CREATE TABLE...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS test_sqlalchemy_table (
                    id SERIAL PRIMARY KEY,
                    test_data TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            print("✅ Table created successfully!")
            
            # Test INSERT
            await conn.execute(text("""
                INSERT INTO test_sqlalchemy_table (test_data) 
                VALUES ('Test SQLAlchemy connection successful')
                ON CONFLICT DO NOTHING
            """))
            print("✅ Data inserted successfully!")
            
            # Test SELECT
            result = await conn.execute(text("SELECT COUNT(*) FROM test_sqlalchemy_table"))
            count = result.scalar()
            print(f"✅ Table has {count} row(s)")
            
            # Test DROP TABLE
            print("\n🔄 Testing DROP TABLE...")
            await conn.execute(text("DROP TABLE IF EXISTS test_sqlalchemy_table"))
            print("✅ Table deleted successfully!")
        
        await engine.dispose()
        print("\n✅ Test 2 PASSED - SQLAlchemy with NullPool works!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test 2 FAILED: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False


async def test_init_db():
    """Test project's init_db() function."""
    try:
        # Set DATABASE_URL environment variable
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("⚠️  DATABASE_URL not set, skipping init_db test")
            return None
        
        # Override database URL in settings
        os.environ["DATABASE_URL"] = db_url
        
        from labuan_fsa.database import init_db
        
        print("\n" + "="*60)
        print("🔍 TEST 3: Project init_db() Function")
        print("="*60)
        
        await init_db()
        print("\n✅ Test 3 PASSED - init_db() completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test 3 FAILED: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    # Get database URL
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL environment variable not set!")
        print("\nUsage:")
        print('  export DATABASE_URL="postgresql://user:pass@host:5432/db"')
        print("  python scripts/test_db_connection.py")
        sys.exit(1)
    
    # Ensure asyncpg driver
    if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    print("\n" + "="*60)
    print("🧪 DATABASE CONNECTION TEST SUITE")
    print("="*60)
    print(f"\nDatabase URL: {db_url[:50]}...")
    
    results = []
    
    # Test 1: Direct asyncpg
    result1 = await test_direct_connection(db_url)
    results.append(("Direct asyncpg", result1))
    
    # Test 2: SQLAlchemy with NullPool
    result2 = await test_sqlalchemy_connection(db_url)
    results.append(("SQLAlchemy NullPool", result2))
    
    # Test 3: Project init_db
    result3 = await test_init_db()
    if result3 is not None:
        results.append(("init_db()", result3))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    all_passed = all(r for _, r in results if r is not None)
    if all_passed:
        print("\n✅ All tests passed! Database connection is working.")
        return 0
    else:
        print("\n❌ Some tests failed. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

