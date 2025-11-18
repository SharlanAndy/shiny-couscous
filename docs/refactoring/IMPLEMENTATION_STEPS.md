# GitHub-Only Refactoring: Implementation Steps

## Phase 1: Backup & Preparation ✅

### Step 1.1: Create Backup Branch
```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system
git checkout -b backup-before-github-refactor
git push origin backup-before-github-refactor
git checkout main
```

### Step 1.2: Document Current State
- ✅ List all API endpoints (see `GITHUB_API_ENDPOINT_MAPPING.md`)
- ✅ Document JSON file structure
- ✅ Document authentication flow

## Phase 2: Create GitHub API Client

### Step 2.1: Create GitHub API Client Module

**File**: `frontend/src/api/github-client.ts`

**Functions to implement**:
1. `readJsonFile(path: string): Promise<any>`
2. `writeJsonFile(path: string, content: any, message: string): Promise<void>`
3. `deleteJsonFile(path: string, message: string): Promise<void>`
4. `getFileSha(path: string): Promise<string | null>`
5. `handleConflict(path: string, retryFn: Function): Promise<any>`

### Step 2.2: Environment Configuration

**Update**: `.github/workflows/deploy-frontend.yml`

Add environment variables:
```yaml
env:
  VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  VITE_GITHUB_OWNER: ${{ github.repository_owner }}
  VITE_GITHUB_REPO: ${{ github.event.repository.name }}
  VITE_GITHUB_BRANCH: ${{ github.ref_name }}
```

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions with repo access.

## Phase 3: Refactor Frontend API Client

### Step 3.1: Update Forms API Methods

Replace in `frontend/src/api/client.ts`:
- `getForms()` → Read `backend/data/forms.json` via GitHub API
- `getForm()` → Read `forms.json`, filter by `formId`
- `getFormSchema()` → Read `forms.json`, extract `schemaData`
- `createForm()` → Read `forms.json`, add entry, write back
- `updateForm()` → Read `forms.json`, update entry, write back
- `deleteForm()` → Read `forms.json`, remove entry, write back

### Step 3.2: Update Submissions API Methods

Replace in `frontend/src/api/client.ts`:
- `getSubmissions()` → Read `backend/data/submissions.json` via GitHub API
- `getSubmission()` → Read `submissions.json`, filter by `submissionId`
- `submitForm()` → Read `submissions.json`, add entry, write back
- `saveDraft()` → Read `submissions.json`, add draft entry, write back
- `updateDraft()` → Read `submissions.json`, update entry, write back
- `deleteSubmission()` → Read `submissions.json`, remove entry, write back

### Step 3.3: Update Auth API Methods

Replace in `frontend/src/api/client.ts`:
- `login()` → Read `users_auth.json` or `admins_auth.json`, validate client-side
- `register()` → Read `users_auth.json`, add entry, write back
- `getProfile()` → Read `users_auth.json`, filter by user ID
- `updateProfile()` → Read `users_auth.json`, update entry, write back
- `changePassword()` → Read `users_auth.json`, update password hash, write back
- `deleteAccount()` → Read `users_auth.json`, remove entry, write back

### Step 3.4: Update Admin API Methods

Replace in `frontend/src/api/client.ts`:
- `getAdmins()` → Read `backend/data/admins_auth.json` via GitHub API
- `createAdmin()` → Read `admins_auth.json`, add entry, write back
- `updateAdmin()` → Read `admins_auth.json`, update entry, write back
- `deleteAdmin()` → Read `admins_auth.json`, remove entry, write back
- `getUsers()` → Read `backend/data/users_auth.json` via GitHub API
- `getAdminStatistics()` → Read `submissions.json` and `forms.json`, calculate
- `getAdminSettings()` → Read `backend/data/settings.json` via GitHub API
- `updateAdminSettings()` → Read `settings.json`, update, write back

## Phase 4: Handle Authentication

### Step 4.1: Client-Side Auth Validation

**File**: `frontend/src/lib/github-auth.ts`

Implement:
- Read auth JSON files from GitHub
- Validate credentials (compare hashed passwords)
- Generate JWT token (using secret from GitHub secrets)
- Store token in localStorage

### Step 4.2: JWT Secret Management

**Option A**: Inject at build time (less secure)
- Store `JWT_SECRET` in GitHub Secrets
- Inject as `VITE_JWT_SECRET` during build
- Generate JWT in frontend

