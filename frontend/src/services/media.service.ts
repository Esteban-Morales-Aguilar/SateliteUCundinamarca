import { api } from './api';

export const VIDEO_ID = 'estratosat-telco-despliegue.mp4';
export const POSTER_ID = 'estratosat-telco-miniatura.webp';
export const REFS_PDF_ID = 'referencias-apa7.pdf';

export type MediaKind = 'video' | 'image' | 'pdf';
/** Nombre de la ruta en media-service (video | images | pdfs). */
const route = { video: 'video', image: 'images', pdf: 'pdfs' } as const;

export const mediaUrl = (kind: MediaKind, id: string) => `/api/v1/media/${route[kind]}/${encodeURIComponent(id)}`;

export const mediaService = {
  exists: (kind: MediaKind, id: string) =>
    api.get<{ exists: boolean }>(`/media/exists/${route[kind]}/${encodeURIComponent(id)}`).then((r) => r.data.exists).catch(() => false),

  /** Sube un archivo (admin). `kind` e `id` deben ir ANTES del archivo en el multipart. */
  upload: (kind: MediaKind, id: string, file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData();
    fd.append('kind', route[kind]);
    fd.append('id', id);
    fd.append('file', file);
    return api.post('/media/upload', fd, {
      timeout: 0, // los videos pueden tardar
      onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); },
    });
  },

  remove: (id: string) => api.delete(`/media/${encodeURIComponent(id)}`),
};
