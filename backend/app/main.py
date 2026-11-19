"""
AURA FastAPI Application Entrypoint
Provides CORS configuration, lifecycle events, /health status, and API routers.
"""

from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
import app.models  # Ensures all SQLAlchemy models are registered
from app.routers.auth import router as auth_router
from app.routers.preferences import router as preferences_router
from app.routers.wardrobe import router as wardrobe_router
from app.routers.weather import router as weather_router
from app.routers.outfits import router as outfits_router
from app.routers.insights import router as insights_router
from app.routers.planner import router as planner_router

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
    allow_origin_regex=r"https://.*\.vercel\.app",
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

# Wardrobe Router
app.include_router(wardrobe_router, prefix="/api/v1/wardrobe", tags=["Wardrobe"])
app.include_router(wardrobe_router, prefix="/wardrobe", tags=["Wardrobe"])

# Weather Router
app.include_router(weather_router, prefix="/api/v1/weather", tags=["Weather"])
app.include_router(weather_router, prefix="/weather", tags=["Weather"])

# Outfits Router
app.include_router(outfits_router, prefix="/api/v1/outfits", tags=["Outfits"])
app.include_router(outfits_router, prefix="/outfits", tags=["Outfits"])

# Insights Router
app.include_router(insights_router, prefix="/api/v1/insights", tags=["Insights"])
app.include_router(insights_router, prefix="/insights", tags=["Insights"])

# Planner Router
app.include_router(planner_router, prefix="/api/v1/planner", tags=["Planner"])
app.include_router(planner_router, prefix="/planner", tags=["Planner"])


# Static Image Serving (Section H of 04_API.txt)
@app.get("/api/v1/uploads/{user_id}/{filename}", tags=["Uploads"])
@app.get("/uploads/{user_id}/{filename}", tags=["Uploads"])
def get_uploaded_image(user_id: int, filename: str):
    """Secure image file serving preventing directory traversal."""
    base_dir = Path(settings.UPLOAD_DIR).resolve()
    target_path = (base_dir / str(user_id) / filename).resolve()

    if base_dir not in target_path.parents:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    if not target_path.exists() or not target_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return FileResponse(target_path)
