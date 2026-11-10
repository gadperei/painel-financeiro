import type { Centavos } from './dinheiro';
import { aporteMensal, alvoDaMeta, jaTenho } from './metas';
import type { Estado, Meta } from '../dados/tipos';

const LIMITE_MESES = 600;
const MESES_DEPOIS_DA_META = 2;

export interface ParametrosSimulacao {
  inicial: Centavos;
  aporte: Centavos;
  alvo: Centavos;
  percentualCdi: number;
  cdiAnual: number;
}

export interface ResultadoSimulacao {
  taxaMensal: number;
  mesesAteAlvo: number | null;
  totalInvestido: Centavos;
  jurosGanhos: Centavos;
  mesesAdiantados: number;
  serieComJuros: Centavos[];
  serieSemJuros: Centavos[];
}

/** §5.5: CDI composto ao mês; saldo(k+1) = saldo(k) × (1 + r) + aporte. */
export function simular(p: ParametrosSimulacao): ResultadoSimulacao {
  const taxaAnual = (p.percentualCdi / 100) * (p.cdiAnual / 100);
  const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;

  const serieComJuros: Centavos[] = [];
  const serieSemJuros: Centavos[] = [];
  let comJuros = p.inicial;
  let semJuros = p.inicial;
  let mesesAteAlvo: number | null = null;

  for (let k = 0; k <= LIMITE_MESES; k++) {
    serieComJuros.push(comJuros);
    serieSemJuros.push(semJuros);
    if (mesesAteAlvo === null && comJuros >= p.alvo) mesesAteAlvo = k;
    if (mesesAteAlvo !== null && k >= mesesAteAlvo + MESES_DEPOIS_DA_META) break;
    comJuros = Math.round(comJuros * (1 + taxaMensal)) + p.aporte;
    semJuros += p.aporte;
  }

  const mesesContados = mesesAteAlvo ?? LIMITE_MESES;
  const totalInvestido = p.inicial + p.aporte * mesesContados;
  const jurosGanhos = Math.max(0, serieComJuros[mesesContados] - totalInvestido);
  const mesesAdiantados = p.aporte > 0 && mesesAteAlvo !== null
    ? Math.max(0, Math.ceil((p.alvo - p.inicial) / p.aporte) - mesesAteAlvo)
    : 0;

  return { taxaMensal, mesesAteAlvo, totalInvestido, jurosGanhos, mesesAdiantados, serieComJuros, serieSemJuros };
}

/** Preenche o simulador com os dados da meta; % do CDI vem da primeira aplicação ligada (ou 100). */
export function parametrosDaMeta(e: Estado, m: Meta): ParametrosSimulacao {
  const ligada = e.aplicacoes.find((a) => a.tipo === 'guardado' && a.metaId === m.id);
  return {
    inicial: jaTenho(e, m.id),
    aporte: aporteMensal(e, m.id),
    alvo: alvoDaMeta(e, m),
    percentualCdi: ligada?.percentualCdi ?? 100,
    cdiAnual: e.config.cdiAnual,
  };
}
