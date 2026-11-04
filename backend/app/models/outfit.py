"""
AURA Outfit & OutfitItems Models
Represents recommended outfit combinations and their clothing item associations in SQLite.
Strictly matching 08_SCHEMA.txt.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# N-to-N association table between outfits and clothing_items
outfit_items = Table(
    "outfit_items",
    Base.metadata,
    Column("outfit_id", Integer, ForeignKey("outfits.id", ondelete="CASCADE"), primary_key=True),
    Column("item_id", Integer, ForeignKey("clothing_items.id", ondelete="CASCADE"), primary_key=True),
)


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    occasion = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    score = Column(Integer, nullable=True)  # Range 0..100
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="outfits")
    items = relationship("ClothingItem", secondary=outfit_items, back_populates="outfits")
