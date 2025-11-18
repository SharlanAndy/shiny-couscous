# 🚀 GitHub Repository Setup Guide

Quick guide to set up and push code to: https://github.com/clkhoo5211/shiny-couscous

## 📋 Initial Setup

### 1. Initialize Git Repository

```bash
cd projects/project-20251117-153458-labuan-fsa-e-submission-system

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/clkhoo5211/shiny-couscous.git

# Or if remote already exists, update it
git remote set-url origin https://github.com/clkhoo5211/shiny-couscous.git
```

### 2. Add All Files

```bash
# Stage all files
git add .

# Commit
git commit -m "Initial commit: Labuan FSA E-Submission System"

# Push to main branch
git branch -M main
git push -u origin main
```

## 🔐 Setup GitHub Secrets

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Click **New repository secret**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (set this after deploying backend)

## 📄 Repository Structure

```
shiny-couscous/
├── frontend/              # React frontend (deployed to GitHub Pages)
├── backend/               # FastAPI backend (deploy separately)
├── .github/
│   └── workflows/         # GitHub Actions workflows
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
├── docs/
│   └── deployment/        # Deployment documentation
├── README.md
├── DEPLOYMENT.md          # Main deployment guide
└── README-GITHUB.md       # This file
```

## 🚀 Deployment Flow

### Frontend (GitHub Pages)
1. **Enable GitHub Pages**:
   - Repo → Settings → Pages
   - Source: GitHub Actions

2. **Set Secret**:
   - Settings → Secrets → Actions
   - Add `VITE_API_URL` with your backend URL

3. **Push Code**:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```

4. **Auto-Deploy**:
   - GitHub Actions automatically builds and deploys
   - Check Actions tab for deployment status

### Backend (Separate Cloud Platform)

**Choose one (all free tier):**
- **Supabase + Vercel**: https://supabase.com + https://vercel.com (Recommended - Best free tier)
- **Render**: https://render.com (Easiest setup)
- **Supabase + Render**: Supabase for database, Render for backend

See [Backend Deployment Guide](./docs/deployment/backend-deployment.md) for details.

## ✅ Verification Checklist

- [ ] Repository is public (required for GitHub Pages free tier)
- [ ] GitHub Pages enabled in settings
- [ ] `VITE_API_URL` secret is set
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend
- [ ] Frontend deployment workflow passes
- [ ] Visit: https://clkhoo5211.github.io/shiny-couscous/

## 🔗 Quick Links

- **Repository**: https://github.com/clkhoo5211/shiny-couscous
- **GitHub Pages**: https://clkhoo5211.github.io/shiny-couscous/
- **Actions**: https://github.com/clkhoo5211/shiny-couscous/actions
- **Settings**: https://github.com/clkhoo5211/shiny-couscous/settings

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT.md)
- [GitHub Pages Deployment](./docs/deployment/github-pages-deployment.md)
- [Backend Deployment](./docs/deployment/backend-deployment.md)

