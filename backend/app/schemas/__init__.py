"""AURA Pydantic Schemas Package"""

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ChangePasswordRequest,
    UserOut,
    TokenResponse,
)
from app.schemas.preference import (
    PreferenceUpdate,
    PreferenceOut,
)
from app.schemas.wardrobe import (
    ItemCreate,
    ItemUpdate,
    ItemOut,
    ItemListOut,
    ALLOWED_CATEGORIES,
    ALLOWED_PATTERNS,
    ALLOWED_SEASONS,
    ALLOWED_OCCASIONS,
    SUBTYPES_BY_CATEGORY,
)
from app.schemas.weather import WeatherOut
from app.schemas.outfit import (
    SuggestRequest,
    GeminiRecommendationItem,
    GeminiStructuredResponse,
    OutfitOut,
    SuggestResponse,
)

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "ChangePasswordRequest",
    "UserOut",
    "TokenResponse",
    "PreferenceUpdate",
    "PreferenceOut",
    "ItemCreate",
    "ItemUpdate",
    "ItemOut",
    "ItemListOut",
    "ALLOWED_CATEGORIES",
    "ALLOWED_PATTERNS",
    "ALLOWED_SEASONS",
    "ALLOWED_OCCASIONS",
    "SUBTYPES_BY_CATEGORY",
    "WeatherOut",
    "SuggestRequest",
    "GeminiRecommendationItem",
    "GeminiStructuredResponse",
    "OutfitOut",
    "SuggestResponse",
]
