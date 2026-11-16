import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { contentService } from '../services/content.service';
import { Seo } from '../components/common/Seo';
import { useTranslation } from 'react-i18next';
import { ErrorNotice, Loader } from '../components/common/Loader';
import { CodeBlock } from '../components/guias/CodeBlock';
import { ComponentsTable } from '../components/guias/ComponentsTable';
import { Wiring } from '../components/guias/Wiring';
import { LaunchChecklist } from '../components/guias/LaunchChecklist';
import { PdfButton } from '../components/guias/PdfButton';

export default function Guias() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['guias'], queryFn: contentService.guias });
  const [params, setParams] = useSearchParams();
  const guias = [...(data ?? [])].sort((a, b) => a.order - b.order);
  const g = guias.find((x) => x.slug === params.get('g')) ?? guias[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Seo title={t('guides.title')} description={t('guides.lead')} />
      <h1 className="section-title">{t('guides.title')}</h1>
      <p className="lead mt-3">{t('guides.lead')}</p>

      {isLoading && <Loader />}
      {isError && <div className="mt-8"><ErrorNotice onRetry={() => void refetch()} /></div>}

      {g && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div role="tablist" aria-label={t("guides.title")} aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:flex-col lg:self-start lg:sticky lg:top-24">
            {guias.map((x) => (
              <button key={x.slug} role="tab" id={`gt-${x.slug}`} aria-selected={x.slug === g.slug} aria-controls={`gp-${x.slug}`} tabIndex={x.slug === g.slug ? 0 : -1}
                onClick={() => setParams({ g: x.slug }, { replace: true })} className={`tab shrink-0 text-left lg:w-full lg:py-3 ${x.slug === g.slug ? 'tab-on' : 'tab-off'}`}>{x.title}</button>
            ))}
          </div>

          <article id={`gp-${g.slug}`} role="tabpanel" aria-labelledby={`gt-${g.slug}`} tabIndex={0} className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl"><h2 className="text-2xl font-bold text-brand-blue dark:text-white">{g.title}</h2><p className="mt-2 text-slate-600 dark:text-slate-400">{g.description}</p></div>
              <PdfButton file={g.pdfUrl} label={t("common.download")} />
            </div>

            {g.slug === 'seleccion-componentes' && g.components && <ComponentsTable rows={g.components} />}
            {g.slug === 'conexiones-electricas' && <Wiring />}

            {g.steps.length > 0 && (
              <ol className="mt-6 space-y-4">
                {g.steps.map((s) => (
                  <li key={s.step} className="card flex gap-4">
                    <span className="mono grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-blue text-sm font-bold text-white dark:bg-sky-600" aria-hidden>{s.step}</span>
                    <div><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-slate-700 dark:text-slate-300">{s.body}</p></div>
                  </li>
                ))}
              </ol>
            )}

            {g.code.map((c, i) => <CodeBlock key={i} code={c} />)}
            {g.slug === 'protocolo-lanzamiento' && <LaunchChecklist />}
          </article>
        </div>
      )}
    </div>
  );
}
