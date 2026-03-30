import { describe, it, expect } from 'vitest';
import { restriccionSchema } from '../../schemas/restriccion';

const valid = {
  descripcion:   'Falta planos IFC para inicio de cimentaciones',
  responsable:   'Ing. Diseño',
  fechaAtencion: '2026-04-01',
  tipo:          'CRITICA' as const,
  estado:        'ABIERTA' as const,
  obs:           'Impacto directo en ruta crítica.',
};

describe('restriccionSchema', () => {
  it('acepta una restricción válida', () => {
    expect(restriccionSchema.safeParse(valid).success).toBe(true);
  });

  it('rechaza descripción con menos de 5 caracteres', () => {
    const r = restriccionSchema.safeParse({ ...valid, descripcion: 'Falt' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe('descripcion');
  });

  it('rechaza responsable vacío', () => {
    const r = restriccionSchema.safeParse({ ...valid, responsable: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza fechaAtencion vacía', () => {
    const r = restriccionSchema.safeParse({ ...valid, fechaAtencion: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza tipo fuera del enum', () => {
    const r = restriccionSchema.safeParse({ ...valid, tipo: 'urgente' });
    expect(r.success).toBe(false);
  });

  it('rechaza estado fuera del enum', () => {
    const r = restriccionSchema.safeParse({ ...valid, estado: 'pendiente' });
    expect(r.success).toBe(false);
  });

  it('acepta tipo NO_CRITICA', () => {
    const r = restriccionSchema.safeParse({ ...valid, tipo: 'NO_CRITICA' });
    expect(r.success).toBe(true);
  });

  it('acepta estado EN_PROCESO', () => {
    const r = restriccionSchema.safeParse({ ...valid, estado: 'EN_PROCESO' });
    expect(r.success).toBe(true);
  });
});
