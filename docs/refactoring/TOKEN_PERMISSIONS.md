# GitHub Token Permissions - Exact Settings

## Required Permission

**Only ONE permission is needed:**

### Contents: Read and write ✅

This allows the token to:
- ✅ Read JSON files from your repo
- ✅ Create new JSON files
- ✅ Update existing JSON files
- ✅ Delete files (if needed)

## How to Set It

When creating the token:

1. Scroll to **"Repository permissions"** section
2. Find **"Contents"**
3. Set it to **"Read and write"** (not just "Read")
4. **Everything else**: Leave as **"No access"**

## Visual Guide

```
Repository permissions:
├── Actions: ❌ No access
├── Administration: ❌ No access
├── Checks: ❌ No access
├── Contents: ✅ Read and write  ← ONLY THIS ONE!
├── Deployments: ❌ No access
├── Environments: ❌ No access
├── Issues: ❌ No access
├── Metadata: ✅ Read-only (auto, can't change)
├── Packages: ❌ No access
├── Pages: ❌ No access
├── Pull requests: ❌ No access
├── Repository secrets: ❌ No access
├── Secrets: ❌ No access
├── Variables: ❌ No access
└── ... (everything else): ❌ No access
```

## Why Only Contents?

Your frontend only needs to:
- Read JSON files (forms, submissions, users)
- Write JSON files (create submissions, register users, update data)

It doesn't need:
- ❌ Actions (running workflows)
- ❌ Administration (repo settings)
- ❌ Secrets (accessing secrets)
- ❌ Anything else

## Security Best Practice

**Principle of Least Privilege**: Only grant the minimum permissions needed.

Since your app only reads/writes JSON files, it only needs **Contents: Read and write**.

## Summary

**Set this permission**:
- ✅ **Contents**: **Read and write**

**Don't set these**:
- ❌ Everything else: **No access**

That's it! Just one permission. 🎯

