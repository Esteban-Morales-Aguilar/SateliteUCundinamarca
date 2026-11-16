import { api } from './api';
import type { Creditos, Guia, MarcoSection, Paginated, Referencia } from '../types';

export const contentService = {
  marcoTeorico: () => api.get<Paginated<MarcoSection>>('/content/marco-teorico', { params: { limit: 50 } }).then((r) => r.data.items),
  guias: () => api.get<Guia[]>('/content/guias').then((r) => r.data),
  creditos: () => api.get<Creditos>('/content/creditos').then((r) => r.data),
  referencias: () => api.get<Referencia[]>('/content/referencias').then((r) => r.data),
};
