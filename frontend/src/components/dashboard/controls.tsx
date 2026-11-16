import { useTranslation } from 'react-i18next';

export function Slider({ label, value, unit, min, max, onChange, hint }: { label: string; value: number; unit: string; min: number; max: number; onChange: (v: number) => void; hint?: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-600 dark:text-slate-400">{t(label)}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="w-full accent-brand-blue dark accent-brand-blue"
      />
      <p className="text-caption text-slate-500 dark:text-slate-400">{hint ? t(hint) : hint}</p>
    </div>
  );
}

export function Segmented({ label, value, options, onChange, format }: { label: string; value: string; options: string[]; onChange: (v: string) => void; format?: (v: string) => string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-600 dark:text-slate-400">{t(label)}</label>
      <div className="grid grid-cols-2 grid-cols-sm-2 gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded text-sm ${value === opt ? 'bg-brand-blue text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            {t(opt)}
          </button>
        ))}
      </div>
      {format && <p className="text-caption text-slate-500 dark:text-slate-400">{t(format(value))}</p>}
    </div>
  );
}