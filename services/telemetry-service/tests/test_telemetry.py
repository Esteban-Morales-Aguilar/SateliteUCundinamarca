import random

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services import simulator


@pytest.fixture(autouse=True)
def cfg(monkeypatch):
    monkeypatch.setattr(settings, "telemetry_demo", False)
    monkeypatch.setattr(settings, "database_url", None)
    monkeypatch.setattr(settings, "rabbitmq_url", None)
    monkeypatch.setattr(settings, "telemetry_api_key", "secret-key")


def test_post_requires_api_key():
    with TestClient(app) as c:
        assert c.post("/api/v1/telemetry", json={"altitude": 100}).status_code == 401
        assert c.post("/api/v1/telemetry", json={"altitude": 100}, headers={"X-API-Key": "bad"}).status_code == 401


def test_ingest_and_read_back():
    with TestClient(app) as c:
        r = c.post("/api/v1/telemetry", json={"altitude": 1234.5, "rssi": -90, "pdr": 0.9}, headers={"X-API-Key": "secret-key"})
        assert r.status_code == 201
        assert c.get("/api/v1/telemetry/latest").json()["altitude"] == 1234.5
        assert len(c.get("/api/v1/telemetry/history").json()) == 1
        assert c.get("/api/v1/telemetry/mission").json()["id"] == "ESTRATOSAT-TELCO-01"


def test_validation_rejects_out_of_range():
    with TestClient(app) as c:
        assert c.post("/api/v1/telemetry", json={"humidity": 150}, headers={"X-API-Key": "secret-key"}).status_code == 422


def test_latest_404_when_empty():
    with TestClient(app) as c:
        assert c.get("/api/v1/telemetry/latest").status_code == 404


def test_websocket_receives_broadcast():
    with TestClient(app) as c, c.websocket_connect("/api/v1/ws/telemetry") as ws:
        c.post("/api/v1/telemetry", json={"altitude": 500}, headers={"X-API-Key": "secret-key"})
        assert ws.receive_json()["altitude"] == 500


def test_health_and_metrics():
    with TestClient(app) as c:
        assert c.get("/health").json()["status"] == "ok"
        assert b"telemetry_packets_total" in c.get("/metrics").content


def test_isa_known_values():
    t, p = simulator.isa(0)
    assert t == pytest.approx(15) and p == pytest.approx(1013.25)
    t11, p11 = simulator.isa(11_000)
    assert t11 == pytest.approx(-56.5, abs=0.1) and p11 == pytest.approx(226.3, abs=1.5)


def test_simulator_profile_is_physical():
    pts = [simulator.sample(t, "M", random.Random(1)) for t in range(0, 600, 30)]
    assert max(p.altitude for p in pts) > 25_000
    assert all(0 <= p.pdr <= 1 and p.pressure >= 0 for p in pts)
    assert simulator.altitude_at(0) == 0 and simulator.altitude_at(300) == pytest.approx(30_000)
