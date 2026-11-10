import { describe, expect, it } from 'vitest';
import { avancarParcelas, encargo, mesDeTermino, restantes, serieAlivio, textoAlivio } from './parcelas';
import { parcelamento } from '../testes/fabrica';

const p1 = parcelamento({ valorParcela: 5000, parcelaAtual: 9, totalParcelas: 10 });
const p2 = parcelamento({ valorParcela: 3000, parcelaAtual: 2, totalParcelas: 6 });

describe('parcelas', () => {
  it('restantes, término e encargo', () => {
    expect(restantes(p1)).toBe(1);
    expect(mesDeTermino(p1, '2026-11')).toBe('2026-12');
    expect(encargo([p1, p2], 0)).toBe(8000);
    expect(encargo([p1, p2], 2)).toBe(3000);
    const s = serieAlivio([p1, p2], '2026-11');
    expect(s.map((x) => x.valor)).toEqual([8000, 8000, 3000, 3000, 3000, 0]);
    expect(s[0].mes).toBe('2026-11');
  });

  it('texto de alívio', () => {
    expect(textoAlivio([p1, p2], '2026-11'))
      .toBe('Em janeiro, as parcelas caem de R$ 80,00 para R$ 30,00 (−R$ 50,00/mês)');
    expect(textoAlivio([parcelamento({ parcelaAtual: 1, totalParcelas: 12 })], '2026-11'))
      .toBe('Nenhuma parcela termina nos próximos 6 meses');
    expect(textoAlivio([], '2026-11')).toBeNull();
  });

  it('avançar parcelas remove as terminadas', () => {
    expect(avancarParcelas([p1, p2], 1)).toEqual([{ ...p1, parcelaAtual: 10 }, { ...p2, parcelaAtual: 3 }]);
    expect(avancarParcelas([p1, p2], 2)).toEqual([{ ...p2, parcelaAtual: 4 }]);
  });
});
