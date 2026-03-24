from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://sber:sber_pass@db:5432/sberstart"
    secret_key: str = "sberstart-demo-secret"
    app_title: str = "СберСтарт API"
    gigachat_auth_key: Optional[str] = None

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
