import { describe, it, expect } from 'vitest';
import { suministroSchema } from '../../schemas/suministro';

const valid = {
  descripcion:    'Transformador de potencia 138/33kV',
  proveedor:      'Siemens',
  fechaNecesaria: '2026-06-01',
  fechaLlegada:   '2026-05-20',
  leadTimeDias:   90,
  estado:         'EN_PROCESO' as const,
  obs:            '',
};

describe('suministroSchema', () => {
  it('acepta un suministro válido', () => {
    expect(suministroSchema.safeParse(valid).success).toBe(true);
  });

  it('rechaza descripción vacía', () => {
    const r = suministroSchema.safeParse({ ...valid, descripcion: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza descripción con menos de 3 caracteres', () => {
    const r = suministroSchema.safeParse({ ...valid, descripcion: 'AB' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path[0]).toBe('descripcion');
    }
  });

  it('rechaza proveedor vacío', () => {
    const r = suministroSchema.safeParse({ ...valid, proveedor: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza fechaNecesaria vacía', () => {
    const r = suministroSchema.safeParse({ ...valid, fechaNecesaria: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza fecha con formato inválido', () => {
    const r = suministroSchema.safeParse({ ...valid, fechaLlegada: '20/06/2026' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path[0]).toBe('fechaLlegada');
    }
  });

  it('rechaza estado fuera del enum', () => {
    const r = suministroSchema.safeParse({ ...valid, estado: 'Inventado' });
    expect(r.success).toBe(false);
  });

  it('obs es opcional y tiene valor por defecto vacío', () => {
    const { obs: _obs, ...sinObs } = valid;
    const r = suministroSchema.safeParse(sinObs);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.obs).toBe('');
  });
});
