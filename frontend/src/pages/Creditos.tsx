import { useQuery } from '@tanstack/react-query';
import { Seo } from '../components/common/Seo';
import { ErrorNotice, Loader } from '../components/common/Loader';
import { contentService } from '../services/content.service';
import { useTranslation } from 'react-i18next';
import { mediaService, mediaUrl, REFS_PDF_ID } from '../services/media.service';
import type { Referencia } from '../types';

const TOPICS: Record<string, string> = { satelites: 'Satelites educativos', lora: 'LoRa y LoRaWAN', doppler: 'Efecto Doppler y redundancia', seguridad: 'Seguridad en LoRaWAN' };
const PENDING = /\[Completar/;

export const groupByTopic = (refs: Referencia[]): [string, Referencia[]][] => {
  const m = new Map<string, Referencia[]>();
  for (const r of refs) { const k = TOPICS[r.topic] ?? 'Otras referencias'; m.set(k, [...(m.get(k) ?? []), r]); }
  return [...m.entries()];
};

export default function Creditos() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['creditos'], queryFn: contentService.creditos });
  const pdf = useQuery({ queryKey: ['pdf-exists', REFS_PDF_ID], queryFn: () => mediaService.exists('pdf', REFS_PDF_ID) });
  const groups = groupByTopic(data?.references ?? []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Seo title={t('credits.title')} description={t('credits.title')} />
      <h1 className="section-title">{t('credits.title')}</h1>

      {isLoading && <Loader />}
      {isError && <div className="mt-8"><ErrorNotice onRetry={() => void refetch()} /></div>}

      {data && (
        <>
          <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-500">{t('credits.authors')}</dt><dd className="mt-1 font-semibold">{data.authors.map((a) => a.name).join(' · ')}</dd></div>
            <div><dt className="text-sm text-slate-500">{t('credits.teacher')}</dt><dd className="mt-1 font-semibold">{data.teacher}</dd></div>
            <div><dt className="text-sm text-slate-500">{t('credits.program')}</dt><dd className="mt-1 font-semibold">{data.program}</dd></div>
            <div><dt className="text-sm text-slate-500">{t('credits.university')}</dt><dd className="mt-1 font-semibold">{data.university}</dd></div>
            <div><dt className="text-sm text-slate-500">{t('credits.ctiGroup')}</dt><dd className="mono mt-1 font-semibold">{data.researchGroup}</dd></div>
            <div><dt className="text-sm text-slate-500">{t('credits.year')}</dt><dd className="mt-1 font-semibold">{data.year}</dd></div>
          </dl>

          <section className="card mt-10" aria-labelledby="lic">
            <h2 id="lic" className="text-lg font-bold">{t('credits.license')}</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">{t('credits.licenseText')}</p>
          </section>

          <section id="referencias" className="mt-12 scroll-mt-24" aria-labelledby="refs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="refs" className="text-2xl font-bold text-brand-blue dark:text-white">Referencias (APA 7)</h2>
              {pdf.data
                ? <a className="btn-primary no-print" href={mediaUrl('pdf', REFS_PDF_ID)} download>{t('common.download')} referencias (PDF)</a>
                : <button className="btn-ghost no-print" onClick={() => window.print()}>{t('common.download')} referencias como PDF</button>}
            </div>
            {groups.map(([topic, refs]) => (
              <div key={topic} className="mt-6">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">{topic}</h3>
                <ul className="mt-2 space-y-3">
                  {refs.map((r) => (
                    <li key={r._id} className="border-l-2 border-slate-300 pl-4 text-sm leading-relaxed dark:border-space-600" style={{ textIndent: '-1.5rem', paddingLeft: '2.25rem' }}>
                      {PENDING.test(r.apa) ? <span>{r.apa.replace(/\s*\[Completar[^\]]*\]/, '')} <em className="text-slate-500">(referencia completa pendiente de publicar)</em></span> : r.apa}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
