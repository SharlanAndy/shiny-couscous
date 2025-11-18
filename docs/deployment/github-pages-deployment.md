# GitHub Pages Deployment Guide

This guide explains how to deploy the Labuan FSA E-Submission System frontend to GitHub Pages using GitHub Actions.

## 🎯 Overview

- **Frontend**: Deployed to GitHub Pages (static hosting)
- **Backend**: Deployed separately to a cloud service (Vercel, Render, etc.)
- **Database**: Supabase (free PostgreSQL - recommended) or Render PostgreSQL

## 📋 Prerequisites

1. GitHub repository: https://github.com/clkhoo5211/shiny-couscous
2. Backend deployed and accessible via HTTPS
3. GitHub Pages enabled in repository settings

## 🚀 Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/clkhoo5211/shiny-couscous
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save changes

## 🔧 Step 2: Configure GitHub Secrets

Add the following secret to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.vercel.app` or `https://your-backend.onrender.com`)

## 📦 Step 3: Push Code to GitHub

The GitHub Actions workflow will automatically deploy when you push to the `main` branch:

```bash
# Initialize git if not already done
cd projects/project-20251117-153458-labuan-fsa-e-submission-system

# Add remote (if not already added)
git remote add origin https://github.com/clkhoo5211/shiny-couscous.git

# Commit and push frontend code
cd frontend
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin main
```

## 🌐 Step 4: Access Your Deployed Frontend

Once deployment is complete, your frontend will be available at:
- **URL**: https://clkhoo5211.github.io/shiny-couscous/

## 🔗 Step 5: Connect Frontend to Backend

The frontend will automatically connect to the backend URL specified in the `VITE_API_URL` secret.

### Local Development
For local development, create a `.env.local` file:
```bash
VITE_API_URL=http://localhost:8000
```

### Production
The `VITE_API_URL` is set via GitHub Secrets during the build process.

## 🛠️ Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
cd frontend

# Build with GitHub Pages base path
VITE_BASE_PATH=/shiny-couscous/ npm run build

# Install gh-pages (if not already installed)
npm install --save-dev gh-pages

# Deploy to gh-pages branch
npx gh-pages -d dist -b gh-pages
```

## 🐛 Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Ensure `VITE_API_URL` secret is set
- Verify Node.js version compatibility

### 404 Errors on Routes
- Ensure `VITE_BASE_PATH` is set correctly
- React Router should use `HashRouter` or configure basename

### API Connection Errors
- Verify backend URL in `VITE_API_URL` secret
- Check CORS configuration on backend
- Ensure backend is accessible via HTTPS

### Assets Not Loading
- Check that `base` path in `vite.config.ts` matches repository name
- Verify asset paths in build output

## 📝 Notes

- GitHub Pages only serves static files
- Backend must be hosted separately
- Environment variables are embedded at build time
- Changes require a new build and deployment

