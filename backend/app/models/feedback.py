"""
AURA Outfit Feedback Model
Tracks user feedback (like, dislike, save) on recommended outfits in SQLite.
Strictly matching 08_SCHEMA.txt and 04_API.txt section E.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(10), nullable=False)  # 'like', 'dislike', 'save'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="feedbacks")
    outfit = relationship("Outfit", back_populates="feedbacks")
