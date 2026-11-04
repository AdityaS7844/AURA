"""
AURA Weather Router
Fetches live weather and temperature classification for a given city or the user's saved city.
Complies with 04_API.txt section D and 08_SCHEMA.txt.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.preference import Preference
from app.schemas.weather import WeatherOut
from app.services.weather_service import WeatherService
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("", response_model=WeatherOut)
async def get_weather(
    city: Optional[str] = Query(None, description="City name to fetch weather for"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves live current weather and weather class.
    If 'city' query parameter is not provided, defaults to the user's saved home city, or 'Mumbai'.
    """
    target_city = city
    if not target_city or not target_city.strip():
        # Check user's saved preference
        pref = db.query(Preference).filter(Preference.user_id == current_user.id).first()
        if pref and pref.city and pref.city.strip():
            target_city = pref.city.strip()
        else:
            target_city = "Mumbai"

    return await WeatherService.get_weather_for_city(target_city)
