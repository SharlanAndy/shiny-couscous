# GitHub-Only Refactoring - Quick Start Guide

## Overview

This guide provides step-by-step instructions to migrate the frontend from FastAPI backend to GitHub API-only implementation.

## Prerequisites

- GitHub repository with access
- Node.js and npm installed
- GitHub Personal Access Token (Fine-grained)

## Step 1: Install Dependencies

```bash
cd frontend
npm install crypto-js @types/crypto-js
```

## Step 2: Create GitHub Secrets

1. **Create Fine-grained Personal Access Token**:
   - Go to: https://github.com/settings/tokens?type=beta
   - Click "Generate new token"
   - Name: `labuan-fsa-frontend`
   - Repository access: Select "Only select repositories" → Choose your repository
   - Permissions:
     - Contents: Read and write
   - Generate token and copy it

2. **Generate JWT Secret**:
   ```bash
   # Generate random secret
   openssl rand -hex 32
   # Or use online generator
   ```

3. **Add to GitHub Secrets**:
   - Go to repository → Settings → Secrets and variables → Actions
   - Add secrets:
     - `GITHUB_TOKEN`: Your Fine-grained PAT
     - `JWT_SECRET`: Random string (from step 2)

## Step 3: Update GitHub Workflow

Edit `.github/workflows/deploy-frontend.yml` and add environment variables:

```yaml
env:
  VITE_GITHUB_OWNER: ${{ github.repository_owner }}
  VITE_GITHUB_REPO: ${{ github.event.repository.name }}
  VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  VITE_JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Step 4: Replace API Client

```bash
# Backup original
cd frontend/src/api
mv client.ts client-backup.ts

# Use GitHub version
mv client-github.ts client.ts
```

## Step 5: Test Locally

Create `.env.local` in `frontend/` directory:

```env
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=your-repository-name
VITE_GITHUB_TOKEN=ghp_your_token_here
VITE_JWT_SECRET=your-jwt-secret-here
```

Run dev server:

```bash
cd frontend
npm run dev
```

Test:
- Login
- View forms
- Create submission
- Admin operations

## Step 6: Deploy

```bash
git add .
git commit -m "Refactor to use GitHub API only"
git push
```

GitHub Actions will automatically:
1. Build frontend with environment variables
2. Deploy to GitHub Pages

## Step 7: Verify

1. Check GitHub Actions workflow (should succeed)
2. Visit deployed site
3. Test all functionality
4. Check GitHub repository for commits (each write creates a commit)

## Troubleshooting

### Error: "GitHub configuration missing"
- **Solution**: Check environment variables are set correctly

### Error: "401 Unauthorized"
- **Solution**: Verify GitHub token has correct permissions

### Error: "409 Conflict"
- **Solution**: This is handled automatically (retry with new SHA)

### Error: "403 Rate limit exceeded"
- **Solution**: Wait or increase rate limit (upgrade GitHub plan)

### Files not updating
- **Solution**: Check GitHub token has write permissions
- **Solution**: Check file path is correct (`backend/data/`)

## Rollback

If you need to rollback:

```bash
cd frontend/src/api
mv client-backup.ts client.ts
git add .
git commit -m "Rollback to FastAPI backend"
git push
```

## Next Steps

1. Monitor GitHub API rate limits
2. Implement large file uploads (GitHub Releases API)
3. Add request batching for better performance
4. Set up monitoring/alerts for rate limits

## Files Reference

- **Implementation Guide**: `docs/refactoring/FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Implementation Summary**: `docs/refactoring/IMPLEMENTATION_SUMMARY.md`
- **Original Plan**: `docs/refactoring/GITHUB_ONLY_REFACTORING_PLAN.md`

## Support

For detailed information, see:
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Complete implementation details
- `IMPLEMENTATION_SUMMARY.md` - File-by-file breakdown
- `GITHUB_ONLY_REFACTORING_PLAN.md` - Original architecture plan

