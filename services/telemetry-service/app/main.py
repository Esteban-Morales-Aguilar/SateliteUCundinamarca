import asyncio
import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1 import mission, telemetry, websocket
from app.core.config import settings
from app.services import metrics
from app.services.hub import ConnectionHub
from app.services.rabbitmq_consumer import consume
from app.services.repository import build_repository
from app.services.simulator import run_simulator

structlog.configure(processors=[structlog.processors.TimeStamper(fmt="iso"), structlog.processors.JSONRenderer()])
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.repo = await build_repository(settings.database_url)
    app.state.hub = ConnectionHub()
    tasks: list[asyncio.Task] = []
    if settings.rabbitmq_url:
        tasks.append(asyncio.create_task(consume(app, settings.rabbitmq_url)))
    if settings.telemetry_demo:
        tasks.append(asyncio.create_task(run_simulator(app, settings.simulator_mission_id)))
    yield
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    await app.state.repo.close()


app = FastAPI(title="SpaceNet Lab - Telemetry API", version="1.0.0", lifespan=lifespan)
app.state.limiter = telemetry.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin.split(","), allow_methods=["GET", "POST"], allow_headers=["*"])


@app.middleware("http")
async def metrics_mw(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = getattr(request.scope.get("route"), "path", "unmatched")
    labels = (request.method, path, str(response.status_code))
    metrics.HTTP_REQS.labels(*labels).inc()
    metrics.HTTP_LAT.labels(*labels).observe(time.perf_counter() - start)
    log.info("http", service="telemetry-service", method=request.method, path=request.url.path, status=response.status_code)
    return response


@app.get("/health")
async def health(request: Request):
    return {"status": "ok", "service": "telemetry-service", "storage": type(request.app.state.repo).__name__,
            "ws_clients": len(request.app.state.hub.clients)}


@app.get("/metrics")
async def prom_metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(telemetry.router)
app.include_router(mission.router)
app.include_router(websocket.router)
