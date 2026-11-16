import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api/v1', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && useAuthStore.getState().refreshToken) {
      original._retry = true;
      refreshing ??= useAuthStore.getState().refresh().finally(() => { refreshing = null; });
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export const apiError = (e: unknown, fallback = 'Ocurrió un error inesperado'): string => {
  if (axios.isAxiosError(e)) {
    const m = e.response?.data?.message ?? e.response?.data?.detail;
    if (Array.isArray(m)) return m.join('. ');
    if (typeof m === 'string') return m;
    if (e.code === 'ECONNABORTED') return 'La solicitud tardó demasiado';
    if (!e.response) return 'No hay conexión con el servidor';
  }
  return fallback;
};
