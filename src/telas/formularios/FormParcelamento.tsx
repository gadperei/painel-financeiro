import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Parcelamento } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, erroValor, lerInteiro } from '../../regras/validacao';

export function FormParcelamento({ parcelamento, aoFechar }: { parcelamento?: Parcelamento; aoFechar(): void }) {
  const { atualizar, excluir } = useApp();
  const [nome, setNome] = useState(parcelamento?.nome ?? '');
  const [valor, setValor] = useState(parcelamento?.valorParcela ?? 0);
  const [atual, setAtual] = useState(String(parcelamento?.parcelaAtual ?? 1));
  const [total, setTotal] = useState(String(parcelamento?.totalParcelas ?? 12));
  const [mexeu, setMexeu] = useState({ nome: false, valor: false });

  const eNome = erroNome(nome);
  const eValor = erroValor(valor);
  const nTotal = lerInteiro(total, 1, 999);
  const nAtual = nTotal === null ? null : lerInteiro(atual, 1, nTotal);
  const eTotal = nTotal === null ? 'Total de parcelas inválido' : null;
  const eAtual = !eTotal && nAtual === null ? 'Parcela atual entre 1 e o total' : null;
  const podeSalvar = !eNome && !eValor && !eTotal && !eAtual;

  function salvar() {
    if (!podeSalvar || nAtual === null || nTotal === null) return;
    const item: Parcelamento = {
      id: parcelamento?.id ?? novoId(), nome: nome.trim(), valorParcela: valor, parcelaAtual: nAtual, totalParcelas: nTotal,
    };
    atualizar((e) => salvarItem(e, 'parcelamentos', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <p className="campo-dica">As parcelas já estão dentro das faturas: aqui é só para ver quando acabam.</p>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeu((m) => ({ ...m, nome: true })); }}
        erro={mexeu.nome ? eNome : null} placeholder="Ex.: Notebook" autoFocus={!parcelamento} />
      <CampoValor rotulo="Valor da parcela" valor={valor} aoMudar={(v) => { setValor(v); setMexeu((m) => ({ ...m, valor: true })); }}
        erro={mexeu.valor ? eValor : null} />
      <div className="grade-2">
        <CampoTexto rotulo="Parcela atual" valor={atual} aoMudar={setAtual} inputMode="numeric" erro={eAtual} />
        <CampoTexto rotulo="Total de parcelas" valor={total} aoMudar={setTotal} inputMode="numeric" erro={eTotal} />
      </div>
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={parcelamento ? () => { excluir('parcelamentos', parcelamento.id); aoFechar(); } : undefined} />
    </form>
  );
}
