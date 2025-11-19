# Secret Name Fix - GITHUB_ Prefix Not Allowed

## Issue

GitHub doesn't allow secret names to start with `GITHUB_` (reserved prefix).

## Solution

Use `GH_PAT` instead of `GITHUB_TOKEN` for the secret name.

## Updated Secret Names

### Secret 1: GH_PAT (not GITHUB_TOKEN)
- **Name**: `GH_PAT` ✅
- **Value**: Your Fine-grained Personal Access Token (starts with `ghp_...`)

### Secret 2: JWT_SECRET
- **Name**: `JWT_SECRET` ✅
- **Value**: Random 64-character hex string

## Add to GitHub Secrets

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Click "Manage environment secrets"
3. Click "github-pages" environment
4. Add secrets:
   - **Name**: `GH_PAT` (NOT `GITHUB_TOKEN`)
   - **Value**: Your GitHub token
   - **Name**: `JWT_SECRET`
   - **Value**: `d0f45d3748bece6c012edb5998d9db545bed2c62947abbfe7fc3d7ed79f874a8`

## Workflow Updated

The workflow has been updated to use `secrets.GH_PAT` instead of `secrets.GITHUB_TOKEN`.

## Why GH_PAT?

- `GH` = GitHub
- `PAT` = Personal Access Token
- Common naming convention
- Doesn't conflict with GitHub's reserved prefixes

