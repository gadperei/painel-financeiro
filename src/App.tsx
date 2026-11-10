import { useCallback, useMemo, useState } from 'react';
import { BarraAbas, type Aba } from './componentes/BarraAbas';
import { PainelInferior } from './componentes/PainelInferior';
import { Toast } from './componentes/Toast';
import { excluirComDesfazer, type Colecao } from './dados/operacoes';
import { ContextoApp, type AcaoAviso, type ValorApp } from './estado/contexto';
import { useEstado } from './estado/useEstado';
import { useHoje } from './estado/useHoje';
import { Configuracoes } from './telas/Configuracoes';
import { ErroDados } from './telas/ErroDados';
import { Historico } from './telas/Historico';
import { Inicio } from './telas/Inicio';
import { Mes } from './telas/Mes';
import { Metas } from './telas/Metas';
import { FormGasto } from './telas/formularios/FormGasto';
import { AvisoAtualizacao } from './pwa/AvisoAtualizacao';
import { AvisoInstalacao } from './pwa/AvisoInstalacao';

const TITULOS: Record<Aba, string> = {
  inicio: 'Painel Financeiro',
  mes: 'Mês',
  metas: 'Metas',
  historico: 'Histórico',
};

interface Aviso {
  chave: number;
  mensagem: string;
  acao?: AcaoAviso;
}

export default function App() {
  const hoje = useHoje();
  const { status, estado, atualizar, substituir, erroSalvar } = useEstado();
  const [aba, setAba] = useState<Aba>('inicio');
  const [configAberta, setConfigAberta] = useState(false);
  const [novoGasto, setNovoGasto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const avisar = useCallback((mensagem: string, acao?: AcaoAviso) => {
    setAviso({ chave: Date.now(), mensagem, acao });
  }, []);
  const limparAviso = useCallback(() => setAviso(null), []);

  const valor = useMemo<ValorApp | null>(() => {
    if (!estado) return null;
    return {
      estado,
      hoje,
      atualizar,
      substituir,
      excluir(colecao: Colecao, id: string) {
        // O desfazer devolve só o item excluído: o que a pessoa mudar nesses 5 s é mantido.
        const { estado: semItem, desfazer } = excluirComDesfazer(estado, colecao, id);
        atualizar(() => semItem);
        avisar('Item excluído', { rotulo: 'Desfazer', aoClicar: () => atualizar(desfazer) });
      },
      abrirConfig: () => setConfigAberta(true),
      abrirNovoGasto: () => setNovoGasto(true),
      avisar,
    };
  }, [estado, hoje, atualizar, substituir, avisar]);

  if (status.tipo === 'carregando') return <div className="app"><p className="vazio">Carregando…</p></div>;
  if (status.tipo === 'erro-dados') {
    return (
      <div className="app">
        <ErroDados bruto={status.bruto} versaoNova={status.versaoNova} aoRecuperar={substituir} />
      </div>
    );
  }
  if (!valor) return null;

  return (
    <ContextoApp.Provider value={valor}>
      <div className="app">
        <AvisoAtualizacao />
        {erroSalvar && (
          <p className="faixa-erro" role="alert">Não consegui salvar. Exporte um backup.</p>
        )}

        {configAberta ? (
          <Configuracoes aoFechar={() => setConfigAberta(false)} />
        ) : (
          <>
            <header className="topo">
              <h1>{TITULOS[aba]}</h1>
              <button type="button" className="botao-icone" aria-label="Configurações" onClick={() => setConfigAberta(true)}>
                ⚙️
              </button>
            </header>
            <main className="conteudo">
              {aba === 'inicio' && <AvisoInstalacao />}
              {aba === 'inicio' && <Inicio />}
              {aba === 'mes' && <Mes />}
              {aba === 'metas' && <Metas />}
              {aba === 'historico' && <Historico />}
            </main>
          </>
        )}

        <footer className="rodape">Seus dados ficam só neste aparelho.</footer>

        {!configAberta && <BarraAbas aba={aba} aoTrocar={setAba} aoNovoGasto={() => setNovoGasto(true)} />}

        <PainelInferior aberto={novoGasto} titulo="Novo gasto" aoFechar={() => setNovoGasto(false)}>
          <FormGasto aoFechar={() => setNovoGasto(false)} />
        </PainelInferior>

        {aviso && (
          <Toast key={aviso.chave} mensagem={aviso.mensagem} acao={aviso.acao} aoSumir={limparAviso} />
        )}
      </div>
    </ContextoApp.Provider>
  );
}
