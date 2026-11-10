import { adicionarMeses, nomeMes, type Mes } from './datas';
import { formatarReais, type Centavos } from './dinheiro';
import type { Parcelamento } from '../dados/tipos';

const MESES_ALIVIO = 6;

export function restantes(p: Parcelamento): number {
  return Math.max(0, p.totalParcelas - p.parcelaAtual);
}

export function mesDeTermino(p: Parcelamento, mesAberto: Mes): Mes {
  return adicionarMeses(mesAberto, restantes(p));
}

/** Soma das parcelas que ainda estarão ativas daqui a k meses (k = 0 é o mês aberto). */
export function encargo(ps: Parcelamento[], k: number): Centavos {
  return ps.filter((p) => p.valorParcela > 0 && restantes(p) >= k).reduce((s, p) => s + p.valorParcela, 0);
}

export function serieAlivio(ps: Parcelamento[], mesAberto: Mes): { mes: Mes; valor: Centavos }[] {
  return Array.from({ length: MESES_ALIVIO }, (_, k) => ({ mes: adicionarMeses(mesAberto, k), valor: encargo(ps, k) }));
}

/** §5.3: primeiro mês em que o total das parcelas cai. null quando não há parcelamentos. */
export function textoAlivio(ps: Parcelamento[], mesAberto: Mes): string | null {
  if (!ps.some((p) => p.valorParcela > 0)) return null;
  const s = serieAlivio(ps, mesAberto);
  for (let k = 1; k < s.length; k++) {
    const antes = s[k - 1].valor;
    const depois = s[k].valor;
    if (depois < antes) {
      return `Em ${nomeMes(s[k].mes)}, as parcelas caem de ${formatarReais(antes)} para ${formatarReais(depois)} (−${formatarReais(antes - depois)}/mês)`;
    }
  }
  return 'Nenhuma parcela termina nos próximos 6 meses';
}

/** Avança n meses e remove os parcelamentos que passaram da última parcela. */
export function avancarParcelas(ps: Parcelamento[], n: number): Parcelamento[] {
  return ps.map((p) => ({ ...p, parcelaAtual: p.parcelaAtual + n })).filter((p) => p.parcelaAtual <= p.totalParcelas);
}
