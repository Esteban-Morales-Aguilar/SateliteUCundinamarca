import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { apiError } from '../services/api';

const schema = z.object({
  email: z.string().min(1, 'Ingrese su correo').email('Correo no válido'),
  password: z.string().min(1, 'Ingrese su contraseña').max(72, 'Máximo 72 caracteres'),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (v) => {
    setError('');
    try { await login(v.email, v.password); nav(from, { replace: true }); }
    catch (e) { setError(apiError(e, t('login.loginFailed'))); }
  });

  const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-space-600 dark:bg-space-900';
  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="card space-y-5 !p-7" aria-labelledby="lg-title">
      <Seo title="Ingresar" />
      <div><h1 id="lg-title" className="text-2xl font-bold text-brand-blue dark:text-white">Ingresar</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">El acceso es opcional: solo lo necesita el personal que administra el contenido.</p></div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
        <input id="email" type="email" autoComplete="username" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-e' : undefined} {...register('email')} />
        {errors.email && <p id="email-e" role="alert" className="mt-1 text-sm text-brand-red">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" className={field} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'pw-e' : undefined} {...register('password')} />
        {errors.password && <p id="pw-e" role="alert" className="mt-1 text-sm text-brand-red">{errors.password.message}</p>}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-brand-red dark:bg-red-950/40">{error}</p>}
      <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  );
}
