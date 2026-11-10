import { useState } from 'react';
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CampoValor } from '../componentes/CampoValor';
import { CampoTexto } from '../componentes/Campos';
import { useApp } from '../estado/contexto';
import type { Meta } from '../dados/tipos';
import { adicionarMeses, rotuloMesCurto } from '../regras/datas';
import { formatarReais } from '../regras/dinheiro';
import { parametrosDaMeta, simular } from '../regras/simulador';
import { lerDecimal } from '../regras/validacao';

const reaisCurto = (c: number) => `R$ ${Math.round(c / 100).toLocaleString('pt-BR')}`;
const decimal = (n: number) => String(n).replace('.', ',');

function anosEMeses(meses: number): string {
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  if (a === 0) return `${m} ${m === 1 ? 'mês' : 'meses'}`;
  return `${a} ${a === 1 ? 'ano' : 'anos'}${m ? ` e ${m} ${m === 1 ? 'mês' : 'meses'}` : ''}`;
}

/** Simulador de juros compostos aberto a partir de uma meta. Nada aqui é salvo. */
export function Simulador({ meta }: { meta: Meta }) {
  const { estado } = useApp();
  const inicialMeta = parametrosDaMeta(estado, meta);
  const [inicial, setInicial] = useState(inicialMeta.inicial);
  const [aporte, setAporte] = useState(inicialMeta.aporte);
  const [alvo, setAlvo] = useState(inicialMeta.alvo);
  const [pctTexto, setPctTexto] = useState(decimal(inicialMeta.percentualCdi));
  const [cdiTexto, setCdiTexto] = useState(decimal(inicialMeta.cdiAnual));

  const pct = lerDecimal(pctTexto, 0, 1000);
  const cdi = lerDecimal(cdiTexto, 0, 100);
  const ok = pct.valor !== null && cdi.valor !== null;
  const r = ok ? simular({ inicial, aporte, alvo, percentualCdi: pct.valor!, cdiAnual: cdi.valor! }) : null;
  const efetivaAno = ok ? (pct.valor! / 100) * cdi.valor! : 0;

  const dados = r?.serieComJuros.map((v, k) => ({
    mes: rotuloMesCurto(adicionarMeses(estado.mesAberto, k)),
    comJuros: v,
    semJuros: r.serieSemJuros[k],
  })) ?? [];

  return (
    <div className="simulador">
      <div className="grade-2">
        <CampoValor rotulo="Valor inicial" valor={inicial} aoMudar={setInicial} />
        <CampoValor rotulo="Aporte mensal" valor={aporte} aoMudar={setAporte} />
        <CampoValor rotulo="Meta" valor={alvo} aoMudar={setAlvo} />
        <CampoTexto rotulo="% do CDI" valor={pctTexto} aoMudar={setPctTexto} inputMode="decimal" erro={pct.erro ?? (pct.valor === null ? 'Informe' : null)} />
        <CampoTexto rotulo="CDI anual (%)" valor={cdiTexto} aoMudar={setCdiTexto} inputMode="decimal" erro={cdi.erro ?? (cdi.valor === null ? 'Informe' : null)} />
        <div className="campo">
          <span className="rotulo">Rendimento efetivo</span>
          <span className="entrada entrada-leitura num">{ok ? `${efetivaAno.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% a.a.` : '—'}</span>
        </div>
      </div>

      {r && (
        <p className="aviso aviso-info resultado-simulacao">
          {r.mesesAteAlvo === null && 'Com esses valores, a meta leva mais de 50 anos.'}
          {r.mesesAteAlvo === 0 && 'Você já atingiu essa meta. 🎉'}
          {r.mesesAteAlvo !== null && r.mesesAteAlvo > 0 && (
            <>
              Você chega a <strong>{formatarReais(alvo)}</strong> em <strong>{r.mesesAteAlvo} {r.mesesAteAlvo === 1 ? 'mês' : 'meses'}</strong>{r.mesesAteAlvo >= 12 && <> (~{anosEMeses(r.mesesAteAlvo)})</>},
              aportando {formatarReais(aporte)}/mês a {decimal(pct.valor!)}% do CDI. Do total, <strong>{formatarReais(r.totalInvestido)}</strong> é
              dinheiro seu e <strong>{formatarReais(r.jurosGanhos)}</strong> são juros.
              {r.mesesAdiantados > 0 && <> Os juros adiantam ~{r.mesesAdiantados} meses em relação a guardar sem render.</>}
            </>
          )}
        </p>
      )}

      {r && (
        <div className="grafico-simulador" aria-hidden="true">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={dados} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="mes" interval={Math.max(0, Math.floor(dados.length / 5))} tickLine={false} tick={{ fontSize: 11, fill: 'var(--texto-suave)' }} />
              <YAxis width={78} tickFormatter={reaisCurto} tick={{ fontSize: 10, fill: 'var(--texto-suave)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => formatarReais(Number(v))} labelStyle={{ color: '#18202f' }} />
              <ReferenceLine y={alvo} stroke="var(--vermelho)" strokeDasharray="5 4" />
              <Area type="monotone" dataKey="comJuros" name="Com juros" stroke="var(--primaria)" fill="var(--primaria)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="semJuros" name="Sem juros" stroke="var(--texto-suave)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="legenda-simples">
            <span className="bolinha" style={{ background: 'var(--primaria)' }} /> com juros
            <span className="bolinha" style={{ background: 'var(--texto-suave)' }} /> sem juros
            <span className="traco" /> meta
          </p>
        </div>
      )}

      <p className="campo-dica">Estimativa bruta, sem imposto de renda. Rentabilidade passada não garante rentabilidade futura.</p>
    </div>
  );
}
