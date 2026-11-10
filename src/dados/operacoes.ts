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

/**
 * Exclui e devolve como desfazer só essa exclusão: o item volta para a mesma posição e as ligações
 * desfeitas (gastos movidos para "Outros", aplicações e aportes sem meta) são refeitas.
 * Mudanças feitas depois da exclusão são mantidas.
 */
export function excluirComDesfazer(e: Estado, colecao: Colecao, id: string): { estado: Estado; desfazer(atual: Estado): Estado } {
  const lista = e[colecao] as { id: string }[];
  const indice = lista.findIndex((x) => x.id === id);
  const estado = excluirItem(e, colecao, id);
  if (indice < 0 || estado === e) return { estado, desfazer: (atual) => atual };

  const item = lista[indice];
  const gastosMovidos = new Set(colecao === 'categorias' ? e.gastos.filter((g) => g.categoriaId === id).map((g) => g.id) : []);
  const desligadas = new Set(colecao === 'metas' ? e.aplicacoes.filter((a) => a.metaId === id).map((a) => a.id) : []);
  const aportesDesligados = new Set(colecao === 'metas' ? e.aportes.filter((a) => a.metaId === id).map((a) => a.id) : []);

  const desfazer = (atual: Estado): Estado => {
    const listaAtual = atual[colecao] as { id: string }[];
    if (listaAtual.some((x) => x.id === id)) return atual;
    const nova = [...listaAtual];
    nova.splice(Math.min(indice, nova.length), 0, item);
    const religado: Estado = {
      ...atual,
      gastos: atual.gastos.map((g) => (gastosMovidos.has(g.id) && g.categoriaId === ID_OUTROS ? { ...g, categoriaId: id } : g)),
      aplicacoes: atual.aplicacoes.map((a) => (desligadas.has(a.id) && a.metaId === null ? { ...a, metaId: id } : a)),
      aportes: atual.aportes.map((a) => (aportesDesligados.has(a.id) && a.metaId === null ? { ...a, metaId: id } : a)),
    };
    // Por último, para não ser sobrescrito quando a própria coleção é gastos, aplicações ou aportes.
    return { ...religado, [colecao]: nova };
  };
  return { estado, desfazer };
}

const CAMPO_DA_MARCACAO ={ rendas: 'recebidaEm', contas: 'pagaEm', aportes: 'feitoEm' } as const;

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
