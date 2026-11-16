/** Parser de la cabecera HTTP Range (solo un rango, formato bytes=a-b | a- | -n). */
export interface ByteRange { start: number; end: number }

export function parseRange(header: string | undefined, size: number): ByteRange | null | 'invalid' {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return 'invalid';
  let start: number; let end: number;
  if (m[1] === '') {            // sufijo: últimos N bytes
    const n = parseInt(m[2], 10);
    if (n === 0) return 'invalid';
    start = Math.max(size - n, 0); end = size - 1;
  } else {
    start = parseInt(m[1], 10);
    end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
  }
  if (start >= size || start > end) return 'invalid';
  return { start, end };
}
