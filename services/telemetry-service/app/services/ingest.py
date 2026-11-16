"""Punto único de ingesta (HTTP, RabbitMQ y simulador): persiste, mide y difunde."""
from __future__ import annotations

from app.schemas.telemetry import TelemetryIn
from app.services import metrics


async def ingest(app, point: TelemetryIn) -> None:
    await app.state.repo.insert(point)
    metrics.PACKETS.inc()
    if point.altitude is not None:
        metrics.ALT.set(point.altitude)
    if point.rssi is not None:
        metrics.RSSI.set(point.rssi)
    if point.snr is not None:
        metrics.SNR.set(point.snr)
    await app.state.hub.broadcast(point.model_dump(mode="json"))
