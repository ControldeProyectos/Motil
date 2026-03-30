import { Fragment } from 'react';
import { ACTIVIDADES } from '../../data/actividades';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

function ProgressBar({ label, c, p, r }: { label: string; c: number; p: number; r: number }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, color: '#1a2b4a', fontWeight: 500, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600, background: '#fff3e0', color: '#b36a00' }}>C:{c}%</span>
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600, background: '#c8ddf0', color: '#2e6da4' }}>P:{p}%</span>
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600, background: '#e6f5ee', color: '#1a7a4a' }}>R:{r}%</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 15, background: '#f0f4f8', borderRadius: 4, overflow: 'hidden', border: '1px solid #dde5ef' }}>
        <div style={{ position: 'absolute', top: 0, height: 5, width: `${c}%`, background: '#e67e22', opacity: .6, borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 5, height: 5, width: `${p}%`, background: '#2e6da4', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 10, height: 5, width: `${r}%`, background: '#1a7a4a', borderRadius: 3 }} />
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#2e6da4', margin: '16px 0 9px', padding: '5px 10px', background: '#c8ddf0', borderRadius: 5, borderLeft: '3px solid #2e6da4' }}>
      {icon} {label}
    </div>
  );
}

export function AvanceObra() {
  const secs = [...new Set(ACTIVIDADES.map(a => a.sec))];

  return (
    <div>
      <Card>
        <CardTitle badge="Contractual / Planificado / Real">Avance por Frente de Trabajo — SEM17</CardTitle>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['#e67e22', 'Contractual'], ['#2e6da4', 'Planificado'], ['#1a7a4a', 'Real']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4a6080', fontWeight: 500 }}>
              <div style={{ width: 12, height: 4, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>

        <SectionHeader icon="📍" label="OBRAS CIVILES — PATIO DE LLAVES" />
        {ACTIVIDADES.filter(a => a.sec === 'PATIO DE LLAVES').map(a => (
          <ProgressBar key={a.it + a.sec} label={a.n} c={a.c} p={a.p} r={a.r} />
        ))}

        <SectionHeader icon="📍" label="OBRAS CIVILES — SALA DE CONTROL" />
        <div style={{ color: '#4a6080', fontSize: 11.5, padding: '8px 12px', background: '#f0f4f8', borderRadius: 6, borderLeft: '3px solid #c5d4e4' }}>
          Sin avance en SEM17. Actividades pendientes de inicio: Obras Provisionales, Obras Preliminares, Mov. de Tierras, Garita de Control, Pozo Séptico, Muro de Contención, Sistema de Drenaje.
        </div>

        <SectionHeader icon="⚡" label="OBRAS ELECTROMECANICAS" />
        {ACTIVIDADES.filter(a => a.sec === 'OBRAS ELECTROMECANICAS').map(a => (
          <ProgressBar key={a.it + a.sec} label={a.n} c={a.c} p={a.p} r={a.r} />
        ))}

        <SectionHeader icon="🔌" label="REDES PRIMARIAS" />
        {ACTIVIDADES.filter(a => a.sec === 'REDES PRIMARIAS').map(a => (
          <ProgressBar key={a.it + a.sec} label={a.n} c={a.c} p={a.p} r={a.r} />
        ))}
      </Card>

      {/* Detail table */}
      <Card>
        <CardTitle>Tabla Detalle de Actividades — SEM17</CardTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f7f9fc' }}>
                {['IT', 'Frente', 'Actividad', 'Contractual', 'Plan S17', 'Real S17', 'Δ vs Plan', 'Venta (USD)'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #dde5ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {secs.map(sec => (
                <Fragment key={sec}>
                  <tr style={{ background: '#c8ddf0' }}>
                    <td colSpan={8} style={{ padding: '8px 10px', color: '#1a2b4a', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.5px' }}>{sec}</td>
                  </tr>
                  {ACTIVIDADES.filter(a => a.sec === sec).map(a => {
                    const delta = (a.r - a.p).toFixed(1);
                    const dv = parseFloat(delta) === 0 ? 'neutral' : parseFloat(delta) > 0 ? 'ok' : 'danger';
                    return (
                      <tr key={a.it + sec} style={{ borderBottom: '1px solid #dde5ef' }}>
                        <td style={{ padding: '9px 10px', color: '#7a92a8', fontWeight: 600 }}>{a.it}</td>
                        <td style={{ padding: '9px 10px', color: '#4a6080', fontSize: 10 }}>{sec.length > 18 ? sec.substring(0, 18) + '…' : sec}</td>
                        <td style={{ padding: '9px 10px', fontWeight: 500 }}>{a.n}</td>
                        <td style={{ padding: '9px 10px', color: '#b36a00', fontWeight: 600 }}>{a.c}%</td>
                        <td style={{ padding: '9px 10px', color: '#2e6da4', fontWeight: 600 }}>{a.p}%</td>
                        <td style={{ padding: '9px 10px', color: '#1a7a4a', fontWeight: 700 }}>{a.r}%</td>
                        <td style={{ padding: '9px 10px' }}><Badge variant={dv as any}>{parseFloat(delta) >= 0 ? '+' : ''}{delta}%</Badge></td>
                        <td style={{ padding: '9px 10px', color: '#4a6080', fontFamily: 'DM Mono,monospace' }}>${a.v.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
