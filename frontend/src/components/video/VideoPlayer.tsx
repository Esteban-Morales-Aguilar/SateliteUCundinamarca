import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

/** Reproductor HTML5 {t('videoPlayer.withThumbnail')}. El video se transmite con rangos HTTP desde media-service. */
export function VideoPlayer({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const start = () => { setStarted(true); void ref.current?.play(); };
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">
      <video ref={ref} src={src} poster={poster} controls={started} preload="metadata" playsInline className="aspect-video w-full" aria-label={title} onPlay={() => setStarted(true)}>
        Su navegador no puede reproducir este video. <a href={src}>{t('videoPlayer.downloadHere')}</a>.
      </video>
      {!started && (
        <button onClick={start} aria-label={`Reproducir: ${title}`} className="group absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-transparent">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white/95 text-brand-red shadow-xl transition group-hover:scale-105">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
