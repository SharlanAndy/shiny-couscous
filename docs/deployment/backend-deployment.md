# Backend Deployment Guide

This guide covers deploying the FastAPI backend to free hosting platforms.

## 🎯 Recommended Free Platforms

### 1. **Supabase** (Recommended - Best for Full-Stack)
- ✅ **Free tier**: PostgreSQL database + Edge Functions
- ✅ **Database included**: Managed PostgreSQL
- ✅ **Easy setup**: One platform for backend + database
- ✅ **Generous limits**: 500MB database, 2GB bandwidth
- ✅ **Edge Functions**: Deploy FastAPI as serverless functions

### 2. **Vercel** (Recommended - Serverless Functions)
- ✅ **Free tier**: 100GB bandwidth, 100GB-hours serverless execution
- ✅ **Fast deployment**: Automatic from GitHub
- ✅ **Global CDN**: Fast worldwide
- ✅ **Serverless functions**: Perfect for FastAPI
- ⚠️ **Database**: Need external (Supabase, Neon, etc.)

### 3. **Render** (Easy Setup)
- ✅ **Free tier**: Web services + PostgreSQL
- ✅ **Simple deployment**: Connect GitHub repo
- ⚠️ **Sleeps after 15min**: Free tier limitation

## 🚀 Option 1: Deploy to Supabase (Recommended)

Supabase provides both database and backend hosting in one platform.

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create a new project

### Step 2: Get Database Connection
1. In Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Deploy Backend to Supabase Edge Functions

Supabase Edge Functions run Deno, but we can use Supabase's REST API or deploy backend separately.

**Alternative: Use Supabase for Database + Deploy Backend to Vercel/Render**

This is the recommended approach:
- **Database**: Supabase (free PostgreSQL)
- **Backend**: Vercel or Render (FastAPI)

### Step 4: Configure Environment Variables

In your backend deployment (Vercel/Render), set:
```
DATABASE_URL=<Supabase connection string>
SECRET_KEY=<Generate random secret key>
ENVIRONMENT=production
CORS_ORIGINS=https://clkhoo5211.github.io
```

## 🚀 Option 2: Deploy to Vercel (Recommended for Serverless)

Vercel is excellent for serverless FastAPI deployment.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Create vercel.json
Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/labuan_fsa/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/labuan_fsa/main.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  }
}
```

### Step 3: Create requirements.txt for Vercel
Create `backend/requirements.txt`:
```txt
fastapi>=0.104.1
uvicorn[standard]>=0.24.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
sqlalchemy>=2.0.23
asyncpg>=0.29.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
aiofiles>=23.2.1
```

### Step 4: Deploy to Vercel
```bash
cd backend
vercel login
vercel --prod
```

### Step 5: Set Environment Variables
In Vercel dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - `DATABASE_URL`: Your Supabase database URL
   - `SECRET_KEY`: Random secret key
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `https://clkhoo5211.github.io`

### Step 6: Connect to GitHub (Auto-Deploy)
1. In Vercel dashboard, go to **Settings** → **Git**
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Vercel will auto-deploy on every push

**Result**: `https://your-app.vercel.app`

## 🚀 Option 3: Deploy to Render (Easiest)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Web Service
1. Click **New** → **Web Service**
2. Connect repository: `clkhoo5211/shiny-couscous`
3. Configure:
   - **Name**: `labuan-fsa-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `uv sync`
   - **Start Command**: `uv run uvicorn labuan_fsa.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 3: Add PostgreSQL Database (or use Supabase)
**Option A: Render PostgreSQL**
1. Click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `labuan-fsa-db`
   - **Plan**: Free
3. Copy the **Internal Database URL**

**Option B: Use Supabase Database (Recommended)**
- Use Supabase for database (better free tier)
- Set `DATABASE_URL` to Supabase connection string

### Step 4: Configure Environment Variables
In Render dashboard, add environment variables:

```
DATABASE_URL=<Supabase or Render PostgreSQL URL>
SECRET_KEY=<Generate a random secret key>
ENVIRONMENT=production
CORS_ORIGINS=https://clkhoo5211.github.io
```

