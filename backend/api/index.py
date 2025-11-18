"""
Vercel serverless function entry point for FastAPI.
"""
from src.labuan_fsa.main import app

# Export the FastAPI app for Vercel
# This file must be named index.py and placed in api/ directory
__all__ = ["app"]

