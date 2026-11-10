import type { ReactNode } from 'react';
import { PainelInferior } from './PainelInferior';

interface Props {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  rotuloConfirmar: string;
  perigoso?: boolean;
  aoConfirmar(): void;
  aoCancelar(): void;
  extra?: ReactNode;
}

/** Pede confirmação antes de uma ação que substitui ou apaga dados. */
export function ConfirmarAcao({ aberto, titulo, children, rotuloConfirmar, perigoso, aoConfirmar, aoCancelar, extra }: Props) {
  return (
    <PainelInferior aberto={aberto} titulo={titulo} aoFechar={aoCancelar}>
      <div className="texto-confirmacao">{children}</div>
      {extra}
      <div className="botoes">
        <button type="button" className="botao botao-secundario" onClick={aoCancelar}>Cancelar</button>
        <button type="button" className={`botao ${perigoso ? 'botao-perigo' : 'botao-primario'}`} onClick={aoConfirmar}>
          {rotuloConfirmar}
        </button>
      </div>
    </PainelInferior>
  );
}
