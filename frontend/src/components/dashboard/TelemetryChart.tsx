import { Line } from 'react-chartjs-2';
import type { TelemetryPoint } from '../../types';
import { useChartColors } from './chartSetup';
import { useTranslation } from 'react-i18next';

type Field = 'altitude' | 'temperature' | 'pressure' | 'humidity' | 'rssi' | 'snr';

export function TelemetryChart({ points, field, title, unit, color }: {
  points: TelemetryPoint[]; field: Field; title: string; unit: string; color: 'blue' | 'red' | 'green' | 'amber';
}) {
  const c = useChartColors();
  const { t } = useTranslation();
  const valid = points.filter((p) => p[field] != null);
  const data = {
    labels: valid.map((p) => new Date(p.time).toLocaleTimeString('es-CO', { hour12: false })),
    datasets: [{ label: `${title} (${unit})`, data: valid.map((p) => p[field] as number), borderColor: c[color], backgroundColor: `${c[color]}22`, fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }],
  };
  return (
    <figure className="card">
      <figcaption className="mb-2 flex items-baseline justify-between text-sm font-semibold"><span>{title}</span><span className="mono text-xs font-normal text-slate-500">{unit}</span></figcaption>
      <div className="h-44" role="img" aria-label={t('telemetryChart.chartOf') + ' ' + title + ' ' + t('telemetryChart.lastPoints')}>
        <Line data={data} options={{
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: c.text, maxTicksLimit: 5, maxRotation: 0 }, grid: { display: false } }, y: { ticks: { color: c.text }, grid: { color: c.grid } } },
        }} />
      </div>
    </figure>
  );
}
