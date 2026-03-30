import { useState } from 'react';
import type { TabId } from './types';
import { useAppStore } from './store/appStore';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { ResumenEjecutivo } from './components/sections/ResumenEjecutivo';
import { AvanceObra } from './components/sections/AvanceObra';
import { CurvaS } from './components/sections/CurvaS';
import { Suministros } from './components/sections/Suministros';
import { Restricciones } from './components/sections/Restricciones';
import { Configuracion } from './components/sections/Configuracion';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');

  // Cada componente que necesite datos los leerá directamente del store.
  // App solo necesita los datos transversales: alertas y restricciones para el header/nav.
  const alerts       = useAppStore(s => s.getAlertas());
  const restricciones = useAppStore(s => s.restricciones);
  const suministros   = useAppStore(s => s.suministros);
  const diasAlerta    = useAppStore(s => s.diasAlerta);

  const addSuministro          = useAppStore(s => s.addSuministro);
  const deleteSuministro       = useAppStore(s => s.deleteSuministro);
  const addRestriccion         = useAppStore(s => s.addRestriccion);
  const deleteRestriccion      = useAppStore(s => s.deleteRestriccion);
  const updateRestriccionEstado = useAppStore(s => s.updateRestriccionEstado);
  const setDiasAlerta          = useAppStore(s => s.setDiasAlerta);
  const exportJSON             = useAppStore(s => s.exportJSON);
  const importJSON             = useAppStore(s => s.importJSON);

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleImport = (file: File) => {
    importJSON(file)
      .then(() => alert('Datos importados correctamente.'))
      .catch((err: Error) => alert(err.message));
  };

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
          <Suministros
            suministros={suministros}
            alerts={alerts}
            onAdd={addSuministro}
            onDelete={deleteSuministro}
          />
        )}
        {activeTab === 'restricciones' && (
          <Restricciones
            restricciones={restricciones}
            onAdd={addRestriccion}
            onDelete={deleteRestriccion}
            onUpdateEstado={updateRestriccionEstado}
          />
        )}
        {activeTab === 'configuracion' && (
          <Configuracion
            diasAlerta={diasAlerta}
            onSetDiasAlerta={setDiasAlerta}
            onExport={exportJSON}
            onImport={handleImport}
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
