# GitHub Secrets Setup - Quick Reference

## Required Secrets

You need to add **2 secrets** to your GitHub repository:

### 1. GITHUB_TOKEN ⭐ (Required)

**Purpose**: Allows frontend to read/write JSON files via GitHub API

**How to Create**:
1. Go to: https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"** → **"Generate new token (fine-grained)"**
3. Settings:
   - **Token name**: `labuan-fsa-frontend-api`
   - **Repository access**: Select **"Only select repositories"** → Choose `clkhoo5211/shiny-couscous`
   - **Permissions** → **Repository permissions**:
     - **Contents**: ✅ **Read and write**
     - Everything else: ❌ **No access**
4. Click **"Generate token"**
5. **Copy the token** (starts with `ghp_...`)

**Add to GitHub**:
- Repository: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
- Click **"New repository secret"**
- **Name**: `GITHUB_TOKEN`
- **Secret**: Paste the token
- Click **"Add secret"**

### 2. JWT_SECRET ⭐ (Required)

**Purpose**: Secret key for signing JWT authentication tokens

**How to Generate**:
```bash
# Run this command in terminal:
openssl rand -hex 32
```

**Or use Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to GitHub**:
- Repository: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
- Click **"New repository secret"**
- **Name**: `JWT_SECRET`
- **Secret**: Paste the generated random string
- Click **"Add secret"**

## Quick Setup Steps

1. ✅ **Create GITHUB_TOKEN** (Fine-grained PAT)
2. ✅ **Generate JWT_SECRET** (random 64-character hex string)
3. ✅ **Add both to GitHub Secrets**
4. ✅ **Commit and push** (already done - API client activated)
5. ✅ **Wait for deployment** (GitHub Actions will auto-deploy)

## Verification

After adding secrets and deployment completes:

1. Visit: https://clkhoo5211.github.io/shiny-couscous
2. Open DevTools (F12) → Network tab
3. Try to register/login
4. Check network requests:
   - ✅ Should see: `api.github.com/repos/...`
   - ❌ Should NOT see: `shiny-couscous-tau.vercel.app/...`

## Current Status

✅ **API Client**: Activated (switched to GitHub API)  
⏳ **Secrets**: Need to be added in GitHub Settings  
⏳ **Deployment**: Will trigger automatically after secrets are added

## Where to Add Secrets

**Direct Link**: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions

**Navigation Path**:
1. Go to repository: https://github.com/clkhoo5211/shiny-couscous
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **"New repository secret"** button

## Workflow Configuration

Your workflow (`.github/workflows/deploy-frontend.yml`) is already configured to use these secrets:

```yaml
env:
  VITE_GITHUB_OWNER: ${{ github.repository_owner }}        # Auto: clkhoo5211
  VITE_GITHUB_REPO: ${{ github.event.repository.name }}    # Auto: shiny-couscous
  VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}           # ⭐ Need to add
  VITE_JWT_SECRET: ${{ secrets.JWT_SECRET }}               # ⭐ Need to add
```

✅ No changes needed to workflow file - just add the secrets!

