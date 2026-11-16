"""Caché Redis con degradación elegante (si Redis cae, se calcula directamente)."""
from __future__ import annotations

import hashlib
import json

import structlog

from app.core.config import settings

log = structlog.get_logger()
_client = None


def _redis():
    global _client
    if _client is None and settings.redis_url:
        import redis.asyncio as redis
        _client = redis.from_url(settings.redis_url, socket_connect_timeout=1, socket_timeout=1)
    return _client


async def cached(namespace: str, payload: dict, compute):
    key = f"sim:{namespace}:{hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()}"
    r = _redis()
    if r is not None:
        try:
            hit = await r.get(key)
            if hit:
                return json.loads(hit)
        except Exception as e:  # noqa: BLE001
            log.warning("redis_unavailable", error=str(e))
    result = compute()
    if r is not None:
        try:
            await r.set(key, json.dumps(result), ex=settings.cache_ttl_s)
        except Exception as e:  # noqa: BLE001
            log.warning("redis_set_failed", error=str(e))
    return result
