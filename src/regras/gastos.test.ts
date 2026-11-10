import { describe, expect, it } from 'vitest';
import { avisoGastoForaDoMes, gastosAguardandoFechamento, totaisPorCategoria, validarDataGasto } from './gastos';
import { criarEstado, gasto, mesFechado } from '../testes/fabrica';

describe('gastos por categoria', () => {
  it('totais, percentual, variação e categoria órfã', () => {
    const e = criarEstado({
      gastos: [
        gasto({ valor: 30000 }), gasto({ valor: 10000 }), gasto({ categoriaId: 'lazer', valor: 10000 }),
        gasto({ categoriaId: 'apagada', valor: 5000 }), gasto({ valor: 99999, data: '2026-10-31' }),
      ],
      historico: [mesFechado({ mes: '2026-10', gastosPorCategoria: [{ categoriaId: 'mercado', nome: 'Mercado', total: 50000 }] })],
    });
    const t = totaisPorCategoria(e, '2026-11');
    expect(t.map((x) => [x.categoriaId, x.total])).toEqual([['mercado', 40000], ['lazer', 10000], ['outros', 5000]]);
    expect(t[0].percentual).toBeCloseTo(72.7, 1);
    expect(t[0].variacao).toBe(-20);
    expect(t[1].variacao).toBeNull();
  });

  it('gastos de depois do mês aberto aguardam o fechamento, com aviso ao salvar', () => {
    const e = criarEstado({
      gastos: [gasto({ id: 'n', data: '2026-11-30' }), gasto({ id: 'd1', data: '2026-12-01' }), gasto({ id: 'd2', data: '2026-12-02' })],
    });
    expect(gastosAguardandoFechamento(e).map((g) => g.id)).toEqual(['d1', 'd2']);
    expect(avisoGastoForaDoMes('2026-12-01', '2026-11'))
      .toBe('Gasto salvo. Ele aparece em dezembro, depois que você fechar novembro.');
    expect(avisoGastoForaDoMes('2026-11-30', '2026-11')).toBeNull();
  });

  it('data do gasto: do 1º dia do mês aberto até hoje', () => {
    expect(validarDataGasto('2026-11-01', '2026-11', '2026-11-10')).toBe(true);
    expect(validarDataGasto('2026-10-31', '2026-11', '2026-11-10')).toBe(false);
    expect(validarDataGasto('2026-11-11', '2026-11', '2026-11-10')).toBe(false);
    expect(validarDataGasto('2026-12-02', '2026-11', '2026-12-03')).toBe(true);
  });
});
