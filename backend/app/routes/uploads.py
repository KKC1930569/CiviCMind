import re
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])

SAFE_FILENAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp|gif)$", re.IGNORECASE)

@router.get("/{filename}")
def serve_upload(filename: str):
    """
    Safely serves uploaded evidence files without arbitrary path traversal.
    """
    if not SAFE_FILENAME_REGEX.match(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename requested."
        )

    file_path = (settings.UPLOAD_DIR / filename).resolve()
    
    # Path traversal check
    if not str(file_path).startswith(str(settings.UPLOAD_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence file not found."
        )

    return FileResponse(file_path)
