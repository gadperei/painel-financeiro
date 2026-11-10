import { useRegisterSW } from 'virtual:pwa-register/react';

/** Quando uma versão nova foi publicada, oferece atualizar (o app continua funcionando até a pessoa tocar). */
export function AvisoAtualizacao() {
  const { needRefresh: [precisaAtualizar, setPrecisaAtualizar], updateServiceWorker } = useRegisterSW();
  if (!precisaAtualizar) return null;
  return (
    <div className="faixa-atualizacao" role="status">
      <span>Nova versão disponível</span>
      <button type="button" className="botao botao-primario" onClick={() => updateServiceWorker(true)}>Atualizar</button>
      <button type="button" className="botao-icone" aria-label="Agora não" onClick={() => setPrecisaAtualizar(false)}>×</button>
    </div>
  );
}
