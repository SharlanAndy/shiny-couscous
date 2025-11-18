# 🎯 Optimized Prompt: Labuan FSA E-Online Submission System

## PROMPT PURPOSE
Initiate a comprehensive e-online submission system project within the Multi-Agent SDLC Framework. Survey Labuan FSA documentation, extract form requirements, initialize project foundation, and provide detailed implementation instructions for API-driven frontend rendering with Python backend packaged as reusable modules.

---

## 🎭 TARGET AUDIENCE
**All SDLC Agents** (Init, Product, Plan, UX, Design, Data, Develop, DevOps, Security, Compliance, Test, Debug, Audit, Deploy)

**Primary Target**: Init Agent (project bootstrap)  
**Secondary Targets**: Product Agent (market research), Plan Agent (roadmap), Design Agent (architecture), Develop Agent (implementation), DevOps Agent (deployment)

---

## 📋 CORE OBJECTIVES

### 1. URL Survey & Form Extraction
Survey and scrape the following Labuan FSA URLs to extract **ALL** application forms, fields, requirements, and data structures:

**Required URLs:**
1. **Fee Schedule PDF**: https://www.labuanfsa.gov.my/clients/asset_120A5FB8-61B6-45E8-93F0-3F79F86455C8/contentms/img/documents/areas_of_business/Fee%20Schedule/2024/Annual%20Licence%20Fee%20Schedule_03012024.pdf
   - Extract: Fee structures, license types, pricing tiers, payment requirements
   
2. **Client Charter PDF**: https://www.labuanfsa.gov.my/clients/asset_120A5FB8-61B6-45E8-93F0-3F79F86455C8/contentms/img/documents/areas_of_business/Client%20Charter/2023/Client%20Charter%20Website_16032022_07082023.pdf
   - Extract: Service standards, processing timelines, client requirements, compliance obligations
   
3. **Legislation Page**: https://www.labuanfsa.gov.my/legislation-guidelines/legislation
   - Extract: Relevant laws, regulations, legal frameworks, statutory requirements
   
4. **Guidelines Page**: https://www.labuanfsa.gov.my/legislation-guidelines/guidelines
   - Extract: Application guidelines, procedural requirements, documentation standards
   
5. **Forms Page**: https://www.labuanfsa.gov.my/areas-of-business/forms
   - Extract: **ALL form types**, form fields, validation rules, required documents, submission procedures

**Extraction Requirements:**
- For each form: Identify form ID, name, purpose, target audience
- For each field: Extract field name, type (text, number, date, file, select, toggle, etc.), label, placeholder, validation rules, required status, conditional logic
- For each form section: Identify grouping, ordering, dependencies, display conditions
- Document all: Data types, field constraints, file upload requirements, multi-step form flows

**Output Format**: Structured JSON schema documenting all forms, fields, and relationships for database design and API development.

---

### 2. SDLC Framework Project Initiation

**Project Name**: `labuan-fsa-e-submission-system`

**Init Agent Tasks:**
1. Create project directory: `projects/project-YYYYMMDD-HHMMSS-labuan-fsa-e-submission-system/`
2. Copy `CLAUDE-TEMPLATE.md` to project directory as `CLAUDE.md`
3. Initialize Git repository in project directory
4. Create comprehensive `project-requirements-YYYYMMDD-HHMMSS.md` including:
   - All extracted form data from URL survey
   - Technical requirements (React, Python, PostgreSQL)
   - API-driven rendering requirements
   - Packaging requirements
   - Configuration management requirements
   - Admin dashboard requirements
   - Local development setup
   - Production deployment procedures

