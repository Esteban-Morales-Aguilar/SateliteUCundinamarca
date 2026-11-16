import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { contentService } from '../services/content.service';
import { Seo } from '../components/common/Seo';
import { useTranslation } from 'react-i18next';
import { ErrorNotice, Loader } from '../components/common/Loader';
import { RichContent } from '../components/common/RichContent';
import { SectionExtras } from '../components/marco-teorico/SectionExtras';
import { ReferenceChips } from '../components/marco-teorico/ReferenceChips';

export default function MarcoTeorico() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['marco'], queryFn: contentService.marcoTeorico });
  const [params, setParams] = useSearchParams();
  const sections = [...(data ?? [])].sort((a, b) => a.order - b.order);
  const current = sections.find((s) => s.slug === params.get('s')) ?? sections[0];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const n = sections.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1) + n) % n;
    setParams({ s: sections[next].slug }, { replace: true });
    document.getElementById(`tab-${sections[next].slug}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Seo title={t('nav.theory')} description={t('nav.theory')} />
      <h1 className="section-title">{t('nav.theory')}</h1>
      <p className="lead mt-3">{t('nav.theory')}</p>

      {isLoading && <Loader />}
      {isError && <div className="mt-8"><ErrorNotice onRetry={() => void refetch()} /></div>}

      {current && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div role="tablist" aria-label={t("theory.subsections")} aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:flex-col lg:self-start lg:sticky lg:top-24">
            {sections.map((s, i) => {
              const on = s.slug === current.slug;
              return (
                <button key={s.slug} id={`tab-${s.slug}`} role="tab" aria-selected={on} aria-controls={`panel-${s.slug}`} tabIndex={on ? 0 : -1}
                  onClick={() => setParams({ s: s.slug }, { replace: true })} onKeyDown={(e) => onKey(e, i)}
                  className={`tab shrink-0 text-left lg:w-full lg:py-3 ${on ? 'tab-on' : 'tab-off'}`}>
                  {s.title}
                </button>
              );
            })}
          </div>

          <article id={`panel-${current.slug}`} role="tabpanel" aria-labelledby={`tab-${current.slug}`} tabIndex={0} className="min-w-0">
            <h2 className="mb-4 text-2xl font-bold text-brand-blue dark:text-white">{current.title}</h2>
            <RichContent html={current.content} />
            <SectionExtras slug={current.slug} />
            <ReferenceChips refs={current.references} />
          </article>
        </div>
      )}
    </div>
  );
}
