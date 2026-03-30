import type { Suministro } from '../types';
import { daysBetween, daysFromToday } from './dates';

/**
 * Determina si un suministro debe generar alerta.
 *
 * Condiciones:
 *  1. Su estado NO es 'ENTREGADO'.
 *  2. Tiene fechas válidas.
 *  3. La fecha estimada de llegada es posterior a la fecha necesaria en obra
 *     (llegaría tarde), O bien faltan `diasAlerta` días o menos para necesitarlo.
 */
export function isAlerta(suministro: Suministro, diasAlerta: number): boolean {
  if (suministro.estado === 'ENTREGADO') return false;

  const { fechaNecesaria, fechaLlegada } = suministro;
  if (!fechaNecesaria || !fechaLlegada) return false;

  const dFnHoy  = daysFromToday(fechaNecesaria);   // días hasta que se necesita
  const desfase = daysBetween(fechaNecesaria, fechaLlegada); // positivo = llega tarde

  return desfase > 0 || dFnHoy <= diasAlerta;
}

/**
 * Filtra la lista de suministros devolviendo solo los que tienen alerta activa.
 */
export function getAlertas(
  suministros: Suministro[],
  diasAlerta: number,
): Suministro[] {
  return suministros.filter(s => isAlerta(s, diasAlerta));
}

/**
 * Describe el estado de alerta de un suministro en texto legible.
 */
export function alertaLabel(suministro: Suministro): string {
  const desfase = daysBetween(suministro.fechaNecesaria, suministro.fechaLlegada);
  const diasHastaNecesario = daysFromToday(suministro.fechaNecesaria);

  if (desfase > 0) {
    return `Llegará ${desfase} días DESPUÉS de necesitarlo en obra`;
  }
  return `Quedan ${diasHastaNecesario} días para necesitarlo`;
}
