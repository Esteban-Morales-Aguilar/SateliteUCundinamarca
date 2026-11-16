import asyncio

from fastapi import WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.services import metrics

router = None  # placeholder, replaced below
from fastapi import APIRouter

router = APIRouter(tags=["websocket"])

ALLOWED_ORIGINS = {o.strip() for o in settings.cors_origin.split(",") if o.strip()}


@router.websocket("/api/v1/ws/telemetry")
async def ws_telemetry(ws: WebSocket):
    origin = ws.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        await ws.close(code=1008)
        return
    hub = ws.app.state.hub
    client_host = (ws.client.host if ws.client else None) or "unknown"
    if not hub.can_connect(client_host):
        await ws.close(code=1013)
        return
    await hub.connect(ws, client_host)
    metrics.WS_CLIENTS.set(len(hub.clients))
    try:
        while True:
            try:
                await asyncio.wait_for(ws.receive_text(), timeout=60)
            except asyncio.TimeoutError:
                await ws.close(code=1001)
                break
    except WebSocketDisconnect:
        pass
    except Exception:
        try:
            await ws.close(code=1011)
        except Exception:
            pass
    finally:
        hub.disconnect(ws, client_host)
        metrics.WS_CLIENTS.set(len(hub.clients))