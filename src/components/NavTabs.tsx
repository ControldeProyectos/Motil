import type { TabId } from '../types';

interface Tab { id: TabId; label: string; icon: string; }

const TABS: Tab[] = [
  { id: 'resumen',        label: 'Resumen Ejecutivo',  icon: '📊' },
  { id: 'avance',         label: 'Avance de Obra',      icon: '🏗️' },
  { id: 'curvas',         label: 'Curva S',             icon: '📈' },
  { id: 'suministros',    label: 'Suministros',         icon: '📦' },
  { id: 'restricciones',  label: 'Restricciones',       icon: '⚠️' },
  { id: 'configuracion',  label: 'Configuración',       icon: '⚙️' },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
  alertCount: number;
}

export function NavTabs({ active, onChange, alertCount }: Props) {
  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #dde5ef',
      display: 'flex',
      padding: '0 28px',
      overflowX: 'auto',
      boxShadow: '0 1px 4px rgba(26,43,74,.06)',
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2.5px solid #2e6da4' : '2.5px solid transparent',
              color: isActive ? '#2e6da4' : '#4a6080',
              fontFamily: 'Inter',
              fontSize: 11.5,
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '.3px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all .18s',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#1a2b4a'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#4a6080'; }}
          >
            {tab.icon} {tab.label}
            {tab.id === 'suministros' && alertCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 17, height: 17, borderRadius: '50%', background: '#c0392b',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }}>
                {alertCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
