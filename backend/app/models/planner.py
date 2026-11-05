"""
AURA Planned Outfits Model
Represents scheduled outfits on calendar dates in SQLite.
Matching 02_UI_UX.txt (S11 Outfit Planner).
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PlannedOutfit(Base):
    __tablename__ = "planned_outfits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
    planned_date = Column(Date, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="planned_outfits")
    outfit = relationship("Outfit", back_populates="planned_outfits")
