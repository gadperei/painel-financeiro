import { describe, expect, it } from 'vitest';
import { caixaOperacional, calcularSobraPrevista } from './projecao';
import { aplicacao, aporte, conta, criarEstado, renda } from '../testes/fabrica';

describe('projeção', () => {
  it('sobra prevista segue §5.1', () => {
    const e = criarEstado({
      aplicacoes: [aplicacao({ saldo: 200000 }), aplicacao({ saldo: 999999, tipo: 'guardado' })],
      rendas: [renda({ valor: 300000 }), renda({ valor: 150000, recebidaEm: '2026-11-05' })],
      contas: [conta({ valor: 80000 }), conta({ valor: 50000, pagaEm: '2026-11-03' })],
      aportes: [
        aporte({ valor: 30000 }),
        aporte({ valor: 20000, saiDoBolso: false }),
        aporte({ valor: 10000, feitoEm: '2026-11-02' }),
      ],
    });
    expect(caixaOperacional(e)).toBe(200000);
    expect(calcularSobraPrevista(e)).toBe(390000);
  });
});
