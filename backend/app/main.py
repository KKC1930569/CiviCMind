from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
import app.models
from app.database import Base, engine, ensure_sqlite_columns
from app.routes import auth_router, reports_router, uploads_router
from app.utils.seed import seed_database

# Ensure tables and columns are created at initialization
Base.metadata.create_all(bind=engine)
ensure_sqlite_columns()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist, migrate columns, and seed demo accounts & reports
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns()
    try:
        seed_database()
    except Exception as e:
        print(f"Notice on seed: {e}")

    # Initialize and pre-load trained YOLO model into memory
    from app.services.ai import yolo_service
    try:
        yolo_service.initialize()
    except Exception as e:
        print(f"Notice on YOLO load: {e}")

    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CivicMind - AI-Powered Inclusive City Intelligence Platform",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(uploads_router, prefix=settings.API_V1_PREFIX)

# Direct Clean APIs as specified in Architecture requirements
from typing import Optional, List
from fastapi import UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ai import ai_service, AIDetectionResponse
from app.services.storage_service import storage_service
from app.schemas.report import DashboardStats, ReportResponse
from app.models.report import Report
from app.routes.reports import get_dashboard_stats
from app.auth.dependencies import get_current_user
from app.models.user import User

@app.post("/api/detect", response_model=AIDetectionResponse, tags=["AI Detection"])
async def direct_detect(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Direct YOLO inference endpoint:
    Accepts an uploaded image, runs the loaded YOLO model, and returns real detections.
    """
    upload = image or file
    if not upload or not upload.filename:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    file_url, stored_filename, file_size, content_type = await storage_service.save_upload_file(upload)
    file_path = settings.UPLOAD_DIR / stored_filename
    from app.ai.detector import detect_issue_response
    return detect_issue_response(str(file_path))

@app.get("/api/dashboard/stats", response_model=DashboardStats, tags=["Reports"])
def direct_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Direct dashboard metrics endpoint computed from database records.
    """
    return get_dashboard_stats(current_user=current_user, db=db)

@app.get("/api/map/reports", response_model=List[ReportResponse], tags=["Reports"])
def direct_map_reports(
    db: Session = Depends(get_db)
):
    """
    Direct map incidents endpoint returning reports with geographic coordinates.
    """
    return db.query(Report).filter(Report.latitude.isnot(None), Report.longitude.isnot(None)).all()

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": "AI-Powered Inclusive City Intelligence Platform",
        "pipeline": [
            "DETECT", "UNDERSTAND", "IMPACT", "PREDICT", 
            "SIMULATE", "PRIORITIZE", "ROUTE", "REPAIR"
        ],
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "CivicMind Core API"}

