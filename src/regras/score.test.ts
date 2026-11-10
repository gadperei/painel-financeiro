import { describe, expect, it } from 'vitest';
import { calcularScore, faixaDoScore, sequencia } from './score';
import { CONFIG_PADRAO } from '../dados/padroes';
import { HOJE, aplicacao, aporte, conta, criarEstado, mesFechado } from '../testes/fabrica';

const contas3 = [conta({ dia: 5, pagaEm: '2026-11-05' }), conta({ dia: 8 }), conta({ dia: 20 })];
const aportes3 = [
  aporte({ valor: 30000, feitoEm: '2026-11-02' }),
  aporte({ valor: 50000 }),
  aporte({ valor: 99999, saiDoBolso: false }),
];

describe('score', () => {
  it('contas em dia: parcial ignora as que não venceram; fechamento avalia todas', () => {
    const e = criarEstado({ contas: contas3 });
    expect(calcularScore(e, HOJE, 'parcial').contasEmDia).toBe(15);
    expect(calcularScore(e, HOJE, 'fechamento').contasEmDia).toBe(10);
    expect(calcularScore(criarEstado({ contas: [conta({ dia: 5, pagaEm: '2026-11-07' })] }), HOJE, 'parcial').contasEmDia).toBe(0);
    expect(calcularScore(criarEstado({ contas: [conta({ dia: null })] }), HOJE, 'parcial').contasEmDia).toBeNull();
    expect(calcularScore(criarEstado({ contas: [conta({ dia: null, pagaEm: '2026-11-09' })] }), HOJE, 'parcial').contasEmDia).toBe(30);
    expect(calcularScore(criarEstado({ contas: [conta({ dia: null })] }), HOJE, 'fechamento').contasEmDia).toBe(0);
  });

  it('aportes só contam saiDoBolso', () => {
    expect(calcularScore(criarEstado({ aportes: aportes3 }), HOJE, 'parcial').aportes).toBe(15);
  });

  it('critério sem itens não conta e o total é reajustado', () => {
    const e = criarEstado({ contas: [conta({ dia: 5, pagaEm: '2026-11-04' })] });
    expect(calcularScore(e, HOJE, 'parcial')).toEqual({ total: 100, aportes: null, contasEmDia: 30, mesNoAzul: 30 });
  });

  it('mês no azul', () => {
    const com = (saldo: number) =>
      criarEstado({ config: { ...CONFIG_PADRAO, sobraMinima: 10000 }, aplicacoes: [aplicacao({ saldo })] });
    expect(calcularScore(com(15000), HOJE, 'parcial').mesNoAzul).toBe(30);
    expect(calcularScore(com(10000), HOJE, 'parcial').mesNoAzul).toBe(30);
    expect(calcularScore(com(5000), HOJE, 'parcial').mesNoAzul).toBe(15);
    expect(calcularScore(com(-1), HOJE, 'parcial').mesNoAzul).toBe(0);
  });

  it('total combinado', () => {
    const e = criarEstado({ contas: contas3, aportes: aportes3, aplicacoes: [aplicacao({ saldo: 1000000 })] });
    expect(calcularScore(e, HOJE, 'parcial')).toEqual({ total: 60, aportes: 15, contasEmDia: 15, mesNoAzul: 30 });
  });

  it('faixas e sequência', () => {
    expect([80, 79, 50, 49].map(faixaDoScore)).toEqual(['verde', 'amarelo', 'amarelo', 'vermelho']);
    const s = (total: number) => mesFechado({ score: { total, aportes: null, contasEmDia: null, mesNoAzul: 30 } });
    const h = [s(75), s(80), mesFechado({ semRegistro: true }), s(90), s(72)];
    expect(sequencia(h, 70)).toBe(2);
    expect(sequencia([s(90), s(60)], 70)).toBe(0);
  });
});
