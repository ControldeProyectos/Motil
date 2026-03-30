import { useState } from 'react';
import type { TabId } from './types';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { ResumenEjecutivo } from './components/sections/ResumenEjecutivo';
import { AvanceObra } from './components/sections/AvanceObra';
import { CurvaS } from './components/sections/CurvaS';
import { Suministros } from './components/sections/Suministros';
import { Restricciones } from './components/sections/Restricciones';
import { Configuracion } from './components/sections/Configuracion';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const {
    state,
    alerts,
    addSuministro,
    deleteSuministro,
    addRestriccion,
    deleteRestriccion,
    updateRestriccionEstado,
    setDiasAlerta,
    exportJSON,
    importJSON,
  } = useAppState();

  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} alertCount={alerts.length} />

      <main style={{ padding: '22px 28px', maxWidth: 1600, flex: 1 }}>
        {activeTab === 'resumen' && (
          <ResumenEjecutivo
            alerts={alerts}
            restricciones={state.restricciones}
            onGoToSuministros={() => setActiveTab('suministros')}
          />
        )}
        {activeTab === 'avance' && <AvanceObra />}
        {activeTab === 'curvas' && <CurvaS />}
        {activeTab === 'suministros' && (
          <Suministros
            suministros={state.suministros}
            alerts={alerts}
            onAdd={addSuministro}
            onDelete={deleteSuministro}
          />
        )}
        {activeTab === 'restricciones' && (
          <Restricciones
            restricciones={state.restricciones}
            onAdd={addRestriccion}
            onDelete={deleteRestriccion}
            onUpdateEstado={updateRestriccionEstado}
          />
        )}
        {activeTab === 'configuracion' && (
          <Configuracion
            diasAlerta={state.diasAlerta}
            onSetDiasAlerta={setDiasAlerta}
            onExport={exportJSON}
            onImport={importJSON}
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
