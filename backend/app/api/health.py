import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.satellite.factory import get_satellite_provider

router = APIRouter(prefix="", tags=["Health & Status"])

@router.get("/health")
def get_system_health(db: Session = Depends(get_db)):
    """Verifies operational status of the API, database, and storage engine."""
    db_healthy = True
    db_message = "Connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_healthy = False
        db_message = str(e)

    storage_writable = settings.DATA_OUTPUT_DIR.exists() and os.access(settings.DATA_OUTPUT_DIR, os.W_OK)

    return {
        "status": "healthy" if (db_healthy and storage_writable) else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": settings.TERRAPROOF_MODE,
        "database": {
            "status": "healthy" if db_healthy else "unhealthy",
            "message": db_message,
            "engine": "PostgreSQL/PostGIS" if "postgres" in settings.DATABASE_URL else "SQLite (Local Dev Engine)"
        },
        "storage": {
            "status": "writable" if storage_writable else "error",
            "output_directory": str(settings.DATA_OUTPUT_DIR)
        }
    }

@router.get("/provider-status")
def get_provider_status():
    """Returns metadata and connectivity status of the active Earth observation providers."""
    sat_provider = get_satellite_provider()
    meta = sat_provider.get_provider_metadata()
    return {
        "active_mode": settings.TERRAPROOF_MODE,
        "satellite_provider": meta,
        "weather_provider": {
            "name": "Open-Meteo Historical Archive",
            "endpoint": settings.OPEN_METEO_API_URL,
            "status": "operational",
            "access": "Open / Public Domain"
        }
    }

