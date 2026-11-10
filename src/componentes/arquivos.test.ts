import { describe, expect, it } from 'vitest';
import { ACEITA_BACKUP, arquivoParaCompartilhar } from './arquivos';

describe('arquivoParaCompartilhar', () => {
  const aceitaTudo = () => true;

  it('no celular, oferece o backup como .txt (o Chrome do Android recusa .json)', async () => {
    const f = arquivoParaCompartilhar('financas-backup-2026-11-10.json', '{"a":1}', true, aceitaTudo);
    expect(f?.name).toBe('financas-backup-2026-11-10.txt');
    expect(f?.type).toBe('text/plain');
    expect(await f?.text()).toBe('{"a":1}');
  });

  it('no computador, baixa em vez de abrir a tela de compartilhar', () => {
    expect(arquivoParaCompartilhar('financas-backup-2026-11-10.json', '{}', false, aceitaTudo)).toBeNull();
  });

  it('sem suporte a compartilhar arquivos, baixa', () => {
    expect(arquivoParaCompartilhar('financas-backup-2026-11-10.json', '{}', true, () => false)).toBeNull();
  });
});

describe('ACEITA_BACKUP', () => {
  it('o importar aceita o .txt compartilhado e o .json baixado', () => {
    expect(ACEITA_BACKUP.split(',')).toEqual(expect.arrayContaining(['.json', '.txt']));
  });
});
