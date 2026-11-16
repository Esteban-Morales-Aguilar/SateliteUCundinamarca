import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface State { error: Error | null }

/** Evita la pantalla en blanco: un fallo en un componente no tumba toda la aplicación. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('UI error', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto my-20 max-w-lg px-4 text-center">
        <h1 className="text-2xl font-bold text-brand-red">Algo salió mal</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Ocurrió un error inesperado al mostrar esta sección.</p>
        <button className="btn-primary mt-6" onClick={() => { this.setState({ error: null }); location.assign('/'); }}>Volver al inicio</button>
      </div>
    );
  }
}
