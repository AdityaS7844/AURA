"""
AURA Preferences Router
Manages user wardrobe styles, color preferences, home city, and onboarding state.
Complies with 04_API.txt section B and 08_SCHEMA.txt.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.preference import Preference
from app.schemas.preference import PreferenceUpdate, PreferenceOut
from app.routers.auth import get_current_user

router = APIRouter()


def _get_or_create_preference(user: User, db: Session) -> Preference:
    """Retrieves the user's preference record or creates a default one if absent."""
    pref = db.query(Preference).filter(Preference.user_id == user.id).first()
    if not pref:
        pref = Preference(
            user_id=user.id,
            styles=[],
            favorite_colors=[],
            avoid_colors=[],
            city=None,
            onboarding_done=False,
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.get("", response_model=PreferenceOut)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves preferences for the current authenticated user."""
    pref = _get_or_create_preference(current_user, db)
    return PreferenceOut.model_validate(pref)


@router.put("", response_model=PreferenceOut)
def update_preferences(
    request: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates preferences and onboarding status for the current authenticated user."""
    pref = _get_or_create_preference(current_user, db)

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pref, field, value)

    db.commit()
    db.refresh(pref)
    return PreferenceOut.model_validate(pref)
