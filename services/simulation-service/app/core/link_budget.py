"""Balance de enlace LoRa (modelo de Friis simplificado) y sensibilidad."""
from __future__ import annotations

import math

SNR_MIN_DB = {7: -7.5, 8: -10.0, 9: -12.5, 10: -15.0, 11: -17.5, 12: -20.0}  # Semtech SX127x
CLIMATE_LOSS_DB = {"despejado": 0.0, "nublado": 0.5, "lluvia": 2.0, "tormenta": 4.0}  # orientativo


def fspl_db(distance_km: float, freq_mhz: float) -> float:
    """FSPL(dB) = 20·log10(d_km) + 20·log10(f_MHz) + 32.44"""
    if distance_km <= 0 or freq_mhz <= 0:
        raise ValueError("distancia y frecuencia deben ser positivas")
    return 20 * math.log10(distance_km) + 20 * math.log10(freq_mhz) + 32.44


def received_power_dbm(p_tx_dbm: float, g_tx_dbi: float, g_rx_dbi: float, fspl: float, l_misc_db: float) -> float:
    """P_rx = P_tx + G_tx + G_rx − FSPL − L_misc"""
    return p_tx_dbm + g_tx_dbi + g_rx_dbi - fspl - l_misc_db


def sensitivity_dbm(sf: int, bw_khz: float, nf_db: float = 6.0) -> float:
    """S = −174 + 10·log10(BW_Hz) + NF + SNR_min"""
    if sf not in SNR_MIN_DB:
        raise ValueError("SF debe estar entre 7 y 12")
    return -174 + 10 * math.log10(bw_khz * 1000) + nf_db + SNR_MIN_DB[sf]


def pdr_estimate(link_margin_db: float) -> float:
    """PDR estimado: sigmoide centrada en margen 0 dB (≈50 %); ≈98 % con +20 dB."""
    return 1.0 / (1.0 + math.exp(-link_margin_db / 5.0))


def max_range_km(p_tx_dbm, g_tx_dbi, g_rx_dbi, freq_mhz, sensitivity, l_misc_db, margin_db=0.0) -> float:
    budget = p_tx_dbm + g_tx_dbi + g_rx_dbi - l_misc_db - sensitivity - margin_db
    return 10 ** ((budget - 20 * math.log10(freq_mhz) - 32.44) / 20)


def bitrate_bps(sf: int, bw_khz: float, cr: int = 1) -> float:
    """Rb = SF · (BW / 2^SF) · 4/(4+CR)   (CR=1 ⇒ 4/5)"""
    return sf * (bw_khz * 1000 / 2**sf) * 4 / (4 + cr)


def loss_curve(p_tx_dbm, g_tx_dbi, g_rx_dbi, freq_mhz, l_misc_db, max_km, points: int = 40):
    out = []
    for i in range(1, points + 1):
        d = max_km * i / points
        f = fspl_db(d, freq_mhz)
        out.append({"distance_km": round(d, 2), "fspl_db": round(f, 2),
                    "p_rx_dbm": round(received_power_dbm(p_tx_dbm, g_tx_dbi, g_rx_dbi, f, l_misc_db), 2)})
    return out
