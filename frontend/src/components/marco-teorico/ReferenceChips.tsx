import { Link } from 'react-router-dom';

export function ReferenceChips({ refs, keys }: { refs: string[]; keys?: Record<string, string> }) {
  if (!refs.length) return null;
  return (
    <aside aria-label="Referencias de esta sección" className="mt-10 border-t border-slate-200 pt-5 dark:border-space-700">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Referencias de esta sección (clic para ir a la cita completa):</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {refs.map((r) => {
          const key = keys?.[r];
          const href = key ? `/creditos#ref-${key}` : '/creditos#referencias';
          return (
            <li key={r}><Link to={href} className="inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-medium text-brand-blue hover:bg-brand-blue/20 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50">{r}</Link></li>
          );
        })}
      </ul>
    </aside>
  );
}
