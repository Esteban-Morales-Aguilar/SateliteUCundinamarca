import time

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from app.api.routes import router
from app.core.config import settings
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

structlog.configure(processors=[structlog.processors.TimeStamper(fmt="iso"), structlog.processors.JSONRenderer()])
log = structlog.get_logger()

app = FastAPI(title="SpaceNet Lab - Simulation API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin.split(","), allow_methods=["GET", "POST"], allow_headers=["*"])

REQS = Counter("http_requests_total", "Total de peticiones", ["method", "route", "status"])
LAT = Histogram("http_request_duration_seconds", "Latencia", ["method", "route", "status"])


@app.middleware("http")
async def metrics_mw(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = getattr(request.scope.get("route"), "path", "unmatched")
    labels = (request.method, path, str(response.status_code))
    REQS.labels(*labels).inc()
    LAT.labels(*labels).observe(time.perf_counter() - start)
    log.info("http", service="simulation-service", method=request.method, path=request.url.path, status=response.status_code)
    return response


@app.get("/health")
async def health():
    return {"status": "ok", "service": "simulation-service"}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(router)
