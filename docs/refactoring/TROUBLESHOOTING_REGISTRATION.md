# Troubleshooting Registration Issues

## Problem: Registration Fails with Generic Error

If you see "Registration failed. Please try again." when trying to register, this guide will help you diagnose and fix the issue.

## Common Causes

### 1. Missing Environment Variables

**Symptoms:**
- Error message mentions "GitHub configuration missing"
- Console shows: `[GitHub Client] GitHub configuration missing: VITE_GITHUB_OWNER, VITE_GITHUB_REPO, VITE_GITHUB_TOKEN`

**Solution:**
1. Go to your GitHub repository: `Settings → Secrets and variables → Actions`
2. Ensure you have these secrets set:
   - `GH_PAT` (GitHub Personal Access Token)
   - `JWT_SECRET` (JWT signing secret)

3. **IMPORTANT**: The workflow uses the `github-pages` environment. You need to set secrets in the environment:
   - Go to: `Settings → Environments → github-pages`
   - Add the secrets there, OR
   - Remove the `environment:` section from the workflow (see below)

4. Verify the workflow file (`.github/workflows/deploy-frontend.yml`) has:
   ```yaml
   env:
     VITE_GITHUB_OWNER: ${{ github.repository_owner }}
     VITE_GITHUB_REPO: ${{ github.event.repository.name }}
     VITE_GITHUB_TOKEN: ${{ secrets.GH_PAT }}
     VITE_JWT_SECRET: ${{ secrets.JWT_SECRET || 'default-jwt-secret-change-in-production' }}
   ```

### 2. GitHub Token Permissions

**Symptoms:**
- Error: "GitHub authentication failed" or "GitHub access denied"
- Console shows 401 or 403 errors

**Solution:**
1. Your GitHub Personal Access Token (PAT) needs these permissions:
   - `repo` (Full control of private repositories)
   - Or for public repos: `public_repo` scope

2. To create/update a token:
   - Go to: `GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)`
   - Create new token with `repo` scope
   - Copy the token
   - Add it to GitHub Secrets as `GH_PAT`

### 3. Auth Files Don't Exist in Repository

**Symptoms:**
- Error: "Authentication file not found"
- Console shows 404 errors

**Solution:**
1. Ensure these files exist in your repository:
   - `backend/data/users_auth.json`
   - `backend/data/admins_auth.json`

2. If they don't exist, create them with this structure:
   ```json
   {
     "users": []
   }
   ```
   ```json
   {
     "admins": []
   }
   ```

3. Commit and push these files to your repository

### 4. Environment Variables Not Available at Build Time

**Symptoms:**
- Variables show as `undefined` in browser console
- Build succeeds but runtime fails

**Solution:**
1. Vite replaces `import.meta.env.VITE_*` at **BUILD TIME**
2. Secrets must be available during the GitHub Actions build step
3. Check the workflow build logs to verify variables are set
4. Re-run the workflow after adding/updating secrets

## Verification Steps

### Step 1: Check Browser Console

1. Open your deployed site
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try to register
5. Look for error messages starting with `[GitHub Client]` or `[Register]`

### Step 2: Check Network Requests

1. Open browser DevTools → Network tab
2. Try to register
3. Look for requests to `api.github.com`
4. Check the response status:
   - `200`: Success
   - `401`: Authentication failed (check token)
   - `403`: Permission denied (check token permissions)
   - `404`: File not found (check if auth files exist)

### Step 3: Verify GitHub Actions Workflow

1. Go to: `Actions → Latest workflow run`
2. Check the "Build frontend" step
3. Look for any errors or warnings
4. Verify environment variables are being set (they'll be masked in logs)

### Step 4: Test Environment Variables

Add this temporary code to check if variables are available:

```typescript
// In browser console:
console.log('OWNER:', import.meta.env.VITE_GITHUB_OWNER)
console.log('REPO:', import.meta.env.VITE_GITHUB_REPO)
console.log('TOKEN:', import.meta.env.VITE_GITHUB_TOKEN ? '***SET***' : 'MISSING')
```

If any show as `undefined`, the build didn't have access to the secrets.

## Quick Fix: Remove Environment Restriction

If you're having trouble with the `github-pages` environment, you can temporarily remove it:

1. Edit `.github/workflows/deploy-frontend.yml`
2. Remove or comment out:
   ```yaml
   environment:
     name: github-pages
     url: ${{ steps.deployment.outputs.page_url }}
   ```
3. Use repository-level secrets instead
4. Commit and push

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Check GitHub Actions logs for build errors
3. Verify all secrets are set correctly
4. Ensure the auth files exist in the repository
5. Test with a fresh GitHub token

## Expected Behavior

When registration works correctly:
1. User fills out registration form
2. Frontend calls GitHub API to read `backend/data/users_auth.json`
3. Frontend adds new user to the array
4. Frontend writes updated file back to GitHub
5. Frontend generates JWT token
6. User is redirected to login page

All of this happens client-side using the GitHub API directly.

