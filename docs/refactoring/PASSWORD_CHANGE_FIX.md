# Admin Password Change Fix

**Date**: 2025-11-19  
**Issue**: Admin password change not working  
**Status**: ✅ **FIXED**

## Problem

When admins tried to change a user's password through the admin panel, the password change was not being saved correctly.

## Root Cause

The `updateAdminUser` method in `frontend/src/api/client.ts` was:
1. Reading the auth file but not capturing the SHA
2. Not passing the SHA to `writeJsonFile` when updating the file

This could cause GitHub API update failures or race conditions when multiple updates happen simultaneously.

## Solution

Modified `updateAdminUser` to:
1. Destructure both `data` and `sha` from `readJsonFile` result
2. Pass the `sha` to `writeJsonFile` to ensure correct file updates

## Code Changes

**File**: `frontend/src/api/client.ts`

**Before**:
```typescript
const { data: authData } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(authFile)
// ... update logic ...
await github.writeJsonFile(authFile, authData, `Admin update user: ${user.email}`)
```

**After**:
```typescript
// Read file with SHA to ensure we can update it correctly
const { data: authData, sha } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(authFile)
// ... update logic ...
// Pass SHA to ensure correct update
await github.writeJsonFile(authFile, authData, `Admin update user: ${user.email}`, sha)
```

## Testing

To test the fix:
1. Login as admin
2. Go to Admin → Users
3. Click "Edit" on a user
4. Click "Change Password"
5. Enter a new password
6. Click "Save"
7. Verify the password change is saved
8. Logout and login as that user with the new password

## Related Files

- `frontend/src/api/client.ts` - `updateAdminUser` method
- `frontend/src/api/github-client.ts` - `readJsonFile` and `writeJsonFile` methods
- `frontend/src/pages/admin/AdminUsersPage.tsx` - Admin users management UI

---

**Fixed By**: Automated fix  
**Commit**: 2882486  
**Status**: ✅ **FIXED AND COMMITTED**

