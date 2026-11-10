import { describe, expect, it } from 'vitest';
import { desfazerFechamento, fecharMes, pendencias, precisaFechar, resumoFechamento } from './fechamento';
import { aplicacao, aporte, conta, criarEstado, gasto, parcelamento, renda } from '../testes/fabrica';

const e = criarEstado({
  rendas: [renda({ valor: 300000, recebidaEm: '2026-11-05' })],
  contas: [conta({ dia: 5, valor: 80000, pagaEm: '2026-11-05' }), conta({ dia: 20, valor: 20000 })],
  aportes: [aporte({ valor: 10000, feitoEm: '2026-11-02' })],
  aplicacoes: [aplicacao({ saldo: 50000 })],
  parcelamentos: [parcelamento({ parcelaAtual: 2, totalParcelas: 3 }), parcelamento({ parcelaAtual: 3, totalParcelas: 3 })],
  gastos: [gasto({ data: '2026-11-03', valor: 4000 }), gasto({ data: '2026-12-01', valor: 1000 })],
  recompensaDispensadaEm: '2026-11',
});

describe('virada do mês', () => {
  it('quando fechar e pendências', () => {
    expect(precisaFechar(e, '2026-11-30')).toBe(false);
    expect(precisaFechar(e, '2026-12-01')).toBe(true);
    expect(pendencias(e)).toEqual({ rendas: [], contas: [e.contas[1]], aportes: [] });
  });

  it('fecha um mês', () => {
    const f = fecharMes(e, '2026-12-01');
    expect(f.mesAberto).toBe('2026-12');
    expect(f.historico[0]).toMatchObject({
      mes: '2026-11', semRegistro: false, renda: 300000, contasPagas: 80000,
      caixaOperacional: 50000, sobra: 30000, recompensaSugerida: 15000,
      score: { total: 85, aportes: 40, contasEmDia: 15, mesNoAzul: 30 },
      gastosPorCategoria: [{ categoriaId: 'mercado', nome: 'Mercado', total: 4000 }],
    });
    expect(f.contas.every((c) => c.pagaEm === null) && f.rendas[0].recebidaEm === null && f.aportes[0].feitoEm === null).toBe(true);
    expect(f.parcelamentos).toEqual([{ ...e.parcelamentos[0], parcelaAtual: 3 }]);
    expect(f.recompensaDispensadaEm).toBeNull();
    expect(resumoFechamento(e, '2026-12-01')).toEqual(f.historico[0]);
  });

  it('meses pulados', () => {
    const g = fecharMes(e, '2027-02-10');
    expect(g.historico.map((h) => [h.mes, h.semRegistro])).toEqual([['2026-11', false], ['2026-12', true], ['2027-01', true]]);
    expect(g.historico[1].score).toBeNull();
    expect(g.historico[1].gastosPorCategoria).toEqual([{ categoriaId: 'mercado', nome: 'Mercado', total: 1000 }]);
    expect(g.parcelamentos).toEqual([]);
    expect(g.mesAberto).toBe('2027-02');
  });

  it('desfazer só uma vez', () => {
    const f = fecharMes(e, '2026-12-01');
    const d = desfazerFechamento(f)!;
    expect(d).toEqual(e);
    expect(desfazerFechamento(d)).toBeNull();
  });
});
