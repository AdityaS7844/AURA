"""
AURA Weather Tests
Validates temperature classification, WMO mapping, geocoding, forecasting,
caching, unknown city 404, and provider failure 502 handling.
"""

import uuid
import pytest
import httpx
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app.services.weather_service import WeatherService

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def get_auth_token():
    unique_email = f"weather_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": "Weather User",
        "email": unique_email,
        "password": "password123"
    })
    assert resp.status_code == 201
    return resp.json()["access_token"]


def test_temperature_classification():
    assert WeatherService.classify_temperature(35.0) == "hot"
    assert WeatherService.classify_temperature(30.0) == "hot"
    assert WeatherService.classify_temperature(29.9) == "warm"
    assert WeatherService.classify_temperature(22.0) == "warm"
    assert WeatherService.classify_temperature(21.9) == "mild"
    assert WeatherService.classify_temperature(15.0) == "mild"
    assert WeatherService.classify_temperature(14.9) == "cool"
    assert WeatherService.classify_temperature(8.0) == "cool"
    assert WeatherService.classify_temperature(7.9) == "cold"
    assert WeatherService.classify_temperature(-2.0) == "cold"


def test_wmo_code_mapping():
    condition, is_rainy = WeatherService.map_wmo_code(0)
    assert condition == "Clear sky"
    assert is_rainy is False

    condition, is_rainy = WeatherService.map_wmo_code(61)
    assert "rain" in condition.lower()
    assert is_rainy is True

    condition, is_rainy = WeatherService.map_wmo_code(95)
    assert "thunderstorm" in condition.lower()
    assert is_rainy is True


@pytest.mark.asyncio
async def test_weather_endpoint_success_and_caching(monkeypatch):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    WeatherService.clear_cache()

    call_count = 0

    async def mock_geocode(cls, city_name, client):
        nonlocal call_count
        call_count += 1
        return "Mumbai", 19.07, 72.87

    async def mock_forecast(cls, lat, lon, display_name, client):
        from app.schemas.weather import WeatherOut
        return WeatherOut(
            city=display_name,
            temp_c=28.5,
            feels_like_c=31.0,
            condition="Partly cloudy",
            rain_probability=15,
            weather_class="warm",
            is_rainy=False,
        )

    monkeypatch.setattr(WeatherService, "geocode_city", classmethod(mock_geocode))
    monkeypatch.setattr(WeatherService, "get_current_weather", classmethod(mock_forecast))

    # First call: hits service
    resp1 = client.get("/api/v1/weather?city=Mumbai", headers=headers)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["city"] == "Mumbai"
    assert data1["temp_c"] == 28.5
    assert data1["class"] == "warm"
    assert data1["is_rainy"] is False
    assert call_count == 1

    # Second call for same city: uses in-memory cache, call_count remains 1
    resp2 = client.get("/api/v1/weather?city=mumbai", headers=headers)
    assert resp2.status_code == 200
    assert resp2.json()["temp_c"] == 28.5
    assert call_count == 1


@pytest.mark.asyncio
async def test_weather_unknown_city_404(monkeypatch):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    WeatherService.clear_cache()

    async def mock_geocode_not_found(cls, city_name, client):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found.")

    monkeypatch.setattr(WeatherService, "geocode_city", classmethod(mock_geocode_not_found))

    resp = client.get("/api/v1/weather?city=NonExistentCityXYZ", headers=headers)
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_weather_provider_timeout_502(monkeypatch):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    WeatherService.clear_cache()

    async def mock_geocode_timeout(cls, city_name, client):
        from fastapi import HTTPException
        raise HTTPException(status_code=502, detail="Weather geocoding provider unavailable or timed out.")

    monkeypatch.setattr(WeatherService, "geocode_city", classmethod(mock_geocode_timeout))

    resp = client.get("/api/v1/weather?city=Pune", headers=headers)
    assert resp.status_code == 502
    assert "unavailable" in resp.json()["detail"].lower()
