// Enums aligned with Prisma/backend
export type EstadoSuministro =
  | 'EN_PROCESO'
  | 'EN_TRANSITO'
  | 'EN_ADUANA'
  | 'ENTREGADO'
  | 'PENDIENTE_OC';

export type TipoRestriccion = 'CRITICA' | 'NO_CRITICA';

export type EstadoRestriccion = 'ABIERTA' | 'EN_PROCESO' | 'CERRADA';

export type RolUsuario = 'ADMIN' | 'RESIDENTE' | 'SUPERVISOR' | 'VIEWER';

export interface Suministro {
  id: string;
  proyectoId: string;
  descripcion: string;
  proveedor: string;
  fechaNecesaria: string; // ISO date string from API
  fechaLlegada: string;
  leadTimeDias?: number;
  estado: EstadoSuministro;
  obs?: string;
  createdAt: string;
}

export interface Restriccion {
  id: string;
  proyectoId: string;
  descripcion: string;
  responsable: string;
  fechaAtencion: string; // ISO date string from API
  tipo: TipoRestriccion;
  estado: EstadoRestriccion;
  obs?: string;
  createdAt: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  valorContrato: number;
  fechaInicio: string;
  fechaFin: string;
  semanaActual: number;
  activo: boolean;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
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

// Display label maps
export const ESTADO_SUMINISTRO_LABEL: Record<EstadoSuministro, string> = {
  EN_PROCESO:   'En proceso',
  EN_TRANSITO:  'En tránsito',
  EN_ADUANA:    'En aduana',
  ENTREGADO:    'Entregado',
  PENDIENTE_OC: 'Pendiente OC',
};

export const TIPO_RESTRICCION_LABEL: Record<TipoRestriccion, string> = {
  CRITICA:    'Crítica',
  NO_CRITICA: 'No crítica',
};

export const ESTADO_RESTRICCION_LABEL: Record<EstadoRestriccion, string> = {
  ABIERTA:    'Abierta',
  EN_PROCESO: 'En proceso',
  CERRADA:    'Cerrada',
};
