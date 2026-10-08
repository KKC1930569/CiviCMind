import os
import uuid
import mimetypes
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

class StorageService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> Tuple[str, str, int, str]:
        """
        Saves an uploaded file with a secure UUID filename.
        Returns: (file_url, stored_filename, file_size, mime_type)
        """
        content_type = upload_file.content_type or ""
        # Determine extension
        ext = ALLOWED_MIME_TYPES.get(content_type)
        if not ext:
            # Fallback by original filename extension
            original_ext = Path(upload_file.filename or "").suffix.lower()
            if original_ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                ext = original_ext
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF."
                )

        secure_filename = f"{uuid.uuid4().hex}{ext}"
        destination_path = settings.UPLOAD_DIR / secure_filename

        # Stream save to prevent memory exhaustion
        total_size = 0
        with open(destination_path, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024): # 1MB chunks
                total_size += len(chunk)
                if total_size > 20 * 1024 * 1024: # 20MB max
                    # Remove incomplete file
                    f.close()
                    if destination_path.exists():
                        destination_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File size exceeds maximum limit of 20MB."
                    )
                f.write(chunk)

        # Publicly accessible route URL for frontend
        file_url = f"/api/uploads/{secure_filename}"
        return file_url, secure_filename, total_size, content_type

storage_service = StorageService()
