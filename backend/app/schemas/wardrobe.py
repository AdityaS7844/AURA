"""
AURA Wardrobe Pydantic Schemas
Strictly matching 04_API.txt section C and 08_SCHEMA.txt.
"""

from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator

ALLOWED_CATEGORIES = {"top", "bottom", "dress", "outerwear", "footwear", "accessory"}
ALLOWED_PATTERNS = {"solid", "striped", "checked", "printed"}
ALLOWED_SEASONS = {"summer", "winter", "all"}
ALLOWED_OCCASIONS = {
    "casual",
    "office",
    "formal",
    "party",
    "date",
    "sports",
    "travel",
    "festival",
}

SUBTYPES_BY_CATEGORY = {
    "top": {"tshirt", "shirt", "polo", "kurta", "sweater", "hoodie", "tank", "blouse"},
    "bottom": {"jeans", "trousers", "shorts", "skirt", "joggers", "leggings", "chinos"},
    "dress": {"casual_dress", "formal_dress", "gown", "jumpsuit", "kurti_set"},
    "outerwear": {"jacket", "blazer", "coat", "cardigan", "shrug", "raincoat"},
    "footwear": {"sneakers", "formal_shoes", "sandals", "boots", "loafers", "heels", "flats", "slippers"},
    "accessory": {"watch", "belt", "scarf", "cap", "bag", "jewellery", "sunglasses"},
}


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(...)
    sub_type: Optional[str] = None
    color_name: str = Field(..., min_length=1, max_length=30)
    color_hex: str = Field(..., min_length=4, max_length=7)
    secondary_color_hex: Optional[str] = Field(default=None, max_length=7)
    pattern: str = Field(default="solid")
    season: str = Field(default="all")
    formality: int = Field(default=2, ge=1, le=5)
    occasions: List[str] = Field(default_factory=list)
    warmth: int = Field(default=2, ge=1, le=5)
    fabric: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in ALLOWED_CATEGORIES:
            raise ValueError(f"Invalid category '{v}'. Allowed categories: {sorted(list(ALLOWED_CATEGORIES))}")
        return v_clean

    @field_validator("pattern")
    @classmethod
    def validate_pattern(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in ALLOWED_PATTERNS:
            raise ValueError(f"Invalid pattern '{v}'. Allowed patterns: {sorted(list(ALLOWED_PATTERNS))}")
        return v_clean

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in ALLOWED_SEASONS:
            raise ValueError(f"Invalid season '{v}'. Allowed seasons: {sorted(list(ALLOWED_SEASONS))}")
        return v_clean

    @field_validator("occasions")
    @classmethod
    def validate_occasions(cls, v: List[str]) -> List[str]:
        cleaned = []
        for occ in v:
            clean_occ = occ.lower().strip()
            if clean_occ not in ALLOWED_OCCASIONS:
                raise ValueError(f"Invalid occasion '{occ}'. Allowed occasions: {sorted(list(ALLOWED_OCCASIONS))}")
            cleaned.append(clean_occ)
        return cleaned


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    category: Optional[str] = None
    sub_type: Optional[str] = None
    color_name: Optional[str] = Field(default=None, min_length=1, max_length=30)
    color_hex: Optional[str] = Field(default=None, min_length=4, max_length=7)
    secondary_color_hex: Optional[str] = None
    pattern: Optional[str] = None
    season: Optional[str] = None
    formality: Optional[int] = Field(default=None, ge=1, le=5)
    occasions: Optional[List[str]] = None
    warmth: Optional[int] = Field(default=None, ge=1, le=5)
    fabric: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.lower().strip()
            if v_clean not in ALLOWED_CATEGORIES:
                raise ValueError(f"Invalid category '{v}'. Allowed categories: {sorted(list(ALLOWED_CATEGORIES))}")
            return v_clean
        return v

    @field_validator("pattern")
    @classmethod
    def validate_pattern(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.lower().strip()
            if v_clean not in ALLOWED_PATTERNS:
                raise ValueError(f"Invalid pattern '{v}'. Allowed patterns: {sorted(list(ALLOWED_PATTERNS))}")
            return v_clean
        return v

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.lower().strip()
            if v_clean not in ALLOWED_SEASONS:
                raise ValueError(f"Invalid season '{v}'. Allowed seasons: {sorted(list(ALLOWED_SEASONS))}")
            return v_clean
        return v

    @field_validator("occasions")
    @classmethod
    def validate_occasions(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            cleaned = []
            for occ in v:
                clean_occ = occ.lower().strip()
                if clean_occ not in ALLOWED_OCCASIONS:
                    raise ValueError(f"Invalid occasion '{occ}'. Allowed occasions: {sorted(list(ALLOWED_OCCASIONS))}")
                cleaned.append(clean_occ)
            return cleaned
        return v


class ItemOut(BaseModel):
    id: int
    name: str
    category: str
    sub_type: Optional[str] = None
    color_name: str
    color_hex: str
    secondary_color_hex: Optional[str] = None
    pattern: str
    season: str
    formality: int
    occasions: List[str]
    warmth: int
    fabric: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    times_worn: int = 0
    last_worn: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemListOut(BaseModel):
    items: List[ItemOut]
    total: int
    page: int
    limit: int
