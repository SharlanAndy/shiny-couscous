"""
Authentication API endpoints for user and admin login.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional

from labuan_fsa.auth_json import (
    authenticate_user,
    authenticate_admin,
    create_session,
    validate_session,
    delete_session,
    create_user as create_user_account,
    create_admin as create_admin_account,
    initialize_default_auth,
    get_user_by_id,
    update_user_profile,
    change_user_password,
    delete_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "user"  # "user" or "admin"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: str = "user"  # "user" or "admin"


class LoginResponse(BaseModel):
    token: str
    user: dict
    role: str


class LogoutResponse(BaseModel):
    message: str


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Get current user from session token."""
    if not credentials:
        return None
    
    session = await validate_session(credentials.credentials)
    if not session:
        return None
    
    return session


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Login endpoint for users and admins.
    
    Args:
        request: Login credentials (email, password, role)
        
    Returns:
        Login response with token and user info
    """
    await initialize_default_auth()
    
    if request.role == "admin":
        user = await authenticate_admin(request.email, request.password)
    else:
        user = await authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    token = await create_session(user["id"], user["role"])
    
    return LoginResponse(
        token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
        },
        role=user["role"],
    )


@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest) -> LoginResponse:
    """
    Register endpoint for new users.
    
    Args:
        request: Registration data (email, password, name, role)
        
    Returns:
        Login response with token and user info
    """
    await initialize_default_auth()
    
    try:
        if request.role == "admin":
            user = await create_admin_account(request.email, request.password, request.name)
        else:
            user = await create_user_account(request.email, request.password, request.name)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
    token = await create_session(user["id"], user["role"])
    
    return LoginResponse(
        token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
        },
        role=user["role"],
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> LogoutResponse:
    """
    Logout endpoint.
    
    Args:
        credentials: Bearer token
        
    Returns:
        Logout confirmation
    """
    if credentials:
        await delete_session(credentials.credentials)
    
    return LogoutResponse(message="Logged out successfully")


@router.get("/me")
async def get_current_user_info(
    current_user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """
    Get current user information.
    
    Args:
        current_user: Current user from session
        
    Returns:
        User information
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Get full user details
    user_id = current_user.get("userId")
    user = await get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return user


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class AccountDeleteRequest(BaseModel):
    password: str


@router.put("/profile", response_model=dict)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """
    Update current user's profile.
    
    Args:
        request: Profile update data (name, email)
        current_user: Current user from session
        
    Returns:
        Updated user information with emailChanged flag if email was changed
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    user_id = current_user.get("userId")
    
    # Check if email is being changed
    email_changed = False
    if request.email:
        user = await get_user_by_id(user_id)
        if user and user.get("email") != request.email:
            email_changed = True
    
    try:
        user = await update_user_profile(
            user_id,
            name=request.name,
            email=request.email
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Add flag to indicate email changed
        if email_changed:
            user["emailChanged"] = True
        
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/change-password", response_model=dict)
async def change_password(
    request: PasswordChangeRequest,
    current_user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """
    Change user password.
    
    Args:
        request: Password change data (current_password, new_password)
        current_user: Current user from session
        
    Returns:
        Success message
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    user_id = current_user.get("userId")
    
    try:
        success = await change_user_password(
            user_id,
            request.current_password,
            request.new_password
        )
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/account/delete", response_model=dict)
async def delete_account(
    request: AccountDeleteRequest,
    current_user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """
    Delete user account.
    
    Args:
        request: Account deletion data (password)
        current_user: Current user from session
        
    Returns:
        Success message
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    user_id = current_user.get("userId")
    
    try:
        success = await delete_user(user_id, request.password)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete all sessions for this user
        # This will be handled by delete_user function
        
        return {"message": "Account deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
