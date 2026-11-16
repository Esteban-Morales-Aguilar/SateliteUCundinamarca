import hmac

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """Endpoint interno: solo el satélite/gateway con la API key publica telemetría."""
    if not settings.telemetry_api_key or not x_api_key or not hmac.compare_digest(
        x_api_key.encode(), settings.telemetry_api_key.encode()
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "API key inválida")
