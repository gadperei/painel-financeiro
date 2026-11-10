import { useState } from 'react';
import { baixarArquivo, escolherArquivo } from '../componentes/arquivos';
import { ConfirmarAcao } from '../componentes/ConfirmarAcao';
import { lerBackup, type ResumoBackup } from '../dados/backup';
import { comecarComMeusDados } from '../dados/operacoes';
import type { Estado } from '../dados/tipos';
import { hojeLocal } from '../regras/datas';
import { formatarData } from './formato';

interface Props {
  bruto: string;
  versaoNova: boolean;
  aoRecuperar(e: Estado): void;
}

/** Tela mostrada quando os dados salvos não podem ser lidos. Não apaga nada sozinha. */
export function ErroDados({ bruto, versaoNova, aoRecuperar }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [backup, setBackup] = useState<{ estado: Estado; resumo: ResumoBackup } | null>(null);
  const [confirmarZero, setConfirmarZero] = useState(false);

  async function importar() {
    const texto = await escolherArquivo('.json,application/json');
    if (texto === null) return;
    const r = lerBackup(texto);
    if (r.tipo === 'erro') setErro(r.mensagem);
    else { setErro(null); setBackup(r); }
  }

  return (
    <main className="conteudo">
      <h1>Algo deu errado com seus dados</h1>
      <p>
        {versaoNova
          ? 'Seus dados foram salvos por uma versão mais nova do app. Recarregue a página para atualizar, ou importe um backup.'
          : 'Não consegui ler os dados salvos neste aparelho. Nada foi apagado. Escolha o que fazer:'}
      </p>
      <div className="lista-botoes">
        <button type="button" className="botao botao-primario" onClick={importar}>Importar backup</button>
        <button
          type="button"
          className="botao botao-secundario"
          onClick={() => baixarArquivo(`dados-brutos-${hojeLocal()}.txt`, bruto, 'text/plain')}
        >
          Baixar dados brutos
        </button>
        <button type="button" className="botao botao-perigo" onClick={() => setConfirmarZero(true)}>Começar do zero</button>
      </div>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      <ConfirmarAcao
        aberto={backup !== null}
        titulo="Usar este backup?"
        rotuloConfirmar="Usar backup"
        aoConfirmar={() => backup && aoRecuperar(backup.estado)}
        aoCancelar={() => setBackup(null)}
      >
        {backup && (
          <p>
            Backup de {formatarData(backup.resumo.exportadoEm)}, {backup.resumo.contas} contas, {backup.resumo.gastos} gastos.
          </p>
        )}
      </ConfirmarAcao>

      <ConfirmarAcao
        aberto={confirmarZero}
        titulo="Começar do zero?"
        rotuloConfirmar="Começar do zero"
        perigoso
        aoConfirmar={() => aoRecuperar(comecarComMeusDados(hojeLocal()))}
        aoCancelar={() => setConfirmarZero(false)}
      >
        <p>Os dados que não puderam ser lidos serão substituídos. Se quiser guardá-los, toque antes em “Baixar dados brutos”.</p>
      </ConfirmarAcao>
    </main>
  );
}
