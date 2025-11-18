# Vercel Debug Steps - Current 500 Error

## 🔴 Current Status: 500 Internal Server Error

The API is returning `FUNCTION_INVOCATION_FAILED` error.

## 🔍 How to Check Vercel Logs

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `shiny-couscous`

2. **Check Latest Deployment**
   - Click on **Deployments** tab
   - Click on the latest deployment (top of list)

3. **View Function Logs**
   - Click on **Functions** tab (or **Runtime Logs**)
   - Look for error messages
   - Search for debug output from `api/index.py`:
     - 🔍 Vercel Entry Point Debug
     - ✅ Added backend/src to Python path
     - ❌ Any ImportError or other errors

4. **Check Build Logs**
   - Click on **Build Logs** tab
   - Look for dependency installation
   - Check if `api/requirements.txt` was found and installed

### Method 2: Vercel CLI (Local Testing)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Test locally (will use your local code but simulate Vercel environment)
cd /path/to/project
vercel dev
```

This will show you the actual errors in real-time.

## 🐛 Common Causes of 500 Errors

### 1. Missing Environment Variables

**Check**: Go to Settings → Environment Variables

**Required**:
- `DATABASE_URL` - Supabase connection string
- `SECRET_KEY` - Random secret key
- `ENVIRONMENT` - Should be `production`
- `CORS_ORIGINS` - Your frontend URL

**Solution**: Set all required environment variables

### 2. Dependencies Not Installing

**Check**: Build Logs → Look for `pip install` output

**Possible Issues**:
- `api/requirements.txt` not found
- Python version mismatch
- Dependency conflict

**Solution**: 
- Verify `api/requirements.txt` exists in root
- Check Python version in Vercel settings

### 3. Backend Code Not Accessible

**Check**: Function Logs → Look for "backend directory not found"

**Possible Issues**:
- `functions.includeFiles` not working
- Backend code not in deployment
- Path resolution failing

**Solution**: 
- Verify `vercel.json` has `functions.includeFiles: "backend/**"`
- Check that all backend files are committed to GitHub
- Verify file structure in deployment

### 4. Database Connection Failing

**Check**: Function Logs → Look for database connection errors

**Possible Issues**:
- `DATABASE_URL` not set
- Incorrect connection string
- Supabase firewall blocking Vercel IPs

**Solution**: 
- Verify `DATABASE_URL` format
- Check Supabase settings → Network → Allow Vercel IPs
- Test connection string locally

### 5. Import Errors

**Check**: Function Logs → Look for `ModuleNotFoundError` or `ImportError`

**Possible Issues**:
- Python path not set correctly
- Backend code not accessible
- Missing dependencies

**Solution**: 
- Check debug output from `api/index.py`
- Verify backend directory structure
- Ensure all imports are correct

## 🔧 Quick Fix Checklist

1. ✅ **Environment Variables Set?**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all required vars are set for Production

2. ✅ **Latest Code Deployed?**
   - Check GitHub → Verify latest commit is pushed
   - Trigger new deployment in Vercel

3. ✅ **File Structure Correct?**
   - Verify `api/index.py` exists
   - Verify `api/requirements.txt` exists
   - Verify `backend/src/labuan_fsa/` exists
   - Verify `vercel.json` exists at root

4. ✅ **Check Function Logs**
   - Vercel Dashboard → Latest Deployment → Functions
   - Look for actual error messages
   - Share the error with me so I can help fix it

## 📋 What to Share for Debugging

If the error persists, share these from Vercel Dashboard:

1. **Function Logs** (Latest Deployment → Functions Tab)
   - Copy the error messages
   - Include debug output from `api/index.py`

2. **Build Logs** (Latest Deployment → Build Logs Tab)
   - Show dependency installation output
   - Any warnings or errors

3. **Environment Variables** (Settings → Environment Variables)
   - List which ones are set (don't share values)
   - Which environments they're set for

4. **Deployment Status**
   - Is deployment successful or failed?
   - Any warnings shown?

## 🎯 Next Steps

1. **Check Vercel Function Logs** (most important!)
2. **Share the error messages** you see
3. **Verify environment variables** are set
4. **Check if backend code is accessible** in logs

Once you share the actual error from the logs, I can provide a specific fix!

