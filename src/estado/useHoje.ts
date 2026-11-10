import { useEffect, useState } from 'react';
import { hojeLocal, type Dia } from '../regras/datas';

/** Data local de hoje. Atualiza ao voltar para o app e a cada minuto (o app pode ficar aberto de um dia para o outro). */
export function useHoje(): Dia {
  const [hoje, setHoje] = useState<Dia>(() => hojeLocal());
  useEffect(() => {
    const atualizar = () => setHoje(hojeLocal());
    const id = window.setInterval(atualizar, 60_000);
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('focus', atualizar);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', atualizar);
      window.removeEventListener('focus', atualizar);
    };
  }, []);
  return hoje;
}
