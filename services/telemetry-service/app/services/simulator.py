"""Simulador de vuelo HAB (modo demo): el ODC funciona sin hardware.
Ciclo acelerado: ascenso a ~30 km (300 s) y descenso (300 s), a 1 Hz. Atmósfera ISA simplificada."""
from __future__ import annotations

import asyncio
import math
import random
from datetime import UTC, datetime

import structlog

from app.schemas.telemetry import TelemetryIn
from app.services.ingest import ingest

log = structlog.get_logger()
GS_LAT, GS_LON = 4.3369, -74.3636  # estación base (Fusagasugá)
MAX_ALT_M, ASCENT_S, DESCENT_S = 30_000.0, 300, 300


def isa(alt_m: float) -> tuple[float, float]:
    """(temperatura °C, presión hPa) con ISA simplificada."""
    h = alt_m
    if h <= 11_000:
        return 15 - 0.0065 * h, 1013.25 * (1 - 2.25577e-5 * h) ** 5.25588
    if h <= 20_000:
        return -56.5, 226.32 * math.exp(-(h - 11_000) / 6_341.6)
    return -56.5 + 0.001 * (h - 20_000), 54.75 * math.exp(-(h - 20_000) / 6_900)


def altitude_at(t: float) -> float:
    cycle = t % (ASCENT_S + DESCENT_S)
    if cycle < ASCENT_S:
        return MAX_ALT_M * cycle / ASCENT_S
    frac = (cycle - ASCENT_S) / DESCENT_S
    return MAX_ALT_M * (1 - frac) ** 1.6


def sample(t: float, mission_id: str, rng: random.Random | None = None) -> TelemetryIn:
    rng = rng or random
    alt = altitude_at(t)
    temp, pres = isa(alt)
    drift_km = alt / 1000 * 0.9 + (t % 600) * 0.01
    lat = GS_LAT + (drift_km / 111.0) * 0.3
    lon = GS_LON + drift_km / (111.0 * math.cos(math.radians(GS_LAT)))
    slant_km = max(math.hypot(drift_km, alt / 1000), 0.1)
    fspl = 20 * math.log10(slant_km) + 20 * math.log10(915) + 32.44
    rssi = 14 + 2 + 5 - fspl - 2 + rng.gauss(0, 1.2)
    snr = max(-20.0, min(10.0, rssi + 117 + rng.gauss(0, 0.8)))
    pdr = 1 / (1 + math.exp(-(rssi + 132.0) / 5))
    return TelemetryIn(
        time=datetime.now(UTC), mission_id=mission_id, source="simulator", altitude=round(alt, 1),
        temperature=round(temp + rng.gauss(0, 0.3), 2), pressure=round(max(pres + rng.gauss(0, 0.2), 0.0), 2),
        humidity=round(max(0.0, min(100.0, 60 - alt / 600 + rng.gauss(0, 1.5))), 1),
        latitude=round(lat, 5), longitude=round(lon, 5), rssi=round(max(-160.0, min(0.0, rssi)), 1),
        snr=round(snr, 1), pdr=round(pdr, 3),
    )


async def run_simulator(app, mission_id: str) -> None:
    log.info("telemetry_demo_started", mission=mission_id)
    t = 0
    while True:
        try:
            await ingest(app, sample(t, mission_id))
        except Exception as e:  # noqa: BLE001
            log.warning("simulator_error", error=str(e))
        t += 1
        await asyncio.sleep(1)
