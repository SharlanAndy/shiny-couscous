# Vercel Setup Guide - After Importing GitHub Repo

## Step-by-Step Vercel Configuration

After importing your GitHub repo to Vercel, follow these steps:

## 1. Project Settings (General Tab)

### Framework Preset
- **Current**: "Other" ✅ (Correct - don't change)
- This is correct because we're using Python/FastAPI, not a standard framework

### Root Directory
- **Should be**: `/` (root of repository) ✅
- Leave this as default - don't change to `backend/`

### Build & Development Settings
Since we're using Python serverless functions, these should be **disabled/empty**:

#### Build Command
- **Override**: ❌ OFF (Keep default)
- Or set to: `echo "No build needed for Python"`
- **Why**: Python doesn't need a build step

#### Output Directory
- **Override**: ❌ OFF (Keep default)
- **Why**: Not needed for serverless functions

#### Install Command
- **Override**: ❌ OFF (Keep default)
- Vercel will automatically detect `api/requirements.txt` and install dependencies
- **Why**: Vercel auto-detects Python functions and installs from `api/requirements.txt`

#### Development Command
- **Override**: ❌ OFF (Keep default: "None")
- **Why**: Not needed for serverless functions

## 2. Environment Variables (Settings → Environment Variables)

**CRITICAL**: Set these environment variables:

### Required Variables:

```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**To get connection string:**
1. Go to Supabase Dashboard → Database
2. Click "Connect to your project"
3. For Vercel/serverless: Select Method: "Transaction pooler" (recommended)
4. For traditional servers: Select Method: "Direct connection"
5. Copy the connection string shown

```
SECRET_KEY=[Generate a random secret key]
```

Generate it with:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Or use this one (for testing):
```
SECRET_KEY=your-secret-key-here-minimum-32-characters-long-for-security
```

```
ENVIRONMENT=production
```

```
CORS_ORIGINS=https://clkhoo5211.github.io
```

### How to Add:
1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Add each variable above
4. **Important**: Set them for **Production**, **Preview**, and **Development** environments
5. Click **Save**

## 3. Git Settings (Settings → Git)

Verify these settings:

- **Repository**: `clkhoo5211/shiny-couscous` ✅
- **Production Branch**: `main` ✅
- **Root Directory**: `/` (root) ✅
- **Auto-deploy**: Enabled ✅

## 4. Deployment Settings

After setting environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment (or wait for auto-deploy)
3. Select **Use existing Build Cache** = OFF (to get fresh dependencies)
4. Click **Redeploy**

## 5. Verify Deployment

### Check Build Logs:
1. Go to latest deployment
2. Click **Build Logs** tab
3. Look for:
   - ✅ Installing dependencies from `api/requirements.txt`
   - ✅ Python packages installed successfully
   - ✅ Build completed

### Check Function Logs:
1. Go to latest deployment
2. Click **Functions** tab (or **Runtime Logs**)
3. Look for debug output from `api/index.py`:
   - 🔍 Vercel Entry Point Debug
   - ✅ Added backend/src to Python path
   - ✅ Successfully imported labuan_fsa.main
   - ✅ Database tables created/verified successfully

### Test Endpoints:
Once deployed, test these URLs:
- `https://shiny-couscous-tau.vercel.app/` → Should return API info
- `https://shiny-couscous-tau.vercel.app/health` → Should return `{"status": "healthy"}`
- `https://shiny-couscous-tau.vercel.app/docs` → Should show FastAPI docs

## 6. Common Issues & Solutions

### Issue: "Configuration Settings differ"
**Solution**: This is normal if you have `vercel.json`. The `vercel.json` overrides project settings.

### Issue: Build fails with "No module named 'fastapi'"
**Solution**: 
- Check that `api/requirements.txt` exists
- Verify build logs show dependency installation
- Redeploy with cache disabled

### Issue: 500 error after deployment
**Solution**:
- Check Function Logs (not Build Logs)
- Look for error messages from `api/index.py`
- Verify environment variables are set
- Check if `DATABASE_URL` is correct

### Issue: "Backend directory not found"
**Solution**:
- Verify `vercel.json` has `functions.includeFiles: "backend/**"`
- Check that backend code is committed to GitHub
- Redeploy with fresh build

## 7. Verify File Structure

Ensure these files exist in your GitHub repo:
```
✅ /api/index.py
✅ /api/requirements.txt
✅ /backend/src/labuan_fsa/main.py
✅ /vercel.json
```

## 8. Test Checklist

After setup, verify:
- [ ] Environment variables are set
- [ ] Deployment completed successfully
- [ ] `/health` endpoint returns `{"status": "healthy"}`
- [ ] `/docs` shows FastAPI documentation
- [ ] Database tables are created (check Supabase dashboard)
- [ ] Frontend can connect to API (check browser console)

## Next Steps

1. **Set environment variables** (most important!)
2. **Redeploy** the project
3. **Check function logs** for any errors
4. **Test the `/health` endpoint**
5. **Verify tables created** in Supabase

Once these are done, your Vercel API should be working!

