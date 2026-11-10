import { useState, type ReactNode } from 'react';
import { Card } from '../componentes/Card';
import { GraficoAlivio } from '../componentes/GraficoAlivio';
import { ListaGastos } from '../componentes/ListaGastos';
import { PainelInferior } from '../componentes/PainelInferior';
import { marcar } from '../dados/operacoes';
import type { Aporte, Conta, Gasto, Parcelamento, Renda } from '../dados/tipos';
import { useApp } from '../estado/contexto';
import { avisoDaConta } from '../regras/avisos';
import { nomeMes, rotuloMesCurto } from '../regras/datas';
import { formatarReais } from '../regras/dinheiro';
import { gastosAguardandoFechamento, gastosDoMes } from '../regras/gastos';
import { mesDeTermino, restantes, serieAlivio, textoAlivio } from '../regras/parcelas';
import { calcularSobraPrevista } from '../regras/projecao';
import { FormAporte } from './formularios/FormAporte';
import { FormConta } from './formularios/FormConta';
import { FormGasto } from './formularios/FormGasto';
import { FormParcelamento } from './formularios/FormParcelamento';
import { FormRenda } from './formularios/FormRenda';
import { mesPorExtenso } from './formato';

type Edicao =
  | { tipo: 'renda'; item?: Renda }
  | { tipo: 'conta'; item?: Conta }
  | { tipo: 'aporte'; item?: Aporte }
  | { tipo: 'parcelamento'; item?: Parcelamento }
  | { tipo: 'gasto'; item?: Gasto };

const TITULO: Record<Edicao['tipo'], [novo: string, editar: string]> = {
  renda: ['Nova renda', 'Editar renda'],
  conta: ['Nova conta', 'Editar conta'],
  aporte: ['Novo aporte', 'Editar aporte'],
  parcelamento: ['Novo parcelamento', 'Editar parcelamento'],
  gasto: ['Novo gasto', 'Editar gasto'],
};

/** Linha com o "marcar" (recebi/pago/feito) e o resto tocável para editar. */
function LinhaMarcavel({ marcado, rotuloMarcar, aoMarcar, aoTocar, nome, detalhe, valor }: {
  marcado: boolean;
  rotuloMarcar: string;
  aoMarcar(v: boolean): void;
  aoTocar(): void;
  nome: string;
  detalhe?: ReactNode;
  valor: number;
}) {
  return (
    <li className={`linha ${marcado ? 'feita' : ''}`}>
      <label className="marcador" aria-label={`${rotuloMarcar}: ${nome}`}>
        <input type="checkbox" checked={marcado} onChange={(ev) => aoMarcar(ev.target.checked)} />
      </label>
      <button type="button" className="linha-toque" onClick={aoTocar}>
        <span className="linha-info">
          <span className="linha-nome">{nome}</span>
          {detalhe && <span className="linha-detalhe"> · {detalhe}</span>}
        </span>
        <span className="linha-valor">{formatarReais(valor)}</span>
      </button>
    </li>
  );
}

const BotaoAdicionar = ({ aoClicar }: { aoClicar(): void }) => (
  <button type="button" className="botao-texto" onClick={aoClicar}>+ adicionar</button>
);

