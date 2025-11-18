# Vercel Deployment Setup Note

## Current Status
The backend is configured to deploy to Vercel, but **Vercel needs to be configured in the Vercel Dashboard** to point to the `backend/` directory as the root directory.

## Fix Required in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `shiny-couscous`
3. Go to **Settings** → **General**
4. Find **Root Directory**
5. Set it to: `backend`
6. Save changes

This tells Vercel to:
- Look for `vercel.json` in `backend/` directory
- Use `backend/` as the base for all paths
- Run `pip install -r requirements.txt` from `backend/` directory
- Find `api/index.py` at `backend/api/index.py`

## Alternative: Move vercel.json to Root

If you prefer to keep the root directory as `/`, you can:
1. Move `backend/vercel.json` to root `vercel.json`
2. Update paths in `vercel.json` to point to `backend/api/index.py`
3. Update `installCommand` to `cd backend && pip install -r requirements.txt`

## Current Configuration

- **Vercel Entry Point**: `backend/api/index.py`
- **Vercel Config**: `backend/vercel.json`
- **Backend Code**: `backend/src/labuan_fsa/`
- **Requirements**: `backend/requirements.txt`

## After Fix

After setting the root directory in Vercel:
1. Trigger a new deployment (or push a commit)
2. Check deployment logs in Vercel dashboard
3. Test: `https://shiny-couscous-tau.vercel.app/health`

