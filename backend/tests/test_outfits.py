"""
AURA Outfit & Gemini Service Integration Tests
Verifies wardrobe preconditions, anchor item enforcement, Gemini output post-processing,
unknown ID rejection, foreign user item rejection, structure checks, error handling (503),
and outfit retrieval by ID.
"""

import uuid
from unittest.mock import patch, AsyncMock
import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.outfit import Outfit
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


def create_user_with_token(name="Stylist User"):
    unique_email = f"outfit_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": unique_email,
        "password": "password123"
    })
    assert resp.status_code == 201
    return resp.json()["access_token"], resp.json()["user"]["id"]


def add_clothing_item(token, category, name, sub_type=None, formality=2, warmth=2):
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
            "color_name": "Navy",
            "color_hex": "#000080",
            "pattern": "solid",
            "season": "all",
            "formality": str(formality),
            "warmth": str(warmth),
            "occasions": "casual, office",
        },
    )
    assert resp.status_code == 201, f"Failed to create item: {resp.text}"
    return resp.json()["id"]


def test_insufficient_wardrobe_rejected():
    """Users with < 1 top and 1 bottom, and no dress, receive HTTP 400."""
    token, _ = create_user_with_token("Empty Wardrobe User")

    # Add only 1 top
    add_clothing_item(token, "top", "Lonely T-Shirt")

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 22.0},
    )
    assert resp.status_code == 400
    assert "Insufficient wardrobe items" in resp.json()["detail"]


