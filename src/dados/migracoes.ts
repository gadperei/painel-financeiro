import { validarEstado } from './esquema';
import type { Estado } from './tipos';

export const VERSAO_ATUAL = 1;

/** A função de índice `v` converte os dados da versão `v` para a `v + 1`. */
export type Migracoes = Record<number, (e: any) => any>;

export const MIGRACOES: Migracoes = {};

export type ResultadoMigracao =
  | { tipo: 'ok'; estado: Estado }
  | { tipo: 'versao-nova' }
  | { tipo: 'invalido' };

const INVALIDO: ResultadoMigracao = { tipo: 'invalido' };

export function migrar(bruto: unknown, migracoes: Migracoes = MIGRACOES): ResultadoMigracao {
  if (typeof bruto !== 'object' || bruto === null) return INVALIDO;
  let dados: any = bruto;
  let versao = dados.versao;
  if (typeof versao !== 'number' || !Number.isInteger(versao)) return INVALIDO;
  if (versao > VERSAO_ATUAL) return { tipo: 'versao-nova' };

  while (versao < VERSAO_ATUAL) {
    const passo = migracoes[versao];
    if (!passo) return INVALIDO;
    dados = passo(dados);
    if (dados?.versao !== versao + 1) return INVALIDO;
    versao = dados.versao;
  }

  const estado = validarEstado(dados);
  return estado ? { tipo: 'ok', estado } : INVALIDO;
}
