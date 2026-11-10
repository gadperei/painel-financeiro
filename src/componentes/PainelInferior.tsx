import { useEffect, useId, useRef, type ReactNode } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  aoFechar(): void;
  children: ReactNode;
}

/** Painel que sobe da parte de baixo da tela. Fecha com Esc, com o botão × ou tocando fora. */
export function PainelInferior({ aberto, titulo, aoFechar, children }: Props) {
  const idTitulo = useId();
  const painel = useRef<HTMLDivElement>(null);
  // Guardado em ref para o efeito abaixo não rodar de novo a cada render (isso roubaria o foco dos campos).
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const aoTeclar = (ev: KeyboardEvent) => ev.key === 'Escape' && fechar.current();
    document.addEventListener('keydown', aoTeclar);
    document.body.classList.add('sem-rolagem');
    if (!painel.current?.contains(document.activeElement)) painel.current?.focus();
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('sem-rolagem');
      anterior?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;
  return (
    <div className="painel-fundo" onClick={aoFechar}>
      <div
        ref={painel}
        className="painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="painel-topo">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="botao-icone" aria-label="Fechar" onClick={aoFechar}>×</button>
        </div>
        <div className="painel-corpo">{children}</div>
      </div>
    </div>
  );
}