def test_invalid_anchor_item_rejected():
    """Anchor items that do not exist or do not belong to the user return HTTP 400."""
    token, _ = create_user_with_token("Anchor User")
    add_clothing_item(token, "top", "Anchor Top")
    add_clothing_item(token, "bottom", "Anchor Bottom")

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "anchor_item_id": 99999, "temp_c": 20.0},
    )
    assert resp.status_code == 400
    assert "Anchor item #99999 does not exist" in resp.json()["detail"]


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_valid_recommendations_saved_and_returned(mock_gemini):
    """Verifies that valid Gemini recommendations pass strict validation, persist to SQLite, and return."""
    token, _ = create_user_with_token("Successful User")
    top_id = add_clothing_item(token, "top", "White Linen Shirt")
    bottom_id = add_clothing_item(token, "bottom", "Beige Chinos")
    shoes_id = add_clothing_item(token, "footwear", "Brown Loafers", sub_type="loafers")

    # Mock Gemini response
    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Smart Summer Chic",
                item_ids=[top_id, bottom_id, shoes_id],
                reason="Linen breathes well in warm weather while loafers keep it sharp.",
                style="casual",
                occasion="casual",
                match_score=92,
            )
        ],
        message="Generated 1 perfect outfit.",
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 28.0},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert "weather" in data
    assert data["weather"]["temp_c"] == 28.0
    assert data["weather"]["class"] == "warm"

    assert len(data["outfits"]) == 1
    outfit = data["outfits"][0]
    assert outfit["name"] == "Smart Summer Chic"
    assert outfit["score"] == 92
    assert len(outfit["items"]) == 3
    returned_ids = [it["id"] for it in outfit["items"]]
    assert top_id in returned_ids
    assert bottom_id in returned_ids
    assert shoes_id in returned_ids

    # Verify saved outfit can be fetched by ID
    get_resp = client.get(
        f"/api/v1/outfits/{outfit['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Smart Summer Chic"


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_unknown_item_id_discarded(mock_gemini):
    """Recommendations with nonexistent IDs are discarded; if all are invalid, returns 503."""
    token, _ = create_user_with_token("Hallucination Test User")
    top_id = add_clothing_item(token, "top", "Black T-Shirt")
    bottom_id = add_clothing_item(token, "bottom", "Blue Jeans")

    # Gemini returns one outfit with an invented ID 88888
    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Hallucinated Outfit",
                item_ids=[top_id, bottom_id, 88888],  # 88888 does not exist
                reason="Great look with an imaginary watch.",
                style="casual",
                occasion="casual",
                match_score=80,
            )
        ]
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 21.0},
    )
    assert resp.status_code == 503
    assert "Unable to generate valid outfits" in resp.json()["detail"]


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_foreign_user_item_id_rejected(mock_gemini):
    """User B's item ID cannot be used by User A even if Gemini hallucinates it."""
    token_a, _ = create_user_with_token("User A")
    token_b, _ = create_user_with_token("User B")

    top_a = add_clothing_item(token_a, "top", "User A Shirt")
    bottom_a = add_clothing_item(token_a, "bottom", "User A Pants")
    jacket_b = add_clothing_item(token_b, "outerwear", "User B Jacket")

    # Gemini attempts to include User B's jacket in User A's outfit
    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Cross-Tenant Leak Attempt",
                item_ids=[top_a, bottom_a, jacket_b],
                reason="Warm jacket with user pants.",
                style="casual",
                occasion="casual",
                match_score=85,
            )
        ]
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"occasion": "casual", "temp_c": 18.0},
    )
    assert resp.status_code == 503  # Discarded because jacket_b is not owned by User A


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_anchor_item_enforced(mock_gemini):
    """Outfits omitting the anchor item are discarded."""
    token, _ = create_user_with_token("Anchor Enforcement User")
    top_1 = add_clothing_item(token, "top", "Floral Silk Top")
    top_2 = add_clothing_item(token, "top", "Plain White Tee")
    bottom = add_clothing_item(token, "bottom", "Black Slacks")

    # Gemini suggests top_2 + bottom, omitting requested anchor top_1
    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Ignored Anchor Outfit",
                item_ids=[top_2, bottom],
                reason="Nice casual look.",
                style="casual",
                occasion="casual",
                match_score=85,
            )
        ]
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "anchor_item_id": top_1, "temp_c": 22.0},
    )
    assert resp.status_code == 503  # Outfit omitted anchor, so discarded -> 503


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_structural_validation_enforced(mock_gemini):
    """Outfits lacking (top+bottom) OR dress are discarded (e.g. only shoes or outerwear)."""
    token, _ = create_user_with_token("Structure Test User")
    top = add_clothing_item(token, "top", "Graphic Tee")
    bottom = add_clothing_item(token, "bottom", "Cargo Pants")
    shoes = add_clothing_item(token, "footwear", "Sneakers", sub_type="sneakers")
    jacket = add_clothing_item(token, "outerwear", "Bomber Jacket")

    # Incomplete outfit: only jacket + shoes
    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Incomplete No-Clothes Look",
                item_ids=[jacket, shoes],
                reason="Cool outerwear and kicks.",
                style="streetwear",
                occasion="casual",
                match_score=60,
            )
        ]
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 19.0},
    )
    assert resp.status_code == 503  # Rejected for missing bottom and top


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_duplicate_item_id_rejected(mock_gemini):
    """Outfits with duplicate item IDs are discarded."""
    token, _ = create_user_with_token("Duplicate Test User")
    top = add_clothing_item(token, "top", "Polo")
    bottom = add_clothing_item(token, "bottom", "Jeans")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Duplicate Top Outfit",
                item_ids=[top, top, bottom],
                reason="Double polo shirt.",
                style="casual",
                occasion="casual",
                match_score=70,
            )
        ]
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    assert resp.status_code == 503


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_gemini_error_returns_503(mock_gemini):
    """When Gemini service raises an HTTPException (e.g. 503), it bubbles as 503."""
    token, _ = create_user_with_token("Error Handling User")
    add_clothing_item(token, "top", "Red Sweater")
    add_clothing_item(token, "bottom", "Wool Trousers")

    mock_gemini.side_effect = HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Gemini API quota exceeded",
    )

    resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "office", "temp_c": 15.0},
    )
    assert resp.status_code == 503
    assert "Gemini API quota exceeded" in resp.json()["detail"]


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_get_outfit_cross_user_forbidden(mock_gemini):
    """User B cannot view User A's outfit."""
    token_a, _ = create_user_with_token("Owner User")
    token_b, _ = create_user_with_token("Intruder User")

    top = add_clothing_item(token_a, "top", "Owner Shirt")
    bottom = add_clothing_item(token_a, "bottom", "Owner Shorts")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Owner's Private Outfit",
                item_ids=[top, bottom],
                reason="Private look.",
                style="casual",
                occasion="casual",
                match_score=90,
            )
        ]
    )

    suggest_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    assert suggest_resp.status_code == 200
    outfit_id = suggest_resp.json()["outfits"][0]["id"]

    resp = client.get(
        f"/api/v1/outfits/{outfit_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 403


def test_context_and_prompt_builders():
    """Validates compact context and prompt formatting logic."""
    weather_info = {
        "city": "Paris",
        "temp_c": 18.5,
        "class": "mild",
        "condition": "Cloudy",
        "is_rainy": False,
    }
    wardrobe = [
        {"id": 1, "name": "Striped Shirt", "category": "top", "color_name": "blue"},
        {"id": 2, "name": "Chinos", "category": "bottom", "color_name": "beige"},
    ]
    context = GeminiService.build_context(
        occasion="work",
        style="formal",
        weather=weather_info,
        wardrobe_items=wardrobe,
        count=3,
        anchor_item_id=1,
    )
    assert context["request"]["occasion"] == "work"
    assert context["request"]["anchor_item_id"] == 1
    assert len(context["wardrobe"]) == 2

    prompt = GeminiService.build_prompt(context)
    assert "Item ID 1 is the anchor item and MUST be included" in prompt
    assert "occasion 'work'" in prompt


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_feedback_like_dislike_mutual_exclusivity(mock_gemini):
    """Verifies that like and dislike are mutually exclusive and toggle correctly."""
    token, _ = create_user_with_token("Feedback User")
    top = add_clothing_item(token, "top", "Feedback Tee")
    bottom = add_clothing_item(token, "bottom", "Feedback Jeans")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Likeable Look",
                item_ids=[top, bottom],
                reason="Clean look.",
                style="casual",
                occasion="casual",
                match_score=90,
            )
        ]
    )

    suggest_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 22.0},
    )
    assert suggest_resp.status_code == 200
    outfit_id = suggest_resp.json()["outfits"][0]["id"]

    # 1. Like outfit
    r_like = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "like"},
    )
    assert r_like.status_code == 200
    assert r_like.json()["outfit"]["feedback"] == "like"

    # 2. Dislike outfit -> overrides like (mutually exclusive)
    r_dislike = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "dislike"},
    )
    assert r_dislike.status_code == 200
    assert r_dislike.json()["outfit"]["feedback"] == "dislike"

    # 3. Dislike again -> toggles off
    r_toggle = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "dislike"},
    )
    assert r_toggle.status_code == 200
    assert r_toggle.json()["outfit"]["feedback"] is None


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_feedback_save_and_unsave(mock_gemini):
    """Verifies bookmarking (save) and un-bookmarking (unsave)."""
    token, _ = create_user_with_token("Save User")
    top = add_clothing_item(token, "top", "Save Top")
    bottom = add_clothing_item(token, "bottom", "Save Pants")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Savable Look",
                item_ids=[top, bottom],
                reason="Great look.",
                style="casual",
                occasion="casual",
                match_score=85,
            )
        ]
    )

    s_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    outfit_id = s_resp.json()["outfits"][0]["id"]

    # Save outfit
    r_save = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "save"},
    )
    assert r_save.status_code == 200
    assert r_save.json()["outfit"]["is_saved"] is True

    # Appears in saved list
    r_list = client.get(
        "/api/v1/outfits/saved?type=saved",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_list.status_code == 200
    assert r_list.json()["total"] >= 1
    assert any(o["id"] == outfit_id for o in r_list.json()["outfits"])

    # Unsave outfit
    r_unsave = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "unsave"},
    )
    assert r_unsave.status_code == 200
    assert r_unsave.json()["outfit"]["is_saved"] is False


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_feedback_worn_increments_wear_count(mock_gemini):
    """Verifies that 'worn' feedback increments times_worn on all items in the outfit."""
    token, _ = create_user_with_token("Worn User")
    top_id = add_clothing_item(token, "top", "Worn Top")
    bottom_id = add_clothing_item(token, "bottom", "Worn Pants")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Worn Outfit Today",
                item_ids=[top_id, bottom_id],
                reason="Good daily wear.",
                style="casual",
                occasion="casual",
                match_score=88,
            )
        ]
    )

    s_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    outfit_id = s_resp.json()["outfits"][0]["id"]

    # Mark as worn
    r_worn = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "worn"},
    )
    assert r_worn.status_code == 200

    # Verify times_worn incremented on items
    item_top = client.get(f"/api/v1/wardrobe/items/{top_id}", headers={"Authorization": f"Bearer {token}"}).json()
    item_bottom = client.get(f"/api/v1/wardrobe/items/{bottom_id}", headers={"Authorization": f"Bearer {token}"}).json()

    assert item_top["times_worn"] == 1
    assert item_bottom["times_worn"] == 1
    assert item_top["last_worn"] is not None
    assert item_bottom["last_worn"] is not None


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_saved_liked_and_history_lists(mock_gemini):
    """Verifies that GET /outfits/saved respects type=saved, type=liked, and type=history."""
    token, _ = create_user_with_token("Multi Tab User")
    top = add_clothing_item(token, "top", "Tab Top")
    bottom = add_clothing_item(token, "bottom", "Tab Bottom")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Tab Outfit 1",
                item_ids=[top, bottom],
                reason="Tab test.",
                style="casual",
                occasion="casual",
                match_score=80,
            )
        ]
    )

    s_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    outfit_id = s_resp.json()["outfits"][0]["id"]

    # Like the outfit
    client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token}"},
        json={"action": "like"},
    )

    # 1. Liked list has this outfit
    r_liked = client.get(
        "/api/v1/outfits/saved?type=liked",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_liked.status_code == 200
    assert any(o["id"] == outfit_id for o in r_liked.json()["outfits"])

    # 2. Saved list does NOT have it yet
    r_saved = client.get(
        "/api/v1/outfits/saved?type=saved",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_saved.status_code == 200
    assert not any(o["id"] == outfit_id for o in r_saved.json()["outfits"])

    # 3. History list has it
    r_hist = client.get(
        "/api/v1/outfits/saved?type=history",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_hist.status_code == 200
    assert any(o["id"] == outfit_id for o in r_hist.json()["outfits"])


@patch.object(GeminiService, "generate_recommendations", new_callable=AsyncMock)
def test_feedback_cross_user_forbidden(mock_gemini):
    """User B cannot submit feedback on User A's outfit."""
    token_a, _ = create_user_with_token("Owner User A")
    token_b, _ = create_user_with_token("Intruder User B")

    top = add_clothing_item(token_a, "top", "Top A")
    bottom = add_clothing_item(token_a, "bottom", "Bottom A")

    mock_gemini.return_value = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Private Look",
                item_ids=[top, bottom],
                reason="Private.",
                style="casual",
                occasion="casual",
                match_score=80,
            )
        ]
    )

    s_resp = client.post(
        "/api/v1/outfits/suggest",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"occasion": "casual", "temp_c": 20.0},
    )
    outfit_id = s_resp.json()["outfits"][0]["id"]

    resp = client.post(
        f"/api/v1/outfits/{outfit_id}/feedback",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"action": "like"},
    )
    assert resp.status_code == 403
