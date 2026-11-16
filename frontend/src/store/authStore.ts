import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, User } from '../types';

const base = import.meta.env.VITE_API_URL ?? '/api/v1';

interface AuthState {
  user: User | null; accessToken: string | null; refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null, refreshToken: null,
      async login(email, password) {
        const { data } = await axios.post<AuthResponse>(`${base}/auth/login`, { email, password });
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },
      async logout() {
        const rt = get().refreshToken;
        if (rt) await axios.post(`${base}/auth/logout`, { refreshToken: rt }).catch(() => undefined);
        set({ user: null, accessToken: null, refreshToken: null });
      },
      async refresh() {
        const rt = get().refreshToken;
        if (!rt) return null;
        try {
          const { data } = await axios.post<AuthResponse>(`${base}/auth/refresh`, { refreshToken: rt });
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return data.accessToken;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return null;
        }
      },
    }),
    { name: 'spacenet-auth' },
  ),
);
