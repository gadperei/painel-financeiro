import { useEffect, useState } from 'react';
import { plataformaInstalacao } from './plataforma';

// Evento do Chrome/Android que permite mostrar o "Instalar app" na hora certa (não está nos tipos padrão).
interface EventoInstalacao extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CHAVE_DISPENSADO = 'painel-financeiro:aviso-instalacao-dispensado';

function estaInstalado(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

function lerDispensado(): boolean {
  try { return localStorage.getItem(CHAVE_DISPENSADO) === '1'; } catch { return false; }
}

export function AvisoInstalacao() {
  const [plataforma, setPlataforma] = useState(() => plataformaInstalacao(navigator.userAgent, estaInstalado()));
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);
  const [dispensado, setDispensado] = useState(lerDispensado);

  useEffect(() => {
    const aoOferecer = (e: Event) => { e.preventDefault(); setEvento(e as EventoInstalacao); };
    const aoInstalar = () => { setEvento(null); setPlataforma('instalado'); };
    window.addEventListener('beforeinstallprompt', aoOferecer);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoOferecer);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  function dispensar() {
    setDispensado(true);
    try { localStorage.setItem(CHAVE_DISPENSADO, '1'); } catch { /* sem armazenamento: só some nesta sessão */ }
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
  }

  if (dispensado || plataforma === 'instalado') return null;
  if (plataforma === 'outro' && !evento) return null;

  return (
    <div className="aviso aviso-info aviso-instalacao">
      {plataforma === 'ios' ? (
        <p>
          <strong>Instale o app:</strong> no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.
          Os dados do app instalado ficam separados dos do Safari: instale primeiro e use sempre pelo ícone.
        </p>
      ) : (
        <p><strong>Instale o app</strong> para abrir pelo ícone, mesmo sem internet.</p>
      )}
      <div className="botoes">
        <button type="button" className="botao botao-secundario" onClick={dispensar}>Agora não</button>
        {plataforma === 'outro' && <button type="button" className="botao botao-primario" onClick={instalar}>Instalar app</button>}
      </div>
    </div>
  );
}
