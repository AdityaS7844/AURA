"""
AURA Outfit Pydantic Schemas
Strictly matching 04_API.txt section E, 06_GEMINI_INTEGRATION.txt, and 08_SCHEMA.txt.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.wardrobe import ItemOut, ALLOWED_OCCASIONS


class SuggestRequest(BaseModel):
    occasion: str = Field(..., description="Target occasion for outfit suggestions")
    city: Optional[str] = Field(default=None, description="City for live weather calculation")
    temp_c: Optional[float] = Field(default=None, description="Optional manual temperature override in Celsius")
    style: Optional[str] = Field(default=None, description="Optional preferred style aesthetic")
    anchor_item_id: Optional[int] = Field(default=None, description="Optional wardrobe item ID to build around")
    count: int = Field(default=4, ge=1, le=5, description="Number of outfit recommendations requested")
    exclude_outfit_ids: List[int] = Field(default_factory=list, description="Outfit IDs to avoid repeating")

    @field_validator("occasion")
    @classmethod
    def validate_occasion(cls, v: str) -> str:
        clean = v.lower().strip()
        if clean not in ALLOWED_OCCASIONS:
            raise ValueError(f"Invalid occasion '{v}'. Allowed values: {sorted(list(ALLOWED_OCCASIONS))}")
        return clean


# Structured schema for Gemini API responses
class GeminiRecommendationItem(BaseModel):
    name: str = Field(..., description="Descriptive title of the outfit")
    item_ids: List[int] = Field(..., description="Exact IDs of clothing items used from the supplied wardrobe list")
    reason: str = Field(..., description="Short explanation of why this combination works for the occasion and weather")
    style: Optional[str] = Field(default="casual", description="Style classification")
    occasion: str = Field(..., description="Occasion matched")
    match_score: int = Field(default=85, ge=0, le=100, description="Approximate suitability score 0-100")


class GeminiStructuredResponse(BaseModel):
    recommendations: List[GeminiRecommendationItem] = Field(default_factory=list)
    message: Optional[str] = Field(default="Outfit ideas based on your wardrobe.")


# API Output Schemas matching 04_API.txt
class OutfitOut(BaseModel):
    id: int
    occasion: str
    name: str
    items: List[ItemOut]
    score: Optional[int] = None
    reason: Optional[str] = None
    feedback: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SuggestResponse(BaseModel):
    weather: dict
    outfits: List[OutfitOut]
