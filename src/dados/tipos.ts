import type { Centavos } from '../regras/dinheiro';
import type { Dia, Mes } from '../regras/datas';

export type { Centavos, Dia, Mes };

export interface Estado {
  versao: number;                         // formato dos dados; começa em 1
  modoExemplo: boolean;                   // true enquanto mostra os dados fictícios
  mesAberto: Mes;
  config: Config;
  rendas: Renda[];
  contas: Conta[];
  aplicacoes: Aplicacao[];
  metas: Meta[];
  aportes: Aporte[];
  parcelamentos: Parcelamento[];
  categorias: Categoria[];
  gastos: Gasto[];                        // de todos os meses; o mês vem da data
  historico: MesFechado[];
  ultimoBackup: Dia | null;
  recompensaDispensadaEm: Mes | null;     // usuário tocou "Agora não" neste mês
  copiaAntesDoFechamento: Omit<Estado, 'copiaAntesDoFechamento'> | null;
}

export interface Config {
  cdiAnual: number;              // % ao ano, ex.: 14.9
  sobraMinima: Centavos;         // padrão 0
  metaScore: number;             // padrão 70
  multiplicadorReserva: number;  // padrão 6
  recompensaPercentual: number;  // padrão 50
  recompensaMinima: Centavos;    // padrão 10000 (R$ 100)
}

export interface Renda { id: string; nome: string; dia: number | null; valor: Centavos; recebidaEm: Dia | null; }
export interface Conta { id: string; nome: string; dia: number | null; valor: Centavos; pagaEm: Dia | null; }
export interface Aplicacao {
  id: string; nome: string; saldo: Centavos; tipo: 'operacional' | 'guardado';
  metaId: string | null; percentualCdi: number | null;
}
export interface Meta { id: string; nome: string; alvo: Centavos; alvoAutomatico: boolean; cor: string; }
export interface Aporte {
  id: string; nome: string; valor: Centavos; metaId: string | null;
  saiDoBolso: boolean; feitoEm: Dia | null;
}
export interface Parcelamento { id: string; nome: string; valorParcela: Centavos; parcelaAtual: number; totalParcelas: number; }
export interface Categoria { id: string; nome: string; cor: string; }
export interface Gasto { id: string; data: Dia; valor: Centavos; categoriaId: string; descricao?: string; }

export interface MesFechado {
  mes: Mes;
  semRegistro: boolean;          // mês em que o app não foi usado
  renda: Centavos;
  contasPagas: Centavos;
  caixaOperacional: Centavos;
  porMeta: { metaId: string; nome: string; valor: Centavos }[];
  sobra: Centavos;
  score: { total: number; aportes: number | null; contasEmDia: number | null; mesNoAzul: number } | null;
  gastosPorCategoria: { categoriaId: string; nome: string; total: Centavos }[];
  recompensaSugerida: Centavos | null;
}
