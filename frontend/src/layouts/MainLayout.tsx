import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Loader } from '../components/common/Loader';

export default function MainLayout() {
  const { t } = useTranslation();
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-blue">{t('nav.skip')}</a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="min-h-[70vh] pt-16 focus:outline-none">
        <Suspense fallback={<Loader full />}><Outlet /></Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
