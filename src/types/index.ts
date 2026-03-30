export interface Suministro {
  id: string;
  descripcion: string;
  proveedor: string;
  fechaNecesaria: string;
  fechaLlegada: string;
  leadTime: string;
  estado: 'En proceso' | 'En tránsito' | 'En aduana' | 'Entregado' | 'Pendiente OC';
  obs: string;
}

export interface Restriccion {
  id: string;
  descripcion: string;
  responsable: string;
  fecha: string;
  tipo: 'critica' | 'no-critica';
  estado: 'abierta' | 'en-proceso' | 'cerrada';
  obs: string;
}

export interface AppState {
  suministros: Suministro[];
  restricciones: Restriccion[];
  diasAlerta: number;
}

export interface CurvaPoint {
  s: string;
  d: string;
  p: number;
  r: number | null;
}

export interface Actividad {
  sec: string;
  it: string;
  n: string;
  c: number;
  p: number;
  r: number;
  v: number;
}

export type TabId = 'resumen' | 'avance' | 'curvas' | 'suministros' | 'restricciones' | 'configuracion';
