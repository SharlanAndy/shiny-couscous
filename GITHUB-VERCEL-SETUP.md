# GitHub + Vercel Setup - Complete Guide

## ✅ GitHub Repo Settings: NOTHING NEEDED

**Good news**: You don't need to change anything in GitHub repo settings!

Vercel connects to your GitHub repo automatically and deploys from it. No special GitHub settings required.

## 🚀 What You Need to Do

### Step 1: Set Environment Variables in Vercel (CRITICAL!)

The Python process is crashing because **environment variables are missing**.

**Go to Vercel Dashboard:**
1. Visit: https://vercel.com/dashboard
2. Click on project: `shiny-couscous`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**

**Add these variables** (for Production, Preview, AND Development):

#### 1. DATABASE_URL (Required)
```
Name: DATABASE_URL
Value: postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**To get connection pooler URL (recommended for Vercel):**
1. Go to Supabase Dashboard → Database
2. Click "Connect to your project"
3. Select Method: "Transaction pooler"
4. Copy the connection string shown

#### 2. SECRET_KEY (Required)
```
Name: SECRET_KEY
Value: [Generate a random secret key]
```

Generate it:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Or use this for testing:
```
your-secret-key-here-minimum-32-characters-long-for-security
```

#### 3. ENVIRONMENT (Recommended)
```
Name: ENVIRONMENT
Value: production
```

#### 4. CORS_ORIGINS (Recommended)
```
Name: CORS_ORIGINS
Value: https://clkhoo5211.github.io
```

#### 5. DB_URL (Alternative - if DATABASE_URL doesn't work)
```
Name: DB_URL
Value: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important**: After adding variables, **Redeploy** the project!

### Step 2: Redeploy After Setting Variables

1. Go to **Deployments** tab
2. Click **...** (three dots) on latest deployment
3. Click **Redeploy**
4. **Uncheck** "Use existing Build Cache" (to get fresh dependencies)
5. Click **Redeploy**

### Step 3: Wait for Deployment

1. Watch the deployment progress
2. Wait for it to complete (2-3 minutes)
3. Check if it's successful

### Step 4: Test the API

Once deployed, test these URLs:
- `https://shiny-couscous-tau.vercel.app/` → Should return API info
- `https://shiny-couscous-tau.vercel.app/health` → Should return `{"status": "healthy"}`
- `https://shiny-couscous-tau.vercel.app/docs` → Should show FastAPI docs

## 🔧 What I Just Fixed

1. ✅ **Better Error Handling**: Handler now catches all errors and exports properly
2. ✅ **Config Fallback**: If TOML config fails, uses environment variables
3. ✅ **Always Export Handler**: Handler is always exported, even on error
4. ✅ **Better Debug Output**: More detailed logging to help diagnose issues

## 📋 GitHub Repo: What You DON'T Need to Do

❌ No webhooks to set
❌ No secrets to configure
❌ No GitHub Actions needed
❌ No branch protection rules
❌ No deploy keys

**Vercel handles everything automatically!**

## ⚠️ Important Notes

1. **Environment Variables**: MUST be set in Vercel Dashboard
2. **Redeploy**: Must redeploy after adding environment variables
3. **Check Logs**: If still failing, check Function Logs in Vercel Dashboard
4. **Database**: Make sure Supabase database is accessible from Vercel IPs

## 🎯 Next Steps

1. ✅ **Set environment variables** in Vercel Dashboard (CRITICAL!)
2. ✅ **Redeploy** the project
3. ✅ **Wait** for deployment to complete
4. ✅ **Test** the `/health` endpoint
5. ✅ **Check logs** if still failing

The code is fixed - now you just need to set the environment variables! 🚀

