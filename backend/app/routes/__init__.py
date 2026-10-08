from app.routes.auth import router as auth_router
from app.routes.reports import router as reports_router
from app.routes.uploads import router as uploads_router

__all__ = ["auth_router", "reports_router", "uploads_router"]
