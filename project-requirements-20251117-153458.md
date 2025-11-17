# 📋 Labuan FSA E-Online Submission System - Project Requirements

**Project Name**: Labuan FSA E-Submission System  
**Project ID**: `labuan-fsa-e-submission-system`  
**Created**: 2025-11-17 15:34:58  
**Status**: Init Phase  
**Version**: 0.1.0

---

## 🎯 PROJECT OVERVIEW

### Purpose
A comprehensive e-online submission system for Labuan FSA application forms that enables digital submission of all regulatory forms through a web-based interface. The system features API-driven dynamic form rendering where all form structures, fields, and properties are controlled by the Python backend, ensuring flexibility and maintainability.

### Project Scope
- Survey and extract all Labuan FSA forms from official documentation
- Build React frontend with modular, reusable components
- Develop Python backend API with PostgreSQL database
- Implement API-driven dynamic form rendering
- Create admin dashboard for form and submission management
- Package Python backend as reusable modules
- Deploy system for production use

---

## 📊 URL SURVEY & FORM EXTRACTION

### Required URLs to Survey

1. **Fee Schedule PDF**:
   - URL: https://www.labuanfsa.gov.my/clients/asset_120A5FB8-61B6-45E8-93F0-3F79F86455C8/contentms/img/documents/areas_of_business/Fee%20Schedule/2024/Annual%20Licence%20Fee%20Schedule_03012024.pdf
   - Extract: Fee structures, license types, pricing tiers, payment requirements

2. **Client Charter PDF**:
   - URL: https://www.labuanfsa.gov.my/clients/asset_120A5FB8-61B6-45E8-93F0-3F79F86455C8/contentms/img/documents/areas_of_business/Client%20Charter/2023/Client%20Charter%20Website_16032022_07082023.pdf
   - Extract: Service standards, processing timelines, client requirements, compliance obligations

3. **Legislation Page**:
   - URL: https://www.labuanfsa.gov.my/legislation-guidelines/legislation
   - Extract: Relevant laws, regulations, legal frameworks, statutory requirements

4. **Guidelines Page**:
   - URL: https://www.labuanfsa.gov.my/legislation-guidelines/guidelines
   - Extract: Application guidelines, procedural requirements, documentation standards

5. **Forms Page**:
   - URL: https://www.labuanfsa.gov.my/areas-of-business/forms
   - Extract: **ALL form types**, form fields, validation rules, required documents, submission procedures

### Extraction Requirements

**For Each Form:**
- Form ID, name, purpose, target audience
- Form structure (single-step, multi-step)
- Required sections and field groups
- Submission procedures and validation rules

**For Each Field:**
- Field name, type (text, number, date, file, select, toggle, etc.)
- Label, placeholder, help text
- Validation rules (required, min/max length, pattern, etc.)
- Conditional display logic
- Default values and options (for selects)

**For Each Form Section:**
- Grouping and ordering
- Dependencies between fields
- Display conditions
- Section validation rules

### Output Format
Structured JSON schema documenting all forms, fields, and relationships for database design and API development.

---

## 🏗️ TECHNICAL REQUIREMENTS

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hook Form or Formik
- **Build Tool**: Vite or Next.js
- **Package Manager**: npm or yarn

**Core Requirement**: **ALL DOM elements must be dynamically controlled by Python backend API responses.** Frontend should NEVER hardcode form structure, field types, or properties.

**Component Architecture:**
- Modular, reusable components for every DOM element type
- Base components: InputField, TextAreaField, SelectField, ToggleField, UploadField, DatePickerField, etc.
- Layout components: FormContainer, FormSection, FormStep, FormActions
- Composite components: DynamicForm, FormRenderer

