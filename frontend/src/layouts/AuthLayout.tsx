import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Loader } from '../components/common/Loader';
import { ThemeToggle } from '../components/common/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-blue/5 to-transparent px-4 dark:from-space-800">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-blue dark:text-white">
          <img src="/favicon.svg" alt="" width="32" height="32" /> SpaceNet Lab
        </Link>
        <Suspense fallback={<Loader />}><Outlet /></Suspense>
        <p className="mt-6 text-center text-sm"><Link to="/" className="text-brand-blue underline dark:text-sky-400">← Volver al ODC</Link></p>
      </div>
    </div>
  );
}
