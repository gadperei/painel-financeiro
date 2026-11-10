import { ID_OUTROS } from '../dados/padroes';
import type { Categoria, Gasto } from '../dados/tipos';
import { formatarReais } from '../regras/dinheiro';
import { formatarDiaCurto } from '../telas/formato';

interface Props {
  gastos: Gasto[];
  categorias: Categoria[];
  aoTocar?: (g: Gasto) => void;
}

/** Lista de gastos, do mais recente para o mais antigo. */
export function ListaGastos({ gastos, categorias, aoTocar }: Props) {
  if (gastos.length === 0) return <p className="vazio">Nenhum gasto.</p>;
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const ordenados = [...gastos].sort((a, b) => b.data.localeCompare(a.data));
  return (
    <ul className="linhas">
      {ordenados.map((g) => {
        const cat = porId.get(g.categoriaId) ?? porId.get(ID_OUTROS);
        const conteudo = (
          <>
            <span className="bolinha" style={{ background: cat?.cor ?? 'var(--texto-suave)' }} />
            <span className="linha-info">
              <span className="linha-nome">{g.descricao || cat?.nome || 'Outros'}</span>
              <span className="linha-detalhe"> · {formatarDiaCurto(g.data)}{g.descricao && cat ? ` · ${cat.nome}` : ''}</span>
            </span>
            <span className="linha-valor">{formatarReais(g.valor)}</span>
          </>
        );
        return (
          <li key={g.id} className="linha">
            {aoTocar ? (
              <button type="button" className="linha-toque" onClick={() => aoTocar(g)}>{conteudo}</button>
            ) : (
              conteudo
            )}
          </li>
        );
      })}
    </ul>
  );
}
