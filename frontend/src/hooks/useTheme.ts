import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

/** Sincroniza la clase `dark` del <html> con el store. */
export function useTheme() {
  const { dark, toggle } = useThemeStore();
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  return { dark, toggle };
}
