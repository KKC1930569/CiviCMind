import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    BASE_DIR: Path = BASE_DIR
    PROJECT_NAME: str = "CivicMind"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database
    _default_db = (BASE_DIR / "civicmind.db") if (BASE_DIR / "civicmind.db").exists() else (
        (BASE_DIR / "urbaneye.db") if (BASE_DIR / "urbaneye.db").exists() else (BASE_DIR / "civicmind.db")
    )
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_default_db}")

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicmind-super-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

    # Storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

    # AI / YOLO Model Configuration
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", str(BASE_DIR / "models" / "best.pt"))
    YOLO_CONFIDENCE_THRESHOLD: float = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.25"))

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
