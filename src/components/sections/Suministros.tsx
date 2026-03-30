import { useState } from 'react';
import type { Suministro } from '../../types';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal, Field, Input, Select, Textarea, Btn, ModalFooter } from '../ui/Modal';

function fd(ds: string) {
  if (!ds) return '—';
  const d = new Date(ds + 'T00:00:00');
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Props {
  suministros: Suministro[];
  alerts: Suministro[];
  onAdd: (s: Omit<Suministro, 'id'>) => void;
  onDelete: (id: string) => void;
}

const empty = (): Omit<Suministro, 'id'> => ({
  descripcion: '', proveedor: '', fechaNecesaria: '', fechaLlegada: '',
  leadTime: '', estado: 'En proceso', obs: '',
});

export function Suministros({ suministros, alerts, onAdd, onDelete }: Props) {
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

  const estBadge = (est: string): 'ok' | 'info' | 'warn' | 'neutral' =>
    est === 'Entregado' ? 'ok' : est === 'En tránsito' ? 'info' : est === 'En aduana' ? 'warn' : 'neutral';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2b4a' }}>Seguimiento de Suministros</div>
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>Monitoreo automático de fechas críticas para montaje</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, background: '#2e6da4', color: 'white', fontSize: 11, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', border: 'none' }}
        >
          + Nuevo Suministro
        </button>
      </div>

      {/* Alert banners */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {alerts.map(s => {
            const fn = new Date(s.fechaNecesaria + 'T00:00:00');
            const fl = new Date(s.fechaLlegada + 'T00:00:00');
            const diff = Math.round((fn.getTime() - fl.getTime()) / 86400000);
            const dias = Math.round((fn.getTime() - Date.now()) / 86400000);
            return (
              <div key={s.id} className="animate-slide-in" style={{ background: '#fdecea', border: '1px solid #f5c6c2', borderLeft: '4px solid #c0392b', borderRadius: 8, padding: '11px 14px', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', marginBottom: 2 }}>ALERTA — {s.descripcion}</div>
                  <div style={{ fontSize: 11, color: '#4a6080' }}>Proveedor: <strong>{s.proveedor}</strong> · Llegada estimada: {fd(s.fechaLlegada)}</div>
                  <div style={{ fontSize: 10, color: '#b36a00', marginTop: 3, fontWeight: 600 }}>
                    {diff < 0 ? `Llegará ${Math.abs(diff)} días DESPUÉS de necesitarlo en obra` : `Quedan ${dias} días para necesitarlo`} · Necesario en obra: {fd(s.fechaNecesaria)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardTitle>Registro de Suministros</CardTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f7f9fc' }}>
                {['#', 'Descripción', 'Proveedor', 'Nec. en Obra', 'Est. Llegada', 'Estado', 'Alerta', ''].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #dde5ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suministros.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#4a6080', padding: 28, background: '#f0f4f8' }}>
                    Sin suministros registrados. Agrega con "+ Nuevo Suministro".
                  </td>
                </tr>
              ) : suministros.map((s, i) => {
                const isAlert = alerts.some(a => a.id === s.id);
                const fn = new Date(s.fechaNecesaria + 'T00:00:00');
                const fl = new Date(s.fechaLlegada + 'T00:00:00');
                const late = fl > fn && s.estado !== 'Entregado';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #dde5ef', background: isAlert ? '#fdecea' : undefined }}>
                    <td style={{ padding: '9px 10px', color: '#7a92a8', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1a2b4a' }}>{s.descripcion}</td>
                    <td style={{ padding: '9px 10px', color: '#4a6080' }}>{s.proveedor}</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'DM Mono,monospace' }}>{fd(s.fechaNecesaria)}</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'DM Mono,monospace', color: late ? '#c0392b' : '#1a2b4a', fontWeight: late ? 700 : 400 }}>{fd(s.fechaLlegada)}</td>
                    <td style={{ padding: '9px 10px' }}><Badge variant={estBadge(s.estado)}>{s.estado}</Badge></td>
                    <td style={{ padding: '9px 10px' }}>
                      {isAlert ? <Badge variant="danger">⚠ ALERTA</Badge> : <Badge variant="ok">✓ OK</Badge>}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <button onClick={() => { if (confirm('¿Eliminar este suministro?')) onDelete(s.id); }}
                        style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6c2', fontSize: 10, padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setError(''); setForm(empty()); }} title="➕ Nuevo Suministro">
        {error && <div style={{ background: '#fdecea', color: '#c0392b', padding: '8px 12px', borderRadius: 7, fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <Field label="Descripción del Suministro">
          <Input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Ej: Transformador de potencia 138/33kV" />
        </Field>
        <Field label="Proveedor">
          <Input value={form.proveedor} onChange={e => set('proveedor', e.target.value)} placeholder="Nombre del proveedor" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Fecha Necesaria en Obra">
            <Input type="date" value={form.fechaNecesaria} onChange={e => set('fechaNecesaria', e.target.value)} />
          </Field>
          <Field label="Fecha Estimada de Llegada">
            <Input type="date" value={form.fechaLlegada} onChange={e => set('fechaLlegada', e.target.value)} />
          </Field>
          <Field label="Lead Time (días)">
            <Input type="number" value={form.leadTime} onChange={e => set('leadTime', e.target.value)} placeholder="60" />
          </Field>
          <Field label="Estado Actual">
            <Select value={form.estado} onChange={e => set('estado', e.target.value as any)}>
              <option>En proceso</option>
              <option>En tránsito</option>
              <option>En aduana</option>
              <option>Entregado</option>
              <option>Pendiente OC</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones">
          <Textarea value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Notas adicionales..." />
        </Field>
        <ModalFooter>
          <Btn variant="secondary" onClick={() => { setOpen(false); setError(''); setForm(empty()); }}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleAdd}>Guardar</Btn>
        </ModalFooter>
      </Modal>
    </div>
  );
}
