import { describe, expect, it } from 'vitest';
import { centavosDeDigitos, formatarReais } from './dinheiro';

describe('dinheiro', () => {
  it('formata reais com espaço normal', () => {
    expect(formatarReais(123456)).toBe('R$ 1.234,56');
    expect(formatarReais(-5000)).toBe('-R$ 50,00');
    expect(formatarReais(0)).toBe('R$ 0,00');
  });

  it('máscara de centavos usa só dígitos e limita a 12', () => {
    expect(centavosDeDigitos('1234')).toBe(1234);
    expect(centavosDeDigitos('R$ 1.234,56')).toBe(123456);
    expect(centavosDeDigitos('')).toBe(0);
    expect(centavosDeDigitos('1234567890123')).toBe(123456789012);
  });
});
