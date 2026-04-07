import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

function AvanceRow({ act, semanaId, onSave, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    avance_planificado: act.avance_planificado || 0,
    avance_real: act.avance_real || 0,
    metrado_ejecutado: act.metrado_ejecutado || 0,
    observaciones: act.observaciones || '',
  });

  const handleSave = async () => {
    await onSave(act.id, semanaId, form);
    setEditing(false);
  };

  const pct = act.avance_real || 0;
  const pctColor = pct >= act.avance_planificado ? 'bg-green-500' : pct >= act.avance_planificado * 0.9 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <span className="text-xs font-mono text-slate-400">{act.codigo}</span>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-slate-700">{act.nombre}</p>
        {act.descripcion && <p className="text-xs text-slate-400">{act.descripcion}</p>}
      </td>
      <td className="py-3 px-4 text-center text-xs text-slate-500">{act.unidad}</td>
      <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{act.metrado_total?.toLocaleString()}</td>
      <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">
        {editing ? (
          <input type="number" min="0" max="100" step="0.1"
            className="w-20 text-center border border-blue-300 rounded px-2 py-1 text-xs"
            value={form.avance_planificado}
            onChange={e => setForm(f => ({ ...f, avance_planificado: parseFloat(e.target.value) }))}
          />
        ) : `${act.avance_planificado?.toFixed(1) || 0}%`}
      </td>
      <td className="py-3 px-4 text-center">
        {editing ? (
          <input type="number" min="0" max="100" step="0.1"
            className="w-20 text-center border border-green-300 rounded px-2 py-1 text-xs"
            value={form.avance_real}
            onChange={e => setForm(f => ({ ...f, avance_real: parseFloat(e.target.value) }))}
          />
        ) : (
          <div>
            <span className={`text-sm font-bold ${pct >= (act.avance_planificado || 0) ? 'text-green-600' : 'text-red-600'}`}>
              {pct.toFixed(1)}%
            </span>
            <div className="mt-1 progress-bar w-24 mx-auto">
              <div className={`progress-bar-fill ${pctColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-center text-xs text-slate-500">
        {editing ? (
          <input type="number" min="0" step="0.1"
            className="w-24 text-center border border-slate-300 rounded px-2 py-1 text-xs"
            value={form.metrado_ejecutado}
            onChange={e => setForm(f => ({ ...f, metrado_ejecutado: parseFloat(e.target.value) }))}
          />
        ) : act.metrado_ejecutado?.toLocaleString() || '0'}
      </td>
      <td className="py-3 px-4 text-right">
        {canEdit && (
          editing ? (
            <div className="flex gap-1 justify-end">
              <button onClick={handleSave} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                <Save size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
              <Edit2 size={14} />
            </button>
          )
        )}
      </td>
    </tr>
  );
}

function FrenteSection({ frente, actividades, semanaId, onSave, canEdit }) {
  const [collapsed, setCollapsed] = useState(false);

  const totalPlan = actividades.reduce((s, a) => s + (a.peso || 0) * (a.avance_planificado || 0) / 100, 0) /
    Math.max(actividades.reduce((s, a) => s + (a.peso || 0), 0), 1) * 100;
  const totalReal = actividades.reduce((s, a) => s + (a.peso || 0) * (a.avance_real || 0) / 100, 0) /
    Math.max(actividades.reduce((s, a) => s + (a.peso || 0), 0), 1) * 100;

  const frenteColors = {
    civil: 'bg-blue-600',
    electromecanica: 'bg-orange-500',
    arquitectura: 'bg-purple-600',
  };
  const badgeColor = frenteColors[frente.tipo] || 'bg-slate-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className={`w-2 h-8 rounded-full ${badgeColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800">{frente.nombre}</h3>
            <span className={`text-xs text-white font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {frente.tipo}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-500">Plan: <span className="font-semibold text-blue-600">{totalPlan.toFixed(1)}%</span></span>
            <span className="text-xs text-slate-500">Real: <span className={`font-semibold ${totalReal >= totalPlan ? 'text-green-600' : 'text-red-600'}`}>{totalReal.toFixed(1)}%</span></span>
            <span className="text-xs text-slate-400">{actividades.length} actividades</span>
          </div>
        </div>
        {collapsed ? <ChevronRight size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </div>

      {!collapsed && (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Código</th>
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Actividad</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Und</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Metrado</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Plan %</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Real %</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Ejecutado</th>
                <th className="py-2 px-4" />
              </tr>
            </thead>
            <tbody>
              {actividades.map(act => (
                <AvanceRow key={act.id} act={act} semanaId={semanaId} onSave={onSave} canEdit={canEdit} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NuevaActividadModal({ frentes, onClose, onSave }) {
  const [form, setForm] = useState({
    frente_id: frentes[0]?.id || '',
    codigo: '',
    nombre: '',
    unidad: 'glb',
    metrado_total: 0,
    peso: 0,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Nueva Actividad</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Frente *</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.frente_id} onChange={e => setForm(f => ({ ...f, frente_id: e.target.value }))}>
              {frentes.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Código</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CIV-006" value={form.codigo}
                onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Unidad</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                {['glb', 'm', 'm2', 'm3', 'kg', 'und', 'ml'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre *</label>
            <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la actividad" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Metrado Total</label>
              <input type="number" min="0" step="0.01"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.metrado_total} onChange={e => setForm(f => ({ ...f, metrado_total: parseFloat(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Peso (%)</label>
              <input type="number" min="0" max="100" step="0.1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.peso} onChange={e => setForm(f => ({ ...f, peso: parseFloat(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AvanceObra() {
  const { canEdit } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [frentes, setFrente] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/proyecto'),
      api.get('/avances/frentes'),
      api.get('/avances/actividades'),
      api.get('/avances/semanas'),
    ]).then(([proy, frent, acts, sems]) => {
      setProyecto(proy.data);
      setFrente(frent.data);
      setActividades(acts.data);
      setSemanas(sems.data);
      const semActual = sems.data.find(s => s.numero === proy.data.semana_actual);
      setSemanaSeleccionada(semActual?.id || sems.data[sems.data.length - 1]?.id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!semanaSeleccionada) return;
    api.get(`/avances/detalle?semana_id=${semanaSeleccionada}`)
      .then(r => setDetalles(r.data));
  }, [semanaSeleccionada]);

  const handleSaveAvance = async (actividadId, semanaId, form) => {
    await api.post('/avances/detalle', {
      actividad_id: actividadId,
      semana_id: semanaId || semanaSeleccionada,
      ...form,
    });
    const r = await api.get(`/avances/detalle?semana_id=${semanaSeleccionada}`);
    setDetalles(r.data);
  };

  const handleNuevaActividad = async (form) => {
    await api.post('/avances/actividades', form);
    const r = await api.get('/avances/actividades');
    setActividades(r.data);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Merge actividades con detalles de la semana seleccionada
  const actividadesConAvance = actividades.map(act => {
    const detalle = detalles.find(d => d.actividad_id === act.id);
    return { ...act, ...(detalle || {}) };
  });

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Avance de Obra</h1>
          <p className="text-slate-500 text-sm mt-1">Seguimiento físico por actividad y frente de trabajo</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de semana */}
          <select
            value={semanaSeleccionada || ''}
            onChange={e => setSemanaSeleccionada(parseInt(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {semanas.map(s => (
              <option key={s.id} value={s.id}>
                SEM {s.numero} — {new Date(s.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                {s.numero === proyecto?.semana_actual ? ' ← Actual' : ''}
              </option>
            ))}
          </select>
          {canEdit && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Nueva Actividad
            </button>
          )}
        </div>
      </div>

      {/* Frentes */}
      {frentes.map(frente => {
        const acts = actividadesConAvance.filter(a => a.frente_id === frente.id);
        return (
          <FrenteSection
            key={frente.id}
            frente={frente}
            actividades={acts}
            semanaId={semanaSeleccionada}
            onSave={handleSaveAvance}
            canEdit={canEdit}
          />
        );
      })}

      {showModal && (
        <NuevaActividadModal
          frentes={frentes}
          onClose={() => setShowModal(false)}
          onSave={handleNuevaActividad}
        />
      )}
    </div>
  );
}
