# Supabase Backend Setup for Local Development

## Overview

This guide explains how to configure the backend to use Supabase PostgreSQL instead of local SQLite for development.

## Configuration

### Option 1: Using .env.local (Recommended)

The backend automatically loads `.env.local` if it exists in the `backend/` directory.

1. **Create `.env.local` in `backend/` directory:**

```bash
cd backend
cat > .env.local << 'EOF'
# Supabase Database Configuration for Local Development
# Direct Connection (port 5432) - Recommended for local development
# Get connection string from Supabase Dashboard → Database → Connection string → Direct connection

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres

# Alternative: Connection Pooler (port 6543) - Use if direct connection has issues
# DATABASE_URL=postgresql://postgres.mwvyldzcutztjenscbyr:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Environment
ENVIRONMENT=development
APP_ENVIRONMENT=development

# API Configuration
API_URL=http://localhost:8000
EOF
```

2. **Replace `[YOUR-PASSWORD]` with your actual Supabase database password:**

   - Go to Supabase Dashboard → Project Settings → Database
   - Copy your database password
   - Or reset it if you don't remember it

3. **Get Direct Connection String:**

   - Go to Supabase Dashboard → Database → "Connect to your project"
   - Select Method: "Direct connection" (port 5432)
   - Copy the connection string
   - It should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Note:** Remove the `.` after `postgres` if present - use `postgres:` not `postgres.`

### Option 2: Using config.local.toml

Update `backend/config.local.toml`:

```toml
[database]
# Supabase PostgreSQL connection
url = "postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres"
echo = false
```

**Note:** Environment variables (`DATABASE_URL` from `.env.local`) take precedence over `config.local.toml`.

## Priority Order

The backend loads configuration in this priority order (highest to lowest):

1. **Environment variables** (`DATABASE_URL` from `.env.local` or system environment)
2. **config.local.toml** (local development config)
3. **config.toml** (if exists)
4. **Default values**

## Verification

### Test Connection

1. **Start the backend:**
   ```bash
   cd backend
   uv run uvicorn labuan_fsa.main:app --reload
   ```

2. **Check startup logs:**
   - You should see: `✅ Loaded environment variables from: .env.local`
   - You should see: `✅ Database URL set from environment: postgresql+asyncpg://...`
   - You should see: `✅ Database initialized successfully`

3. **Test API endpoint:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

4. **Check database tables:**
   - Go to Supabase Dashboard → Table Editor
   - You should see tables created automatically (forms, submissions, users, etc.)

### Troubleshooting

#### Connection Failed

1. **Check password:**
   - Verify you replaced `[YOUR-PASSWORD]` with actual password
   - Check if password has special characters that need URL encoding

2. **Check connection string format:**
   - Must start with `postgresql://` or `postgresql+asyncpg://`
   - Must include: `postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Important:** Use `postgres:` not `postgres.` (no dot after postgres)

3. **Test connection manually:**
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres" -c "SELECT version();"
   ```

#### Tables Not Created

1. **Check init_db() ran:**
   - Look for `✅ Database initialized successfully` in logs
   - Check Supabase Dashboard → Table Editor

2. **Manually initialize:**
   ```bash
   cd backend
   uv run python -c "from labuan_fsa.database import init_db; import asyncio; asyncio.run(init_db())"
   ```

#### Still Using SQLite

1. **Check environment variables:**
   ```bash
   cd backend
   python3 -c "import os; from dotenv import load_dotenv; load_dotenv('.env.local'); print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
   ```

2. **Verify .env.local is in backend/ directory:**
   - Should be: `backend/.env.local`
   - Not: `backend/.env` or `backend/env.local`

3. **Restart backend:**
   - Stop the server (Ctrl+C)
   - Start again: `uv run uvicorn labuan_fsa.main:app --reload`

## Migration from SQLite to Supabase

If you have existing data in SQLite:

1. **Export data from SQLite:**
   ```bash
   sqlite3 labuan_fsa.db .dump > backup.sql
   ```

2. **Connect to Supabase:**
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres" < backup.sql
   ```

3. **Or use Supabase Dashboard:**
   - Go to Table Editor
   - Manually import data via SQL Editor

## Direct Connection vs Connection Pooler

### Direct Connection (Port 5432) - Recommended for Local Dev

- **Pros:**
  - Supports prepared statements (no `statement_cache_size=0` needed)
  - Works out of the box with asyncpg
  - Better for development/testing

- **Cons:**
  - No connection pooling at DB level (but SQLAlchemy handles this)
  - May hit connection limits under high load

- **Connection String:**
  ```
  postgresql://postgres:[PASSWORD]@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres
  ```

### Connection Pooler (Port 6543) - For Production

- **Pros:**
  - Better connection pooling for serverless
  - Designed for high traffic

- **Cons:**
  - Doesn't support prepared statements (requires `statement_cache_size=0`)
  - Currently having issues with SQLAlchemy's asyncpg dialect

- **Connection String:**
  ```
  postgresql://postgres.mwvyldzcutztjenscbyr:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```

**Recommendation:** Use Direct Connection (port 5432) for local development.

## Next Steps

1. ✅ Create `.env.local` with Supabase connection string
2. ✅ Replace `[YOUR-PASSWORD]` with actual password
3. ✅ Start backend and verify connection
4. ✅ Check Supabase Dashboard to see tables created
5. ✅ Test API endpoints

## References

- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Direct Connection](https://supabase.com/docs/guides/database/connecting-to-postgres#direct-connection)
- [Supabase Connection Pooler](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

