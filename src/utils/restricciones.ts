import type { Restriccion } from '../types';

/** Retorna las restricciones ordenadas: críticas abiertas primero, cerradas al final. */
export function sortRestricciones(restricciones: Restriccion[]): Restriccion[] {
  return [...restricciones].sort((a, b) => {
    // Cerradas van al fondo
    if (a.estado === 'cerrada' && b.estado !== 'cerrada') return 1;
    if (a.estado !== 'cerrada' && b.estado === 'cerrada') return -1;
    // Críticas antes que no-críticas
    return (a.tipo === 'critica' ? 0 : 1) - (b.tipo === 'critica' ? 0 : 1);
  });
}

/** Estadísticas rápidas sobre las restricciones. */
export function statsRestricciones(restricciones: Restriccion[]) {
  return {
    criticasAbiertas:   restricciones.filter(r => r.tipo === 'critica'    && r.estado !== 'cerrada').length,
    noCriticasAbiertas: restricciones.filter(r => r.tipo !== 'critica'    && r.estado !== 'cerrada').length,
    cerradas:           restricciones.filter(r => r.estado === 'cerrada').length,
    total:              restricciones.length,
  };
}

/** Texto y variante de badge según el estado de la restricción. */
export function estadoMeta(estado: Restriccion['estado']): {
  label: string;
  variant: 'ok' | 'warn' | 'danger';
} {
  switch (estado) {
    case 'cerrada':    return { label: 'Cerrada',    variant: 'ok'     };
    case 'en-proceso': return { label: 'En Proceso', variant: 'warn'   };
    default:           return { label: 'Abierta',    variant: 'danger' };
  }
}
