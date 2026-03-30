import { describe, it, expect } from 'vitest';
import { sortRestricciones, statsRestricciones, estadoMeta } from '../../utils/restricciones';
import type { Restriccion } from '../../types';

const r = (overrides: Partial<Restriccion>): Restriccion => ({
  id:          crypto.randomUUID(),
  proyectoId:  'test',
  descripcion: 'Test',
  responsable: 'Ing. Test',
  fechaAtencion: '2026-04-01',
  tipo:        'CRITICA',
  estado:      'ABIERTA',
  obs:         '',
  createdAt:   '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('sortRestricciones', () => {
  it('pone las cerradas al final', () => {
    const lista = [r({ estado: 'CERRADA' }), r({ estado: 'ABIERTA' })];
    const sorted = sortRestricciones(lista);
    expect(sorted[0].estado).toBe('ABIERTA');
    expect(sorted[1].estado).toBe('CERRADA');
  });

  it('pone críticas antes que no-críticas entre abiertas', () => {
    const lista = [r({ tipo: 'NO_CRITICA', estado: 'ABIERTA' }), r({ tipo: 'CRITICA', estado: 'ABIERTA' })];
    const sorted = sortRestricciones(lista);
    expect(sorted[0].tipo).toBe('CRITICA');
  });

  it('no muta el array original', () => {
    const lista = [r({ estado: 'CERRADA' }), r({ estado: 'ABIERTA' })];
    const copia = [...lista];
    sortRestricciones(lista);
    expect(lista[0].id).toBe(copia[0].id);
  });
});

describe('statsRestricciones', () => {
  it('cuenta correctamente cada categoría', () => {
    const lista = [
      r({ tipo: 'CRITICA',    estado: 'ABIERTA'    }),
      r({ tipo: 'CRITICA',    estado: 'EN_PROCESO' }),
      r({ tipo: 'NO_CRITICA', estado: 'ABIERTA'    }),
      r({ tipo: 'NO_CRITICA', estado: 'CERRADA'    }),
      r({ tipo: 'CRITICA',    estado: 'CERRADA'    }),
    ];
    const stats = statsRestricciones(lista);
    expect(stats.criticasAbiertas).toBe(2);   // ABIERTA + EN_PROCESO
    expect(stats.noCriticasAbiertas).toBe(1);
    expect(stats.cerradas).toBe(2);
    expect(stats.total).toBe(5);
  });

  it('retorna ceros para lista vacía', () => {
    const stats = statsRestricciones([]);
    expect(stats.total).toBe(0);
    expect(stats.criticasAbiertas).toBe(0);
  });
});

describe('estadoMeta', () => {
  it('retorna ok y "Cerrada" para estado CERRADA', () => {
    const { label, variant } = estadoMeta('CERRADA');
    expect(label).toBe('Cerrada');
    expect(variant).toBe('ok');
  });

  it('retorna warn y "En Proceso" para estado EN_PROCESO', () => {
    const { label, variant } = estadoMeta('EN_PROCESO');
    expect(label).toBe('En Proceso');
    expect(variant).toBe('warn');
  });

  it('retorna danger y "Abierta" para estado ABIERTA', () => {
    const { label, variant } = estadoMeta('ABIERTA');
    expect(label).toBe('Abierta');
    expect(variant).toBe('danger');
  });
});
