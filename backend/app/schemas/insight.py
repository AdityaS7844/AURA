"""
AURA Insights Pydantic Schemas
Strictly matching 04_API.txt section F and 08_SCHEMA.txt.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.wardrobe import ItemOut


class InsightsSummaryOut(BaseModel):
    total_items: int
    by_category: Dict[str, int]
    most_worn: List[ItemOut]
    never_worn: List[ItemOut]
    saved_outfits: int
    liked_outfits: int = 0
    total_outfits_styled: int = 0

    model_config = ConfigDict(from_attributes=True)
