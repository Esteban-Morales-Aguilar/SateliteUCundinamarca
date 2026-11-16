import { useSimulation, slantRange } from '../../hooks/useSimulation';
import { Loader, ErrorNotice } from '../common/Loader';
import { Segmented, Slider } from './controls';
import { LinkBudget } from './LinkBudget';
import { LossChart } from './LossChart';
import { CoveragePanel } from './CoveragePanel';
import { DopplerPanel } from './DopplerPanel';
import { OptimizerPanel } from './OptimizerPanel';
import { useTranslation } from 'react-i18next';

export function NetworkSimulator() {
  const { state: s, set, setState, reset, link, coverage } = useSimulation();
  const { t } = useTranslation();
  const dist = slantRange(s.altitude_km, s.horizontal_km);

  // Weather translations for the CLIMAS options
  const weatherTranslations = {
    despejado: t('dashboard.weatherClear'),
    nublado: t('dashboard.weatherCloudy'),
    lluvia: t('dashboard.weatherRain'),
    tormenta: t('dashboard.weatherStorm'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-blue dark:text-white">{t('dashboard.networkSimulator')}</h2>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">{t('dashboard.simulatorDescription')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <form className="card space-y-5 lg:self-start" onSubmit={(e) => e.preventDefault()} aria-label={t('dashboard.linkParameters')}>
          <Slider label={t('dashboard.altitude')} value={s.altitude_km} unit="km" min={0} max={40} onChange={(v) => set('altitude_km', v)} hint="La estratosfera comienza a ~12 km." />
          <Slider label={t('dashboard.horizontalDistance')} value={s.horizontal_km} unit="km" min={0} max={300} onChange={(v) => set('horizontal_km', v)} hint={`Distancia en línea recta resultante: ${dist.toFixed(1)} km`} />
          <Slider label={t('dashboard.transmissionPower')} value={s.p_tx_dbm} unit="dBm" min={2} max={20} onChange={(v) => set('p_tx_dbm', v)} />
          <Segmented label={t('dashboard.frequency')} value={s.freq_mhz} options={[433, 868, 915] as const} onChange={(v) => set('freq_mhz', v)} />
          <Slider label={t('dashboard.spreadingFactor')} value={s.sf} unit="" min={7} max={12} onChange={(v) => set('sf', v)} hint="SF alto: más alcance, menos velocidad." />
          <Segmented label={t('dashboard.bandwidth')} value={s.bw_khz} options={[125, 250, 500] as const} onChange={(v) => set('bw_khz', v)} />
          <Segmented label={t('dashboard.weather')} value={s.climate} options={['despejado', 'nublado', 'lluvia', 'tormenta'] as const} onChange={(v) => set('climate', v)} format={(v) => weatherTranslations[v as keyof typeof weatherTranslations] || v} />
          <button type="button" className="btn-ghost w-full" onClick={reset}>{t('dashboard.reset')}</button>
        </form>

        <div className="min-w-0 space-y-6">
          {link.isError && <ErrorNotice message={t('dashboard.connectionError')} onRetry={() => void link.refetch()} />}
          {!link.data && link.isLoading && <Loader />}
          {link.data && (
            <>
              <LossChart link={link.data} distanceKm={dist} />
              <div className="grid gap-6 xl:grid-cols-2">
                <LinkBudget link={link.data} s={s} distanceKm={dist} />
                <div className="space-y-6">
                  {coverage.data && <CoveragePanel cov={coverage.data} />}
                  <OptimizerPanel s={s} onApply={(sf, bw_khz) => setState((p) => ({ ...p, sf, bw_khz }))} />
                </div>
              </div>
            </>
          )}
          <DopplerPanel s={s} />
        </div>
      </div>
    </div>
  );
}