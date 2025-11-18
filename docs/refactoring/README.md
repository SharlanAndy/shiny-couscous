# GitHub-Only Refactoring Plan

## 🎯 Goal

Refactor the backend to work entirely with GitHub API, eliminating the need for Vercel or any external API services. Both admin backend and user frontend will use GitHub API to read/write JSON files stored in the GitHub repository.

## 📋 Overview

### Current Architecture
```
Frontend (GitHub Pages) → Backend API (Vercel) → JSON Files (backend/data/)
```

### Target Architecture
```
Frontend (GitHub Pages) → GitHub API → JSON Files (backend/data/ in GitHub repo)
```

## 🔑 Key Concepts

### 1. GitHub API as Backend
- Frontend calls GitHub REST API directly
- Read files: `GET /repos/{owner}/{repo}/contents/{path}`
- Write files: `PUT /repos/{owner}/{repo}/contents/{path}` (creates commits)
- Delete entries: Read file, remove entry, write back

### 2. JSON Files as Database
- All data stored in `backend/data/*.json` files
- Files are version-controlled in Git
- Each write operation creates a commit
- History available via Git

### 3. Authentication
- Read auth JSON files from GitHub
- Validate credentials client-side
- Generate JWT token (using secret from GitHub secrets)
- Store token in localStorage

## 📁 Files to Create/Modify

### New Files
1. `frontend/src/api/github-client.ts` - GitHub API client
2. `frontend/src/lib/github-auth.ts` - GitHub-based authentication
3. `docs/refactoring/GITHUB_ONLY_REFACTORING_PLAN.md` - Detailed plan
4. `docs/refactoring/GITHUB_API_ENDPOINT_MAPPING.md` - Endpoint mapping
5. `docs/refactoring/IMPLEMENTATION_STEPS.md` - Step-by-step guide

### Modified Files
1. `frontend/src/api/client.ts` - Replace axios calls with GitHub API
2. `.github/workflows/deploy-frontend.yml` - Add GitHub token injection
3. `frontend/package.json` - Remove axios dependency (optional)

### Files to Backup
1. `backend/` - Entire directory (move to `backend-archive/` or backup branch)

## 🚀 Quick Start

### Step 1: Backup
```bash
git checkout -b backup-before-github-refactor
git push origin backup-before-github-refactor
git checkout main
```

### Step 2: Review Plan
- Read `GITHUB_ONLY_REFACTORING_PLAN.md` for detailed architecture
- Read `GITHUB_API_ENDPOINT_MAPPING.md` for endpoint mapping
- Read `IMPLEMENTATION_STEPS.md` for step-by-step guide

### Step 3: Start Implementation
Follow phases in `IMPLEMENTATION_STEPS.md`:
1. Phase 1: Backup & Preparation
2. Phase 2: Create GitHub API Client
3. Phase 3: Refactor Frontend API Client
4. Phase 4: Handle Authentication
5. Phase 5: Handle File Uploads
6. Phase 6: Error Handling & Retry Logic
7. Phase 7: Testing
8. Phase 8: Optimization
9. Phase 9: Remove Backend Code (Optional)
10. Phase 10: Deployment

## 📊 API Endpoint Mapping

See `GITHUB_API_ENDPOINT_MAPPING.md` for complete mapping of:
- Forms API → `backend/data/forms.json`
- Submissions API → `backend/data/submissions.json`
- Auth API → `backend/data/users_auth.json` & `backend/data/admins_auth.json`
- Admin API → Various JSON files
- Files API → GitHub Releases API or base64 in JSON

## 🔐 Security Considerations

### GitHub Token
- **Problem**: Token exposed in frontend bundle
- **Solution**: Use fine-grained PAT with minimal permissions (read/write only to `backend/data/`)
- **Alternative**: Use GitHub Actions as proxy (more secure, but slower)

### Authentication
- **Problem**: Auth validation in frontend is insecure
- **Solution**: Hash passwords in JSON files (bcrypt), use JWT with short expiration
- **Alternative**: Use GitHub Actions to validate auth (slower but secure)

## ⚠️ Limitations

1. **Rate Limits**: 5,000 requests/hour (authenticated)
2. **File Size**: 1MB limit for content API (use Releases API for larger files)
3. **Real-time Updates**: No WebSocket support (need polling)
4. **Complex Queries**: No SQL-like queries (filter in frontend)
5. **Concurrent Writes**: Need conflict resolution (retry with new SHA)

## ✅ Benefits

- ✅ No external services needed
- ✅ Free (GitHub free tier)
- ✅ Version control built-in (Git history)
- ✅ Easy to backup/restore
- ✅ No server maintenance
- ✅ All data in one place (GitHub repo)

## 📝 Next Steps

1. **Review this plan** and approve approach
2. **Create backup branch** before starting
3. **Start with Phase 1** (backup & preparation)
4. **Implement Phase 2** (GitHub API client)
5. **Gradually migrate** endpoints one by one
6. **Test thoroughly** before removing backend

## 📚 Documentation

- `GITHUB_ONLY_REFACTORING_PLAN.md` - Complete refactoring plan
- `GITHUB_API_ENDPOINT_MAPPING.md` - API endpoint mapping
- `IMPLEMENTATION_STEPS.md` - Detailed implementation steps

---

**Ready to start?** Begin with Phase 1 (backup) in `IMPLEMENTATION_STEPS.md`.

