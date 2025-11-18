"""
Vercel serverless function entry point for FastAPI.
"""
import sys
import os
from pathlib import Path

# Get the directory containing this file (backend/api/)
current_dir = Path(__file__).parent.absolute()
# Get backend directory (parent of api/)
backend_dir = current_dir.parent.absolute()
# Get src directory (backend/src/)
src_dir = backend_dir / "src"

# Add backend/src to Python path so we can import labuan_fsa
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Also add backend directory to path for imports
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Change working directory to backend for relative paths
os.chdir(str(backend_dir))

from labuan_fsa.main import app

# Export the FastAPI app for Vercel
# This file must be named index.py and placed in api/ directory
__all__ = ["app"]

