"""Cobertura geométrica (horizonte) combinada con el alcance radio."""
from __future__ import annotations

import math

R_EARTH_KM = 6371.0


def horizon_distance_km(altitude_km: float) -> float:
    """d = sqrt(2·R·h + h²)"""
    return math.sqrt(2 * R_EARTH_KM * altitude_km + altitude_km**2)


def coverage_radius_km(radio_range_km: float, altitude_km: float) -> float:
    return min(radio_range_km, horizon_distance_km(altitude_km))


def coverage_area_km2(radius_km: float) -> float:
    return math.pi * radius_km**2
