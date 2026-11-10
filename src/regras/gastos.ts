import { mesDe, primeiroDia, type Dia, type Mes } from './datas';
import type { Centavos } from './dinheiro';
import { ID_OUTROS } from '../dados/padroes';
import type { Categoria, Estado, Gasto } from '../dados/tipos';

export interface TotalCategoria {
  categoriaId: string;
  nome: string;
  cor: string;
  total: Centavos;
  percentual: number;
  variacao: number | null;
}

const OUTROS_RESERVA: Categoria = { id: ID_OUTROS, nome: 'Outros', cor: '#7b8494' };

export function gastosDoMes(e: Estado, mes: Mes): Gasto[] {
  return e.gastos.filter((g) => mesDe(g.data) === mes);
}

/** §5.8 — total e % por categoria no mês; gasto com categoria inexistente conta como "Outros". */
export function totaisPorCategoria(e: Estado, mes: Mes): TotalCategoria[] {
  const categorias = new Map(e.categorias.map((c) => [c.id, c]));
  const totais = new Map<string, Centavos>();
  for (const g of gastosDoMes(e, mes)) {
    if (g.valor <= 0) continue;
    const id = categorias.has(g.categoriaId) ? g.categoriaId : ID_OUTROS;
    totais.set(id, (totais.get(id) ?? 0) + g.valor);
  }
  const soma = [...totais.values()].reduce((s, v) => s + v, 0);

  const anterior = [...e.historico].reverse().find((h) => !h.semRegistro && h.mes < mes);

  return [...totais.entries()]
    .map(([id, total]) => {
      const cat = categorias.get(id) ?? categorias.get(ID_OUTROS) ?? OUTROS_RESERVA;
      const antes = anterior?.gastosPorCategoria.find((x) => x.categoriaId === id)?.total;
      return {
        categoriaId: id,
        nome: cat.nome,
        cor: cat.cor,
        total,
        percentual: (total / soma) * 100,
        variacao: antes ? ((total - antes) / antes) * 100 : null,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/** A data de um gasto vai do 1º dia do mês aberto até hoje. */
export function validarDataGasto(data: Dia, mesAberto: Mes, hoje: Dia): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(data) && data >= primeiroDia(mesAberto) && data <= hoje;
}
