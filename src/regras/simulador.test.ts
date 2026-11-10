import { describe, expect, it } from 'vitest';
import { parametrosDaMeta, simular } from './simulador';
import { aplicacao, aporte, criarEstado, meta } from '../testes/fabrica';

describe('simulador', () => {
  it('juros compostos com CDI', () => {
    const r = simular({ inicial: 0, aporte: 100000, alvo: 2400000, percentualCdi: 100, cdiAnual: 12 });
    expect(r.taxaMensal).toBeCloseTo(0.0094888, 6);
    expect(r.mesesAteAlvo).toBe(22);
    expect(r.mesesAdiantados).toBe(2);
    expect(r.totalInvestido).toBe(2200000);
  });

  it('sem juros e limite de 600 meses', () => {
    expect(simular({ inicial: 0, aporte: 100000, alvo: 1000000, percentualCdi: 0, cdiAnual: 12 }).mesesAteAlvo).toBe(10);
    expect(simular({ inicial: 0, aporte: 0, alvo: 100, percentualCdi: 100, cdiAnual: 0 }).mesesAteAlvo).toBeNull();
  });

  it('parâmetros vêm da meta', () => {
    const viagem = meta({ id: 'v', alvo: 500000 });
    const e = criarEstado({
      metas: [viagem],
      aplicacoes: [
        aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 120000, percentualCdi: 110 }),
        aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 30000 }),
      ],
      aportes: [aporte({ metaId: 'v', valor: 50000 }), aporte({ metaId: 'v', valor: 20000, saiDoBolso: false })],
    });
    expect(parametrosDaMeta(e, viagem))
      .toEqual({ inicial: 150000, aporte: 70000, alvo: 500000, percentualCdi: 110, cdiAnual: 14.9 });
  });
});
