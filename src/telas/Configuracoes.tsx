import { useEffect, useState } from 'react';
import { ACEITA_BACKUP, escolherArquivo, exportarBackup } from '../componentes/arquivos';
import { Card } from '../componentes/Card';
import { CampoValor } from '../componentes/CampoValor';
import { CampoTexto } from '../componentes/Campos';
import { ConfirmarAcao } from '../componentes/ConfirmarAcao';
import { PainelInferior } from '../componentes/PainelInferior';
import { lerBackup, type ResumoBackup } from '../dados/backup';
import { gerarExemplo } from '../dados/exemplo';
import { comecarComMeusDados } from '../dados/operacoes';
import type { Categoria, Config, Estado } from '../dados/tipos';
import { useApp } from '../estado/contexto';
import { desfazerFechamento } from '../regras/fechamento';
import { lerDecimal, lerInteiro } from '../regras/validacao';
import { formatarData } from './formato';
import { FormCategoria } from './formularios/FormCategoria';
import { ComoInstalar } from '../pwa/ComoInstalar';

type Confirmacao = 'desfazer' | 'apagar' | 'exemplo' | null;

function FormConfig({ config, aoSalvar }: { config: Config; aoSalvar(c: Config): void }) {
  const [metaScore, setMetaScore] = useState(String(config.metaScore));
  const [sobraMinima, setSobraMinima] = useState(config.sobraMinima);
  const [pct, setPct] = useState(String(config.recompensaPercentual));
  const [recMin, setRecMin] = useState(config.recompensaMinima);
  const [cdi, setCdi] = useState(String(config.cdiAnual).replace('.', ','));
  const [mult, setMult] = useState(String(config.multiplicadorReserva));

  const nMeta = lerInteiro(metaScore, 0, 100);
  const nPct = lerInteiro(pct, 0, 100);
  const nCdi = lerDecimal(cdi, 0, 100);
  const nMult = lerInteiro(mult, 1, 24);
  const valido = nMeta !== null && nPct !== null && nCdi.valor !== null && nMult !== null;
  const novo: Config | null = valido
    ? { metaScore: nMeta, sobraMinima, recompensaPercentual: nPct, recompensaMinima: recMin, cdiAnual: nCdi.valor!, multiplicadorReserva: nMult }
    : null;
  const mudou = novo !== null && JSON.stringify(novo) !== JSON.stringify(config);

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); if (novo && mudou) aoSalvar(novo); }}>
      <div className="grade-2">
        <CampoTexto rotulo="Meta do score" valor={metaScore} aoMudar={setMetaScore} inputMode="numeric"
          erro={nMeta === null ? 'De 0 a 100' : null} />
        <CampoValor rotulo="Sobra mínima" valor={sobraMinima} aoMudar={setSobraMinima} />
        <CampoTexto rotulo="% da sobra na recompensa" valor={pct} aoMudar={setPct} inputMode="numeric"
          erro={nPct === null ? 'De 0 a 100' : null} />
        <CampoValor rotulo="Recompensa mínima" valor={recMin} aoMudar={setRecMin} />
        <CampoTexto rotulo="CDI anual (%)" valor={cdi} aoMudar={setCdi} inputMode="decimal"
          erro={nCdi.valor === null ? 'Número de 0 a 100' : null} />
        <CampoTexto rotulo="Reserva = N × contas" valor={mult} aoMudar={setMult} inputMode="numeric"
          erro={nMult === null ? 'De 1 a 24' : null} />
      </div>
      <div className="botoes">
        <button type="submit" className="botao botao-primario" disabled={!mudou}>Salvar configurações</button>
      </div>
    </form>
  );
}

