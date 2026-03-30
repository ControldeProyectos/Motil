import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Suministro, Restriccion, EstadoRestriccion } from '../types';
import type { SuministroInput } from '../schemas/suministro';
import type { RestriccionInput } from '../schemas/restriccion';
import { getAlertas } from '../utils/alerts';

// ── Tipos del store ──────────────────────────────────────────────────────────

interface AppStore {
  // Estado
  suministros:  Suministro[];
  restricciones: Restriccion[];
  diasAlerta:   number;

  // Selectores derivados
  getAlertas: () => Suministro[];
  getStatsRestricciones: () => {
    criticasAbiertas: number;
    noCriticasAbiertas: number;
    cerradas: number;
    total: number;
  };

  // Acciones — Suministros
  addSuministro:    (input: SuministroInput)   => void;
  deleteSuministro: (id: string)               => void;

  // Acciones — Restricciones
  addRestriccion:          (input: RestriccionInput)      => void;
  deleteRestriccion:       (id: string)                   => void;
  updateRestriccionEstado: (id: string, estado: EstadoRestriccion) => void;

  // Acciones — Config
  setDiasAlerta: (n: number) => void;
}

const LOCAL_PROJECT = 'local';
const NOW = () => new Date().toISOString();

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      suministros:   [],
      restricciones: [],
      diasAlerta:    15,

      // ── Selectores ────────────────────────────────────────────────────────

      getAlertas: () => getAlertas(get().suministros, get().diasAlerta),

      getStatsRestricciones: () => {
        const r = get().restricciones;
        return {
          criticasAbiertas:   r.filter(x => x.tipo === 'CRITICA'  && x.estado !== 'CERRADA').length,
          noCriticasAbiertas: r.filter(x => x.tipo !== 'CRITICA'  && x.estado !== 'CERRADA').length,
          cerradas:           r.filter(x => x.estado === 'CERRADA').length,
          total:              r.length,
        };
      },

      // ── Suministros ───────────────────────────────────────────────────────

      addSuministro: (input) =>
        set(state => ({
          suministros: [
            ...state.suministros,
            {
              ...input,
              id:         crypto.randomUUID(),
              proyectoId: LOCAL_PROJECT,
              obs:        input.obs ?? '',
              createdAt:  NOW(),
            },
          ],
        })),

      deleteSuministro: (id) =>
        set(state => ({
          suministros: state.suministros.filter(s => s.id !== id),
        })),

      // ── Restricciones ─────────────────────────────────────────────────────

      addRestriccion: (input) =>
        set(state => ({
          restricciones: [
            ...state.restricciones,
            {
              ...input,
              id:         crypto.randomUUID(),
              proyectoId: LOCAL_PROJECT,
              obs:        input.obs ?? '',
              createdAt:  NOW(),
            },
          ],
        })),

      deleteRestriccion: (id) =>
        set(state => ({
          restricciones: state.restricciones.filter(r => r.id !== id),
        })),

      updateRestriccionEstado: (id, estado) =>
        set(state => ({
          restricciones: state.restricciones.map(r =>
            r.id === id ? { ...r, estado } : r,
          ),
        })),

      // ── Config ────────────────────────────────────────────────────────────

      setDiasAlerta: (n) => set({ diasAlerta: n }),
    }),
    {
      name:    'motil_exec',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        suministros:   state.suministros,
        restricciones: state.restricciones,
        diasAlerta:    state.diasAlerta,
      }),
    },
  ),
);
