import { adicionarMeses, mesDe, mesesEntre, type Dia, type Mes } from './datas';
import { totaisPorCategoria } from './gastos';
import { jaTenho } from './metas';
import { avancarParcelas } from './parcelas';
import { caixaOperacional, calcularSobraPrevista } from './projecao';
import { calcularRecompensa } from './recompensa';
import { calcularScore } from './score';
import type { Aporte, Conta, Estado, MesFechado, Renda } from '../dados/tipos';

export function precisaFechar(e: Estado, hoje: Dia): boolean {
  return mesDe(hoje) > e.mesAberto;
}

/** O que ainda não foi marcado no mês aberto (só itens com valor). */
export function pendencias(e: Estado): { rendas: Renda[]; contas: Conta[]; aportes: Aporte[] } {
  return {
    rendas: e.rendas.filter((r) => r.valor > 0 && !r.recebidaEm),
    contas: e.contas.filter((c) => c.valor > 0 && !c.pagaEm),
    aportes: e.aportes.filter((a) => a.valor > 0 && !a.feitoEm),
  };
}

function gastosDoRegistro(e: Estado, mes: Mes): MesFechado['gastosPorCategoria'] {
  return totaisPorCategoria(e, mes).map(({ categoriaId, nome, total }) => ({ categoriaId, nome, total }));
}

/** O registro que o fechamento vai gravar para o mês aberto (§5.7, passo 2). */
export function resumoFechamento(e: Estado, hoje: Dia): MesFechado {
  return {
    mes: e.mesAberto,
    semRegistro: false,
    renda: e.rendas.reduce((s, r) => s + r.valor, 0),
    contasPagas: e.contas.filter((c) => c.pagaEm).reduce((s, c) => s + c.valor, 0),
    caixaOperacional: caixaOperacional(e),
    porMeta: e.metas.map((m) => ({ metaId: m.id, nome: m.nome, valor: jaTenho(e, m.id) })),
    sobra: calcularSobraPrevista(e),
    score: calcularScore(e, hoje, 'fechamento'),
    gastosPorCategoria: gastosDoRegistro(e, e.mesAberto),
    recompensaSugerida: calcularRecompensa(e, hoje, 'fechamento')?.sugestao ?? null,
  };
}

function mesSemRegistro(e: Estado, mes: Mes): MesFechado {
  return {
    mes,
    semRegistro: true,
    renda: 0,
    contasPagas: 0,
    caixaOperacional: 0,
    porMeta: [],
    sobra: 0,
    score: null,
    gastosPorCategoria: gastosDoRegistro(e, mes),
    recompensaSugerida: null,
  };
}

function semCopia(e: Estado): Omit<Estado, 'copiaAntesDoFechamento'> {
  const copia: Partial<Estado> = { ...e };
  delete copia.copiaAntesDoFechamento;
  return copia as Omit<Estado, 'copiaAntesDoFechamento'>;
}

/** §5.7 — fecha o mês aberto e abre o mês de hoje. */
export function fecharMes(e: Estado, hoje: Dia): Estado {
  const mesHoje = mesDe(hoje);
  const n = mesesEntre(e.mesAberto, mesHoje);
  if (n <= 0) return e;

  const pulados = Array.from({ length: n - 1 }, (_, i) => mesSemRegistro(e, adicionarMeses(e.mesAberto, i + 1)));

  return {
    ...e,
    historico: [...e.historico, resumoFechamento(e, hoje), ...pulados],
    rendas: e.rendas.map((r) => ({ ...r, recebidaEm: null })),
    contas: e.contas.map((c) => ({ ...c, pagaEm: null })),
    aportes: e.aportes.map((a) => ({ ...a, feitoEm: null })),
    parcelamentos: avancarParcelas(e.parcelamentos, n),
    mesAberto: mesHoje,
    recompensaDispensadaEm: null,
    copiaAntesDoFechamento: semCopia(e),
  };
}

/** Volta ao estado de antes do último fechamento. Só funciona uma vez. */
export function desfazerFechamento(e: Estado): Estado | null {
  if (!e.copiaAntesDoFechamento) return null;
  return { ...e.copiaAntesDoFechamento, copiaAntesDoFechamento: null };
}
