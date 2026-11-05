"""AURA API Routers Package"""

from app.routers.auth import router as auth_router, get_current_user
from app.routers.preferences import router as preferences_router
from app.routers.wardrobe import router as wardrobe_router
from app.routers.weather import router as weather_router
from app.routers.outfits import router as outfits_router
from app.routers.insights import router as insights_router

__all__ = [
    "auth_router",
    "preferences_router",
    "wardrobe_router",
    "weather_router",
    "outfits_router",
    "insights_router",
    "get_current_user",
]
