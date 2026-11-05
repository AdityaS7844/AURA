"""
AURA Outfit Planner Integration Tests
Verifies calendar scheduling, range filtering, duplicate prevention,
user isolation, and unscheduling.
Matching Milestone 10 specification.
"""

import uuid
from datetime import date, timedelta
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


def create_user_with_token(name="Planner User"):
    unique_email = f"planner_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": unique_email,
        "password": "password123"
    })
    data = resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    return token, user_id


def add_clothing_item(token, category, name):
    resp = client.post(
        "/api/v1/wardrobe/items",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": name,
            "category": category,
            "sub_type": "shirt" if category == "top" else "jeans",
            "color_name": "White" if category == "top" else "Navy",
            "color_hex": "#FFFFFF" if category == "top" else "#000080",
            "pattern": "solid",
            "season": "all",
            "formality": "2",
            "warmth": "2",
            "occasions": "casual, office",
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def setup_user_with_outfit(token):
    headers = {"Authorization": f"Bearer {token}"}
    client.post(
        "/api/v1/preferences",
        json={"styles": ["casual"], "city": "Mumbai", "onboarding_done": True},
        headers=headers,
    )

    item1_id = add_clothing_item(token, "top", "Planner Shirt")
    item2_id = add_clothing_item(token, "bottom", "Planner Chinos")

    mock_gemini_resp = GeminiStructuredResponse(
        recommendations=[
            GeminiRecommendationItem(
                name="Smart Daily Combo",
                item_ids=[item1_id, item2_id],
                reason="Clean contrast for a productive day.",
                style="casual",
                occasion="office",
                match_score=90,
            )
        ]
    )

    with patch.object(GeminiService, "generate_recommendations", new=AsyncMock(return_value=mock_gemini_resp)):
        suggest_res = client.post(
            "/api/v1/outfits/suggest",
            json={"occasion": "office", "city": "Mumbai", "temp_c": 25.0},
            headers=headers,
        )
        assert suggest_res.status_code == 200
        outfit_id = suggest_res.json()["outfits"][0]["id"]
        return outfit_id


def test_empty_planner_returns_empty_list():
    token, _ = create_user_with_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/planner", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["planned_outfits"] == []
    assert data["total"] == 0


def test_schedule_outfit_and_retrieve():
    token, _ = create_user_with_token()
    headers = {"Authorization": f"Bearer {token}"}
    outfit_id = setup_user_with_outfit(token)

    target_date = str(date.today() + timedelta(days=2))
    payload = {
        "outfit_id": outfit_id,
        "planned_date": target_date,
        "notes": "Important client presentation",
    }

    res = client.post("/api/v1/planner", json=payload, headers=headers)
    assert res.status_code == 201
    created = res.json()
    assert created["outfit_id"] == outfit_id
    assert created["planned_date"] == target_date
    assert created["notes"] == "Important client presentation"
    assert created["outfit"]["id"] == outfit_id
    assert len(created["outfit"]["items"]) == 2

    # Fetch list
    get_res = client.get("/api/v1/planner", headers=headers)
    assert get_res.status_code == 200
    list_data = get_res.json()
    assert list_data["total"] == 1
    assert list_data["planned_outfits"][0]["id"] == created["id"]


def test_schedule_duplicate_updates_notes():
    token, _ = create_user_with_token()
    headers = {"Authorization": f"Bearer {token}"}
    outfit_id = setup_user_with_outfit(token)

    target_date = str(date.today() + timedelta(days=1))

    # First schedule
    res1 = client.post(
        "/api/v1/planner",
        json={"outfit_id": outfit_id, "planned_date": target_date, "notes": "Initial note"},
        headers=headers,
    )
    assert res1.status_code == 201
    plan_id = res1.json()["id"]

    # Re-schedule same outfit on same date with updated notes
    res2 = client.post(
        "/api/v1/planner",
        json={"outfit_id": outfit_id, "planned_date": target_date, "notes": "Updated note"},
        headers=headers,
    )
    assert res2.status_code == 201
    assert res2.json()["id"] == plan_id
    assert res2.json()["notes"] == "Updated note"

    # Confirm only 1 entry exists
    get_res = client.get("/api/v1/planner", headers=headers)
    assert get_res.json()["total"] == 1


def test_planner_date_range_filtering():
    token, _ = create_user_with_token()
    headers = {"Authorization": f"Bearer {token}"}
    outfit_id = setup_user_with_outfit(token)

    d1 = str(date.today() + timedelta(days=1))
    d5 = str(date.today() + timedelta(days=5))
    d10 = str(date.today() + timedelta(days=10))

    client.post("/api/v1/planner", json={"outfit_id": outfit_id, "planned_date": d1}, headers=headers)
    client.post("/api/v1/planner", json={"outfit_id": outfit_id, "planned_date": d5}, headers=headers)
    client.post("/api/v1/planner", json={"outfit_id": outfit_id, "planned_date": d10}, headers=headers)

    # Filter within d3..d7 -> should only match d5
    res = client.get(
        f"/api/v1/planner?start_date={date.today() + timedelta(days=3)}&end_date={date.today() + timedelta(days=7)}",
        headers=headers,
    )
    assert res.status_code == 200
    items = res.json()["planned_outfits"]
    assert len(items) == 1
    assert items[0]["planned_date"] == d5


def test_unschedule_outfit():
    token, _ = create_user_with_token()
    headers = {"Authorization": f"Bearer {token}"}
    outfit_id = setup_user_with_outfit(token)

    res = client.post(
        "/api/v1/planner",
        json={"outfit_id": outfit_id, "planned_date": str(date.today() + timedelta(days=3))},
        headers=headers,
    )
    plan_id = res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/v1/planner/{plan_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify gone
    get_res = client.get("/api/v1/planner", headers=headers)
    assert get_res.json()["total"] == 0


def test_user_isolation_prevent_schedule_or_delete_foreign_outfit():
    token_a, _ = create_user_with_token("User A")
    token_b, _ = create_user_with_token("User B")

    outfit_a = setup_user_with_outfit(token_a)

    # User B tries to schedule User A's outfit -> 403 Forbidden
    res = client.post(
        "/api/v1/planner",
        json={"outfit_id": outfit_a, "planned_date": str(date.today())},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 403

    # User A schedules their outfit
    plan_a = client.post(
        "/api/v1/planner",
        json={"outfit_id": outfit_a, "planned_date": str(date.today())},
        headers={"Authorization": f"Bearer {token_a}"},
    ).json()["id"]

    # User B tries to delete User A's plan -> 403 Forbidden
    del_res = client.delete(
        f"/api/v1/planner/{plan_a}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert del_res.status_code == 403
