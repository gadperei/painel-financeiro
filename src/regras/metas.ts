import type { Centavos, Estado, Meta } from '../dados/tipos';

export type Prazo = { tipo: 'atingida' } | { tipo: 'sem-aporte' } | { tipo: 'meses'; meses: number };

/** Soma das aplicações "guardado" ligadas à meta. */
export function jaTenho(e: Estado, metaId: string): Centavos {
  return e.aplicacoes
    .filter((a) => a.tipo === 'guardado' && a.metaId === metaId)
    .reduce((s, a) => s + a.saldo, 0);
}

/** Alvo automático = multiplicador × soma de todas as contas (pagas ou não). */
export function alvoDaMeta(e: Estado, m: Meta): Centavos {
  if (!m.alvoAutomatico) return m.alvo;
  return e.config.multiplicadorReserva * e.contas.reduce((s, c) => s + c.valor, 0);
}

/** Soma dos aportes ligados à meta, inclusive os que não saem do bolso. */
export function aporteMensal(e: Estado, metaId: string): Centavos {
  return e.aportes.filter((a) => a.metaId === metaId).reduce((s, a) => s + a.valor, 0);
}

export function prazoSemJuros(e: Estado, m: Meta): Prazo {
  const falta = alvoDaMeta(e, m) - jaTenho(e, m.id);
  if (falta <= 0) return { tipo: 'atingida' };
  const aporte = aporteMensal(e, m.id);
  if (aporte <= 0) return { tipo: 'sem-aporte' };
  return { tipo: 'meses', meses: Math.ceil(falta / aporte) };
}

/** De 0 a 100. */
export function percentualAtingido(e: Estado, m: Meta): number {
  const alvo = alvoDaMeta(e, m);
  if (alvo <= 0) return 100;
  return Math.min(100, (jaTenho(e, m.id) / alvo) * 100);
}
