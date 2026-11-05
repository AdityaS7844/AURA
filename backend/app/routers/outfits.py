"""
AURA Outfits Router
Handles outfit suggestions, outfit lookups, feedback (like, dislike, save, unsave, worn),
and saved/liked/history outfit views.
Strictly implements 04_API.txt section E and Milestone 8 specification.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.outfit import (
    SuggestRequest,
    SuggestResponse,
    OutfitOut,
    FeedbackRequest,
    FeedbackResponse,
    SavedOutfitsResponse,
)
from app.services.outfit_service import OutfitService

router = APIRouter()


@router.post(
    "/suggest",
    response_model=SuggestResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI outfit suggestions based on user wardrobe, weather, and occasion",
)
async def suggest_outfits(
    request: SuggestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates intelligent outfit recommendations using Google Gemini.
    - Resolves live weather or manual override.
    - Validates wardrobe preconditions (top+bottom or dress).
    - Calls Gemini with structured JSON output.
    - Rigorously validates returned item IDs and structure against the user's database records.
    - Persists valid recommendations to SQLite and returns trusted outfits.
    """
    return await OutfitService.generate_outfits(
        current_user=current_user,
        request=request,
        db=db,
    )


@router.get(
    "/saved",
    response_model=SavedOutfitsResponse,
    status_code=status.HTTP_200_OK,
    summary="List saved, liked, or historical outfits with pagination",
)
def get_saved_outfits(
    type: str = Query("saved", description="Filter type: saved | liked | history"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the authenticated user's outfits filtered by:
    - saved: outfits bookmarked by the user
    - liked: outfits liked by the user
    - history: all generated outfits chronologically
    """
    return OutfitService.get_saved_outfits(
        user_id=current_user.id,
        type_filter=type,
        page=page,
        limit=limit,
        db=db,
    )


@router.post(
    "/{outfit_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit feedback on an outfit: like | dislike | save | unsave | worn",
)
def submit_feedback(
    outfit_id: int,
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits user action on an outfit:
    - like: records like (mutually exclusive with dislike)
    - dislike: records dislike (mutually exclusive with like)
    - save: bookmarks the outfit
    - unsave: removes bookmark
    - worn: increments wear count and last_worn on all items in the outfit
    """
    updated_outfit = OutfitService.save_feedback(
        user_id=current_user.id,
        outfit_id=outfit_id,
        action=request.action,
        db=db,
    )
    return FeedbackResponse(
        detail="Feedback saved",
        outfit=updated_outfit,
    )


@router.get(
    "/{outfit_id}",
    response_model=OutfitOut,
    status_code=status.HTTP_200_OK,
    summary="Get single outfit details by ID",
)
def get_outfit(
    outfit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves an outfit by ID, ensuring user ownership."""
    return OutfitService.get_outfit(
        user_id=current_user.id,
        outfit_id=outfit_id,
        db=db,
    )
