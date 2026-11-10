import { describe, expect, it } from 'vitest';
import { gerarExemplo } from './exemplo';
import { validarEstado } from './esquema';
import { validarDataGasto } from '../regras/gastos';
import { HOJE } from '../testes/fabrica';

describe('dados de exemplo', () => {
  it('exemplo é válido, completo e relativo a hoje', () => {
    const ex = gerarExemplo(HOJE);
    expect(validarEstado(ex)).not.toBeNull();
    expect(ex.modoExemplo).toBe(true);
    expect([ex.rendas, ex.contas, ex.aplicacoes, ex.metas, ex.aportes, ex.parcelamentos].map((l) => l.length))
      .toEqual([2, 6, 3, 2, 3, 3]);
    expect(ex.aportes.filter((a) => !a.saiDoBolso)).toHaveLength(1);
    expect(ex.gastos.length).toBeGreaterThanOrEqual(20);
    expect(ex.gastos.every((g) => validarDataGasto(g.data, ex.mesAberto, HOJE))).toBe(true);
    expect(ex.historico.map((h) => h.mes)).toEqual(['2026-07', '2026-08', '2026-09', '2026-10']);
    expect(new Set(ex.historico.map((h) => h.score?.total)).size).toBe(4);
    expect(gerarExemplo('2026-01-01').historico.map((h) => h.mes)).toEqual(['2025-09', '2025-10', '2025-11', '2025-12']);
  });

  it('gastos no dia 1 quando hoje é o primeiro dia do mês', () => {
    const ex = gerarExemplo('2026-01-01');
    expect(ex.gastos.every((g) => g.data === '2026-01-01')).toBe(true);
  });
});
