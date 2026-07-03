from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated process configuration.

    Sprint 1 intentionally has no secrets or external dependencies.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="TRAVELOPS_",
        case_sensitive=False,
        extra="ignore",
    )

    service_name: str = "travelops-api"
    environment: Literal["development", "test", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    api_host: str = "127.0.0.1"
    api_port: int = Field(default=8000, ge=1, le=65535)

    def safe_log_context(self) -> dict[str, str | int]:
        return {
            "service": self.service_name,
            "environment": self.environment,
            "log_level": self.log_level,
            "api_host": self.api_host,
            "api_port": self.api_port,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
