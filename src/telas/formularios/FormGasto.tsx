import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import { ID_OUTROS } from '../../dados/padroes';
import type { Gasto } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { primeiroDia } from '../../regras/datas';
import { validarDataGasto } from '../../regras/gastos';
import { erroValor } from '../../regras/validacao';

interface Props {
  gasto?: Gasto;
  aoFechar(): void;
}

/** Lançar ou editar um gasto: valor → categoria → salvar. */
export function FormGasto({ gasto, aoFechar }: Props) {
  const { estado, hoje, atualizar, excluir } = useApp();
  const [valor, setValor] = useState(gasto?.valor ?? 0);
  const [categoriaId, setCategoriaId] = useState(gasto?.categoriaId ?? estado.categorias[0]?.id ?? ID_OUTROS);
  const [data, setData] = useState(gasto?.data ?? hoje);
  const [descricao, setDescricao] = useState(gasto?.descricao ?? '');
  const [mexeuValor, setMexeuValor] = useState(false);

  const erroV = erroValor(valor);
  const dataOk = validarDataGasto(data, estado.mesAberto, hoje);
  const podeSalvar = !erroV && dataOk;

  function salvar() {
    if (!podeSalvar) return;
    const item: Gasto = { id: gasto?.id ?? novoId(), data, valor, categoriaId };
    if (descricao.trim()) item.descricao = descricao.trim();
    atualizar((e) => salvarItem(e, 'gastos', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoValor
        rotulo="Valor"
        valor={valor}
        aoMudar={(v) => { setValor(v); setMexeuValor(true); }}
        autoFocus={!gasto}
        erro={mexeuValor ? erroV : null}
      />
      <div className="campo">
        <span className="rotulo" id="rotulo-categoria">Categoria</span>
        <div className="chips" role="radiogroup" aria-labelledby="rotulo-categoria">
          {estado.categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={categoriaId === c.id}
              className={`chip ${categoriaId === c.id ? 'chip-ativo' : ''}`}
              onClick={() => setCategoriaId(c.id)}
            >
              <span className="bolinha" style={{ background: c.cor }} />
              {c.nome}
            </button>
          ))}
        </div>
      </div>
      <CampoTexto
        rotulo="Data"
        type="date"
        valor={data}
        aoMudar={setData}
        min={primeiroDia(estado.mesAberto)}
        max={hoje}
        erro={dataOk ? null : 'Data fora do mês aberto'}
      />
      <CampoTexto rotulo="Descrição (opcional)" valor={descricao} aoMudar={setDescricao} maxLength={80} />
      <BotoesFormulario
        podeSalvar={podeSalvar}
        aoCancelar={aoFechar}
        aoExcluir={gasto ? () => { excluir('gastos', gasto.id); aoFechar(); } : undefined}
      />
    </form>
  );
}
