import type { Restriccion } from '../types';

/** Retorna las restricciones ordenadas: críticas abiertas primero, cerradas al final. */
export function sortRestricciones(restricciones: Restriccion[]): Restriccion[] {
  return [...restricciones].sort((a, b) => {
    // Cerradas van al fondo
    if (a.estado === 'CERRADA' && b.estado !== 'CERRADA') return 1;
    if (a.estado !== 'CERRADA' && b.estado === 'CERRADA') return -1;
    // Críticas antes que no-críticas
    return (a.tipo === 'CRITICA' ? 0 : 1) - (b.tipo === 'CRITICA' ? 0 : 1);
  });
}

/** Estadísticas rápidas sobre las restricciones. */
export function statsRestricciones(restricciones: Restriccion[]) {
  return {
    criticasAbiertas:   restricciones.filter(r => r.tipo === 'CRITICA'    && r.estado !== 'CERRADA').length,
    noCriticasAbiertas: restricciones.filter(r => r.tipo !== 'CRITICA'    && r.estado !== 'CERRADA').length,
    cerradas:           restricciones.filter(r => r.estado === 'CERRADA').length,
    total:              restricciones.length,
  };
}

/** Texto y variante de badge según el estado de la restricción. */
export function estadoMeta(estado: Restriccion['estado']): {
  label: string;
  variant: 'ok' | 'warn' | 'danger';
} {
  switch (estado) {
    case 'CERRADA':    return { label: 'Cerrada',    variant: 'ok'     };
    case 'EN_PROCESO': return { label: 'En Proceso', variant: 'warn'   };
    default:           return { label: 'Abierta',    variant: 'danger' };
  }
}
