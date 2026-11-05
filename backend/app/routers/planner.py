"""
AURA Planner Router
Provides calendar outfit scheduling endpoints for the desktop web app.
Complies with 02_UI_UX.txt (S11 Outfit Planner) and 04_API.txt.
"""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.models.user import User
from app.models.outfit import Outfit
from app.models.planner import PlannedOutfit
from app.schemas.planner import (
    PlannedOutfitCreate,
    PlannedOutfitOut,
    PlannedOutfitListResponse,
)
from app.routers.auth import get_current_user
from app.services.outfit_service import OutfitService

router = APIRouter()


@router.get("", response_model=PlannedOutfitListResponse)
def get_planned_outfits(
    start_date: Optional[date] = Query(default=None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(default=None, description="End date filter (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all scheduled outfits for the authenticated user, optionally filtered by date range."""
    query = db.query(PlannedOutfit).filter(PlannedOutfit.user_id == current_user.id)

    if start_date:
        query = query.filter(PlannedOutfit.planned_date >= start_date)
    if end_date:
        query = query.filter(PlannedOutfit.planned_date <= end_date)

    planned_items = query.order_by(asc(PlannedOutfit.planned_date)).all()

    result = []
    for item in planned_items:
        outfit_out = OutfitService.to_outfit_out(item.outfit, current_user.id, db)
        result.append(
            PlannedOutfitOut(
                id=item.id,
                user_id=item.user_id,
                outfit_id=item.outfit_id,
                planned_date=item.planned_date,
                notes=item.notes,
                created_at=item.created_at,
                outfit=outfit_out,
            )
        )

    return PlannedOutfitListResponse(planned_outfits=result, total=len(result))


@router.post("", response_model=PlannedOutfitOut, status_code=status.HTTP_201_CREATED)
def schedule_outfit(
    payload: PlannedOutfitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedules an outfit for a specific date, preventing duplicate entries on the same day."""
    # Verify outfit exists and belongs to the authenticated user
    outfit = db.query(Outfit).filter(Outfit.id == payload.outfit_id).first()
    if not outfit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outfit #{payload.outfit_id} not found.",
        )
    if outfit.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to schedule this outfit.",
        )

    # Check for existing duplicate schedule on this date
    existing = (
        db.query(PlannedOutfit)
        .filter(
            PlannedOutfit.user_id == current_user.id,
            PlannedOutfit.outfit_id == payload.outfit_id,
            PlannedOutfit.planned_date == payload.planned_date,
        )
        .first()
    )

    if existing:
        if payload.notes is not None:
            existing.notes = payload.notes
            db.commit()
            db.refresh(existing)
        outfit_out = OutfitService.to_outfit_out(existing.outfit, current_user.id, db)
        return PlannedOutfitOut(
            id=existing.id,
            user_id=existing.user_id,
            outfit_id=existing.outfit_id,
            planned_date=existing.planned_date,
            notes=existing.notes,
            created_at=existing.created_at,
            outfit=outfit_out,
        )

    # Create new planned outfit
    planned = PlannedOutfit(
        user_id=current_user.id,
        outfit_id=payload.outfit_id,
        planned_date=payload.planned_date,
        notes=payload.notes,
    )
    db.add(planned)
    db.commit()
    db.refresh(planned)

    outfit_out = OutfitService.to_outfit_out(planned.outfit, current_user.id, db)
    return PlannedOutfitOut(
        id=planned.id,
        user_id=planned.user_id,
        outfit_id=planned.outfit_id,
        planned_date=planned.planned_date,
        notes=planned.notes,
        created_at=planned.created_at,
        outfit=outfit_out,
    )


@router.delete("/{planned_id}", status_code=status.HTTP_204_NO_CONTENT)
def unschedule_outfit(
    planned_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Removes a scheduled outfit entry from the calendar."""
    planned = db.query(PlannedOutfit).filter(PlannedOutfit.id == planned_id).first()
    if not planned:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Planned outfit #{planned_id} not found.",
        )
    if planned.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this planned outfit entry.",
        )

    db.delete(planned)
    db.commit()
    return None
