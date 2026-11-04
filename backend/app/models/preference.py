"""
AURA Preference Model
Represents user style preferences and onboarding status matching 08_SCHEMA.txt.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    styles = Column(JSON, default=list, nullable=False)
    favorite_colors = Column(JSON, default=list, nullable=False)
    avoid_colors = Column(JSON, default=list, nullable=False)
    city = Column(String(100), nullable=True)
    onboarding_done = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="preference")
