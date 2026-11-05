"""
AURA Insights Service & Endpoint Integration Tests
Verifies wardrobe statistics, category breakdowns, wear frequency,
saved outfit counts, user isolation, and empty wardrobe handling.
Strictly matching Milestone 9 specification.
"""

import uuid
from unittest.mock import patch, AsyncMock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.schemas.outfit import GeminiStructuredResponse, GeminiRecommendationItem
from app.services.gemini_service import GeminiService


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


def create_user_with_token(name="Insight User"):
    unique_email = f"insight_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": unique_email,
        "password": "password123"
    })
    assert resp.status_code == 201
    return resp.json()["access_token"], resp.json()["user"]["id"]


def add_clothing_item(token, category, name, sub_type=None):
    default_subtypes = {
        "top": "shirt",
        "bottom": "jeans",
        "dress": "casual_dress",
        "outerwear": "jacket",
        "footwear": "sneakers",
        "accessory": "watch",
    }
    st = sub_type or default_subtypes.get(category, "shirt")
    resp = client.post(
        "/api/v1/wardrobe/items",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": name,
            "category": category,
            "sub_type": st,
            "color_name": "Blue",
            "color_hex": "#0000FF",
            "pattern": "solid",
            "season": "all",
            "formality": "2",
            "warmth": "2",
            "occasions": "casual, office",
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def test_empty_wardrobe_insights():
    """Users with 0 items get clean zeroed summary without errors."""
    token, _ = create_user_with_token("Empty User")
    resp = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 0
    assert data["by_category"] == {}
    assert data["most_worn"] == []
    assert data["never_worn"] == []
    assert data["saved_outfits"] == 0


def test_insights_category_counts():
    """Correctly groups counts by clothing category."""
    token, _ = create_user_with_token("Category User")
    add_clothing_item(token, "top", "Top 1")
    add_clothing_item(token, "top", "Top 2")
    add_clothing_item(token, "bottom", "Bottom 1")
    add_clothing_item(token, "footwear", "Shoes 1")

    resp = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 4
    assert data["by_category"].get("top") == 2
    assert data["by_category"].get("bottom") == 1
    assert data["by_category"].get("footwear") == 1


def test_insights_most_worn_and_never_worn():
    """Items with times_worn > 0 appear in most_worn; 0 wear items appear in never_worn."""
    token, _ = create_user_with_token("Wear User")
    id_worn1 = add_clothing_item(token, "top", "Frequently Worn Top")
    id_worn2 = add_clothing_item(token, "bottom", "Sometimes Worn Pants")
    id_unworn = add_clothing_item(token, "outerwear", "Brand New Jacket")

    # Manually mark wear
    for _ in range(5):
        client.post(f"/api/v1/wardrobe/items/{id_worn1}/worn", headers={"Authorization": f"Bearer {token}"})
    for _ in range(2):
        client.post(f"/api/v1/wardrobe/items/{id_worn2}/worn", headers={"Authorization": f"Bearer {token}"})

    resp = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    # Most worn items check
    assert len(data["most_worn"]) == 2
    assert data["most_worn"][0]["id"] == id_worn1
    assert data["most_worn"][0]["times_worn"] == 5
    assert data["most_worn"][1]["id"] == id_worn2
    assert data["most_worn"][1]["times_worn"] == 2

    # Never worn check
    never_ids = [it["id"] for it in data["never_worn"]]
    assert id_unworn in never_ids
    assert id_worn1 not in never_ids


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_insights_saved_and_styled_counts(mock_gemini):
    """Correctly counts saved and liked outfits."""
    token, _ = create_user_with_token("Saved Count User")
    top = add_clothing_item(token, "top", "Tee")
    bottom = add_clothing_item(token, "bottom", "Jeans")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Casual Style",
                item_ids=[top, bottom],
                reason="Cool combination.",
                style="casual",
                occasion="casual",
                match_score=90,
            )
        ]
    )

    suggest_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    outfit_id = suggest_resp.json()["outfits"][0]["id"]

    # Save and like outfit
    client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "save"},
    )
    client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "like"},
    )

    resp = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["saved_outfits"] == 1
    assert data["liked_outfits"] == 1
    assert data["total_outfits_styled"] == 1


def test_insights_user_isolation():
    """User A and User B insights are completely isolated."""
    token_a, _ = create_user_with_token("User A")
    token_b, _ = create_user_with_token("User B")

    add_clothing_item(token_a, "top", "User A Shirt")
    add_clothing_item(token_b, "dress", "User B Dress")

    resp_a = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token_a}"})
    resp_b = client.get("/api/v1/insights/summary", headers={"Authorization": f"Bearer {token_b}"})

    assert resp_a.json()["total_items"] == 1
    assert resp_a.json()["by_category"] == {"top": 1}

    assert resp_b.json()["total_items"] == 1
    assert resp_b.json()["by_category"] == {"dress": 1}
