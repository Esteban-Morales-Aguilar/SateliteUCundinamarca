import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Muestra el logo si existe en /assets; si no, cae a texto (no rompe la maqueta). */
function InstitutionLogo({ file, alt }: { file: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <span className="font-semibold">{alt}</span>;
  return <img src={`/assets/${file}`} alt={alt} className="h-10 w-auto" onError={() => setOk(false)} />;
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white dark:border-space-700 dark:bg-space-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-6 text-brand-blue dark:text-slate-200">
            <InstitutionLogo file="logo-udec.png" alt="Universidad de Cundinamarca" />
            <InstitutionLogo file="logo-especializacion.png" alt="Especialización en Infraestructura y Seguridad de Redes" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('footer.program')} · {t('footer.rights')}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Grupo CTI: CAI2272024210 / CTI-IIPA2026-G8</p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm md:items-end">
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es" target="_blank" rel="noopener noreferrer license"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-space-600 dark:text-slate-200 dark:hover:bg-space-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M9.2 9.5a3.2 3.2 0 1 0 0 5M16.2 9.5a3.2 3.2 0 1 0 0 5" /></svg>
            CC BY-NC-SA 4.0
          </a>
          <p className="max-w-xs text-slate-500 md:text-right dark:text-slate-400">{t('footer.license')}</p>
        </div>
      </div>
    </footer>
  );
}
