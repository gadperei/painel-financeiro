import { describe, expect, it } from 'vitest';
import { avisoDaConta, proximosVencimentos } from './avisos';
import { HOJE, conta, criarEstado } from '../testes/fabrica';

describe('avisos de conta', () => {
  it('em breve, atrasada e casos de calendário', () => {
    const m = '2026-11', h = '2026-11-10';
    expect(avisoDaConta(conta({ dia: 10 }), m, h)).toBe('em-breve');
    expect(avisoDaConta(conta({ dia: 13 }), m, h)).toBe('em-breve');
    expect(avisoDaConta(conta({ dia: 14 }), m, h)).toBeNull();
    expect(avisoDaConta(conta({ dia: 9 }), m, h)).toBe('atrasada');
    expect(avisoDaConta(conta({ dia: 9, pagaEm: '2026-11-09' }), m, h)).toBeNull();
    expect(avisoDaConta(conta({ dia: 9, valor: 0 }), m, h)).toBeNull();
    expect(avisoDaConta(conta({ dia: null }), m, '2026-11-30')).toBeNull();
    expect(avisoDaConta(conta({ dia: 31 }), m, '2026-11-28')).toBe('em-breve');
    expect(avisoDaConta(conta({ dia: 30 }), '2028-02', '2028-02-29')).toBe('em-breve');
    expect(avisoDaConta(conta({ dia: 31 }), '2026-12', '2026-12-29')).toBe('em-breve');
    expect(avisoDaConta(conta({ dia: 30 }), m, '2026-12-01')).toBe('atrasada');
    expect(avisoDaConta(conta({ dia: 31 }), '2026-12', '2027-01-02')).toBe('atrasada');
  });

  it('próximos vencimentos: pendentes com dia, por data, até 3', () => {
    const e = criarEstado({
      contas: [
        conta({ id: 'a', dia: 25 }), conta({ id: 'b', dia: 12 }), conta({ id: 'c', dia: 9 }),
        conta({ id: 'd', dia: null }), conta({ id: 'e', dia: 11, pagaEm: '2026-11-10' }), conta({ id: 'f', dia: 28 }),
      ],
    });
    expect(proximosVencimentos(e, HOJE).map((c) => c.id)).toEqual(['c', 'b', 'a']);
  });
});
