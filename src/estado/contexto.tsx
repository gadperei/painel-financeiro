import { createContext, useContext } from 'react';
import type { Colecao } from '../dados/operacoes';
import type { Estado } from '../dados/tipos';
import type { Dia } from '../regras/datas';

export interface AcaoAviso {
  rotulo: string;
  aoClicar(): void;
}

export interface ValorApp {
  estado: Estado;
  hoje: Dia;
  atualizar(f: (e: Estado) => Estado): void;
  substituir(e: Estado): void;
  /** Exclui e mostra "Item excluído" com "Desfazer" por 5 s. */
  excluir(colecao: Colecao, id: string): void;
  abrirConfig(): void;
  abrirNovoGasto(): void;
  avisar(mensagem: string, acao?: AcaoAviso): void;
}

export const ContextoApp = createContext<ValorApp | null>(null);

export function useApp(): ValorApp {
  const v = useContext(ContextoApp);
  if (!v) throw new Error('useApp precisa estar dentro de <ContextoApp.Provider>');
  return v;
}
