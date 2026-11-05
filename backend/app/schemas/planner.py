"""
AURA Planner Pydantic Schemas
Defines request and response schemas for scheduled outfits.
"""

from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.outfit import OutfitOut


class PlannedOutfitCreate(BaseModel):
    outfit_id: int = Field(..., description="ID of the outfit to schedule")
    planned_date: date = Field(..., description="Date to schedule the outfit for (YYYY-MM-DD)")
    notes: Optional[str] = Field(default=None, max_length=255, description="Optional note for the planned day")


class PlannedOutfitOut(BaseModel):
    id: int
    user_id: int
    outfit_id: int
    planned_date: date
    notes: Optional[str] = None
    created_at: datetime
    outfit: OutfitOut

    model_config = ConfigDict(from_attributes=True)


class PlannedOutfitListResponse(BaseModel):
    planned_outfits: List[PlannedOutfitOut]
    total: int
