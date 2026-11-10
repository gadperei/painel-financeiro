import { useState } from 'react';
import { CampoValor } from '../../componentes/CampoValor';
import { BotoesFormulario, CampoTexto, Seletor } from '../../componentes/Campos';
import { novoId, salvarItem } from '../../dados/operacoes';
import type { Aplicacao } from '../../dados/tipos';
import { useApp } from '../../estado/contexto';
import { erroNome, lerDecimal } from '../../regras/validacao';

export function FormAplicacao({ aplicacao, aoFechar }: { aplicacao?: Aplicacao; aoFechar(): void }) {
  const { estado, atualizar, excluir } = useApp();
  const [nome, setNome] = useState(aplicacao?.nome ?? '');
  const [saldo, setSaldo] = useState(aplicacao?.saldo ?? 0);
  const [tipo, setTipo] = useState<Aplicacao['tipo']>(aplicacao?.tipo ?? 'operacional');
  const [metaId, setMetaId] = useState(aplicacao?.metaId ?? '');
  const [cdi, setCdi] = useState(aplicacao?.percentualCdi != null ? String(aplicacao.percentualCdi).replace('.', ',') : '');
  const [mexeuNome, setMexeuNome] = useState(false);

  const eNome = erroNome(nome);
  const pct = lerDecimal(cdi, 0, 1000);
  const podeSalvar = !eNome && !pct.erro;

  function salvar() {
    if (!podeSalvar) return;
    const item: Aplicacao = {
      id: aplicacao?.id ?? novoId(),
      nome: nome.trim(),
      saldo,
      tipo,
      metaId: tipo === 'guardado' && metaId ? metaId : null,
      percentualCdi: pct.valor,
    };
    atualizar((e) => salvarItem(e, 'aplicacoes', item));
    aoFechar();
  }

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); salvar(); }}>
      <CampoTexto rotulo="Nome" valor={nome} aoMudar={(v) => { setNome(v); setMexeuNome(true); }}
        erro={mexeuNome ? eNome : null} placeholder="Ex.: Conta corrente, CDB" autoFocus={!aplicacao} />
      <CampoValor rotulo="Saldo atual" valor={saldo} aoMudar={setSaldo} />
      <Seletor rotulo="Tipo" valor={tipo} aoMudar={(v) => setTipo(v as Aplicacao['tipo'])}>
        <option value="operacional">Operacional — paga as contas (entra na projeção)</option>
        <option value="guardado">Guardado — dinheiro de uma meta</option>
      </Seletor>
      {tipo === 'guardado' && (
        <Seletor rotulo="Meta" valor={metaId} aoMudar={setMetaId}>
          <option value="">Nenhuma</option>
          {estado.metas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </Seletor>
      )}
      <CampoTexto rotulo="% do CDI (opcional)" valor={cdi} aoMudar={setCdi} inputMode="decimal" erro={pct.erro}
        placeholder="Ex.: 100" dica="Usado no simulador de juros." />
      <BotoesFormulario podeSalvar={podeSalvar} aoCancelar={aoFechar}
        aoExcluir={aplicacao ? () => { excluir('aplicacoes', aplicacao.id); aoFechar(); } : undefined} />
    </form>
  );
}
