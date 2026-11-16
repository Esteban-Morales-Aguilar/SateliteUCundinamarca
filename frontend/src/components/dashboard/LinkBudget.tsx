import type { LinkResult } from '../../types';
import type { SimState } from '../../hooks/useSimulation';
import { fmt } from '../../utils/format';
import { useTranslation } from 'react-i18next';

const row = 'flex items-baseline justify-between gap-4 border-b border-slate-200 py-2 last:border-0 dark:border-space-700';

/** Balance de enlace paso a paso (ecuación de Friis): P_rx = P_tx + G_tx + G_rx − FSPL − L. */
export function LinkBudget({ link, s, distanceKm }: { link: LinkResult; s: SimState; distanceKm: number }) {
  const losses = s.p_tx_dbm + s.g_tx_dbi + s.g_rx_dbi - link.fspl_db - link.p_rx_dbm;
  const margin = link.link_margin_db;
  const tone = !link.viable ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : margin < 6 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  const verdict = !link.viable ? 'Enlace no viable' : margin < 6 ? 'Viable, con poco margen' : 'Enlace viable';

  const { t } = useTranslation();
  return (
    <section className="card" aria-labelledby="lb-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="lb-title" className="text-lg font-bold">{t('dashboard.balanceOfLink')}</h3>
        <span role="status" className={`rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>{verdict}</span>
      </div>

      <p className="mono mt-4 rounded-lg bg-slate-100 p-3 text-xs leading-relaxed dark:bg-space-900 sm:text-sm">
        P<sub>rx</sub> = P<sub>tx</sub> + G<sub>tx</sub> + G<sub>rx</sub> − FSPL − L<br />
        = {s.p_tx_dbm} + {s.g_tx_dbi} + {s.g_rx_dbi} − {fmt(link.fspl_db, 1)} − {fmt(losses, 1)} = <strong>{fmt(link.p_rx_dbm, 1)} dBm</strong>
      </p>

      <dl className="mt-3 text-sm">
        <div className={row}><dt>{t('dashboard.distance')}</dt><dd className="mono">{fmt(distanceKm, 1)} km</dd></div>
        <div className={row}><dt>{t('dashboard.freeSpaceLoss')}</dt><dd className="mono">{fmt(link.fspl_db, 1)} dB</dd></div>
        <div className={row}><dt>{t('dashboard.otherLosses')}</dt><dd className="mono">{fmt(losses, 1)} dB</dd></div>
        <div className={row}><dt>{t('dashboard.receivedPower')}</dt><dd className="mono">{fmt(link.p_rx_dbm, 1)} dBm</dd></div>
        <div className={row}><dt className="font-semibold">{t('dashboard.sensitivity')} SF{s.sf}, {s.bw_khz} kHz</dt><dd className="mono">{fmt(link.sensitivity_dbm, 1)} dBm</dd></div>
        <div className={row}><dt className="font-semibold">{t('dashboard.linkMargin')}</dt><dd className="mono font-semibold">{fmt(margin, 1)} dB</dd></div>
        <div className={row}><dt>{t('dashboard.estimatedPdr')}</dt><dd className="mono">{fmt(link.pdr_estimated * 100, 0)} %</dd></div>
        <div className={row}><dt>{t('dashboard.estimatedMaxRange')}</dt><dd className="mono">{fmt(link.max_range_km, 0)} km</dd></div>
        <div className={row}><dt>{t('dashboard.dataRate')}</dt><dd className="mono">{fmt(link.bitrate_bps, 0)} bps</dd></div>
      </dl>

      <p className="mt-4 rounded-lg border-l-4 border-brand-blue bg-sky-50 p-3 text-sm text-slate-700 dark:border-sky-500 dark:bg-space-900 dark:text-slate-300">
        {link.message}{' '}
        {link.viable && margin < 6 && t('dashboard.fragileMargin')}
        {!link.viable && s.sf < 12 && t('dashboard.tryHigherSf')}
      </p>
    </section>
  );
}