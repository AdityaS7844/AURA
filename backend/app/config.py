"""
AURA Configuration Module
Loads application settings from environment variables or .env file.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "aura_default_secret_key_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./wardrobe.db"
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Returns cached application settings instance."""
    return Settings()
