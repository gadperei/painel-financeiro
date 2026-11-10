import { describe, expect, it } from 'vitest';
import { comecarComMeusDados, dispensarRecompensa, excluirItem, marcar, salvarItem } from './operacoes';
import { estadoVazio } from './padroes';
import { HOJE, aplicacao, aporte, conta, criarEstado, gasto, meta } from '../testes/fabrica';

describe('operações de edição', () => {
  it('salvar novo, editar e não mutar', () => {
    const e = criarEstado();
    const c = conta({ id: 'c1', nome: 'Luz' });
    const e2 = salvarItem(e, 'contas', c);
    expect(e2.contas).toEqual([c]);
    expect(salvarItem(e2, 'contas', { ...c, nome: 'Energia' }).contas).toEqual([{ ...c, nome: 'Energia' }]);
    expect(e.contas).toEqual([]);
    expect(marcar(e2, 'contas', 'c1', HOJE).contas[0].pagaEm).toBe(HOJE);
  });

  it('excluir categoria move gastos para Outros; Outros não sai', () => {
    const e = criarEstado({ gastos: [gasto({ categoriaId: 'lazer' })] });
    const e2 = excluirItem(e, 'categorias', 'lazer');
    expect(e2.categorias.some((c) => c.id === 'lazer')).toBe(false);
    expect(e2.gastos[0].categoriaId).toBe('outros');
    expect(excluirItem(e, 'categorias', 'outros')).toBe(e);
  });

  it('excluir meta desliga aplicações e aportes', () => {
    const e = criarEstado({
      metas: [meta({ id: 'm' })],
      aplicacoes: [aplicacao({ tipo: 'guardado', metaId: 'm' })],
      aportes: [aporte({ metaId: 'm' })],
    });
    const e2 = excluirItem(e, 'metas', 'm');
    expect([e2.metas.length, e2.aplicacoes[0].metaId, e2.aportes[0].metaId]).toEqual([0, null, null]);
  });

  it('começar do zero e dispensar recompensa', () => {
    expect(comecarComMeusDados(HOJE)).toEqual(estadoVazio(HOJE));
    expect(dispensarRecompensa(criarEstado()).recompensaDispensadaEm).toBe('2026-11');
  });
});
