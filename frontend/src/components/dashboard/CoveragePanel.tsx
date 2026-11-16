import type { CoverageResult } from '../../types';
import { fmt } from '../../utils/format';
import { useTranslation } from 'react-i18next';

export function CoveragePanel({ cov }: { cov: CoverageResult }) {
  const { t } = useTranslation();
  const max = Math.max(cov.radio_range_km, cov.horizon_km, 1);
  const bar = (v: number, cls: string) => <div className="h-2.5 rounded-full bg-slate-200 dark:bg-space-700"><div className={`h-full rounded-full ${cls}`} style={{ width: `${(v / max) * 100}%` }} /></div>;
  return (
    <section className="card" aria-labelledby="cov-title">
      <h3 id="cov-title" className="text-lg font-bold">{t("dashboard.coverage")}</h3>
      <div className="mt-4 space-y-4 text-sm">
        <div><div className="flex justify-between"><span>{t("dashboard.radioRange")}</span><span className="mono">{fmt(cov.radio_range_km, 0)} km</span></div>{bar(cov.radio_range_km, 'bg-brand-blue dark:bg-sky-500')}</div>
        <div><div className="flex justify-between"><span>{t("coverage.geometricHorizon")}</span><span className="mono">{fmt(cov.horizon_km, 0)} km</span></div>{bar(cov.horizon_km, 'bg-brand-red')}</div>
      </div>
      <p className="mt-4 text-sm"><strong>{t("coverage.effectiveRadio")}: {fmt(cov.coverage_radius_km, 0)} km</strong> · {t("coverage.area")} ≈ {fmt(cov.coverage_area_km2, 0)} km². {t("coverage.limitedByHorizon")} <strong>{cov.limited_by === 'radio' ? 'radio' : 'horizon'}</strong>.</p>
    </section>
  );
}
