import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { LanguageToggle, ThemeToggle } from './ThemeToggle';

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/marco-teorico', key: 'nav.theory' },
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/guias', key: 'nav.guides' },
  { to: '/video', key: 'nav.video' },
  { to: '/creditos', key: 'nav.credits' },
] as const;

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  const cls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-blue text-white dark:bg-sky-600' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-space-700'}`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-space-700 dark:bg-space-900/90">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-brand-blue dark:text-white">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>SpaceNet&nbsp;Lab</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}><NavLink to={l.to} end={'end' in l} className={cls}>{t(l.key)}</NavLink></li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          {isAuthenticated ? (
            <button className="btn-ghost hidden !py-1.5 text-sm sm:inline-flex" onClick={() => void logout()} title={user?.email}>{t('nav.logout')}</button>
          ) : (
            <Link to="/login" className="btn-ghost hidden !py-1.5 text-sm sm:inline-flex">{t('nav.login')}</Link>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-space-700"
            aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t('nav.close') : t('nav.menu')}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden dark:border-space-700 dark:bg-space-900">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (<li key={l.to}><NavLink to={l.to} end={'end' in l} className={cls}>{t(l.key)}</NavLink></li>))}
            <li>
              {isAuthenticated
                ? <button className={`${cls({ isActive: false })} w-full text-left`} onClick={() => void logout()}>{t('nav.logout')}</button>
                : <NavLink to="/login" className={cls}>{t('nav.login')}</NavLink>}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
