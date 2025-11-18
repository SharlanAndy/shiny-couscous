"""
Vercel serverless function entry point for FastAPI.

Vercel Python runtime expects FastAPI app to be exported as 'app'.
This file imports the FastAPI app from the backend directory.
"""
# Use sys.stdout for immediate output that will appear in logs
import sys
sys.stdout.write("=" * 60 + "\n")
sys.stdout.write("🚀 Vercel Function Starting...\n")
sys.stdout.flush()

import os
from pathlib import Path

sys.stdout.write("✅ Basic imports loaded\n")
sys.stdout.flush()

# Get the directory containing this file (api/ at root)
current_dir = Path(__file__).parent.absolute()
root_dir = current_dir.parent.absolute()
backend_dir = root_dir / "backend"
src_dir = backend_dir / "src"

sys.stdout.write(f"🔍 Directory Check:\n")
sys.stdout.write(f"   Current dir: {current_dir}\n")
sys.stdout.write(f"   Root dir: {root_dir}\n")
sys.stdout.write(f"   Backend dir: {backend_dir} (exists: {backend_dir.exists()})\n")
sys.stdout.write(f"   Src dir: {src_dir} (exists: {src_dir.exists()})\n")
sys.stdout.flush()

# List contents for debugging
if root_dir.exists():
    try:
        contents = [p.name for p in root_dir.iterdir()][:15]
        sys.stdout.write(f"   Root contents: {contents}\n")
    except Exception as e:
        sys.stdout.write(f"   Error listing root: {e}\n")

sys.stdout.flush()

# Add backend/src to Python path
if src_dir.exists():
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))
        sys.stdout.write(f"✅ Added {src_dir} to Python path\n")
else:
    sys.stdout.write(f"⚠️  WARNING: {src_dir} does NOT exist!\n")
    sys.stdout.write(f"   Backend code might not be included in deployment\n")
sys.stdout.flush()

# Also add backend directory
if backend_dir.exists():
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
        sys.stdout.write(f"✅ Added {backend_dir} to Python path\n")
sys.stdout.flush()

# Change working directory if backend exists
if backend_dir.exists():
    os.chdir(str(backend_dir))
    sys.stdout.write(f"✅ Changed working directory to: {backend_dir}\n")
sys.stdout.flush()

# Try to import FastAPI app
# Vercel expects 'app' to be exported directly
try:
    sys.stdout.write(f"🔄 Attempting to import labuan_fsa.main...\n")
    sys.stdout.write(f"   Python path (first 5): {sys.path[:5]}\n")
    sys.stdout.flush()
    
    from labuan_fsa.main import app
    sys.stdout.write(f"✅ Successfully imported labuan_fsa.main\n")
    sys.stdout.write(f"   App type: {type(app)}\n")
    sys.stdout.write(f"   App: {app}\n")
    sys.stdout.flush()
    
    # Vercel Python runtime expects 'app' to be exported directly
    # No need for handler wrapper when using FastAPI
    
except ImportError as e:
    sys.stdout.write(f"❌ CRITICAL Import error: {e}\n")
    import traceback
    for line in traceback.format_exc().split('\n'):
        sys.stdout.write(f"   {line}\n")
    sys.stdout.flush()
    
    # Create minimal FastAPI app as fallback
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def error():
        return {"error": "Import failed", "message": str(e)}
    
    sys.stdout.write(f"⚠️  Created fallback FastAPI app\n")
    sys.stdout.flush()
    
except Exception as e:
    sys.stdout.write(f"❌ CRITICAL Unexpected error: {e}\n")
    import traceback
    for line in traceback.format_exc().split('\n'):
        sys.stdout.write(f"   {line}\n")
    sys.stdout.flush()
    
    # Create minimal FastAPI app as fallback
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def error():
        return {"error": "Initialization failed", "message": str(e)}
    
    sys.stdout.write(f"⚠️  Created fallback FastAPI app\n")
    sys.stdout.flush()

# Ensure app exists
if 'app' not in locals():
    sys.stdout.write(f"❌ CRITICAL: app not defined!\n")
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def error():
        return {"error": "App not initialized"}

sys.stdout.write("=" * 60 + "\n")
sys.stdout.write(f"✅ App exported: {type(app)}\n")
sys.stdout.write("=" * 60 + "\n")
sys.stdout.flush()

# Vercel Python runtime will automatically use 'app' as the FastAPI application
