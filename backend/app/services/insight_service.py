"""
AURA Insights Service
Aggregates wardrobe statistics, category breakdowns, wear frequency,
and outfit history strictly from SQLite for the authenticated user.
Strictly adheres to 04_API.txt section F and Milestone 9 specification.
"""

from typing import Dict, List
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.clothing import ClothingItem
from app.models.outfit import Outfit
from app.models.feedback import Feedback
from app.schemas.insight import InsightsSummaryOut
from app.services.wardrobe_service import WardrobeService


class InsightService:

    @classmethod
    def get_summary(cls, user_id: int, db: Session) -> InsightsSummaryOut:
        """
        Calculates personal wardrobe analytics for the authenticated user:
        - total items count
        - distribution across clothing categories
        - top 5 most worn pieces
        - never worn pieces
        - saved outfits, liked outfits, and total generated outfits count
        """
        # 1. Total items owned by user
        total_items = db.query(ClothingItem).filter(ClothingItem.user_id == user_id).count()

        # 2. Count by category
        category_counts = (
            db.query(ClothingItem.category, func.count(ClothingItem.id))
            .filter(ClothingItem.user_id == user_id)
            .group_by(ClothingItem.category)
            .all()
        )
        by_category: Dict[str, int] = {cat: count for cat, count in category_counts}

        # 3. Most-worn items (times_worn > 0 ordered by times_worn desc, max 5)
        most_worn_items = (
            db.query(ClothingItem)
            .filter(ClothingItem.user_id == user_id, ClothingItem.times_worn > 0)
            .order_by(desc(ClothingItem.times_worn), desc(ClothingItem.updated_at))
            .limit(5)
            .all()
        )
        most_worn_out = [WardrobeService._to_item_out(it) for it in most_worn_items]

        # 4. Never-worn items (times_worn == 0 ordered by created_at desc, max 10)
        never_worn_items = (
            db.query(ClothingItem)
            .filter(ClothingItem.user_id == user_id, (ClothingItem.times_worn == 0) | (ClothingItem.times_worn == None))
            .order_by(desc(ClothingItem.created_at))
            .limit(10)
            .all()
        )
        never_worn_out = [WardrobeService._to_item_out(it) for it in never_worn_items]

        # 5. Saved outfits count
        saved_outfits = (
            db.query(Feedback)
            .filter(Feedback.user_id == user_id, Feedback.action == "save")
            .count()
        )

        # 6. Liked outfits count
        liked_outfits = (
            db.query(Feedback)
            .filter(Feedback.user_id == user_id, Feedback.action == "like")
            .count()
        )

        # 7. Total outfits styled (all history for this user)
        total_outfits_styled = (
            db.query(Outfit)
            .filter(Outfit.user_id == user_id)
            .count()
        )

        return InsightsSummaryOut(
            total_items=total_items,
            by_category=by_category,
            most_worn=most_worn_out,
            never_worn=never_worn_out,
            saved_outfits=saved_outfits,
            liked_outfits=liked_outfits,
            total_outfits_styled=total_outfits_styled,
        )
