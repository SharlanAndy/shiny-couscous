# 🚀 Quick Start Deployment Guide

Fastest way to deploy Labuan FSA E-Submission System to GitHub Pages.

## 📋 Prerequisites Checklist

- [ ] GitHub repository: https://github.com/clkhoo5211/shiny-couscous
- [ ] `uv` installed (for backend)
- [ ] Node.js 18+ installed (for frontend)
- [ ] Supabase account (for database - free)
- [ ] Vercel or Render account (for backend - free)

## ⚡ 5-Minute Setup

### Step 1: Push Code to GitHub (2 minutes)

```bash
cd projects/project-20251117-153458-labuan-fsa-e-submission-system

# Initialize and push
git init
git remote add origin https://github.com/clkhoo5211/shiny-couscous.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Step 2: Setup Database (Supabase - 2 minutes)

1. Go to https://supabase.com
2. Sign up and create new project
3. Go to **Settings** → **Database**
4. Copy **Connection string** (URI format)
5. Save for next step

### Step 3: Deploy Backend (3 minutes)

#### Option A: Vercel (Recommended - Fast Serverless)

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy:
   ```bash
   cd backend
   vercel --prod
   ```
4. Connect GitHub repo in Vercel dashboard
5. Set environment variables:
   - `DATABASE_URL` (from Supabase)
   - `SECRET_KEY` (generate random string)
   - `ENVIRONMENT=production`
   - `CORS_ORIGINS=https://clkhoo5211.github.io`
6. **Copy your service URL** (e.g., `https://labuan-fsa-backend.vercel.app`)

#### Option B: Render (Easiest Setup)

1. Go to https://render.com
2. **New** → **Web Service**
3. Connect repo: `clkhoo5211/shiny-couscous`
4. Configure:
   - **Name**: `labuan-fsa-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `uv sync`
   - **Start Command**: `uv run uvicorn labuan_fsa.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Set environment variables:
   - `DATABASE_URL` (from Supabase)
   - `SECRET_KEY` (generate random string)
   - `ENVIRONMENT=production`
   - `CORS_ORIGINS=https://clkhoo5211.github.io`
6. Click **Create Web Service**
7. **Copy your service URL** (e.g., `https://labuan-fsa-backend.onrender.com`)

### Step 3: Configure GitHub (1 minute)

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/pages
2. **Source**: Select **GitHub Actions**
3. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
4. **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 2

### Step 4: Deploy Frontend (Automatic)

Just push to main branch:

```bash
git add .
git commit -m "Deploy frontend"
git push origin main
```

GitHub Actions will automatically:
- ✅ Build frontend
- ✅ Deploy to GitHub Pages
- ✅ Make available at https://clkhoo5211.github.io/shiny-couscous/

### Step 5: Run Database Migrations

Connect to Supabase database and run migrations:

```bash
# Option 1: Via local machine (recommended)
cd backend
export DATABASE_URL="<Supabase connection string>"
uv sync
uv run alembic upgrade head
uv run python scripts/seed_mock_users.py

# Option 2: Via Supabase SQL Editor
# Copy SQL from alembic migrations and run in Supabase SQL Editor

# Option 3: Via Render Shell (if using Render)
# Use Render Shell and run the commands above
```

## ✅ Verification

1. **Frontend**: https://clkhoo5211.github.io/shiny-couscous/
2. **Backend Health**: `https://your-backend-url/health`
3. **API Docs**: `https://your-backend-url/docs`

## 🐛 Troubleshooting

**Frontend not loading?**
- Check GitHub Actions logs
- Verify `VITE_API_URL` secret is set

**Backend not working?**
- Check platform logs (Vercel/Render dashboard)
- Verify `DATABASE_URL` is set (Supabase connection string)
- Run database migrations
- For Vercel: Check function logs in dashboard

**CORS errors?**
- Verify backend CORS allows `https://clkhoo5211.github.io`
- Check backend logs

## 📚 Next Steps

- [Full Deployment Guide](../DEPLOYMENT.md)
- [Detailed Backend Deployment](./backend-deployment.md)
- [GitHub Pages Setup](./github-pages-deployment.md)

---

**That's it!** Your app should now be live. 🎉

