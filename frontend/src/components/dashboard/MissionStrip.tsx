import { useTranslation } from 'react-i18next';

export function MissionStrip() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <span className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-space-900">{t('dashboard.mission')}</span>
      <span className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-space-900">{t('dashboard.simulated')}</span>
      <span className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-space-900">{t('dashboard.live')}</span>
      <span className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-space-900">{t('dashboard.simulator')}</span>
    </div>
  );
}