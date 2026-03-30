/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato dd/mm/aaaa en español (Perú).
 * Retorna '—' si la cadena está vacía o es inválida.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calcula los días enteros entre hoy y una fecha futura.
 * Valores negativos indican días pasados.
 */
export function daysFromToday(isoDate: string): number {
  const target = new Date(isoDate + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Calcula los días enteros entre dos fechas ISO.
 * Positivo → b es posterior a a. Negativo → b es anterior a a.
 */
export function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA + 'T00:00:00');
  const b = new Date(isoB + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Días restantes desde hoy hasta una fecha objetivo.
 * Nunca retorna un valor menor a 0.
 */
export function daysUntil(isoDate: string): number {
  return Math.max(0, daysFromToday(isoDate));
}
