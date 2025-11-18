"""
Vercel serverless function entry point for FastAPI.
"""
import sys
import os
from pathlib import Path

# Write to stderr for immediate visibility (Vercel shows stderr in logs)
def log(msg):
    print(msg, file=sys.stderr)
    sys.stderr.flush()

log("=" * 60)
log("🚀 Starting Vercel Function...")
log("=" * 60)

try:
    log("✅ Basic imports successful")
    
    # Check directories
    current_dir = Path(__file__).parent.absolute()
    root_dir = current_dir.parent.absolute()
    backend_dir = root_dir / "backend"
    src_dir = backend_dir / "src"
    
    log(f"📁 Current dir: {current_dir}")
    log(f"📁 Root dir: {root_dir}")
    log(f"📁 Backend dir: {backend_dir} (exists: {backend_dir.exists()})")
    log(f"📁 Src dir: {src_dir} (exists: {src_dir.exists()})")
    
    # List what's actually there
    if root_dir.exists():
        try:
            contents = [p.name for p in root_dir.iterdir()][:20]
            log(f"📂 Root contents: {contents}")
        except Exception as e:
            log(f"⚠️  Error listing root: {e}")
    
    # Add paths
    if src_dir.exists():
        sys.path.insert(0, str(src_dir))
        log(f"✅ Added {src_dir} to path")
    
    if backend_dir.exists():
        sys.path.insert(0, str(backend_dir))
        log(f"✅ Added {backend_dir} to path")
    
    # Change directory
    if backend_dir.exists():
        os.chdir(str(backend_dir))
        log(f"✅ Changed to backend dir")
    
    # Try import
    log("🔄 Attempting import...")
    from labuan_fsa.main import app
    log("✅ Import successful!")
    log(f"✅ App type: {type(app)}")
    
except Exception as e:
    log(f"❌ ERROR: {e}")
    import traceback
    log("❌ TRACEBACK:")
    for line in traceback.format_exc().split('\n'):
        log(f"   {line}")
    
    # Create minimal FastAPI app
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    @app.get("/health")
    async def error():
        return {
            "status": "error",
            "message": f"Import failed: {str(e)}",
            "error_type": type(e).__name__
        }
    
    log("⚠️  Created fallback app")

log("=" * 60)
log("✅ Module loaded successfully")
log("=" * 60)
