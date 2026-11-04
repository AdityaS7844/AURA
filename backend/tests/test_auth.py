"""
AURA Authentication Tests
Validates register, login, duplicate detection, JWT verification, and password updates.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db

# Use an isolated in-memory SQLite database with StaticPool so all connections share the memory DB
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
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


def test_register_success():
    payload = {
        "name": "Rutuja Shinde",
        "email": "rutuja@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "rutuja@example.com"
    assert data["user"]["name"] == "Rutuja Shinde"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_register_duplicate_email():
    payload = {
        "name": "Duplicate User",
        "email": "rutuja@example.com",
        "password": "anotherpassword123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_login_success():
    payload = {
        "email": "rutuja@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "rutuja@example.com"
    assert "password_hash" not in data["user"]


def test_login_invalid_password():
    payload = {
        "email": "rutuja@example.com",
        "password": "wrongpassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_login_nonexistent_user():
    payload = {
        "email": "nonexistent@example.com",
        "password": "somepassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_current_user_me():
    # Login to obtain token
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "rutuja@example.com",
        "password": "securepassword123"
    })
    token = login_resp.json()["access_token"]

    # Call /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["email"] == "rutuja@example.com"
    assert "password_hash" not in user_data


def test_protected_route_unauthorized():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_change_password_and_login_with_new():
    # Login with current password
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "rutuja@example.com",
        "password": "securepassword123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt change password with wrong old password
    bad_change_resp = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"old_password": "wrong_old_password", "new_password": "brandnewpassword456"}
    )
    assert bad_change_resp.status_code == 400

    # Change password with valid old password
    change_resp = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"old_password": "securepassword123", "new_password": "brandnewpassword456"}
    )
    assert change_resp.status_code == 204

    # Verify old password no longer works
    failed_login = client.post("/api/v1/auth/login", json={
        "email": "rutuja@example.com",
        "password": "securepassword123"
    })
    assert failed_login.status_code == 401

    # Verify new password works
    success_login = client.post("/api/v1/auth/login", json={
        "email": "rutuja@example.com",
        "password": "brandnewpassword456"
    })
    assert success_login.status_code == 200
