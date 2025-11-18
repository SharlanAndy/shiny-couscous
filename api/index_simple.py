"""
Simple test handler to verify Vercel Python runtime works.
If this works, the issue is with our FastAPI import.
"""
print("=" * 60)
print("🚀 Simple test handler starting...")
print("=" * 60)

def handler(req, res):
    """Simple test handler."""
    print("Handler called!")
    res.status(200).send('{"status": "test works!", "message": "Simple handler is working"}')
    print("Handler completed!")

print("✅ Handler function defined")
print("=" * 60)

