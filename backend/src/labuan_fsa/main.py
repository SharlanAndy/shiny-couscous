"""
Labuan FSA E-Submission System - FastAPI Application

Main application entry point for the backend API.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

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
# Allow GitHub Pages domain and local development
cors_origins = [
    "https://clkhoo5211.github.io",  # GitHub Pages production
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Local development alternative
]

# Add additional origins from environment variable (comma-separated)
if settings.app.environment == "production":
    additional_origins = os.getenv("CORS_ORIGINS", "").split(",")
    cors_origins.extend([origin.strip() for origin in additional_origins if origin.strip()])
elif settings.app.debug:
    # In debug mode, allow all origins for development
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

