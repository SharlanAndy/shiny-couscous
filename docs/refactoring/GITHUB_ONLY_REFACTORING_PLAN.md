# GitHub-Only Refactoring Plan

## Overview

Refactor the backend to work entirely with GitHub API, eliminating the need for Vercel or any external API services. The frontend (both admin and user) will call GitHub API directly to read/write JSON files stored in the repository.

## Architecture

```
Frontend (GitHub Pages)
    ↓ HTTP Requests
GitHub API (REST/GraphQL)
    ↓ Read/Write
JSON Files (backend/data/ in GitHub repo)
```

## Key Components

### 1. **Frontend API Client** → GitHub API
- Replace FastAPI backend calls with GitHub API calls
- Use GitHub REST API or GraphQL API
- Authenticate using GitHub Personal Access Token (PAT)

### 2. **GitHub API Endpoints**
- **GET**: Read JSON files from repository
- **POST/PUT**: Update JSON files (creates commits)
- **DELETE**: Delete entries from JSON files

### 3. **Data Storage**
- JSON files remain in `backend/data/` directory
- Files are version-controlled in Git
- Each write operation creates a commit

## Implementation Strategy

### Phase 1: Backup & Preparation

1. **Create Backup Branch**
   ```bash
   git checkout -b backup-before-github-refactor
   git push origin backup-before-github-refactor
   ```

2. **Document Current API Endpoints**
   - List all API endpoints used by frontend
   - Map to GitHub API equivalents
   - Identify authentication requirements

### Phase 2: Create GitHub API Client

**New File**: `frontend/src/api/github-client.ts`

Replace `axios` calls with GitHub API calls:

```typescript
// Example: Read JSON file from GitHub
async function readJsonFile(path: string): Promise<any> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    }
  )
  const content = await response.text()
  return JSON.parse(content)
}

// Example: Write JSON file to GitHub
async function writeJsonFile(path: string, content: any, message: string): Promise<void> {
  // 1. Get current file SHA (required for update)
  const currentFile = await getFile(path)
  
  // 2. Encode content to base64
  const encodedContent = btoa(JSON.stringify(content, null, 2))
  
  // 3. Create/Update file via GitHub API
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: encodedContent,
        sha: currentFile?.sha // Required for updates
      })
    }
  )
}
```

### Phase 3: Refactor API Endpoints

#### 3.1 Forms API

**Current**: `GET /api/forms`
**New**: `GET /repos/{owner}/{repo}/contents/backend/data/forms.json`

**Current**: `POST /api/admin/forms`
**New**: `PUT /repos/{owner}/{repo}/contents/backend/data/forms.json`

#### 3.2 Submissions API

**Current**: `GET /api/submissions`
**New**: `GET /repos/{owner}/{repo}/contents/backend/data/submissions.json`

**Current**: `POST /api/forms/{form_id}/submit`
**New**: 
1. Read `submissions.json`
2. Add new submission
3. `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json`

#### 3.3 Auth API

**Current**: `POST /api/auth/login`
**New**: 
1. Read `users_auth.json` or `admins_auth.json`
2. Validate credentials client-side
3. Generate JWT token (client-side or via GitHub Actions)

### Phase 4: Authentication Strategy

#### Option A: Client-Side JWT (Recommended)
- Read auth JSON files from GitHub
- Validate credentials in frontend
- Generate JWT token using secret (stored as GitHub secret, injected at build time)
- Store token in localStorage

#### Option B: GitHub Actions Auth Endpoint
- Frontend calls GitHub Actions via `repository_dispatch`
- Action validates credentials
- Returns JWT token
- More secure but slower

### Phase 5: File Upload Handling

**Challenge**: GitHub API has 1MB file size limit for content API

**Solution Options**:

1. **Use GitHub Releases API** (up to 2GB)
   - Upload files as release assets
   - Store file metadata in JSON files
   - Reference files by release asset URL

2. **Use GitHub LFS** (Large File Storage)
   - Store large files in Git LFS
   - Reference in JSON files
   - Requires Git LFS setup

3. **External Storage** (if needed)
   - Use GitHub Actions to upload to external storage
   - Store URLs in JSON files
   - But this violates "no external services" requirement

**Recommended**: Use GitHub Releases API for files > 1MB

### Phase 6: Rate Limiting & Performance

**GitHub API Rate Limits**:
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Fine-grained PAT**: Configurable (up to 5,000/hour)

**Optimization Strategies**:
1. **Caching**: Cache JSON files in localStorage/sessionStorage
2. **Batch Operations**: Combine multiple updates into single commit
3. **Debouncing**: Debounce rapid updates
4. **ETag/If-None-Match**: Use conditional requests to avoid re-downloading unchanged files

### Phase 7: Error Handling

**GitHub API Errors**:
- `404`: File not found (create new file)
- `409`: Conflict (file changed, need to retry with new SHA)
- `403`: Rate limit exceeded
- `422`: Validation error

**Retry Logic**:
- Implement exponential backoff for rate limits
- Retry with new SHA on 409 conflicts
- Show user-friendly error messages

## File Structure After Refactoring

```
project/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── github-client.ts      # NEW: GitHub API client
│   │   │   └── client.ts             # MODIFIED: Use github-client
│   │   └── ...
│   └── ...
├── backend/
│   ├── data/                         # JSON files (read/write via GitHub API)
│   │   ├── forms.json
│   │   ├── submissions.json
│   │   ├── users_auth.json
│   │   └── ...
│   └── ...                           # Backend code can be removed or kept for reference
└── .github/
    └── workflows/
        └── deploy-frontend.yml       # MODIFIED: Inject GitHub token
```

