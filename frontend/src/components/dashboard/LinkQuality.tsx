import { useTelemetry } from '../../hooks/useTelemetry';

export function LinkQuality({ latest }) {
  const { t } = useTranslation();
  if (!latest) return null;
  return (
    <div>
      <p>{t('dashboard.linkQuality')}: {latest.rssi} dBm {t('dashboard.snr')} {latest.snr} dB</p>
      <p>{t('dashboard.rssiStatus')}:</p>
      <progress value={latest.rssi > -100 ? -50 : -100} max={0} min={-100} className="w-full">{t('dashboard.signalGood')}</progress>
    </div>
  );
}