export function Configuracoes({ aoFechar }: { aoFechar(): void }) {
  const { estado, hoje, atualizar, substituir, avisar } = useApp();
  const [categoria, setCategoria] = useState<Categoria | 'nova' | null>(null);
  const [importado, setImportado] = useState<{ estado: Estado; resumo: ResumoBackup } | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
  const [persistente, setPersistente] = useState<boolean | null>(null);
  const [instrucoes, setInstrucoes] = useState(false);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistente).catch(() => setPersistente(false));
  }, [estado.modoExemplo]);

  async function exportar() {
    if (await exportarBackup(estado, hoje)) {
      atualizar((e) => ({ ...e, ultimoBackup: hoje }));
      avisar('Backup salvo');
    }
  }

  async function importar() {
    const texto = await escolherArquivo(ACEITA_BACKUP);
    if (texto === null) return;
    const r = lerBackup(texto);
    if (r.tipo === 'erro') { setErroImportacao(r.mensagem); return; }
    setErroImportacao(null);
    setImportado(r);
  }

  const botaoBackupAntes = (
    <button type="button" className="botao botao-secundario botao-largo" onClick={exportar}>Exportar backup antes</button>
  );

  return (
    <div className="tela-cheia">
      <header className="topo">
        <button type="button" className="botao-icone" aria-label="Voltar" onClick={aoFechar}>←</button>
        <h1>Configurações</h1>
      </header>
      <main className="conteudo">
        <Card titulo="Score, recompensa e investimentos">
          <FormConfig key={JSON.stringify(estado.config)} config={estado.config}
            aoSalvar={(config) => { atualizar((e) => ({ ...e, config })); avisar('Configurações salvas'); }} />
        </Card>

        <Card titulo="Categorias de gasto" acao={<button type="button" className="botao-texto" onClick={() => setCategoria('nova')}>+ adicionar</button>}>
          <ul className="linhas">
            {estado.categorias.map((c) => (
              <li key={c.id} className="linha">
                <button type="button" className="linha-toque" onClick={() => setCategoria(c)}>
                  <span className="bolinha" style={{ background: c.cor }} />
                  <span className="linha-info linha-nome">{c.nome}</span>
                  <span className="suave">editar</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card titulo="Backup">
          <p className="suave">{estado.ultimoBackup ? `Último backup: ${formatarData(estado.ultimoBackup)}` : 'Nenhum backup ainda'}</p>
          <div className="lista-botoes">
            <button type="button" className="botao botao-primario" onClick={exportar}>Exportar backup</button>
            <button type="button" className="botao botao-secundario" onClick={importar}>Importar backup</button>
          </div>
          {erroImportacao && <p className="aviso aviso-erro" role="alert">{erroImportacao}</p>}
        </Card>

        <Card titulo="Armazenamento">
          <p>
            {persistente === null ? 'Verificando…'
              : persistente ? 'Persistente ✅ — o navegador não apaga seus dados por falta de espaço.'
              : 'Não persistente — faça backups com frequência.'}
          </p>
          <p className="suave">Seus dados ficam só neste aparelho. Instalar o app na tela inicial ajuda a protegê-los.</p>
        </Card>

        <Card titulo="Instalar no celular">
          <button type="button" className="botao botao-secundario botao-largo" onClick={() => setInstrucoes(true)}>Como instalar no celular</button>
        </Card>

        <Card titulo="Cuidado">
          <div className="lista-botoes">
            {estado.copiaAntesDoFechamento && (
              <button type="button" className="botao botao-secundario" onClick={() => setConfirmacao('desfazer')}>Desfazer último fechamento</button>
            )}
            <button type="button" className="botao botao-secundario" onClick={() => setConfirmacao('exemplo')}>Voltar ao exemplo</button>
            <button type="button" className="botao botao-perigo" onClick={() => setConfirmacao('apagar')}>Apagar tudo</button>
          </div>
        </Card>
      </main>

      <PainelInferior aberto={categoria !== null} titulo={categoria === 'nova' ? 'Nova categoria' : 'Editar categoria'} aoFechar={() => setCategoria(null)}>
        {categoria !== null && (
          <FormCategoria key={categoria === 'nova' ? 'nova' : categoria.id} categoria={categoria === 'nova' ? undefined : categoria}
            aoFechar={() => setCategoria(null)} />
        )}
      </PainelInferior>

      <PainelInferior aberto={instrucoes} titulo="Como instalar no celular" aoFechar={() => setInstrucoes(false)}>
        <ComoInstalar />
      </PainelInferior>

      <ConfirmarAcao
        aberto={importado !== null}
        titulo="Importar backup?"
        rotuloConfirmar="Substituir meus dados"
        perigoso
        aoConfirmar={() => { if (importado) { substituir(importado.estado); avisar('Backup importado'); } setImportado(null); }}
        aoCancelar={() => setImportado(null)}
      >
        {importado && (
          <p>
            Backup de {formatarData(importado.resumo.exportadoEm)}, {importado.resumo.contas} contas, {importado.resumo.gastos} gastos.
            Isso substitui seus dados atuais.
          </p>
        )}
      </ConfirmarAcao>

      <ConfirmarAcao
        aberto={confirmacao === 'desfazer'}
        titulo="Desfazer o último fechamento?"
        rotuloConfirmar="Desfazer"
        aoConfirmar={() => { atualizar((e) => desfazerFechamento(e) ?? e); setConfirmacao(null); avisar('Fechamento desfeito'); }}
        aoCancelar={() => setConfirmacao(null)}
      >
        <p>As alterações feitas depois do fechamento serão perdidas.</p>
      </ConfirmarAcao>

      <ConfirmarAcao
        aberto={confirmacao === 'exemplo'}
        titulo="Voltar ao exemplo?"
        rotuloConfirmar="Voltar ao exemplo"
        perigoso
        extra={estado.modoExemplo ? undefined : botaoBackupAntes}
        aoConfirmar={() => { substituir(gerarExemplo(hoje)); setConfirmacao(null); aoFechar(); }}
        aoCancelar={() => setConfirmacao(null)}
      >
        <p>Seus dados serão substituídos pelos dados fictícios de exemplo.</p>
      </ConfirmarAcao>

      <ConfirmarAcao
        aberto={confirmacao === 'apagar'}
        titulo="Apagar tudo?"
        rotuloConfirmar="Apagar tudo"
        perigoso
        extra={estado.modoExemplo ? undefined : botaoBackupAntes}
        aoConfirmar={() => { substituir(comecarComMeusDados(hoje)); setConfirmacao(null); aoFechar(); }}
        aoCancelar={() => setConfirmacao(null)}
      >
        <p>Todos os dados deste aparelho serão apagados. Não dá para desfazer.</p>
      </ConfirmarAcao>
    </div>
  );
}