## Implementation Steps

### Step 1: Create GitHub API Client

1. Create `frontend/src/api/github-client.ts`
2. Implement functions:
   - `readJsonFile(path: string)`
   - `writeJsonFile(path: string, content: any, message: string)`
   - `deleteJsonFile(path: string, message: string)`
   - `listFiles(path: string)`

### Step 2: Update Frontend API Client

1. Modify `frontend/src/api/client.ts`
2. Replace all `axios` calls with GitHub API calls
3. Map existing endpoints to GitHub API:
   - Forms → `backend/data/forms.json`
   - Submissions → `backend/data/submissions.json`
   - Users → `backend/data/users_auth.json`
   - Admins → `backend/data/admins_auth.json`

### Step 3: Handle Authentication

1. Create `frontend/src/lib/github-auth.ts`
2. Implement:
   - Read auth files from GitHub
   - Validate credentials
   - Generate JWT (using secret from GitHub secrets)
   - Store token in localStorage

### Step 4: Update GitHub Workflow

1. Modify `.github/workflows/deploy-frontend.yml`
2. Add GitHub token injection:
   ```yaml
   env:
     VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
     VITE_GITHUB_OWNER: ${{ github.repository_owner }}
     VITE_GITHUB_REPO: ${{ github.event.repository.name }}
   ```

### Step 5: Create GitHub Secrets

1. Create GitHub Personal Access Token (PAT)
2. Add to GitHub Secrets:
   - `GITHUB_TOKEN` (for API calls)
   - `JWT_SECRET` (for token generation)

### Step 6: Testing

1. Test all GET operations (read JSON files)
2. Test all POST operations (create entries)
3. Test all PUT operations (update entries)
4. Test all DELETE operations (delete entries)
5. Test authentication flow
6. Test error handling (rate limits, conflicts)

### Step 7: Remove Backend Dependencies

1. Remove FastAPI backend code (or keep as reference)
2. Remove backend deployment workflows
3. Update documentation

## Security Considerations

### 1. GitHub Token Security

**Problem**: GitHub token exposed in frontend bundle

**Solutions**:
- Use **Fine-grained PAT** with minimal permissions (read/write only to `backend/data/`)
- Use **GitHub App** instead of PAT (more secure, but complex)
- Use **GitHub Actions** as proxy (token stays server-side)

**Recommended**: Fine-grained PAT with minimal scope

### 2. Authentication

**Problem**: Auth validation in frontend is insecure

**Solutions**:
- Use GitHub Actions to validate auth (slower but secure)
- Hash passwords in JSON files (bcrypt)
- Use JWT with short expiration

**Recommended**: Hash passwords + client-side JWT with short expiration

### 3. Data Validation

**Problem**: No server-side validation

**Solutions**:
- Implement comprehensive client-side validation
- Use GitHub Actions to validate on commit (pre-commit hook)
- Use GitHub's branch protection rules

**Recommended**: Client-side validation + GitHub Actions validation

## Limitations & Trade-offs

### Limitations

1. **Rate Limits**: 5,000 requests/hour (may need optimization)
2. **File Size**: 1MB limit for content API (use Releases API for larger files)
3. **Real-time Updates**: No WebSocket support (need polling)
4. **Complex Queries**: No SQL-like queries (filter in frontend)
5. **Concurrent Writes**: Need conflict resolution (retry with new SHA)

### Trade-offs

✅ **Pros**:
- No external services needed
- Free (GitHub free tier)
- Version control built-in (Git history)
- Easy to backup/restore
- No server maintenance

❌ **Cons**:
- Slower than dedicated backend (API calls + commits)
- Rate limits may be restrictive
- Less secure (token in frontend)
- No real-time updates
- Complex conflict resolution

## Migration Checklist

- [ ] Create backup branch
- [ ] Document all current API endpoints
- [ ] Create GitHub API client
- [ ] Update frontend API client
- [ ] Implement authentication
- [ ] Handle file uploads (if needed)
- [ ] Update GitHub workflow
- [ ] Create GitHub secrets
- [ ] Test all operations
- [ ] Update documentation
- [ ] Remove backend code (optional)

## Next Steps

1. **Review this plan** and approve approach
2. **Create backup branch** before starting
3. **Start with Phase 1** (backup & preparation)
4. **Implement Phase 2** (GitHub API client)
5. **Gradually migrate** endpoints one by one
6. **Test thoroughly** before removing backend

## Alternative Approach: GitHub Actions as API Proxy

If direct GitHub API calls are too complex, consider using GitHub Actions as an API proxy:

1. Frontend calls GitHub Actions via `repository_dispatch`
2. Action processes request, reads/writes files
3. Action returns response via artifacts or commits
4. Frontend polls for results

**Pros**: More secure, server-side processing
**Cons**: Slower, more complex, not real-time

## Questions to Consider

1. **File Uploads**: How to handle files > 1MB?
2. **Authentication**: Client-side or GitHub Actions?
3. **Real-time Updates**: Accept polling or need WebSocket alternative?
4. **Rate Limits**: Is 5,000 requests/hour sufficient?
5. **Backend Code**: Keep for reference or remove entirely?

---

**Ready to proceed?** Let me know if you want to start with Phase 1 (backup) or if you have questions about the approach.

