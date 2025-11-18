"""
Vercel serverless function entry point for FastAPI.

This file is placed at the root api/ directory for Vercel deployment.
It imports the FastAPI app from the backend directory.
"""
import sys
import os
from pathlib import Path

# Get the directory containing this file (api/ at root)
current_dir = Path(__file__).parent.absolute()
# Get root directory (parent of api/)
root_dir = current_dir.parent.absolute()
# Get backend directory (root/backend)
backend_dir = root_dir / "backend"
# Get src directory (backend/src)
src_dir = backend_dir / "src"

# Debug output (will appear in Vercel logs)
print(f"🔍 Vercel Entry Point Debug:")
print(f"   Current dir: {current_dir}")
print(f"   Root dir: {root_dir}")
print(f"   Backend dir: {backend_dir} (exists: {backend_dir.exists()})")
print(f"   Src dir: {src_dir} (exists: {src_dir.exists()})")

# Add backend/src to Python path so we can import labuan_fsa
if src_dir.exists():
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))
        print(f"✅ Added {src_dir} to Python path")
else:
    print(f"⚠️  Warning: {src_dir} does not exist!")
    # List what's actually in the root
    if root_dir.exists():
        print(f"   Root dir contents: {[str(p.name) for p in root_dir.iterdir()]}")
    if current_dir.exists():
        print(f"   Current dir contents: {[str(p.name) for p in current_dir.iterdir()]}")

# Also add backend directory to path for imports
if backend_dir.exists():
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
        print(f"✅ Added {backend_dir} to Python path")

# Change working directory to backend if it exists
if backend_dir.exists():
    os.chdir(str(backend_dir))
    print(f"✅ Changed working directory to: {backend_dir}")
else:
    print(f"⚠️  Warning: {backend_dir} does not exist, keeping current directory")

# Try to import the FastAPI app
app = None
handler = None

try:
    print(f"🔄 Attempting to import labuan_fsa.main...")
    from labuan_fsa.main import app
    print(f"✅ Successfully imported labuan_fsa.main")
    
    # Vercel serverless function handler
    # Vercel's Python runtime can work with FastAPI directly
    # But we need to export the app as the default handler
    # For Vercel, we can use Mangum as an adapter, or export app directly
    try:
        from mangum import Mangum
        # Wrap FastAPI app with Mangum for AWS Lambda/Vercel compatibility
        handler = Mangum(app, lifespan="off")  # Turn off lifespan since Vercel handles it differently
        print(f"✅ Created Mangum handler")
    except ImportError as e:
        # If Mangum is not available, try direct export (Vercel might handle FastAPI directly)
        print(f"⚠️  Mangum not available ({e}), using FastAPI app directly")
        handler = app
        print(f"✅ Using FastAPI app as handler")
    
    print(f"✅ Handler ready")
    print(f"   Handler type: {type(handler)}")
    print(f"   App type: {type(app)}")
    
except ImportError as e:
    # Print detailed error information
    print(f"❌ Import error: {e}")
    print(f"   Python path: {sys.path}")
    print(f"   Current working directory: {os.getcwd()}")
    print(f"   Files in current directory: {list(Path.cwd().iterdir()) if Path.cwd().exists() else 'N/A'}")
    
    # Try to find where labuan_fsa might be
    import importlib.util
    for path in sys.path:
        labuan_fsa_path = Path(path) / "labuan_fsa"
        if labuan_fsa_path.exists():
            print(f"   Found labuan_fsa at: {labuan_fsa_path}")
        main_path = Path(path) / "labuan_fsa" / "main.py"
        if main_path.exists():
            print(f"   Found main.py at: {main_path}")
    
    # Create a minimal handler that returns an error
    def error_handler(event, context=None):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': f'{{"error": "Import failed", "message": "{str(e)}"}}'
        }
    handler = error_handler
    print(f"⚠️  Created error handler as fallback")
    
except Exception as e:
    print(f"❌ Unexpected error during import: {e}")
    import traceback
    traceback.print_exc()
    
    # Create a minimal handler that returns an error
    def error_handler(event, context=None):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': f'{{"error": "Initialization failed", "message": "{str(e)}"}}'
        }
    handler = error_handler
    print(f"⚠️  Created error handler as fallback")

# Export handler for Vercel
# Vercel Python runtime expects 'handler' variable to be available
# This is the critical export that Vercel looks for
# Make sure handler is not None
if handler is None:
    print(f"❌ CRITICAL: Handler is None, creating minimal fallback")
    def fallback_handler(event, context=None):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': '{"error": "Handler not initialized"}'
        }
    handler = fallback_handler

print(f"✅ Final handler exported: {type(handler)}")
