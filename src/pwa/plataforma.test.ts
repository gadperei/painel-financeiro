import { describe, expect, it } from 'vitest';
import { plataformaInstalacao } from './plataforma';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';

describe('plataforma de instalação', () => {
  it('detecta plataforma de instalação', () => {
    expect(plataformaInstalacao(IPHONE, false)).toBe('ios');
    expect(plataformaInstalacao(IPHONE, true)).toBe('instalado');
    expect(plataformaInstalacao(ANDROID, false)).toBe('outro');
    expect(plataformaInstalacao(ANDROID, true)).toBe('instalado');
  });
});
