/** Mês no formato "AAAA-MM". */
export type Mes = string;
/** Dia no formato "AAAA-MM-DD". */
export type Dia = string;

const NOMES_MES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const doisDigitos = (n: number) => String(n).padStart(2, '0');

function partesDoMes(mes: Mes): [ano: number, mes: number] {
  const [a, m] = mes.split('-').map(Number);
  return [a, m];
}

function montarMes(ano: number, mes: number): Mes {
  return `${ano}-${doisDigitos(mes)}`;
}

/** Dia → mês ("2026-11-10" → "2026-11"). */
export function mesDe(dia: Dia): Mes {
  return dia.slice(0, 7);
}

export function adicionarMeses(mes: Mes, n: number): Mes {
  const [a, m] = partesDoMes(mes);
  const total = a * 12 + (m - 1) + n;
  return montarMes(Math.floor(total / 12), (((total % 12) + 12) % 12) + 1);
}

/** Quantos meses vão de `de` até `ate` (positivo se `ate` for depois). */
export function mesesEntre(de: Mes, ate: Mes): number {
  const [a1, m1] = partesDoMes(de);
  const [a2, m2] = partesDoMes(ate);
  return (a2 - a1) * 12 + (m2 - m1);
}

export function ultimoDiaDoMes(mes: Mes): number {
  const [a, m] = partesDoMes(mes);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

export function primeiroDia(mes: Mes): Dia {
  return `${mes}-01`;
}

/** Dia de vencimento dentro do mês; se o mês não tiver esse dia, usa o último. */
export function vencimentoEfetivo(mes: Mes, dia: number): Dia {
  return `${mes}-${doisDigitos(Math.min(dia, ultimoDiaDoMes(mes)))}`;
}

function paraUTC(dia: Dia): number {
  const [a, m, d] = dia.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
}

/** Dias corridos de `de` até `ate` (positivo se `ate` for depois). */
export function diasEntre(de: Dia, ate: Dia): number {
  return Math.round((paraUTC(ate) - paraUTC(de)) / MS_POR_DIA);
}

/** "2026-03" → "março". */
export function nomeMes(mes: Mes): string {
  return NOMES_MES[partesDoMes(mes)[1] - 1];
}

/** "2027-02" → "fev/27". */
export function rotuloMesCurto(mes: Mes): string {
  const [a] = partesDoMes(mes);
  return `${nomeMes(mes).slice(0, 3)}/${String(a).slice(2)}`;
}

/** Data local do aparelho. Única função impura deste módulo: só a interface usa. */
export function hojeLocal(agora: Date = new Date()): Dia {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}
