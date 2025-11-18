# 🔧 Fix Vercel 404 Errors

Your backend is returning 404 because Vercel needs a specific handler for FastAPI.

## ✅ Fix Applied

I've created:
- `backend/api/index.py` - Vercel serverless function handler
- Updated `backend/vercel.json` - Correct routing configuration

## 📝 Next Steps

### Step 1: Push the Fix to GitHub

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system

git add backend/api/index.py backend/vercel.json
git commit -m "Fix Vercel FastAPI deployment configuration"
git push origin main
```

### Step 2: Vercel Will Auto-Deploy

Since Vercel is connected to GitHub, it will automatically:
1. Detect the new commit
2. Build and deploy the backend
3. Fix the 404 errors

**Wait 1-2 minutes for deployment to complete.**

### Step 3: Test Backend Again

After deployment completes, test:

1. **Health Check:**
   ```
   https://shiny-couscous-tau.vercel.app/health
   ```

2. **API Docs:**
   ```
   https://shiny-couscous-tau.vercel.app/docs
   ```

3. **Forms Endpoint:**
   ```
   https://shiny-couscous-tau.vercel.app/api/forms
   ```

---

## ✅ Remaining Steps After Backend Works

### Step 4: Set GitHub Secret

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `VITE_API_URL`
4. **Value:** `https://shiny-couscous-tau.vercel.app`
5. Click **"Add secret"**

### Step 5: Enable GitHub Pages

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/pages
2. **Source:** Select **"GitHub Actions"**
3. Click **"Save"**

### Step 6: Run Database Migrations

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system/backend

# Set database URL (use your Supabase connection string)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Install dependencies
uv sync

# Run migrations
uv run alembic upgrade head

# Seed mock data
uv run python scripts/seed_mock_users.py
uv run python scripts/seed_sample_form.py
```

### Step 7: Trigger Frontend Deployment

After backend is working and GitHub secret is set:

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system
git commit --allow-empty -m "Trigger frontend deployment"
git push origin main
```

Or manually trigger:
- Go to: https://github.com/clkhoo5211/shiny-couscous/actions
- Click **"Deploy Frontend to GitHub Pages"**
- Click **"Run workflow"** → **"Run workflow"**

---

## 🎉 Final Result

After all steps:
- **Frontend:** https://clkhoo5211.github.io/shiny-couscous/
- **Backend:** https://shiny-couscous-tau.vercel.app/
- **API Docs:** https://shiny-couscous-tau.vercel.app/docs

---

**Push the fix now and let me know when it's deployed!** 🚀

