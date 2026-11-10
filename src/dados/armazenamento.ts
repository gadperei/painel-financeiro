import { VERSAO_ATUAL, migrar } from './migracoes';
import type { Estado } from './tipos';

export const CHAVE = 'painel-financeiro';

export type ResultadoCarregar =
  | { tipo: 'vazio' }
  | { tipo: 'ok'; estado: Estado; migrou: boolean }
  | { tipo: 'corrompido'; bruto: string }
  | { tipo: 'versao-nova'; bruto: string };

export function carregar(s: Pick<Storage, 'getItem'>): ResultadoCarregar {
  let bruto: string | null;
  try {
    bruto = s.getItem(CHAVE);
  } catch {
    // Armazenamento bloqueado: o app abre como se estivesse vazio e o aviso de "não consegui salvar" aparece depois.
    return { tipo: 'vazio' };
  }
  if (bruto === null) return { tipo: 'vazio' };

  let dados: unknown;
  try {
    dados = JSON.parse(bruto);
  } catch {
    return { tipo: 'corrompido', bruto };
  }

  const r = migrar(dados);
  if (r.tipo === 'versao-nova') return { tipo: 'versao-nova', bruto };
  if (r.tipo === 'invalido') return { tipo: 'corrompido', bruto };
  const versaoLida = (dados as { versao: number }).versao;
  return { tipo: 'ok', estado: r.estado, migrou: versaoLida < VERSAO_ATUAL };
}

export function salvar(s: Pick<Storage, 'setItem'>, estado: Estado): boolean {
  try {
    s.setItem(CHAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}
