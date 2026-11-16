import { api } from './api';
import type { CoverageResult, DopplerResult, LinkInput, LinkResult, OptimizeResult } from '../types';

export const simulationService = {
  linkBudget: (i: LinkInput) => api.post<LinkResult>('/simulation/link-budget', i).then((r) => r.data),
  coverage: (i: LinkInput & { altitude_km: number }) => api.post<CoverageResult>('/simulation/coverage', i).then((r) => r.data),
  doppler: (i: { altitude_km: number; freq_mhz: number; bw_khz: number; sf: number; elevation_deg: number }) =>
    api.post<DopplerResult>('/simulation/doppler', i).then((r) => r.data),
  optimize: (i: Omit<LinkInput, 'sf' | 'bw_khz'> & { target_margin_db: number }) => api.post<OptimizeResult>('/simulation/optimize', i).then((r) => r.data),
};
