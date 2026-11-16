import { Line } from 'react-chartjs-2';
import type { LinkResult } from '../../types';
import { useChartColors } from './chartSetup';
import { useTranslation } from 'react-i18next';

export function LossChart({ link, distanceKm }: { link: LinkResult; distanceKm: number }) {
  const { t } = useTranslation();
  const c = useChartColors();
  const prx = [{ x: 0, y: link.p_rx_dbm }, { x: distanceKm, y: link.p_rx_dbm }];
  const xmax = distanceKm;
  const data = {
    labels: prx.map((p) => p.x.toFixed(0)),
    datasets: [
      { label: t('dashboard.receivedPower') + ' (dBm)', data: prx, borderColor: c.blue, backgroundColor: c.blue, pointRadius: 0, borderWidth: 2.5, tension: 0.2 },
      { label: t('dashboard.sensitivity') + ' del receptor', data: [{ x: 0, y: link.sensitivity_dbm }, { x: xmax, y: link.sensitivity_dbm }], borderColor: c.red, borderDash: [6, 5], pointRadius: 0, borderWidth: 2 },
      { label: t('dashboard.operatingPoint'), data: [{ x: distanceKm, y: link.p_rx_dbm }], borderColor: c.amber, backgroundColor: c.amber, pointRadius: 7, pointHoverRadius: 9, showLine: false },
    ],
  };
  return (
    <figure className="card">
      <figcaption className="mb-2 flex items-baseline justify-between text-sm font-semibold">
        <span>{t('dashboard.lossChart')}</span>
        <span className="mono text-xs font-normal text-slate-500">{t('dashboard.power')} dBm</span>
      </figcaption>
      <div className="h-44" role="img" aria-label={t('dashboard.lossChartLabel')}>
        <Line data={data} options={{
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: true, labels: { color: c.text, usePointStyle: true } } },
          scales: { x: { title: { display: true, text: t('dashboard.distance') + ' (km)', color: c.text }, ticks: { color: c.text, maxTicksLimit: 5, maxRotation: 0 }, grid: { display: false } }, y: { title: { display: true, text: t('dashboard.power') + ' (dBm)', color: c.text }, ticks: { color: c.text }, grid: { color: c.grid } },
        }} />
      </div>
    </figure>
  );
}