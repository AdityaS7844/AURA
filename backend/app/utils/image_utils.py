"""
AURA Image Handling Utilities
Provides secure image validation, Pillow resizing (max 1024px), storage, and deletion.
Strictly complies with 03_FUNCTIONS_MODULES.txt (Module 4) and 05_BACKEND.txt.
"""

import os
import uuid
import io
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from app.config import get_settings

settings = get_settings()

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_DIMENSION = 1024  # Maximum width/height dimension in pixels


def validate_image_file(file: UploadFile) -> None:
    """
    Validates uploaded file MIME type and extension.
    Throws HTTPException 400 on invalid format.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided.",
        )

    # Check extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: jpg, jpeg, png, webp.",
        )

    # Check Content-Type header
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type '{file.content_type}'. Allowed types: JPEG, PNG, WEBP.",
        )


async def save_wardrobe_image(file: UploadFile, user_id: int) -> str:
    """
    Validates content, checks size <= 5MB, opens with Pillow to ensure it's a valid image,
    resizes to max dimension 1024px if larger, and saves under uploads/{user_id}/<uuid>.webp.
    Returns relative image path.
    """
    validate_image_file(file)

    # Read bytes into memory to verify size
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds 5 MB limit (size: {len(contents) / (1024 * 1024):.2f} MB).",
        )

    try:
        # Open image with Pillow to verify image data integrity
        img = Image.open(io.BytesIO(contents))
        img.verify()
        # Re-open after verify() as recommended by Pillow docs
        img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file or corrupted image data.",
        )

    # Convert RGBA/P to RGB if saving to formats that don't support alpha, or keep WebP
    # Standardize output format to WebP for efficient storage and modern browser support
    if img.mode in ("RGBA", "P") and img.format != "WEBP":
        img = img.convert("RGBA")
    elif img.mode != "RGB" and img.mode != "RGBA":
        img = img.convert("RGB")

    # Resize image if any dimension exceeds MAX_DIMENSION (maintaining aspect ratio)
    if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

    # Prepare user-scoped upload folder
    base_upload_dir = Path(settings.UPLOAD_DIR).resolve()
    user_upload_dir = base_upload_dir / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate random UUID filename
    filename = f"{uuid.uuid4().hex}.webp"
    file_path = user_upload_dir / filename

    # Save resized WebP image
    img.save(file_path, format="WEBP", quality=85, optimize=True)

    # Return normalized relative storage path (e.g. uploads/1/abc.webp)
    return f"uploads/{user_id}/{filename}"


def delete_wardrobe_image(image_path: Optional[str]) -> None:
    """
    Safely deletes an image from disk, preventing directory traversal.
    """
    if not image_path:
        return

    try:
        base_dir = Path(settings.UPLOAD_DIR).resolve()
        target_path = Path(image_path).resolve()

        # Security check: Ensure target_path is within base_dir (prevents ../ traversal)
        if base_dir in target_path.parents or target_path.parent == base_dir:
            if target_path.exists() and target_path.is_file():
                os.remove(target_path)
    except Exception as e:
        # Log failure silently without throwing
        pass


def build_image_url(image_path: Optional[str]) -> Optional[str]:
    """
    Constructs the public API URL for retrieving the image.
    e.g. 'uploads/1/uuid.webp' -> '/api/v1/uploads/1/uuid.webp'
    """
    if not image_path:
        return None
    normalized = image_path.replace("\\", "/").lstrip("/")
    return f"/api/v1/{normalized}"
