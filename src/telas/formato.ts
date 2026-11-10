import type { Dia, Mes } from '../regras/datas';
import { nomeMes } from '../regras/datas';

/** "2026-11-10" → "10/11/2026". */
export function formatarData(dia: Dia): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return '—';
  const [a, m, d] = dia.split('-');
  return `${d}/${m}/${a}`;
}

/** "2026-11-10" → "10/11". */
export function formatarDiaCurto(dia: Dia): string {
  const [, m, d] = dia.split('-');
  return `${d}/${m}`;
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "2026-11" → "Novembro de 2026". */
export function mesPorExtenso(mes: Mes): string {
  return `${capitalizar(nomeMes(mes))} de ${mes.slice(0, 4)}`;
}
