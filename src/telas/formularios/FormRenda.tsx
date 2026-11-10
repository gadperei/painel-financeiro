import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Renda } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, erroValor, lerDia } from '../../regras/validacao';

export function FormRenda({ renda, aoFechar }: { renda?: Renda; aoFechar(): void }) {
  const { atualizar, excluir } = useApp();
  const [nome, setNome] = useState(renda?.nome ?? '');
  const [dia, setDia] = useState(renda?.dia ? String(renda.dia) : '');
  const [valor, setValor] = useState(renda?.valor ?? 0);
  const [mexeu, setMexeu] = useState({ nome: false, valor: false });

  const eNome = erroNome(nome);
  const eValor = erroValor(valor);
  const d = lerDia(dia);
  const podeSalvar = !eNome && !eValor && !d.erro;

  function salvar() {
    if (!podeSalvar) return;
    const item: Renda = { id: renda?.id ?? novoId(), nome: nome.trim(), dia: d.dia, valor, recebidaEm: renda?.recebidaEm ?? null };
    atualizar((e) => salvarItem(e, 'rendas', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeu((m) => ({ ...m, nome: true })); }}
        erro={mexeu.nome ? eNome : null} placeholder="Ex.: Salário" autoFocus={!renda} />
      <CampoTexto rotulo="Dia em que cai" valor={dia} aoMudar={setDia} inputMode="numeric" erro={d.erro}
        dica="Deixe vazio se não tiver dia fixo." />
      <CampoValor rotulo="Valor" valor={valor} aoMudar={(v) => { setValor(v); setMexeu((m) => ({ ...m, valor: true })); }}
        erro={mexeu.valor ? eValor : null} />
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={renda ? () => { excluir('rendas', renda.id); aoFechar(); } : undefined} />
    </form>
  );
}
