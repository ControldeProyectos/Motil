import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CURVA_S } from '../../data/curvaS';
import { Card, CardTitle } from '../ui/Card';

export function CurvaS() {
  const chartData = CURVA_S.map((d, i) => ({
    ...d,
    forecast: i >= 16 ? d.p : null,
    realVal: i <= 16 ? d.r : null,
  }));

  return (
    <div>
      <Card>
        <CardTitle badge="Planif. + Real + Forecast">Curva S Completa — S01 a S60</CardTitle>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            { color: '#2e6da4', label: 'Planificado' },
            { color: '#1a7a4a', label: 'Real (hasta S17)' },
            { color: '#9b59b6', label: 'Forecast S17→Fin', dashed: true },
          ].map(({ color, label, dashed }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4a6080', fontWeight: 500 }}>
              <div style={{ width: 18, height: 3, borderRadius: 2, background: color, borderTop: dashed ? `2px dashed ${color}` : undefined, opacity: dashed ? .8 : 1 }} />{label}
            </div>
          ))}
        </div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="s" tick={{ fontSize: 8, fill: '#4a6080' }} angle={-45} textAnchor="end" height={55} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: '#4a6080' }} tickFormatter={v => v + '%'} domain={[0, 105]} />
              <Tooltip
                formatter={(v: unknown) => [v != null ? Number(v).toFixed(3) + '%' : '—']}
                labelStyle={{ color: '#1a2b4a', fontWeight: 700 }}
              />
              <ReferenceLine x="S17" stroke="#1a7a4a" strokeDasharray="4 2" label={{ value: 'HOY', fill: '#1a7a4a', fontSize: 9 }} />
              <Line type="monotone" dataKey="p" name="Planificado" stroke="#2e6da4" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="realVal" name="Real" stroke="#1a7a4a" strokeWidth={2.5} dot={(props: any) => props.index === 16 ? <circle key={`dot-${props.index}`} cx={props.cx} cy={props.cy} r={5} fill="#1a7a4a" /> : <g key={`dot-${props.index}`} />} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#9b59b6" strokeWidth={1.5} dot={false} strokeDasharray="6 4" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Datos Semanales</CardTitle>
        <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f7f9fc' }}>
                {['Semana', 'Fecha', 'Plan Acum. (%)', 'Real Acum. (%)', 'Diferencia'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #dde5ef', position: 'sticky', top: 0, background: '#f7f9fc' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CURVA_S.map((d, i) => {
                const isHoy = i === 16;
                const isFc = i > 16;
                const delta = d.r !== null ? (d.r - d.p).toFixed(3) : null;
                return (
                  <tr key={d.s} style={{ background: isHoy ? '#c8ddf0' : undefined, borderBottom: '1px solid #dde5ef' }}>
                    <td style={{ padding: '9px 10px', fontWeight: isHoy ? 700 : 500, color: isHoy ? '#2e6da4' : '#1a2b4a' }}>
                      {d.s}{isHoy ? ' ◄ HOY' : isFc ? ' (FC)' : ''}
                    </td>
                    <td style={{ padding: '9px 10px', color: '#4a6080', fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{d.d}</td>
                    <td style={{ padding: '9px 10px', color: '#2e6da4', fontWeight: 600, fontFamily: 'DM Mono,monospace' }}>{d.p.toFixed(3)}%</td>
                    <td style={{ padding: '9px 10px', color: d.r !== null ? '#1a7a4a' : '#7a92a8', fontWeight: d.r !== null ? 600 : 400, fontFamily: 'DM Mono,monospace' }}>
                      {d.r !== null ? d.r.toFixed(3) + '%' : '—'}
                    </td>
                    <td style={{ padding: '9px 10px', color: delta !== null ? (parseFloat(delta) >= 0 ? '#1a7a4a' : '#c0392b') : '#7a92a8', fontWeight: 600, fontFamily: 'DM Mono,monospace' }}>
                      {delta !== null ? (parseFloat(delta) >= 0 ? '+' : '') + delta + '%' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
