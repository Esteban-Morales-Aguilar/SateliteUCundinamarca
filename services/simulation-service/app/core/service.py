"""Orquestación de los cálculos (separada de HTTP para facilitar tests)."""
from __future__ import annotations

from app.core import coverage as cov
from app.core import doppler as dop
from app.core import link_budget as lb
from app.schemas import simulation as s


def _misc(i) -> float:
    return i.l_misc_db + lb.CLIMATE_LOSS_DB[i.climate]


def link_budget(i: s.LinkBudgetIn) -> dict:
    misc = _misc(i)
    f = lb.fspl_db(i.distance_km, i.freq_mhz)
    p_rx = lb.received_power_dbm(i.p_tx_dbm, i.g_tx_dbi, i.g_rx_dbi, f, misc)
    sens = lb.sensitivity_dbm(i.sf, i.bw_khz, i.nf_db)
    margin = p_rx - sens
    rng = lb.max_range_km(i.p_tx_dbm, i.g_tx_dbi, i.g_rx_dbi, i.freq_mhz, sens, misc)
    viable = margin > 0
    if i.lang == "en":
        msg = ("Viable link: received power exceeds sensitivity."
               if viable else "Non-viable link: increase SF, power or gain, or reduce the distance.")
    else:
        msg = ("Enlace viable: la potencia recibida supera la sensibilidad."
               if viable else "Enlace no viable: aumente SF, potencia o ganancia, o reduzca la distancia.")
    curve_max = min(max(i.distance_km * 2, rng * 1.1), 5000)
    return {
        "fspl_db": round(f, 2), "p_rx_dbm": round(p_rx, 2), "sensitivity_dbm": round(sens, 2),
        "link_margin_db": round(margin, 2), "pdr_estimated": round(lb.pdr_estimate(margin), 3),
        "viable": viable, "max_range_km": round(rng, 1),
        "bitrate_bps": round(lb.bitrate_bps(i.sf, i.bw_khz), 1), "message": msg,
        "loss_curve": lb.loss_curve(i.p_tx_dbm, i.g_tx_dbi, i.g_rx_dbi, i.freq_mhz, misc, curve_max),
    }


def doppler(i: s.DopplerIn) -> dict:
    v = dop.orbital_velocity_ms(i.altitude_km)
    vr = dop.radial_velocity_ms(i.altitude_km, i.elevation_deg)
    shift = dop.doppler_shift_hz(vr, i.freq_mhz * 1e6)
    tol = dop.lora_tolerance_hz(i.bw_khz)
    ok = abs(shift) <= tol
    if i.lang == "en":
        msg = ("The shift is within the receiver tolerance."
               if ok else "The shift exceeds the tolerance: pre-compensate frequency or increase BW.")
    else:
        msg = ("El corrimiento está dentro de la tolerancia del receptor."
               if ok else "El corrimiento excede la tolerancia: pre-compense frecuencia o aumente BW.")
    return {
        "orbital_velocity_kms": round(v / 1000, 3), "orbital_period_min": round(dop.orbital_period_min(i.altitude_km), 1),
        "radial_velocity_kms": round(vr / 1000, 3), "doppler_shift_khz": round(shift / 1000, 2),
        "lora_tolerance_khz": round(tol / 1000, 2), "within_tolerance": ok, "message": msg,
        "pass_profile": dop.pass_profile(i.altitude_km, i.freq_mhz),
    }


def coverage(i: s.CoverageIn) -> dict:
    sens = lb.sensitivity_dbm(i.sf, i.bw_khz, i.nf_db)
    rng = lb.max_range_km(i.p_tx_dbm, i.g_tx_dbi, i.g_rx_dbi, i.freq_mhz, sens, _misc(i))
    hor = cov.horizon_distance_km(i.altitude_km)
    radius = cov.coverage_radius_km(rng, i.altitude_km)
    return {
        "radio_range_km": round(rng, 1), "horizon_km": round(hor, 1), "coverage_radius_km": round(radius, 1),
        "coverage_area_km2": round(cov.coverage_area_km2(radius), 0), "limited_by": "radio" if rng <= hor else "horizonte",
    }


def optimize(i: s.OptimizeIn) -> dict:
    f = lb.fspl_db(i.distance_km, i.freq_mhz)
    p_rx = lb.received_power_dbm(i.p_tx_dbm, i.g_tx_dbi, i.g_rx_dbi, f, _misc(i))
    cands = []
    for sf in range(7, 13):
        for bw in (125, 250, 500):
            margin = p_rx - lb.sensitivity_dbm(sf, bw, i.nf_db)
            cands.append({"sf": sf, "bw_khz": bw, "link_margin_db": round(margin, 2),
                          "bitrate_bps": round(lb.bitrate_bps(sf, bw), 1),
                          "pdr_estimated": round(lb.pdr_estimate(margin), 3), "meets_target": margin >= i.target_margin_db})
    ok = [c for c in cands if c["meets_target"]]
    rec = max(ok, key=lambda c: c["bitrate_bps"]) if ok else None
    if i.lang == "en":
        msg = (f"Recommended SF{rec['sf']}/BW{rec['bw_khz']} kHz: highest rate with margin ≥ {i.target_margin_db} dB."
               if rec else "No combination reaches the target margin: reduce distance or increase power/gain.")
    else:
        msg = (f"Recomendado SF{rec['sf']}/BW{rec['bw_khz']} kHz: mayor tasa con margen ≥ {i.target_margin_db} dB."
               if rec else "Ninguna combinación alcanza el margen objetivo: reduzca distancia o aumente potencia/ganancia.")
    cands.sort(key=lambda c: -c["link_margin_db"])
    return {"recommended": rec, "candidates": cands[:10], "message": msg}
