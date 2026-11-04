"""
AURA Clothing Item Model
Represents clothing items in SQLite matching 08_SCHEMA.txt.
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(20), nullable=False, index=True)
    sub_type = Column(String(30), nullable=True)
    color_name = Column(String(30), nullable=False)
    color_hex = Column(String(7), nullable=False)
    secondary_color_hex = Column(String(7), nullable=True)
    pattern = Column(String(10), default="solid", nullable=False)
    season = Column(String(10), default="all", nullable=False)
    formality = Column(Integer, default=2, nullable=False)
    occasions = Column(JSON, default=list, nullable=False)
    warmth = Column(Integer, default=2, nullable=False)
    fabric = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    times_worn = Column(Integer, default=0, nullable=False)
    last_worn = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="clothing_items")
    outfits = relationship("Outfit", secondary="outfit_items", back_populates="items")
