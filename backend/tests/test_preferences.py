"""
AURA Preferences Tests
Validates default creation, updating preferences, style enum validation, and user isolation.
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db

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


def get_authenticated_user_token(name="Test User"):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": unique_email,
        "password": "password123"
    })
    assert resp.status_code == 201
    return resp.json()["access_token"]


def test_get_default_preferences():
    token = get_authenticated_user_token("User Alpha")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/preferences", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["styles"] == []
    assert data["favorite_colors"] == []
    assert data["avoid_colors"] == []
    assert data["city"] is None
    assert data["onboarding_done"] is False


def test_update_preferences():
    token = get_authenticated_user_token("User Beta")
    headers = {"Authorization": f"Bearer {token}"}

    update_payload = {
        "styles": ["casual", "streetwear"],
        "favorite_colors": ["#4B2E9E", "#FFFFFF"],
        "avoid_colors": ["#FF0000"],
        "city": "Mumbai",
        "onboarding_done": True,
    }
    resp = client.put("/api/v1/preferences", headers=headers, json=update_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["styles"] == ["casual", "streetwear"]
    assert data["favorite_colors"] == ["#4B2E9E", "#FFFFFF"]
    assert data["avoid_colors"] == ["#FF0000"]
    assert data["city"] == "Mumbai"
    assert data["onboarding_done"] is True

    # Verify GET returns updated data
    get_resp = client.get("/api/v1/preferences", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["city"] == "Mumbai"


def test_preference_user_isolation():
    token_1 = get_authenticated_user_token("User One")
    token_2 = get_authenticated_user_token("User Two")

    # User 1 updates city and style
    client.put("/api/v1/preferences", headers={"Authorization": f"Bearer {token_1}"}, json={
        "city": "Pune",
        "styles": ["ethnic"]
    })

    # User 2 should still have default preferences, unaffected by User 1
    resp_2 = client.get("/api/v1/preferences", headers={"Authorization": f"Bearer {token_2}"})
    assert resp_2.status_code == 200
    data_2 = resp_2.json()
    assert data_2["city"] is None
    assert data_2["styles"] == []


def test_invalid_style_rejected():
    token = get_authenticated_user_token("User Gamma")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.put("/api/v1/preferences", headers=headers, json={
        "styles": ["invalid_fantasy_style"]
    })
    assert resp.status_code == 422


def test_unauthenticated_preferences():
    resp = client.get("/api/v1/preferences")
    assert resp.status_code == 401
