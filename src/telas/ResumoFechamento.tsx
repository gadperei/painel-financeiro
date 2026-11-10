import { useState } from 'react';
import { exportarBackup } from '../componentes/arquivos';
import { ConfirmarAcao } from '../componentes/ConfirmarAcao';
import { PainelInferior } from '../componentes/PainelInferior';
import { useApp } from '../estado/contexto';
import { formatarReais } from '../regras/dinheiro';
import { desfazerFechamento, fecharMes, pendencias, resumoFechamento } from '../regras/fechamento';
import { calcularRecompensa } from '../regras/recompensa';
import { faixaDoScore } from '../regras/score';
import { mesPorExtenso } from './formato';

interface Props {
  aberto: boolean;
  aoFechar(): void;
}

/** Mostra como o mês vai ficar registrado e o que ainda está pendente, antes de fechar. */
export function ResumoFechamento({ aberto, aoFechar }: Props) {
  const { estado, hoje, atualizar, avisar } = useApp();
  const [perguntarBackup, setPerguntarBackup] = useState(false);

  const resumo = resumoFechamento(estado, hoje);
  const pend = pendencias(estado);
  const recompensa = calcularRecompensa(estado, hoje, 'fechamento');
  const nPendentes = pend.rendas.length + pend.contas.length + pend.aportes.length;

  function fechar() {
    atualizar((e) => fecharMes(e, hoje));
    aoFechar();
    avisar('Mês fechado', { rotulo: 'Desfazer', aoClicar: () => atualizar((e) => desfazerFechamento(e) ?? e) });
    setPerguntarBackup(true);
  }

  async function salvarBackup() {
    setPerguntarBackup(false);
    if (await exportarBackup(estado, hoje)) atualizar((e) => ({ ...e, ultimoBackup: hoje }));
  }

  return (
    <>
      <PainelInferior aberto={aberto} titulo={`Fechar ${mesPorExtenso(estado.mesAberto)}`} aoFechar={aoFechar}>
        <div className="resumo-fechamento">
          {resumo.score && (
            <p>
              Score final: <strong className={`texto-${faixaDoScore(resumo.score.total)}`}>{resumo.score.total}</strong> de 100
            </p>
          )}
          <p>
            Sobra do mês: <strong className={resumo.sobra < 0 ? 'negativo' : 'positivo'}>{formatarReais(resumo.sobra)}</strong>
          </p>
          {recompensa && <p className="aviso aviso-ok">🎉 {recompensa.texto}</p>}

          {nPendentes > 0 && (
            <div className="aviso aviso-alerta">
              <p><strong>Ainda pendente ({nPendentes}):</strong></p>
              <ul className="lista-simples">
                {pend.rendas.map((r) => <li key={r.id}>Renda: {r.nome} — sem “recebi”</li>)}
                {pend.contas.map((c) => <li key={c.id}>Conta: {c.nome} — sem “pago”</li>)}
                {pend.aportes.map((a) => <li key={a.id}>Aporte: {a.nome} — sem “feito”</li>)}
              </ul>
              <p>Se já aconteceu, volte e marque na aba Mês (dá para ajustar a data do pagamento).</p>
            </div>
          )}
          <p className="suave">Ao fechar: o mês vai para o histórico, os “pago”, “recebi” e “feito” são desmarcados e as parcelas avançam.</p>
        </div>
        <div className="botoes">
          <button type="button" className="botao botao-secundario" onClick={aoFechar}>Voltar</button>
          <button type="button" className="botao botao-primario" onClick={fechar}>Fechar o mês</button>
        </div>
      </PainelInferior>

      <ConfirmarAcao
        aberto={perguntarBackup}
        titulo="Salvar um backup agora?"
        rotuloConfirmar="Salvar backup"
        aoConfirmar={salvarBackup}
        aoCancelar={() => setPerguntarBackup(false)}
      >
        <p>É uma boa hora para guardar uma cópia dos seus dados fora do celular (Drive, WhatsApp...).</p>
      </ConfirmarAcao>
    </>
  );
}
