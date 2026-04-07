import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, User, Settings, Calendar } from 'lucide-react';

function ProyectoConfig() {
  const { canEdit } = useAuth();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/proyecto').then(r => setForm(r.data));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    await api.put('/proyecto', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!form) return <div className="p-4 text-slate-500 text-sm">Cargando...</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Settings size={18} className="text-blue-600" />
        <h3 className="font-bold text-slate-800">Configuración del Proyecto</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre del Proyecto</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Empresa</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.empresa || ''} onChange={e => set('empresa', e.target.value)} disabled={!canEdit} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
          <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
            value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} disabled={!canEdit} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Inicio</label>
            <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.fecha_inicio || ''} onChange={e => set('fecha_inicio', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Fin Contractual</label>
            <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.fecha_fin_contractual || ''} onChange={e => set('fecha_fin_contractual', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Semana Actual</label>
            <input type="number" min="1" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.semana_actual || 1} onChange={e => set('semana_actual', parseInt(e.target.value))} disabled={!canEdit} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Valor Contrato (USD)</label>
            <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.valor_contrato || 0} onChange={e => set('valor_contrato', parseFloat(e.target.value))} disabled={!canEdit} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Moneda</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.moneda || 'USD'} onChange={e => set('moneda', e.target.value)} disabled={!canEdit}>
              <option value="USD">USD</option>
              <option value="PEN">PEN (Soles)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Frentes de Trabajo</label>
            <input type="number" min="1" max="10" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              value={form.frentes_trabajo || 1} onChange={e => set('frentes_trabajo', parseInt(e.target.value))} disabled={!canEdit} />
          </div>
        </div>

        {canEdit && (
          <div className="pt-2">
            <button type="submit" className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors
              ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              <Save size={16} />
              {saved ? '¡Guardado!' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function UsuariosConfig() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nombre: '', rol: 'viewer' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = () => api.get('/auth/users').then(r => setUsers(r.data));
  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/auth/users/${editingId}`, form);
    } else {
      await api.post('/auth/users', form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ username: '', password: '', nombre: '', rol: 'viewer' });
    await fetchUsers();
  };

  const handleToggle = async (user) => {
    await api.put(`/auth/users/${user.id}`, { ...user, activo: user.activo ? 0 : 1 });
    await fetchUsers();
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center text-slate-500">
        <User size={32} className="mx-auto mb-2 text-slate-300" />
        <p>Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const rolBadge = { admin: 'bg-purple-100 text-purple-700', editor: 'bg-blue-100 text-blue-700', viewer: 'bg-slate-100 text-slate-600' };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Usuarios del Sistema</h3>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ username: '', password: '', nombre: '', rol: 'viewer' }); setShowForm(true); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
          <Plus size={14} /> Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Usuario</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Rol</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-slate-700 text-sm">{u.username}</td>
                <td className="py-3 px-4 text-slate-700 text-sm">{u.nombre}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rolBadge[u.rol] || rolBadge.viewer}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleToggle(u)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors
                      ${u.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => { setEditingId(u.id); setForm({ nombre: u.nombre, rol: u.rol, activo: u.activo, password: '' }); setShowForm(true); }}
                    className="text-xs text-blue-600 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              {!editingId && (
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Usuario *</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario" value={form.username || ''} onChange={e => set('username', e.target.value)} />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre completo *</label>
                <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}</label>
                <input type="password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password || ''} onChange={e => set('password', e.target.value)} required={!editingId} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rol</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.rol} onChange={e => set('rol', e.target.value)}>
                  <option value="viewer">Viewer — solo lectura</option>
                  <option value="editor">Editor — puede modificar</option>
                  <option value="admin">Admin — acceso total</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
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
      )}
    </div>
  );
}

export default function Configuracion() {
  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Ajustes del proyecto y gestión de accesos</p>
      </div>
      <ProyectoConfig />
      <UsuariosConfig />
    </div>
  );
}
