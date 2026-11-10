// Construtores de dados para os testes. Só os testes importam este arquivo.
import { estadoVazio } from '../dados/padroes';
import type {
  Aplicacao, Aporte, Conta, Estado, Gasto, MesFechado, Meta, Parcelamento, Renda,
} from '../dados/tipos';

export const HOJE = '2026-11-10';

let contador = 0;
const novoId = () => `id-${++contador}`;

export function criarEstado(s: Partial<Estado> = {}): Estado {
  return { ...estadoVazio(HOJE), ...s };
}

export const conta = (p: Partial<Conta> = {}): Conta => ({
  id: novoId(), nome: 'Conta', dia: null, valor: 10000, pagaEm: null, ...p,
});

export const renda = (p: Partial<Renda> = {}): Renda => ({
  id: novoId(), nome: 'Renda', dia: null, valor: 100000, recebidaEm: null, ...p,
});

export const aporte = (p: Partial<Aporte> = {}): Aporte => ({
  id: novoId(), nome: 'Aporte', valor: 10000, metaId: null, saiDoBolso: true, feitoEm: null, ...p,
});

export const aplicacao = (p: Partial<Aplicacao> = {}): Aplicacao => ({
  id: novoId(), nome: 'Aplicação', saldo: 0, tipo: 'operacional', metaId: null, percentualCdi: null, ...p,
});

export const meta = (p: Partial<Meta> = {}): Meta => ({
  id: novoId(), nome: 'Meta', alvo: 100000, alvoAutomatico: false, cor: '#5b3df5', ...p,
});

export const parcelamento = (p: Partial<Parcelamento> = {}): Parcelamento => ({
  id: novoId(), nome: 'Parcelamento', valorParcela: 10000, parcelaAtual: 1, totalParcelas: 3, ...p,
});

export const gasto = (p: Partial<Gasto> = {}): Gasto => ({
  id: novoId(), data: HOJE, valor: 1000, categoriaId: 'mercado', ...p,
});

export const mesFechado = (p: Partial<MesFechado> = {}): MesFechado => ({
  mes: '2026-10',
  semRegistro: false,
  renda: 0,
  contasPagas: 0,
  caixaOperacional: 0,
  porMeta: [],
  sobra: 0,
  score: null,
  gastosPorCategoria: [],
  recompensaSugerida: null,
  ...p,
});
