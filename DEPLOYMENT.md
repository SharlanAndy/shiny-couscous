# 🚀 Deployment Guide - Labuan FSA E-Submission System

Complete deployment guide for deploying to GitHub Pages (frontend) and cloud platforms (backend).

## 📋 Quick Start

### Frontend → GitHub Pages
1. Push code to GitHub
2. Enable GitHub Pages in repository settings
3. Set `VITE_API_URL` secret with your backend URL
4. GitHub Actions automatically deploys

### Backend → Cloud Platform
Choose one (all free tier available):
- **Supabase** (Recommended - Database + Backend): https://supabase.com
- **Vercel** (Recommended - Fast Serverless): https://vercel.com
- **Render** (Easiest Setup): https://render.com

## 📚 Detailed Guides

- [GitHub Pages Frontend Deployment](./docs/deployment/github-pages-deployment.md)
- [Backend Deployment (Vercel/Render/Supabase)](./docs/deployment/backend-deployment.md)
- [Vercel Deployment Guide](./docs/deployment/vercel-deployment.md)
- [Supabase Database Setup](./docs/deployment/supabase-database.md)

## 🔗 Repository Setup

### 1. Connect Local Repository to GitHub

```bash
cd projects/project-20251117-153458-labuan-fsa-e-submission-system

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/clkhoo5211/shiny-couscous.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Labuan FSA E-Submission System"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Repository Structure

Your repository should have:
```
shiny-couscous/
├── frontend/          # React frontend (deployed to GitHub Pages)
├── backend/           # FastAPI backend (deployed to cloud)
├── .github/
│   └── workflows/     # GitHub Actions workflows
├── docs/
│   └── deployment/    # Deployment documentation
└── README.md
```

## 🎯 Deployment Steps Summary

### Frontend (GitHub Pages)
✅ **Status**: Automated via GitHub Actions

1. **Enable GitHub Pages**
   - Repo → Settings → Pages → Source: GitHub Actions

2. **Set Secret**
   - Repo → Settings → Secrets → `VITE_API_URL` = your backend URL

3. **Push to main branch**
   - Workflow automatically builds and deploys

**Result**: https://clkhoo5211.github.io/shiny-couscous/

### Backend (Cloud Platform)

#### Option A: Render (Recommended for Beginners)

1. Sign up at https://render.com
2. New Web Service → Connect GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build: `uv sync`
   - Start: `uv run uvicorn labuan_fsa.main:app --host 0.0.0.0 --port $PORT`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy!

**Result**: `https://your-app.onrender.com`

#### Option B: Vercel (Recommended for Serverless)

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `cd backend && vercel --prod`
4. Connect GitHub for auto-deploy
5. Set environment variables in Vercel dashboard

**Result**: `https://your-app.vercel.app`

#### Option C: Supabase Database + Any Backend (Recommended)

1. Sign up at https://supabase.com
2. Create new project
3. Get database connection string (Settings → Database)
4. Deploy backend to Vercel/Render
5. Use Supabase database (free PostgreSQL - 500MB)

**Result**: Free database + your choice of backend hosting

## 🔐 Required Secrets & Environment Variables

### GitHub Secrets (Frontend)
- `VITE_API_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)

### Backend Environment Variables
```bash
DATABASE_URL=<PostgreSQL connection string>
SECRET_KEY=<Random secret key>
ENVIRONMENT=production
PORT=8080  # Or as required by platform
```

## 🧪 Testing Deployment

1. **Frontend**: https://clkhoo5211.github.io/shiny-couscous/
2. **Backend Health**: `https://your-backend-url/health`
3. **API Docs**: `https://your-backend-url/docs`

## 🔄 CI/CD Workflow

### Frontend
- **Trigger**: Push to `main` branch
- **Action**: Build → Deploy to GitHub Pages
- **Workflow**: `.github/workflows/deploy-frontend.yml`

### Backend (Optional)
- **Trigger**: Push to `main` branch with `backend/**` changes
- **Action**: Deploy to Vercel/Render (configured in platform dashboard)
- **Workflow**: Auto-deploy via platform (Vercel/Render) when connected to GitHub

## 🐛 Troubleshooting

### Frontend Issues
- **404 on routes**: Check `VITE_BASE_PATH` in build
- **API errors**: Verify `VITE_API_URL` secret
- **Build fails**: Check GitHub Actions logs

### Backend Issues
- **Can't connect**: Verify DATABASE_URL
- **CORS errors**: Update CORS origins
- **Port issues**: Check platform PORT requirements

## 📞 Support

For deployment issues:
1. Check platform logs (Vercel/Render/Supabase dashboard)
2. Check GitHub Actions logs
3. Verify environment variables
4. Review deployment guides in `docs/deployment/`

## ✅ Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] GitHub Pages enabled
- [ ] `VITE_API_URL` secret set
- [ ] Backend deployed to cloud platform
- [ ] Database created and migrations run
- [ ] CORS configured for GitHub Pages domain
- [ ] Environment variables set
- [ ] Health check passing
- [ ] Frontend connects to backend
- [ ] Test form submission works

---

**Ready to deploy?** Start with the [detailed deployment guides](./docs/deployment/)!

