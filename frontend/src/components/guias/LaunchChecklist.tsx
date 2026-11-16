import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PHASES: { title: string; items: string[] }[] = [
  { title: 'Antes del lanzamiento', items: ['Baterías cargadas y probadas en frío', 'GPS con posición fija (fix)', 'Prueba de enlace LoRa con la estación terrena', 'Carga útil sellada, aislada y atada al paracaídas', 'Permisos y aviso a la autoridad aeronáutica', 'Pronóstico de viento y trayectoria estimada'] },
  { title: 'Inflado', items: ['Zona despejada y con poco viento', 'Calcule la flotación neutra y el ascenso deseado', 'Infle con helio sin superar la carga de ruptura del globo'] },
  { title: 'Secuencia de lanzamiento', items: ['Telemetría activa antes de soltar', 'Registre hora, ubicación y condiciones', 'Suelte el globo y confirme el ascenso'] },
  { title: 'Monitoreo', items: ['Siga altitud y posición en el dashboard', 'Vigile RSSI, SNR y PDR del enlace', 'Anticipe la zona de descenso con la última posición'] },
  { title: 'Recuperación y análisis', items: ['Equipo de recuperación con gateway móvil', 'Documente el estado de la carga útil', 'Descargue los datos y compárelos con el simulador'] },
];

/** {t('launchChecklist.supportChecklist')} */
export function LaunchChecklist() {
  const { t } = useTranslation();
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      {PHASES.map((p) => (
        <fieldset key={p.title} className="card">
          <legend className="px-1 font-bold text-brand-blue dark:text-sky-300">{p.title}</legend>
          <ul className="mt-2 space-y-2">
            {p.items.map((i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-blue" checked={!!done[i]} onChange={(e) => setDone((d) => ({ ...d, [i]: e.target.checked }))} />
                  <span className={done[i] ? 'text-slate-400 line-through' : ''}>{i}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
