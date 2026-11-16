import { useTranslation } from 'react-i18next';
import type { TelemetryPoint } from '../../types';

export function LinkQuality({ latest }: { latest: TelemetryPoint | null }) {
  const { t } = useTranslation();
  if (!latest) return null;
  const rssi = latest.rssi ?? -100;
  const pct = Math.max(0, Math.min(100, ((rssi + 100) / 50) * 100));
  return (
    <div>
      <p>{t('dashboard.linkQuality')}: {latest.rssi} dBm {t('dashboard.snr')} {latest.snr} dB</p>
      <p>{t('dashboard.rssiStatus')}:</p>
      <progress value={pct} max={100} className="w-full">{t('dashboard.signalGood')}</progress>
    </div>
  );
}
