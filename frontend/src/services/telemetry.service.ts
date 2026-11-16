import { api } from './api';
import type { Mission, TelemetryPoint } from '../types';

export const telemetryService = {
  latest: () => api.get<TelemetryPoint>('/telemetry/latest').then((r) => r.data),
  history: (limit = 120) => api.get<TelemetryPoint[]>('/telemetry/history', { params: { limit } }).then((r) => r.data),
  mission: () => api.get<Mission>('/telemetry/mission').then((r) => r.data),
};
