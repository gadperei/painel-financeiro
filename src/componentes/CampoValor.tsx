import { useId } from 'react';
import { centavosDeDigitos, formatarReais, type Centavos } from '../regras/dinheiro';

interface Props {
  rotulo: string;
  valor: Centavos;
  aoMudar(c: Centavos): void;
  autoFocus?: boolean;
  erro?: string | null;
}

/** Campo de valor com máscara de centavos: digitar 1234 mostra R$ 12,34. */
export function CampoValor({ rotulo, valor, aoMudar, autoFocus, erro }: Props) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        className="entrada entrada-valor"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        value={formatarReais(valor)}
        onChange={(ev) => aoMudar(centavosDeDigitos(ev.target.value))}
        onFocus={(ev) => {
          const el = ev.target;
          requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
      />
      {erro && <p id={`${id}-erro`} className="campo-erro">{erro}</p>}
    </div>
  );
}
