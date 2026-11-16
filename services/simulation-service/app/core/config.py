from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str | None = None
    cors_origin: str = "*"
    cache_ttl_s: int = 3600


settings = Settings()
