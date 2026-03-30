import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { isAlerta, getAlertas } from '../../utils/alerts';
import type { Suministro } from '../../types';

// Hoy fijado al 30/03/2026
const HOY = '2026-03-30T12:00:00';

const base: Suministro = {
  id:            '1',
  proyectoId:    'test',
  descripcion:   'Transformador 138/33kV',
  proveedor:     'Siemens',
  fechaNecesaria: '2026-04-20',   // necesario en 21 días
  fechaLlegada:   '2026-04-15',   // llega 5 días antes → OK
  leadTimeDias:  90,
  estado:        'EN_PROCESO',
  obs:           '',
  createdAt:     '2026-01-01T00:00:00.000Z',
};

describe('isAlerta', () => {
  beforeAll(() => vi.setSystemTime(new Date(HOY)));
  afterAll(()  => vi.useRealTimers());

  it('NO genera alerta cuando el suministro llega a tiempo y queda margen suficiente', () => {
    expect(isAlerta(base, 15)).toBe(false);
  });

  it('genera alerta cuando la llegada es posterior a la fecha necesaria', () => {
    const tarde: Suministro = { ...base, fechaLlegada: '2026-04-25' }; // llega 5 días tarde
    expect(isAlerta(tarde, 15)).toBe(true);
  });

  it('genera alerta cuando quedan ≤ diasAlerta días para necesitarlo', () => {
    const urgente: Suministro = { ...base, fechaNecesaria: '2026-04-05' }; // en 6 días
    expect(isAlerta(urgente, 15)).toBe(true);
  });

  it('NO genera alerta si el estado es ENTREGADO, sin importar las fechas', () => {
    const entregado: Suministro = { ...base, estado: 'ENTREGADO', fechaLlegada: '2026-05-01' };
    expect(isAlerta(entregado, 15)).toBe(false);
  });

  it('NO genera alerta si las fechas están vacías', () => {
    const sinFechas: Suministro = { ...base, fechaNecesaria: '', fechaLlegada: '' };
    expect(isAlerta(sinFechas, 15)).toBe(false);
  });
});

describe('getAlertas', () => {
  beforeAll(() => vi.setSystemTime(new Date(HOY)));
  afterAll(()  => vi.useRealTimers());

  it('retorna solo los suministros que tienen alerta', () => {
    const tarde:  Suministro = { ...base, id: '2', fechaLlegada: '2026-04-25' };
    const result = getAlertas([base, tarde], 15);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('retorna array vacío si no hay alertas', () => {
    expect(getAlertas([base], 15)).toHaveLength(0);
  });

  it('retorna array vacío para lista vacía', () => {
    expect(getAlertas([], 15)).toHaveLength(0);
  });
});
