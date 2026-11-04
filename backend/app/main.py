"""
AURA FastAPI Application Entrypoint
Provides CORS configuration, lifecycle events, and /health status.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

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
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    """Health check endpoint to verify backend service availability."""
    return {"status": "ok"}
