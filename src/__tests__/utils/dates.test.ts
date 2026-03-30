import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { formatDate, daysFromToday, daysBetween, daysUntil } from '../../utils/dates';

describe('formatDate', () => {
  it('formatea YYYY-MM-DD a dd/mm/aaaa', () => {
    expect(formatDate('2026-03-16')).toBe('16/03/2026');
  });

  it('retorna — para cadena vacía', () => {
    expect(formatDate('')).toBe('—');
  });

  it('retorna — para fecha inválida', () => {
    expect(formatDate('no-es-fecha')).toBe('—');
  });
});

describe('daysBetween', () => {
  it('calcula días positivos cuando b es posterior a a', () => {
    expect(daysBetween('2026-01-01', '2026-01-11')).toBe(10);
  });

  it('calcula días negativos cuando b es anterior a a', () => {
    expect(daysBetween('2026-01-11', '2026-01-01')).toBe(-10);
  });

  it('retorna 0 cuando las fechas son iguales', () => {
    expect(daysBetween('2026-06-15', '2026-06-15')).toBe(0);
  });
});

describe('daysFromToday', () => {
  beforeAll(() => {
    // Fija "hoy" al 30/03/2026 para que los tests sean deterministas
    vi.setSystemTime(new Date('2026-03-30T12:00:00'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('retorna positivo para fechas futuras', () => {
    expect(daysFromToday('2026-04-09')).toBe(10);
  });

  it('retorna negativo para fechas pasadas', () => {
    expect(daysFromToday('2026-03-20')).toBe(-10);
  });

  it('retorna 0 para hoy', () => {
    expect(daysFromToday('2026-03-30')).toBe(0);
  });
});

describe('daysUntil', () => {
  beforeAll(() => {
    vi.setSystemTime(new Date('2026-03-30T12:00:00'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('nunca retorna negativo — fechas pasadas devuelven 0', () => {
    expect(daysUntil('2026-03-01')).toBe(0);
  });

  it('retorna los días correctos para fechas futuras', () => {
    expect(daysUntil('2026-04-09')).toBe(10);
  });
});
