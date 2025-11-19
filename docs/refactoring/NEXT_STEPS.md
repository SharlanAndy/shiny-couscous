# Next Steps - Complete Setup Checklist

## ✅ What's Already Done

- [x] GitHub API client created (`github-client.ts`)
- [x] Authentication helper created (`github-auth.ts`)
- [x] API client activated (switched to GitHub API)
- [x] Workflow updated (removed VITE_API_URL, added GitHub env vars)
- [x] Dependencies added (crypto-js)
- [x] Code pushed to GitHub

## 📋 What You Need to Do Now

### Step 1: Create GitHub Token ⭐

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token" → "Generate new token (fine-grained)"
3. Configure:
   - **Name**: `labuan-fsa-frontend-api`
   - **Repository**: Select `clkhoo5211/shiny-couscous`
   - **Permissions**: Contents → **Read and write**
4. Click "Generate token"
5. **Copy the token** (starts with `ghp_...`)

### Step 2: Generate JWT Secret ⭐

Run this command in terminal:
```bash
openssl rand -hex 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (64-character hex string)

### Step 3: Add Secrets to GitHub ⭐

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Click **"Manage environment secrets"** (in Environment secrets section)
3. Click on **"github-pages"** environment
4. Add **GITHUB_TOKEN**:
   - Click "Add secret"
   - Name: `GITHUB_TOKEN`
   - Value: Paste the token from Step 1
   - Click "Add secret"
5. Add **JWT_SECRET**:
   - Click "Add secret" again
   - Name: `JWT_SECRET`
   - Value: Paste the hex string from Step 2
   - Click "Add secret"

### Step 4: Trigger Deployment

The deployment will trigger automatically on the next push, OR:

1. Go to: https://github.com/clkhoo5211/shiny-couscous/actions
2. Click on "Deploy Frontend to GitHub Pages" workflow
3. Click "Run workflow" button (top right)
4. Select branch: `main`
5. Click "Run workflow"

### Step 5: Monitor Deployment

1. Watch the workflow run: https://github.com/clkhoo5211/shiny-couscous/actions
2. Wait for it to complete (2-5 minutes)
3. Check for any errors in the logs
4. If successful, deployment is complete!

### Step 6: Test the Deployment

1. Visit: https://clkhoo5211.github.io/shiny-couscous
2. Open browser DevTools (F12) → Network tab
3. Try to:
   - Register a new user
   - Login
   - View forms
   - Submit a form
4. Check network requests:
   - ✅ Should see: `api.github.com/repos/...`
   - ❌ Should NOT see: `shiny-couscous-tau.vercel.app/...`

## 🎯 Quick Checklist

- [ ] Created GitHub token (Fine-grained PAT)
- [ ] Generated JWT secret (64-char hex string)
- [ ] Added `GITHUB_TOKEN` to `github-pages` environment secrets
- [ ] Added `JWT_SECRET` to `github-pages` environment secrets
- [ ] Triggered deployment (or wait for auto-deploy)
- [ ] Verified deployment succeeded
- [ ] Tested the site (registration, login, forms)

## 🔍 Verification

After deployment, verify:

1. **Network Requests**:
   - Open DevTools → Network tab
   - Should see calls to `api.github.com/repos/clkhoo5211/shiny-couscous/contents/...`

2. **Functionality**:
   - User registration works
   - Login works
   - Forms load
   - Submissions can be created

3. **GitHub Repository**:
   - Check `backend/data/` folder
   - Should see commits when data is written
   - Each write operation creates a commit

## 🐛 Troubleshooting

### Deployment Fails
- Check GitHub Actions logs
- Verify secrets are added correctly
- Check token permissions

### API Calls Fail
- Verify `GITHUB_TOKEN` is set correctly
- Check token has Contents (Read and write) permission
- Verify token hasn't expired

### 401 Unauthorized
- Token might be invalid or expired
- Generate new token and update secret

### 403 Forbidden
- Token doesn't have write permissions
- Update token permissions to Contents: Read and write

## 📚 Documentation

- **How to get token**: `HOW_TO_GET_GITHUB_TOKEN.md`
- **Token permissions**: `TOKEN_PERMISSIONS.md`
- **Why token needed**: `WHY_TOKEN_NEEDED_OWN_REPO.md`
- **Environment secrets**: `ENVIRONMENT_SECRETS_SETUP.md`

## 🎉 Once Complete

After all steps are done:
- ✅ Frontend uses GitHub API directly
- ✅ No Vercel backend needed
- ✅ All data stored in GitHub repo
- ✅ Every write creates a Git commit
- ✅ Full version history of all changes

