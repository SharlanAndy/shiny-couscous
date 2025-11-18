# Supabase Database Setup Guide

Complete guide for setting up and using Supabase PostgreSQL database with your FastAPI backend.

## 🎯 Why Supabase?

- ✅ **Free tier**: 500MB database, 2GB bandwidth
- ✅ **Managed PostgreSQL**: No server management
- ✅ **Connection pooling**: Perfect for serverless
- ✅ **Easy setup**: Web dashboard
- ✅ **Free forever**: Generous free tier

## 📋 Prerequisites

- Supabase account: https://supabase.com
- Backend deployed (Vercel/Render)

## 🚀 Setup Steps

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (or login)
3. Click **New Project**
4. Fill in:
   - **Name**: `labuan-fsa-db`
   - **Database Password**: (generate and save securely!)
   - **Region**: Choose closest to you (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Free
5. Click **Create new project**

Wait 2-3 minutes for project to be created.

### Step 2: Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string

**Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important**: Use the **Connection Pooling** URL (port 6543) for serverless functions (Vercel). Use direct connection (port 5432) for long-running processes (Render).

### Step 3: Run Database Migrations

#### Option A: Via Local Machine (Recommended)

```bash
cd backend

# Set database URL
export DATABASE_URL="<Supabase connection string>"

# Install dependencies
uv sync

# Run migrations
uv run alembic upgrade head

# Seed mock users
uv run python scripts/seed_mock_users.py
```

#### Option B: Via Supabase SQL Editor

1. Go to Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Copy SQL from your Alembic migration files
4. Run the SQL

### Step 4: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see tables:
   - `forms`
   - `form_submissions`
   - `file_uploads`
   - `users`
   - `audit_logs`
   - `form_versions`
   - `alembic_version`

### Step 5: Configure Backend

Set `DATABASE_URL` environment variable in your backend deployment:

**Vercel:**
- Settings → Environment Variables → Add `DATABASE_URL`

**Render:**
- Environment → Add `DATABASE_URL`

**Value**: Your Supabase connection string

## 🔐 Connection String Types

### Connection Pooling (Recommended for Serverless)

**Use for**: Vercel, serverless functions
**Port**: 6543
**Format**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### Direct Connection

**Use for**: Render, long-running processes
**Port**: 5432
**Format**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

## 📊 Supabase Free Tier

- ✅ **Database Size**: 500MB
- ✅ **Bandwidth**: 2GB/month
- ✅ **API Requests**: Unlimited
- ✅ **Database Connections**: 60 direct, unlimited pooled
- ✅ **Backups**: Daily (7 days retention)

## 🔧 Database Management

### View Data

1. Go to **Table Editor** in Supabase dashboard
2. Select table to view/edit data
3. Use filters and search

### Run SQL Queries

1. Go to **SQL Editor**
2. Write and run SQL queries
3. Save queries for reuse

### Database Settings

1. Go to **Settings** → **Database**
2. Configure:
   - Connection pooling
   - Extensions
   - Backups
   - Connection limits

## 🐛 Troubleshooting

### Connection Errors

**Error**: "Connection refused"
- Verify connection string is correct
- Check database password
- Ensure you're using correct port (6543 for pooling, 5432 for direct)

**Error**: "Too many connections"
- Use connection pooling URL (port 6543)
- Check connection limits in Supabase dashboard

### Migration Errors

**Error**: "Table already exists"
- Check if migrations already ran
- Use `alembic current` to check current version
- Use `alembic downgrade` if needed

**Error**: "Permission denied"
- Verify connection string has correct credentials
- Check database user permissions

## 🔒 Security Best Practices

1. **Never commit connection strings** to Git
2. **Use environment variables** for all secrets
3. **Rotate passwords** regularly
4. **Use connection pooling** for serverless
5. **Enable Row Level Security** in Supabase (if needed)

## 📈 Monitoring

Supabase dashboard provides:
- Database size usage
- Bandwidth usage
- Query performance
- Connection metrics
- Error logs

## 🎉 Next Steps

1. ✅ Database created in Supabase
2. ✅ Migrations run
3. ✅ Connection string configured in backend
4. ✅ Backend connected to database
5. ✅ Ready to use!

---

**Your database is now set up on Supabase!** 🎉

