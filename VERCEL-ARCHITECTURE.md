# Vercel Architecture Explanation

## ✅ Yes, Vercel is the API Service

**Current Setup:**
- **Vercel** = Backend API Service (FastAPI backend)
- **GitHub Pages** = Frontend (React frontend)

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   GitHub Pages  │────────▶│   Vercel API     │────────▶│    Supabase     │
│   (Frontend)    │  HTTP   │   (Backend)      │  SQL    │   (Database)    │
│   React App     │         │   FastAPI        │         │   PostgreSQL    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
   https://clkhoo5211        https://shiny-couscous       postgres://...
   .github.io/               -tau.vercel.app/
```

## File Structure

```
project-root/
├── api/
│   ├── index.py              ← Vercel entry point
│   └── requirements.txt      ← Python dependencies
├── backend/
│   ├── src/
│   │   └── labuan_fsa/       ← FastAPI application code
│   │       ├── main.py       ← FastAPI app
│   │       ├── models/       ← Database models
│   │       ├── api/          ← API routes
│   │       └── ...
│   └── requirements.txt      ← (Not used by Vercel)
├── frontend/
│   └── src/                  ← React frontend
│       └── ...
└── vercel.json               ← Vercel configuration
```

## How It Works

### 1. Vercel Serverless Function
- **Entry Point**: `api/index.py`
- **Dependencies**: Installed from `api/requirements.txt`
- **Backend Code**: Accessed from `backend/src/labuan_fsa/`
- **Handler**: Mangum adapter wraps FastAPI app

### 2. Request Flow
1. User visits frontend (GitHub Pages)
2. Frontend makes API call to Vercel
3. Vercel routes request to `api/index.py`
4. `api/index.py` imports FastAPI app from `backend/src/labuan_fsa/main.py`
5. FastAPI handles request and queries Supabase database
6. Response sent back to frontend

### 3. Database Connection
- **Connection String**: Set via `DATABASE_URL` environment variable in Vercel
- **Auto-Creation**: Tables are automatically created on first startup via `init_db()`
- **Location**: Supabase PostgreSQL database

## Current Issue

The Vercel deployment is returning 500 errors. Possible causes:
1. **Dependencies not installing**: Fixed by adding `api/requirements.txt`
2. **Backend code not accessible**: Fixed by adding `functions.includeFiles`
3. **Path resolution issues**: Debug logging added to `api/index.py`
4. **Environment variables missing**: Need to set in Vercel dashboard
5. **Database connection failing**: Need `DATABASE_URL` environment variable

## Next Steps

1. **Check Vercel Logs**: Look for debug output from `api/index.py`
2. **Set Environment Variables**: In Vercel Dashboard → Settings → Environment Variables
3. **Verify Deployment**: Check if deployment completed successfully
4. **Test Endpoints**: Try `/health` endpoint once working

## Environment Variables Needed

Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=[generate random secret key]
ENVIRONMENT=production
CORS_ORIGINS=https://clkhoo5211.github.io
```

Generate SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

