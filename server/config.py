# server/config.py - Minimal Configuration
import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    # AI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"

    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASS: str

    IMAP_HOST: str
    IMAP_PORT: int = 993
    IMAP_USER: str
    IMAP_PASS: str

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@postgres:5432/ai_email_db"
    REDIS_URL: str = "redis://redis:6379"

    # Security
    JWT_SECRET: str
    CLIENT_ID: str = "client-001"

    # App
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()