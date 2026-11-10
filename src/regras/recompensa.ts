import { nomeMes, type Dia } from './datas';
import { formatarReais, type Centavos } from './dinheiro';
import { percentualAtingido } from './metas';
import { calcularSobraPrevista } from './projecao';
import { calcularScore, type ModoScore } from './score';
import type { Estado } from '../dados/tipos';

export interface Recompensa {
  livre: Centavos;
  sugestao: Centavos;
  ideia: string;
  metaSugerida: string | null;
  texto: string;
}

const MULTIPLO = 1000; // R$ 10

function ideiaPara(sugestao: Centavos): string {
  if (sugestao < 30000) return 'um jantar ou passeio';
  if (sugestao <= 150000) return 'um fim de semana fora';
  return 'uma viagem';
}

const aportesDoBolso = (e: Estado) => e.aportes.filter((a) => a.saiDoBolso && a.valor > 0);

/** Nada pendente no mês: todas as contas pagas e todos os aportes do bolso feitos. */
export function semPendencias(e: Estado): boolean {
  return e.contas.filter((c) => c.valor > 0).every((c) => c.pagaEm) && aportesDoBolso(e).every((a) => a.feitoEm);
}

/** §5.9 — sugere usar parte da sobra quando o mês foi bom. */
export function calcularRecompensa(e: Estado, hoje: Dia, modo: ModoScore): Recompensa | null {
  const { config } = e;
  if (calcularScore(e, hoje, modo).total < config.metaScore) return null;
  if (!aportesDoBolso(e).every((a) => a.feitoEm)) return null;
  const sobra = calcularSobraPrevista(e);
  if (sobra <= config.sobraMinima) return null;

  const livre = sobra - config.sobraMinima;
  const sugestao = Math.floor((livre * config.recompensaPercentual) / 100 / MULTIPLO) * MULTIPLO;
  if (sugestao < config.recompensaMinima) return null;

  const ideia = ideiaPara(sugestao);
  const abertas = e.metas
    .map((m) => ({ m, pct: percentualAtingido(e, m) }))
    .filter((x) => x.pct < 100);
  const maisLonge = abertas.reduce<(typeof abertas)[number] | null>(
    (menor, x) => (menor === null || x.pct < menor.pct ? x : menor), null);
  const metaSugerida = maisLonge?.m.nome ?? null;

  const texto =
    `Você bateu suas metas de ${nomeMes(e.mesAberto)} e sobraram ${formatarReais(livre)} além do planejado. ` +
    `Que tal separar ${formatarReais(sugestao)} para ${ideia}?` +
    (metaSugerida ? ` O resto pode adiantar a meta ${metaSugerida}.` : '');

  return { livre, sugestao, ideia, metaSugerida, texto };
}

/** O card do Início: só sem pendências e se não foi dispensado neste mês. */
export function recompensaDoCard(e: Estado, hoje: Dia): Recompensa | null {
  if (!semPendencias(e) || e.recompensaDispensadaEm === e.mesAberto) return null;
  return calcularRecompensa(e, hoje, 'parcial');
}
