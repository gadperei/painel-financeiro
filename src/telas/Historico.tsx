import { useState } from 'react';
import {
  Bar, BarChart, Cell, ComposedChart, LabelList, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card } from '../componentes/Card';
import { PainelInferior } from '../componentes/PainelInferior';
import type { MesFechado } from '../dados/tipos';
import { useApp } from '../estado/contexto';
import { rotuloMesCurto } from '../regras/datas';
import { formatarReais } from '../regras/dinheiro';
import { faixaDoScore } from '../regras/score';
import { DetalheMes } from './DetalheMes';
import { mesPorExtenso } from './formato';

const COR_FAIXA = { verde: 'var(--grafico-verde)', amarelo: 'var(--grafico-amarelo)', vermelho: 'var(--grafico-vermelho)' };
const CORES_RESERVA = ['#5b3df5', '#1f9d6b', '#2f6fed', '#e07b00', '#d13b6b'];
const reaisCurto = (c: number) => `R$ ${Math.round(c / 100).toLocaleString('pt-BR')}`;
const eixo = { fontSize: 11, fill: 'var(--texto-suave)' };

export function Historico() {
  const { estado } = useApp();
  const [aberto, setAberto] = useState<MesFechado | null>(null);
  const { historico, config } = estado;

  if (historico.length === 0) {
    return <Card><p className="vazio">Nenhum mês fechado ainda. O primeiro aparece aqui quando você fechar o mês.</p></Card>;
  }

  const dadosScore = historico.map((h) => ({
    mes: rotuloMesCurto(h.mes),
    score: h.score?.total ?? 0,
    rotulo: h.semRegistro ? 'sem registro' : String(h.score?.total ?? ''),
    cor: h.score ? COR_FAIXA[faixaDoScore(h.score.total)] : 'var(--superficie-2)',
  }));

  // Evolução: só meses com registro (meses sem uso têm tudo zerado e distorceriam as linhas).
  const comRegistro = historico.filter((h) => !h.semRegistro);
  const metas = new Map<string, string>();
  comRegistro.forEach((h) => h.porMeta.forEach((p) => metas.set(p.metaId, p.nome)));
  const corDaMeta = (id: string, i: number) => estado.metas.find((m) => m.id === id)?.cor ?? CORES_RESERVA[i % CORES_RESERVA.length];
  const dadosEvolucao = comRegistro.map((h) => ({
    mes: rotuloMesCurto(h.mes),
    caixa: h.caixaOperacional,
    sobra: h.sobra,
    ...Object.fromEntries(h.porMeta.map((p) => [p.metaId, p.valor])),
  }));

  return (
    <>
      <Card titulo="Score mês a mês" acao={<span className="suave">meta {config.metaScore}</span>}>
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={dadosScore} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={eixo} />
              <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={eixo} axisLine={false} tickLine={false} />
              <ReferenceLine y={config.metaScore} stroke="var(--texto-suave)" strokeDasharray="4 4" />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {dadosScore.map((d) => <Cell key={d.mes} fill={d.cor} />)}
                <LabelList dataKey="rotulo" position="top" style={{ fontSize: 11, fill: 'var(--texto-2)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card titulo="Evolução">
        {dadosEvolucao.length === 0 ? <p className="vazio">Sem meses com registro.</p> : (
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={dadosEvolucao} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={eixo} />
                <YAxis width={78} tickFormatter={reaisCurto} tick={{ ...eixo, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown) => formatarReais(Number(v))} labelStyle={{ color: '#18202f' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sobra" name="Sobra do mês" fill="var(--primaria)" fillOpacity={0.25} isAnimationActive={false} />
                <Line dataKey="caixa" name="Caixa operacional" stroke="var(--texto-2)" strokeDasharray="6 3" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                {[...metas.entries()].map(([id, nome], i) => (
                  <Line key={id} dataKey={id} name={nome} stroke={corDaMeta(id, i)} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card titulo="Meses fechados">
        <ul className="linhas">
          {[...historico].reverse().map((h) => (
            <li key={h.mes} className="linha">
              <button type="button" className="linha-toque" onClick={() => setAberto(h)}>
                <span className="linha-info">
                  <span className="linha-nome">{mesPorExtenso(h.mes)}</span>
                  {!h.semRegistro && <span className="linha-detalhe"> · sobra {formatarReais(h.sobra)}</span>}
                </span>
                {h.score ? (
                  <span className={`selo selo-${faixaDoScore(h.score.total)}`}>score {h.score.total}</span>
                ) : (
                  <span className="selo">sem registro</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <PainelInferior aberto={aberto !== null} titulo={aberto ? mesPorExtenso(aberto.mes) : ''} aoFechar={() => setAberto(null)}>
        {aberto && <DetalheMes registro={aberto} />}
      </PainelInferior>
    </>
  );
}
