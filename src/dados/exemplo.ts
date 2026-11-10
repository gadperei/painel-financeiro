// Dados 100% fictícios para o primeiro acesso. Determinístico: as datas saem de "hoje".
import { adicionarMeses } from '../regras/datas';
import { estadoVazio } from './padroes';
import type { Dia, Estado, Gasto, MesFechado } from './tipos';

const doisDigitos = (n: number) => String(n).padStart(2, '0');

// [dia do mês, categoria, valor em centavos, descrição]
const GASTOS_DO_MES: [number, string, number, string][] = [
  [1, 'mercado', 18740, 'Compra da semana'],
  [1, 'transporte', 2200, 'App de corrida'],
  [2, 'alimentacao-fora', 3890, 'Almoço'],
  [3, 'saude', 6450, 'Farmácia'],
  [4, 'mercado', 4320, 'Padaria e hortifruti'],
  [5, 'transporte', 25000, 'Combustível'],
  [6, 'lazer', 5990, 'Cinema'],
  [7, 'casa', 8900, 'Material de limpeza'],
  [8, 'mercado', 21530, 'Compra da semana'],
  [9, 'alimentacao-fora', 7200, 'Pizza'],
  [10, 'transporte', 1850, 'Estacionamento'],
  [11, 'outros', 4500, 'Presente'],
  [12, 'mercado', 3980, 'Açougue'],
  [13, 'lazer', 12000, 'Show'],
  [14, 'alimentacao-fora', 2950, 'Lanche'],
  [15, 'mercado', 19870, 'Compra da semana'],
  [16, 'saude', 15000, 'Consulta'],
  [17, 'transporte', 2400, 'App de corrida'],
  [18, 'casa', 6400, 'Lâmpadas e pilhas'],
  [19, 'alimentacao-fora', 5400, 'Jantar'],
  [20, 'mercado', 5210, 'Feira'],
  [21, 'lazer', 3500, 'Parque'],
  [22, 'transporte', 23000, 'Combustível'],
  [24, 'mercado', 20990, 'Compra da semana'],
  [26, 'alimentacao-fora', 3100, 'Café'],
];

// Scores variados para os 4 meses anteriores (aportes + contas + azul = total).
const HISTORICO: { aportes: number; contas: number; azul: number; caixa: number; reserva: number; viagem: number; sobra: number; recompensa: number | null }[] = [
  { aportes: 13, contas: 15, azul: 30, caixa: 180000, reserva: 330000, viagem: 0, sobra: 12000, recompensa: null },
  { aportes: 27, contas: 15, azul: 30, caixa: 205000, reserva: 360000, viagem: 40000, sobra: 35000, recompensa: null },
  { aportes: 40, contas: 15, azul: 30, caixa: 230000, reserva: 390000, viagem: 80000, sobra: 48000, recompensa: null },
  { aportes: 40, contas: 21, azul: 30, caixa: 245000, reserva: 420000, viagem: 100000, sobra: 61000, recompensa: 25000 },
];

