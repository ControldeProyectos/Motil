import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

const FIN_CONTRACTUAL = '2027-01-07';

export function Header() {
  const diasRestantes = useCountdown(FIN_CONTRACTUAL);

  const daysColor =
    diasRestantes < 90 ? '#e74c3c' :
    diasRestantes < 180 ? '#b36a00' : 'white';

  return (
    <header style={{
      background: '#1a2b4a',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64,
      boxShadow: '0 2px 12px rgba(26,43,74,.25)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: Logo + Project */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <div style={{
          background: 'white',
          borderRadius: 6,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 44,
        }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg,#2e6da4,#5b8ab8)',
            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 800, color: '#1a2b4a', letterSpacing: '.3px', lineHeight: 1.2 }}>
              C MEJIA S.A.C.
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 500, color: '#4a6080', letterSpacing: '.5px', textTransform: 'uppercase' }}>
              Contratistas Generales
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.2)' }} />

        {/* Project Info */}
        <div style={{ color: 'white' }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px' }}>PROYECTO MOTIL</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
            S.E. Motil · Control de Avance de Obra
          </div>
        </div>
      </div>

      {/* Right: Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <HdrBadge label="Semana" value="S17" valueSize={18} style={{ background: '#2e6da4', borderRadius: 7 }} />
        <HdrBadge label="Inicio" value="14/11/25" valueSize={13} />
        <HdrBadge label="Fin Contractual" value="07/01/27" valueSize={13} />
        <HdrBadge label="Días restantes" value={String(diasRestantes)} unit="días" valueSize={18} valueColor={daysColor} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
          <span className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ccd7f', display: 'inline-block' }} />
          LIVE
        </div>
      </div>
    </header>
  );
}

function HdrBadge({ label, value, unit, valueSize = 18, valueColor = 'white', style: extraStyle = {} }: {
  label: string;
  value: string;
  unit?: string;
  valueSize?: number;
  valueColor?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(255,255,255,.2)',
      borderRadius: 8,
      padding: '7px 13px',
      textAlign: 'center',
      color: 'white',
      ...extraStyle,
    }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, opacity: .7 }}>{label}</div>
      <div style={{ fontSize: valueSize, fontWeight: 800, lineHeight: 1.1, color: valueColor }}>{value}</div>
      {unit && <div style={{ fontSize: 9, opacity: .6 }}>{unit}</div>}
    </div>
  );
}
