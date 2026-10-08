from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from pwdlib import PasswordHash
from jose import jwt, JWTError
from app.config import settings

# Initialize password hash with pwdlib recommended settings (Argon2)
pwd_context = PasswordHash.recommended()

def hash_password(password: str) -> str:
    """Hash a plaintext password using pwdlib Argon2."""
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored Argon2 hash."""
    return pwd_context.verify(password, hashed_password)

def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a signed JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
