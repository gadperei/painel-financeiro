import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface CampoTextoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  rotulo: string;
  valor: string;
  aoMudar(v: string): void;
  erro?: string | null;
  dica?: string;
}

export function CampoTexto({ rotulo, valor, aoMudar, erro, dica, ...resto }: CampoTextoProps) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        className="entrada"
        value={valor}
        onChange={(ev) => aoMudar(ev.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...resto}
      />
      {erro ? <p id={`${id}-erro`} className="campo-erro">{erro}</p> : dica && <p className="campo-dica">{dica}</p>}
    </div>
  );
}

export function Alternar({ rotulo, marcado, aoMudar }: { rotulo: string; marcado: boolean; aoMudar(v: boolean): void }) {
  return (
    <label className="alternar">
      <input type="checkbox" checked={marcado} onChange={(ev) => aoMudar(ev.target.checked)} />
      <span>{rotulo}</span>
    </label>
  );
}

interface SeletorProps {
  rotulo: string;
  valor: string;
  aoMudar(v: string): void;
  children: ReactNode;
}

export function Seletor({ rotulo, valor, aoMudar, children }: SeletorProps) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <select id={id} className="entrada" value={valor} onChange={(ev) => aoMudar(ev.target.value)}>
        {children}
      </select>
    </div>
  );
}

/**
 * Botões Excluir (só na edição) / Cancelar / Salvar no rodapé dos formulários.
 * O Salvar é do tipo "submit": quem salva é o onSubmit do formulário (uma vez só).
 */
export function BotoesFormulario({ podeSalvar, aoCancelar, aoExcluir }: {
  podeSalvar: boolean;
  aoCancelar(): void;
  aoExcluir?: () => void;
}) {
  return (
    <div className="botoes">
      {aoExcluir && <button type="button" className="botao botao-perigo" onClick={aoExcluir}>Excluir</button>}
      <button type="button" className="botao botao-secundario" onClick={aoCancelar}>Cancelar</button>
      <button type="submit" className="botao botao-primario" disabled={!podeSalvar}>Salvar</button>
    </div>
  );
}
