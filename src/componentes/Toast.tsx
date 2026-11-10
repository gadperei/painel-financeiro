import { useEffect } from 'react';
import type { AcaoAviso } from '../estado/contexto';

interface Props {
  mensagem: string;
  acao?: AcaoAviso;
  duracaoMs?: number;
  aoSumir(): void;
}

export function Toast({ mensagem, acao, duracaoMs = 5000, aoSumir }: Props) {
  useEffect(() => {
    const id = window.setTimeout(aoSumir, duracaoMs);
    return () => window.clearTimeout(id);
  }, [mensagem, duracaoMs, aoSumir]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{mensagem}</span>
      {acao && (
        <button
          type="button"
          className="toast-acao"
          onClick={() => {
            acao.aoClicar();
            aoSumir();
          }}
        >
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}
