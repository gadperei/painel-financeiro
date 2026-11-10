import { describe, expect, it } from 'vitest';
import { CHAVE, carregar, criarSincronizador, salvar } from './armazenamento';
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

  it('sincronizador percebe quando outra janela do app gravou dados', () => {
    const s = falso();
    let gravacoes = 0;
    const contado = { getItem: s.getItem, setItem: (k: string, v: string) => { gravacoes++; s.setItem(k, v); } };
    const sinc = criarSincronizador(contado);
    const e1 = criarEstado({ contas: [conta({ id: 'a' })] });
    expect(sinc.carregar()).toEqual({ tipo: 'vazio' });
    expect(sinc.salvar(e1)).toBe(true);
    expect(sinc.verificarExterno()).toBeNull();
    expect(sinc.salvar(e1)).toBe(true);
    expect(gravacoes).toBe(1); // nada mudou: não grava de novo

    const e2 = criarEstado({ contas: [conta({ id: 'a' }), conta({ id: 'b' })] });
    s.setItem(CHAVE, JSON.stringify(e2)); // outra janela gravou
    expect(sinc.verificarExterno()).toEqual({ tipo: 'ok', estado: e2, migrou: false });
    expect(sinc.verificarExterno()).toBeNull();
    expect(sinc.salvar(e2)).toBe(true);
    expect(gravacoes).toBe(1); // adotou o que veio de fora sem regravar

    s.setItem(CHAVE, '{quebrado');
    expect(sinc.verificarExterno()?.tipo).toBe('corrompido');
  });

  it('salvar devolve false quando o armazenamento falha', () => {
    expect(salvar({ setItem: () => { throw new Error('cheio'); } }, criarEstado())).toBe(false);
  });
});
