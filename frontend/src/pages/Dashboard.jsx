import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Package,
  Calendar, DollarSign, Target, Activity, Clock
} from 'lucide-react';

function KPICard({ title, value, subtitle, badge, color = 'blue', icon: Icon, small }) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'text-slate-500' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {Icon && <div className={`${c.icon}`}><Icon size={18} /></div>}
      </div>
      <p className={`text-3xl font-bold ${c.text} leading-none`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
      {badge && (
        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function ProgressComparison({ contractual, planificado, real }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Comparativo de Avance
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Contractual</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Planificado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Real</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Contractual */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Contractual (Baseline)</p>
          <p className="text-3xl font-bold text-amber-600">{contractual?.toFixed(2)}%</p>
          <p className="text-xs text-slate-400 mt-1">Avance original de contrato</p>
          <div className="mt-3 progress-bar">
            <div className="progress-bar-fill bg-amber-500" style={{ width: `${Math.min(contractual, 100)}%` }} />
          </div>
        </div>
        {/* Planificado */}
        <div className="text-center border-x border-slate-100 px-4">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Planificado (Plan Trabajo)</p>
          <p className="text-3xl font-bold text-blue-600">{planificado?.toFixed(2)}%</p>
          <p className="text-xs text-slate-400 mt-1">Prog. acumulado esperado</p>
          <div className="mt-3 progress-bar">
            <div className="progress-bar-fill bg-blue-600" style={{ width: `${Math.min(planificado, 100)}%` }} />
          </div>
        </div>
        {/* Real */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Real Ejecutado</p>
          <p className="text-3xl font-bold text-green-600">{real?.toFixed(2)}%</p>
          <p className="text-xs text-slate-400 mt-1">Avance físico real</p>
          <div className="mt-3 progress-bar">
            <div className="progress-bar-fill bg-green-500" style={{ width: `${Math.min(real, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Desviaciones */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className={`rounded-lg p-3 ${Math.abs(real - planificado) < 0.5 ? 'bg-slate-50' : real > planificado ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs font-semibold text-slate-600 mb-1">Real vs Planificado</p>
          <p className={`text-lg font-bold ${real - planificado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {real - planificado >= 0 ? '+' : ''}{(real - planificado).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500">
            {Math.abs(real - planificado) < 0.05 ? 'Sin desviación — al día con el plan' :
              real > planificado ? 'Adelantado respecto al plan' : 'Retrasado respecto al plan'}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${real > contractual ? 'bg-green-50' : 'bg-amber-50'}`}>
          <p className="text-xs font-semibold text-slate-600 mb-1">Real vs Contractual</p>
          <p className={`text-lg font-bold ${real - contractual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {real - contractual >= 0 ? '+' : ''}{(real - contractual).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500">
            {real >= contractual ? 'Adelantado respecto al baseline' : 'Por debajo del baseline'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/proyecto/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500">Error al cargar datos</div>;

  const { proyecto, semanaActual, diasRestantes, avanceReal, avancePlanificado, avanceContractual,
    desviacion, adelantoContractual, incrementoSemanal, restriccionesAbiertas, alertasSuministros } = data;

  const fechaSemana = semanaActual?.fecha ? new Date(semanaActual.fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) : '';

  const valorFormateado = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2
  }).format(proyecto.valor_contrato);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="bg-[#1a2744] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Semana */}
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[90px]">
            <p className="text-xs text-slate-300 font-medium">SEMANA</p>
            <p className="text-2xl font-bold">S{proyecto.semana_actual}</p>
          </div>
          {/* Fechas */}
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-slate-400">INICIO</p>
              <p className="text-sm font-semibold">{new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'2-digit' })}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">FIN CONTRACTUAL</p>
              <p className="text-sm font-semibold">{new Date(proyecto.fecha_fin_contractual).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'2-digit' })}</p>
            </div>
          </div>
          {/* Días restantes */}
          <div className="bg-blue-600 rounded-xl px-4 py-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold">{diasRestantes}</p>
            <p className="text-xs text-blue-200">DÍAS RESTANTES</p>
          </div>
          {/* Status */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-400">LIVE</span>
          </div>
          {/* Semana fecha */}
          <div className="text-right">
            <p className="text-xs text-slate-400">CORTE SEM {proyecto.semana_actual}</p>
            <p className="text-sm font-semibold">{fechaSemana}</p>
          </div>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Avance Real Acum."
          value={`${avanceReal?.toFixed(2)}%`}
          subtitle={`SEM${proyecto.semana_actual} · ${fechaSemana}`}
          badge={Math.abs(desviacion) < 0.05 ? '= Plan · Sin desviación' : desviacion > 0 ? `+${desviacion.toFixed(2)}% adelantado` : `${desviacion.toFixed(2)}% retraso`}
          color="green"
          icon={TrendingUp}
        />
        <KPICard
          title="Avance Planificado"
          value={`${avancePlanificado?.toFixed(2)}%`}
          subtitle="Prog. acumulado"
          badge={`Δ ${desviacion >= 0 ? '+' : ''}${desviacion?.toFixed(2)}%`}
          color="blue"
          icon={Target}
        />
        <KPICard
          title="Avance Contractual"
          value={`${avanceContractual?.toFixed(2)}%`}
          subtitle="Baseline original"
          badge={`+${adelantoContractual?.toFixed(2)}% adelantado`}
          color="yellow"
          icon={Activity}
        />
        <KPICard
          title="Valor Contrato Total"
          value={`$${(proyecto.valor_contrato / 1000000).toFixed(2)}M`}
          subtitle={valorFormateado}
          badge={`${proyecto.frentes_trabajo} Frentes de Trabajo`}
          color="slate"
          icon={DollarSign}
        />
      </div>

      {/* KPI Row 2 - Alerts */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-white rounded-xl border p-5 shadow-sm ${alertasSuministros > 0 ? 'border-amber-300' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas Suministros</p>
            <Package size={18} className={alertasSuministros > 0 ? 'text-amber-500' : 'text-slate-400'} />
          </div>
          <p className={`text-5xl font-bold ${alertasSuministros > 0 ? 'text-amber-500' : 'text-green-600'}`}>
            {alertasSuministros}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {alertasSuministros === 0 ? 'Sin ítems en riesgo' : `Ítem${alertasSuministros > 1 ? 's' : ''} en riesgo`}
          </p>
        </div>
        <div className={`bg-white rounded-xl border p-5 shadow-sm ${restriccionesAbiertas > 0 ? 'border-red-300' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restricciones Abiertas</p>
            <AlertTriangle size={18} className={restriccionesAbiertas > 0 ? 'text-red-500' : 'text-slate-400'} />
          </div>
          <p className={`text-5xl font-bold ${restriccionesAbiertas > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {restriccionesAbiertas}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {restriccionesAbiertas === 0 ? 'Sin pendientes' : 'Pendientes de atención'}
          </p>
        </div>
      </div>

      {/* Progress Comparison */}
      <ProgressComparison
        contractual={avanceContractual}
        planificado={avancePlanificado}
        real={avanceReal}
      />

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Proyecto</p>
          <p className="font-bold text-slate-800">{proyecto.nombre}</p>
          <p className="text-sm text-slate-500 mt-1">{proyecto.empresa}</p>
          <p className="text-xs text-slate-400 mt-2">{proyecto.descripcion}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Avance Semanal</p>
          <p className="text-2xl font-bold text-blue-600">+{incrementoSemanal?.toFixed(2)}%</p>
          <p className="text-xs text-slate-500 mt-2">Incremento en SEM{proyecto.semana_actual}</p>
          <div className="mt-3 progress-bar">
            <div className="progress-bar-fill bg-blue-500" style={{ width: `${Math.min(incrementoSemanal * 10, 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Plazo</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-800">{diasRestantes}</p>
            <p className="text-sm text-slate-500 mb-0.5">días restantes</p>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Fin contractual: {new Date(proyecto.fecha_fin_contractual).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-3">
            {(() => {
              const inicio = new Date(proyecto.fecha_inicio);
              const fin = new Date(proyecto.fecha_fin_contractual);
              const hoy = new Date();
              const total = fin - inicio;
              const transcurrido = hoy - inicio;
              const pct = Math.min(Math.max((transcurrido / total) * 100, 0), 100);
              return (
                <div className="progress-bar">
                  <div className="progress-bar-fill bg-slate-600" style={{ width: `${pct}%` }} />
                </div>
              );
            })()}
            <p className="text-xs text-slate-400 mt-1">Tiempo transcurrido del proyecto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
