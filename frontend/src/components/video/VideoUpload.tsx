import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { apiError } from '../../services/api';
import { mediaService, POSTER_ID, VIDEO_ID, type MediaKind } from '../../services/media.service';
import { ALLOWED_IMAGE, ALLOWED_VIDEO, fmtBytes } from '../../utils/format';

function Uploader({ label, kind, id, accept, allowed, max }: { label: string; kind: MediaKind; id: string; accept: string; allowed: string[]; max: number }) {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [pct, setPct] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!allowed.includes(file.type)) return setMsg({ ok: false, text: `Formato no permitido (${file.type || 'desconocido'}).` });
    if (file.size > max) return setMsg({ ok: false, text: `Máximo ${fmtBytes(max)}; este archivo pesa ${fmtBytes(file.size)}.` });
    setMsg(null); setPct(0);
    try {
      await mediaService.upload(kind, id, file, setPct);
      setMsg({ ok: true, text: 'Archivo cargado correctamente.' });
      void qc.invalidateQueries({ queryKey: ['media-exists'] });
    } catch (e) { setMsg({ ok: false, text: apiError(e, 'No se pudo subir el archivo') }); }
    finally { setPct(null); }
  };
  return (
    <div>
      <label className="field-label" htmlFor={`up-${id}`}><span>{label}</span></label>
      <input id={`up-${id}`} type="file" accept={accept} disabled={pct !== null} onChange={(e) => void onFile(e.target.files?.[0])}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#00264d]" />
      {pct !== null && <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-space-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-brand-red transition-all" style={{ width: `${pct}%` }} /></div>}
      {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-red'}`}>{msg.text}</p>}
    </div>
  );
}

/** Panel solo para administradores. */
export function VideoUpload() {
  const { t } = useTranslation();
  return (
    <section className="card mt-10 space-y-5" aria-labelledby="up-title">
      <h2 id="up-title" className="text-lg font-bold">Administrar video (solo admin)</h2>
      <Uploader label="Video del despliegue (MP4 o WebM, máx. 500 MB)" kind="video" id={VIDEO_ID} accept="video/mp4,video/webm" allowed={ALLOWED_VIDEO} max={500 * 1024 * 1024} />
      <Uploader label="Miniatura (JPG, PNG o WebP, máx. 10 MB)" kind="image" id={POSTER_ID} accept="image/jpeg,image/png,image/webp" allowed={ALLOWED_IMAGE} max={10 * 1024 * 1024} />
    </section>
  );
}
