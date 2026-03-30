import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Suministro, Restriccion } from '../../types';
import { CURVA_S } from '../../data/curvaS';
import { Card, CardTitle } from '../ui/Card';
import { KpiCard } from '../ui/KpiCard';
import { Badge } from '../ui/Badge';

function fd(ds: string) {
  if (!ds) return '—';
  const d = new Date(ds + 'T00:00:00');
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Props {
  alerts: Suministro[];
  restricciones: Restriccion[];
  onGoToSuministros: () => void;
}

export function ResumenEjecutivo({ alerts, restricciones, onGoToSuministros }: Props) {
  const restricAbiertas = restricciones.filter(r => r.estado !== 'cerrada').length;
  const miniData = CURVA_S.slice(0, 17);

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Avance Real Acum." value="8.55%" sub="SEM17 · 16/03/2026" delta="= Plan · Sin desviación" deltaVariant="info" accentColor="#1a7a4a" valueColor="#1a7a4a" />
        <KpiCard label="Avance Planificado" value="8.55%" sub="Prog. acumulado S17" delta="Δ = 0.00%" deltaVariant="info" accentColor="#2e6da4" />
        <KpiCard label="Avance Contractual" value="2.08%" sub="Baseline original" delta="▲ +6.47% adelantado" deltaVariant="ok" accentColor="#b36a00" valueColor="#b36a00" />
        <KpiCard label="Valor Contrato Total" value="$3.09M" sub="USD 3,090,285.88" delta="3 Frentes de Trabajo" deltaVariant="info" accentColor="#1a2b4a" valueColor="#1a2b4a" />
        <KpiCard label="Alertas Suministros" value={alerts.length} sub="Ítems en riesgo" accentColor="#c0392b" valueColor="#c0392b" />
        <KpiCard label="Restricciones Abiertas" value={restricAbiertas} sub="Pendientes de atención" accentColor="#b36a00" valueColor="#b36a00" />
      </div>

      {/* Comparativo */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle badge="Contractual · Planificado · Real">Comparativo de Avance — SEM17</CardTitle>
        {/* Three columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #dde5ef', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <ComparCol label="Contractual (Baseline)" value={2.08} color="#b36a00" bg="#fff3e0" note="Avance original de contrato" />
          <ComparCol label="Planificado (Plan Trabajo)" value={8.55} color="#2e6da4" bg="#c8ddf0" note="Prog. acumulado esperado S17" borderSide />
          <ComparCol label="Real Ejecutado" value={8.55} color="#1a7a4a" bg="#e6f5ee" note="Avance físico real S17" />
        </div>

        {/* Delta boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <DeltaBox icon="📈" title="Real vs Planificado" delta="0.00%" note="Sin desviación — al día con el plan" />
          <DeltaBox icon="🏆" title="Real vs Contractual" delta="+6.47%" note="Adelantado respecto al baseline" />
        </div>

        {/* Table by frente */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', marginBottom: 8 }}>
          Comparativo por Frente de Trabajo
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f7f9fc' }}>
                {['Frente de Trabajo', 'Contractual', 'Planificado', 'Real', 'Δ Real−Plan', 'Δ Real−Contrato', 'Estado'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', padding: '8px 10px', textAlign: h === 'Frente de Trabajo' ? 'left' : 'right', borderBottom: '2px solid #dde5ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { frente: 'Obras Civiles — Patio de Llaves', c: '16.0%', p: '18.1%', r: '18.1%', dp: '0.0%', dc: '+2.1%', est: 'En marcha', ok: true },
                { frente: 'Obras Civiles — Sala de Control', c: '0.0%', p: '0.0%', r: '0.0%', dp: '—', dc: '—', est: 'Pendiente inicio', ok: false },
                { frente: 'Obras Electromecánicas',          c: '0.0%', p: '4.1%', r: '4.1%', dp: '0.0%', dc: '+4.1%', est: 'En marcha', ok: true },
                { frente: 'Redes Primarias',                  c: '0.0%', p: '6.4%', r: '6.4%', dp: '0.0%', dc: '+6.4%', est: 'En marcha', ok: true },
              ].map(row => (
                <tr key={row.frente} style={{ borderBottom: '1px solid #dde5ef' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600 }}>{row.frente}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#b36a00', fontWeight: 600, fontFamily: 'DM Mono,monospace' }}>{row.c}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#2e6da4', fontWeight: 600, fontFamily: 'DM Mono,monospace' }}>{row.p}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#1a7a4a', fontWeight: 700, fontFamily: 'DM Mono,monospace' }}>{row.r}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}><Badge variant={row.ok ? 'ok' : 'neutral'}>{row.dp}</Badge></td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}><Badge variant={row.ok ? 'ok' : 'neutral'}>{row.dc}</Badge></td>
                  <td style={{ padding: '9px 10px' }}><Badge variant={row.ok ? 'ok' : 'neutral'}>{row.est}</Badge></td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ background: '#1a2b4a' }}>
                <td style={{ padding: '9px 10px', fontWeight: 800, color: 'white' }}>TOTAL PROYECTO</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, fontFamily: 'DM Mono,monospace', color: '#ffcc00' }}>2.08%</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, fontFamily: 'DM Mono,monospace', color: '#90caf9' }}>8.55%</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, fontFamily: 'DM Mono,monospace', color: '#a5d6a7' }}>8.55%</td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}><Badge variant="ok" style={{ background: 'rgba(124,252,94,.2)', color: '#a5d6a7' }}>0.00%</Badge></td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}><Badge variant="ok" style={{ background: 'rgba(124,252,94,.2)', color: '#a5d6a7' }}>+6.47%</Badge></td>
                <td style={{ padding: '9px 10px' }}><Badge variant="ok" style={{ background: 'rgba(124,252,94,.2)', color: '#a5d6a7' }}>✓ Al día</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mini chart + alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 16 }}>
        <Card>
          <CardTitle badge="Avance Acumulado %">Curva S — S01 a S17</CardTitle>
          <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            <LegendItem color="#2e6da4" label="Planificado" />
            <LegendItem color="#1a7a4a" label="Real" />
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniData}>
                <XAxis dataKey="s" tick={{ fontSize: 9, fill: '#4a6080' }} />
                <YAxis tick={{ fontSize: 9, fill: '#4a6080' }} tickFormatter={v => v + '%'} domain={[0, 10]} />
                <Tooltip formatter={(v: unknown) => Number(v).toFixed(3) + '%'} />
                <Line type="monotone" dataKey="p" name="Planificado" stroke="#2e6da4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="r" name="Real" stroke="#1a7a4a" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>
            🚨 Alertas Activas de Suministros
          </CardTitle>
          <div style={{ position: 'absolute', right: 18, top: 18 }}>
            <button
              onClick={onGoToSuministros}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: '#2e6da4', color: 'white', fontSize: 11, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', border: 'none' }}
            >
              Ver todos →
            </button>
          </div>
          {alerts.length === 0 ? (
            <div style={{ color: '#1a7a4a', fontSize: 12, textAlign: 'center', padding: 18, background: '#e6f5ee', borderRadius: 7, fontWeight: 600 }}>
              ✅ Sin alertas activas de suministros.
            </div>
          ) : (
            alerts.slice(0, 3).map(s => <AlertBanner key={s.id} s={s} />)
          )}
        </Card>
      </div>
    </div>
  );
}

