import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { simulationService } from '../services/simulation.service';
import type { Climate, LinkInput } from '../types';

export interface SimState {
  altitude_km: number;      // altitud del globo/satélite sobre el suelo
  horizontal_km: number;    // distancia horizontal a la estación terrena
  p_tx_dbm: number; g_tx_dbi: number; g_rx_dbi: number; l_misc_db: number; nf_db: number;
  freq_mhz: 433 | 868 | 915; sf: number; bw_khz: 125 | 250 | 500; climate: Climate;
}

export const DEFAULT_STATE: SimState = {
  altitude_km: 30, horizontal_km: 50, p_tx_dbm: 14, g_tx_dbi: 2, g_rx_dbi: 5, l_misc_db: 2, nf_db: 6,
  freq_mhz: 915, sf: 10, bw_khz: 125, climate: 'despejado',
};

/** Distancia en línea recta (slant range) entre la estación y el vehículo. */
export const slantRange = (altitudeKm: number, horizontalKm: number): number =>
  Math.max(Math.hypot(altitudeKm, horizontalKm), 0.1);

export const toLinkInput = (s: SimState): LinkInput & { altitude_km: number } => ({
  p_tx_dbm: s.p_tx_dbm, g_tx_dbi: s.g_tx_dbi, g_rx_dbi: s.g_rx_dbi, distance_km: Math.round(slantRange(s.altitude_km, s.horizontal_km) * 100) / 100,
  freq_mhz: s.freq_mhz, sf: s.sf, bw_khz: s.bw_khz, l_misc_db: s.l_misc_db, climate: s.climate, nf_db: s.nf_db, altitude_km: s.altitude_km,
});

const useDebounced = <T,>(value: T, ms = 250): T => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

/** Recalcula balance de enlace y cobertura al mover los controles (con debounce). */
export function useSimulation() {
  const [state, setState] = useState<SimState>(DEFAULT_STATE);
  const input = toLinkInput(useDebounced(state));
  const link = useQuery({ queryKey: ['link', input], queryFn: () => simulationService.linkBudget(input), placeholderData: (p) => p });
  const coverage = useQuery({ queryKey: ['coverage', input], queryFn: () => simulationService.coverage(input), placeholderData: (p) => p });
  const set = <K extends keyof SimState>(k: K, v: SimState[K]) => setState((p) => ({ ...p, [k]: v }));
  return { state, set, setState, reset: () => setState(DEFAULT_STATE), input, link, coverage };
}
