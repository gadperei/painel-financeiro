import { ultimoDiaDoMes, vencimentoEfetivo, type Dia } from './datas';
import { calcularSobraPrevista } from './projecao';
import type { Conta, Estado, MesFechado } from '../dados/tipos';

export type ModoScore = 'parcial' | 'fechamento';

export interface Score {
  total: number;
  aportes: number | null;
  contasEmDia: number | null;
  mesNoAzul: number;
}

const PESO_APORTES = 40;
const PESO_CONTAS = 30;
const PESO_AZUL = 30;

/** Data limite para a conta contar como "em dia": o vencimento, ou o fim do mês se não tiver dia fixo. */
function limiteDaConta(c: Conta, mesAberto: string): Dia {
  return vencimentoEfetivo(mesAberto, c.dia ?? ultimoDiaDoMes(mesAberto));
}

/** §5.6 — score de 0 a 100: aportes (40), contas em dia (30), mês no azul (30). */
export function calcularScore(e: Estado, hoje: Dia, modo: ModoScore): Score {
  const aportes = e.aportes.filter((a) => a.saiDoBolso && a.valor > 0);
  const planejado = aportes.reduce((s, a) => s + a.valor, 0);
  const depositado = aportes.filter((a) => a.feitoEm).reduce((s, a) => s + a.valor, 0);
  const pontosAportes = planejado > 0 ? (PESO_APORTES * depositado) / planejado : null;

  const contas = e.contas.filter((c) => c.valor > 0);
  const avaliadas = modo === 'fechamento'
    ? contas
    : contas.filter((c) => c.pagaEm || (c.dia !== null && hoje > vencimentoEfetivo(e.mesAberto, c.dia)));
  const emDia = avaliadas.filter((c) => c.pagaEm && c.pagaEm <= limiteDaConta(c, e.mesAberto));
  const pontosContas = avaliadas.length > 0 ? (PESO_CONTAS * emDia.length) / avaliadas.length : null;

  const sobra = calcularSobraPrevista(e);
  const pontosAzul = sobra >= e.config.sobraMinima ? PESO_AZUL : sobra >= 0 ? PESO_AZUL / 2 : 0;

  const pesos = PESO_AZUL + (pontosAportes !== null ? PESO_APORTES : 0) + (pontosContas !== null ? PESO_CONTAS : 0);
  const obtidos = pontosAzul + (pontosAportes ?? 0) + (pontosContas ?? 0);

  return {
    total: Math.round((obtidos / pesos) * 100),
    aportes: pontosAportes === null ? null : Math.round(pontosAportes),
    contasEmDia: pontosContas === null ? null : Math.round(pontosContas),
    mesNoAzul: pontosAzul,
  };
}

export function faixaDoScore(total: number): 'verde' | 'amarelo' | 'vermelho' {
  if (total >= 80) return 'verde';
  if (total >= 50) return 'amarelo';
  return 'vermelho';
}

/** Meses fechados seguidos, do mais recente para trás, com score ≥ meta. "Sem registro" quebra a sequência. */
export function sequencia(historico: MesFechado[], metaScore: number): number {
  let n = 0;
  for (let i = historico.length - 1; i >= 0; i--) {
    const h = historico[i];
    if (h.semRegistro || !h.score || h.score.total < metaScore) break;
    n++;
  }
  return n;
}
