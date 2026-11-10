import type { Centavos, Estado } from '../dados/tipos';

const soma = (valores: Centavos[]) => valores.reduce((s, v) => s + v, 0);

export function caixaOperacional(e: Estado): Centavos {
  return soma(e.aplicacoes.filter((a) => a.tipo === 'operacional').map((a) => a.saldo));
}

/**
 * §5.1: caixa operacional + rendas sem "recebi" − contas sem "pago"
 * − aportes sem "feito" que saem do bolso.
 */
export function calcularSobraPrevista(e: Estado): Centavos {
  const aReceber = soma(e.rendas.filter((r) => !r.recebidaEm).map((r) => r.valor));
  const aPagar = soma(e.contas.filter((c) => !c.pagaEm).map((c) => c.valor));
  const aportesPendentes = soma(e.aportes.filter((a) => a.saiDoBolso && !a.feitoEm).map((a) => a.valor));
  return caixaOperacional(e) + aReceber - aPagar - aportesPendentes;
}
