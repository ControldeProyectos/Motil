import { useState } from 'react';
import type { TabId } from './types';
import { useAuth } from './contexts/AuthContext';
import { useProyectoActivo } from './hooks/useProyecto';
import { useSuministros } from './hooks/useSuministros';
import { useRestricciones } from './hooks/useRestricciones';
import { getAlertas } from './utils/alerts';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { ResumenEjecutivo } from './components/sections/ResumenEjecutivo';
import { AvanceObra } from './components/sections/AvanceObra';
import { CurvaS } from './components/sections/CurvaS';
import { Suministros } from './components/sections/Suministros';
import { Restricciones } from './components/sections/Restricciones';
import { Configuracion } from './components/sections/Configuracion';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';

const DEFAULT_DIAS_ALERTA = 15;

export default function App() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab]     = useState<TabId>('resumen');
  const [diasAlerta, setDiasAlerta]   = useState(DEFAULT_DIAS_ALERTA);

  const { proyectoId } = useProyectoActivo();
  const { data: suministros = [] } = useSuministros(proyectoId);
  const { data: restricciones = [] } = useRestricciones(proyectoId);
  const alerts = getAlertas(suministros, diasAlerta);

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
        <div style={{ color: '#4a6080', fontSize: 14 }}>Cargando…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onLogout={logout} />
      <NavTabs active={activeTab} onChange={setActiveTab} alertCount={alerts.length} />

      <main style={{ padding: '22px 28px', maxWidth: 1600, flex: 1 }}>
        {activeTab === 'resumen' && (
          <ErrorBoundary section="Resumen Ejecutivo">
            <ResumenEjecutivo
              alerts={alerts}
              restricciones={restricciones}
              onGoToSuministros={() => setActiveTab('suministros')}
            />
          </ErrorBoundary>
        )}
        {activeTab === 'avance' && (
          <ErrorBoundary section="Avance de Obra">
            <AvanceObra />
          </ErrorBoundary>
        )}
        {activeTab === 'curvas' && (
          <ErrorBoundary section="Curva S">
            <CurvaS />
          </ErrorBoundary>
        )}
        {activeTab === 'suministros' && proyectoId && (
          <Suministros proyectoId={proyectoId} diasAlerta={diasAlerta} />
        )}
        {activeTab === 'restricciones' && proyectoId && (
          <Restricciones proyectoId={proyectoId} />
        )}
        {activeTab === 'configuracion' && (
          <Configuracion
            diasAlerta={diasAlerta}
            onSetDiasAlerta={setDiasAlerta}
            onExport={() => {}}
            onImport={(_file: File) => {}}
          />
        )}
      </main>

      <footer style={{
        background: 'white',
        borderTop: '1px solid #dde5ef',
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#7a92a8',
      }}>
        <div>C MEJIA S.A.C. · Contratistas Generales · Dashboard de Control de Obra</div>
        <div>Proyecto MOTIL · SEM17 · Generado: {today}</div>
      </footer>
    </div>
  );
}
