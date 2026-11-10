import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { Alternar, BotoesFormulario, CampoTexto, Seletor } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Aporte } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, erroValor } from '../../regras/validacao';

export function FormAporte({ aporte, aoFechar }: { aporte?: Aporte; aoFechar(): void }) {
  const { estado, atualizar, excluir } = useApp();
  const [nome, setNome] = useState(aporte?.nome ?? '');
  const [valor, setValor] = useState(aporte?.valor ?? 0);
  const [metaId, setMetaId] = useState(aporte?.metaId ?? '');
  const [saiDoBolso, setSaiDoBolso] = useState(aporte?.saiDoBolso ?? true);
  const [mexeu, setMexeu] = useState({ nome: false, valor: false });

  const eNome = erroNome(nome);
  const eValor = erroValor(valor);
  const podeSalvar = !eNome && !eValor;

  function salvar() {
    if (!podeSalvar) return;
    const item: Aporte = {
      id: aporte?.id ?? novoId(), nome: nome.trim(), valor, metaId: metaId || null, saiDoBolso, feitoEm: aporte?.feitoEm ?? null,
    };
    atualizar((e) => salvarItem(e, 'aportes', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeu((m) => ({ ...m, nome: true })); }}
        erro={mexeu.nome ? eNome : null} placeholder="Ex.: Reserva" autoFocus={!aporte} />
      <CampoValor rotulo="Valor por mês" valor={valor} aoMudar={(v) => { setValor(v); setMexeu((m) => ({ ...m, valor: true })); }}
        erro={mexeu.valor ? eValor : null} />
      <Seletor rotulo="Meta" valor={metaId} aoMudar={setMetaId}>
        <option value="">Nenhuma</option>
        {estado.metas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </Seletor>
      <Alternar rotulo="Sai do meu bolso? (desmarque se o dinheiro é de outra pessoa)" marcado={saiDoBolso} aoMudar={setSaiDoBolso} />
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={aporte ? () => { excluir('aportes', aporte.id); aoFechar(); } : undefined} />
    </form>
  );
}
