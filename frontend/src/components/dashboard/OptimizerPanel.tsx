import { useMutation } from '@tanstack/react-query';
import { simulationService } from '../../services/simulation.service';
import type { SimState } from '../../hooks/useSimulation';
import { toLinkInput } from '../../hooks/useSimulation';
import { fmt } from '../../utils/format';
import { useTranslation } from 'react-i18next';

/** Pide al servicio la combinación SF/BW de mayor tasa de datos que mantenga un margen objetivo. */
export function OptimizerPanel({ s, onApply }: { s: SimState; onApply: (sf: number, bw: 125 | 250 | 500) => void }) {
  const { t } = useTranslation();
  const m = useMutation({
    mutationFn: () => {
      const i = toLinkInput(s);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sf: _sf, bw_khz: _bw, altitude_km: _alt, ...rest } = i;
      return simulationService.optimize({ ...rest, target_margin_db: 10 });
    },
  });
  const rec = m.data?.recommended;
  return (
    <section className="card" aria-labelledby="opt-title">
      <h3 id="opt-title" className="text-lg font-bold">{t('dashboard.autoOptimization')}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('dashboard.seekMaxDataRate')} al menos 10 dB de margen con la potencia, ganancias y distancia actuales.</p>
      <button className="btn-primary mt-4" onClick={() => m.mutate()} disabled={m.isPending}>{m.isPending ? t('dashboard.calculating') : t('dashboard.recommendParameters')}</button>
      {m.isError && <p role="alert" className="mt-3 text-sm text-brand-red">{t('dashboard.calculationError')}</p>}
      {m.data && (
        <div className="mt-4 text-sm" role="status">
          <p>{m.data.message}</p>
          {rec && (
            <>
              <p className="mono mt-2">{t('dashboard.sf')} {rec.sf} · {t('dashboard.bw')} {rec.bw_khz} kHz · {t('dashboard.margin')} {fmt(rec.link_margin_db, 1)} dB · {t('dashboard.bitrate')} {fmt(rec.bitrate_bps, 0)} bps · {t('dashboard.pdr')} {fmt(rec.pdr_estimated * 100, 0)} %</p>
              <button className="btn-ghost mt-3" onClick={() => onApply(rec.sf, rec.bw_khz as 125 | 250 | 500)}>{t('dashboard.applyToSimulator')}</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}