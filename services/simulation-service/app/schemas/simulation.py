from typing import Literal

from pydantic import BaseModel, Field

Climate = Literal["despejado", "nublado", "lluvia", "tormenta"]


class LinkBudgetIn(BaseModel):
    p_tx_dbm: float = Field(14, ge=-10, le=30)
    g_tx_dbi: float = Field(2, ge=-5, le=30)
    g_rx_dbi: float = Field(5, ge=-5, le=40)
    distance_km: float = Field(50, gt=0, le=3000)
    freq_mhz: Literal[433, 868, 915] = 915
    sf: int = Field(10, ge=7, le=12)
    bw_khz: Literal[125, 250, 500] = 125
    l_misc_db: float = Field(2, ge=0, le=40)
    climate: Climate = "despejado"
    nf_db: float = Field(6, ge=0, le=15)
    lang: Literal["es", "en"] = "es"


class LinkBudgetOut(BaseModel):
    fspl_db: float
    p_rx_dbm: float
    sensitivity_dbm: float
    link_margin_db: float
    pdr_estimated: float
    viable: bool
    max_range_km: float
    bitrate_bps: float
    message: str
    loss_curve: list[dict]


class DopplerIn(BaseModel):
    altitude_km: float = Field(400, gt=0, le=2000)
    freq_mhz: Literal[433, 868, 915] = 915
    elevation_deg: float = Field(0, ge=0, le=90)
    bw_khz: Literal[125, 250, 500] = 125
    sf: int = Field(10, ge=7, le=12)
    lang: Literal["es", "en"] = "es"


class DopplerOut(BaseModel):
    orbital_velocity_kms: float
    orbital_period_min: float
    radial_velocity_kms: float
    doppler_shift_khz: float
    lora_tolerance_khz: float
    within_tolerance: bool
    message: str
    pass_profile: list[dict]


class CoverageIn(LinkBudgetIn):
    altitude_km: float = Field(30, ge=0, le=2000)


class CoverageOut(BaseModel):
    radio_range_km: float
    horizon_km: float
    coverage_radius_km: float
    coverage_area_km2: float
    limited_by: Literal["radio", "horizonte"]


class OptimizeIn(BaseModel):
    p_tx_dbm: float = Field(14, ge=-10, le=30)
    g_tx_dbi: float = 2
    g_rx_dbi: float = 5
    distance_km: float = Field(50, gt=0, le=3000)
    freq_mhz: Literal[433, 868, 915] = 915
    l_misc_db: float = Field(2, ge=0, le=40)
    climate: Climate = "despejado"
    nf_db: float = 6
    target_margin_db: float = Field(10, ge=0, le=30)
    lang: Literal["es", "en"] = "es"


class OptimizeOut(BaseModel):
    recommended: dict | None
    candidates: list[dict]
    message: str
