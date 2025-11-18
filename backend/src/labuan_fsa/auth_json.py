"""
JSON-based authentication system for users and admins.
Stores user and admin credentials in JSON files.
"""

import json
import hashlib
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any
import asyncio
from functools import wraps

# Paths to JSON auth files
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

USERS_AUTH_PATH = DATA_DIR / "users_auth.json"
ADMINS_AUTH_PATH = DATA_DIR / "admins_auth.json"
SESSIONS_PATH = DATA_DIR / "sessions.json"

# Lock for file operations
_auth_lock = asyncio.Lock()


def async_auth_operation(func):
    """Decorator to ensure thread-safe auth file operations."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        async with _auth_lock:
            return await func(*args, **kwargs)
    return wrapper


def _hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def _load_json_file(file_path: Path, default_value: dict) -> dict:
    """Load JSON file."""
    if not file_path.exists():
        return default_value.copy()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"⚠️  Error loading auth file {file_path}: {e}")
        return default_value.copy()


def _save_json_file(file_path: Path, data: dict) -> None:
    """Save JSON file."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except IOError as e:
        print(f"⚠️  Error saving auth file {file_path}: {e}")
        raise


@async_auth_operation
async def create_user(email: str, password: str, name: str = None) -> Dict[str, Any]:
    """Create a new user account."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    # Check if user already exists
    for user in users_data.get("users", []):
        if user.get("email") == email:
            raise ValueError(f"User with email {email} already exists")
    
    # Create new user
    user = {
        "id": secrets.token_urlsafe(16),
        "email": email,
        "passwordHash": _hash_password(password),
        "name": name or email.split("@")[0],
        "role": "user",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "isActive": True,
    }
    
    users_data.setdefault("users", []).append(user)
    _save_json_file(USERS_AUTH_PATH, users_data)
    
    print(f"✅ Created user: {email}")
    return user


@async_auth_operation
async def create_admin(email: str, password: str, name: str = None) -> Dict[str, Any]:
    """Create a new admin account."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    # Check if admin already exists
    for admin in admins_data.get("admins", []):
        if admin.get("email") == email:
            raise ValueError(f"Admin with email {email} already exists")
    
    # Create new admin
    admin = {
        "id": secrets.token_urlsafe(16),
        "email": email,
        "passwordHash": _hash_password(password),
        "name": name or email.split("@")[0],
        "role": "admin",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "isActive": True,
    }
    
    admins_data.setdefault("admins", []).append(admin)
    _save_json_file(ADMINS_AUTH_PATH, admins_data)
    
    print(f"✅ Created admin: {email}")
    return admin


@async_auth_operation
async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    password_hash = _hash_password(password)
    
    for user in users_data.get("users", []):
        if user.get("email") == email and user.get("passwordHash") == password_hash:
            if not user.get("isActive", True):
                return None
            # Return user without password hash
            return {
                "id": user.get("id"),
                "email": user.get("email"),
                "name": user.get("name"),
                "role": "user",
            }
    
    return None


