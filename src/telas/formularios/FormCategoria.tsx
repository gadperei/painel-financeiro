import { useState } from 'react';
import { BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { ConfirmarAcao } from '../../componentes/ConfirmarAcao';
import { novoId, salvarItem } from '../../dados/operacoes';
import { ID_OUTROS } from '../../dados/padroes';
import type { Categoria } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome } from '../../regras/validacao';

const CORES = ['#2f6fed', '#e07b00', '#d13b6b', '#7c4dff', '#1f9d6b', '#8d6e63', '#00897b', '#c0392b', '#5b3df5', '#7b8494'];

export function FormCategoria({ categoria, aoFechar }: { categoria?: Categoria; aoFechar(): void }) {
  const { atualizar, excluir } = useApp();
  const [nome, setNome] = useState(categoria?.nome ?? '');
  const [cor, setCor] = useState(categoria?.cor ?? CORES[0]);
  const [mexeu, setMexeu] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  const eNome = erroNome(nome);
  const podeExcluir = categoria && categoria.id !== ID_OUTROS;

  function salvar() {
    if (eNome) return;
    atualizar((e) => salvarItem(e, 'categorias', { id: categoria?.id ?? novoId(), nome: nome.trim(), cor }));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeu(true); }} erro={mexeu ? eNome : null}
        autoFocus={!categoria} maxLength={30} />
      <div className="campo">
        <span className="rotulo" id="rotulo-cor-cat">Cor</span>
        <div className="chips" role="radiogroup" aria-labelledby="rotulo-cor-cat">
          {CORES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={cor === c} aria-label={`Cor ${c}`}
              className={`chip chip-cor ${cor === c ? 'chip-ativo' : ''}`} onClick={() => setCor(c)}>
              <span className="bolinha bolinha-grande" style={{ background: c }} />
            </button>
          ))}
        </div>
      </div>
      <BotoesFormulario podeSalvar={!eNome} aoCancelar={aoFechar} aoExcluir={podeExcluir ? () => setConfirmar(true) : undefined} />
      <ConfirmarAcao
        aberto={confirmar}
        titulo="Excluir categoria?"
        rotuloConfirmar="Excluir"
        perigoso
        aoConfirmar={() => { if (categoria) excluir('categorias', categoria.id); setConfirmar(false); aoFechar(); }}
        aoCancelar={() => setConfirmar(false)}
      >
        <p>Os gastos desta categoria vão para Outros.</p>
      </ConfirmarAcao>
    </form>
  );
}
