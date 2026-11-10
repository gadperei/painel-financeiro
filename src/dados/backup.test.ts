import { describe, expect, it } from 'vitest';
import { backupAtrasado, gerarBackup, lerBackup, nomeArquivoBackup } from './backup';
import { HOJE, conta, criarEstado, gasto } from '../testes/fabrica';

const NAO_E = 'Este arquivo não é um backup do Painel Financeiro.';
const e = criarEstado({ contas: [conta(), conta()], gastos: [gasto()] });
const comCopia = { ...e, copiaAntesDoFechamento: { ...e } };
const texto = gerarBackup(comCopia, '2026-11-10T15:00:00.000Z');

describe('backup', () => {
  it('nome e conteúdo', () => {
    expect(nomeArquivoBackup('2026-11-10')).toBe('financas-backup-2026-11-10.json');
    const obj = JSON.parse(texto);
    expect(obj).toMatchObject({ app: 'painel-financeiro', versao: 1, exportadoEm: '2026-11-10T15:00:00.000Z' });
    expect(obj.dados.copiaAntesDoFechamento).toBeNull();
  });

  it('lê backup válido com resumo', () => {
    expect(lerBackup(texto)).toEqual({
      tipo: 'ok',
      estado: { ...e, copiaAntesDoFechamento: null },
      resumo: { exportadoEm: '2026-11-10', contas: 2, gastos: 1 },
    });
  });

  it('recusa arquivos errados com mensagem amigável', () => {
    const obj = JSON.parse(texto);
    expect(lerBackup('<!DOCTYPE html><html><head></head></html>')).toEqual({ tipo: 'erro', mensagem: NAO_E });
    expect(lerBackup(JSON.stringify({ app: 'outro' }))).toEqual({ tipo: 'erro', mensagem: NAO_E });
    expect(lerBackup(texto.slice(0, 50)).tipo).toBe('erro');
    expect(lerBackup(JSON.stringify({ ...obj, versao: 2, dados: { ...obj.dados, versao: 2 } })))
      .toEqual({ tipo: 'erro', mensagem: 'Backup de uma versão mais nova do app — atualize o app.' });
    expect(lerBackup(JSON.stringify({ ...obj, dados: { contas: 'x' } })))
      .toEqual({ tipo: 'erro', mensagem: 'O backup está danificado ou incompleto.' });
  });

  it('backup atrasado', () => {
    expect(backupAtrasado(criarEstado({ ultimoBackup: null }), HOJE)).toBe(true);
    expect(backupAtrasado(criarEstado({ ultimoBackup: '2026-10-11' }), HOJE)).toBe(false);
    expect(backupAtrasado(criarEstado({ ultimoBackup: '2026-10-10' }), HOJE)).toBe(true);
    expect(backupAtrasado(criarEstado({ modoExemplo: true, ultimoBackup: null }), HOJE)).toBe(false);
  });
});
