"""
AURA Wardrobe Tests
Validates clothing CRUD, image upload/resizing, invalid file rejection,
user isolation, wear tracking, and image file deletion on item removal.
"""

import io
import os
import uuid
from pathlib import Path
import pytest
from PIL import Image
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


def get_authenticated_user_token(name="Wardrobe User"):
    unique_email = f"wardrobe_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": unique_email,
        "password": "password123"
    })
    assert resp.status_code == 201
    return resp.json()["access_token"], resp.json()["user"]["id"]


def create_test_image_bytes(width=1200, height=800, color="purple", format="JPEG"):
    """Creates in-memory image bytes for testing upload and resizing."""
    file_bytes = io.BytesIO()
    image = Image.new("RGB", (width, height), color=color)
    image.save(file_bytes, format=format)
    file_bytes.seek(0)
    return file_bytes


def test_create_item_without_image():
    token, user_id = get_authenticated_user_token("User NoImage")
    headers = {"Authorization": f"Bearer {token}"}

    form_data = {
        "name": "Classic Oxford Shirt",
        "category": "top",
        "sub_type": "shirt",
        "color_name": "White",
        "color_hex": "#FFFFFF",
        "pattern": "solid",
        "season": "all",
        "formality": "4",
        "warmth": "2",
        "occasions": "office, formal",
        "fabric": "Cotton",
        "notes": "Work shirt",
    }
    resp = client.post("/api/v1/wardrobe/items", headers=headers, data=form_data)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Classic Oxford Shirt"
    assert data["category"] == "top"
    assert data["occasions"] == ["office", "formal"]
    assert data["times_worn"] == 0
    assert data["image_url"] is None


def test_create_item_with_image_and_resizing():
    token, user_id = get_authenticated_user_token("User Image")
    headers = {"Authorization": f"Bearer {token}"}

    # Create image with dimensions 1600x1200 (exceeding MAX_DIMENSION 1024px)
    image_bytes = create_test_image_bytes(width=1600, height=1200)

    form_data = {
        "name": "Purple Oversized Shirt",
        "category": "top",
        "color_name": "Purple",
        "color_hex": "#7355CF",
    }
    files = {
        "image": ("test_purple.jpg", image_bytes, "image/jpeg")
    }

    resp = client.post("/api/v1/wardrobe/items", headers=headers, data=form_data, files=files)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Purple Oversized Shirt"
    assert data["image_url"] is not None
    assert f"/api/v1/uploads/{user_id}/" in data["image_url"]

    # Verify image was saved on disk and resized <= 1024
    relative_path = data["image_url"].replace("/api/v1/", "")
    assert os.path.exists(relative_path)
    with Image.open(relative_path) as saved_img:
        assert saved_img.width <= 1024
        assert saved_img.height <= 1024

    # Cleanup item and verify image deleted
    item_id = data["id"]
    del_resp = client.delete(f"/api/v1/wardrobe/items/{item_id}", headers=headers)
    assert del_resp.status_code == 204
    assert not os.path.exists(relative_path)


def test_reject_invalid_image_type():
    token, _ = get_authenticated_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    bad_file = io.BytesIO(b"Not an image file content")
    form_data = {
        "name": "Invalid File Item",
        "category": "top",
        "color_name": "Red",
        "color_hex": "#FF0000",
    }
    files = {
        "image": ("malicious.txt", bad_file, "text/plain")
    }

    resp = client.post("/api/v1/wardrobe/items", headers=headers, data=form_data, files=files)
    assert resp.status_code == 400
    assert "unsupported" in resp.json()["detail"].lower()


def test_reject_oversized_image():
    token, _ = get_authenticated_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy bytes > 5 MB (5.2 MB)
    large_bytes = io.BytesIO(b"0" * (5 * 1024 * 1024 + 200 * 1024))
    form_data = {
        "name": "Heavy File Item",
        "category": "top",
        "color_name": "Black",
        "color_hex": "#000000",
    }
    files = {
        "image": ("heavy.jpg", large_bytes, "image/jpeg")
    }

    resp = client.post("/api/v1/wardrobe/items", headers=headers, data=form_data, files=files)
    assert resp.status_code == 400
    assert "exceeds 5 mb" in resp.json()["detail"].lower()


def test_list_items_and_filtering():
    token, user_id = get_authenticated_user_token("User Filter")
    headers = {"Authorization": f"Bearer {token}"}

    # Add 2 items: 1 top, 1 bottom
    client.post("/api/v1/wardrobe/items", headers=headers, data={
        "name": "Blue Jeans",
        "category": "bottom",
        "color_name": "Blue",
        "color_hex": "#0000FF",
        "season": "all"
    })
    client.post("/api/v1/wardrobe/items", headers=headers, data={
        "name": "Red Cotton Hoodie",
        "category": "top",
        "color_name": "Red",
        "color_hex": "#FF0000",
        "season": "winter"
    })

    # List all
    all_resp = client.get("/api/v1/wardrobe/items", headers=headers)
    assert all_resp.status_code == 200
    assert all_resp.json()["total"] == 2

    # Filter by category bottom
    bottom_resp = client.get("/api/v1/wardrobe/items?category=bottom", headers=headers)
    assert bottom_resp.status_code == 200
    assert bottom_resp.json()["total"] == 1
    assert bottom_resp.json()["items"][0]["name"] == "Blue Jeans"

    # Filter by search term 'Hoodie'
    search_resp = client.get("/api/v1/wardrobe/items?search=hoodie", headers=headers)
    assert search_resp.status_code == 200
    assert search_resp.json()["total"] == 1
    assert search_resp.json()["items"][0]["name"] == "Red Cotton Hoodie"


def test_user_isolation_for_items():
    token_a, _ = get_authenticated_user_token("User A")
    token_b, _ = get_authenticated_user_token("User B")

    # User A creates an item
    resp_a = client.post("/api/v1/wardrobe/items", headers={"Authorization": f"Bearer {token_a}"}, data={
        "name": "Secret Jacket",
        "category": "outerwear",
        "color_name": "Black",
        "color_hex": "#000000"
    })
    item_id = resp_a.json()["id"]

    # User B attempts to GET User A's item -> 403 Forbidden
    resp_b_get = client.get(f"/api/v1/wardrobe/items/{item_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b_get.status_code == 403

    # User B attempts to DELETE User A's item -> 403 Forbidden
    resp_b_del = client.delete(f"/api/v1/wardrobe/items/{item_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b_del.status_code == 403

    # User B lists items -> User A's item does not appear
    resp_b_list = client.get("/api/v1/wardrobe/items", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b_list.json()["total"] == 0


def test_mark_item_worn():
    token, _ = get_authenticated_user_token("User Wear")
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = client.post("/api/v1/wardrobe/items", headers=headers, data={
        "name": "Running Sneakers",
        "category": "footwear",
        "color_name": "White",
        "color_hex": "#FFFFFF"
    })
    item_id = create_resp.json()["id"]
    assert create_resp.json()["times_worn"] == 0
    assert create_resp.json()["last_worn"] is None

    # Mark worn
    worn_resp = client.post(f"/api/v1/wardrobe/items/{item_id}/worn", headers=headers)
    assert worn_resp.status_code == 200
    assert worn_resp.json()["times_worn"] == 1
    assert worn_resp.json()["last_worn"] is not None
