from fastapi import APIRouter
from app.core import link_budget as lb
from app.core import doppler as dp
from app.core import coverage as cov
from app.schemas.simulation import LinkBudgetInput, DopplerInput, CoverageInput

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/link-budget")
def calc_link_budget(inp: LinkBudgetInput):
    """Balance de enlace + margen contra sensibilidad + PDR estimado."""
    sens = lb.lora_sensitivity(inp.sf, inp.bw_khz, inp.nf_db)
    result = lb.link_budget(
        inp.p_tx_dbm, inp.g_tx_dbi, inp.g_rx_dbi,
        inp.distance_km, inp.freq_mhz, inp.l_misc_db,
    )
    margin = result["p_rx_dbm"] - (sens + lb.CLIMATE_ATTEN[inp.climate])
    result.update({
        "sensitivity_dbm": round(sens, 2),
        "link_margin_db": round(margin, 2),
        "pdr_estimated": cov.estimated_pdr(margin),
        "climate_atten_db": lb.CLIMATE_ATTEN[inp.climate],
    })
    return result


@router.post("/doppler")
def calc_doppler(inp: DopplerInput):
    """Desplazamiento Doppler y recomendación de pre-compensación."""
    d = dp.doppler_shift_hz(inp.freq_mhz, inp.altitude_km, inp.elevation_deg)
    d.update(dp.precompensation_recommendation(inp.bw_khz, d["doppler_hz"]))
    return d


@router.post("/coverage")
def calc_coverage(inp: CoverageInput):
    """Radio de cobertura y alcance máximo del enlace."""
    radius = cov.coverage_radius_km(inp.altitude_m, inp.antenna_height_m)
    sens = lb.lora_sensitivity(inp.sf, inp.bw_khz)
    max_r = lb.max_range_km(
        inp.p_tx_dbm, inp.g_tx_dbi, inp.g_rx_dbi,
        inp.freq_mhz, sens,
    )
    return {
        "coverage_radius_km": radius,
        "max_link_range_km": max_r,
        "coverage_limited_by": "horizon" if radius < max_r else "link_budget",
        "area_km2": round(3.1416 * radius ** 2, 1),
    }


@router.post("/optimize")
def optimize(inp: LinkBudgetInput):
    """
    Explora SF/BW y recomienda la combinación con mejor margen que cumpla
    el criterio de robustez Doppler (SF<=11, BW>31.25 kHz) de la literatura.
    """
    best = None
    for sf in range(7, 12):            # SF<=11 por robustez Doppler
        for bw in (125, 250, 500):
            sens = lb.lora_sensitivity(sf, bw)
            res = lb.link_budget(
                inp.p_tx_dbm, inp.g_tx_dbi, inp.g_rx_dbi,
                inp.distance_km, inp.freq_mhz, inp.l_misc_db,
            )
            margin = res["p_rx_dbm"] - (sens + lb.CLIMATE_ATTEN[inp.climate])
            candidate = {
                "sf": sf, "bw_khz": bw,
                "margin_db": round(margin, 2),
                "sensitivity_dbm": round(sens, 2),
            }
            if best is None or margin > best["margin_db"]:
                best = candidate
    return {
        "recommended": best,
        "meets_doppler_robustness": True,
        "note": "Restringido a SF<=11 y BW>31.25 kHz (Zadorozhny et al. 2022)",
    }


@router.get("/health")
def health():
    from datetime import datetime, timezone
    return {"status": "ok", "service": "simulation-service",
            "timestamp": datetime.now(timezone.utc).isoformat()}
