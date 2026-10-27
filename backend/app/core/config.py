import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Base directory for the backend (app/)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraProof"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Application Mode: "demo" or "real"
    TERRAPROOF_MODE: str = "demo"
    
    # Server configuration
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [str(v)]
    
    # Database
    DATABASE_URL: str = f"sqlite:///{PROJECT_ROOT}/terraproof.db"
    
    # Satellite Data Providers
    STAC_API_URL: str = "https://planetarycomputer.microsoft.com/api/stac/v1"
    OPEN_METEO_API_URL: str = "https://archive-api.open-meteo.com/v1/archive"
    CDSE_CLIENT_ID: str = ""
    CDSE_CLIENT_SECRET: str = ""
    
    # Storage
    DATA_OUTPUT_DIR: Path = PROJECT_ROOT / "data" / "outputs"
    FIXTURES_DIR: Path = PROJECT_ROOT / "data" / "fixtures"
    CACHE_DIR: Path = PROJECT_ROOT / "data" / "cache"
    MAX_UPLOAD_SIZE_MB: int = 25

    model_config = SettingsConfigDict(
        env_file=[str(PROJECT_ROOT / ".env"), str(BACKEND_DIR / ".env")],
        extra="ignore"
    )

settings = Settings()

# Ensure required runtime folders exist
settings.DATA_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
settings.FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
