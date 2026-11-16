import { fmt } from '../../utils/format';

export function Kpi({ label, value, unit, digits = 1 }: { label: string; value: number | null | undefined; unit: string; digits?: number }) {
  return (
    <div className="card !p-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mono mt-1 text-3xl font-semibold text-brand-blue dark:text-white" aria-live="off">{fmt(value, digits)}<span className="ml-1.5 text-base font-normal text-slate-500">{unit}</span></p>
    </div>
  );
}