export function Mes() {
  const { estado, hoje, atualizar } = useApp();
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [filtro, setFiltro] = useState<string | null>(null);
  const { mesAberto } = estado;

  const sobra = calcularSobraPrevista(estado);
  const nomeMeta = (id: string | null) => estado.metas.find((m) => m.id === id)?.nome;
  const gastos = gastosDoMes(estado, mesAberto);
  const categoriasComGasto = estado.categorias.filter((c) => gastos.some((g) => g.categoriaId === c.id));
  const gastosFiltrados = filtro ? gastos.filter((g) => g.categoriaId === filtro) : gastos;
  const alivio = textoAlivio(estado.parcelamentos, mesAberto);
  const aguardando = gastosAguardandoFechamento(estado);
  const fechar = () => setEdicao(null);

  return (
    <>
      <p className="suave">{mesPorExtenso(mesAberto)}</p>
      <Card titulo="Sobra prevista">
        <p className={`numero-grande ${sobra < 0 ? 'negativo' : 'positivo'}`}>{formatarReais(sobra)}</p>
      </Card>

      <Card titulo="Renda" acao={<BotaoAdicionar aoClicar={() => setEdicao({ tipo: 'renda' })} />}>
        {estado.rendas.length === 0 ? <p className="vazio">Nenhuma renda cadastrada.</p> : (
          <ul className="linhas">
            {estado.rendas.map((r) => (
              <LinhaMarcavel key={r.id} marcado={!!r.recebidaEm} rotuloMarcar="Recebi" nome={r.nome} valor={r.valor}
                detalhe={r.recebidaEm ? 'recebida' : r.dia ? `dia ${r.dia}` : 'sem dia fixo'}
                aoMarcar={(v) => atualizar((e) => marcar(e, 'rendas', r.id, v ? hoje : null))}
                aoTocar={() => setEdicao({ tipo: 'renda', item: r })} />
            ))}
          </ul>
        )}
      </Card>

      <Card titulo="Contas a pagar" acao={<BotaoAdicionar aoClicar={() => setEdicao({ tipo: 'conta' })} />}>
        {estado.contas.length === 0 ? <p className="vazio">Nenhuma conta cadastrada.</p> : (
          <ul className="linhas">
            {estado.contas.map((c) => {
              const aviso = avisoDaConta(c, mesAberto, hoje);
              return (
                <LinhaMarcavel key={c.id} marcado={!!c.pagaEm} rotuloMarcar="Pago" nome={c.nome} valor={c.valor}
                  detalhe={
                    <>
                      {c.pagaEm ? 'paga' : c.dia ? `dia ${c.dia}` : 'sem dia fixo'}
                      {aviso && <> <span className={`selo ${aviso === 'atrasada' ? 'selo-vermelho' : 'selo-amarelo'}`}>{aviso === 'atrasada' ? 'atrasada' : 'em breve'}</span></>}
                    </>
                  }
                  aoMarcar={(v) => atualizar((e) => marcar(e, 'contas', c.id, v ? hoje : null))}
                  aoTocar={() => setEdicao({ tipo: 'conta', item: c })} />
              );
            })}
          </ul>
        )}
      </Card>

      <Card titulo="Aportes" acao={<BotaoAdicionar aoClicar={() => setEdicao({ tipo: 'aporte' })} />}>
        {estado.aportes.length === 0 ? <p className="vazio">Nenhum aporte planejado.</p> : (
          <ul className="linhas">
            {estado.aportes.map((a) => (
              <LinhaMarcavel key={a.id} marcado={!!a.feitoEm} rotuloMarcar="Feito" nome={a.nome} valor={a.valor}
                detalhe={
                  <>
                    {nomeMeta(a.metaId) ?? 'sem meta'}
                    {!a.saiDoBolso && <> <span className="selo selo-roxo">não sai do bolso</span></>}
                  </>
                }
                aoMarcar={(v) => atualizar((e) => marcar(e, 'aportes', a.id, v ? hoje : null))}
                aoTocar={() => setEdicao({ tipo: 'aporte', item: a })} />
            ))}
          </ul>
        )}
      </Card>

      <Card titulo="Parcelamentos" acao={<BotaoAdicionar aoClicar={() => setEdicao({ tipo: 'parcelamento' })} />}>
        {estado.parcelamentos.length === 0 ? <p className="vazio">Nenhum parcelamento.</p> : (
          <>
            <ul className="linhas">
              {estado.parcelamentos.map((p) => (
                <li key={p.id} className="linha">
                  <button type="button" className="linha-toque" onClick={() => setEdicao({ tipo: 'parcelamento', item: p })}>
                    <span className="linha-info">
                      <span className="linha-nome">{p.nome}</span>
                      <span className="linha-detalhe">
                        {' · '}{p.parcelaAtual}/{p.totalParcelas} · {restantes(p) === 0 ? 'última parcela' : `termina ${rotuloMesCurto(mesDeTermino(p, mesAberto))}`}
                      </span>
                    </span>
                    <span className="linha-valor">{formatarReais(p.valorParcela)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <GraficoAlivio serie={serieAlivio(estado.parcelamentos, mesAberto)} />
            {alivio && <p className="aviso aviso-info">{alivio}</p>}
          </>
        )}
      </Card>

      <Card titulo="Gastos do mês" acao={<BotaoAdicionar aoClicar={() => setEdicao({ tipo: 'gasto' })} />}>
        {categoriasComGasto.length > 1 && (
          <div className="chips" role="group" aria-label="Filtrar por categoria">
            <button type="button" className={`chip ${filtro === null ? 'chip-ativo' : ''}`} onClick={() => setFiltro(null)}>Todas</button>
            {categoriasComGasto.map((c) => (
              <button key={c.id} type="button" className={`chip ${filtro === c.id ? 'chip-ativo' : ''}`} onClick={() => setFiltro(c.id)}>
                <span className="bolinha" style={{ background: c.cor }} />{c.nome}
              </button>
            ))}
          </div>
        )}
        <ListaGastos gastos={gastosFiltrados} categorias={estado.categorias} aoTocar={(g) => setEdicao({ tipo: 'gasto', item: g })} />
        {aguardando.length > 0 && (
          <p className="aviso aviso-info">
            {aguardando.length} {aguardando.length === 1 ? 'gasto' : 'gastos'} do mês seguinte aguardando o fechamento de {nomeMes(mesAberto)}.
          </p>
        )}
      </Card>

      <PainelInferior aberto={edicao !== null} titulo={edicao ? TITULO[edicao.tipo][edicao.item ? 1 : 0] : ''} aoFechar={fechar}>
        {edicao?.tipo === 'renda' && <FormRenda key={edicao.item?.id ?? 'nova'} renda={edicao.item} aoFechar={fechar} />}
        {edicao?.tipo === 'conta' && <FormConta key={edicao.item?.id ?? 'nova'} conta={edicao.item} aoFechar={fechar} />}
        {edicao?.tipo === 'aporte' && <FormAporte key={edicao.item?.id ?? 'novo'} aporte={edicao.item} aoFechar={fechar} />}
        {edicao?.tipo === 'parcelamento' && <FormParcelamento key={edicao.item?.id ?? 'novo'} parcelamento={edicao.item} aoFechar={fechar} />}
        {edicao?.tipo === 'gasto' && <FormGasto key={edicao.item?.id ?? 'novo'} gasto={edicao.item} aoFechar={fechar} />}
      </PainelInferior>
    </>
  );
}
