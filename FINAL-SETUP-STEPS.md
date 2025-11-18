# 🎯 Final Setup Steps

Your Vercel backend is live at: **https://shiny-couscous-tau.vercel.app/**

## ✅ What's Done

- ✅ Code pushed to GitHub
- ✅ Backend deployed to Vercel
- ✅ Environment variables set in Vercel

## ⏭️ What's Left (5 Steps)

### Step 1: Test Backend ✅

Test your backend endpoints:

1. **Health Check:**
   ```
   https://shiny-couscous-tau.vercel.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **API Docs:**
   ```
   https://shiny-couscous-tau.vercel.app/docs
   ```
   Should show FastAPI Swagger UI

3. **Forms Endpoint:**
   ```
   https://shiny-couscous-tau.vercel.app/api/forms
   ```
   Should return forms (may be empty `[]` initially)

---

### Step 2: Run Database Migrations ✅

Connect to Supabase and run migrations:

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

**After migrations:**
- Check Supabase dashboard → Table Editor
- You should see tables: `forms`, `form_submissions`, `users`, etc.
- Test API: `https://shiny-couscous-tau.vercel.app/api/forms` should return forms

---

### Step 3: Set GitHub Secret ✅

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions

2. Click **"New repository secret"**

3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://shiny-couscous-tau.vercel.app`
   - Click **"Add secret"**

**This tells GitHub Actions what backend URL to use when building the frontend.**

---

### Step 4: Enable GitHub Pages ✅

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/pages

2. Under **Source**, select **"GitHub Actions"**

3. Click **"Save"**

**This enables GitHub Pages and allows the frontend to be deployed.**

---

### Step 5: Trigger Frontend Deployment ✅

After setting the GitHub secret and enabling Pages:

1. **Option A: Push a commit** (recommended)
   ```bash
   cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system
   git commit --allow-empty -m "Trigger frontend deployment"
   git push origin main
   ```

2. **Option B: Manual workflow trigger**
   - Go to: https://github.com/clkhoo5211/shiny-couscous/actions
   - Click on **"Deploy Frontend to GitHub Pages"** workflow
   - Click **"Run workflow"** → **"Run workflow"**

**GitHub Actions will automatically:**
- Build frontend with `VITE_API_URL` set to your Vercel URL
- Deploy to GitHub Pages
- Make available at: https://clkhoo5211.github.io/shiny-couscous/

---

## ✅ Verification Checklist

- [ ] Backend health check works: `/health`
- [ ] Backend API docs work: `/docs`
- [ ] Database migrations run successfully
- [ ] Supabase tables created
- [ ] Mock data seeded
- [ ] GitHub secret `VITE_API_URL` set
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Frontend deployment triggered
- [ ] Frontend accessible at: https://clkhoo5211.github.io/shiny-couscous/

---

## 🎉 When Everything is Done

Your full deployment will be:

- **Frontend:** https://clkhoo5211.github.io/shiny-couscous/
- **Backend API:** https://shiny-couscous-tau.vercel.app/
- **API Docs:** https://shiny-couscous-tau.vercel.app/docs
- **Database:** Supabase (your project)

---

## 🐛 Troubleshooting

### Backend not working?
- Check Vercel deployment logs
- Verify environment variables are set
- Check database migrations ran

### Frontend not deploying?
- Check GitHub Actions logs
- Verify `VITE_API_URL` secret is set
- Verify GitHub Pages is enabled

### Database connection errors?
- Check `DATABASE_URL` in Vercel environment variables
- Verify migrations ran successfully
- Check Supabase database is running

---

**Next:** Let's test your backend and complete the remaining steps! 🚀

