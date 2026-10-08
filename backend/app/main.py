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
