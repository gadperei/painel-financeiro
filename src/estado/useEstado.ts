import { useCallback, useEffect, useState } from 'react';
import { carregar, salvar } from '../dados/armazenamento';
import { gerarExemplo } from '../dados/exemplo';
import type { Estado } from '../dados/tipos';
import { hojeLocal } from '../regras/datas';

export type StatusApp =
  | { tipo: 'carregando' }
  | { tipo: 'pronto' }
  | { tipo: 'erro-dados'; bruto: string; versaoNova: boolean };

// Acessar `localStorage` pode lançar erro (navegador bloqueando); carregar/salvar já tratam.
const armazenamento = {
  getItem: (k: string) => window.localStorage.getItem(k),
  setItem: (k: string, v: string) => window.localStorage.setItem(k, v),
};

export function useEstado() {
  const [status, setStatus] = useState<StatusApp>({ tipo: 'carregando' });
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erroSalvar, setErroSalvar] = useState(false);

  useEffect(() => {
    const r = carregar(armazenamento);
    if (r.tipo === 'vazio') {
      setEstado(gerarExemplo(hojeLocal()));
      setStatus({ tipo: 'pronto' });
    } else if (r.tipo === 'ok') {
      setEstado(r.estado);
      setStatus({ tipo: 'pronto' });
    } else {
      setStatus({ tipo: 'erro-dados', bruto: r.bruto, versaoNova: r.tipo === 'versao-nova' });
    }
  }, []);

  // Toda mudança é salva. Se falhar, a interface mostra o aviso.
  useEffect(() => {
    if (estado) setErroSalvar(!salvar(armazenamento, estado));
  }, [estado]);

  // Com dados reais, pede ao navegador para não apagar os dados quando faltar espaço.
  const modoExemplo = estado?.modoExemplo;
  useEffect(() => {
    if (modoExemplo === false) navigator.storage?.persist?.().catch(() => undefined);
  }, [modoExemplo]);

  const atualizar = useCallback((f: (e: Estado) => Estado) => {
    setEstado((atual) => (atual ? f(atual) : atual));
  }, []);

  const substituir = useCallback((novo: Estado) => {
    setEstado(novo);
    setStatus({ tipo: 'pronto' });
  }, []);

  return { status, estado, atualizar, substituir, erroSalvar };
}
