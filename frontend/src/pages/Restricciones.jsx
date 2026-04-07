import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Save, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TIPOS = ['diseño', 'aprobacion', 'suministro', 'acceso', 'permisos', 'seguridad', 'clima', 'otro'];
const PRIORIDADES = ['alta', 'media', 'baja'];
const ESTADOS = ['abierta', 'levantada', 'en-proceso'];

const estadoBadge = {
  abierta: 'bg-red-100 text-red-700',
  levantada: 'bg-green-100 text-green-700',
  'en-proceso': 'bg-amber-100 text-amber-700',
};

const prioridadBadge = {
  alta: 'bg-red-50 text-red-600 border border-red-200',
  media: 'bg-amber-50 text-amber-600 border border-amber-200',
  baja: 'bg-slate-50 text-slate-600 border border-slate-200',
};

function RestriccionCard({ r, canEdit, onEdit, onDelete }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 transition-shadow hover:shadow-md
      ${r.estado === 'abierta' ? 'border-l-4 border-l-red-500 border-slate-200' :
        r.estado === 'levantada' ? 'border-l-4 border-l-green-500 border-slate-200' :
        'border-l-4 border-l-amber-500 border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1">
          <div>
            {r.estado === 'abierta' ? <AlertTriangle size={18} className="text-red-500 mt-0.5" /> :
             r.estado === 'levantada' ? <CheckCircle size={18} className="text-green-500 mt-0.5" /> :
             <Clock size={18} className="text-amber-500 mt-0.5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {r.codigo && <span className="text-xs font-mono text-slate-400">{r.codigo}</span>}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[r.estado] || 'bg-slate-100 text-slate-600'}`}>
                {r.estado?.replace('-', ' ')}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prioridadBadge[r.prioridad]}`}>
                {r.prioridad}
              </span>
              {r.frente_nombre && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                  {r.frente_nombre}
                </span>
              )}
            </div>
            <p className="font-semibold text-slate-800 mt-1 text-sm">{r.descripcion}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3">
        <div>
          <p className="text-slate-400 font-medium mb-0.5">Tipo</p>
          <p className="text-slate-700 capitalize">{r.tipo}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">Responsable</p>
          <p className="text-slate-700">{r.responsable || '—'}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">Identificada</p>
          <p className="text-slate-700">{r.fecha_identificacion ? new Date(r.fecha_identificacion).toLocaleDateString('es-PE') : '—'}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">Compromiso</p>
          <p className={`${r.fecha_compromiso && new Date(r.fecha_compromiso) < new Date() && r.estado === 'abierta' ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
            {r.fecha_compromiso ? new Date(r.fecha_compromiso).toLocaleDateString('es-PE') : '—'}
          </p>
        </div>
      </div>

      {r.impacto && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Impacto</p>
          <p className="text-xs text-slate-600">{r.impacto}</p>
        </div>
      )}

      {r.acciones && (
        <div className="mt-2">
          <p className="text-xs text-slate-400 font-medium mb-1">Acciones</p>
          <p className="text-xs text-slate-600">{r.acciones}</p>
        </div>
      )}
    </div>
  );
}

function RestriccionForm({ initial, frentes, onClose, onSave }) {
  const [form, setForm] = useState(initial || {
    codigo: '', descripcion: '', tipo: 'diseño', responsable: '',
    frente_id: '', fecha_identificacion: new Date().toISOString().split('T')[0],
    fecha_compromiso: '', fecha_levantamiento: '', estado: 'abierta',
    prioridad: 'media', impacto: '', acciones: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">{initial ? 'Editar Restricción' : 'Nueva Restricción'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Código</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="RES-006" value={form.codigo || ''} onChange={e => set('codigo', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo *</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción *</label>
            <textarea required rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describa la restricción..." value={form.descripcion || ''}
              onChange={e => set('descripcion', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Estado</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Prioridad</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Frente</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.frente_id || ''} onChange={e => set('frente_id', e.target.value)}>
                <option value="">— Todos —</option>
                {frentes.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Responsable</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre o cargo" value={form.responsable || ''} onChange={e => set('responsable', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Identificación *</label>
              <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fecha_identificacion || ''} onChange={e => set('fecha_identificacion', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Compromiso</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fecha_compromiso || ''} onChange={e => set('fecha_compromiso', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Levantamiento</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fecha_levantamiento || ''} onChange={e => set('fecha_levantamiento', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Impacto</label>
            <textarea rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describir el impacto en el proyecto..." value={form.impacto || ''} onChange={e => set('impacto', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Acciones a tomar</label>
            <textarea rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Acciones para levantar la restricción..." value={form.acciones || ''} onChange={e => set('acciones', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
              {initial ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Restricciones() {
  const { canEdit, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [frentes, setFrente] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filtroEstado) params.set('estado', filtroEstado);
    if (filtroPrioridad) params.set('prioridad', filtroPrioridad);
    const [r, f, s] = await Promise.all([
      api.get(`/restricciones?${params}`),
      api.get('/avances/frentes'),
      api.get('/restricciones/stats/resumen'),
    ]);
    setItems(r.data);
    setFrente(f.data);
    setStats(s.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filtroEstado, filtroPrioridad]);

  const handleSave = async (form) => {
    if (editing) {
      await api.put(`/restricciones/${editing.id}`, form);
    } else {
      await api.post('/restricciones', form);
    }
    setEditing(null);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta restricción?')) return;
    await api.delete(`/restricciones/${id}`);
    await fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Restricciones</h1>
          <p className="text-slate-500 text-sm mt-1">Control y seguimiento de restricciones del proyecto</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nueva Restricción
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-slate-700">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase">Total</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-red-600">{stats.abiertas}</p>
            <p className="text-xs text-red-500 mt-1 font-medium uppercase">Abiertas</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-green-600">{stats.levantadas}</p>
            <p className="text-xs text-green-500 mt-1 font-medium uppercase">Levantadas</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-amber-600">
              {stats.total > 0 ? Math.round((stats.levantadas / stats.total) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase">Efectividad</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-sm text-slate-500 self-center">{items.length} resultado{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <AlertTriangle size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay restricciones con estos filtros</p>
          </div>
        ) : items.map(r => (
          <RestriccionCard key={r.id} r={r} canEdit={canEdit}
            onEdit={(item) => { setEditing(item); setShowForm(true); }}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        ))}
      </div>

      {showForm && (
        <RestriccionForm
          initial={editing}
          frentes={frentes}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
