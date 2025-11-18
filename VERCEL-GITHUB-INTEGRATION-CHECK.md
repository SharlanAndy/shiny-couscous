# 🔍 Vercel-GitHub Integration Check

## ❌ Issue: No Auto-Deploy When Pushing to GitHub

If Vercel isn't automatically deploying when you push to GitHub, check these settings:

## ✅ Step 1: Verify Vercel Project Git Settings

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on project: `shiny-couscous`

2. **Check Git Integration:**
   - Go to **Settings** → **Git**
   - Verify:
     - ✅ **Repository**: `clkhoo5211/shiny-couscous`
     - ✅ **Production Branch**: `main`
     - ✅ **Root Directory**: `/` (empty or root)
     - ✅ **Auto-deploy**: **Enabled** ✅

3. **If Not Connected:**
   - Click **"Connect Git Repository"**
   - Select `clkhoo5211/shiny-couscous`
   - Choose branch: `main`
   - Save settings

## ✅ Step 2: Check GitHub Webhook

1. **Go to GitHub Repository:**
   - Visit: https://github.com/clkhoo5211/shiny-couscous
   - Go to **Settings** → **Webhooks**

2. **Verify Vercel Webhook:**
   - Should see a webhook for Vercel
   - Status should be **Active** ✅
   - Should show recent deliveries (green checkmarks)

3. **If No Webhook:**
   - Vercel integration might be broken
   - Go back to Vercel → Settings → Git
   - Disconnect and reconnect the repository

## ✅ Step 3: Verify GitHub App Permissions

1. **Go to GitHub Account Settings:**
   - Visit: https://github.com/settings/installations
   - Or: GitHub → Settings → Applications → Installed GitHub Apps

2. **Check Vercel App:**
   - Find **Vercel** in the list
   - Click **Configure**
   - Verify it has access to `clkhoo5211/shiny-couscous` repository
   - Should have **Read and Write** permissions

## ✅ Step 4: Check Commit Author

1. **Verify Git Email:**
   ```bash
   git config user.email
   ```

2. **Match with Vercel Account:**
   - The email used for Git commits should match your Vercel account email
   - Or be added to your Vercel team

## ✅ Step 5: Manual Trigger (Quick Fix)

If auto-deploy isn't working, manually trigger:

### Option A: Vercel Dashboard
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. **Uncheck** "Use existing Build Cache"
5. Click **"Redeploy"**

### Option B: Vercel CLI
```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system
vercel --prod
```

### Option C: GitHub Actions (Future)
We could add a GitHub Actions workflow to trigger Vercel deployments, but Vercel's auto-deploy should work.

## 🔍 Common Issues

### Issue 1: Branch Mismatch
- **Problem**: Vercel watching `master`, commits on `main`
- **Fix**: Vercel Settings → Git → Production Branch → Set to `main`

### Issue 2: Webhook Not Firing
- **Problem**: GitHub webhook exists but not firing
- **Fix**: 
  1. GitHub → Settings → Webhooks → Click Vercel webhook
  2. Click **"Redeliver"** on a recent delivery
  3. Check if it succeeds (green checkmark)

### Issue 3: Repository Not Connected
- **Problem**: Vercel project not connected to GitHub
- **Fix**: 
  1. Vercel → Settings → Git
  2. Click **"Connect Git Repository"**
  3. Select `clkhoo5211/shiny-couscous`

### Issue 4: Permission Issues
- **Problem**: Vercel GitHub App doesn't have access
- **Fix**: 
  1. GitHub → Settings → Applications → Installed GitHub Apps
  2. Configure Vercel
  3. Grant access to repository

## 📋 Quick Checklist

Before asking why it's not deploying, verify:

- [ ] Commit is pushed to `main` branch on GitHub
- [ ] Vercel project is connected to `clkhoo5211/shiny-couscous`
- [ ] Production branch in Vercel is set to `main`
- [ ] Auto-deploy is enabled in Vercel
- [ ] GitHub webhook exists and is active
- [ ] Vercel GitHub App has repository access
- [ ] Checked Vercel Deployments tab for any queued/building deployments

## 🚀 Current Status

**Latest Commit:** `570c387` - "Trigger Vercel redeploy - monitor prepared statement fix"

**Check Now:**
1. Visit: https://github.com/clkhoo5211/shiny-couscous/commits/main
2. Verify commit `570c387` is visible
3. Visit: https://vercel.com/dashboard → `shiny-couscous` → Deployments
4. Look for any new deployment triggered by this commit

If no deployment appears after 2 minutes, manually redeploy using Option A above.

