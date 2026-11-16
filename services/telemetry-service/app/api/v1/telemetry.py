from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.security import require_api_key
from app.schemas.telemetry import MissionOut, TelemetryIn, TelemetryOut
from app.services.ingest import ingest

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/latest", response_model=TelemetryOut)
@limiter.limit("60/minute")
async def latest(request: Request, mission_id: str = settings.default_mission_id, source: str | None = Query(None, pattern="^(simulator|pi|lora)$")):
    row = await request.app.state.repo.latest(mission_id, source)
    if not row:
        raise HTTPException(404, "Sin telemetría para la misión")
    return row


@router.get("/history", response_model=list[TelemetryOut])
@limiter.limit("30/minute")
async def history(
    request: Request, mission_id: str = settings.default_mission_id, start: datetime | None = None,
    end: datetime | None = None, limit: int = Query(500, ge=1, le=1000),
    bucket: str | None = Query(None, pattern="^5min$", description="'5min' = agregado continuo"),
    source: str | None = Query(None, pattern="^(simulator|pi|lora)$"),
):
    return await request.app.state.repo.history(mission_id, start, end, limit, bucket, source)


@router.get("/mission", response_model=MissionOut)
@limiter.limit("60/minute")
async def mission(request: Request, mission_id: str = settings.default_mission_id):
    row = await request.app.state.repo.mission(mission_id)
    if not row:
        raise HTTPException(404, "Misión no encontrada")
    return row


@router.post("", status_code=201, dependencies=[Depends(require_api_key)])
@limiter.limit("120/minute")
async def receive(request: Request, point: TelemetryIn):
    """Interno: recibe telemetría del satélite/gateway (requiere X-API-Key)."""
    await ingest(request.app, point)
    return {"status": "accepted"}
