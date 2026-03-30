import { useState } from 'react';
import type { Suministro } from '../../types';
import { ESTADO_SUMINISTRO_LABEL } from '../../types';
import type { SuministroInput } from '../../schemas/suministro';
import { suministroSchema } from '../../schemas/suministro';
import { formatDate, daysBetween } from '../../utils/dates';
import { alertaLabel } from '../../utils/alerts';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal, Field, Input, Select, Textarea, Btn, ModalFooter } from '../ui/Modal';
import {
  useSuministros,
  useCreateSuministro,
  useDeleteSuministro,
} from '../../hooks/useSuministros';
import { getAlertas } from '../../utils/alerts';

interface Props {
  proyectoId: string;
  diasAlerta: number;
}

const emptyForm = (): SuministroInput => ({
  descripcion: '', proveedor: '', fechaNecesaria: '', fechaLlegada: '',
  estado: 'EN_PROCESO', obs: '',
});

const estBadge = (est: string): 'ok' | 'info' | 'warn' | 'neutral' =>
  est === 'ENTREGADO' ? 'ok' : est === 'EN_TRANSITO' ? 'info' : est === 'EN_ADUANA' ? 'warn' : 'neutral';

export function Suministros({ proyectoId, diasAlerta }: Props) {
  const { data: suministros = [], isLoading, error } = useSuministros(proyectoId);
  const createMut = useCreateSuministro(proyectoId);
  const deleteMut = useDeleteSuministro(proyectoId);

  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof SuministroInput, string>>>({});

  const alerts = getAlertas(suministros, diasAlerta);

  const setField = (k: keyof SuministroInput, v: string | number) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm());
    setErrors({});
  };

  const handleAdd = () => {
    const result = suministroSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SuministroInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SuministroInput;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    createMut.mutate(result.data, { onSuccess: handleClose });
  };

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#4a6080' }}>Cargando suministros…</div>;
  if (error)    return <div style={{ padding: 40, textAlign: 'center', color: '#c0392b' }}>Error: {(error as Error).message}</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2b4a' }}>Seguimiento de Suministros</div>
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>
            Monitoreo automático de fechas críticas para montaje
          </div>
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
          {alerts.map(s => (
            <div key={s.id} className="animate-slide-in" style={{ background: '#fdecea', border: '1px solid #f5c6c2', borderLeft: '4px solid #c0392b', borderRadius: 8, padding: '11px 14px', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', marginBottom: 2 }}>
                  ALERTA — {s.descripcion}
                </div>
                <div style={{ fontSize: 11, color: '#4a6080' }}>
                  Proveedor: <strong>{s.proveedor}</strong> · Llegada estimada: {formatDate(s.fechaLlegada)}
                </div>
                <div style={{ fontSize: 10, color: '#b36a00', marginTop: 3, fontWeight: 600 }}>
                  {alertaLabel(s)} · Necesario en obra: {formatDate(s.fechaNecesaria)}
                </div>
              </div>
            </div>
          ))}
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
                  <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: '#4a6080', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #dde5ef' }}>
                    {h}
                  </th>
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
              ) : (suministros as Suministro[]).map((s, i) => {
                const isAlert = alerts.some(a => a.id === s.id);
                const late = daysBetween(s.fechaNecesaria, s.fechaLlegada) > 0 && s.estado !== 'ENTREGADO';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #dde5ef', background: isAlert ? '#fdecea' : undefined }}>
                    <td style={{ padding: '9px 10px', color: '#7a92a8', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1a2b4a' }}>{s.descripcion}</td>
                    <td style={{ padding: '9px 10px', color: '#4a6080' }}>{s.proveedor}</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'DM Mono,monospace' }}>{formatDate(s.fechaNecesaria)}</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'DM Mono,monospace', color: late ? '#c0392b' : '#1a2b4a', fontWeight: late ? 700 : 400 }}>
                      {formatDate(s.fechaLlegada)}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <Badge variant={estBadge(s.estado)}>{ESTADO_SUMINISTRO_LABEL[s.estado]}</Badge>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      {isAlert ? <Badge variant="danger">⚠ ALERTA</Badge> : <Badge variant="ok">✓ OK</Badge>}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <button
                        onClick={() => { if (confirm('¿Eliminar este suministro?')) deleteMut.mutate(s.id); }}
                        style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6c2', fontSize: 10, padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}
                      >
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
      <Modal open={open} onClose={handleClose} title="➕ Nuevo Suministro">
        <Field label="Descripción del Suministro" error={errors.descripcion}>
          <Input value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} placeholder="Ej: Transformador de potencia 138/33kV" />
        </Field>
        <Field label="Proveedor" error={errors.proveedor}>
          <Input value={form.proveedor} onChange={e => setField('proveedor', e.target.value)} placeholder="Nombre del proveedor" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Fecha Necesaria en Obra" error={errors.fechaNecesaria}>
            <Input type="date" value={form.fechaNecesaria} onChange={e => setField('fechaNecesaria', e.target.value)} />
          </Field>
          <Field label="Fecha Estimada de Llegada" error={errors.fechaLlegada}>
            <Input type="date" value={form.fechaLlegada} onChange={e => setField('fechaLlegada', e.target.value)} />
          </Field>
          <Field label="Lead Time (días)">
            <Input type="number" value={form.leadTimeDias ?? ''} onChange={e => setField('leadTimeDias', e.target.value ? Number(e.target.value) : '')} placeholder="60" />
          </Field>
          <Field label="Estado Actual">
            <Select value={form.estado} onChange={e => setField('estado', e.target.value as SuministroInput['estado'])}>
              <option value="EN_PROCESO">En proceso</option>
              <option value="EN_TRANSITO">En tránsito</option>
              <option value="EN_ADUANA">En aduana</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="PENDIENTE_OC">Pendiente OC</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones">
          <Textarea value={form.obs ?? ''} onChange={e => setField('obs', e.target.value)} placeholder="Notas adicionales..." />
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
