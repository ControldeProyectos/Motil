import { useState } from 'react';
import type { Restriccion } from '../../types';
import { Badge } from '../ui/Badge';
import { KpiCard } from '../ui/KpiCard';
import { Modal, Field, Input, Select, Textarea, Btn, ModalFooter } from '../ui/Modal';


function fd(ds: string) {
  if (!ds) return '—';
  const d = new Date(ds + 'T00:00:00');
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Props {
  restricciones: Restriccion[];
  onAdd: (r: Omit<Restriccion, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdateEstado: (id: string, estado: Restriccion['estado']) => void;
}

const empty = (): Omit<Restriccion, 'id'> => ({
  descripcion: '', responsable: '', fecha: '', tipo: 'critica', estado: 'abierta', obs: '',
});

export function Restricciones({ restricciones, onAdd, onDelete, onUpdateEstado }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty());
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.descripcion.trim()) { setError('Ingresa una descripción'); return; }
    onAdd(form);
    setOpen(false);
    setForm(empty());
    setError('');
  };

  const crit = restricciones.filter(r => r.tipo === 'critica' && r.estado !== 'cerrada').length;
  const nc = restricciones.filter(r => r.tipo !== 'critica' && r.estado !== 'cerrada').length;
  const cerr = restricciones.filter(r => r.estado === 'cerrada').length;

  const sorted = [...restricciones].sort((a, b) => {
    if (a.estado === 'cerrada' && b.estado !== 'cerrada') return 1;
    if (a.estado !== 'cerrada' && b.estado === 'cerrada') return -1;
    return (a.tipo === 'critica' ? 0 : 1) - (b.tipo === 'critica' ? 0 : 1);
  });

  const estadoBadge = (est: Restriccion['estado']) =>
    est === 'cerrada' ? 'ok' : est === 'en-proceso' ? 'warn' : 'danger';
  const estadoLabel = (est: Restriccion['estado']) =>
    est === 'cerrada' ? 'Cerrada' : est === 'en-proceso' ? 'En Proceso' : 'Abierta';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2b4a' }}>Gestión de Restricciones</div>
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>Control de impedimentos técnicos, administrativos y logísticos</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, background: '#2e6da4', color: 'white', fontSize: 11, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', border: 'none' }}
        >
          + Nueva Restricción
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        <KpiCard label="Críticas Abiertas" value={crit} accentColor="#c0392b" valueColor="#c0392b" />
        <KpiCard label="No Críticas Abiertas" value={nc} accentColor="#b36a00" valueColor="#b36a00" />
        <KpiCard label="Cerradas" value={cerr} accentColor="#1a7a4a" valueColor="#1a7a4a" />
        <KpiCard label="Total Registradas" value={restricciones.length} />
      </div>

      {/* Cards */}
      {restricciones.length === 0 ? (
        <div style={{ color: '#4a6080', textAlign: 'center', padding: 40, background: '#f0f4f8', borderRadius: 8, fontSize: 12 }}>
          Sin restricciones registradas. Haz clic en "+ Nueva Restricción".
        </div>
      ) : (
        sorted.map((r) => {
          const origIdx = restricciones.findIndex(x => x.id === r.id);
          const borderColor = r.tipo === 'critica' ? '#c0392b' : r.estado === 'cerrada' ? '#1a7a4a' : '#b36a00';
          return (
            <div key={r.id} style={{
              background: 'white', border: '1px solid #dde5ef', borderRadius: 8, padding: 13, marginBottom: 9,
              borderLeft: `4px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(26,43,74,.05)',
              opacity: r.estado === 'cerrada' ? .8 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#7a92a8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    REST-{String(origIdx + 1).padStart(3, '0')} · {r.tipo === 'critica' ? '🔴 CRÍTICA' : '🟡 NO CRÍTICA'}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a2b4a' }}>{r.descripcion}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'flex-start' }}>
                  <Badge variant={estadoBadge(r.estado)}>{estadoLabel(r.estado)}</Badge>
                  <button onClick={() => { if (confirm('¿Eliminar esta restricción?')) onDelete(r.id); }}
                    style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6c2', fontSize: 10, padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}>
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, color: '#4a6080' }}>👤 Responsable: <span style={{ color: '#1a2b4a', fontWeight: 500 }}>{r.responsable || '—'}</span></span>
                <span style={{ fontSize: 10.5, color: '#4a6080' }}>📅 Fecha atención: <span style={{ color: '#1a2b4a', fontWeight: 500 }}>{r.fecha ? fd(r.fecha) : '—'}</span></span>
              </div>
              {r.obs && (
                <div style={{ fontSize: 10.5, color: '#4a6080', marginTop: 7, background: '#f0f4f8', padding: '6px 8px', borderRadius: 5, borderLeft: '2px solid #c5d4e4' }}>
                  📝 {r.obs}
                </div>
              )}
              {r.estado !== 'cerrada' && (
                <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
                  {r.estado !== 'en-proceso' && (
                    <button onClick={() => onUpdateEstado(r.id, 'en-proceso')}
                      style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #dde5ef', background: '#f0f4f8', color: '#1a2b4a', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Marcar en proceso
                    </button>
                  )}
                  <button onClick={() => onUpdateEstado(r.id, 'cerrada')}
                    style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#2e6da4', color: 'white', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Cerrar restricción
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setError(''); setForm(empty()); }} title="➕ Nueva Restricción">
        {error && <div style={{ background: '#fdecea', color: '#c0392b', padding: '8px 12px', borderRadius: 7, fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <Field label="Descripción de la Restricción">
          <Input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Ej: Falta de planos IFC para inicio de cimentaciones" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Responsable">
            <Input value={form.responsable} onChange={e => set('responsable', e.target.value)} placeholder="Nombre o área" />
          </Field>
          <Field label="Fecha de Atención">
            <Input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={e => set('tipo', e.target.value as any)}>
              <option value="critica">Crítica</option>
              <option value="no-critica">No Crítica</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={e => set('estado', e.target.value as any)}>
              <option value="abierta">Abierta</option>
              <option value="en-proceso">En Proceso</option>
              <option value="cerrada">Cerrada</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones">
          <Textarea value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Impacto, acciones tomadas, notas..." />
        </Field>
        <ModalFooter>
          <Btn variant="secondary" onClick={() => { setOpen(false); setError(''); setForm(empty()); }}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleAdd}>Guardar</Btn>
        </ModalFooter>
      </Modal>
    </div>
  );
}
