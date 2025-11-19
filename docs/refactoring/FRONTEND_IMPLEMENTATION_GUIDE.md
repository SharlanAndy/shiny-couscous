# Frontend GitHub API Implementation Guide

## Overview

This guide details the complete implementation of the GitHub-only refactoring for the frontend. All API calls will be replaced with direct GitHub API calls to read/write JSON files in the repository.

## Current Architecture Analysis

### Current API Client Structure

The frontend uses a single `APIClient` class (`frontend/src/api/client.ts`) with the following endpoint categories:

1. **Forms API** (7 methods)
   - `getForms()` → `/api/forms`
   - `getForm()` → `/api/forms/{id}`
   - `getFormSchema()` → `/api/forms/{id}/schema`
   - `createForm()` → `POST /api/forms`
   - `updateForm()` → `PUT /api/forms/{id}`
   - `updateFormSchema()` → Updates form with schema
   - `deleteForm()` → `DELETE /api/admin/forms/{id}`

2. **Submissions API** (7 methods)
   - `validateSubmission()` → `POST /api/forms/{id}/validate`
   - `submitForm()` → `POST /api/forms/{id}/submit`
   - `saveDraft()` → `POST /api/forms/{id}/draft`
   - `updateDraft()` → `PUT /api/submissions/{id}/draft`
   - `getSubmissions()` → `/api/submissions`
   - `getSubmission()` → `/api/submissions/{id}`

3. **File Upload API** (1 method)
   - `uploadFile()` → `POST /api/files/upload`

4. **Admin API** (3 methods)
   - `getAdminSubmissions()` → `/api/admin/submissions`
   - `reviewSubmission()` → `PUT /api/admin/submissions/{id}`
   - `deleteSubmission()` → `DELETE /api/admin/submissions/{id}`
   - `getAdminStatistics()` → `/api/admin/statistics`

5. **Auth API** (7 methods)
   - `login()` → `POST /api/auth/login`
   - `register()` → `POST /api/auth/register`
   - `logout()` → `POST /api/auth/logout`
   - `getCurrentUser()` → `/api/auth/me`
   - `updateProfile()` → `PUT /api/auth/profile`
   - `changePassword()` → `POST /api/auth/change-password`
   - `deleteAccount()` → `POST /api/auth/account/delete`

6. **Admin User Management** (3 methods)
   - `getAdminUsers()` → `/api/admin/users`
   - `getAdminUser()` → `/api/admin/users/{id}`
   - `updateAdminUser()` → `PUT /api/admin/users/{id}`

7. **Admin Management** (5 methods)
   - `getAdminAdmins()` → `/api/admin/admins`
   - `getAdminAdmin()` → `/api/admin/admins/{id}`
   - `createAdmin()` → `POST /api/admin/admins`
   - `updateAdminAdmin()` → `PUT /api/admin/admins/{id}`
   - `deleteAdmin()` → `DELETE /api/admin/admins/{id}`

8. **Admin Settings** (2 methods)
   - `getAdminSettings()` → `/api/admin/settings`
   - `updateAdminSettings()` → `PUT /api/admin/settings`

### Data File Mapping

| API Endpoint | GitHub File Path | JSON Structure |
|-------------|------------------|----------------|
| Forms | `backend/data/forms.json` | `{ version, lastUpdated, items: FormResponse[] }` |
| Submissions | `backend/data/submissions.json` | `{ version, lastUpdated, items: SubmissionResponse[] }` |
| Users Auth | `backend/data/users_auth.json` | `{ users: UserAuth[] }` |
| Admins Auth | `backend/data/admins_auth.json` | `{ admins: AdminAuth[] }` |
| Settings | `backend/data/settings.json` | `Settings object` |
| Files | `backend/data/files.json` | `{ files: FileUploadResponse[] }` |

## Implementation Steps

### Step 1: Create GitHub API Client

**File**: `frontend/src/api/github-client.ts`

This client handles all GitHub API operations:
- Read JSON files
- Write/Update JSON files (with conflict resolution)
- Delete entries from JSON files
- Handle rate limiting and errors
- Cache management

### Step 2: Create GitHub Authentication Helper

**File**: `frontend/src/lib/github-auth.ts`

This helper handles:
- Reading auth JSON files from GitHub
- Validating credentials (client-side)
- Generating JWT tokens
- Password hashing verification

### Step 3: Refactor Main API Client

**File**: `frontend/src/api/client.ts`

Replace all axios calls with GitHub API calls:
- Map each endpoint to GitHub file operations
- Maintain same method signatures (no breaking changes)
- Handle data transformation (array operations, filtering, etc.)

### Step 4: Environment Configuration

