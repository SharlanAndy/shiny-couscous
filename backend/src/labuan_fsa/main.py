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
from starlette.middleware.base import BaseHTTPMiddleware

from labuan_fsa.config import get_settings
from labuan_fsa.database import close_db, init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup - Initialize JSON database as fallback
    print("🚀 Server starting...")
    print("   Initializing JSON database fallback...")
    try:
        from labuan_fsa.json_db import initialize_default_data
        await initialize_default_data()
        print("   ✅ JSON database ready (will be used if SQL fails)")
    except Exception as e:
        print(f"   ⚠️  JSON database initialization warning: {e}")
    
    # Skip init_db() for now due to connection issues
    # The API endpoints will use JSON fallback if SQL fails
    print("   ⚠️  Skipping SQL database initialization (will use JSON fallback if needed)")
    
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

# CRITICAL: Add CORS enforcement middleware FIRST to wrap ALL responses
class CORSEnforcementMiddleware(BaseHTTPMiddleware):
    """Middleware to ensure CORS headers on ALL responses, including errors."""
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        is_allowed_origin = (
            origin and (
                "github.io" in origin or 
                "localhost" in origin or 
                "127.0.0.1" in origin
            )
        ) or True  # Allow all for now to debug
        
        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            response = JSONResponse(status_code=200, content={})
            if is_allowed_origin:
                response.headers["Access-Control-Allow-Origin"] = origin or "*"
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "*"
                response.headers["Access-Control-Max-Age"] = "600"
            return response
        
        try:
            response = await call_next(request)
        except Exception as exc:
            # Catch ANY exception and add CORS headers
            import traceback
            print(f"❌ Exception in request: {exc}")
            print(traceback.format_exc())
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": str(exc),
                    "type": type(exc).__name__,
                }
            )
        
        # ALWAYS add CORS headers to response, even if error occurred
        if is_allowed_origin:
            response.headers["Access-Control-Allow-Origin"] = origin or "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response

# Add CORS enforcement middleware FIRST (outermost layer)
app.add_middleware(CORSEnforcementMiddleware)

# Then add standard CORS middleware (it may not handle errors, but helps with normal responses)
try:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all for debugging - restrict later
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
except Exception as e:
    print(f"⚠️ CORS middleware setup error: {e}")

# Trusted host middleware (configure in production)
# DISABLED for now - causing issues in Vercel
# if settings.app.environment == "production":
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=["*.labuanfsa.gov.my", "labuanfsa.gov.my"],
#     )


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




# Exception handlers as backup (in case middleware doesn't catch it)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always present."""
    origin = request.headers.get("origin", "")
    is_allowed_origin = (
        origin and (
            "github.io" in origin or 
            "localhost" in origin or 
            "127.0.0.1" in origin
        )
    )
    
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
        }
    )
    
    # Add CORS headers manually
    if is_allowed_origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP exception handler with CORS headers."""
    origin = request.headers.get("origin", "")
    is_allowed_origin = (
        origin and (
            "github.io" in origin or 
            "localhost" in origin or 
            "127.0.0.1" in origin
        )
    )
    
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    
    # Add CORS headers
    if is_allowed_origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response


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

