import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { LiveMission } from '../components/dashboard/LiveMission';
import { NetworkSimulator } from '../components/dashboard/NetworkSimulator';
import { LiveMissionPi } from '../components/dashboard/LiveMissionPi';
import { useTranslation } from 'react-i18next';

const TABS = [
  { id: 'simulada', label: 'dashboard.tabSimulated' },
  { id: 'vivo', label: 'dashboard.tabLive' },
  { id: 'simulador', label: 'dashboard.tabSimulator' },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab'); const tab = (tabParam === 'vivo' ? 'vivo' : tabParam === 'simulada' ? 'simulada' : 'simulador') as 'simulada' | 'vivo' | 'simulador';
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Seo title={t('dashboard.title')} description={t('dashboard.seoDesc')} />
      <h1 className="section-title">{t('dashboard.title')}</h1>
      <p className="lead mt-3">{t('dashboard.lead')}</p>

      <div role="tablist" aria-label="Secciones del dashboard" className="mt-8 flex gap-2">
        {TABS.map((tabItem) => (
          <button key={tabItem.id} role="tab" id={`dt-${tabItem.id}`} aria-selected={tab === tabItem.id} aria-controls={`dp-${tabItem.id}`}
            className={`tab ${tab === tabItem.id ? 'tab-on' : 'tab-off'}`} onClick={() => setParams({ tab: tabItem.id }, { replace: true })}>{t(tabItem.label)}</button>
        ))}
      </div>

      <div role="tabpanel" id={`dp-${tab}`} aria-labelledby={`dt-${tab}`} className="mt-8">
        {tab === 'simulada' ? <LiveMission /> : tab === 'vivo' ? <LiveMissionPi /> : <NetworkSimulator />}
      </div>
    </div>
  );
}