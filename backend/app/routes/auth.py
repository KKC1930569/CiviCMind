import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.password_reset import PasswordResetToken
from app.schemas.auth import (
    UserRegister, 
    AuthorityRegister,
    UserLogin, 
    UserResponse, 
    Token,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

VALID_AUTHORITY_CODES = {"CIVIC-AUTHORITY-2026", "MUNICIPAL-2026", "CIVICMIND-ADMIN"}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Public citizen registration endpoint.
    Strictly registers users with CITIZEN role.
    """
    email_clean = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    hashed = hash_password(user_in.password)
    user = User(
        email=email_clean,
        full_name=user_in.full_name.strip(),
        hashed_password=hashed,
        role=UserRole.CITIZEN.value,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/register/authority", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_authority(user_in: AuthorityRegister, db: Session = Depends(get_db)):
    """
    Protected authority onboarding endpoint.
    Requires municipal department credentials and authorization key.
    """
    email_clean = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Verify authorization credentials
    code = (user_in.access_code or "").strip().upper()
    is_gov_domain = any(email_clean.endswith(d) for d in [".gov", ".mil", ".gov.uk", ".gov.ca", "civicmind.org"])
    
    if code not in VALID_AUTHORITY_CODES and not is_gov_domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authority registration requires a valid municipal authorization code (e.g. CIVIC-AUTHORITY-2026 for development) or official government credentials."
        )

    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    full_display = f"{user_in.full_name.strip()} ({user_in.department.strip()})"
    hashed = hash_password(user_in.password)
    user = User(
        email=email_clean,
        full_name=full_display,
        hashed_password=hashed,
        role=UserRole.AUTHORITY.value,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user and issues a signed JWT bearer token (JSON format).
    """
    email_clean = login_in.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account has been deactivated. Please contact support."
        )
    
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Standard OAuth2 password flow endpoint for Swagger UI Authorize button and OAuth2 clients.
    """
    email_clean = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account has been deactivated. Please contact support."
        )
    
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user's profile.
    """
    return current_user

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generates a secure password reset token for account recovery.
    """
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    generic_msg = "If an account exists for this email, password reset instructions have been generated."
    dev_link = None
    dev_token = None

    if user and user.is_active:
        # Invalidate any previously active tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.is_used == False
        ).update({"is_used": True})

        # Generate fresh token
        token_str = secrets.token_urlsafe(32)
        reset_entry = PasswordResetToken(
            user_id=user.id,
            token=token_str,
            expires_at=datetime.utcnow() + timedelta(hours=1),
            is_used=False
        )
        db.add(reset_entry)
        db.commit()

        dev_link = f"http://localhost:5173/reset-password?token={token_str}"
        dev_token = token_str
        print(f"\n[CivicMind Auth] Password reset link for {email_clean}: {dev_link}\n")

    return ForgotPasswordResponse(
        message=generic_msg,
        dev_reset_link=dev_link,
        dev_reset_token=dev_token
    )

@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates token and updates user password with Argon2 hashing.
    """
    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token
    ).first()

    if not reset_entry or reset_entry.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used password reset token. Please request a new link."
        )

    if reset_entry.expires_at < datetime.utcnow():
        reset_entry.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired. Please request a new one."
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account associated with this token is not active."
        )

    # Secure update with Argon2
    user.hashed_password = hash_password(req.new_password)
    reset_entry.is_used = True
    db.commit()

    return ResetPasswordResponse(
        message="Your password has been reset successfully. You can now sign in with your new password.",
        success=True
    )
