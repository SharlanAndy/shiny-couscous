# GitHub API Client Activation Guide

## Step 1: Activate GitHub API Client

Replace the current API client with the GitHub API version:

```bash
cd frontend/src/api
mv client.ts client-backup.ts
mv client-github.ts client.ts
```

Or manually:
1. Rename `frontend/src/api/client.ts` to `frontend/src/api/client-backup.ts`
2. Rename `frontend/src/api/client-github.ts` to `frontend/src/api/client.ts`

## Step 2: Set Up GitHub Secrets

Go to your GitHub repository: https://github.com/clkhoo5211/shiny-couscous

### Navigate to Secrets
1. Click **Settings** (top menu)
2. Click **Secrets and variables** → **Actions** (left sidebar)
3. Click **New repository secret**

### Required Secrets

#### 1. GITHUB_TOKEN (Required)

**What it is**: A Fine-grained Personal Access Token (PAT) that allows the frontend to read/write JSON files in your repository.

**How to create**:
1. Go to: https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"** → **"Generate new token (fine-grained)"**
3. Fill in:
   - **Token name**: `labuan-fsa-frontend-api`
   - **Description**: `Token for frontend to access GitHub API for JSON file operations`
   - **Expiration**: Choose your preference (90 days, 1 year, or no expiration)
   - **Repository access**: Select **"Only select repositories"**
     - Choose: `clkhoo5211/shiny-couscous`
4. **Permissions**:
   - Under **Repository permissions**:
     - **Contents**: Set to **Read and write**
     - Leave everything else as **No access**
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
   - It starts with `ghp_...`

**Add to GitHub Secrets**:
- **Name**: `GITHUB_TOKEN`
- **Secret**: Paste the token you just copied
- Click **"Add secret"**

#### 2. JWT_SECRET (Required)

**What it is**: A secret key used to sign JWT tokens for authentication.

**How to generate**:
```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Example output**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

**Add to GitHub Secrets**:
- **Name**: `JWT_SECRET`
- **Secret**: Paste the generated random string
- Click **"Add secret"**

### Optional Secrets (if you want to keep Vercel backend as fallback)

These are NOT required for GitHub API mode, but if you want to keep them:

- `VITE_API_URL`: Your Vercel backend URL (not needed for GitHub API)
- `VITE_SUPABASE_URL`: Supabase URL (if using Supabase)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (if using Supabase)

## Step 3: Verify Workflow Configuration

The workflow file (`.github/workflows/deploy-frontend.yml`) should already have these environment variables:

```yaml
env:
  VITE_GITHUB_OWNER: ${{ github.repository_owner }}
  VITE_GITHUB_REPO: ${{ github.event.repository.name }}
  VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  VITE_JWT_SECRET: ${{ secrets.JWT_SECRET || 'default-jwt-secret-change-in-production' }}
```

✅ These are already configured in your workflow!

## Step 4: Commit and Push

After activating the GitHub API client:

```bash
cd /path/to/project
git add frontend/src/api/client.ts frontend/src/api/client-backup.ts
git commit -m "Activate GitHub API client - switch from Vercel backend to GitHub API"
git push origin main
```

## Step 5: Monitor Deployment

1. Go to: https://github.com/clkhoo5211/shiny-couscous/actions
2. Watch the "Deploy Frontend to GitHub Pages" workflow
3. Wait for it to complete (should take 2-5 minutes)
4. Check for any errors in the logs

## Step 6: Verify Deployment

After deployment completes:

1. Visit: https://clkhoo5211.github.io/shiny-couscous
2. Open browser DevTools (F12) → Network tab
3. Try to register a user or load forms
4. Check network requests:
   - ✅ Should see: `https://api.github.com/repos/clkhoo5211/shiny-couscous/contents/...`
   - ❌ Should NOT see: `https://shiny-couscous-tau.vercel.app/api/...`

## Troubleshooting

### Error: "GitHub configuration missing"
- **Cause**: Environment variables not set in GitHub Secrets
- **Fix**: Add `GITHUB_TOKEN` and `JWT_SECRET` to repository secrets

### Error: "401 Unauthorized" when calling GitHub API
- **Cause**: Invalid or expired `GITHUB_TOKEN`
- **Fix**: 
  1. Generate a new Fine-grained PAT
  2. Update `GITHUB_TOKEN` secret in GitHub
  3. Redeploy

### Error: "403 Forbidden" when writing to GitHub
- **Cause**: Token doesn't have write permissions
- **Fix**: 
  1. Go to token settings
  2. Ensure **Contents** permission is set to **Read and write**
  3. Regenerate token if needed

### Error: "404 Not Found" for repository
- **Cause**: Wrong repository name or token doesn't have access
- **Fix**: 
  1. Verify repository name in workflow: `${{ github.event.repository.name }}`
  2. Ensure token has access to the repository

### Build succeeds but API calls still go to Vercel
- **Cause**: Old `client.ts` still being used
- **Fix**: 
  1. Verify `client.ts` is the GitHub version (check imports)
  2. Clear browser cache
  3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Security Best Practices

1. **Token Permissions**: Only grant **Contents: Read and write** - nothing else
2. **Token Expiration**: Set expiration date (90 days or 1 year)
3. **JWT Secret**: Use a strong random string (32+ characters)
4. **Repository Access**: Limit token to only this repository
5. **Never Commit Secrets**: Secrets should only be in GitHub Secrets, never in code

## Verification Checklist

- [ ] `GITHUB_TOKEN` secret added to repository
- [ ] `JWT_SECRET` secret added to repository
- [ ] `client.ts` replaced with GitHub API version
- [ ] Changes committed and pushed
- [ ] GitHub Actions workflow completed successfully
- [ ] Network requests show GitHub API calls (not Vercel)
- [ ] User registration/login works
- [ ] Forms load correctly
- [ ] Submissions can be created

## Rollback Plan

If something goes wrong, you can rollback:

```bash
cd frontend/src/api
mv client.ts client-github.ts
mv client-backup.ts client.ts
git add .
git commit -m "Rollback to Vercel backend"
git push origin main
```

## Next Steps After Activation

1. Test user registration
2. Test user login
3. Test form filling and submission
4. Test admin operations
5. Monitor GitHub API rate limits (5,000 requests/hour)
6. Check GitHub repository for commits (each write creates a commit)

