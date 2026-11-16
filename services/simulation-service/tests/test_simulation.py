import math

import pytest
from fastapi.testclient import TestClient

from app.core import coverage as cov
from app.core import doppler as dop
from app.core import link_budget as lb
from app.main import app

client = TestClient(app)


def test_fspl_reference_value():
    assert lb.fspl_db(1, 1) == pytest.approx(32.44)
    assert lb.fspl_db(10, 915) == pytest.approx(111.67, abs=0.05)


def test_fspl_doubling_distance_adds_6db():
    assert lb.fspl_db(20, 915) - lb.fspl_db(10, 915) == pytest.approx(6.02, abs=0.01)


def test_sensitivity_sf10_bw125():
    assert lb.sensitivity_dbm(10, 125, 6) == pytest.approx(-132.0, abs=0.1)


def test_higher_sf_more_sensitive():
    assert lb.sensitivity_dbm(12, 125) < lb.sensitivity_dbm(7, 125)


def test_pdr_sigmoid():
    assert lb.pdr_estimate(0) == pytest.approx(0.5)
    assert lb.pdr_estimate(20) > 0.97
    assert lb.pdr_estimate(-20) < 0.03


def test_max_range_consistent_with_fspl():
    s = lb.sensitivity_dbm(10, 125)
    d = lb.max_range_km(14, 2, 5, 915, s, 2)
    assert lb.received_power_dbm(14, 2, 5, lb.fspl_db(d, 915), 2) == pytest.approx(s, abs=0.01)


def test_orbital_velocity_400km():
    assert dop.orbital_velocity_ms(400) / 1000 == pytest.approx(7.67, abs=0.02)


def test_doppler_915mhz_leo():
    shift = dop.doppler_shift_hz(dop.radial_velocity_ms(400, 0), 915e6)
    assert 18_000 < shift < 24_000
    assert dop.radial_velocity_ms(400, 90) == pytest.approx(0, abs=1e-6)


def test_pass_profile_sign_flip():
    p = dop.pass_profile(400, 915)
    assert p[0]["doppler_hz"] > 0 > p[-1]["doppler_hz"]


def test_horizon_hab_30km():
    assert cov.horizon_distance_km(30) == pytest.approx(math.sqrt(2 * 6371 * 30 + 900), rel=1e-6)


def test_endpoint_link_budget():
    r = client.post("/api/v1/simulation/link-budget", json={"distance_km": 10})
    assert r.status_code == 200
    body = r.json()
    assert body["viable"] is True and body["link_margin_db"] > 0 and len(body["loss_curve"]) > 5


def test_endpoint_validation():
    assert client.post("/api/v1/simulation/link-budget", json={"sf": 20}).status_code == 422
    assert client.post("/api/v1/simulation/link-budget", json={"freq_mhz": 900}).status_code == 422


def test_endpoints_doppler_coverage_optimize():
    assert client.post("/api/v1/simulation/doppler", json={}).status_code == 200
    c = client.post("/api/v1/simulation/coverage", json={"altitude_km": 30}).json()
    assert c["coverage_radius_km"] <= c["horizon_km"]
    assert client.post("/api/v1/simulation/optimize", json={"distance_km": 5}).json()["recommended"] is not None


def test_health_and_metrics():
    assert client.get("/health").json()["status"] == "ok"
    assert b"http_requests_total" in client.get("/metrics").content
