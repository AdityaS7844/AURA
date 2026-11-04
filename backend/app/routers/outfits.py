"""
AURA Outfits Router
Handles outfit suggestions and outfit lookups.
Strictly implements 04_API.txt section E and Milestone 6 specification.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.outfit import SuggestRequest, SuggestResponse, OutfitOut
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
