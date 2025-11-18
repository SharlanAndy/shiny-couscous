# 🚀 Start Development Servers

## Quick Start - Run Both Servers

### Option 1: Start Both at Once (Recommended)

```bash
# From project root directory
chmod +x scripts/start-servers.sh  # First time only
./scripts/start-servers.sh
```

This script will:
- ✅ Start backend on http://localhost:8000
- ✅ Start frontend on http://localhost:3000
- ✅ Auto-open browser tabs (macOS)
- ✅ Handle cleanup on Ctrl+C

### Option 2: Start Separately

**Terminal 1 - Backend (using uv - recommended):**
```bash
cd backend

# Install dependencies (first time only)
uv sync

# Run backend server
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 1 - Backend (using pip/venv - alternative):**
```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run backend server
python3 -m uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**  
```bash
cd frontend

# Run frontend development server
npm run dev
```

## Access URLs

Once servers are running:

- **Frontend (User Interface)**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Mock User Credentials

**Admin User:**
- Email: `admin@labuanfsa.gov.my`
- Password: `admin123`
- Access: Can create forms, review submissions, view analytics

**Regular User:**
- Email: `user@example.com`
- Password: `user123`
- Access: Can browse forms and submit applications

## First-Time Setup

If this is your first time running the project:

**Using uv (recommended):**
```bash
# 1. Backend setup
cd backend
uv sync  # Install dependencies

# 2. Create config file
cp config.example.toml config.local.toml

# 3. Initialize database and seed mock users
uv run python scripts/seed_mock_users.py

# 4. Frontend setup
cd ../frontend
npm install
```

**Using pip/venv (alternative):**
```bash
# 1. Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .

# 2. Create config file
cp config.example.toml config.local.toml

# 3. Initialize database and seed mock users
python3 scripts/seed_mock_users.py

# 4. Frontend setup
cd ../frontend
npm install
```

## Troubleshooting

### Backend Issues

**Database connection error:**
- Ensure PostgreSQL is running (or using SQLite for local dev)
- Check `backend/config.local.toml` database URL
- Default SQLite: Uses `labuan_fsa.db` in backend directory
- Default PostgreSQL: `postgresql+asyncpg://postgres:postgres@localhost:5432/labuan_fsa`

**Port 8000 already in use:**
- Kill process: `lsof -ti:8000 | xargs kill` (macOS/Linux)
- Or change port in `backend/config.local.toml`

**Import errors:**
- Make sure virtual environment is activated
- Reinstall: `pip install -e .`

### Frontend Issues

**Port 3000 already in use:**
- Vite will automatically use next available port
- Check console for actual port number

**API connection errors:**
- Ensure backend is running on http://localhost:8000
- Check browser console for CORS errors
- Verify `frontend/src/api/client.ts` base URL

**Module not found:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Stopping Servers

- **If using start script**: Press `Ctrl+C` to stop both servers
- **If running separately**: Press `Ctrl+C` in each terminal
