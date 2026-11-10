import { diasEntre, hojeLocal } from '../regras/datas';
import { VERSAO_ATUAL, migrar } from './migracoes';
import type { Dia, Estado } from './tipos';

const APP = 'painel-financeiro';
const DIAS_PARA_LEMBRAR = 30;

export const MENSAGENS_BACKUP = {
  naoE: 'Este arquivo não é um backup do Painel Financeiro.',
  versaoNova: 'Backup de uma versão mais nova do app — atualize o app.',
  danificado: 'O backup está danificado ou incompleto.',
} as const;

export interface ResumoBackup { exportadoEm: Dia; contas: number; gastos: number; }

export type ResultadoLeitura =
  | { tipo: 'ok'; estado: Estado; resumo: ResumoBackup }
  | { tipo: 'erro'; mensagem: string };

export function nomeArquivoBackup(hoje: Dia): string {
  return `financas-backup-${hoje}.json`;
}

/** Texto JSON do backup. A cópia de "desfazer fechamento" não entra. */
export function gerarBackup(e: Estado, agoraIso: string): string {
  return JSON.stringify({
    app: APP,
    versao: VERSAO_ATUAL,
    exportadoEm: agoraIso,
    dados: { ...e, copiaAntesDoFechamento: null },
  });
}

export function lerBackup(texto: string): ResultadoLeitura {
  let arquivo: unknown;
  try {
    arquivo = JSON.parse(texto);
  } catch {
    return { tipo: 'erro', mensagem: MENSAGENS_BACKUP.naoE };
  }
  if (typeof arquivo !== 'object' || arquivo === null || (arquivo as { app?: unknown }).app !== APP) {
    return { tipo: 'erro', mensagem: MENSAGENS_BACKUP.naoE };
  }

  const { dados, exportadoEm } = arquivo as { dados?: unknown; exportadoEm?: unknown };
  const r = migrar(dados);
  if (r.tipo === 'versao-nova') return { tipo: 'erro', mensagem: MENSAGENS_BACKUP.versaoNova };
  if (r.tipo === 'invalido') return { tipo: 'erro', mensagem: MENSAGENS_BACKUP.danificado };

  const quando = typeof exportadoEm === 'string' ? new Date(exportadoEm) : new Date(NaN);
  const estado = { ...r.estado, copiaAntesDoFechamento: null };
  return {
    tipo: 'ok',
    estado,
    resumo: {
      exportadoEm: Number.isNaN(quando.getTime()) ? '' : hojeLocal(quando),
      contas: estado.contas.length,
      gastos: estado.gastos.length,
    },
  };
}

/** Lembrar de fazer backup: nunca no modo exemplo; sim se nunca fez ou se o último tem mais de 30 dias. */
export function backupAtrasado(e: Estado, hoje: Dia): boolean {
  if (e.modoExemplo) return false;
  if (!e.ultimoBackup) return true;
  return diasEntre(e.ultimoBackup, hoje) > DIAS_PARA_LEMBRAR;
}
