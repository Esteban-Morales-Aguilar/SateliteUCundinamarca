import { useMemo } from 'react';
import DOMPurify from 'dompurify';

/** El HTML ya llega sanitizado desde content-service; se vuelve a sanitizar aquí (defensa en profundidad). */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'iframe', 'form'], FORBID_ATTR: ['style'] });
}

export function RichContent({ html }: { html: string }) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-brand-blue dark:prose-a:text-sky-400" dangerouslySetInnerHTML={{ __html: clean }} />;
}
