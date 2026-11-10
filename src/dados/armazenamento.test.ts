import { describe, expect, it } from 'vitest';
import { CHAVE, carregar, salvar } from './armazenamento';
import { conta, criarEstado } from '../testes/fabrica';

function falso() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

describe('armazenamento', () => {
  it('carrega vazio, ok, corrompido e versão nova', () => {
    const s = falso();
    expect(carregar(s)).toEqual({ tipo: 'vazio' });
    const e = criarEstado({ contas: [conta()] });
    expect(salvar(s, e)).toBe(true);
    expect(carregar(s)).toEqual({ tipo: 'ok', estado: e, migrou: false });
    s.setItem(CHAVE, '{quebrado');
    expect(carregar(s)).toEqual({ tipo: 'corrompido', bruto: '{quebrado' });
    const nova = JSON.stringify({ ...e, versao: 2 });
    s.setItem(CHAVE, nova);
    expect(carregar(s)).toEqual({ tipo: 'versao-nova', bruto: nova });
  });

  it('salvar devolve false quando o armazenamento falha', () => {
    expect(salvar({ setItem: () => { throw new Error('cheio'); } }, criarEstado())).toBe(false);
  });
});