5. Generate `resource-links-YYYYMMDD-HHMMSS.md` with research on:
   - React component modularization patterns
   - API-driven form rendering architectures
   - Python packaging best practices (pyproject.toml, wheel, build)
   - Secure configuration management (TOML, secrets management)
   - PostgreSQL schema design for dynamic forms
   - FastAPI/Python backend frameworks
   - Admin dashboard frameworks (React admin, etc.)
   - Deployment strategies (Docker, cloud hosting)
   - **Reference Implementations** (GitHub repositories):
     - [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - React form builder microfrontend with interactive schema editor and visual preview
     - [Alibaba Formily](https://github.com/alibaba/formily) - Enterprise-grade form solution framework with dynamic form rendering capabilities

6. Update project `CLAUDE.md` with complete context for all subsequent agents

**Framework Integration Points:**
- Reference master `.claude/` agent definitions
- Follow `CLAUDE-TEMPLATE.md` structure
- Update `project-registry.md` with new project entry
- Set as active project in `active-project.md`

---

### 3. FRONTEND ARCHITECTURE: API-Driven Dynamic DOM Rendering

**Core Requirement**: **ALL DOM elements must be dynamically controlled by Python backend API responses.** Frontend should NEVER hardcode form structure, field types, or properties.

**Reference Implementations for Component Extraction:**
The Develop Agent should reference and potentially extract components from these GitHub repositories:
- **[OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder)**: React form builder microfrontend that uses React form engine to render visual form previews dynamically. Provides interactive schema editor and JSON code editor. Components can be adapted for API-driven form rendering.
- **[Alibaba Formily](https://github.com/alibaba/formily)**: Enterprise-grade form solution framework with powerful dynamic form rendering capabilities. Supports form schema-driven rendering, field management, validation, and complex form scenarios. TypeScript-based with React/Vue support.

**Note**: The Develop Agent should analyze these repositories and extract reusable patterns, component structures, and form rendering logic that align with our API-driven architecture. Components should be adapted to work with Python backend API responses rather than hardcoded schemas.

**React Component Architecture:**

#### 3.1 Modular Component Library
Create individual, reusable components for every DOM element type:

**Base Components** (`src/components/base/`):
- `InputField.tsx` - Text, number, email, password, tel, url, date, datetime-local, time, month, week, search, color
- `TextAreaField.tsx` - Multi-line text input with configurable rows
- `SelectField.tsx` - Single/multi-select dropdown with search, grouping, async loading
- `ToggleField.tsx` - Checkbox, radio buttons, switch/toggle
- `UploadField.tsx` - File upload (single/multiple, drag-drop, preview, progress)
- `DatePickerField.tsx` - Date/datetime selection with calendar
- `RichTextField.tsx` - WYSIWYG editor (optional, configurable)
- `FieldGroup.tsx` - Container for grouped fields (sections, tabs, accordion)
- `FieldValidation.tsx` - Real-time validation display (errors, warnings, hints)
- `FieldLabel.tsx` - Configurable label (required indicator, tooltip, help text)

**Layout Components** (`src/components/layout/`):
- `FormContainer.tsx` - Main form wrapper with API integration
- `FormSection.tsx` - Section wrapper (collapsible, conditional display)
- `FormStep.tsx` - Multi-step form navigation component
- `FormActions.tsx` - Submit, reset, cancel buttons

**Composite Components** (`src/components/forms/`):
- `DynamicForm.tsx` - Main form component that fetches form schema from API and renders dynamically
- `FormRenderer.tsx` - Recursive component renderer that interprets API schema and instantiates base components

**Component Props Structure** (All components must accept):
```typescript
interface BaseFieldProps {
  // API-provided configuration
  fieldId: string;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  
  // API-provided styling
  className?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  
  // API-provided behavior
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  conditionalDisplay?: ConditionalRule[];
  
  // API-provided metadata
  helpText?: string;
  tooltip?: string;
  errorMessage?: string;
  
  // Event handlers (connected to form state)
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}
```

#### 3.2 API Integration Architecture

**Form Schema API Endpoints** (Python backend provides):

1. **GET `/api/forms`** - List all available forms
   ```json
   {
     "forms": [
       {
         "formId": "form-a",
         "name": "Form A: License Application",
         "description": "Application for new business license",
         "version": "1.0.0",
         "steps": 3,
         "estimatedTime": "30 minutes"
       }
     ]
   }
   ```

2. **GET `/api/forms/{formId}/schema`** - Get complete form schema
   ```json
   {
     "formId": "form-a",
     "formName": "Form A: License Application",
     "version": "1.0.0",
     "steps": [
       {
         "stepId": "step-1",
         "stepName": "Business Information",
         "stepOrder": 1,
         "fields": [
           {
             "fieldId": "company-name",
             "fieldType": "input",
             "inputType": "text",
             "fieldName": "companyName",
             "label": "Company Name",
             "placeholder": "Enter your company name",
             "required": true,
             "validation": [
               {
                 "type": "required",
                 "message": "Company name is required"
               },
               {
                 "type": "minLength",
                 "value": 3,
                 "message": "Company name must be at least 3 characters"
               },
               {
                 "type": "maxLength",
                 "value": 255,
                 "message": "Company name cannot exceed 255 characters"
               }
             ],
             "className": "w-full px-4 py-2 border border-gray-300 rounded-md",
             "containerClassName": "mb-4",
             "helpText": "Enter the registered company name",
             "conditionalDisplay": []
           },
           {
             "fieldId": "license-type",
             "fieldType": "select",
             "fieldName": "licenseType",
             "label": "License Type",
             "required": true,
             "options": [
               {"value": "type-a", "label": "Type A - Banking"},
               {"value": "type-b", "label": "Type B - Insurance"},
               {"value": "type-c", "label": "Type C - Investment"}
             ],
             "className": "w-full px-4 py-2 border border-gray-300 rounded-md",
             "validation": [
               {"type": "required", "message": "Please select a license type"}
             ]
           },
           {
             "fieldId": "upload-certificate",
             "fieldType": "upload",
             "fieldName": "certificate",
             "label": "Upload Certificate",
             "required": true,
             "accept": ".pdf,.jpg,.png",
             "maxSize": 5242880,
             "multiple": false,
             "className": "border-2 border-dashed border-gray-300 rounded-lg p-6",
             "validation": [
               {"type": "required", "message": "Certificate file is required"},
               {"type": "fileType", "value": ["pdf", "jpg", "png"], "message": "Only PDF, JPG, PNG files allowed"},
               {"type": "maxSize", "value": 5242880, "message": "File size cannot exceed 5MB"}
             ]
           }
         ]
       }
     ],
     "submitEndpoint": "/api/forms/{formId}/submit",
     "validationEndpoint": "/api/forms/{formId}/validate"
   }
   ```

3. **POST `/api/forms/{formId}/validate`** - Server-side validation
   ```json
   {
     "fieldId": "company-name",
     "value": "Test Company",
     "valid": true,
     "errors": []
   }
   ```

4. **POST `/api/forms/{formId}/submit`** - Form submission
   ```json
   {
     "formId": "form-a",
     "data": {
       "companyName": "Test Company",
       "licenseType": "type-a",
       "certificate": "base64-encoded-file-data"
     },
     "submissionId": "sub-123456",
     "status": "submitted",
     "message": "Form submitted successfully"
   }
   ```

**Frontend Implementation**:
- `DynamicForm` component fetches schema from `/api/forms/{formId}/schema`
- `FormRenderer` recursively renders fields based on API schema
- Each field component reads all properties (type, label, placeholder, CSS, validation) from API response
- Form state management: React Hook Form or Formik integrated with API validation
- File uploads: Convert to base64 or use multipart/form-data as specified by API

#### 3.3 Styling Requirements
- **Framework**: Tailwind CSS
- **CSS Classes**: Provided by API in `className` and `containerClassName` fields
- **Inline Styles**: Supported via `style` and `containerStyle` fields from API
- **Theme Support**: Components must accept theme configuration from API
- **Responsive Design**: All components must be mobile-responsive (API may provide responsive class variants)

---

### 4. BACKEND ARCHITECTURE: Python API with PostgreSQL

#### 4.1 Python Package Structure (Packageable/Reusable)

**Project Structure**:
```
labuan-fsa-backend/
├── pyproject.toml                 # Modern Python packaging config (NO setup.py)
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   └── labuan_fsa/
│       ├── __init__.py
│       ├── main.py                # FastAPI application entry point
│       ├── config.py              # Configuration management (TOML-based)
│       ├── database/
│       │   ├── __init__.py
│       │   ├── models.py          # SQLAlchemy models
│       │   ├── schemas.py         # Pydantic schemas
│       │   └── session.py         # Database session management
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes/
│       │   │   ├── __init__.py
│       │   │   ├── forms.py       # Form schema endpoints
│       │   │   ├── submissions.py # Submission endpoints
│       │   │   └── admin.py       # Admin dashboard endpoints
│       │   └── dependencies.py    # FastAPI dependencies
│       ├── services/
│       │   ├── __init__.py
│       │   ├── form_service.py    # Form schema generation logic
│       │   ├── validation_service.py
│       │   └── submission_service.py
│       ├── utils/
│       │   ├── __init__.py
│       │   └── validators.py
│       └── admin/
│           ├── __init__.py
│           └── dashboard.py       # Admin dashboard logic
├── tests/
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_services.py
│   └── test_models.py
├── docs/
│   └── api.md
└── scripts/
    ├── init_db.py
    └── migrate_db.py
```

**pyproject.toml Configuration** (Modern Python packaging):
```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "labuan-fsa-backend"
version = "0.1.0"
description = "Labuan FSA E-Submission System Backend API"
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
keywords = ["labuan", "fsa", "submission", "api"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.12.0",
    "psycopg2-binary>=2.9.9",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-multipart>=0.0.6",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-dotenv>=1.0.0",  # For local dev only, NOT for production
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "black>=23.11.0",
    "ruff>=0.1.6",
    "mypy>=1.7.0",
]

[project.scripts]
labuan-fsa-api = "labuan_fsa.main:main"

[tool.setuptools]
packages = ["labuan_fsa"]

[tool.setuptools.package-data]
labuan_fsa = ["py.typed"]

[tool.black]
line-length = 100
target-version = ['py311']

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
```

**Build Commands**:
```bash
# Install build tools
pip install build twine

# Build package (creates .whl and .tar.gz in dist/)
python -m build

# Install locally (for development)
pip install -e .

# Install from wheel
pip install dist/labuan_fsa_backend-0.1.0-py3-none-any.whl

# Publish to PyPI (when ready)
twine upload dist/*
```

#### 4.2 Configuration Management (TOML-Based, NO .env files)

**config.toml** (Version-controlled template, NO secrets):
```toml
[app]
name = "Labuan FSA E-Submission API"
version = "0.1.0"
debug = false
environment = "production"  # production, staging, development

[server]
host = "0.0.0.0"
port = 8000
reload = false
workers = 4

[database]
driver = "postgresql+psycopg2"
host = "localhost"
port = 5432
database = "labuan_fsa_db"
pool_size = 20
max_overflow = 10
pool_pre_ping = true
echo = false

# Database credentials loaded from secure storage (see below)
# db_user and db_password are loaded from environment or secrets manager

[security]
secret_key = ""  # Loaded from secure storage
algorithm = "HS256"
access_token_expire_minutes = 30
password_hash_algorithm = "bcrypt"

[cors]
allowed_origins = ["http://localhost:3000", "https://your-domain.com"]
allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
allowed_headers = ["*"]
allow_credentials = true

[file_upload]
max_file_size_mb = 10
allowed_extensions = [".pdf", ".jpg", ".png", ".doc", ".docx"]
upload_directory = "./uploads"

[admin]
dashboard_enabled = true
admin_username = ""  # Loaded from secure storage
admin_password_hash = ""  # Loaded from secure storage
```

**config.py** (Secure configuration loader):
```python
import os
from pathlib import Path
import tomllib  # Python 3.11+
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import boto3  # For AWS Secrets Manager (optional)
from azure.keyvault.secrets import SecretClient  # For Azure Key Vault (optional)

class Settings(BaseSettings):
    """Application settings with secure secret management."""
    
    model_config = SettingsConfigDict(
        env_file=None,  # Explicitly disable .env files
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )
    
    # Load base config from TOML
    _config_path = Path(__file__).parent.parent / "config.toml"
    _base_config: dict = {}
    
    if _config_path.exists():
        with open(_config_path, "rb") as f:
            _base_config = tomllib.load(f)
    
    # App settings
    app_name: str = Field(default=_base_config.get("app", {}).get("name", "Labuan FSA API"))
    app_version: str = Field(default=_base_config.get("app", {}).get("version", "0.1.0"))
    debug: bool = Field(default=_base_config.get("app", {}).get("debug", False))
    environment: str = Field(default=_base_config.get("app", {}).get("environment", "production"))
    
    # Server settings
    server_host: str = Field(default=_base_config.get("server", {}).get("host", "0.0.0.0"))
    server_port: int = Field(default=_base_config.get("server", {}).get("port", 8000))
    
    # Database settings (from TOML + secure storage)
    db_driver: str = Field(default=_base_config.get("database", {}).get("driver", "postgresql+psycopg2"))
    db_host: str = Field(default=_base_config.get("database", {}).get("host", "localhost"))
    db_port: int = Field(default=_base_config.get("database", {}).get("port", 5432))
    db_database: str = Field(default=_base_config.get("database", {}).get("database", "labuan_fsa_db"))
    db_user: str = Field(default_factory=lambda: Settings._get_secret("DB_USER") or "")
    db_password: str = Field(default_factory=lambda: Settings._get_secret("DB_PASSWORD") or "")
    
    # Security settings (from secure storage)
    secret_key: str = Field(default_factory=lambda: Settings._get_secret("SECRET_KEY") or "")
    
    @staticmethod
    def _get_secret(secret_name: str) -> Optional[str]:
        """Retrieve secret from secure storage (priority order)."""
        
        # Priority 1: Cloud secrets manager (AWS Secrets Manager)
        if os.getenv("USE_AWS_SECRETS") == "true":
            try:
                secrets_client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION"))
                response = secrets_client.get_secret_value(SecretId=secret_name)
                return response["SecretString"]
            except Exception:
                pass
        
        # Priority 2: Azure Key Vault
        if os.getenv("USE_AZURE_VAULT") == "true":
            try:
                vault_url = os.getenv("AZURE_VAULT_URL")
                credential = DefaultAzureCredential()
                client = SecretClient(vault_url=vault_url, credential=credential)
                secret = client.get_secret(secret_name)
                return secret.value
            except Exception:
                pass
        
        # Priority 3: System environment variables (set by deployment system)
        secret = os.getenv(secret_name)
        if secret:
            return secret
        
        # Priority 4: Local development - read from config.local.toml (gitignored)
        local_config_path = Path(__file__).parent.parent / "config.local.toml"
        if local_config_path.exists():
            with open(local_config_path, "rb") as f:
                local_config = tomllib.load(f)
                secrets = local_config.get("secrets", {})
                return secrets.get(secret_name)
        
        return None

settings = Settings()
```

**config.local.toml** (Git-ignored, for local development only):
```toml
# This file is gitignored and never committed
# Copy config.local.toml.example to config.local.toml and fill in your local secrets

[secrets]
DB_USER = "postgres"
DB_PASSWORD = "your_local_password"
SECRET_KEY = "your_local_secret_key_change_in_production"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"  # Change this!
```

**.gitignore** (Ensure secrets are never committed):
```
# Configuration secrets
config.local.toml
*.env
.env*

# Secrets
secrets/
*.pem
*.key
```

**Production Deployment Secrets**:
- Use cloud provider secrets managers (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- Set environment variables via deployment platform (Docker, Kubernetes, cloud functions)
- NEVER commit secrets to Git
- NEVER use .env files in production

#### 4.3 Database Schema (PostgreSQL)

**Dynamic Form Storage**:
```sql
-- Form definitions
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    schema_data JSONB NOT NULL,  -- Complete form schema JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Form submissions
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL REFERENCES forms(form_id),
    submission_id VARCHAR(100) UNIQUE NOT NULL,
    submitted_data JSONB NOT NULL,  -- All form field values
    status VARCHAR(50) NOT NULL,  -- draft, submitted, reviewing, approved, rejected
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- File uploads (separate table for better management)
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Form field definitions (for admin management)
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL REFERENCES forms(form_id),
    field_id VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_order INTEGER NOT NULL,
    step_id VARCHAR(100),
    schema_data JSONB NOT NULL,  -- Field schema (type, label, validation, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(form_id, field_id)
);

-- Indexes for performance
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX idx_file_uploads_submission_id ON file_uploads(submission_id);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
```

#### 4.4 API Implementation (FastAPI)

**Form Schema API** (`src/labuan_fsa/api/routes/forms.py`):
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from labuan_fsa.database.session import get_db
from labuan_fsa.database.models import Form
from labuan_fsa.api.schemas import FormSchemaResponse, FormListResponse

router = APIRouter(prefix="/api/forms", tags=["forms"])

@router.get("", response_model=FormListResponse)
async def list_forms(db: Session = Depends(get_db)):
    """List all available forms."""
    forms = db.query(Form).filter(Form.is_active == True).all()
    return {
        "forms": [
            {
                "formId": form.form_id,
                "name": form.name,
                "description": form.description,
                "version": form.version,
                "steps": len(form.schema_data.get("steps", [])),
                "estimatedTime": form.schema_data.get("estimatedTime", "30 minutes")
            }
            for form in forms
        ]
    }

@router.get("/{form_id}/schema", response_model=FormSchemaResponse)
async def get_form_schema(form_id: str, db: Session = Depends(get_db)):
    """Get complete form schema for dynamic rendering."""
    form = db.query(Form).filter(Form.form_id == form_id, Form.is_active == True).first()
    if not form:
        raise HTTPException(status_code=404, detail=f"Form {form_id} not found")
    
    return form.schema_data  # Return complete schema JSON
```

**Form Submission API** (`src/labuan_fsa/api/routes/submissions.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from labuan_fsa.database.session import get_db
from labuan_fsa.database.models import FormSubmission, FileUpload
from labuan_fsa.services.validation_service import validate_submission
from labuan_fsa.services.submission_service import create_submission
from labuan_fsa.api.schemas import SubmissionRequest, SubmissionResponse

router = APIRouter(prefix="/api/forms", tags=["submissions"])

@router.post("/{form_id}/submit", response_model=SubmissionResponse)
async def submit_form(
    form_id: str,
    submission_data: SubmissionRequest,
    db: Session = Depends(get_db)
):
    """Submit form data."""
    # Validate submission
    validation_result = validate_submission(form_id, submission_data.data, db)
    if not validation_result.valid:
        raise HTTPException(
            status_code=400,
            detail={"errors": validation_result.errors}
        )
    
    # Create submission
    submission = create_submission(form_id, submission_data.data, db)
    
    return {
        "formId": form_id,
        "submissionId": submission.submission_id,
        "status": submission.status,
        "message": "Form submitted successfully"
    }
```

---

### 5. ADMIN DASHBOARD (UV Package)

**Requirements**:
- View all forms and their schemas
- View all form submissions with filtering, sorting, pagination
- Review submissions (approve, reject, add notes)
- Manage form schemas (CRUD operations)
- Export submission data (CSV, Excel, PDF)
- User authentication and authorization
- Audit logs

**Implementation Options**:
1. **React Admin** (recommended): https://marmelab.com/react-admin/
2. **Retool** (no-code, quick setup): https://retool.com/
3. **Custom React Dashboard** (full control)

**Admin Backend API** (`src/labuan_fsa/api/routes/admin.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from labuan_fsa.database.session import get_db
from labuan_fsa.database.models import FormSubmission, Form
from labuan_fsa.api.schemas import AdminSubmissionListResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/submissions")
async def list_submissions(
    form_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List all submissions with filtering and pagination."""
    query = db.query(FormSubmission)
    
    if form_id:
        query = query.filter(FormSubmission.form_id == form_id)
    if status:
        query = query.filter(FormSubmission.status == status)
    
    total = query.count()
    submissions = query.order_by(FormSubmission.submitted_at.desc())\
                       .offset((page - 1) * page_size)\
                       .limit(page_size)\
                       .all()
    
    return {
        "submissions": [
            {
                "id": sub.id,
                "submissionId": sub.submission_id,
                "formId": sub.form_id,
                "status": sub.status,
                "submittedBy": sub.submitted_by,
                "submittedAt": sub.submitted_at.isoformat(),
                "data": sub.submitted_data
            }
            for sub in submissions
        ],
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }
```

---

### 6. LOCAL DEVELOPMENT SETUP

**Prerequisites**:
- Python 3.11+
- Node.js 18+ (for frontend)
- PostgreSQL 14+
- Git

**Backend Setup**:
```bash
# 1. Clone/create project directory
cd projects/project-YYYYMMDD-HHMMSS-labuan-fsa-e-submission-system

# 2. Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install backend dependencies
cd backend
pip install -e .

# 4. Install development dependencies
pip install -e ".[dev]"

# 5. Set up local configuration
cp config.local.toml.example config.local.toml
# Edit config.local.toml with your local PostgreSQL credentials

# 6. Set up PostgreSQL database
createdb labuan_fsa_db
# Or using psql:
# psql -U postgres -c "CREATE DATABASE labuan_fsa_db;"

# 7. Run database migrations
alembic upgrade head

# 8. Seed initial form data (if needed)
python scripts/seed_forms.py

# 9. Run backend server
uvicorn labuan_fsa.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup**:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install
# Or using yarn:
# yarn install

# 3. Reference GitHub repositories for component extraction (optional):
# - Clone OpenMRS Form Builder for component analysis:
#   git clone https://github.com/openmrs/openmrs-esm-form-builder.git ../reference/openmrs-form-builder
# - Clone Alibaba Formily for form rendering patterns:
#   git clone https://github.com/alibaba/formily.git ../reference/formily

# 4. Create environment configuration (API endpoint)
# Create .env.local (gitignored):
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# 5. Run development server
npm run dev
# Or using yarn:
# yarn dev
```

**Component Extraction Guide for Develop Agent:**
When implementing the frontend components, the Develop Agent should:
1. **Analyze OpenMRS Form Builder** ([GitHub](https://github.com/openmrs/openmrs-esm-form-builder)):
   - Review React form engine implementation for dynamic form rendering
   - Extract reusable field components (InputField, SelectField, etc.)
   - Adapt interactive schema editor patterns for API-driven rendering
   - Study form preview rendering logic
   
2. **Analyze Alibaba Formily** ([GitHub](https://github.com/alibaba/formily)):
   - Review form schema-driven rendering architecture
   - Extract field management and validation patterns
   - Study complex form scenarios and conditional rendering
   - Adapt TypeScript-based form state management

3. **Adapt Components for API-Driven Architecture**:
   - Modify extracted components to receive form schema from Python backend API
   - Replace hardcoded schemas with API response parsing
   - Ensure all field properties (type, label, validation, styling) come from API
   - Maintain component modularity and reusability

**Database Migration Setup**:
```bash
# Initialize Alembic (if not done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

---

### 7. PRODUCTION DEPLOYMENT

#### 7.1 Backend Deployment

**Option A: Docker Deployment**:
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python package
COPY pyproject.toml ./
COPY src/ ./src/
RUN pip install --no-cache-dir -e .

# Copy configuration template
COPY config.toml ./

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "labuan_fsa.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - SECRET_KEY=${SECRET_KEY}
      - USE_AWS_SECRETS=true
      - AWS_REGION=${AWS_REGION}
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: labuan_fsa_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Option B: Cloud Platform Deployment** (AWS/GCP/Azure):
- Use managed PostgreSQL (RDS, Cloud SQL, Azure Database)
- Deploy backend as containerized service (ECS, Cloud Run, Container Apps)
- Use cloud secrets manager for credentials
- Set up load balancer and auto-scaling
- Configure CDN for frontend static assets

#### 7.2 Frontend Deployment

**Build for Production**:
```bash
cd frontend
npm run build
# Output: dist/ directory with static assets
```

**Serve with Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/labuan-fsa-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 7.3 Security Checklist for Production

- [ ] All secrets in cloud secrets manager (no .env files)
- [ ] HTTPS/SSL certificates configured
- [ ] CORS properly configured (only allow production domain)
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (use parameterized queries)
- [ ] File upload size limits and type validation
- [ ] Authentication and authorization implemented
- [ ] Audit logging enabled
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

---

## 📊 EXPECTED OUTPUTS

### For Init Agent:
1. **project-requirements-YYYYMMDD-HHMMSS.md**: Comprehensive requirements document including:
   - All extracted form data from URL survey
   - Technical architecture requirements
   - API-driven rendering specifications
   - Packaging requirements
   - Configuration management approach
   - Database schema design
   - Deployment procedures

2. **resource-links-YYYYMMDD-HHMMSS.md**: Curated research links on:
   - React component patterns
   - API-driven form rendering
   - Python packaging (pyproject.toml)
   - Secure configuration management
   - FastAPI best practices
   - PostgreSQL dynamic form storage
   - Admin dashboard frameworks
   - **Reference GitHub Repositories for Component Extraction**:
     - [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - React form builder with interactive schema editor
     - [Alibaba Formily](https://github.com/alibaba/formily) - Enterprise form solution framework with dynamic rendering

3. **CLAUDE.md**: Updated project context for all agents

### For Subsequent Agents:
- **Product Agent**: Market analysis of similar e-submission systems, competitive analysis
- **Plan Agent**: Detailed roadmap with phases, milestones, timelines
- **Design Agent**: Complete system architecture, API specifications, database schema
- **Develop Agent**: Full code implementation following all requirements, with component extraction and adaptation from:
  - [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - Extract React form components and rendering logic
  - [Alibaba Formily](https://github.com/alibaba/formily) - Extract form schema-driven rendering patterns and validation logic
- **DevOps Agent**: CI/CD pipelines, deployment configurations, infrastructure as code
- **Security Agent**: Security assessment, vulnerability scanning, compliance review
- **Test Agent**: Comprehensive test suites (unit, integration, E2E)
- **Audit Agent**: Code quality review, performance optimization
- **Deploy Agent**: Production deployment procedures, monitoring setup

---

## 🔒 SECURITY REQUIREMENTS

1. **Configuration Secrets**: Use TOML + cloud secrets manager, NEVER .env files in production
2. **API Security**: JWT authentication, rate limiting, CORS configuration
3. **Data Validation**: Server-side validation for all inputs, SQL injection prevention
4. **File Uploads**: Size limits, type validation, virus scanning (optional)
5. **Database Security**: Encrypted connections, parameterized queries, least privilege access
6. **Audit Logging**: Track all form submissions, admin actions, API access

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

## 🚀 NEXT STEPS

After Init Agent completes:
1. **Product Agent**: Analyze market, define product strategy
2. **Plan Agent**: Create detailed roadmap and timeline
3. **UX Agent**: Design user flows and wireframes
4. **Design Agent**: Create technical architecture
5. **Data Agent**: Design database schema and data pipelines
6. **Develop Agent**: Implement frontend and backend, with component extraction from:
   - [OpenMRS Form Builder](https://github.com/openmrs/openmrs-esm-form-builder) - Analyze and adapt React form components
   - [Alibaba Formily](https://github.com/alibaba/formily) - Extract form rendering patterns and validation logic
7. **DevOps Agent**: Set up CI/CD and deployment
8. **Security Agent**: Security assessment
9. **Compliance Agent**: Regulatory compliance review
10. **Test Agent**: Comprehensive testing
11. **Debug Agent**: Fix issues (if any)
12. **Documentation Agent**: Complete documentation
13. **Audit Agent**: Quality audit
14. **Deploy Agent**: Production deployment

---

**This prompt is optimized for Claude's strengths in handling long contexts, structured reasoning, and comprehensive analysis. All SDLC agents should use this as reference when working on this project.**

---

## 📚 REFERENCE GITHUB REPOSITORIES FOR COMPONENT EXTRACTION

The Develop Agent should reference and potentially extract components from these open-source repositories:

### 1. OpenMRS Form Builder
**Repository**: [https://github.com/openmrs/openmrs-esm-form-builder](https://github.com/openmrs/openmrs-esm-form-builder)

**Description**: React form builder microfrontend that uses React form engine to render visual form previews dynamically. Provides interactive schema editor and JSON code editor.

**Key Features**:
- React form engine for dynamic form rendering
- Interactive schema editor for building forms visually
- JSON code editor for schema editing
- Progressive preview updates during form building
- OpenMRS integration capabilities

**Components to Extract/Adapt**:
- Form field components (InputField, SelectField, TextArea, etc.)
- Form preview rendering logic
- Schema editor patterns
- Dynamic form rendering architecture
- Validation patterns

**Usage for This Project**: Adapt components to work with Python backend API responses instead of hardcoded schemas. Extract reusable field components and form rendering logic.

### 2. Alibaba Formily
**Repository**: [https://github.com/alibaba/formily](https://github.com/alibaba/formily)

**Description**: Enterprise-grade form solution framework with powerful dynamic form rendering capabilities. Supports form schema-driven rendering, field management, validation, and complex form scenarios.

**Key Features**:
- Form schema-driven rendering
- Field management and lifecycle hooks
- Comprehensive validation system
- Complex form scenarios (nested forms, arrays, conditional rendering)
- TypeScript-based with React/Vue support
- Performance optimization for large forms

**Components to Extract/Adapt**:
- Form schema-driven rendering patterns
- Field management architecture
- Validation logic and error handling
- Conditional rendering patterns
- Form state management patterns
- Complex form scenarios handling

**Usage for This Project**: Extract form rendering patterns and adapt validation logic to work with Python backend API. Study schema-driven architecture for API-driven form rendering.

### Extraction Guidelines for Develop Agent

When extracting components from these repositories:

1. **License Compliance**: 
   - Verify licenses are compatible (OpenMRS: MPL 2.0, Formily: Apache 2.0)
   - Maintain attribution where required
   - Document source of extracted code

2. **Adaptation Requirements**:
   - Replace hardcoded schemas with API response parsing
   - Modify components to receive form schema from `/api/forms/{formId}/schema`
   - Ensure all field properties come from Python backend API
   - Maintain component modularity and reusability
   - Adapt TypeScript types to match API response structure

3. **Code Quality**:
   - Follow existing project code style and conventions
   - Add comprehensive TypeScript types
   - Implement proper error handling
   - Write unit tests for extracted/adapted components
   - Document component usage and API requirements

4. **Integration**:
   - Integrate extracted components with React Hook Form or Formik
   - Connect to Python backend API endpoints
   - Implement proper loading states and error handling
   - Ensure accessibility compliance (WCAG)

**Note**: These repositories serve as reference implementations. Components should be adapted, not directly copied, to fit the API-driven architecture where the Python backend controls all form structure and field properties.

