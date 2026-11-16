/** Utilidades de formato (puras, con tests). */
export const fmt = (v: number | null | undefined, digits = 1): string =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toLocaleString('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  const u = ['KB', 'MB', 'GB'];
  let i = -1; let v = n;
  do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${u[i]}`;
};

export const fmtCOP = (n: number): string => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Estima el lenguaje de un bloque de código de las guías. */
export const guessLang = (code: string): 'python' | 'bash' => (/\bimport\s+\w+|\bdef\s+\w+\(|while True:/.test(code) ? 'python' : 'bash');

export const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
export const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
