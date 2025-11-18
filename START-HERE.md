# 🚀 Labuan FSA E-Submission System - Quick Start

## ✅ Servers Status

- **Frontend**: ✅ Running on http://localhost:3000
- **Backend**: 🔄 Starting on http://localhost:8000

## 🌐 Open in Browser

**User Frontend**: http://localhost:3000

**Admin Dashboard**: http://localhost:3000/admin

**Backend API Docs**: http://localhost:8000/docs (wait for backend to fully start)

## 👤 Mock User Credentials

### Admin User
- **Email**: `admin@labuanfsa.gov.my`
- **Password**: `admin123`
- **Access**: Full admin dashboard, form creation, submission review

### Regular User  
- **Email**: `user@example.com`
- **Password**: `user123`
- **Access**: Form submission, view own submissions

## 📝 Quick Test Flow

### 1. Test User Flow
1. Go to http://localhost:3000
2. Click "Login" (or navigate to http://localhost:3000/login)
3. Login with: `user@example.com` / `user123`
4. Browse forms, submit applications
5. View submissions in "My Submissions"

### 2. Test Admin Flow
1. Go to http://localhost:3000/admin
2. Click "Login" (if not logged in as admin)
3. Login with: `admin@labuanfsa.gov.my` / `admin123`
4. Create new form: Admin → Forms → Create New Form
5. Review submissions: Admin → Submissions
6. View analytics: Admin → Analytics

## 🔧 Start Servers

### Quick Start (Both Servers at Once)
```bash
# From project root
chmod +x scripts/start-servers.sh  # First time only
./scripts/start-servers.sh
```

### Manual Start (Separate Terminals)

**Terminal 1 - Backend (using uv - recommended):**
```bash
cd backend
uv sync  # First time only - install dependencies
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 1 - Backend (using pip/venv - alternative):**
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python3 -m uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

> 💡 **Tip**: See `START-SERVERS.md` or `README-DEV.md` for detailed setup instructions.

## 🗄️ Database Setup (if not done)

Ensure PostgreSQL is running and create database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE labuan_fsa;

# Exit
\q

# Seed mock users (using uv)
cd backend
uv run python scripts/seed_mock_users.py

# Or using pip/venv
# source venv/bin/activate
# python3 scripts/seed_mock_users.py
```

## 📋 Next Steps

1. ✅ Servers are running
2. ✅ Open http://localhost:3000 in browser
3. ✅ Login with mock credentials
4. ✅ Create your first form as admin
5. ✅ Submit form as regular user

## 🆘 Troubleshooting

**Backend not starting?**
- Check if port 8000 is available: `lsof -i :8000`
- Check database connection in `backend/config.local.toml`
- Ensure PostgreSQL is running

**Frontend not loading?**
- Check if port 3000 is available: `lsof -i :3000`
- Reinstall dependencies: `cd frontend && npm install`

**Can't login?**
- Ensure mock users were created: `cd backend && python3 scripts/seed_mock_users.py`
- Check database connection

---

**Happy Testing! 🎉**

