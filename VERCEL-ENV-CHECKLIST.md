# ✅ Vercel Environment Variables Checklist

## 🔴 CRITICAL: Set These in Vercel NOW

### 1. DATABASE_URL (MOST IMPORTANT)
- **Key:** `DATABASE_URL`
- **Value Option 1 (Direct Connection - port 5432) - RECOMMENDED WORKAROUND:**
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```
  **Note:** Get direct connection URL from Supabase Dashboard → Database → "Connect to your project" → Method: "Direct connection"
  **Why:** Direct connection supports prepared statements (no pgbouncer limitation). Since we use NullPool in serverless, this is appropriate.
- **Value Option 2 (Connection Pooler - port 6543) - NOT WORKING YET:**
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```
  **Note:** Currently has prepared statement errors. `statement_cache_size=0` via `connect_args` isn't working with SQLAlchemy's asyncpg dialect.
  **Status:** ⚠️ Issue being investigated
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ✅ Enable (toggle ON)
- **Recommended:** Use Direct Connection (port 5432) until pooler prepared statement issue is resolved

### 2. ENVIRONMENT (CRITICAL - Forces NullPool)
- **Key:** `ENVIRONMENT`
- **Value:** `production`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ❌ Disabled
- **Why:** This forces NullPool even if serverless detection fails!

### 3. SECRET_KEY
- **Key:** `SECRET_KEY`
- **Value:** (your secret key - minimum 32 characters)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ✅ Enable (toggle ON)

### 4. APP_ENVIRONMENT (Optional but recommended)
- **Key:** `APP_ENVIRONMENT`
- **Value:** `production`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ❌ Disabled

### 5. CORS_ORIGINS (Optional)
- **Key:** `CORS_ORIGINS`
- **Value:** `https://clkhoo5211.github.io`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ❌ Disabled

## 🎯 How to Set in Vercel

1. Go to: https://vercel.com/dashboard → Your Project → **Settings** → **Environment Variables**

2. Click **"Add New"** for each variable above

3. **CRITICAL:** After adding ALL variables, you MUST:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - **IMPORTANT:** If you see "Use existing Build Cache", **UNCHECK IT**
   - This forces Vercel to pick up new environment variables

## ✅ Verification

After redeploying, check **Vercel Logs**:

Go to: **Deployments** → **Latest** → **Functions** → `api/index.py` → **Logs**

Look for:
```
🌐 Serverless environment detected:
   VERCEL=1 (or VERCEL_ENV=production, etc.)
   ENVIRONMENT=production
   APP_ENVIRONMENT=production
   Production=True
🌐 Serverless/Production environment - using NullPool for database connections
   Pool class: NullPool
   This prevents 'Errno 99' errors in serverless functions
✅ Database URL set from environment: postgresql+asyncpg://...
🔧 Initializing database...
✅ Database connection successful
✅ Database tables created/verified successfully
```

## 📝 Key Points

1. **`ENVIRONMENT=production`** is CRITICAL - it forces NullPool
2. **All variables** must be set for Production, Preview, AND Development
3. **Redeploy** after setting variables (uncheck build cache if option appears)
4. **Wait 2-3 minutes** for deployment to complete
5. **Check logs** to verify it's working

## ❌ Common Mistakes

1. ❌ Only setting variables for Production (not Preview/Development)
2. ❌ Forgetting to redeploy after setting variables
3. ❌ Not unchecking "Use existing Build Cache" when redeploying
4. ❌ Typo in DATABASE_URL (missing `+asyncpg` is OK - code converts it)
5. ❌ Not setting `ENVIRONMENT=production` (this is critical!)

## ✅ After Setting All Variables

1. ✅ Redeploy (uncheck build cache)
2. ✅ Wait 2-3 minutes
3. ✅ Check Vercel logs
4. ✅ Test: `curl https://shiny-couscous-tau.vercel.app/api/forms`
5. ✅ Should return: `[]` (empty array, not 500 error)

