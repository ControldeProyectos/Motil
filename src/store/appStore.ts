import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Suministro, Restriccion } from '../types';
import type { SuministroInput } from '../schemas/suministro';
import type { RestriccionInput } from '../schemas/restriccion';
import { getAlertas } from '../utils/alerts';
import { RESTRICCIONES_DEMO } from '../data/restriccionesDemo';

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
  deleteSuministro: (id: string)                => void;

  // Acciones — Restricciones
  addRestriccion:          (input: RestriccionInput)              => void;
  deleteRestriccion:       (id: string)                           => void;
  updateRestriccionEstado: (id: string, estado: Restriccion['estado']) => void;

  // Acciones — Config
  setDiasAlerta: (n: number) => void;

  // Import / Export
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      suministros:   [],
      restricciones: RESTRICCIONES_DEMO.map(r => ({ ...r })),
      diasAlerta:    15,

      // ── Selectores ────────────────────────────────────────────────────────

      getAlertas: () => getAlertas(get().suministros, get().diasAlerta),

      getStatsRestricciones: () => {
        const r = get().restricciones;
        return {
          criticasAbiertas:   r.filter(x => x.tipo === 'critica'  && x.estado !== 'cerrada').length,
          noCriticasAbiertas: r.filter(x => x.tipo !== 'critica'  && x.estado !== 'cerrada').length,
          cerradas:           r.filter(x => x.estado === 'cerrada').length,
          total:              r.length,
        };
      },

      // ── Suministros ───────────────────────────────────────────────────────

      addSuministro: (input) =>
        set(state => ({
          suministros: [
            ...state.suministros,
            { ...input, id: crypto.randomUUID(), obs: input.obs ?? '' },
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
            { ...input, id: crypto.randomUUID(), obs: input.obs ?? '' },
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

      // ── Import / Export ───────────────────────────────────────────────────

      exportJSON: () => {
        const { suministros, restricciones, diasAlerta } = get();
        const payload = JSON.stringify({ suministros, restricciones, diasAlerta }, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), {
          href:     url,
          download: 'motil_estado.json',
        });
        a.click();
        URL.revokeObjectURL(url);
      },

      importJSON: (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const parsed = JSON.parse(e.target?.result as string) as Partial<AppStore>;
              set({
                suministros:   Array.isArray(parsed.suministros)   ? parsed.suministros   : get().suministros,
                restricciones: Array.isArray(parsed.restricciones) ? parsed.restricciones : get().restricciones,
                diasAlerta:    typeof parsed.diasAlerta === 'number' ? parsed.diasAlerta  : get().diasAlerta,
              });
              resolve();
            } catch {
              reject(new Error('Archivo JSON inválido'));
            }
          };
          reader.onerror = () => reject(new Error('Error al leer el archivo'));
          reader.readAsText(file);
        }),
    }),
    {
      name:    'motil_exec',          // clave en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persiste estos campos, no las funciones
      partialize: (state) => ({
        suministros:   state.suministros,
        restricciones: state.restricciones,
        diasAlerta:    state.diasAlerta,
      }),
    },
  ),
);
