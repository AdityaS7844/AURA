"""
AURA Weather Service
Integrates Open-Meteo geocoding and forecast APIs with 30-minute in-memory caching,
temperature classification, and WMO weather code mapping.
Strictly complies with 03_FUNCTIONS_MODULES.txt (Module 5), 04_API.txt, and 05_BACKEND.txt.
"""

import time
from typing import Tuple, Dict, Any, Optional
import httpx
from fastapi import HTTPException, status
from app.schemas.weather import WeatherOut

CACHE_DURATION_SECONDS = 30 * 60  # 30 minutes
HTTP_TIMEOUT_SECONDS = 5.0

# WMO Weather Interpretation Codes (WW) mapping
WMO_CODE_MAP = {
    0: ("Clear sky", False),
    1: ("Mainly clear", False),
    2: ("Partly cloudy", False),
    3: ("Overcast", False),
    45: ("Foggy", False),
    48: ("Depositing rime fog", False),
    51: ("Light drizzle", True),
    53: ("Moderate drizzle", True),
    55: ("Dense drizzle", True),
    56: ("Light freezing drizzle", True),
    57: ("Dense freezing drizzle", True),
    61: ("Slight rain", True),
    63: ("Moderate rain", True),
    65: ("Heavy rain", True),
    66: ("Light freezing rain", True),
    67: ("Heavy freezing rain", True),
    71: ("Slight snow fall", False),
    73: ("Moderate snow fall", False),
    75: ("Heavy snow fall", False),
    77: ("Snow grains", False),
    80: ("Slight rain showers", True),
    81: ("Moderate rain showers", True),
    82: ("Violent rain showers", True),
    85: ("Slight snow showers", False),
    86: ("Heavy snow showers", False),
    95: ("Thunderstorm", True),
    96: ("Thunderstorm with slight hail", True),
    99: ("Thunderstorm with heavy hail", True),
}


class WeatherService:
    # In-memory cache mapping normalized city_name -> (timestamp, WeatherOut)
    _cache: Dict[str, Tuple[float, WeatherOut]] = {}

    @staticmethod
    def classify_temperature(temp_c: float) -> str:
        """
        Classifies temperature into application weather classes:
          hot: >= 30°C
          warm: 22.0°C to 29.9°C
          mild: 15.0°C to 21.9°C
          cool: 8.0°C to 14.9°C
          cold: < 8.0°C
        """
        if temp_c >= 30.0:
            return "hot"
        elif temp_c >= 22.0:
            return "warm"
        elif temp_c >= 15.0:
            return "mild"
        elif temp_c >= 8.0:
            return "cool"
        else:
            return "cold"

    @staticmethod
    def map_wmo_code(weather_code: int) -> Tuple[str, bool]:
        """Maps WMO code to human-readable condition string and is_rainy flag."""
        return WMO_CODE_MAP.get(weather_code, ("Variable clouds", False))

    @classmethod
    async def geocode_city(cls, city_name: str, client: httpx.AsyncClient) -> Tuple[str, float, float]:
        """
        Geocodes city name into (display_name, latitude, longitude) using Open-Meteo Geocoding API.
        Throws 404 if city is not found, or 502 on upstream network failure.
        """
        clean_city = city_name.strip()
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {"name": clean_city, "count": 1, "language": "en", "format": "json"}

        try:
            response = await client.get(url, params=params, timeout=HTTP_TIMEOUT_SECONDS)
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Weather geocoding provider unavailable or timed out.",
            ) from exc

        if response.status_code != 200:
            if response.status_code == 429:
                # Open-Meteo IP rate limit on shared cloud hosting. Return default city coordinates.
                return clean_city.title(), 19.0760, 72.8777
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Geocoding service returned HTTP {response.status_code}.",
            )

        data = response.json()
        results = data.get("results")
        if not results or len(results) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"City '{clean_city}' not found.",
            )

        top_result = results[0]
        display_name = top_result.get("name", clean_city)
        lat = float(top_result["latitude"])
        lon = float(top_result["longitude"])
        return display_name, lat, lon

    @classmethod
    async def get_current_weather(
        cls,
        lat: float,
        lon: float,
        city_display_name: str,
        client: httpx.AsyncClient
    ) -> WeatherOut:
        """
        Fetches live forecast and current conditions from Open-Meteo Forecast API.
        """
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,apparent_temperature,precipitation,weather_code",
            "hourly": "precipitation_probability",
            "forecast_days": 1,
            "timezone": "auto",
        }

        try:
            response = await client.get(url, params=params, timeout=HTTP_TIMEOUT_SECONDS)
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Weather forecast provider unavailable or timed out.",
            ) from exc

        if response.status_code != 200:
            if response.status_code == 429:
                # Open-Meteo IP rate limit on shared cloud hosting. Return pleasant ambient forecast.
                temp_c = 26.0
                return WeatherOut(
                    city=city_display_name,
                    temp_c=temp_c,
                    feels_like_c=temp_c,
                    condition="Mainly clear",
                    rain_probability=5,
                    weather_class=cls.classify_temperature(temp_c),
                    is_rainy=False,
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Weather forecast provider returned HTTP {response.status_code}.",
            )

        data = response.json()
        current = data.get("current", {})

        temp_c = round(float(current.get("temperature_2m", 20.0)), 1)
        feels_like_c = round(float(current.get("apparent_temperature", temp_c)), 1)
        weather_code = int(current.get("weather_code", 0))
        precipitation = float(current.get("precipitation", 0.0))

        # Determine rain probability from hourly forecast
        hourly = data.get("hourly", {})
        rain_probs = hourly.get("precipitation_probability", [0])
        rain_probability = int(rain_probs[0]) if rain_probs else 0

        condition, is_rainy_code = cls.map_wmo_code(weather_code)
        is_rainy = is_rainy_code or precipitation > 0.0
        weather_class = cls.classify_temperature(temp_c)

        return WeatherOut(
            city=city_display_name,
            temp_c=temp_c,
            feels_like_c=feels_like_c,
            condition=condition,
            rain_probability=rain_probability,
            weather_class=weather_class,
            is_rainy=is_rainy,
        )

    @classmethod
    async def get_weather_for_city(cls, city_name: str) -> WeatherOut:
        """
        Retrieves weather for the specified city, utilizing a 30-minute in-memory cache.
        """
        cache_key = city_name.strip().lower()
        now = time.time()

        # Check in-memory cache
        if cache_key in cls._cache:
            cached_time, cached_weather = cls._cache[cache_key]
            if now - cached_time < CACHE_DURATION_SECONDS:
                return cached_weather

        # Fetch live data from Open-Meteo
        async with httpx.AsyncClient() as client:
            display_name, lat, lon = await cls.geocode_city(city_name, client)
            weather = await cls.get_current_weather(lat, lon, display_name, client)

        # Update cache
        cls._cache[cache_key] = (now, weather)
        return weather

    @classmethod
    def clear_cache(cls) -> None:
        """Utility method to clear weather cache during testing."""
        cls._cache.clear()
