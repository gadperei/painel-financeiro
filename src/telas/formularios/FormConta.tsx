import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { BotoesFormulario, CampoTexto } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Conta } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, lerDia } from '../../regras/validacao';

export function FormConta({ conta, aoFechar }: { conta?: Conta; aoFechar(): void }) {
  const { hoje, atualizar, excluir } = useApp();
  const [nome, setNome] = useState(conta?.nome ?? '');
  const [dia, setDia] = useState(conta?.dia ? String(conta.dia) : '');
  const [valor, setValor] = useState(conta?.valor ?? 0);
  const [pagaEm, setPagaEm] = useState(conta?.pagaEm ?? '');
  const [mexeuNome, setMexeuNome] = useState(false);

  const eNome = erroNome(nome);
  const d = lerDia(dia);
  const ePagamento = conta?.pagaEm && (!/^\d{4}-\d{2}-\d{2}$/.test(pagaEm) || pagaEm > hoje) ? 'Data de pagamento inválida' : null;
  const podeSalvar = !eNome && !d.erro && !ePagamento;

  function salvar() {
    if (!podeSalvar) return;
    const item: Conta = { id: conta?.id ?? novoId(), nome: nome.trim(), dia: d.dia, valor, pagaEm: conta?.pagaEm ? pagaEm : null };
    atualizar((e) => salvarItem(e, 'contas', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeuNome(true); }}
        erro={mexeuNome ? eNome : null} placeholder="Ex.: Aluguel, fatura do cartão" autoFocus={!conta} />
      <CampoTexto rotulo="Dia do vencimento" valor={dia} aoMudar={setDia} inputMode="numeric" erro={d.erro}
        dica="Deixe vazio se não tiver dia fixo." />
      <CampoValor rotulo="Valor deste mês (pode ser zero)" valor={valor} aoMudar={setValor} />
      {conta?.pagaEm && (
        <CampoTexto rotulo="Paga em" type="date" valor={pagaEm} aoMudar={setPagaEm} max={hoje} erro={ePagamento}
          dica="Ajuste se você pagou antes de marcar no app — conta para o score." />
      )}
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={conta ? () => { excluir('contas', conta.id); aoFechar(); } : undefined} />
    </form>
  );
}
