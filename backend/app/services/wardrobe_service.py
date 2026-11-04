"""
AURA Wardrobe Service
Handles wardrobe item persistence, queries, filtering, pagination, wear tracking, and image linkage.
"""

from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi import HTTPException, status, UploadFile
from app.models.clothing import ClothingItem
from app.schemas.wardrobe import ItemCreate, ItemUpdate, ItemOut
from app.utils.image_utils import save_wardrobe_image, delete_wardrobe_image, build_image_url


class WardrobeService:

    @staticmethod
    def _to_item_out(item: ClothingItem) -> ItemOut:
        """Converts ClothingItem ORM to ItemOut schema including constructed image_url."""
        item_dict = {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "sub_type": item.sub_type,
            "color_name": item.color_name,
            "color_hex": item.color_hex,
            "secondary_color_hex": item.secondary_color_hex,
            "pattern": item.pattern,
            "season": item.season,
            "formality": item.formality,
            "occasions": item.occasions or [],
            "warmth": item.warmth,
            "fabric": item.fabric,
            "notes": item.notes,
            "image_url": build_image_url(item.image_path),
            "times_worn": item.times_worn,
            "last_worn": item.last_worn,
            "created_at": item.created_at,
        }
        return ItemOut(**item_dict)

    @classmethod
    async def add_item(
        cls,
        user_id: int,
        data: ItemCreate,
        image_file: Optional[UploadFile],
        db: Session
    ) -> ItemOut:
        """Adds a new clothing item for the user with an optional image."""
        image_path = None
        if image_file:
            image_path = await save_wardrobe_image(image_file, user_id)

        item = ClothingItem(
            user_id=user_id,
            name=data.name.strip(),
            category=data.category.lower().strip(),
            sub_type=data.sub_type.lower().strip() if data.sub_type else None,
            color_name=data.color_name.strip(),
            color_hex=data.color_hex.strip(),
            secondary_color_hex=data.secondary_color_hex.strip() if data.secondary_color_hex else None,
            pattern=data.pattern,
            season=data.season,
            formality=data.formality,
            occasions=data.occasions or [],
            warmth=data.warmth,
            fabric=data.fabric.strip() if data.fabric else None,
            notes=data.notes.strip() if data.notes else None,
            image_path=image_path,
            times_worn=0,
            last_worn=None,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return cls._to_item_out(item)

    @classmethod
    def list_items(
        cls,
        user_id: int,
        category: Optional[str],
        color: Optional[str],
        season: Optional[str],
        occasion: Optional[str],
        search: Optional[str],
        page: int,
        limit: int,
        db: Session
    ) -> Tuple[List[ItemOut], int]:
        """Lists user clothing items with optional filters, search, and pagination."""
        query = db.query(ClothingItem).filter(ClothingItem.user_id == user_id)

        if category:
            query = query.filter(ClothingItem.category == category.lower().strip())

        if color:
            color_clean = color.lower().strip()
            query = query.filter(
                or_(
                    ClothingItem.color_name.ilike(f"%{color_clean}%"),
                    ClothingItem.color_hex.ilike(f"%{color_clean}%")
                )
            )

        if season and season.lower() != "all":
            query = query.filter(
                or_(
                    ClothingItem.season == season.lower().strip(),
                    ClothingItem.season == "all"
                )
            )

        if occasion:
            # Query JSON list for matching occasion
            occ_clean = occasion.lower().strip()
            query = query.filter(ClothingItem.occasions.contains(occ_clean))

        if search:
            search_clean = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ClothingItem.name.ilike(search_clean),
                    ClothingItem.sub_type.ilike(search_clean),
                    ClothingItem.fabric.ilike(search_clean),
                    ClothingItem.notes.ilike(search_clean)
                )
            )

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(desc(ClothingItem.created_at)).offset(offset).limit(limit).all()

        return [cls._to_item_out(item) for item in items], total

    @classmethod
    def get_item(cls, user_id: int, item_id: int, db: Session) -> ItemOut:
        """Retrieves a single clothing item ensuring user ownership."""
        item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clothing item #{item_id} not found."
            )
        if item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this item."
            )
        return cls._to_item_out(item)

    @classmethod
    async def update_item(
        cls,
        user_id: int,
        item_id: int,
        data: ItemUpdate,
        image_file: Optional[UploadFile],
        db: Session
    ) -> ItemOut:
        """Updates a clothing item and replaces image if new file is uploaded."""
        item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clothing item #{item_id} not found."
            )
        if item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this item."
            )

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                setattr(item, key, value)

        if image_file:
            # Delete old image file if exists
            if item.image_path:
                delete_wardrobe_image(item.image_path)
            item.image_path = await save_wardrobe_image(image_file, user_id)

        db.commit()
        db.refresh(item)
        return cls._to_item_out(item)

    @classmethod
    def delete_item(cls, user_id: int, item_id: int, db: Session) -> None:
        """Deletes a clothing item and removes associated image file from disk."""
        item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clothing item #{item_id} not found."
            )
        if item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this item."
            )

        # Delete image file
        if item.image_path:
            delete_wardrobe_image(item.image_path)

        db.delete(item)
        db.commit()

    @classmethod
    def mark_item_worn(cls, user_id: int, item_id: int, db: Session) -> ItemOut:
        """Increments wear count and updates last_worn date to today."""
        item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clothing item #{item_id} not found."
            )
        if item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this item."
            )

        item.times_worn += 1
        item.last_worn = date.today()
        db.commit()
        db.refresh(item)
        return cls._to_item_out(item)
