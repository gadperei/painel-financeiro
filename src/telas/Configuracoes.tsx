interface Props {
  aoFechar(): void;
}

export function Configuracoes({ aoFechar }: Props) {
  return (
    <div className="tela-cheia">
      <header className="topo">
        <button type="button" className="botao-icone" aria-label="Voltar" onClick={aoFechar}>←</button>
        <h1>Configurações</h1>
      </header>
      <main className="conteudo">
        <p className="vazio">Em construção.</p>
      </main>
    </div>
  );
}
