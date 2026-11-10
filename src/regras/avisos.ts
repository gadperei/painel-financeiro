import { diasEntre, vencimentoEfetivo, type Dia, type Mes } from './datas';
import type { Conta, Estado } from '../dados/tipos';

export type Aviso = 'atrasada' | 'em-breve' | null;

const DIAS_EM_BREVE = 3;

function pendenteComDia(c: Conta): c is Conta & { dia: number } {
  return !c.pagaEm && c.dia !== null && c.valor > 0;
}

/** §5.2: "atrasada" se passou do vencimento; "em-breve" se vence hoje ou nos próximos 3 dias. */
export function avisoDaConta(c: Conta, mesAberto: Mes, hoje: Dia): Aviso {
  if (!pendenteComDia(c)) return null;
  const faltam = diasEntre(hoje, vencimentoEfetivo(mesAberto, c.dia));
  if (faltam < 0) return 'atrasada';
  if (faltam <= DIAS_EM_BREVE) return 'em-breve';
  return null;
}

/** Contas pendentes com dia fixo, da que vence primeiro para a última. */
export function proximosVencimentos(e: Estado, _hoje: Dia, limite = 3): Conta[] {
  return e.contas
    .filter(pendenteComDia)
    .map((c) => ({ c, venc: vencimentoEfetivo(e.mesAberto, c.dia) }))
    .sort((a, b) => a.venc.localeCompare(b.venc))
    .slice(0, limite)
    .map((x) => x.c);
}
