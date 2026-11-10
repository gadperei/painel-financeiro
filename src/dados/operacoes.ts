import { estadoVazio, ID_OUTROS } from './padroes';
import type { Dia, Estado } from './tipos';

export type Colecao = 'rendas' | 'contas' | 'aplicacoes' | 'metas' | 'aportes' | 'parcelamentos' | 'categorias' | 'gastos';
export type ItemDe<C extends Colecao> = Estado[C][number];

export const novoId = (): string => crypto.randomUUID();

/** Substitui o item com o mesmo id ou acrescenta no fim. Nunca altera o estado recebido. */
export function salvarItem<C extends Colecao>(e: Estado, colecao: C, item: ItemDe<C>): Estado {
  const lista = e[colecao] as ItemDe<C>[];
  const existe = lista.some((x) => x.id === item.id);
  const nova = existe ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item];
  return { ...e, [colecao]: nova };
}

/**
 * Exclui um item. Categoria: os gastos dela vão para "Outros" (que não pode ser excluída).
 * Meta: aplicações e aportes ligados ficam sem meta.
 */
export function excluirItem(e: Estado, colecao: Colecao, id: string): Estado {
  if (colecao === 'categorias') {
    if (id === ID_OUTROS) return e;
    return {
      ...e,
      categorias: e.categorias.filter((c) => c.id !== id),
      gastos: e.gastos.map((g) => (g.categoriaId === id ? { ...g, categoriaId: ID_OUTROS } : g)),
    };
  }
  if (colecao === 'metas') {
    return {
      ...e,
      metas: e.metas.filter((m) => m.id !== id),
      aplicacoes: e.aplicacoes.map((a) => (a.metaId === id ? { ...a, metaId: null } : a)),
      aportes: e.aportes.map((a) => (a.metaId === id ? { ...a, metaId: null } : a)),
    };
  }
  const lista = e[colecao] as { id: string }[];
  return { ...e, [colecao]: lista.filter((x) => x.id !== id) };
}

const CAMPO_DA_MARCACAO = { rendas: 'recebidaEm', contas: 'pagaEm', aportes: 'feitoEm' } as const;

/** Marca (com a data) ou desmarca (null) "recebi", "pago" ou "feito". */
export function marcar(e: Estado, colecao: 'rendas' | 'contas' | 'aportes', id: string, data: Dia | null): Estado {
  const campo = CAMPO_DA_MARCACAO[colecao];
  const lista = e[colecao] as { id: string }[];
  return { ...e, [colecao]: lista.map((x) => (x.id === id ? { ...x, [campo]: data } : x)) };
}

export function dispensarRecompensa(e: Estado): Estado {
  return { ...e, recompensaDispensadaEm: e.mesAberto };
}

export function comecarComMeusDados(hoje: Dia): Estado {
  return estadoVazio(hoje);
}
