"""Acceso a datos: TimescaleDB (asyncpg) con fallback en memoria si la BD no está disponible."""
from __future__ import annotations

from collections import deque
from datetime import UTC, datetime

import asyncpg
import structlog

from app.schemas.telemetry import TelemetryIn

log = structlog.get_logger()
COLS = ("time", "mission_id", "altitude", "temperature", "pressure", "humidity", "latitude", "longitude", "rssi", "snr", "pdr", "source", "cpu_temp", "wifi_rssi", "cpu_usage", "memory_usage")
DEFAULT_MISSION = {"id": "ESTRATOSAT-TELCO-01", "name": "ESTRATOSAT-TELCO",
                    "description": "Misión educativa HAB - Universidad de Cundinamarca",
                    "status": "active", "start_at": datetime.now(UTC), "end_at": None}


class MemoryRepository:
    def __init__(self, maxlen: int = 20_000) -> None:
        self.rows: deque[dict] = deque(maxlen=maxlen)

    async def insert(self, p: TelemetryIn) -> None:
        self.rows.append(p.model_dump())

    async def latest(self, mission_id: str, source: str | None = None) -> dict | None:
        for r in reversed(self.rows):
            if r["mission_id"] == mission_id and (source is None or r.get("source") == source):
                return r
        return None

    async def history(self, mission_id, start, end, limit, bucket, source=None):
        out = [r for r in self.rows if r["mission_id"] == mission_id
               and (start is None or r["time"] >= start) and (end is None or r["time"] <= end)
               and (source is None or r.get("source") == source)]
        return out[-limit:]

    async def mission(self, mission_id: str) -> dict | None:
        return DEFAULT_MISSION if mission_id == DEFAULT_MISSION["id"] else None

    async def close(self) -> None:
        return None


class TimescaleRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self.pool = pool

    @classmethod
    async def connect(cls, dsn: str) -> TimescaleRepository:
        return cls(await asyncpg.create_pool(dsn, min_size=1, max_size=10, timeout=5))

    async def insert(self, p: TelemetryIn) -> None:
        d = p.model_dump()
        placeholders = ",".join(f"${i + 1}" for i in range(len(COLS)))
        await self.pool.execute(
            "INSERT INTO telemetry (" + ",".join(COLS) + ") VALUES (" + placeholders + ")",
            *[d[c] for c in COLS])

    async def latest(self, mission_id: str, source: str | None = None) -> dict | None:
        if source is None:
            row = await self.pool.fetchrow("SELECT * FROM telemetry WHERE mission_id=$1 ORDER BY time DESC LIMIT 1", mission_id)
        else:
            row = await self.pool.fetchrow("SELECT * FROM telemetry WHERE mission_id=$1 AND source=$2 ORDER BY time DESC LIMIT 1", mission_id, source)
        return dict(row) if row else None

    async def history(self, mission_id, start, end, limit, bucket, source=None):
        if bucket:  # lectura desde el continuous aggregate (CQRS ligero)
            rows = await self.pool.fetch(
                "SELECT bucket AS time, mission_id, altitude, temperature, pressure, humidity, rssi, snr, pdr "
                "FROM telemetry_5min WHERE mission_id=$1 AND ($2::timestamptz IS NULL OR bucket>=$2) "
                "AND ($3::timestamptz IS NULL OR bucket<=$3) ORDER BY bucket DESC LIMIT $4", mission_id, start, end, limit)
            return [dict(r) for r in reversed(rows)]
        if source is None:
            rows = await self.pool.fetch(
                "SELECT * FROM telemetry WHERE mission_id=$1 AND ($2::timestamptz IS NULL OR time>=$2) "
                "AND ($3::timestamptz IS NULL OR time<=$3) ORDER BY time DESC LIMIT $4", mission_id, start, end, limit)
        else:
            rows = await self.pool.fetch(
                "SELECT * FROM telemetry WHERE mission_id=$1 AND ($2::timestamptz IS NULL OR time>=$2) "
                "AND ($3::timestamptz IS NULL OR time<=$3) AND source=$5 ORDER BY time DESC LIMIT $4", mission_id, start, end, limit, source)
        return [dict(r) for r in reversed(rows)]

    async def mission(self, mission_id: str) -> dict | None:
        row = await self.pool.fetchrow("SELECT * FROM missions WHERE id=$1", mission_id)
        return dict(row) if row else None

    async def close(self) -> None:
        await self.pool.close()


async def build_repository(dsn: str | None):
    if dsn:
        try:
            repo = await TimescaleRepository.connect(dsn)
            log.info("timescaledb_connected")
            return repo
        except Exception as e:  # noqa: BLE001
            log.warning("timescaledb_unavailable_using_memory", error=str(e))
    return MemoryRepository()
