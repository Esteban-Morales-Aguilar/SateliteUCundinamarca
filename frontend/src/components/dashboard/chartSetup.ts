import {
  CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { useThemeStore } from '../../store/themeStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

/** Colores de ejes y rejilla según el tema. */
export function useChartColors() {
  const dark = useThemeStore((s) => s.dark);
  return { text: dark ? '#b6c2dc' : '#475569', grid: dark ? 'rgba(148,163,184,.15)' : 'rgba(100,116,139,.18)', blue: dark ? '#38bdf8' : '#003366', red: dark ? '#f87171' : '#B71C1C', green: dark ? '#4ade80' : '#15803d', amber: dark ? '#fbbf24' : '#b45309' };
}
