import { describe, expect, it } from 'vitest';
import { validarEstado } from './esquema';
import { estadoVazio } from './padroes';
import { HOJE, conta, criarEstado } from '../testes/fabrica';

describe('validarEstado', () => {
  it('aceita o estado vazio e recusa estruturas quebradas', () => {
    expect(validarEstado(estadoVazio(HOJE))).not.toBeNull();
    expect(validarEstado({ ...estadoVazio(HOJE), contas: [{ nome: 'x' }] })).toBeNull();
    expect(validarEstado(criarEstado({ contas: [conta({ valor: 12.5 })] }))).toBeNull();
    expect(validarEstado(criarEstado({ contas: [conta({ dia: 32 })] }))).toBeNull();
  });
});
