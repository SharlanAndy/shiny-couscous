# Why GitHub Token is Needed (Even for Public Repos)

## Short Answer

**Yes, you need a token even for public repos** because:

1. **Writing to the repo requires authentication** (creating/updating/deleting files)
2. **Rate limits**: Unauthenticated = 60 requests/hour, Authenticated = 5,000 requests/hour
3. **The frontend needs to WRITE files** (not just read)

## Detailed Explanation

### 1. Writing Files Requires Authentication

Even though your repo is **public** (anyone can read it), **writing/modifying files via GitHub API requires authentication**.

Your frontend needs to:
- ✅ **Read** JSON files (forms, submissions, users)
- ✅ **Write** JSON files (create submissions, update data, register users)
- ✅ **Delete** entries (admin operations)

**Writing operations ALWAYS require a token**, even for public repos.

### 2. Rate Limits

**Without Token (Unauthenticated)**:
- 60 requests/hour
- Your app will hit this limit quickly (every form load, submission, etc.)

**With Token (Authenticated)**:
- 5,000 requests/hour
- Much more reasonable for a real application

### 3. Security

The token ensures:
- Only authorized operations can modify your repo
- You can revoke access if needed
- Fine-grained permissions (read/write only to specific paths)

## What Happens Without Token?

If you try to use GitHub API without a token:

```javascript
// This will work (read public repo)
GET https://api.github.com/repos/clkhoo5211/shiny-couscous/contents/backend/data/forms.json
// ✅ Works - public repo, no auth needed

// This will FAIL (write requires auth)
PUT https://api.github.com/repos/clkhoo5211/shiny-couscous/contents/backend/data/submissions.json
// ❌ 401 Unauthorized - writing requires authentication
```

## Alternative: Use GitHub Actions Instead?

If you really don't want to use a token in the frontend, you could:

1. **Frontend** → Calls GitHub Actions via `repository_dispatch`
2. **GitHub Action** → Reads/writes files (has built-in `GITHUB_TOKEN`)
3. **Action** → Returns result

But this is:
- ❌ More complex
- ❌ Slower (actions take time to run)
- ❌ Still uses a token (just the built-in `GITHUB_TOKEN` in the action)

## Token Security

**The token is safe because**:
- ✅ It's stored as a **secret** (encrypted)
- ✅ Only used during build time (injected as env var)
- ✅ Fine-grained permissions (only Contents: Read/Write)
- ✅ Can be revoked anytime
- ✅ Limited to one repository

**The token is NOT exposed** in the frontend bundle - it's only used during the build process to inject the value into environment variables.

## Summary

| Operation | Public Repo | Token Required? |
|-----------|-------------|-----------------|
| Read files | ✅ Yes | ❌ No (but limited to 60 req/hour) |
| Write files | ✅ Yes | ✅ **YES** (always required) |
| Delete files | ✅ Yes | ✅ **YES** (always required) |
| Higher rate limit | ✅ Yes | ✅ **YES** (5,000 vs 60) |

**Bottom line**: Since your app needs to **write** data (submissions, user registration, etc.), you **must** use a token, even for a public repo.

## What About the Built-in GITHUB_TOKEN?

GitHub Actions has a built-in `GITHUB_TOKEN`, but:
- ❌ It's only available **inside** GitHub Actions workflows
- ❌ Not available in the frontend (browser)
- ❌ Can't be used for client-side API calls

So you need a **Personal Access Token** (PAT) for the frontend to make API calls.

