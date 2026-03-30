import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** Mensaje de fallback opcional. Por defecto muestra un panel corporativo. */
  fallback?: ReactNode;
  /** Nombre de la sección para identificar el error en logs. */
  section?: string;
}

interface State {
  hasError: boolean;
  message:  string;
}

/**
 * Captura errores de renderizado en hijos y muestra un panel de error
 * sin colapsar toda la aplicación.
 *
 * Uso:
 *   <ErrorBoundary section="Curva S">
 *     <CurvaS />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // En Etapa 2+ esto se enviará a Sentry o similar
    console.error(`[ErrorBoundary:${this.props.section ?? 'App'}]`, error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          background: '#fdecea',
          border: '1px solid #f5c6c2',
          borderLeft: '4px solid #c0392b',
          borderRadius: 10,
          padding: '20px 24px',
          margin: '16px 0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', marginBottom: 6 }}>
            ⚠️ Error al renderizar{this.props.section ? ` — ${this.props.section}` : ''}
          </div>
          <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 12 }}>
            {this.state.message || 'Ocurrió un error inesperado en esta sección.'}
          </div>
          <button
            onClick={this.handleReset}
            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#c0392b', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
