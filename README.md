# Labuan FSA E-Submission System

> **Note:** All documentation has been reorganized into the [`docs/`](./docs/) directory. See [Documentation](#documentation) section below.

**Project Name**: Labuan FSA E-Online Submission System  
**Project ID**: `labuan-fsa-e-submission-system`  
**Created**: 2025-11-17 15:34:58  
**Status**: Init Phase ✅  
**Version**: 0.1.0

---

## 🎯 PROJECT OVERVIEW

A comprehensive e-online submission system for Labuan FSA application forms that enables digital submission of all regulatory forms through a web-based interface. The system features API-driven dynamic form rendering where all form structures, fields, and properties are controlled by the Python backend, ensuring flexibility and maintainability.

### Key Features

- **API-Driven Dynamic Forms**: All form structures, fields, and properties controlled by Python backend
- **Modular React Components**: Reusable, individually packaged components for every DOM element
- **Packageable Python Backend**: Backend packaged as reusable wheel/package for easy distribution
- **Secure Configuration**: TOML-based configuration with cloud secrets manager (NO .env files)
- **Admin Dashboard**: Complete admin panel for form and submission management
- **Multi-Form Support**: Support for all Labuan FSA application forms

---

## 🏗️ ARCHITECTURE

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hook Form or Formik
- **Build Tool**: Vite or Next.js

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0+
- **Package Management**: pyproject.toml

### Reference Implementations
- [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - React form components
- [Alibaba Formily](https://github.com/alibaba/formily) - Form rendering patterns

---

## 🚀 GETTING STARTED

### Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip/venv
- Node.js 18+
- PostgreSQL 14+ (or SQLite for local dev)
- Git

**Install uv (if not installed):**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pip
pip install uv
```

### Quick Start - Run Both Servers

**Option 1: Start Both Servers at Once (Recommended)**

```bash
# Make script executable (first time only)
chmod +x scripts/start-servers.sh

# Start both backend and frontend
./scripts/start-servers.sh
```

**Option 2: Start Servers Separately**

**Terminal 1 - Backend (using uv):**
```bash
cd backend

# Install dependencies (first time only)
uv sync

# Set up local configuration (first time only)
cp config.example.toml config.local.toml
# Edit config.local.toml if needed

# Initialize database and seed mock users (first time only)
uv run python scripts/seed_mock_users.py

# Run backend server
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 1 - Backend (using pip/venv - alternative):**
```bash
cd backend

# Create virtual environment (first time only)
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -e .

# Set up local configuration (first time only)
cp config.example.toml config.local.toml
# Edit config.local.toml if needed

# Initialize database and seed mock users (first time only)
python3 scripts/seed_mock_users.py

# Run backend server
python3 -m uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

### Access URLs

Once both servers are running:

- **Frontend (User Interface)**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Mock User Credentials

**Admin User:**
- Email: `admin@labuanfsa.gov.my`
- Password: `admin123`
- Access: Can create forms, review submissions, view analytics

**Regular User:**
- Email: `user@example.com`
- Password: `user123`
- Access: Can browse forms and submit applications

### First-Time Setup (Detailed)

See `README-DEV.md` for detailed setup instructions including:
- Database setup
- Configuration files
- Troubleshooting tips

---

## 📚 DOCUMENTATION

All documentation has been organized into the [`docs/`](./docs/) directory.

### Quick Links

- **[Deployment Guides](./docs/deployment/)** - Complete deployment documentation
  - [Environment Variables](./docs/deployment/environment-variables.md)
  - [Vercel Deployment](./docs/deployment/vercel-deployment.md)
  - [Supabase Database](./docs/deployment/supabase-database.md)
  - [GitHub Pages Frontend](./docs/deployment/github-pages-frontend.md)

- **[Troubleshooting Guides](./docs/troubleshooting/)** - Common issues and solutions
  - [Database Connection Issues](./docs/troubleshooting/database-connection.md)
  - [Prepared Statement Errors](./docs/troubleshooting/prepared-statements.md)
  - [CORS Issues](./docs/troubleshooting/cors-issues.md)
  - [Auto-Deploy Issues](./docs/troubleshooting/auto-deploy.md)

### Project Documentation

- **Complete Requirements**: See `labuan-fsa-e-submission-prompt.md`
- **Project Requirements**: See `project-requirements-20251117-153458.md`
- **Resource Links**: See `resource-links-20251117-153458.md`
- **Change Log**: See `change-log.md`
- **SDLC Coordination**: See `CLAUDE.md`

### Key Requirements

1. **API-Driven Rendering**: ALL DOM elements controlled by Python backend API responses
2. **Python Packaging**: Backend packaged as reusable wheel/package
3. **Secure Configuration**: TOML + cloud secrets manager (NO .env files)
4. **Component Modularity**: Every DOM element as individual, reusable component
5. **Reference Components**: Extract and adapt from OpenMRS Form Builder and Alibaba Formily

### Security Note

**⚠️ No credentials are stored in documentation files.** All sensitive values use placeholders like:
- `[YOUR-PASSWORD]` - Database password
- `[PROJECT-REF]` - Supabase project reference
- `[REGION]` - AWS region for Supabase

---

## 🔒 SECURITY

- **Configuration Secrets**: TOML + cloud secrets manager, NEVER .env files in production
- **API Security**: JWT authentication, rate limiting, CORS configuration
- **Data Validation**: Server-side validation for all inputs, SQL injection prevention
- **File Uploads**: Size limits, type validation
- **Database Security**: Encrypted connections, parameterized queries

---

## 📊 PROJECT STATUS

**Current Phase**: Develop In Progress (75% Complete) → Core System Functional

**Agent Progress**:
- ✅ Init Agent - Complete
- ⏳ Product Agent - Pending
- ✅ Plan Agent - Complete
- ✅ UX Agent - Complete
- ✅ Design Agent - Complete
- ✅ Data Agent - Complete
- 🔄 Develop Agent - In Progress (75% Complete)
- ⏳ DevOps Agent - Pending
- ⏳ Security Agent - Pending
- ⏳ Compliance Agent - Pending
- ⏳ Test Agent - Pending
- ⏳ Debug Agent - Pending
- ⏳ Audit Agent - Pending
- ⏳ Deploy Agent - Pending

**System Status**:
- ✅ Core system functional and ready for use
- ✅ Admins can create forms using visual builder
- ✅ Users can submit forms with full validation
- ✅ All form field types (85+) implemented
- ✅ Responsive design (mobile + web)

---

## 🔗 USEFUL LINKS

- **Project Prompt**: `labuan-fsa-e-submission-prompt.md`
- **Requirements**: `project-requirements-20251117-153458.md`
- **Resources**: `resource-links-20251117-153458.md`
- **SDLC Coordination**: `CLAUDE.md`

---

**Maintained By**: Multi-Agent SDLC Framework  
**Last Updated**: 2025-11-17 15:34:58

