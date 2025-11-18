# Labuan FSA E-Submission System - Local Development Setup

## Quick Start

### Prerequisites
- Python 3.11+ 
- [uv](https://github.com/astral-sh/uv) (recommended) or pip/venv
- Node.js 18+
- PostgreSQL 14+ (running locally or via Docker)

**Install uv (if not installed):**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pip
pip install uv
```

### 1. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE labuan_fsa;

# Exit psql
\q
```

### 2. Backend Setup

**Using uv (recommended):**
```bash
cd backend

# Install dependencies
uv sync

# Create local config (if not exists)
cp config.example.toml config.local.toml

# Initialize database and create mock users
uv run python scripts/seed_mock_users.py
```

**Using pip/venv (alternative):**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Create local config (if not exists)
cp config.example.toml config.local.toml

# Initialize database and create mock users
python3 scripts/seed_mock_users.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Servers

**Option A: Start separately**

Terminal 1 - Backend (using uv):
```bash
cd backend
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 1 - Backend (using pip/venv):
```bash
cd backend
source venv/bin/activate  # Activate virtual environment first
python3 -m uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option B: Start both at once**

```bash
./scripts/start-dev.sh
```

## Access URLs

- **Frontend (User)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Mock Credentials

### Admin User
- **Email**: `admin@labuanfsa.gov.my`
- **Password**: `admin123`
- **Role**: Admin (can access `/admin` pages)

### Regular User
- **Email**: `user@example.com`
- **Password**: `user123`
- **Role**: User (can submit forms, view submissions)

## Testing the System

1. **User Flow**:
   - Go to http://localhost:3000
   - Click "Login"
   - Login as user: `user@example.com` / `user123`
   - Browse forms and submit applications

2. **Admin Flow**:
   - Go to http://localhost:3000/admin
   - Click "Login" (if needed)
   - Login as admin: `admin@labuanfsa.gov.my` / `admin123`
   - Create new forms, review submissions, view analytics

## Troubleshooting

### Backend Issues

**Database connection error**:
- Ensure PostgreSQL is running
- Check `backend/config.local.toml` database URL
- Default: `postgresql+asyncpg://postgres:postgres@localhost:5432/labuan_fsa`

**Port 8000 already in use**:
- Change port in `backend/config.local.toml` under `[server]` section
- Or kill process using port 8000: `lsof -ti:8000 | xargs kill`

**Import errors (using uv)**:
- Reinstall: `uv sync`

**Import errors (using pip/venv)**:
- Make sure you're in a virtual environment
- Reinstall: `pip install -e .`

### Frontend Issues

**Port 3000 already in use**:
- Vite will automatically use next available port
- Or change in `frontend/vite.config.ts`

**API connection errors**:
- Ensure backend is running on http://localhost:8000
- Check browser console for CORS errors
- Verify `frontend/src/api/client.ts` base URL

**Module not found errors**:
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Next Steps

- Create your first form via Admin → Forms → Create New Form
- Test form submission as a regular user
- Review submissions as an admin

For production deployment, see `docs/deployment/` directory.

