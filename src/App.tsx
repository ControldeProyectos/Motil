import { useState } from 'react';
import type { TabId, Suministro, Restriccion, EstadoRestriccion } from './types';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { ResumenEjecutivo } from './components/sections/ResumenEjecutivo';
import { AvanceObra } from './components/sections/AvanceObra';
import { CurvaS } from './components/sections/CurvaS';
import { SuministrosDemo } from './components/sections/SuministrosDemo';
import { RestriccionesDemo } from './components/sections/RestriccionesDemo';
import { Configuracion } from './components/sections/Configuracion';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SUMINISTROS_DEMO } from './data/suministrosDemo';
import { RESTRICCIONES_DEMO } from './data/restriccionesDemo';
import { getAlertas } from './utils/alerts';

const DEFAULT_DIAS_ALERTA = 15;

export default function App() {
  const [activeTab, setActiveTab]       = useState<TabId>('resumen');
  const [diasAlerta, setDiasAlerta]     = useState(DEFAULT_DIAS_ALERTA);
  const [suministros, setSuministros]   = useState<Suministro[]>(SUMINISTROS_DEMO);
  const [restricciones, setRestricciones] = useState<Restriccion[]>(RESTRICCIONES_DEMO);

  const alerts = getAlertas(suministros, diasAlerta);

  const handleAddSuministro    = (s: Suministro) => setSuministros(p => [...p, s]);
  const handleDeleteSuministro = (id: string) => setSuministros(p => p.filter(s => s.id !== id));

  const handleAddRestriccion    = (r: Restriccion) => setRestricciones(p => [...p, r]);
  const handleDeleteRestriccion = (id: string) => setRestricciones(p => p.filter(r => r.id !== id));
  const handleUpdateEstado      = (id: string, estado: EstadoRestriccion) =>
    setRestricciones(p => p.map(r => r.id === id ? { ...r, estado } : r));

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
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
        {activeTab === 'suministros' && (
          <SuministrosDemo
            suministros={suministros}
            alerts={alerts}
            diasAlerta={diasAlerta}
            onAdd={handleAddSuministro}
            onDelete={handleDeleteSuministro}
          />
        )}
        {activeTab === 'restricciones' && (
          <RestriccionesDemo
            restricciones={restricciones}
            onAdd={handleAddRestriccion}
            onDelete={handleDeleteRestriccion}
            onUpdateEstado={handleUpdateEstado}
          />
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
