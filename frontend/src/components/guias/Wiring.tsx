import { useTranslation } from "react-i18next";
/** Diagrama de bloques y tablas de conexión de la guía 4.2 (valores estándar de la Raspberry Pi y del RFM95W). */
const LORA = [['VIN', '3V3', '1'], ['GND', 'GND', '6'], ['SCK', 'GPIO11 (SCLK)', '23'], ['MISO', 'GPIO9 (MISO)', '21'], ['MOSI', 'GPIO10 (MOSI)', '19'], ['NSS / CS', 'GPIO8 (CE0)', '24'], ['RST', 'GPIO25', '22'], ['DIO0 (IRQ)', 'GPIO24', '18']];
const GPS = [['VCC', '3V3', '1'], ['GND', 'GND', '9'], ['TXD', 'GPIO15 (RXD)', '10'], ['RXD', 'GPIO14 (TXD)', '8']];
const I2C = [['VIN', '3V3', '17'], ['GND', 'GND', '14'], ['SDA', 'GPIO2 (SDA1)', '3'], ['SCL', 'GPIO3 (SCL1)', '5']];

const PinTable = ({ title, rows }: { title: string; rows: string[][] }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-space-700">
    <table className="w-full text-left text-sm">
      <caption className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-left font-semibold dark:border-space-700 dark:bg-space-800">{title}</caption>
      <thead className="bg-slate-100 dark:bg-space-700"><tr><th scope="col" className="px-3 py-2">Módulo</th><th scope="col" className="px-3 py-2">Raspberry Pi</th><th scope="col" className="px-3 py-2">Pin físico</th></tr></thead>
      <tbody className="divide-y divide-slate-200 dark:divide-space-700">{rows.map((r) => <tr key={r[0]}><th scope="row" className="mono px-3 py-2 font-semibold">{r[0]}</th><td className="mono px-3 py-2">{r[1]}</td><td className="mono px-3 py-2">{r[2]}</td></tr>)}</tbody>
    </table>
  </div>
);

export function Wiring() {
  const { t } = useTranslation();
  const box = (x: number, y: number, w: number, h: number, t: string, sub?: string, red = false) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={red ? '#B71C1C' : '#0f3b6b'} stroke="#cfe0ff" strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -2 : 5)} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">{t}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fill="#cfe0ff" fontSize="11" fontFamily="IBM Plex Mono, monospace">{sub}</text>}
    </g>
  );
  const line = (d: string, label: string, lx: number, ly: number) => (
    <g><path d={d} stroke="#7cc4ff" strokeWidth="2" fill="none" /><text x={lx} y={ly} fill="#bfe3ff" fontSize="11" fontFamily="IBM Plex Mono, monospace">{label}</text></g>
  );
  return (
    <div className="my-6 space-y-6">
      <figure className="overflow-hidden rounded-xl bg-space-900 p-4">
        <svg viewBox="0 0 640 300" role="img" aria-label="Diagrama de bloques: la Raspberry Pi se conecta por SPI al módulo LoRa, por UART al GPS, por I2C al sensor BME280 y recibe energía de la batería" className="mx-auto w-full max-w-3xl">
          {box(240, 100, 160, 100, 'Raspberry Pi', 'Zero 2 W / 4', true)}
          {box(30, 30, 150, 60, 'Módulo LoRa', 'RFM95W · SPI0')}
          {box(30, 210, 150, 60, 'GPS', 'UART')}
          {box(460, 30, 150, 60, 'BME280', 'I2C')}
          {box(460, 210, 150, 60, 'Batería', 'litio + regulador')}
          {line('M180 60 L240 130', 'SPI', 188, 90)}
          {line('M180 240 L240 175', 'UART', 190, 225)}
          {line('M460 60 L400 130', 'I2C', 425, 90)}
          {line('M460 240 L400 175', '3V3 / 5V', 410, 225)}
          <g stroke="#e8eefc" strokeWidth="2" fill="none"><path d="M60 30 V8 M60 8 l-8 10 M60 8 l8 10" /></g>
          <text x="76" y="16" fill="#c9d6ee" fontSize="11" fontFamily="Inter, sans-serif">antena 915 MHz</text>
        </svg>
        <figcaption className="mt-2 text-center text-xs text-slate-400">Diagrama de bloques del nodo. Todos los módulos comparten tierra (GND).</figcaption>
      </figure>
      <div className="grid gap-4 lg:grid-cols-3">
        <PinTable title="Módulo LoRa RFM95W (SPI0)" rows={LORA} />
        <PinTable title="GPS (UART)" rows={GPS} />
        <PinTable title="BME280 (I2C)" rows={I2C} />
      </div>
      <div role="note" className="rounded-xl border-l-4 border-brand-red bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-semibold">Notas de seguridad</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Trabaje siempre con la alimentación desconectada.</li>
          <li>El RFM95W funciona a <strong>3,3 V</strong>: aplicarle 5 V lo destruye.</li>
          <li>Nunca transmita sin antena conectada: puede dañar la etapa de salida.</li>
          <li>Las baterías de litio no se perforan, cortocircuitan ni cargan sin supervisión.</li>
        </ul>
      </div>
    </div>
  );
}
