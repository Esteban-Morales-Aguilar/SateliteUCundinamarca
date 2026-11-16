"""Punto de acceso a la BD: reexporta la construcción del repositorio (TimescaleDB o memoria)."""
from app.services.repository import build_repository

__all__ = ["build_repository"]