**Option B**: Use GitHub Actions for auth (more secure)
- Frontend calls GitHub Actions via `repository_dispatch`
- Action validates credentials server-side
- Returns JWT token
- Slower but more secure

**Recommended**: Option A for simplicity, Option B for security

## Phase 5: Handle File Uploads

### Step 5.1: Small Files (< 1MB)

Store as base64 in JSON files:
- Encode file to base64
- Store in `files.json` or submission data
- Decode when downloading

### Step 5.2: Large Files (> 1MB)

Use GitHub Releases API:
- Upload file as release asset
- Store file metadata in `files.json`
- Reference by release asset URL

**Alternative**: Use GitHub LFS (Large File Storage)

## Phase 6: Error Handling & Retry Logic

### Step 6.1: Conflict Resolution

When updating files:
1. Read file (get current SHA)
2. Modify content
3. Write file with SHA
4. If 409 conflict, retry with new SHA

### Step 6.2: Rate Limiting

- Implement exponential backoff
- Cache responses in localStorage
- Show user-friendly error messages

### Step 6.3: Network Errors

- Retry failed requests
- Show offline indicator
- Queue operations when offline

## Phase 7: Testing

### Step 7.1: Unit Tests

Test GitHub API client functions:
- Read JSON files
- Write JSON files
- Handle conflicts
- Handle errors

### Step 7.2: Integration Tests

Test full flows:
- User registration → creates entry in `users_auth.json`
- Form submission → creates entry in `submissions.json`
- Admin review → updates entry in `submissions.json`

### Step 7.3: End-to-End Tests

Test in browser:
- All CRUD operations
- Authentication flow
- File uploads
- Error scenarios

## Phase 8: Optimization

### Step 8.1: Caching

- Cache JSON files in localStorage
- Use ETag/If-None-Match for conditional requests
- Invalidate cache on updates

### Step 8.2: Batch Operations

- Combine multiple updates into single commit
- Debounce rapid updates
- Queue operations

### Step 8.3: Performance

- Lazy load JSON files
- Paginate large lists
- Use Web Workers for heavy processing

## Phase 9: Remove Backend Code (Optional)

### Step 9.1: Archive Backend

Move backend code to `backend-archive/` for reference

### Step 9.2: Update Documentation

- Update README
- Update deployment docs
- Remove backend deployment workflows

## Phase 10: Deployment

### Step 10.1: Update GitHub Secrets

Add to GitHub Secrets:
- `GITHUB_TOKEN` (auto-provided by GitHub Actions)
- `JWT_SECRET` (for token generation)

### Step 10.2: Update Workflow

Modify `.github/workflows/deploy-frontend.yml`:
- Add GitHub token injection
- Add JWT secret injection
- Update build environment variables

### Step 10.3: Test Deployment

- Deploy to GitHub Pages
- Test all operations
- Monitor rate limits
- Check error logs

## Estimated Timeline

- **Phase 1**: 1 hour (backup & preparation)
- **Phase 2**: 4-6 hours (GitHub API client)
- **Phase 3**: 8-12 hours (refactor API methods)
- **Phase 4**: 4-6 hours (authentication)
- **Phase 5**: 4-6 hours (file uploads)
- **Phase 6**: 4-6 hours (error handling)
- **Phase 7**: 6-8 hours (testing)
- **Phase 8**: 4-6 hours (optimization)
- **Phase 9**: 2-4 hours (cleanup)
- **Phase 10**: 2-4 hours (deployment)

**Total**: ~40-60 hours

## Risks & Mitigation

### Risk 1: Rate Limits
**Mitigation**: Implement caching, batch operations, optimize requests

### Risk 2: Security (Token in Frontend)
**Mitigation**: Use fine-grained PAT with minimal permissions, or use GitHub Actions proxy

### Risk 3: Conflict Resolution
**Mitigation**: Implement retry logic with exponential backoff

### Risk 4: Performance
**Mitigation**: Cache aggressively, batch operations, use conditional requests

## Success Criteria

✅ All GET operations work via GitHub API
✅ All POST/PUT/DELETE operations create commits
✅ Authentication works without backend
✅ File uploads work (small files in JSON, large files in Releases)
✅ Error handling works (conflicts, rate limits, network errors)
✅ Performance is acceptable (< 2s for most operations)
✅ No external services required

