import { useState } from 'react';
import type { EstadoRestriccion } from '../../types';
import { TIPO_RESTRICCION_LABEL } from '../../types';
import type { RestriccionInput } from '../../schemas/restriccion';
import { restriccionSchema } from '../../schemas/restriccion';
import { formatDate } from '../../utils/dates';
import { sortRestricciones, statsRestricciones, estadoMeta } from '../../utils/restricciones';
import { Badge } from '../ui/Badge';
import { KpiCard } from '../ui/KpiCard';
import { Modal, Field, Input, Select, Textarea, Btn, ModalFooter } from '../ui/Modal';
import {
  useRestricciones,
  useCreateRestriccion,
  useUpdateRestriccion,
  useDeleteRestriccion,
} from '../../hooks/useRestricciones';

interface Props {
  proyectoId: string;
}

const emptyForm = (): RestriccionInput => ({
  descripcion: '', responsable: '', fechaAtencion: '', tipo: 'CRITICA', estado: 'ABIERTA', obs: '',
});

export function Restricciones({ proyectoId }: Props) {
  const { data: restricciones = [], isLoading, error } = useRestricciones(proyectoId);
  const createMut = useCreateRestriccion(proyectoId);
  const updateMut = useUpdateRestriccion(proyectoId);
  const deleteMut = useDeleteRestriccion(proyectoId);

  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof RestriccionInput, string>>>({});

  const setField = (k: keyof RestriccionInput, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm());
    setErrors({});
  };

  const handleAdd = () => {
    const result = restriccionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RestriccionInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RestriccionInput;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    createMut.mutate(result.data, { onSuccess: handleClose });
  };

  const handleUpdateEstado = (id: string, estado: EstadoRestriccion) => {
    updateMut.mutate({ id, data: { estado } });
  };

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#4a6080' }}>Cargando restricciones…</div>;
  if (error)    return <div style={{ padding: 40, textAlign: 'center', color: '#c0392b' }}>Error: {(error as Error).message}</div>;

  const stats  = statsRestricciones(restricciones);
  const sorted = sortRestricciones(restricciones);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2b4a' }}>Gestión de Restricciones</div>
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>
            Control de impedimentos técnicos, administrativos y logísticos
          </div>
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
        <KpiCard label="Críticas Abiertas"     value={stats.criticasAbiertas}   accentColor="#c0392b" valueColor="#c0392b" />
        <KpiCard label="No Críticas Abiertas"  value={stats.noCriticasAbiertas} accentColor="#b36a00" valueColor="#b36a00" />
        <KpiCard label="Cerradas"              value={stats.cerradas}           accentColor="#1a7a4a" valueColor="#1a7a4a" />
        <KpiCard label="Total Registradas"     value={stats.total} />
      </div>

      {/* Cards */}
      {restricciones.length === 0 ? (
        <div style={{ color: '#4a6080', textAlign: 'center', padding: 40, background: '#f0f4f8', borderRadius: 8, fontSize: 12 }}>
          Sin restricciones registradas. Haz clic en "+ Nueva Restricción".
        </div>
      ) : sorted.map(r => {
        const origIdx     = restricciones.findIndex(x => x.id === r.id);
        const borderColor = r.tipo === 'CRITICA' ? '#c0392b' : r.estado === 'CERRADA' ? '#1a7a4a' : '#b36a00';
        const { label, variant } = estadoMeta(r.estado);

        return (
          <div key={r.id} style={{ background: 'white', border: '1px solid #dde5ef', borderRadius: 8, padding: 13, marginBottom: 9, borderLeft: `4px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(26,43,74,.05)', opacity: r.estado === 'CERRADA' ? .8 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: '#7a92a8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  REST-{String(origIdx + 1).padStart(3, '0')} · {TIPO_RESTRICCION_LABEL[r.tipo]}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a2b4a' }}>{r.descripcion}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'flex-start' }}>
                <Badge variant={variant}>{label}</Badge>
                <button
                  onClick={() => { if (confirm('¿Eliminar esta restricción?')) deleteMut.mutate(r.id); }}
                  style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6c2', fontSize: 10, padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10.5, color: '#4a6080' }}>
                👤 Responsable: <span style={{ color: '#1a2b4a', fontWeight: 500 }}>{r.responsable || '—'}</span>
              </span>
              <span style={{ fontSize: 10.5, color: '#4a6080' }}>
                📅 Fecha atención: <span style={{ color: '#1a2b4a', fontWeight: 500 }}>{r.fechaAtencion ? formatDate(r.fechaAtencion) : '—'}</span>
              </span>
            </div>
            {r.obs && (
              <div style={{ fontSize: 10.5, color: '#4a6080', marginTop: 7, background: '#f0f4f8', padding: '6px 8px', borderRadius: 5, borderLeft: '2px solid #c5d4e4' }}>
                📝 {r.obs}
              </div>
            )}
            {r.estado !== 'CERRADA' && (
              <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
                {r.estado !== 'EN_PROCESO' && (
                  <button
                    onClick={() => handleUpdateEstado(r.id, 'EN_PROCESO')}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #dde5ef', background: '#f0f4f8', color: '#1a2b4a', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Marcar en proceso
                  </button>
                )}
                <button
                  onClick={() => handleUpdateEstado(r.id, 'CERRADA')}
                  style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#2e6da4', color: 'white', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  ✓ Cerrar restricción
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal */}
      <Modal open={open} onClose={handleClose} title="➕ Nueva Restricción">
        <Field label="Descripción de la Restricción" error={errors.descripcion}>
          <Input value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} placeholder="Ej: Falta de planos IFC para inicio de cimentaciones" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Responsable" error={errors.responsable}>
            <Input value={form.responsable} onChange={e => setField('responsable', e.target.value)} placeholder="Nombre o área" />
          </Field>
          <Field label="Fecha de Atención" error={errors.fechaAtencion}>
            <Input type="date" value={form.fechaAtencion} onChange={e => setField('fechaAtencion', e.target.value)} />
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={e => setField('tipo', e.target.value as RestriccionInput['tipo'])}>
              <option value="CRITICA">Crítica</option>
              <option value="NO_CRITICA">No Crítica</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={e => setField('estado', e.target.value as RestriccionInput['estado'])}>
              <option value="ABIERTA">Abierta</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="CERRADA">Cerrada</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones">
          <Textarea value={form.obs ?? ''} onChange={e => setField('obs', e.target.value)} placeholder="Impacto, acciones tomadas, notas..." />
        </Field>
        <ModalFooter>
          <Btn variant="secondary" onClick={handleClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleAdd} disabled={createMut.isPending}>
            {createMut.isPending ? 'Guardando…' : 'Guardar'}
          </Btn>
        </ModalFooter>
      </Modal>
    </div>
  );
}
