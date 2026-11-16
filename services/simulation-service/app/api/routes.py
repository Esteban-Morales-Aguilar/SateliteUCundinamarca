from fastapi import APIRouter, Request

from app.core import service
from app.core.cache import cached
from app.core.limiter import limiter
from app.schemas import simulation as s

router = APIRouter(prefix="/api/v1/simulation", tags=["simulation"])


@router.post("/link-budget", response_model=s.LinkBudgetOut)
@limiter.limit("60/minute")
async def link_budget(request: Request, body: s.LinkBudgetIn):
    return await cached("lb", body.model_dump(), lambda: service.link_budget(body))


@router.post("/doppler", response_model=s.DopplerOut)
@limiter.limit("60/minute")
async def doppler(request: Request, body: s.DopplerIn):
    return await cached("dop", body.model_dump(), lambda: service.doppler(body))


@router.post("/coverage", response_model=s.CoverageOut)
@limiter.limit("60/minute")
async def coverage(request: Request, body: s.CoverageIn):
    return await cached("cov", body.model_dump(), lambda: service.coverage(body))


@router.post("/optimize", response_model=s.OptimizeOut)
@limiter.limit("60/minute")
async def optimize(request: Request, body: s.OptimizeIn):
    return await cached("opt", body.model_dump(), lambda: service.optimize(body))
