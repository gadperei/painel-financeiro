import { z } from 'zod';
import type { Estado } from './tipos';

const centavos = z.number().int();
const mes = z.string().regex(/^\d{4}-\d{2}$/);
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const diaDoMes = z.number().int().min(1).max(31).nullable();
const id = z.string().min(1);

const config = z.object({
  cdiAnual: z.number(),
  sobraMinima: centavos,
  metaScore: z.number(),
  multiplicadorReserva: z.number(),
  recompensaPercentual: z.number(),
  recompensaMinima: centavos,
});

const renda = z.object({ id, nome: z.string(), dia: diaDoMes, valor: centavos, recebidaEm: dia.nullable() });
const conta = z.object({ id, nome: z.string(), dia: diaDoMes, valor: centavos, pagaEm: dia.nullable() });
const aplicacao = z.object({
  id, nome: z.string(), saldo: centavos, tipo: z.enum(['operacional', 'guardado']),
  metaId: z.string().nullable(), percentualCdi: z.number().nullable(),
});
const meta = z.object({ id, nome: z.string(), alvo: centavos, alvoAutomatico: z.boolean(), cor: z.string() });
const aporte = z.object({
  id, nome: z.string(), valor: centavos, metaId: z.string().nullable(),
  saiDoBolso: z.boolean(), feitoEm: dia.nullable(),
});
const parcelamento = z.object({
  id, nome: z.string(), valorParcela: centavos,
  parcelaAtual: z.number().int(), totalParcelas: z.number().int(),
});
const categoria = z.object({ id, nome: z.string(), cor: z.string() });
const gasto = z.object({ id, data: dia, valor: centavos, categoriaId: z.string(), descricao: z.string().optional() });

const mesFechado = z.object({
  mes,
  semRegistro: z.boolean(),
  renda: centavos,
  contasPagas: centavos,
  caixaOperacional: centavos,
  porMeta: z.array(z.object({ metaId: z.string(), nome: z.string(), valor: centavos })),
  sobra: centavos,
  score: z.object({
    total: z.number(), aportes: z.number().nullable(),
    contasEmDia: z.number().nullable(), mesNoAzul: z.number(),
  }).nullable(),
  gastosPorCategoria: z.array(z.object({ categoriaId: z.string(), nome: z.string(), total: centavos })),
  recompensaSugerida: centavos.nullable(),
});

const base = z.object({
  versao: z.number().int(),
  modoExemplo: z.boolean(),
  mesAberto: mes,
  config,
  rendas: z.array(renda),
  contas: z.array(conta),
  aplicacoes: z.array(aplicacao),
  metas: z.array(meta),
  aportes: z.array(aporte),
  parcelamentos: z.array(parcelamento),
  categorias: z.array(categoria),
  gastos: z.array(gasto),
  historico: z.array(mesFechado),
  ultimoBackup: dia.nullable(),
  recompensaDispensadaEm: mes.nullable(),
});

const estado = base.extend({ copiaAntesDoFechamento: base.nullable() });

/** Devolve o estado validado (sem campos desconhecidos) ou null se a estrutura estiver quebrada. */
export function validarEstado(x: unknown): Estado | null {
  const r = estado.safeParse(x);
  return r.success ? (r.data as Estado) : null;
}
