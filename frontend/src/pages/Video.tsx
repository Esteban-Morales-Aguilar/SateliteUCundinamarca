import { useQuery } from '@tanstack/react-query';
import { Seo } from '../components/common/Seo';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoUpload } from '../components/video/VideoUpload';
import { useAuth } from '../hooks/useAuth';
import { mediaService, mediaUrl, POSTER_ID, VIDEO_ID } from '../services/media.service';
import { useTranslation } from 'react-i18next';

const TITLE_KEY = 'video.title';

export default function Video() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const video = useQuery({ queryKey: ['media-exists', 'video', VIDEO_ID], queryFn: () => mediaService.exists('video', VIDEO_ID) });
  const poster = useQuery({ queryKey: ['media-exists', 'image', POSTER_ID], queryFn: () => mediaService.exists('image', POSTER_ID) });
  const phases = t('video.sections', { returnObjects: true }) as { t: string; d: string }[];
  const title = t('video.title');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Seo title={t('video.title')} description={t('video.lead')} />
      <h1 className="section-title">{title}</h1>
      <p className="lead mt-3">{t('video.lead')}</p>

      <div className="mt-8">
        {video.data ? (
          <VideoPlayer src={mediaUrl('video', VIDEO_ID)} poster={poster.data ? mediaUrl('image', POSTER_ID) : undefined} title={title} />
        ) : (
          <div className="grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-space-600 dark:bg-space-800">
            <p className="max-w-sm text-slate-600 dark:text-slate-400">{video.isLoading ? t('common.loading') : t('video.notLoaded')}{isAdmin && !video.isLoading && ' ' + t('video.uploadHint')}</p>
          </div>
        )}
      </div>

      <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {phases.map((p) => (
          <div key={p.t} className="border-t border-slate-300 pt-3 dark:border-space-600"><dt className="font-semibold text-brand-blue dark:text-sky-300">{p.t}</dt><dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.d}</dd></div>
        ))}
      </dl>

      {isAdmin && <VideoUpload />}
    </div>
  );
}
