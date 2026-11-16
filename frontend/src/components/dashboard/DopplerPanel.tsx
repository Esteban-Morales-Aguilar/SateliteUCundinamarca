import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { simulationService } from '../../services/simulation.service';
import type { SimState } from '../../hooks/useSimulation';
import { fmt } from '../../utils/format';
import { Slider } from './controls';
import { useChartColors } from './chartSetup';
import { useTranslation } from 'react-i18next';

/** Efecto Doppler para un CubeSat en LEO usando la frecuencia, SF y BW del simulador. */
export function DopplerPanel({ s }: { s: SimState }) {
  const { t } = useTranslation();
  const [alt, setAlt] = useState(400);
  const [elev, setElev] = useState(0);
  const c = useChartColors();
  const q = useQuery({
    queryKey: ['doppler', alt, elev, s.freq_mhz, s.bw_khz, s.sf],
    queryFn: () => simulationService.doppler({ altitude_km: alt, elevation_deg: elev, freq_mhz: s.freq_mhz, bw_khz: s.bw_khz, sf: s.sf }),
    placeholderData: (p) => p,
  });
  const d = q.data;
  return (
    <section className="card" aria-labelledby="dop-title">
      <h3 id="dop-title" className="text-lg font-bold">{t('dashboard.dopplerEffect')}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('dashboard.dopplerDescription')} Un CubeSat que pasa sobre la estación desplaza la frecuencia recibida: f_d = (v_r / c) · f_c. Usa la frecuencia y el ancho de banda elegidos arriba.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t('dashboard.orbitalAltitude')} value={alt} unit="km" min={200} max={1200} step={10} onChange={setAlt} />
        <Slider label={t('dashboard.elevationAngle')} value={elev} unit="°" min={0} max={90} onChange={setElev} hint={t('dashboard.elevationHint')} />
      </div>
      {d && (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-slate-500">{t('dashboard.orbitalVelocity')}:</dt><dd className="mono font-semibold">{fmt(d.orbital_velocity_kms, 2)} km/s</dd></div>
            <div><dt className="text-slate-500">{t('dashboard.period')}:</dt><dd className="mono font-semibold">{fmt(d.orbital_period_min, 0)} min</dd></div>
            <div><dt className="text-slate-500">{t('dashboard.dopplerShift')}:</dt><dd className="mono font-semibold">{fmt(d.doppler_shift_khz, 1)} kHz</dd></div>
            <div><dt className="text-slate-500">{t('dashboard.receiverTolerance')}:</dt><dd className="mono font-semibold">± {fmt(d.lora_tolerance_khz, 1)} kHz</dd></div>
          </dl>
          <p className={`mt-3 rounded-lg p-3 text-sm ${d.within_tolerance ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'}`}>{d.message}</p>
          <div className="mt-4 h-52" role="img" aria-label={t('dashboard.dopplerChartLabel')}>
            <Line
              data={{ labels: d.pass_profile.map((_, i) => i), datasets: [
                { label: t('dashboard.doppler') + ' (kHz)', data: d.pass_profile.map((p) => p.doppler_hz / 1000), borderColor: c.blue, pointRadius: 0, borderWidth: 2.5, tension: 0.3 },
                { label: t('dashboard.tolerancePlus'), data: d.pass_profile.map(() => d.lora_tolerance_khz), borderColor: c.red, borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5 },
                { label: t('dashboard.toleranceMinus'), data: d.pass_profile.map(() => -d.lora_tolerance_khz), borderColor: c.red, borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5 },
              ] }}
              options={{ responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { color: c.text, usePointStyle: true } } },
                scales: { x: { title: { display: true, text: t('dashboard.stepEvolution'), color: c.text }, ticks: { display: false }, grid: { display: false } }, y: { title: { display: true, text: t('dashboard.khz'), color: c.text }, ticks: { color: c.text }, grid: { color: c.grid } } } }} />
          </div>
        </>
      )}
    </section>
  );
}