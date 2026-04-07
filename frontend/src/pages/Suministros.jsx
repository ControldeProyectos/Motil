import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const ESTADOS = ['pendiente', 'parcial', 'completo', 'cancelado'];
const CATEGORIAS = ['acero', 'cemento', 'concreto', 'cables', 'tableros', 'equipos', 'herramientas', 'materiales', 'otro'];

function SuministroRow({ item, canEdit, isAdmin, onEdit, onDelete }) {
  const pct = item.cantidad_requerida > 0
    ? Math.min((item.cantidad_disponible / item.cantidad_requerida) * 100, 100)
    : 0;

  const estadoColor = {
    pendiente: 'bg-red-50 text-red-600',
    parcial: 'bg-amber-50 text-amber-600',
    completo: 'bg-green-50 text-green-600',
    cancelado: 'bg-slate-50 text-slate-500',
  };

  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${item.alerta ? 'bg-red-50/30' : ''}`}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {item.alerta ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" /> : <Package size={14} className="text-slate-400 flex-shrink-0" />}
          <div>
            {item.codigo && <p className="text-xs font-mono text-slate-400">{item.codigo}</p>}
            <p className="text-sm font-medium text-slate-800">{item.descripcion}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{item.categoria || '—'}</span>
      </td>
      <td className="py-3 px-4 text-center text-xs text-slate-500">{item.unidad}</td>
      <td className="py-3 px-4 text-right text-sm font-medium text-slate-700">{item.cantidad_requerida?.toLocaleString()}</td>
      <td className="py-3 px-4 text-right">
        <span className={`text-sm font-bold ${item.cantidad_disponible >= item.cantidad_requerida ? 'text-green-600' : 'text-red-600'}`}>
          {item.cantidad_disponible?.toLocaleString()}
        </span>
        <div className="mt-1 progress-bar w-20 ml-auto">
          <div className={`progress-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </td>
      <td className="py-3 px-4 text-center text-xs text-slate-500">
        {item.fecha_requerida ? new Date(item.fecha_requerida).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500">{item.proveedor || '—'}</td>
      <td className="py-3 px-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${estadoColor[item.estado] || 'bg-slate-50 text-slate-500'}`}>
          {item.estado}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        {canEdit && (
          <div className="flex gap-1 justify-end">
            <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Edit2 size={14} />
            </button>
            {isAdmin && (
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function SuministroForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || {
    codigo: '', descripcion: '', categoria: '', unidad: 'und',
    cantidad_requerida: 0, cantidad_disponible: 0,
    fecha_requerida: '', proveedor: '', estado: 'pendiente', observaciones: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">{initial ? 'Editar Suministro' : 'Nuevo Suministro'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Código</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SUM-007" value={form.codigo || ''} onChange={e => set('codigo', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Categoría</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.categoria || ''} onChange={e => set('categoria', e.target.value)}>
                <option value="">— Seleccionar —</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción *</label>
            <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del suministro" value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Unidad</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.unidad} onChange={e => set('unidad', e.target.value)}>
                {['und', 'm', 'm2', 'm3', 'kg', 'tn', 'bls', 'glb'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Cant. Requerida</label>
              <input type="number" min="0" step="0.01"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.cantidad_requerida} onChange={e => set('cantidad_requerida', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Cant. Disponible</label>
              <input type="number" min="0" step="0.01"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.cantidad_disponible} onChange={e => set('cantidad_disponible', parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Requerida</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fecha_requerida || ''} onChange={e => set('fecha_requerida', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Estado</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Proveedor</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del proveedor" value={form.proveedor || ''} onChange={e => set('proveedor', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Observaciones</label>
            <textarea rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} />
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

export default function Suministros() {
  const { canEdit, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const params = filtroEstado ? `?estado=${filtroEstado}` : '';
    const r = await api.get(`/suministros${params}`);
    setItems(r.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filtroEstado]);

  const handleSave = async (form) => {
    if (editing) await api.put(`/suministros/${editing.id}`, form);
    else await api.post('/suministros', form);
    setEditing(null);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este suministro?')) return;
    await api.delete(`/suministros/${id}`);
    await fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const alertas = items.filter(i => i.alerta).length;
  const completos = items.filter(i => i.estado === 'completo').length;
  const pendientes = items.filter(i => i.estado === 'pendiente').length;

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suministros</h1>
          <p className="text-slate-500 text-sm mt-1">Control de materiales y equipos del proyecto</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nuevo Suministro
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-slate-700">{items.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase">Total ítems</p>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm text-center ${alertas > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-3xl font-bold ${alertas > 0 ? 'text-amber-600' : 'text-green-600'}`}>{alertas}</p>
          <p className={`text-xs mt-1 font-medium uppercase ${alertas > 0 ? 'text-amber-500' : 'text-green-500'}`}>Alertas</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-red-600">{pendientes}</p>
          <p className="text-xs text-red-500 mt-1 font-medium uppercase">Pendientes</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{completos}</p>
          <p className="text-xs text-green-500 mt-1 font-medium uppercase">Completos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-slate-500 self-center">{items.length} ítem{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Und</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Requerido</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Disponible</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">F. Requerida</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-slate-500">No hay suministros registrados</td></tr>
              ) : items.map(item => (
                <SuministroRow key={item.id} item={item} canEdit={canEdit} isAdmin={isAdmin}
                  onEdit={(i) => { setEditing(i); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <SuministroForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