@async_auth_operation
async def authenticate_admin(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate an admin."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    password_hash = _hash_password(password)
    
    for admin in admins_data.get("admins", []):
        if admin.get("email") == email and admin.get("passwordHash") == password_hash:
            if not admin.get("isActive", True):
                return None
            # Return admin without password hash
            return {
                "id": admin.get("id"),
                "email": admin.get("email"),
                "name": admin.get("name"),
                "role": "admin",
            }
    
    return None


@async_auth_operation
async def create_session(user_id: str, role: str) -> str:
    """Create a JWT session token."""
    from labuan_fsa.utils.security import create_access_token
    
    # Create JWT token
    token_data = {"sub": user_id, "role": role}
    token = create_access_token(token_data)
    
    # Also store in sessions.json for tracking (optional, can be removed later)
    sessions_data = _load_json_file(SESSIONS_PATH, {"sessions": []})
    session = {
        "token": token,
        "userId": user_id,
        "role": role,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "expiresAt": (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z",
    }
    
    sessions_data.setdefault("sessions", []).append(session)
    _save_json_file(SESSIONS_PATH, sessions_data)
    
    return token


@async_auth_operation
async def validate_session(token: str) -> Optional[Dict[str, Any]]:
    """Validate a JWT session token."""
    from labuan_fsa.utils.security import verify_token
    
    # First, try to verify as JWT token
    payload = verify_token(token)
    if payload:
        return {
            "userId": payload.get("sub"),
            "role": payload.get("role"),
        }
    
    # Fallback: Check sessions.json for backward compatibility
    sessions_data = _load_json_file(SESSIONS_PATH, {"sessions": []})
    now = datetime.utcnow()
    
    for session in sessions_data.get("sessions", []):
        if session.get("token") == token:
            expires_at = datetime.fromisoformat(session.get("expiresAt", "").replace("Z", "+00:00"))
            if expires_at > now:
                return {
                    "userId": session.get("userId"),
                    "role": session.get("role"),
                }
            else:
                # Remove expired session
                sessions_data["sessions"] = [s for s in sessions_data["sessions"] if s.get("token") != token]
                _save_json_file(SESSIONS_PATH, sessions_data)
                return None
    
    return None


@async_auth_operation
async def delete_session(token: str) -> None:
    """Delete a session token."""
    sessions_data = _load_json_file(SESSIONS_PATH, {"sessions": []})
    
    sessions_data["sessions"] = [s for s in sessions_data.get("sessions", []) if s.get("token") != token]
    _save_json_file(SESSIONS_PATH, sessions_data)


@async_auth_operation
async def get_all_users() -> list[Dict[str, Any]]:
    """Get all users (admin only)."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    users = users_data.get("users", [])
    # Remove password hashes from response
    return [
        {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "role": user.get("role", "user"),
            "isActive": user.get("isActive", True),
            "createdAt": user.get("createdAt"),
        }
        for user in users
    ]


@async_auth_operation
async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    for user in users_data.get("users", []):
        if user.get("id") == user_id:
            # Return user without password hash
            return {
                "id": user.get("id"),
                "email": user.get("email"),
                "name": user.get("name"),
                "role": user.get("role", "user"),
                "isActive": user.get("isActive", True),
                "createdAt": user.get("createdAt"),
            }
    
    return None


@async_auth_operation
async def update_user(user_id: str, name: Optional[str] = None, email: Optional[str] = None, is_active: Optional[bool] = None, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update user information."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    for user in users_data.get("users", []):
        if user.get("id") == user_id:
            if name is not None:
                user["name"] = name
            if email is not None:
                # Check if email already exists for another user
                for other_user in users_data.get("users", []):
                    if other_user.get("id") != user_id and other_user.get("email") == email:
                        raise ValueError(f"Email {email} already exists")
                user["email"] = email
            if is_active is not None:
                user["isActive"] = is_active
            if password is not None:
                # Hash the new password
                user["passwordHash"] = _hash_password(password)
            
            user["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            _save_json_file(USERS_AUTH_PATH, users_data)
            
            # Return updated user without password hash
            return {
                "id": user.get("id"),
                "email": user.get("email"),
                "name": user.get("name"),
                "role": user.get("role", "user"),
                "isActive": user.get("isActive", True),
                "createdAt": user.get("createdAt"),
                "updatedAt": user.get("updatedAt"),
            }
    
    return None


@async_auth_operation
async def update_user_profile(user_id: str, name: Optional[str] = None, email: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update user's own profile (name and email only)."""
    return await update_user(user_id, name=name, email=email)


@async_auth_operation
async def change_user_password(user_id: str, current_password: str, new_password: str) -> bool:
    """Change user password."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    current_password_hash = _hash_password(current_password)
    
    for user in users_data.get("users", []):
        if user.get("id") == user_id:
            if user.get("passwordHash") != current_password_hash:
                raise ValueError("Current password is incorrect")
            
            user["passwordHash"] = _hash_password(new_password)
            user["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            _save_json_file(USERS_AUTH_PATH, users_data)
            return True
    
    return False


@async_auth_operation
async def delete_user(user_id: str, password: str) -> bool:
    """Delete a user account after verifying password."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    
    password_hash = _hash_password(password)
    
    for user in users_data.get("users", []):
        if user.get("id") == user_id:
            if user.get("passwordHash") != password_hash:
                raise ValueError("Password is incorrect")
            
            # Remove user from list
            users_data["users"] = [u for u in users_data.get("users", []) if u.get("id") != user_id]
            _save_json_file(USERS_AUTH_PATH, users_data)
            
            # Delete all sessions for this user
            sessions_data = _load_json_file(SESSIONS_PATH, {"sessions": []})
            sessions_data["sessions"] = [
                s for s in sessions_data.get("sessions", [])
                if s.get("userId") != user_id
            ]
            _save_json_file(SESSIONS_PATH, sessions_data)
            
            return True
    
    return False


# ============================================================
# Admin Management Functions
# ============================================================

@async_auth_operation
async def get_all_admins() -> list[Dict[str, Any]]:
    """Get all admins (admin only)."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    admins = admins_data.get("admins", [])
    # Remove password hashes from response
    return [
        {
            "id": admin.get("id"),
            "email": admin.get("email"),
            "name": admin.get("name"),
            "role": admin.get("role", "admin"),
            "isActive": admin.get("isActive", True),
            "createdAt": admin.get("createdAt"),
        }
        for admin in admins
    ]


@async_auth_operation
async def get_admin_by_id(admin_id: str) -> Optional[Dict[str, Any]]:
    """Get admin by ID."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    for admin in admins_data.get("admins", []):
        if admin.get("id") == admin_id:
            # Return admin without password hash
            return {
                "id": admin.get("id"),
                "email": admin.get("email"),
                "name": admin.get("name"),
                "role": admin.get("role", "admin"),
                "isActive": admin.get("isActive", True),
                "createdAt": admin.get("createdAt"),
            }
    
    return None


@async_auth_operation
async def update_admin(admin_id: str, name: Optional[str] = None, email: Optional[str] = None, is_active: Optional[bool] = None, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update admin information."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    for admin in admins_data.get("admins", []):
        if admin.get("id") == admin_id:
            if name is not None:
                admin["name"] = name
            if email is not None:
                # Check if email already exists for another admin
                for other_admin in admins_data.get("admins", []):
                    if other_admin.get("id") != admin_id and other_admin.get("email") == email:
                        raise ValueError(f"Email {email} already exists")
                admin["email"] = email
            if is_active is not None:
                admin["isActive"] = is_active
            if password is not None:
                # Hash the new password
                admin["passwordHash"] = _hash_password(password)
            
            admin["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            _save_json_file(ADMINS_AUTH_PATH, admins_data)
            
            # Return updated admin without password hash
            return {
                "id": admin.get("id"),
                "email": admin.get("email"),
                "name": admin.get("name"),
                "role": admin.get("role", "admin"),
                "isActive": admin.get("isActive", True),
                "createdAt": admin.get("createdAt"),
                "updatedAt": admin.get("updatedAt"),
            }
    
    return None


@async_auth_operation
async def delete_admin(admin_id: str) -> bool:
    """Delete an admin account."""
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    initial_count = len(admins_data.get("admins", []))
    admins_data["admins"] = [a for a in admins_data.get("admins", []) if a.get("id") != admin_id]
    
    if len(admins_data["admins"]) < initial_count:
        _save_json_file(ADMINS_AUTH_PATH, admins_data)
        return True
    
    return False


async def initialize_default_auth() -> None:
    """Initialize default user and admin accounts for testing."""
    users_data = _load_json_file(USERS_AUTH_PATH, {"users": []})
    admins_data = _load_json_file(ADMINS_AUTH_PATH, {"admins": []})
    
    # Create default user if none exists
    if not users_data.get("users"):
        try:
            await create_user("user@example.com", "password123", "Test User")
            print("✅ Created default user: user@example.com / password123")
        except ValueError:
            pass  # User already exists
    
    # Create default admin if none exists
    if not admins_data.get("admins"):
        try:
            await create_admin("admin@example.com", "admin123", "Test Admin")
            print("✅ Created default admin: admin@example.com / admin123")
        except ValueError:
            pass  # Admin already exists

