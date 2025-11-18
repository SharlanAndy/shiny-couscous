# Vercel Deployment Checklist

## Current Status
- ✅ `api/index.py` - Entry point created
- ✅ `api/requirements.txt` - Dependencies file created
- ✅ `vercel.json` - Configuration file created
- ⚠️ Still getting 500 errors

## Next Steps to Debug

### 1. Check Vercel Deployment Logs
Go to: https://vercel.com/dashboard → Your Project → Latest Deployment → Functions Tab

Look for:
- Build logs showing dependency installation
- Runtime logs showing the debug output from `api/index.py`
- Any new error messages after dependencies are installed

### 2. Verify Deployment Completed
- Check if the latest deployment shows "Ready" status
- Wait 2-3 minutes after pushing changes for deployment to complete
- Check build logs to see if `requirements.txt` was found and dependencies installed

### 3. Common Issues After Dependencies Install

#### Issue: Path Resolution
**Symptom**: `ModuleNotFoundError: No module named 'labuan_fsa'`
**Fix**: Check if `backend/src` directory is accessible in Vercel's file structure

#### Issue: Configuration Loading
**Symptom**: `FileNotFoundError: config.local.toml` or config loading errors
**Fix**: Ensure environment variables are set, or config falls back to defaults

#### Issue: Database Connection
**Symptom**: Database initialization errors
**Fix**: 
- Set `DATABASE_URL` environment variable in Vercel
- Verify Supabase connection string is correct
- Check if database allows connections from Vercel's IPs

### 4. Environment Variables Needed
In Vercel Dashboard → Settings → Environment Variables, ensure these are set:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=[generate a random secret key]
ENVIRONMENT=production
CORS_ORIGINS=https://clkhoo5211.github.io
```

### 5. Test Locally First
Before deploying, test the entry point locally:
```bash
cd api
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python index.py
```

### 6. Check Vercel Function Logs
The debug output in `api/index.py` should print:
- Current directory paths
- Whether backend/src directories exist
- Import status
- Any errors

These will appear in Vercel's function logs (not build logs).

## If Still Failing

1. **Check Build Logs**: See if dependencies were installed successfully
2. **Check Function Logs**: See the runtime error after dependencies are installed
3. **Verify File Structure**: Ensure `backend/src/labuan_fsa/` is accessible
4. **Test Minimal Version**: Create a minimal `api/index.py` that just returns "Hello" to verify Vercel setup works

