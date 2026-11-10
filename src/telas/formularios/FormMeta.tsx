import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { Alternar, BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { ConfirmarAcao } from '../../componentes/ConfirmarAcao';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Meta } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, erroValor } from '../../regras/validacao';

const CORES = ['#5b3df5', '#1f9d6b', '#2f6fed', '#e07b00', '#d13b6b', '#8d6e63'];

export function FormMeta({ meta, aoFechar }: { meta?: Meta; aoFechar(): void }) {
  const { estado, atualizar, excluir } = useApp();
  const [nome, setNome] = useState(meta?.nome ?? '');
  const [automatico, setAutomatico] = useState(meta?.alvoAutomatico ?? false);
  const [alvo, setAlvo] = useState(meta?.alvo ?? 0);
  const [cor, setCor] = useState(meta?.cor ?? CORES[0]);
  const [mexeu, setMexeu] = useState({ nome: false, alvo: false });
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const eNome = erroNome(nome);
  const eAlvo = automatico ? null : erroValor(alvo);
  const podeSalvar = !eNome && !eAlvo;

  function salvar() {
    if (!podeSalvar) return;
    const item: Meta = { id: meta?.id ?? novoId(), nome: nome.trim(), alvo: automatico ? 0 : alvo, alvoAutomatico: automatico, cor };
    atualizar((e) => salvarItem(e, 'metas', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeu((m) => ({ ...m, nome: true })); }}
        erro={mexeu.nome ? eNome : null} placeholder="Ex.: Reserva de emergência" autoFocus={!meta} />
      <Alternar rotulo={`Alvo automático (${estado.config.multiplicadorReserva}× o total das contas) — ideal para reserva de emergência`}
        marcado={automatico} aoMudar={setAutomatico} />
      {!automatico && (
        <CampoValor rotulo="Alvo" valor={alvo} aoMudar={(v) => { setAlvo(v); setMexeu((m) => ({ ...m, alvo: true })); }}
          erro={mexeu.alvo ? eAlvo : null} />
      )}
      <div className="campo">
        <span className="rotulo" id="rotulo-cor">Cor</span>
        <div className="chips" role="radiogroup" aria-labelledby="rotulo-cor">
          {CORES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={cor === c} aria-label={`Cor ${c}`}
              className={`chip chip-cor ${cor === c ? 'chip-ativo' : ''}`} onClick={() => setCor(c)}>
              <span className="bolinha bolinha-grande" style={{ background: c }} />
            </button>
          ))}
        </div>
      </div>
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={meta ? () => setConfirmarExclusao(true) : undefined} />

      <ConfirmarAcao
        aberto={confirmarExclusao}
        titulo="Excluir meta?"
        rotuloConfirmar="Excluir"
        perigoso
        aoConfirmar={() => { if (meta) excluir('metas', meta.id); setConfirmarExclusao(false); aoFechar(); }}
        aoCancelar={() => setConfirmarExclusao(false)}
      >
        <p>Aplicações e aportes ligados a ela ficarão sem meta.</p>
      </ConfirmarAcao>
    </form>
  );
}
