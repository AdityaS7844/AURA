"""
AURA Auth Pydantic Schemas
Strictly matching 04_API.txt and 08_SCHEMA.txt contracts.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User full or display name")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=8, description="Password minimum 8 characters")
    starter_wardrobe: Optional[bool] = Field(default=False, description="Optionally auto-seed 6 starter wardrobe essentials")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Password")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password minimum 8 characters")


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Updated display name")


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
