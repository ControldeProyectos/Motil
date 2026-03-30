import { useState, useCallback } from 'react';
import type { AppState, Suministro, Restriccion } from '../types';
import { RESTRICCIONES_DEMO } from '../data/restriccionesDemo';

const STORAGE_KEY = 'motil_exec';

const defaultState: AppState = {
  suministros: [],
  restricciones: [],
  diasAlerta: 15,
};

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaultState, restricciones: RESTRICCIONES_DEMO.map(r => ({ ...r })) };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadFromStorage);

  const persist = useCallback((next: AppState) => {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // Alerts: suministros near or past deadline
  const getAlerts = useCallback((s: AppState = state) => {
    const today = new Date();
    return s.suministros.filter(item => {
      if (item.estado === 'Entregado') return false;
      const fn = new Date(item.fechaNecesaria + 'T00:00:00');
      const fl = new Date(item.fechaLlegada + 'T00:00:00');
      if (isNaN(fn.getTime()) || isNaN(fl.getTime())) return false;
      const daysToNeed = (fn.getTime() - today.getTime()) / 86400000;
      return fl > fn || daysToNeed <= (s.diasAlerta || 15);
    });
  }, [state]);

  const addSuministro = useCallback((s: Omit<Suministro, 'id'>) => {
    const next = { ...state, suministros: [...state.suministros, { ...s, id: crypto.randomUUID() }] };
    persist(next);
  }, [state, persist]);

  const deleteSuministro = useCallback((id: string) => {
    const next = { ...state, suministros: state.suministros.filter(s => s.id !== id) };
    persist(next);
  }, [state, persist]);

  const addRestriccion = useCallback((r: Omit<Restriccion, 'id'>) => {
    const next = { ...state, restricciones: [...state.restricciones, { ...r, id: crypto.randomUUID() }] };
    persist(next);
  }, [state, persist]);

  const deleteRestriccion = useCallback((id: string) => {
    const next = { ...state, restricciones: state.restricciones.filter(r => r.id !== id) };
    persist(next);
  }, [state, persist]);

  const updateRestriccionEstado = useCallback((id: string, estado: Restriccion['estado']) => {
    const next = {
      ...state,
      restricciones: state.restricciones.map(r => r.id === id ? { ...r, estado } : r),
    };
    persist(next);
  }, [state, persist]);

  const setDiasAlerta = useCallback((n: number) => {
    persist({ ...state, diasAlerta: n });
  }, [state, persist]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'motil_estado.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [state]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        persist({ ...defaultState, ...parsed });
        alert('Datos importados correctamente.');
      } catch {
        alert('Archivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  }, [persist]);

  return {
    state,
    alerts: getAlerts(),
    addSuministro,
    deleteSuministro,
    addRestriccion,
    deleteRestriccion,
    updateRestriccionEstado,
    setDiasAlerta,
    exportJSON,
    importJSON,
  };
}
