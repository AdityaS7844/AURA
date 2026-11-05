"""
AURA User Model
Represents registered users in SQLite matching 08_SCHEMA.txt.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(10), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 1-to-1 relationship with preferences
    preference = relationship("Preference", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # 1-to-many relationship with clothing items
    clothing_items = relationship("ClothingItem", back_populates="user", cascade="all, delete-orphan")

    # 1-to-many relationship with outfits
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")

    # 1-to-many relationship with outfit feedback
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
