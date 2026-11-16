from fastapi import APIRouter, HTTPException, Request

from app.core.config import settings
from app.schemas.telemetry import MissionOut

router = APIRouter(prefix="/api/v1/mission", tags=["mission"])


@router.get("", response_model=MissionOut)
async def current_mission(request: Request):
    row = await request.app.state.repo.mission(settings.default_mission_id)
    if not row:
        raise HTTPException(404, "Misión no encontrada")
    return row
