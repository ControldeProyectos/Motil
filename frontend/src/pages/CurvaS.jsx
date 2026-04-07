import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import api from '../api/client';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">Sem {label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value?.toFixed(2)}%
        </p>
      ))}
    </div>
  );
};

export default function CurvaS() {
  const [data, setData] = useState([]);
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/avances/curva-s'),
      api.get('/proyecto'),
    ]).then(([curva, proy]) => {
      setData(curva.data);
      setProyecto(proy.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const semanaActual = proyecto?.semana_actual;

  // Stats
  const lastReal = [...data].reverse().find(d => d.real_acum !== null);
  const lastPlan = data[data.length - 1];
  const desv = lastReal ? (lastReal.real_acum - lastReal.planificado_acum) : 0;

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Curva S — Avance Acumulado</h1>
        <p className="text-slate-500 text-sm mt-1">Comparativo contractual, planificado y real a lo largo del proyecto</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Real Acumulado</p>
          <p className="text-2xl font-bold text-green-600">{lastReal?.real_acum?.toFixed(2) || 0}%</p>
          <p className="text-xs text-slate-400 mt-1">SEM {semanaActual}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Planificado Acumulado</p>
          <p className="text-2xl font-bold text-blue-600">{lastReal?.planificado_acum?.toFixed(2) || 0}%</p>
          <p className="text-xs text-slate-400 mt-1">SEM {semanaActual}</p>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm ${desv >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Desviación</p>
          <p className={`text-2xl font-bold ${desv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {desv >= 0 ? '+' : ''}{desv.toFixed(2)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">{desv >= 0 ? 'Adelantado' : 'Retrasado'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-700">Curva S del Proyecto</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-amber-500 inline-block rounded" style={{ borderTop: '2px dashed #f59e0b' }} />
              Contractual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-blue-600 inline-block rounded" />
              Planificado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-green-500 inline-block rounded" />
              Real
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="semana"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{ value: 'Semana', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={semanaActual}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{ value: `S${semanaActual}`, position: 'top', fontSize: 11, fill: '#64748b' }}
            />
            <Line
              type="monotone"
              dataKey="contractual_acum"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              name="Contractual"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="planificado_acum"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              name="Planificado"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="real_acum"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ fill: '#16a34a', r: 4 }}
              activeDot={{ r: 6 }}
              name="Real"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Datos de Curva S</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Semana</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-amber-600 uppercase">Contractual %</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-blue-600 uppercase">Planificado %</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-green-600 uppercase">Real %</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Desviación</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(d => d.real_acum !== null).map((row) => {
                const dev = (row.real_acum || 0) - (row.planificado_acum || 0);
                const isCurrent = row.semana === semanaActual;
                return (
                  <tr key={row.id} className={`border-b border-slate-50 hover:bg-slate-50 ${isCurrent ? 'bg-blue-50/50' : ''}`}>
                    <td className="py-2 px-4 font-medium text-slate-700">
                      S{row.semana}
                      {isCurrent && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">Actual</span>}
                    </td>
                    <td className="py-2 px-4 text-slate-500 text-xs">
                      {new Date(row.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-amber-600">{row.contractual_acum?.toFixed(2)}%</td>
                    <td className="py-2 px-4 text-right font-medium text-blue-600">{row.planificado_acum?.toFixed(2)}%</td>
                    <td className="py-2 px-4 text-right font-bold text-green-600">{row.real_acum?.toFixed(2)}%</td>
                    <td className={`py-2 px-4 text-right font-semibold ${dev >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dev >= 0 ? '+' : ''}{dev.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
