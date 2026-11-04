"""
AURA Preference Pydantic Schemas
Strictly matching 04_API.txt and 08_SCHEMA.txt contracts.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator

ALLOWED_STYLES = {"casual", "formal", "sporty", "streetwear", "ethnic", "minimal"}


class PreferenceUpdate(BaseModel):
    styles: Optional[List[str]] = Field(default=None, description="Preferred style types")
    favorite_colors: Optional[List[str]] = Field(default=None, description="Preferred hex colors")
    avoid_colors: Optional[List[str]] = Field(default=None, description="Colors to avoid hex codes")
    city: Optional[str] = Field(default=None, max_length=100, description="Home city for weather forecast")
    onboarding_done: Optional[bool] = Field(default=None, description="Whether onboarding is completed")

    @field_validator("styles")
    @classmethod
    def validate_styles(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for s in v:
                if s not in ALLOWED_STYLES:
                    raise ValueError(f"Invalid style '{s}'. Allowed values: {sorted(list(ALLOWED_STYLES))}")
        return v


class PreferenceOut(BaseModel):
    styles: List[str] = Field(default_factory=list)
    favorite_colors: List[str] = Field(default_factory=list)
    avoid_colors: List[str] = Field(default_factory=list)
    city: Optional[str] = None
    onboarding_done: bool = False

    model_config = ConfigDict(from_attributes=True)
