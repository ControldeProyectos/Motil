import { describe, it, expect } from 'vitest';
import { sortRestricciones, statsRestricciones, estadoMeta } from '../../utils/restricciones';
import type { Restriccion } from '../../types';

const r = (overrides: Partial<Restriccion>): Restriccion => ({
  id: crypto.randomUUID(),
  descripcion: 'Test',
  responsable: 'Ing. Test',
  fecha: '2026-04-01',
  tipo: 'critica',
  estado: 'abierta',
  obs: '',
  ...overrides,
});

describe('sortRestricciones', () => {
  it('pone las cerradas al final', () => {
    const lista = [r({ estado: 'cerrada' }), r({ estado: 'abierta' })];
    const sorted = sortRestricciones(lista);
    expect(sorted[0].estado).toBe('abierta');
    expect(sorted[1].estado).toBe('cerrada');
  });

  it('pone críticas antes que no-críticas entre abiertas', () => {
    const lista = [r({ tipo: 'no-critica', estado: 'abierta' }), r({ tipo: 'critica', estado: 'abierta' })];
    const sorted = sortRestricciones(lista);
    expect(sorted[0].tipo).toBe('critica');
  });

  it('no muta el array original', () => {
    const lista = [r({ estado: 'cerrada' }), r({ estado: 'abierta' })];
    const copia = [...lista];
    sortRestricciones(lista);
    expect(lista[0].id).toBe(copia[0].id);
  });
});

describe('statsRestricciones', () => {
  it('cuenta correctamente cada categoría', () => {
    const lista = [
      r({ tipo: 'critica',    estado: 'abierta'    }),
      r({ tipo: 'critica',    estado: 'en-proceso' }),
      r({ tipo: 'no-critica', estado: 'abierta'    }),
      r({ tipo: 'no-critica', estado: 'cerrada'    }),
      r({ tipo: 'critica',    estado: 'cerrada'    }),
    ];
    const stats = statsRestricciones(lista);
    expect(stats.criticasAbiertas).toBe(2);   // abierta + en-proceso
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
  it('retorna ok y "Cerrada" para estado cerrada', () => {
    const { label, variant } = estadoMeta('cerrada');
    expect(label).toBe('Cerrada');
    expect(variant).toBe('ok');
  });

  it('retorna warn y "En Proceso" para estado en-proceso', () => {
    const { label, variant } = estadoMeta('en-proceso');
    expect(label).toBe('En Proceso');
    expect(variant).toBe('warn');
  });

  it('retorna danger y "Abierta" para estado abierta', () => {
    const { label, variant } = estadoMeta('abierta');
    expect(label).toBe('Abierta');
    expect(variant).toBe('danger');
  });
});
