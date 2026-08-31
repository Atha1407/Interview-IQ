from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "InterviewIQ API"
    app_version: str = "1.0.0"
    environment: str = "development"
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    gemini_api_key: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
    )


settings = Settings()