**Reference Implementations:**
- [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - Extract React form components
- [Alibaba Formily](https://github.com/alibaba/formily) - Extract form rendering patterns

### Backend Architecture

**Technology Stack:**
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Package Management**: pyproject.toml (modern Python packaging)

**Core Requirements:**
- Packageable Python backend (wheel/egg distribution)
- TOML-based configuration (NO .env files in production)
- Secure secrets management (cloud secrets manager)
- API-driven form schema generation
- Dynamic form rendering control

**Package Structure:**
```
labuan-fsa-backend/
├── pyproject.toml
├── src/labuan_fsa/
│   ├── main.py
│   ├── config.py
│   ├── database/
│   ├── api/
│   ├── services/
│   └── admin/
```

### Database Schema

**Key Tables:**
- `forms` - Form definitions with JSONB schema data
- `form_submissions` - Form submissions with JSONB data
- `file_uploads` - File uploads linked to submissions
- `form_fields` - Field definitions for admin management

**Storage Strategy:**
- JSONB for flexible form schema storage
- Separate tables for file management
- Indexed for performance on common queries

---

## 🔒 SECURITY REQUIREMENTS

1. **Configuration Secrets**: TOML + cloud secrets manager, NEVER .env files in production
2. **API Security**: JWT authentication, rate limiting, CORS configuration
3. **Data Validation**: Server-side validation for all inputs, SQL injection prevention
4. **File Uploads**: Size limits, type validation, virus scanning (optional)
5. **Database Security**: Encrypted connections, parameterized queries, least privilege access
6. **Audit Logging**: Track all form submissions, admin actions, API access

---

## 📦 PACKAGING REQUIREMENTS

### Python Backend
- Build as Python package using `pyproject.toml`
- Support wheel distribution (`python -m build`)
- Installable via `pip install`
- Reusable across different projects

### Configuration Management
- Use TOML for configuration (config.toml)
- Secure secrets via cloud secrets manager (AWS, Azure, GCP)
- Local development via config.local.toml (gitignored)
- NO .env files in production

---

## 🎛️ ADMIN DASHBOARD REQUIREMENTS

**Features:**
- View all forms and their schemas
- View all form submissions with filtering, sorting, pagination
- Review submissions (approve, reject, add notes)
- Manage form schemas (CRUD operations)
- Export submission data (CSV, Excel, PDF)
- User authentication and authorization
- Audit logs

**Implementation Options:**
- React Admin (recommended)
- Retool (no-code, quick setup)
- Custom React Dashboard (full control)

---

## 🚀 DEPLOYMENT REQUIREMENTS

### Local Development
- Python 3.11+ virtual environment
- Node.js 18+ for frontend
- PostgreSQL 14+ database
- Docker & Docker Compose (optional)

### Production Deployment
- Docker containerization
- Cloud platform deployment (AWS/GCP/Azure)
- Managed PostgreSQL (RDS, Cloud SQL, Azure Database)
- Cloud secrets manager integration
- Load balancer and auto-scaling
- CDN for frontend static assets
- HTTPS/SSL certificates
- Monitoring and alerting

---

## ✅ ACCEPTANCE CRITERIA

1. ✅ All 5 Labuan FSA URLs surveyed and form data extracted
2. ✅ Project initialized in SDLC framework with complete requirements
3. ✅ Frontend components modularized and dynamically rendered from API
4. ✅ Backend API provides complete form schemas with all field properties
5. ✅ Python backend packaged as reusable wheel/package
6. ✅ Configuration managed via TOML + secure secrets (NO .env files)
7. ✅ PostgreSQL database stores all forms and submissions
8. ✅ Admin dashboard views all forms and submissions
9. ✅ Local development environment fully functional
10. ✅ Production deployment procedures documented and tested

---

## 📚 REFERENCE DOCUMENTATION

**Primary Reference:**
- `labuan-fsa-e-submission-prompt.md` - Complete optimized prompt with all requirements

**Reference GitHub Repositories:**
- [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - React form components
- [Alibaba Formily](https://github.com/alibaba/formily) - Form rendering patterns

---

**Document Status**: ✅ Complete  
**Next Phase**: Product Agent - Market research and product strategy  
**Last Updated**: 2025-11-17 15:34:58

