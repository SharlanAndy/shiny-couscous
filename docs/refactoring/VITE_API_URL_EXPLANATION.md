# VITE_API_URL - Not Needed for GitHub-Only Mode

## Answer: You DON'T need to change `VITE_API_URL`

For GitHub-only refactoring, **`VITE_API_URL` is NOT used** and can be removed from the workflow.

## Why?

The GitHub API client (`github-client.ts`) constructs URLs directly:

```typescript
private baseURL = 'https://api.github.com'  // Hardcoded, not from env var
```

It uses these environment variables instead:
- `VITE_GITHUB_OWNER` - Auto from `${{ github.repository_owner }}`
- `VITE_GITHUB_REPO` - Auto from `${{ github.event.repository.name }}`
- `VITE_GITHUB_TOKEN` - From secrets
- `VITE_JWT_SECRET` - From secrets

## What Changed?

**Old (Vercel Backend)**:
```
Frontend → VITE_API_URL (Vercel) → FastAPI Backend → JSON Files
```

**New (GitHub API)**:
```
Frontend → GitHub API Client → api.github.com → JSON Files in Repo
```

## Workflow Update

I've updated the workflow to remove `VITE_API_URL` since it's not needed.

The workflow now only uses:
- ✅ `VITE_GITHUB_OWNER` (auto)
- ✅ `VITE_GITHUB_REPO` (auto)
- ✅ `VITE_GITHUB_TOKEN` (from `github-pages` environment secret)
- ✅ `VITE_JWT_SECRET` (from `github-pages` environment secret)
- ✅ `VITE_BASE_PATH` (for GitHub Pages routing)

## Components That Still Reference VITE_API_URL

Some components might still have old references:
- `FileUploadField.tsx`
- `DocumentChecklist.tsx`

These will need to be updated to use the GitHub API client instead, but that's a separate task. For now, the main API client is using GitHub API.

## Summary

**You don't need to set `VITE_API_URL` for GitHub-only mode.**

Just add these 2 secrets to the `github-pages` environment:
1. `GITHUB_TOKEN`
2. `JWT_SECRET`

That's it! 🎉

