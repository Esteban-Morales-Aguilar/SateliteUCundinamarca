import { fmtCOP } from '../../utils/format';
import { useTranslation } from 'react-i18next';
import type { Guia } from '../../types';

type Row = NonNullable<Guia['components']>[number];

export const totals = (rows: Row[]) => rows.reduce((a, r) => ({ economico: a.economico + r.economico, premium: a.premium + r.premium }), { economico: 0, premium: 0 });

/** Tabla comparativa de componentes (perfil económico vs premium) con totales calculados a partir de las filas. */
export function ComponentsTable({ rows }: { rows: Row[] }) {
  const { t } = useTranslation();
  const totalsResult = totals(rows);
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-space-700">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold dark:border-space-700 dark:bg-space-800">{t('componentsTable.budgetReference')}</caption>
        <thead className="bg-slate-100 dark:bg-space-700">
          <tr><th scope="col" className="px-4 py-2.5">{t('componentsTable.component')}</th><th scope="col" className="px-4 py-2.5 text-right">{t('componentsTable.economic')}</th><th scope="col" className="px-4 py-2.5 text-right">{t('componentsTable.premium')}</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-space-700">
          {rows.map((r) => (
            <tr key={r.item}>
              <th scope="row" className="px-4 py-2.5 font-medium"><span className="block text-xs font-normal text-slate-500">{r.category}</span>{r.item}</th>
              <td className="mono px-4 py-2.5 text-right">{fmtCOP(r.economico)}</td>
              <td className="mono px-4 py-2.5 text-right">{fmtCOP(r.premium)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-100 font-bold dark:bg-space-700">
          <tr><th scope="row" className="px-4 py-3">{t('componentsTable.total')}</th><td className="mono px-4 py-3 text-right">{fmtCOP(totalsResult.economico)}</td><td className="mono px-4 py-3 text-right">{fmtCOP(totalsResult.premium)}</td></tr>
        </tfoot>
      </table>
      <p className="border-t border-slate-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-space-700 dark:bg-amber-950/30 dark:text-amber-200">{t('componentsTable.priceNote')}</p>
    </div>
  );
}
