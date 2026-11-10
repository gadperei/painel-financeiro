import { mesDe } from '../regras/datas';
import { VERSAO_ATUAL } from './migracoes';
import type { Categoria, Config, Dia, Estado } from './tipos';

export const CONFIG_PADRAO: Config = {
  cdiAnual: 14.9,
  sobraMinima: 0,
  metaScore: 70,
  multiplicadorReserva: 6,
  recompensaPercentual: 50,
  recompensaMinima: 10000,
};

export const ID_OUTROS = 'outros';

export const CATEGORIAS_PADRAO: Categoria[] = [
  { id: 'mercado', nome: 'Mercado', cor: '#2f6fed' },
  { id: 'transporte', nome: 'Transporte', cor: '#e07b00' },
  { id: 'alimentacao-fora', nome: 'Alimentação fora', cor: '#d13b6b' },
  { id: 'lazer', nome: 'Lazer', cor: '#7c4dff' },
  { id: 'saude', nome: 'Saúde', cor: '#1f9d6b' },
  { id: 'casa', nome: 'Casa', cor: '#8d6e63' },
  { id: ID_OUTROS, nome: 'Outros', cor: '#7b8494' },
];

export function estadoVazio(hoje: Dia): Estado {
  return {
    versao: VERSAO_ATUAL,
    modoExemplo: false,
    mesAberto: mesDe(hoje),
    config: { ...CONFIG_PADRAO },
    rendas: [],
    contas: [],
    aplicacoes: [],
    metas: [],
    aportes: [],
    parcelamentos: [],
    categorias: CATEGORIAS_PADRAO.map((c) => ({ ...c })),
    gastos: [],
    historico: [],
    ultimoBackup: null,
    recompensaDispensadaEm: null,
    copiaAntesDoFechamento: null,
  };
}