function ComparCol({ label, value, color, bg, note, borderSide }: { label: string; value: number; color: string; bg: string; note: string; borderSide?: boolean }) {
  return (
    <div style={{ padding: '16px 18px', background: bg, borderRight: borderSide ? '1px solid #dde5ef' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value.toFixed(2)}%</div>
      <div style={{ fontSize: 10, color: '#4a6080', marginTop: 5 }}>{note}</div>
      <div style={{ marginTop: 10, height: 6, background: `${color}22`, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function DeltaBox({ icon, title, delta, note }: { icon: string; title: string; delta: string; note: string }) {
  return (
    <div style={{ background: '#e6f5ee', border: '1px solid #b7e4c7', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#1a7a4a' }}>{title}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1a7a4a' }}>{delta}</div>
        <div style={{ fontSize: 10, color: '#4a6080' }}>{note}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4a6080', fontWeight: 500 }}>
      <div style={{ width: 12, height: 4, borderRadius: 2, background: color }} />
      {label}
    </div>
  );
}

function AlertBanner({ s }: { s: Suministro }) {
  const fn = new Date(s.fechaNecesaria + 'T00:00:00');
  const fl = new Date(s.fechaLlegada + 'T00:00:00');
  const diff = Math.round((fn.getTime() - fl.getTime()) / 86400000);
  const dias = Math.round((fn.getTime() - Date.now()) / 86400000);
  return (
    <div className="animate-slide-in" style={{ background: '#fdecea', border: '1px solid #f5c6c2', borderLeft: '4px solid #c0392b', borderRadius: 8, padding: '11px 14px', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ fontSize: 18, flexShrink: 0 }}>📦</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', marginBottom: 2 }}>{s.descripcion}</div>
        <div style={{ fontSize: 11, color: '#4a6080' }}>Llegada estimada: {fd(s.fechaLlegada)} · Necesario en obra: {fd(s.fechaNecesaria)}</div>
        <div style={{ fontSize: 10, color: '#b36a00', marginTop: 3, fontWeight: 600 }}>
          {diff < 0 ? `Atraso estimado: ${Math.abs(diff)} días` : `${dias} días para necesitarlo`}
        </div>
      </div>
    </div>
  );
}
