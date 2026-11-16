import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const { t } = useTranslation();
  const label = dark ? t('theme.toLight') : t('theme.toDark');
  return (
    <button onClick={toggle} aria-label={label} title={label} className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-space-700">
      {dark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  return (
    <button
      onClick={() => void i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
      aria-label={t('lang.switch')} title={t('lang.switch')}
      className="grid h-10 min-w-10 place-items-center rounded-lg px-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-space-700"
    >
      {t('lang.short')}
    </button>
  );
}
