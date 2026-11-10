import { useState } from 'react';
import { Card } from '../componentes/Card';
import { PainelInferior } from '../componentes/PainelInferior';
import type { Aplicacao, Meta } from '../dados/tipos';
import { useApp } from '../estado/contexto';
import { formatarReais } from '../regras/dinheiro';
import { alvoDaMeta, jaTenho, percentualAtingido, prazoSemJuros, type Prazo } from '../regras/metas';
import { caixaOperacional } from '../regras/projecao';
import { FormAplicacao } from './formularios/FormAplicacao';
import { FormMeta } from './formularios/FormMeta';
import { Simulador } from './Simulador';

type Painel =
  | { tipo: 'aplicacao'; item?: Aplicacao }
  | { tipo: 'meta'; item?: Meta }
  | { tipo: 'simulador'; item: Meta };

function textoPrazo(p: Prazo): string {
  if (p.tipo === 'atingida') return 'meta atingida ✅';
  if (p.tipo === 'sem-aporte') return 'sem aporte planejado';
  return `faltam ${p.meses} ${p.meses === 1 ? 'mês' : 'meses'} (sem juros)`;
}

function tituloPainel(p: Painel): string {
  if (p.tipo === 'simulador') return `Simulador — ${p.item.nome}`;
  if (p.tipo === 'aplicacao') return p.item ? 'Editar aplicação' : 'Nova aplicação';
  return p.item ? 'Editar meta' : 'Nova meta';
}

export function Metas() {
  const { estado } = useApp();
  const [painel, setPainel] = useState<Painel | null>(null);
  const fechar = () => setPainel(null);
  const nomeMeta = (id: string | null) => estado.metas.find((m) => m.id === id)?.nome;
  const totalGuardado = estado.aplicacoes.filter((a) => a.tipo === 'guardado').reduce((s, a) => s + a.saldo, 0);

  return (
    <>
      <Card titulo="Metas" acao={<button type="button" className="botao-texto" onClick={() => setPainel({ tipo: 'meta' })}>+ adicionar</button>}>
        {estado.metas.length === 0 ? <p className="vazio">Nenhuma meta. Crie uma, como a reserva de emergência.</p> : (
          <ul className="metas">
            {estado.metas.map((m) => {
              const pct = percentualAtingido(estado, m);
              return (
                <li key={m.id} className="meta">
                  <button type="button" className="meta-corpo" onClick={() => setPainel({ tipo: 'simulador', item: m })}
                    aria-label={`${m.nome}: abrir simulador`}>
                    <span className="meta-topo">
                      <span className="linha-nome">{m.nome}</span>
                      <span className="num suave">{pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
                    </span>
                    <span className="barra-progresso"><span style={{ width: `${pct}%`, background: m.cor }} /></span>
                    <span className="meta-detalhe">
                      <span className="num">{formatarReais(jaTenho(estado, m.id))} / {formatarReais(alvoDaMeta(estado, m))}</span>
                      <span>{textoPrazo(prazoSemJuros(estado, m))}</span>
                    </span>
                    {m.alvoAutomatico && <span className="selo selo-roxo">alvo = {estado.config.multiplicadorReserva}× contas</span>}
                  </button>
                  <button type="button" className="botao-texto" onClick={() => setPainel({ tipo: 'meta', item: m })}>Editar</button>
                </li>
              );
            })}
          </ul>
        )}
        {estado.metas.length > 0 && <p className="suave">Toque numa meta para simular com juros.</p>}
      </Card>

      <Card titulo="Aplicações" acao={<button type="button" className="botao-texto" onClick={() => setPainel({ tipo: 'aplicacao' })}>+ adicionar</button>}>
        {estado.aplicacoes.length === 0 ? <p className="vazio">Nenhuma aplicação cadastrada.</p> : (
          <>
            <ul className="linhas">
              {estado.aplicacoes.map((a) => (
                <li key={a.id} className="linha">
                  <button type="button" className="linha-toque" onClick={() => setPainel({ tipo: 'aplicacao', item: a })}>
                    <span className="linha-info">
                      <span className="linha-nome">{a.nome}</span>
                      <span className="linha-detalhe">
                        {' · '}{a.tipo === 'operacional' ? 'operacional' : `guardado${nomeMeta(a.metaId) ? ` · ${nomeMeta(a.metaId)}` : ''}`}
                        {a.percentualCdi != null && ` · ${String(a.percentualCdi).replace('.', ',')}% CDI`}
                      </span>
                    </span>
                    <span className="linha-valor">{formatarReais(a.saldo)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="totais">
              <span>Operacional</span><span className="num">{formatarReais(caixaOperacional(estado))}</span>
              <span>Guardado</span><span className="num">{formatarReais(totalGuardado)}</span>
            </div>
          </>
        )}
      </Card>

      <PainelInferior aberto={painel !== null} titulo={painel ? tituloPainel(painel) : ''} aoFechar={fechar}>
        {painel?.tipo === 'aplicacao' && <FormAplicacao key={painel.item?.id ?? 'nova'} aplicacao={painel.item} aoFechar={fechar} />}
        {painel?.tipo === 'meta' && <FormMeta key={painel.item?.id ?? 'nova'} meta={painel.item} aoFechar={fechar} />}
        {painel?.tipo === 'simulador' && <Simulador key={painel.item.id} meta={painel.item} />}
      </PainelInferior>
    </>
  );
}
