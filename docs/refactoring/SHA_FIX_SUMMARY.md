# SHA Handling Fix Summary

## Problem Identified

Registration was failing with error: **"Invalid request. \"sha\" wasn't supplied."**

This is a GitHub API error that occurs when:
- Trying to update an existing file without providing the SHA
- Or including an empty SHA string in the request body

## Root Cause

The `writeJsonFile` method in `github-client.ts` was:
1. Getting the SHA from `readJsonFile` 
2. Including the SHA in the request body even when it was empty
3. GitHub API requires SHA for updates but rejects empty SHA strings

## Solution

Updated the `writeJsonFile` method to:
1. Only include SHA in request body when it's a non-empty string
2. For new files (empty SHA), don't include the `sha` field at all
3. Improved error handling for SHA retrieval

### Code Changes

**Before:**
```typescript
if (currentSha) {
  body.sha = currentSha
}
```

**After:**
```typescript
// Include SHA ONLY for updates (required by GitHub API)
// For new files, do NOT include sha field at all
if (currentSha && currentSha.trim() !== '') {
  body.sha = currentSha
}
```

## Testing

After this fix:
1. New user registration should work (creates new entry in users_auth.json)
2. File updates should work (includes SHA for existing files)
3. Error messages are more descriptive

## Next Steps

1. Wait for GitHub Actions deployment to complete
2. Test registration again
3. Verify the user is created in the repository

