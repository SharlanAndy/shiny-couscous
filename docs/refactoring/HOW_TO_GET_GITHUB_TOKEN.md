# How to Get GitHub Token - Step by Step

## Step 1: Go to Token Settings

**Direct Link**: https://github.com/settings/tokens?type=beta

Or navigate:
1. Click your profile picture (top right)
2. Click **Settings**
3. Scroll down to **Developer settings** (left sidebar)
4. Click **Personal access tokens**
5. Click **Fine-grained tokens** (or **Tokens (classic)** if you prefer)

## Step 2: Generate New Token

1. Click **"Generate new token"** button
2. Select **"Generate new token (fine-grained)"**

## Step 3: Configure Token

Fill in the form:

### Basic Information
- **Token name**: `labuan-fsa-frontend-api` (or any name you like)
- **Description**: `Token for frontend to access GitHub API`
- **Expiration**: Choose:
  - 90 days (recommended for testing)
  - 1 year (for production)
  - No expiration (not recommended)

### Repository Access
- Select **"Only select repositories"**
- Choose: `clkhoo5211/shiny-couscous`

### Permissions

Under **Repository permissions**:

- **Contents**: Set to **✅ Read and write**
  - This allows reading and writing JSON files
- **Everything else**: Leave as **❌ No access**

**That's it!** You only need Contents permission.

## Step 4: Generate and Copy

1. Scroll down and click **"Generate token"** button
2. **⚠️ IMPORTANT**: Copy the token immediately!
   - It starts with `ghp_...`
   - You won't be able to see it again!
   - If you lose it, you'll need to generate a new one

## Step 5: Add to GitHub Secrets

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Click **"Manage environment secrets"** (in Environment secrets section)
3. Click on **"github-pages"** environment
4. Click **"Add secret"** button
5. **Name**: `GITHUB_TOKEN`
6. **Secret**: Paste the token you copied
7. Click **"Add secret"**

## Quick Links

- **Create Token**: https://github.com/settings/tokens?type=beta
- **Add Secret**: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
- **Manage Environment Secrets**: Click "Manage environment secrets" → Select "github-pages"

## Visual Guide

```
1. https://github.com/settings/tokens?type=beta
   ↓
2. Click "Generate new token" → "Generate new token (fine-grained)"
   ↓
3. Fill in:
   - Name: labuan-fsa-frontend-api
   - Repository: clkhoo5211/shiny-couscous
   - Permissions: Contents (Read and write)
   ↓
4. Click "Generate token"
   ↓
5. Copy token (starts with ghp_...)
   ↓
6. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
   ↓
7. Click "Manage environment secrets"
   ↓
8. Click "github-pages"
   ↓
9. Click "Add secret"
   - Name: GITHUB_TOKEN
   - Value: [paste token]
   ↓
10. Done! ✅
```

## Token Format

Your token will look like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

It's a long string starting with `ghp_`.

## Troubleshooting

### Can't find "Fine-grained tokens"?
- Make sure you're logged in
- Try: https://github.com/settings/tokens?type=beta
- If still not visible, you might need to use "Tokens (classic)" instead

### Token doesn't work?
- Check expiration date
- Verify repository access includes `clkhoo5211/shiny-couscous`
- Verify Contents permission is set to "Read and write"
- Make sure you copied the entire token (starts with `ghp_`)

### Lost the token?
- Generate a new one (old one is gone forever)
- Update the secret in GitHub with the new token

