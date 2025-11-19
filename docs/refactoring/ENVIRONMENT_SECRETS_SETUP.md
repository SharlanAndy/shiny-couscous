# Environment Secrets Setup

## Your Workflow Uses: `github-pages` Environment

Looking at your workflow file, it uses:
```yaml
environment:
  name: github-pages
```

## Add Secrets to `github-pages` Environment

1. **Click "Manage environment secrets"** button (in the Environment secrets section)

2. **You'll see the `github-pages` environment**

3. **Add these 2 secrets to the `github-pages` environment**:

### Secret 1: GITHUB_TOKEN
- **Name**: `GITHUB_TOKEN`
- **Value**: Your Fine-grained Personal Access Token (starts with `ghp_...`)
- **How to get**: https://github.com/settings/tokens?type=beta
  - Generate new token (fine-grained)
  - Repository: `clkhoo5211/shiny-couscous`
  - Permission: Contents → Read and write

### Secret 2: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Random 64-character hex string
- **How to generate**:
  ```bash
  openssl rand -hex 32
  ```

## Steps:

1. Click **"Manage environment secrets"** button
2. Click on **"github-pages"** environment
3. Click **"Add secret"** button
4. Add `GITHUB_TOKEN` with your PAT token
5. Click **"Add secret"** again
6. Add `JWT_SECRET` with your random string

## Why Environment Secrets?

Your workflow uses:
```yaml
environment:
  name: github-pages
```

This means secrets should be in the **`github-pages` environment**, not in Repository secrets.

## Current Status

Your workflow expects these environment variables:
- `VITE_GITHUB_OWNER` - Auto (from `${{ github.repository_owner }}`)
- `VITE_GITHUB_REPO` - Auto (from `${{ github.event.repository.name }}`)
- `VITE_GITHUB_TOKEN` - From `${{ secrets.GITHUB_TOKEN }}` in `github-pages` environment
- `VITE_JWT_SECRET` - From `${{ secrets.JWT_SECRET }}` in `github-pages` environment

So you need to add `GITHUB_TOKEN` and `JWT_SECRET` to the **`github-pages` environment secrets**.

