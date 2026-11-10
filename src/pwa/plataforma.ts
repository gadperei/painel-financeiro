export type PlataformaInstalacao = 'instalado' | 'ios' | 'outro';

/**
 * Como oferecer a instalação: já instalado (aberto pelo ícone), iPhone/iPad (instruções do Safari)
 * ou outro navegador (botão "Instalar app" via beforeinstallprompt).
 * Obs.: iPadOS 13+ se apresenta como Mac e cai em "outro".
 */
export function plataformaInstalacao(userAgent: string, standalone: boolean): PlataformaInstalacao {
  if (standalone) return 'instalado';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  return 'outro';
}
