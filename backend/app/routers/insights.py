"""
AURA Insights Router
Provides endpoints for wardrobe and styling analytics.
Strictly implements 04_API.txt section F and Milestone 9 specification.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.insight import InsightsSummaryOut
from app.services.insight_service import InsightService

router = APIRouter()


@router.get(
    "/summary",
    response_model=InsightsSummaryOut,
    status_code=status.HTTP_200_OK,
    summary="Get wardrobe summary analytics and wear statistics",
)
def get_insights_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated personal wardrobe statistics for the authenticated user:
    - Total wardrobe items
    - Breakdown by category (top, bottom, dress, footwear, outerwear, accessory)
    - Top 5 most-worn items
    - Never-worn items
    - Total saved outfits count
    """
    return InsightService.get_summary(
        user_id=current_user.id,
        db=db,
    )
