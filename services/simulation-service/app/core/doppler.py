"""Efecto Doppler para un satélite en órbita circular (modelo simplificado)."""
from __future__ import annotations

import math

MU_EARTH = 3.986004418e14
R_EARTH_M = 6_371_000.0
C = 299_792_458.0


def orbital_velocity_ms(altitude_km: float) -> float:
    return math.sqrt(MU_EARTH / (R_EARTH_M + altitude_km * 1000))


def orbital_period_min(altitude_km: float) -> float:
    a = R_EARTH_M + altitude_km * 1000
    return 2 * math.pi * math.sqrt(a**3 / MU_EARTH) / 60


def radial_velocity_ms(altitude_km: float, elevation_deg: float) -> float:
    """v_r = v · R/(R+h) · cos(elevación): máxima en el horizonte, cero en el cenit."""
    v = orbital_velocity_ms(altitude_km)
    return v * R_EARTH_M / (R_EARTH_M + altitude_km * 1000) * math.cos(math.radians(elevation_deg))


def doppler_shift_hz(v_radial_ms: float, freq_hz: float) -> float:
    """f_d = (v_r / c) · f_c"""
    return v_radial_ms / C * freq_hz


def lora_tolerance_hz(bw_khz: float) -> float:
    """Tolerancia aproximada al desajuste de frecuencia: ±25 % del ancho de banda."""
    return 0.25 * bw_khz * 1000


def pass_profile(altitude_km: float, freq_mhz: float, step_deg: int = 5):
    """Doppler durante un paso: elevación 0→90 (acercándose, +) y 90→0 (alejándose, −)."""
    freq = freq_mhz * 1e6
    elevations = list(range(0, 91, step_deg)) + list(range(90 - step_deg, -1, -step_deg))
    half = 90 // step_deg
    out = []
    for i, e in enumerate(elevations):
        sign = 1 if i <= half else -1
        out.append({"elevation_deg": e, "doppler_hz": round(doppler_shift_hz(radial_velocity_ms(altitude_km, e) * sign, freq), 1)})
    return out
