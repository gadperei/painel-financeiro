import { gerarBackup, nomeArquivoBackup } from '../dados/backup';
import type { Estado } from '../dados/tipos';
import type { Dia } from '../regras/datas';

export function baixarArquivo(nome: string, conteudo: string, tipo: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Tipos que o "Importar backup" aceita: o .json baixado e o .txt compartilhado pelo celular. */
export const ACEITA_BACKUP = '.json,.txt,application/json,text/plain';

/**
 * O arquivo a oferecer na tela de compartilhar, ou null para baixar.
 * Só no celular (no computador, baixar é o esperado). Vai como .txt porque o Chrome do Android
 * recusa compartilhar .json; o conteúdo é o mesmo e o importar lê os dois.
 */
export function arquivoParaCompartilhar(
  nome: string,
  conteudo: string,
  celular: boolean,
  podeCompartilhar: (arquivo: File) => boolean,
): File | null {
  if (!celular) return null;
  const arquivo = new File([conteudo], nome.replace(/\.json$/, '.txt'), { type: 'text/plain' });
  return podeCompartilhar(arquivo) ? arquivo : null;
}

/**
 * No celular, usa a tela de compartilhar (Drive, WhatsApp...); senão, baixa o arquivo.
 * Devolve false se a pessoa cancelou o compartilhamento.
 */
export async function compartilharOuBaixar(nome: string, conteudo: string): Promise<boolean> {
  const arquivo = arquivoParaCompartilhar(nome, conteudo, /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    (f) => !!navigator.canShare?.({ files: [f] }));
  if (arquivo) {
    try {
      await navigator.share({ files: [arquivo], title: nome });
      return true;
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return false;
      // Outro erro no compartilhamento: cai para o download.
    }
  }
  baixarArquivo(nome, conteudo, 'application/json');
  return true;
}

/** Abre o seletor de arquivos e devolve o texto do arquivo escolhido (null se cancelar). */
export function escolherArquivo(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', async () => {
      const arquivo = input.files?.[0];
      resolve(arquivo ? await arquivo.text() : null);
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

/** Exporta o backup; devolve true se o arquivo foi salvo ou compartilhado. */
export function exportarBackup(e: Estado, hoje: Dia): Promise<boolean> {
  return compartilharOuBaixar(nomeArquivoBackup(hoje), gerarBackup(e, new Date().toISOString()));
}
