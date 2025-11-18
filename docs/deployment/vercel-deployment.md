# Deploy FastAPI Backend to Vercel

Complete guide for deploying FastAPI backend to Vercel serverless functions.

## 🎯 Why Vercel?

- ✅ **Free tier**: 100GB bandwidth, 100GB-hours serverless execution
- ✅ **Fast**: Global CDN, edge network
- ✅ **Easy**: Automatic deployments from GitHub
- ✅ **Serverless**: Pay only for what you use
- ✅ **Perfect for**: FastAPI, Python serverless functions

## 📋 Prerequisites

- Vercel account: https://vercel.com
- GitHub repository connected
- Supabase account (for database - recommended)

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Vercel

The `backend/vercel.json` file is already configured. It tells Vercel to:
- Use Python runtime
- Route all requests to `src/labuan_fsa/main.py`
- Use Python 3.11

### Step 4: Deploy to Vercel

```bash
cd backend
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time)
- Project name: `labuan-fsa-backend` (or your choice)
- Directory: `./` (current directory)
- Override settings? **No**

### Step 5: Connect to GitHub (Auto-Deploy)

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Git**
4. Connect your GitHub repository
5. Configure:
   - **Repository**: `clkhoo5211/shiny-couscous`
   - **Root Directory**: `backend`
   - **Production Branch**: `main`
6. Save

Now Vercel will automatically deploy on every push to `main` branch!

### Step 6: Set Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add the following:

```
DATABASE_URL=<Supabase connection string>
SECRET_KEY=<Generate random secret key>
ENVIRONMENT=production
CORS_ORIGINS=https://clkhoo5211.github.io
PYTHON_VERSION=3.11
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 7: Redeploy with Environment Variables

After setting environment variables, trigger a redeploy:

```bash
vercel --prod
```

Or in Vercel dashboard: **Deployments** → **Redeploy**

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. **New Project**
3. Configure:
   - **Name**: `labuan-fsa-db`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Plan**: Free

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string
4. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

**Important**: Use the **Connection Pooling** URL (port 6543) for better performance with serverless functions.

### Step 3: Run Database Migrations

```bash
# From your local machine
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

**Alternative: Use Supabase SQL Editor**
1. Go to Supabase dashboard → **SQL Editor**
2. Copy SQL from `backend/alembic/versions/*.py` files
3. Run in SQL Editor

## 🔧 Vercel Configuration

The `backend/vercel.json` file handles:
- Python runtime selection
- Request routing
- Environment variables

**File**: `backend/vercel.json`
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

## 📝 Requirements.txt

Vercel uses `requirements.txt` for dependencies. The file is already created at `backend/requirements.txt` with all necessary packages.

## 🌐 Access Your Backend

Once deployed, your backend will be available at:
- **Production**: `https://labuan-fsa-backend.vercel.app`
- **API Docs**: `https://labuan-fsa-backend.vercel.app/docs`
- **Health Check**: `https://labuan-fsa-backend.vercel.app/health`

## 🔄 Auto-Deployment

After connecting to GitHub:
- Every push to `main` branch → Auto-deploy to production
- Pull requests → Preview deployments
- Check deployments in Vercel dashboard

## 🐛 Troubleshooting

### Build Fails

**Error**: "Module not found"
- Ensure all dependencies are in `requirements.txt`
- Check Vercel build logs

**Error**: "Python version mismatch"
- Verify `PYTHON_VERSION=3.11` in environment variables
- Check `vercel.json` configuration

### Runtime Errors

**Error**: "Database connection failed"
- Verify `DATABASE_URL` is set correctly
- Use Supabase connection pooling URL (port 6543)
- Check Supabase database is running

**Error**: "CORS errors"
- Verify `CORS_ORIGINS` includes `https://clkhoo5211.github.io`
- Check backend logs in Vercel dashboard

### Function Timeout

Vercel free tier has timeout limits:
- Hobby plan: 10 seconds (serverless functions)
- Pro plan: 60 seconds

If you hit timeouts:
- Optimize database queries
- Use connection pooling (Supabase)
- Consider upgrading to Pro plan

## 📊 Vercel Free Tier Limits

- ✅ **Bandwidth**: 100GB/month
- ✅ **Serverless Function Execution**: 100GB-hours/month
- ✅ **Function Invocations**: 1M/month
- ✅ **Build Minutes**: 6,000/month
- ⚠️ **Function Timeout**: 10 seconds (Hobby plan)

## 🔗 Update GitHub Secret

After deployment, update GitHub secret:

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Update `VITE_API_URL` with your Vercel URL:
   - Example: `https://labuan-fsa-backend.vercel.app`

## ✅ Verification

1. **Health Check**: `https://your-app.vercel.app/health`
   - Should return: `{"status": "healthy"}`

2. **API Docs**: `https://your-app.vercel.app/docs`
   - Should show FastAPI Swagger UI

3. **Test Endpoint**: `https://your-app.vercel.app/api/forms`
   - Should return forms list (or empty array)

## 🎉 Next Steps

1. ✅ Backend deployed to Vercel
2. ✅ Database connected (Supabase)
3. ✅ Environment variables set
4. ✅ GitHub secret updated
5. ✅ Frontend will connect automatically

---

**Your backend is now live on Vercel!** 🚀

