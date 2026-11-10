/** Valor em centavos inteiros (R$ 12,34 → 1234). */
export type Centavos = number;

const FORMATO = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MAX_DIGITOS = 12;

/** 123456 → "R$ 1.234,56" (com espaço normal, não o espaço especial do Intl). */
export function formatarReais(c: Centavos): string {
  return FORMATO.format(c / 100).replace(/ /g, ' ');
}

/** Máscara de centavos: aproveita só os dígitos, no máximo 12. "1234" → 1234. */
export function centavosDeDigitos(texto: string): Centavos {
  const digitos = texto.replace(/\D/g, '').slice(0, MAX_DIGITOS);
  return digitos ? Number(digitos) : 0;
}
