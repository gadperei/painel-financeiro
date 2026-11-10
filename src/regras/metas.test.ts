import { describe, expect, it } from 'vitest';
import { aporteMensal, alvoDaMeta, jaTenho, percentualAtingido, prazoSemJuros } from './metas';
import { aplicacao, aporte, conta, criarEstado, meta } from '../testes/fabrica';

const reserva = meta({ id: 'r', alvoAutomatico: true, alvo: 0 });
const viagem = meta({ id: 'v', alvo: 500000 });
const estadoMetas = criarEstado({
  metas: [reserva, viagem],
  contas: [conta({ valor: 100000 }), conta({ valor: 50000, pagaEm: '2026-11-01' })],
  aplicacoes: [
    aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 120000, percentualCdi: 110 }),
    aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 30000 }),
    aplicacao({ saldo: 70000 }),
  ],
  aportes: [aporte({ metaId: 'v', valor: 50000 }), aporte({ metaId: 'v', valor: 20000, saiDoBolso: false })],
});

describe('metas', () => {
  it('cálculos de meta', () => {
    const e = estadoMetas;
    expect(jaTenho(e, 'v')).toBe(150000);
    expect(alvoDaMeta(e, reserva)).toBe(900000);
    expect(aporteMensal(e, 'v')).toBe(70000);
    expect(prazoSemJuros(e, viagem)).toEqual({ tipo: 'meses', meses: 5 });
    expect(prazoSemJuros(e, reserva)).toEqual({ tipo: 'sem-aporte' });
    expect(percentualAtingido(e, viagem)).toBe(30);
    const x = meta({ id: 'x', alvo: 100 });
    expect(prazoSemJuros(criarEstado({ metas: [x], aplicacoes: [aplicacao({ tipo: 'guardado', metaId: 'x', saldo: 100 })] }), x))
      .toEqual({ tipo: 'atingida' });
  });
});
