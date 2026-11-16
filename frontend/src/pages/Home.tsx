import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/common/Seo';
import { Reveal } from '../components/common/Reveal';
import { AtmosphereDiagram } from '../components/marco-teorico/AtmosphereDiagram';
import { MissionStrip } from '../components/dashboard/MissionStrip';

interface Module { to: string; title: string; desc: string }
interface Principle { t: string; d: string }

export default function Home() {
  const { t } = useTranslation();
  const modules = t('home.modules', { returnObjects: true }) as Module[];
  const principles = t('home.principles', { returnObjects: true }) as Principle[];

  return (
    <>
      <Seo title="Inicio" description={t("home.title") + " - ODC de la Universidad de Cundinamarca"} />

      <section className="bg-gradient-to-br from-brand-blue via-[#052a52] to-space-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-sky-200">{t('home.kicker')}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              <span className="block text-sky-300">SpaceNet Lab</span>
              <span className="mt-2 block text-3xl font-bold sm:text-4xl">{t('home.title')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">{t('home.lead')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/marco-teorico" className="btn-primary !bg-white !text-brand-blue hover:!bg-sky-100">{t('home.cta')}</Link>
              <Link to="/dashboard?tab=vivo" className="btn-ghost !border-white/40 !text-white hover:!bg-white/10">{t('home.ctaDash')}</Link>
              <Link to="/dashboard?tab=simulada" className="btn-ghost !border-white/40 !text-white hover:!bg-white/10">{t('home.ctaSimulated')}</Link>
            </div>
            <div className="mt-10"><MissionStrip /></div>
          </div>
          <AtmosphereDiagram label={t('home.diagramLabel')} className="mx-auto w-full max-w-md" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <Reveal>
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg">
            <img src="/assets/imagen-presentacion.png" alt={t('home.diagramLabel')} className="w-full object-cover" />
          </div>
        </Reveal>
        <Reveal>
          <h2 className="section-title">{t('home.modulesTitle')}</h2>
          <p className="lead mt-3">{t('home.modulesLead')}</p>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.to}>
              <Reveal className="h-full">
                <Link to={m.to} className="card group block h-full border-l-4 border-l-brand-red transition hover:-translate-y-0.5 hover:shadow-md">
                  <h3 className="text-xl font-bold text-brand-blue group-hover:underline dark:text-white">{m.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{m.desc}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="section-title">{t('home.meditTitle')}</h2>
              <p className="lead mt-3">{t('home.meditLead')}</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{t('home.principlesTitle')}</h3>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {principles.map((p) => (
                  <div key={p.t} className="border-t border-slate-300 pt-3 dark:border-space-600">
                    <dt className="font-semibold text-brand-blue dark:text-sky-300">{p.t}</dt>
                    <dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