### Step 5: Deploy
1. Click **Create Web Service**
2. Render will build and deploy automatically
3. Copy your service URL (e.g., `https://labuan-fsa-backend.onrender.com`)

### Step 6: Run Database Migrations
1. Go to Render Shell
2. Run:
```bash
cd backend
uv sync
uv run alembic upgrade head
uv run python scripts/seed_mock_users.py
```

## 🗄️ Database Setup with Supabase (Recommended)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. **New Project**
3. Choose organization and set:
   - **Name**: `labuan-fsa-db`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Plan**: Free

### Step 2: Get Connection String
1. Go to **Settings** → **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string
4. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### Step 3: Run Migrations
You can use Supabase SQL Editor or connect from your local machine:

```bash
# Install psql if needed
# macOS: brew install postgresql

# Connect to Supabase
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Or use Alembic from your backend
cd backend
export DATABASE_URL="<Supabase connection string>"
uv sync
uv run alembic upgrade head
uv run python scripts/seed_mock_users.py
```

### Step 4: Use in Backend
Set `DATABASE_URL` environment variable in your backend deployment (Vercel/Render) to the Supabase connection string.

## 🔐 Environment Variables Required

Regardless of platform, ensure these are set:

```bash
# Database (Supabase recommended)
DATABASE_URL=<PostgreSQL connection string>

# Security
SECRET_KEY=<Random secret key for JWT>

# Environment
ENVIRONMENT=production

# CORS
CORS_ORIGINS=https://clkhoo5211.github.io

# Server (may be auto-set by platform)
PORT=8080  # Or 8000, depends on platform
```

## 🌐 CORS Configuration

Backend CORS is already configured to allow GitHub Pages domain. If you need additional origins, set `CORS_ORIGINS` environment variable (comma-separated).

## 🔗 Update GitHub Secret

Once backend is deployed:

1. Go to GitHub repo: https://github.com/clkhoo5211/shiny-couscous
2. Settings → Secrets and variables → Actions
3. Update `VITE_API_URL` with your backend URL:
   - Vercel: `https://your-app.vercel.app`
   - Render: `https://your-app.onrender.com`
   - Supabase: (if using Supabase Edge Functions)

## 📝 Testing Deployment

1. Visit backend URL: `https://your-backend-url/health`
2. Should return: `{"status": "healthy"}`
3. Visit API docs: `https://your-backend-url/docs`

## 🐛 Troubleshooting

### Backend Not Starting
- Check logs in platform dashboard
- Verify `PORT` environment variable matches platform requirements
- Ensure all dependencies are in `requirements.txt` (Vercel) or `pyproject.toml` (Render)

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly
- Check database is running (Supabase/Render dashboard)
- Ensure migrations have run
- For Supabase: Use connection pooling URL (port 6543) for better performance

### CORS Errors
- Verify backend CORS allows `https://clkhoo5211.github.io`
- Check `CORS_ORIGINS` environment variable
- Check backend logs

## 💰 Free Tier Comparison

### Supabase
- ✅ **Database**: 500MB PostgreSQL
- ✅ **Bandwidth**: 2GB/month
- ✅ **Edge Functions**: 500K invocations/month
- ✅ **Best for**: Database + Backend in one platform

### Vercel
- ✅ **Bandwidth**: 100GB/month
- ✅ **Serverless Functions**: 100GB-hours/month
- ✅ **Invocations**: 1M/month
- ✅ **Best for**: Fast serverless deployment

### Render
- ✅ **Web Service**: Free (sleeps after 15min)
- ✅ **PostgreSQL**: Free (90 days, then $7/month)
- ⚠️ **Limitation**: Free tier sleeps when inactive
- ✅ **Best for**: Simple deployment

## 🎯 Recommended Setup

**Best Free Setup:**
- **Database**: Supabase (free PostgreSQL)
- **Backend**: Vercel (fast serverless) or Render (simple)
- **Frontend**: GitHub Pages (already set up)

This gives you:
- ✅ Free database (Supabase)
- ✅ Free backend hosting (Vercel/Render)
- ✅ Free frontend hosting (GitHub Pages)
- ✅ Total cost: **$0/month**

---

**Ready to deploy?** Choose Supabase + Vercel for the best free tier experience!
