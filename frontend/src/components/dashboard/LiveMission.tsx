import { useTelemetry } from '../../hooks/useTelemetry';
import { useQuery } from '@tanstack/react-query';
import { telemetryService } from '../../services/telemetry.service';
import { LiveMap } from './LiveMap';
import { Kpi } from './Kpi';
import { TelemetryChart } from './TelemetryChart';
import { LinkQuality } from './LinkQuality';
import { useTranslation } from 'react-i18next';

export function LiveMission() {
  const { latest, history, connected } = useTelemetry();
  const { data: mission } = useQuery({ queryKey: ['mission'], queryFn: telemetryService.mission, retry: false });
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue dark:text-white">{mission?.name ?? t('dashboard.missionName')} </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{mission?.description ?? t('dashboard.missionDescription')}</p>
        </div>
        <p role="status" className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${connected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
          <span className={`h-2 w-2 rounded-full ${connected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} aria-hidden />
          {connected ? t('dashboard.live') : t('dashboard.reconnecting')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t('dashboard.altitude')} value={latest?.altitude} unit="m" digits={0} />
        <Kpi label={t('dashboard.temperature')} value={latest?.temperature} unit="°C" />
        <Kpi label={t('dashboard.pressure')} value={latest?.pressure} unit="hPa" />
        <Kpi label={t('dashboard.humidity')} value={latest?.humidity} unit="%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <LiveMap latest={latest} history={history} />
        <LinkQuality latest={latest} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TelemetryChart points={history} field="altitude" title={t('dashboard.altitude')} unit="m" color="blue" />
        <TelemetryChart points={history} field="temperature" title={t('dashboard.temperature')} unit="°C" color="red" />
        <TelemetryChart points={history} field="pressure" title={t('dashboard.pressure')} unit="hPa" color="green" />
        <TelemetryChart points={history} field="humidity" title={t('dashboard.humidity')} unit="%" color="amber" />
        <TelemetryChart points={history} field="rssi" title={t('dashboard.rssi')} unit="dBm" color="blue" />
        <TelemetryChart points={history} field="snr" title={t('dashboard.snr')} unit="dB" color="green" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.simulated')}</p>
    </div>
  );
}
