import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Masjidh Sandha API"
    debug: bool = True
    # Use absolute path for Docker compatibility
    database_url: str = "sqlite:///./sandha.db"
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()