export function gerarExemplo(hoje: Dia): Estado {
  const base = estadoVazio(hoje);
  const mes = base.mesAberto;
  const diaHoje = Number(hoje.slice(8, 10));
  const data = (dia: number): Dia => `${mes}-${doisDigitos(Math.min(dia, diaHoje))}`;
  const ate = (dia: number): Dia | null => (dia < diaHoje ? `${mes}-${doisDigitos(dia)}` : null);

  const gastos: Gasto[] = GASTOS_DO_MES.map(([dia, categoriaId, valor, descricao], i) => ({
    id: `ex-gasto-${i + 1}`, data: data(dia), valor, categoriaId, descricao,
  }));

  const historico: MesFechado[] = HISTORICO.map((h, i) => {
    const m = adicionarMeses(mes, i - HISTORICO.length);
    return {
      mes: m,
      semRegistro: false,
      renda: 500000,
      contasPagas: 394470 - i * 1500,
      caixaOperacional: h.caixa,
      porMeta: [
        { metaId: 'ex-meta-reserva', nome: 'Reserva de emergência', valor: h.reserva },
        { metaId: 'ex-meta-viagem', nome: 'Viagem de férias', valor: h.viagem },
      ],
      sobra: h.sobra,
      score: { total: h.aportes + h.contas + h.azul, aportes: h.aportes, contasEmDia: h.contas, mesNoAzul: h.azul },
      gastosPorCategoria: [
        { categoriaId: 'mercado', nome: 'Mercado', total: 92000 + i * 3500 },
        { categoriaId: 'transporte', nome: 'Transporte', total: 54000 - i * 2000 },
        { categoriaId: 'alimentacao-fora', nome: 'Alimentação fora', total: 26000 + i * 1200 },
        { categoriaId: 'lazer', nome: 'Lazer', total: 18000 + (i % 2) * 6000 },
      ],
      recompensaSugerida: h.recompensa,
    };
  });

  return {
    ...base,
    modoExemplo: true,
    rendas: [
      { id: 'ex-renda-salario', nome: 'Salário', dia: 5, valor: 420000, recebidaEm: ate(5) },
      { id: 'ex-renda-extra', nome: 'Trabalho extra', dia: null, valor: 80000, recebidaEm: null },
    ],
    contas: [
      { id: 'ex-conta-aluguel', nome: 'Aluguel', dia: 10, valor: 150000, pagaEm: ate(10) },
      { id: 'ex-conta-internet', nome: 'Internet', dia: 7, valor: 11990, pagaEm: null },
      { id: 'ex-conta-cartao', nome: 'Cartão de crédito', dia: 15, valor: 98000, pagaEm: ate(15) },
      { id: 'ex-conta-luz', nome: 'Luz', dia: 20, valor: 18500, pagaEm: ate(20) },
      { id: 'ex-conta-celular', nome: 'Celular', dia: 25, valor: 5990, pagaEm: null },
      { id: 'ex-conta-academia', nome: 'Academia', dia: null, valor: 9990, pagaEm: null },
    ],
    aplicacoes: [
      { id: 'ex-apl-conta', nome: 'Conta corrente', saldo: 250000, tipo: 'operacional', metaId: null, percentualCdi: null },
      { id: 'ex-apl-reserva', nome: 'CDB liquidez diária', saldo: 450000, tipo: 'guardado', metaId: 'ex-meta-reserva', percentualCdi: 100 },
      { id: 'ex-apl-viagem', nome: 'Caixinha da viagem', saldo: 120000, tipo: 'guardado', metaId: 'ex-meta-viagem', percentualCdi: 110 },
    ],
    metas: [
      { id: 'ex-meta-reserva', nome: 'Reserva de emergência', alvo: 0, alvoAutomatico: true, cor: '#1f9d6b' },
      { id: 'ex-meta-viagem', nome: 'Viagem de férias', alvo: 600000, alvoAutomatico: false, cor: '#5b3df5' },
    ],
    aportes: [
      { id: 'ex-aporte-reserva', nome: 'Reserva', valor: 30000, metaId: 'ex-meta-reserva', saiDoBolso: true, feitoEm: ate(6) },
      { id: 'ex-aporte-viagem', nome: 'Viagem', valor: 40000, metaId: 'ex-meta-viagem', saiDoBolso: true, feitoEm: null },
      { id: 'ex-aporte-familia', nome: 'Viagem — parte da família', valor: 40000, metaId: 'ex-meta-viagem', saiDoBolso: false, feitoEm: ate(8) },
    ],
    parcelamentos: [
      { id: 'ex-parc-notebook', nome: 'Notebook', valorParcela: 25000, parcelaAtual: 3, totalParcelas: 10 },
      { id: 'ex-parc-geladeira', nome: 'Geladeira', valorParcela: 18000, parcelaAtual: 5, totalParcelas: 6 },
      { id: 'ex-parc-curso', nome: 'Curso online', valorParcela: 9000, parcelaAtual: 1, totalParcelas: 4 },
    ],
    gastos,
    historico,
  };
}
