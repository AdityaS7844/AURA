"""
AURA Wardrobe Router
Implements multipart item creation, query/filter listing, item detail, updates, deletion,
wear tracking, and secure image serving.
Complies with 04_API.txt sections C and H, and 08_SCHEMA.txt.
"""

from typing import Optional, List
from pathlib import Path
from fastapi import APIRouter, Depends, Form, File, UploadFile, Query, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.wardrobe import ItemCreate, ItemUpdate, ItemOut, ItemListOut
from app.services.wardrobe_service import WardrobeService
from app.routers.auth import get_current_user
from app.config import get_settings

settings = get_settings()
router = APIRouter()


def _parse_occasions(occasions_str: Optional[str]) -> List[str]:
    """Parses comma-separated occasions into a clean list."""
    if not occasions_str:
        return []
    return [o.strip().lower() for o in occasions_str.split(",") if o.strip()]


@router.post("/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_clothing_item(
    name: str = Form(...),
    category: str = Form(...),
    color_name: str = Form(...),
    color_hex: str = Form(...),
    sub_type: Optional[str] = Form(None),
    secondary_color_hex: Optional[str] = Form(None),
    pattern: str = Form("solid"),
    season: str = Form("all"),
    formality: int = Form(2),
    warmth: int = Form(2),
    occasions: Optional[str] = Form(None),  # Comma-separated values
    fabric: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a new clothing item in the user's digital wardrobe with an optional photograph."""
    occasions_list = _parse_occasions(occasions)

    create_schema = ItemCreate(
        name=name,
        category=category,
        sub_type=sub_type,
        color_name=color_name,
        color_hex=color_hex,
        secondary_color_hex=secondary_color_hex,
        pattern=pattern,
        season=season,
        formality=formality,
        warmth=warmth,
        occasions=occasions_list,
        fabric=fabric,
        notes=notes,
    )

    return await WardrobeService.add_item(
        user_id=current_user.id,
        data=create_schema,
        image_file=image,
        db=db,
    )


@router.get("/items", response_model=ItemListOut)
def list_clothing_items(
    category: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    occasion: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated clothing items owned by current user with optional filters."""
    items, total = WardrobeService.list_items(
        user_id=current_user.id,
        category=category,
        color=color,
        season=season,
        occasion=occasion,
        search=search,
        page=page,
        limit=limit,
        db=db,
    )
    return ItemListOut(items=items, total=total, page=page, limit=limit)


@router.get("/items/{item_id}", response_model=ItemOut)
def get_clothing_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single clothing item details."""
    return WardrobeService.get_item(user_id=current_user.id, item_id=item_id, db=db)


@router.put("/items/{item_id}", response_model=ItemOut)
async def update_clothing_item(
    item_id: int,
    name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    sub_type: Optional[str] = Form(None),
    color_name: Optional[str] = Form(None),
    color_hex: Optional[str] = Form(None),
    secondary_color_hex: Optional[str] = Form(None),
    pattern: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    formality: Optional[int] = Form(None),
    warmth: Optional[int] = Form(None),
    occasions: Optional[str] = Form(None),
    fabric: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates an existing clothing item and optionally replaces photograph."""
    occasions_list = _parse_occasions(occasions) if occasions is not None else None

    update_schema = ItemUpdate(
        name=name,
        category=category,
        sub_type=sub_type,
        color_name=color_name,
        color_hex=color_hex,
        secondary_color_hex=secondary_color_hex,
        pattern=pattern,
        season=season,
        formality=formality,
        warmth=warmth,
        occasions=occasions_list,
        fabric=fabric,
        notes=notes,
    )

    return await WardrobeService.update_item(
        user_id=current_user.id,
        item_id=item_id,
        data=update_schema,
        image_file=image,
        db=db,
    )


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clothing_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a clothing item and purges associated image from disk."""
    WardrobeService.delete_item(user_id=current_user.id, item_id=item_id, db=db)
    return None


@router.post("/items/{item_id}/worn", response_model=ItemOut)
def mark_clothing_item_worn(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Increments wear count and sets last_worn timestamp to today."""
    return WardrobeService.mark_item_worn(user_id=current_user.id, item_id=item_id, db=db)


@router.post("/seed-starter", status_code=status.HTTP_201_CREATED)
def seed_starter_wardrobe_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows an authenticated user with an empty or fresh wardrobe to load starter essentials."""
    WardrobeService.seed_starter_wardrobe(user_id=current_user.id, db=db)
    return {"status": "ok", "message": "Starter wardrobe essentials successfully added."}


# Image Serving Endpoints (Static Images - Section H)
@router.get("/uploads/{user_id}/{filename}")
def serve_wardrobe_image(user_id: int, filename: str):
    """
    Safely serves an uploaded wardrobe image file.
    Validates path traversal prevention.
    """
    base_dir = Path(settings.UPLOAD_DIR).resolve()
    target_file = (base_dir / str(user_id) / filename).resolve()

    # Prevent directory traversal attacks
    if base_dir not in target_file.parents:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if not target_file.exists() or not target_file.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return FileResponse(target_file, media_type="image/webp")
