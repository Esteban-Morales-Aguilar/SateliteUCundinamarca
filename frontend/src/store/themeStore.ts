import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create<{ dark: boolean; toggle: () => void }>()(
  persist((set, get) => ({ dark: false, toggle: () => set({ dark: !get().dark }) }), { name: 'spacenet-theme' }),
);
