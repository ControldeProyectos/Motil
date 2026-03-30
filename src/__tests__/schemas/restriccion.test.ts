import { describe, it, expect } from 'vitest';
import { restriccionSchema } from '../../schemas/restriccion';

const valid = {
  descripcion: 'Falta planos IFC para inicio de cimentaciones',
  responsable: 'Ing. Diseño',
  fecha:       '2026-04-01',
  tipo:        'critica' as const,
  estado:      'abierta' as const,
  obs:         'Impacto directo en ruta crítica.',
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

  it('rechaza fecha vacía', () => {
    const r = restriccionSchema.safeParse({ ...valid, fecha: '' });
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

  it('acepta tipo no-critica', () => {
    const r = restriccionSchema.safeParse({ ...valid, tipo: 'no-critica' });
    expect(r.success).toBe(true);
  });

  it('acepta estado en-proceso', () => {
    const r = restriccionSchema.safeParse({ ...valid, estado: 'en-proceso' });
    expect(r.success).toBe(true);
  });
});
