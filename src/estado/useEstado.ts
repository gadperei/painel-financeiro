import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAVE, criarSincronizador } from '../dados/armazenamento';
import { gerarExemplo } from '../dados/exemplo';
import type { Estado } from '../dados/tipos';
import { hojeLocal } from '../regras/datas';

export type StatusApp =
  | { tipo: 'carregando' }
  | { tipo: 'pronto' }
  | { tipo: 'erro-dados'; bruto: string; versaoNova: boolean };

// Acessar `localStorage` pode lançar erro (navegador bloqueando); o sincronizador já trata.
const armazenamento = {
  getItem: (k: string) => window.localStorage.getItem(k),
  setItem: (k: string, v: string) => window.localStorage.setItem(k, v),
};

export function useEstado() {
  const [status, setStatus] = useState<StatusApp>({ tipo: 'carregando' });
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erroSalvar, setErroSalvar] = useState(false);
  const sinc = useRef(criarSincronizador(armazenamento)).current;

  useEffect(() => {
    const r = sinc.carregar();
    if (r.tipo === 'vazio') {
      setEstado(gerarExemplo(hojeLocal()));
      setStatus({ tipo: 'pronto' });
    } else if (r.tipo === 'ok') {
      setEstado(r.estado);
      setStatus({ tipo: 'pronto' });
    } else {
      setStatus({ tipo: 'erro-dados', bruto: r.bruto, versaoNova: r.tipo === 'versao-nova' });
    }
  }, [sinc]);

  // Outra janela do app (o app instalado e a aba do navegador, ou duas abas) gravou dados:
  // adota o que está salvo antes que esta janela, desatualizada, grave por cima.
  useEffect(() => {
    const verificar = () => {
      const r = sinc.verificarExterno();
      if (r?.tipo === 'ok') setEstado(r.estado);
      else if (r?.tipo === 'versao-nova') setStatus({ tipo: 'erro-dados', bruto: r.bruto, versaoNova: true });
    };
    const aoMudarArmazenamento = (ev: StorageEvent) => { if (ev.key === CHAVE || ev.key === null) verificar(); };
    const aoVoltar = () => { if (document.visibilityState === 'visible') verificar(); };
    window.addEventListener('storage', aoMudarArmazenamento);
    window.addEventListener('focus', verificar);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.removeEventListener('storage', aoMudarArmazenamento);
      window.removeEventListener('focus', verificar);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [sinc]);

  // Toda mudança é salva (só se mudou de fato). Se falhar, a interface mostra o aviso.
  useEffect(() => {
    if (estado && status.tipo === 'pronto') setErroSalvar(!sinc.salvar(estado));
  }, [estado, status.tipo, sinc]);

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