**Files to update**:
- `.github/workflows/deploy-frontend.yml` - Inject GitHub token
- `frontend/vite.config.ts` - Remove proxy, add env vars
- Create `.env.example` for documentation

### Step 5: Update Components

**Files that may need updates**:
- Direct `apiClient.client` calls (2 files)
- File upload components (handle GitHub Releases API)
- Error handling for GitHub API errors

## Data Operations Mapping

### Read Operations

All read operations follow this pattern:
1. Read JSON file from GitHub
2. Parse JSON
3. Filter/transform data as needed
4. Return formatted response

### Write Operations

All write operations follow this pattern:
1. Read current JSON file (get SHA)
2. Parse JSON
3. Modify data (add/update/delete)
4. Write back to GitHub with commit message
5. Handle 409 conflicts (retry with new SHA)

### Special Cases

1. **Statistics**: Calculated from submissions.json
2. **Form Schema**: Extracted from form's `schemaData` field
3. **File Uploads**: Use GitHub Releases API for files > 1MB
4. **Authentication**: Client-side validation + JWT generation

## Error Handling

### GitHub API Errors

- **404**: File not found → Create new file
- **409**: Conflict → Retry with new SHA
- **403**: Rate limit → Exponential backoff
- **422**: Validation error → Show user-friendly message

### Retry Logic

- Implement exponential backoff for rate limits
- Retry with new SHA on 409 conflicts (max 3 retries)
- Cache file SHAs to reduce API calls

## Rate Limiting Strategy

### Current Limits
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Fine-grained PAT**: Configurable (up to 5,000/hour)

### Optimization
1. **Caching**: Cache JSON files in localStorage (5 min TTL)
2. **Batch Operations**: Combine multiple updates into single commit
3. **Debouncing**: Debounce rapid updates (500ms)
4. **ETag/If-None-Match**: Use conditional requests

## Security Considerations

### GitHub Token Security

**Problem**: Token exposed in frontend bundle

**Solution**: Use Fine-grained PAT with minimal permissions:
- Repository access: Only this repository
- Permissions: Contents (read/write) only
- No admin, no secrets access

### Authentication Security

**Problem**: Client-side auth validation is insecure

**Solution**:
- Hash passwords in JSON files (already done - SHA256)
- Generate JWT with short expiration (1 hour)
- Store JWT secret in GitHub Secrets (injected at build time)
- Validate JWT on each request (client-side check)

### Data Validation

**Problem**: No server-side validation

**Solution**:
- Comprehensive client-side validation (already exists)
- GitHub Actions validation on commit (future enhancement)
- Branch protection rules (manual setup)

## File Upload Handling

### Small Files (< 1MB)
- Use GitHub Content API (base64 encoded)
- Store in `backend/data/files.json` with metadata
- Reference by file ID in submissions

### Large Files (> 1MB)
- Use GitHub Releases API
- Upload as release asset
- Store metadata in `backend/data/files.json`
- Reference by release asset URL

### Implementation
- Check file size before upload
- Route to appropriate API
- Handle progress tracking for large files

## Testing Checklist

- [ ] Read operations (all endpoints)
- [ ] Write operations (create/update)
- [ ] Delete operations
- [ ] Conflict resolution (409 retry)
- [ ] Rate limiting handling
- [ ] Authentication flow
- [ ] File uploads (small and large)
- [ ] Error handling
- [ ] Caching behavior
- [ ] Performance (response times)

## Migration Steps

1. **Create backup branch**
   ```bash
   git checkout -b backup-before-github-refactor
   git push origin backup-before-github-refactor
   ```

2. **Create GitHub Secrets**
   - `GITHUB_TOKEN`: Fine-grained PAT
   - `JWT_SECRET`: Random string for JWT signing

3. **Implement GitHub client** (Step 1-3)

4. **Update workflow** (Step 4)

5. **Test thoroughly** (Step 5)

6. **Deploy and monitor**

7. **Remove backend code** (optional, after verification)

## Breaking Changes

**None** - The refactored API client maintains the same method signatures, so no component changes are required.

## Performance Considerations

### Expected Changes
- **Slower**: GitHub API calls + commit operations (~500ms-2s)
- **Caching**: Reduces redundant calls
- **Batch Operations**: Multiple updates in single commit

### Optimization Opportunities
- Implement request queuing
- Use GitHub GraphQL API for batch queries
- Prefetch commonly accessed data
- Implement optimistic updates

## Rollback Plan

If issues arise:
1. Revert to backup branch
2. Restore backend deployment
3. Update frontend to use backend API
4. Investigate issues in GitHub implementation

## Next Steps

1. Review this guide
2. Create GitHub Secrets
3. Implement Step 1 (GitHub client)
4. Test with one endpoint
5. Gradually migrate all endpoints
6. Full testing
7. Deploy

