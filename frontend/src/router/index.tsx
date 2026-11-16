import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Carga diferida por ruta: el mapa y las gráficas solo se descargan al abrir el Dashboard.
const Home = lazy(() => import('../pages/Home'));
const MarcoTeorico = lazy(() => import('../pages/MarcoTeorico'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Guias = lazy(() => import('../pages/Guias'));
const Video = lazy(() => import('../pages/Video'));
const Creditos = lazy(() => import('../pages/Creditos'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));

export const routes = [
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/marco-teorico', element: <MarcoTeorico /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/guias', element: <Guias /> },
      { path: '/video', element: <Video /> },
      { path: '/creditos', element: <Creditos /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { element: <AuthLayout />, children: [{ path: '/login', element: <Login /> }] },
];

export const router = createBrowserRouter(routes);
