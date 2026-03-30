import type { Suministro, Restriccion, Proyecto, Usuario } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('motil_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json();
  if (!res.ok) {
    const message = body?.error ?? body?.errors?.[0]?.message ?? 'Error desconocido';
    throw new Error(message);
  }
  return body as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user: Usuario;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<Usuario>('/auth/me'),
};

// ── Proyectos ─────────────────────────────────────────────────────────────────

export const proyectosApi = {
  list: () => request<Proyecto[]>('/proyectos'),
  get:  (id: string) => request<Proyecto>(`/proyectos/${id}`),
};

// ── Suministros ───────────────────────────────────────────────────────────────

export type SuministroInput = {
  descripcion: string;
  proveedor: string;
  fechaNecesaria: string;
  fechaLlegada: string;
  leadTimeDias?: number;
  estado?: string;
  obs?: string;
};

export const suministrosApi = {
  list: (proyectoId: string) =>
    request<Suministro[]>(`/proyectos/${proyectoId}/suministros`),

  create: (proyectoId: string, data: SuministroInput) =>
    request<Suministro>(`/proyectos/${proyectoId}/suministros`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (proyectoId: string, id: string, data: Partial<SuministroInput>) =>
    request<Suministro>(`/proyectos/${proyectoId}/suministros/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (proyectoId: string, id: string) =>
    request<void>(`/proyectos/${proyectoId}/suministros/${id}`, {
      method: 'DELETE',
    }),
};

// ── Restricciones ─────────────────────────────────────────────────────────────

export type RestriccionInput = {
  descripcion: string;
  responsable: string;
  fechaAtencion: string;
  tipo?: string;
  estado?: string;
  obs?: string;
};

export const restriccionesApi = {
  list: (proyectoId: string) =>
    request<Restriccion[]>(`/proyectos/${proyectoId}/restricciones`),

  create: (proyectoId: string, data: RestriccionInput) =>
    request<Restriccion>(`/proyectos/${proyectoId}/restricciones`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (proyectoId: string, id: string, data: Partial<RestriccionInput>) =>
    request<Restriccion>(`/proyectos/${proyectoId}/restricciones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (proyectoId: string, id: string) =>
    request<void>(`/proyectos/${proyectoId}/restricciones/${id}`, {
      method: 'DELETE',
    }),
};
