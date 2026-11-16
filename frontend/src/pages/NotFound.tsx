import { Link } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Seo title={t('notfound.title')} />
      <p className="mono text-6xl font-extrabold text-brand-red">404</p>
      <h1 className="mt-4 text-3xl font-bold text-brand-blue dark:text-white">{t('notfound.title')}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{t('notfound.message')}</p>
      <div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn-primary">{t('notfound.back')}</Link><Link to="/marco-teorico" className="btn-ghost">{t('nav.theory')}</Link></div>
    </div>
  );
}
