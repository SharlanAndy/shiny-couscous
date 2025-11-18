"""
Labuan FSA E-Submission System - FastAPI Application

Main application entry point for the backend API.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from labuan_fsa.config import get_settings
from labuan_fsa.database import close_db, init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    try:
        await init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  Database initialization failed (this is OK for testing): {e}")
        print("   The API will work but database-dependent endpoints may fail.")
        # Don't print full traceback in production - just log the error
        import traceback
        if settings.app.debug:
            traceback.print_exc()
        # In Vercel/serverless, we want to continue even if DB init fails
        # This allows the API to start and handle requests that don't need DB
    
    yield
    
    # Shutdown
    try:
        await close_db()
    except Exception:
        pass  # Ignore errors on shutdown


# Create FastAPI app
app = FastAPI(
    title=settings.app.name,
    version=settings.app.version,
    description="Labuan FSA E-Submission System Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
# CRITICAL: Always allow GitHub Pages and common origins for Vercel
# Vercel serverless functions may not have environment variables set correctly
cors_origins = [
    "https://clkhoo5211.github.io",  # GitHub Pages production - REQUIRED
    "https://*.github.io",  # All GitHub Pages subdomains
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Local development alternative
]

# For Vercel/serverless, be more permissive in production
# Add additional origins from environment variable (comma-separated)
if settings.app.environment == "production":
    additional_origins = os.getenv("CORS_ORIGINS", "").split(",")
    cors_origins.extend([origin.strip() for origin in additional_origins if origin.strip()])
    
    # In Vercel production, also allow all GitHub Pages by default
    if not any("*" in origin for origin in cors_origins):
        # Use regex pattern for GitHub Pages
        cors_origins = cors_origins + ["https://*.github.io", "http://localhost:*"]
elif settings.app.debug:
    # In debug mode, allow all origins for development
    cors_origins = ["*"]

# Always ensure GitHub Pages is allowed
if "https://clkhoo5211.github.io" not in cors_origins and "*" not in str(cors_origins):
    cors_origins.append("https://clkhoo5211.github.io")

print(f"🔧 CORS origins configured: {cors_origins}")
print(f"🔧 Environment: {settings.app.environment}, Debug: {settings.app.debug}")

# Use regex_origins for wildcard matching (GitHub Pages)
# Fallback to allow_origins if regex doesn't work
try:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if "*" not in str(cors_origins) else ["*"],
        allow_origin_regex=r"https://.*\.github\.io",  # Allow all GitHub Pages
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
except Exception as e:
    print(f"⚠️ CORS middleware setup error: {e}")
    # Fallback: use most permissive settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

# Trusted host middleware (configure in production)
if settings.app.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.labuanfsa.gov.my", "labuanfsa.gov.my"],
    )


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "name": settings.app.name,
        "version": settings.app.version,
        "status": "running",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


# Include routers
from labuan_fsa.api import forms, submissions, files, admin, auth, payments

app.include_router(forms.router)
app.include_router(submissions.router)
app.include_router(files.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(payments.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "labuan_fsa.main:app",
        host=settings.server.host,
        port=settings.server.port,
        reload=settings.server.reload,
    )

