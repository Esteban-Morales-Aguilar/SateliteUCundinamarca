import { usePiTelemetry } from '../../hooks/usePiTelemetry';
import { useQuery } from '@tanstack/react-query';
import { telemetryService } from '../../services/telemetry.service';
import { LiveMap } from './LiveMap';
import { Kpi } from './Kpi';
import { TelemetryChart } from './TelemetryChart';
import { LinkQuality } from './LinkQuality';
import { useTranslation } from 'react-i18next';

export function LiveMissionPi() {
  const { latest, connected, isLoading } = usePiTelemetry();
  const { data: mission } = useQuery({ queryKey: ['mission'], queryFn: telemetryService.mission, retry: false });
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-blue dark:text-white">{mission?.name ?? t('dashboard.missionName')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!connected || !latest) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue dark:text-white">{mission?.name ?? t('dashboard.missionName')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{mission?.description ?? t('dashboard.missionDescription')}</p>
          </div>
          <p role="status" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
            {t('dashboard.notConnected')}
          </p>
        </div>
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t('dashboard.waitingForPi')}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.piNotTransmitting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue dark:text-white">{mission?.name ?? t('dashboard.missionName')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{mission?.description ?? t('dashboard.missionDescription')}</p>
        </div>
        <p role="status" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full animate-pulse bg-emerald-500" aria-hidden />
          {t('dashboard.live')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t('dashboard.cpuTemp')} value={latest?.temperature} unit="°C" />
        <Kpi label={t('dashboard.rssi')} value={latest?.rssi} unit="dBm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <LiveMap latest={latest} history={[]} />
        <LinkQuality latest={latest} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TelemetryChart points={[]} field="temperature" title={t('dashboard.temperature')} unit="°C" color="red" />
        <TelemetryChart points={[]} field="rssi" title={t('dashboard.rssi')} unit="dBm" color="blue" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.piData')}</p>
    </div>
  );
}