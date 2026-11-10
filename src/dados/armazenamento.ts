import { VERSAO_ATUAL, migrar } from './migracoes';
import type { Estado } from './tipos';

export const CHAVE = 'painel-financeiro';

export type ResultadoCarregar =
  | { tipo: 'vazio' }
  | { tipo: 'ok'; estado: Estado; migrou: boolean }
  | { tipo: 'corrompido'; bruto: string }
  | { tipo: 'versao-nova'; bruto: string };

function lerBruto(s: Pick<Storage, 'getItem'>): string | null {
  try {
    return s.getItem(CHAVE);
  } catch {
    // Armazenamento bloqueado: o app abre como se estivesse vazio e o aviso de "não consegui salvar" aparece depois.
    return null;
  }
}

export function carregar(s: Pick<Storage, 'getItem'>): ResultadoCarregar {
  const bruto = lerBruto(s);
  return bruto === null ? { tipo: 'vazio' } : interpretar(bruto);
}

function interpretar(bruto: string): ResultadoCarregar {
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

/** Texto com as chaves em ordem: dois estados iguais dão o mesmo texto, seja qual for a ordem dos campos. */
function canonico(v: unknown): string {
  return JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]]))
      : x);
}

export interface Sincronizador {
  carregar(): ResultadoCarregar;
  /** Grava só se o estado mudou desde a última gravação ou leitura. */
  salvar(e: Estado): boolean;
  /** Se outra janela do app gravou dados novos, devolve o que está salvo agora; senão, null. */
  verificarExterno(): ResultadoCarregar | null;
}

/**
 * Mantém esta janela em dia com o que está salvo. O app instalado e a aba do navegador (ou duas abas)
 * usam o mesmo armazenamento: sem isso, a janela antiga sobrescreveria o que a outra gravou.
 */
export function criarSincronizador(s: Pick<Storage, 'getItem' | 'setItem'>): Sincronizador {
  let ultimoBruto: string | null = null; // o texto que estava salvo da última vez que olhamos ou gravamos
  let ultimoEstado: string | null = null; // o estado (canônico) que já está refletido no armazenamento

  const adotar = (bruto: string | null, r: ResultadoCarregar) => {
    ultimoBruto = bruto;
    if (r.tipo === 'ok') ultimoEstado = canonico(r.estado);
    return r;
  };

  return {
    carregar() {
      const bruto = lerBruto(s);
      return adotar(bruto, bruto === null ? { tipo: 'vazio' } : interpretar(bruto));
    },
    salvar(e) {
      const atual = canonico(e);
      if (atual === ultimoEstado) return true;
      if (!salvar(s, e)) return false;
      ultimoEstado = atual;
      ultimoBruto = lerBruto(s);
      return true;
    },
    verificarExterno() {
      const bruto = lerBruto(s);
      if (bruto === null || bruto === ultimoBruto) return null;
      return adotar(bruto, interpretar(bruto));
    },
  };
}
