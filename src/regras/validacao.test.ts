import { describe, expect, it } from 'vitest';
import { erroNome, erroValor, lerDia, lerInteiro } from './validacao';

describe('validação de formulários', () => {
  it('nome obrigatório depois de tirar espaços', () => {
    expect(erroNome('   ')).toBe('Informe um nome');
    expect(erroNome(' Luz ')).toBeNull();
  });

  it('valor maior que zero', () => {
    expect(erroValor(0)).toBe('Informe um valor');
    expect(erroValor(1)).toBeNull();
  });

  it('dia: vazio é "sem dia fixo"; fora de 1–31 é erro', () => {
    expect(lerDia('')).toEqual({ dia: null, erro: null });
    expect(lerDia(' 15 ')).toEqual({ dia: 15, erro: null });
    expect(lerDia('0')).toEqual({ dia: null, erro: 'Dia entre 1 e 31' });
    expect(lerDia('32')).toEqual({ dia: null, erro: 'Dia entre 1 e 31' });
    expect(lerDia('5,5')).toEqual({ dia: null, erro: 'Dia entre 1 e 31' });
  });

  it('inteiro dentro de limites', () => {
    expect(lerInteiro('3', 1, 10)).toBe(3);
    expect(lerInteiro('11', 1, 10)).toBeNull();
    expect(lerInteiro('', 1, 10)).toBeNull();
    expect(lerInteiro('2.5', 1, 10)).toBeNull();
  });
});
