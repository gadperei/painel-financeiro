import type { Centavos } from './dinheiro';

export function erroNome(nome: string): string | null {
  return nome.trim() ? null : 'Informe um nome';
}

export function erroValor(valor: Centavos): string | null {
  return valor > 0 ? null : 'Informe um valor';
}

/** Inteiro entre min e max (inclusive); null se vazio, decimal ou fora dos limites. */
export function lerInteiro(texto: string, min: number, max: number): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
}

/** Dia do mês: vazio = "sem dia fixo" (null, sem erro). */
export function lerDia(texto: string): { dia: number | null; erro: string | null } {
  if (!texto.trim()) return { dia: null, erro: null };
  const dia = lerInteiro(texto, 1, 31);
  return dia === null ? { dia: null, erro: 'Dia entre 1 e 31' } : { dia, erro: null };
}
