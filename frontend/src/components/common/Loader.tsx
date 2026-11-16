import { useTranslation } from 'react-i18next';

export function Loader({ label, full = false }: { label?: string; full?: boolean }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 ${full ? 'min-h-[50vh]' : 'py-10'}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-blue dark:border-space-600 dark:border-t-sky-400" aria-hidden />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="card flex flex-col items-start gap-3 border-brand-red/40 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
      <p className="font-medium text-brand-red dark:text-red-300">{message ?? t('common.error')}</p>
      {onRetry && <button className="btn-ghost" onClick={onRetry}>{t('common.retry')}</button>}
    </div>
  );
}
