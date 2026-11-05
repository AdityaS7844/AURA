"""
AURA Outfit Orchestration & Validation Service
Validates wardrobe preconditions, constructs compact Gemini context,
calls GeminiService, rigorously validates returned item IDs & outfit structures,
persists verified outfits to SQLite, and returns trusted database records.
Strictly adheres to 04_API.txt section E, 05_BACKEND.txt, and 06_GEMINI_INTEGRATION.txt.
"""

from datetime import date
from typing import List, Dict, Any, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.outfit import Outfit
from app.models.feedback import Feedback
from app.models.preference import Preference
from app.schemas.outfit import (
    SuggestRequest,
    OutfitOut,
    SuggestResponse,
    GeminiRecommendationItem,
    SavedOutfitsResponse,
)
from app.schemas.wardrobe import ItemOut
from app.services.gemini_service import GeminiService
from app.services.weather_service import WeatherService
from app.services.wardrobe_service import WardrobeService
from app.utils.image_utils import build_image_url


class OutfitService:

    @classmethod
    def check_wardrobe_preconditions(cls, items: List[ClothingItem]) -> None:
        """
        Ensures the user has either:
          - at least 1 top AND at least 1 bottom, OR
          - at least 1 dress.
        Raises HTTP 400 if prerequisites are not met.
        """
        has_top = any(item.category == "top" for item in items)
        has_bottom = any(item.category == "bottom" for item in items)
        has_dress = any(item.category == "dress" for item in items)

        if not ((has_top and has_bottom) or has_dress):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Insufficient wardrobe items to generate outfits. "
                    "You need at least one top and one bottom, or at least one dress in your wardrobe."
                ),
            )

    @classmethod
    def validate_single_recommendation(
        cls,
        rec: GeminiRecommendationItem,
        user_items_map: Dict[int, ClothingItem],
        requested_occasion: str,
        anchor_item_id: Optional[int] = None,
    ) -> Optional[List[ClothingItem]]:
        """
        Validates an individual recommendation against strict application rules:
        1. All item IDs must exist in the user's wardrobe.
        2. No duplicate item IDs within the outfit.
        3. Anchor item MUST be present if specified.
        4. Category structure: must contain (top + bottom) OR dress.
        Returns the resolved list of ClothingItem objects if valid, or None if rejected.
        """
        if not rec.item_ids or len(rec.item_ids) < 1:
            return None

        # Check for duplicates inside the outfit
        if len(rec.item_ids) != len(set(rec.item_ids)):
            return None

        # Check anchor item requirement
        if anchor_item_id and anchor_item_id not in rec.item_ids:
            return None

        resolved_items = []
        categories_in_outfit = set()

        for item_id in rec.item_ids:
            # Check ID exists in the user's owned wardrobe
            if item_id not in user_items_map:
                return None  # Rejects unknown or foreign IDs!
            item_obj = user_items_map[item_id]
            resolved_items.append(item_obj)
            categories_in_outfit.add(item_obj.category)

        # Check structural compatibility: (top AND bottom) OR dress
        is_two_piece = ("top" in categories_in_outfit) and ("bottom" in categories_in_outfit)
        is_dress = "dress" in categories_in_outfit

        if not (is_two_piece or is_dress):
            return None

        return resolved_items

    @classmethod
    async def generate_outfits(
        cls,
        current_user: User,
        request: SuggestRequest,
        db: Session,
    ) -> SuggestResponse:
        """
        Main orchestration flow for outfit recommendations:
        Loads wardrobe -> validates preconditions -> compiles weather -> calls Gemini ->
        validates output strictly -> saves valid outfits to SQLite -> returns trusted data.
        """
        # 1. Load user's clothing items from SQLite
        user_clothing = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
        cls.check_wardrobe_preconditions(user_clothing)

        # Map by ID for rapid O(1) lookup
        user_items_map: Dict[int, ClothingItem] = {item.id: item for item in user_clothing}

        # 2. Check anchor item if requested
        if request.anchor_item_id:
            if request.anchor_item_id not in user_items_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Anchor item #{request.anchor_item_id} does not exist in your wardrobe.",
                )

        # 3. Resolve weather
        target_city = request.city
        if not target_city:
            pref = db.query(Preference).filter(Preference.user_id == current_user.id).first()
            target_city = pref.city if pref and pref.city else "Mumbai"

        if request.temp_c is not None:
            # Manual temperature override provided
            temp_val = round(request.temp_c, 1)
            weather_data = {
                "city": target_city,
                "temp_c": temp_val,
                "feels_like_c": temp_val,
                "condition": "Manual override",
                "rain_probability": 0,
                "class": WeatherService.classify_temperature(temp_val),
                "is_rainy": False,
            }
        else:
            weather_obj = await WeatherService.get_weather_for_city(target_city)
            weather_data = {
                "city": weather_obj.city,
                "temp_c": weather_obj.temp_c,
                "feels_like_c": weather_obj.feels_like_c,
                "condition": weather_obj.condition,
                "rain_probability": weather_obj.rain_probability,
                "class": weather_obj.weather_class,
                "is_rainy": weather_obj.is_rainy,
            }

        # 4. Build compact wardrobe context for Gemini
        wardrobe_context = [
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "sub_type": item.sub_type,
                "color_name": item.color_name,
                "color_hex": item.color_hex,
                "pattern": item.pattern,
                "season": item.season,
                "formality": item.formality,
                "warmth": item.warmth,
                "occasions": item.occasions,
            }
            for item in user_clothing
        ]

        user_pref = db.query(Preference).filter(Preference.user_id == current_user.id).first()
        pref_dict = {
            "styles": user_pref.styles if user_pref else [],
            "favorite_colors": user_pref.favorite_colors if user_pref else [],
            "avoid_colors": user_pref.avoid_colors if user_pref else [],
        }

        feedback_summary = cls.build_feedback_summary(current_user.id, db)

        context = GeminiService.build_context(
            occasion=request.occasion,
            style=request.style,
            weather=weather_data,
            wardrobe_items=wardrobe_context,
            count=request.count,
            anchor_item_id=request.anchor_item_id,
            exclude_outfit_ids=request.exclude_outfit_ids,
            preferences=pref_dict,
            feedback_context=feedback_summary,
        )

        # 5. Call Gemini AI
        gemini_response = await GeminiService.generate_recommendations(context)

        # 6. Strictly validate each recommendation
        valid_outfits_out: List[OutfitOut] = []

        for rec in gemini_response.recommendations:
            validated_items = cls.validate_single_recommendation(
                rec=rec,
                user_items_map=user_items_map,
                requested_occasion=request.occasion,
                anchor_item_id=request.anchor_item_id,
            )

            if not validated_items:
                continue  # Reject unvalidated / malformed recommendation

            # Persist validated outfit in SQLite
            outfit_record = Outfit(
                user_id=current_user.id,
                occasion=request.occasion,
                name=rec.name.strip(),
                score=min(max(rec.match_score, 0), 100),
                reason=rec.reason.strip(),
            )
            outfit_record.items = validated_items
            db.add(outfit_record)
            db.commit()
            db.refresh(outfit_record)

            valid_outfits_out.append(cls.to_outfit_out(outfit_record, current_user.id, db))

            # Stop once requested count is fulfilled
            if len(valid_outfits_out) >= request.count:
                break

        if not valid_outfits_out:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to generate valid outfits matching your wardrobe constraints. Please try again.",
            )

        return SuggestResponse(weather=weather_data, outfits=valid_outfits_out)

    @classmethod
    def to_outfit_out(cls, outfit: Outfit, user_id: int, db: Session) -> OutfitOut:
        """Converts an Outfit DB entity to OutfitOut DTO with like/dislike & saved status."""
        items_out = [WardrobeService._to_item_out(it) for it in outfit.items]
        feedbacks = db.query(Feedback).filter(Feedback.user_id == user_id, Feedback.outfit_id == outfit.id).all()
        actions = {f.action for f in feedbacks}
        fb_val = "like" if "like" in actions else ("dislike" if "dislike" in actions else None)
        is_saved = "save" in actions

        return OutfitOut(
            id=outfit.id,
            occasion=outfit.occasion,
            name=outfit.name,
            items=items_out,
            score=outfit.score,
            reason=outfit.reason,
            feedback=fb_val,
            is_saved=is_saved,
            created_at=outfit.created_at,
        )

    @classmethod
    def build_feedback_summary(cls, user_id: int, db: Session) -> Optional[Dict[str, Any]]:
        """Summarizes recent like/dislike feedback to inform Gemini without overriding explicit request."""
        recent_feedbacks = (
            db.query(Feedback, Outfit)
            .join(Outfit, Feedback.outfit_id == Outfit.id)
            .filter(Feedback.user_id == user_id, Feedback.action.in_(["like", "dislike"]))
            .order_by(desc(Feedback.created_at))
            .limit(10)
            .all()
        )
        if not recent_feedbacks:
            return None

        liked = [outfit.name for fb, outfit in recent_feedbacks if fb.action == "like"]
        disliked = [outfit.name for fb, outfit in recent_feedbacks if fb.action == "dislike"]

        summary = {}
        if liked:
            summary["recently_liked_outfits"] = liked[:5]
        if disliked:
            summary["recently_disliked_outfits"] = disliked[:5]
        return summary if summary else None

    @classmethod
    def save_feedback(cls, user_id: int, outfit_id: int, action: str, db: Session) -> OutfitOut:
        """
        Handles like | dislike | save | unsave | worn actions.
        - like / dislike are mutually exclusive.
        - save creates a save record; unsave deletes it.
        - worn increments times_worn on every item in the outfit.
        """
        outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
        if not outfit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Outfit #{outfit_id} not found.")
        if outfit.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this outfit.")

        clean_action = action.lower().strip()

        if clean_action == "worn":
            today = date.today()
            for item in outfit.items:
                item.times_worn = (item.times_worn or 0) + 1
                item.last_worn = today
            db.commit()

        elif clean_action in ("like", "dislike"):
            # If user clicks the action they already had, remove it (toggle off)
            existing_same = db.query(Feedback).filter(
                Feedback.user_id == user_id,
                Feedback.outfit_id == outfit_id,
                Feedback.action == clean_action,
            ).first()

            # Remove existing like/dislike to guarantee mutual exclusivity
            db.query(Feedback).filter(
                Feedback.user_id == user_id,
                Feedback.outfit_id == outfit_id,
                Feedback.action.in_(["like", "dislike"]),
            ).delete(synchronize_session=False)

            if not existing_same:
                # Add the new feedback action
                new_fb = Feedback(user_id=user_id, outfit_id=outfit_id, action=clean_action)
                db.add(new_fb)

            db.commit()

        elif clean_action == "save":
            existing = db.query(Feedback).filter(
                Feedback.user_id == user_id,
                Feedback.outfit_id == outfit_id,
                Feedback.action == "save",
            ).first()
            if not existing:
                db.add(Feedback(user_id=user_id, outfit_id=outfit_id, action="save"))
                db.commit()

        elif clean_action == "unsave":
            db.query(Feedback).filter(
                Feedback.user_id == user_id,
                Feedback.outfit_id == outfit_id,
                Feedback.action == "save",
            ).delete(synchronize_session=False)
            db.commit()

        return cls.to_outfit_out(outfit, user_id, db)

    @classmethod
    def get_saved_outfits(
        cls,
        user_id: int,
        type_filter: str,
        page: int,
        limit: int,
        db: Session,
    ) -> SavedOutfitsResponse:
        """
        Retrieves outfits filtered by type:
        - 'saved': outfits with a save feedback action
        - 'liked': outfits with a like feedback action
        - 'history': all outfits generated for this user
        """
        clean_type = (type_filter or "saved").lower().strip()
        offset = (page - 1) * limit

        if clean_type == "saved":
            query = (
                db.query(Outfit)
                .join(Feedback, Feedback.outfit_id == Outfit.id)
                .filter(Feedback.user_id == user_id, Feedback.action == "save", Outfit.user_id == user_id)
                .order_by(desc(Feedback.created_at))
            )
        elif clean_type == "liked":
            query = (
                db.query(Outfit)
                .join(Feedback, Feedback.outfit_id == Outfit.id)
                .filter(Feedback.user_id == user_id, Feedback.action == "like", Outfit.user_id == user_id)
                .order_by(desc(Feedback.created_at))
            )
        elif clean_type == "history":
            query = (
                db.query(Outfit)
                .filter(Outfit.user_id == user_id)
                .order_by(desc(Outfit.created_at))
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid type filter '{type_filter}'. Allowed: saved | liked | history",
            )

        total = query.count()
        outfits = query.offset(offset).limit(limit).all()
        outfits_out = [cls.to_outfit_out(o, user_id, db) for o in outfits]

        return SavedOutfitsResponse(
            outfits=outfits_out,
            total=total,
            page=page,
            limit=limit,
        )

    @classmethod
    def get_outfit(cls, user_id: int, outfit_id: int, db: Session) -> OutfitOut:
        """Retrieves a single outfit ensuring user ownership and feedback status."""
        outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
        if not outfit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Outfit #{outfit_id} not found.")
        if outfit.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this outfit.")

        return cls.to_outfit_out(outfit, user_id, db)
