import { describe, expect, it } from 'vitest';
import { migrar } from './migracoes';
import { estadoVazio } from './padroes';
import { HOJE } from '../testes/fabrica';

describe('migrar', () => {
  it('migra, recusa versão nova e lixo', () => {
    expect(migrar(estadoVazio(HOJE))).toEqual({ tipo: 'ok', estado: estadoVazio(HOJE) });
    expect(migrar({ ...estadoVazio(HOJE), versao: 2 })).toEqual({ tipo: 'versao-nova' });
    expect(migrar('lixo')).toEqual({ tipo: 'invalido' });
    const v0 = { ...estadoVazio(HOJE), versao: 0 };
    expect(migrar(v0, { 0: (e) => ({ ...e, versao: 1 }) })).toEqual({ tipo: 'ok', estado: estadoVazio(HOJE) });
  });

  it('versão ausente ou que não é número é inválida', () => {
    expect(migrar({ contas: 'x' })).toEqual({ tipo: 'invalido' });
    expect(migrar({ ...estadoVazio(HOJE), versao: '1' })).toEqual({ tipo: 'invalido' });
  });
});
