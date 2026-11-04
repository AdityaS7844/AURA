"""
AURA FastAPI Application Entrypoint
Provides CORS configuration, lifecycle events, /health status, and API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
import app.models  # Ensures all SQLAlchemy models are registered
from app.routers.auth import router as auth_router
from app.routers.preferences import router as preferences_router

settings = get_settings()

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AURA - AI Personalized Wardrobe API",
    description="Backend API for AURA personal wardrobe and outfit stylist.",
    version="1.0.0"
)

# CORS configuration allowing the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System Health Check
@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    """Health check endpoint to verify backend service availability."""
    return {"status": "ok"}


# Authentication Router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Preferences Router
app.include_router(preferences_router, prefix="/api/v1/preferences", tags=["Preferences"])
app.include_router(preferences_router, prefix="/preferences", tags=["Preferences"])
