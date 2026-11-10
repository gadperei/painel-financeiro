import type { ReactNode } from 'react';

interface Props {
  titulo?: string;
  acao?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ titulo, acao, className, children }: Props) {
  return (
    <section className={`card ${className ?? ''}`}>
      {(titulo || acao) && (
        <div className="card-topo">
          {titulo && <h2>{titulo}</h2>}
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}
