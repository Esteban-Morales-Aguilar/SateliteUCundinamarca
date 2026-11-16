import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AtmosphereDiagram } from './AtmosphereDiagram';
import { mediaUrl } from '../../services/media.service';

const Table = ({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) => (
  <div className="not-prose my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-space-700">
    <table className="w-full min-w-[34rem] text-left text-sm">
      <caption className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold dark:border-space-700 dark:bg-space-800">{caption}</caption>
      <thead className="bg-slate-100 dark:bg-space-700"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-200 dark:divide-space-700">
        {rows.map((r) => (
          <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th key={i} scope="row" className="px-4 py-2.5 font-semibold">{c}</th> : <td key={i} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{c}</td>))}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Material visual complementario a cada subsección del marco teórico. */
export function SectionExtras({ slug }: { slug: string }) {
  const { t } = useTranslation();
  switch (slug) {
    case 'satelites-educativos':
      return (
        <>
          <figure className="not-prose my-8 overflow-hidden rounded-xl">
            <img src={mediaUrl('image', 'globosatelite.webp')} alt={t("sectionExtras.globoAlt")} className="w-full rounded-xl object-cover" />
            <figcaption className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{t("sectionExtras.globoCaption")}</figcaption>
          </figure>
          <figure className="not-prose my-8 grid gap-6 overflow-hidden rounded-xl bg-space-900 p-6 text-slate-200 md:grid-cols-[minmax(0,18rem)_1fr] md:items-center">
            <AtmosphereDiagram className="mx-auto w-full max-w-xs" label={t("sectionExtras.atmosphereLabel")} />
            <figcaption className="space-y-3 text-sm">
              <p className="text-base font-semibold text-white">{t("sectionExtras.whereOperates")}</p>
              <p>{t("sectionExtras.habDescription")}</p>
              <p>{t("sectionExtras.cubesatDescription")}</p>
            </figcaption>
          </figure>
          <Table caption={t("sectionExtras.satellites")} head={[t('sectionExtras.platform'), t('sectionExtras.what'), t('sectionExtras.where')]}
            rows={[['CubeSat', t('sectionExtras.cubesatDesc'), t('sectionExtras.cubesatWhere')],
              ['CanSat', t('sectionExtras.cansatDesc'), t('sectionExtras.cansatWhere')],
              ['HAB', t('sectionExtras.habDesc'), t('sectionExtras.habWhere')]]} />
        </>
      );
    case 'lora-lorawan':
      return (
        <Table caption={t("sectionExtras.lora")} head={[t('sectionExtras.characteristic'), t('sectionExtras.lorawan'), 'WiFi', 'LTE']}
          rows={[['Alcance', t('sectionExtras.rangeLora'), t('sectionExtras.rangeWifi'), t('sectionExtras.rangeLte')],
            ['Tasa de datos', t('sectionExtras.dataRateLora'), t('sectionExtras.dataRateWifi'), t('sectionExtras.dataRateLte')],
            ['Consumo', t('sectionExtras.consumptionLora'), t('sectionExtras.consumptionWifi'), t('sectionExtras.consumptionLte')],
            ['Espectro', t('sectionExtras.spectrumLora'), t('sectionExtras.spectrumWifi'), t('sectionExtras.spectrumLte')],
            ['Uso ideal', t('sectionExtras.idealUseLora'), t('sectionExtras.idealUseWifi'), t('sectionExtras.idealUseLte')]]} />
      );
    case 'doppler-redundancia':
      return (
        <div className="not-prose my-8 rounded-xl border border-sky-300 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/30">
          <p className="font-semibold text-brand-blue dark:text-sky-300">{t("sectionExtras.tryItYourself")}</p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">{t("sectionExtras.simulatorDescription")}</p>
          <Link to="/dashboard?tab=simulador" className="btn-primary mt-4">{t("sectionExtras.openSimulator")}</Link>
        </div>
      );
    case 'seguridad-lorawan':
      return (
        <figure className="not-prose my-8 rounded-xl border border-slate-200 p-5 dark:border-space-700">
          <figcaption className="mb-3 font-semibold">{t("sectionExtras.attacksConcentrated")}</figcaption>
          <div className="flex h-9 overflow-hidden rounded-lg text-sm font-semibold text-white" role="img" aria-label="62 por ciento de los ataques en la capa MAC y 38 por ciento en otras capas">
            <div className="grid place-items-center bg-brand-red" style={{ width: '62%' }}>{t("sectionExtras.macLayer")} · 62 %</div>
            <div className="grid place-items-center bg-brand-blue dark:bg-sky-700" style={{ width: '38%' }}>{t("sectionExtras.phyLayer")} · 38 %</div>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{t("sectionExtras.source")}</p>
        </figure>
      );
    default:
      return null;
  }
}
