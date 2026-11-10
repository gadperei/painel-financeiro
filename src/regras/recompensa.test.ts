import { describe, expect, it } from 'vitest';
import { calcularRecompensa, recompensaDoCard } from './recompensa';
import { CONFIG_PADRAO } from '../dados/padroes';
import type { Estado } from '../dados/tipos';
import { HOJE, aplicacao, aporte, conta, criarEstado, meta } from '../testes/fabrica';

const mesBom = (saldo: number, s: Partial<Estado> = {}) => criarEstado({
  aplicacoes: [aplicacao({ saldo })],
  contas: [conta({ dia: 5, pagaEm: '2026-11-05' })],
  aportes: [aporte({ valor: 50000, feitoEm: '2026-11-02' })],
  metas: [meta({ nome: 'Viagem', alvo: 500000 })],
  ...s,
});

describe('recompensa', () => {
  it('sugestão, texto e arredondamento', () => {
    const r = calcularRecompensa(mesBom(120000), HOJE, 'parcial');
    expect(r?.sugestao).toBe(60000);
    expect(r?.texto).toBe('Você bateu suas metas de novembro e sobraram R$ 1.200,00 além do planejado. ' +
      'Que tal separar R$ 600,00 para um fim de semana fora? O resto pode adiantar a meta Viagem.');
    expect(calcularRecompensa(mesBom(123456), HOJE, 'parcial')?.sugestao).toBe(61000);
    expect(calcularRecompensa(mesBom(15000), HOJE, 'parcial')).toBeNull();
  });

  it('faixas de ideia', () => {
    const ideia = (saldo: number) => calcularRecompensa(mesBom(saldo), HOJE, 'parcial')?.ideia;
    expect(ideia(50000)).toBe('um jantar ou passeio');
    expect(ideia(60000)).toBe('um fim de semana fora');
    expect(ideia(300000)).toBe('um fim de semana fora');
    expect(ideia(302000)).toBe('uma viagem');
  });

  it('condições', () => {
    expect(calcularRecompensa(mesBom(120000, { aportes: [aporte({ valor: 50000 })] }), HOJE, 'parcial')).toBeNull();
    expect(calcularRecompensa(mesBom(120000, { config: { ...CONFIG_PADRAO, metaScore: 101 } }), HOJE, 'parcial')).toBeNull();
    expect(calcularRecompensa(mesBom(120000, { config: { ...CONFIG_PADRAO, sobraMinima: 120000 } }), HOJE, 'parcial')).toBeNull();
    expect(calcularRecompensa(mesBom(120000, { metas: [] }), HOJE, 'parcial')?.texto.endsWith('para um fim de semana fora?')).toBe(true);
  });

  it('card exige zero pendências e não dispensado', () => {
    expect(recompensaDoCard(mesBom(120000), HOJE)).not.toBeNull();
    expect(recompensaDoCard(mesBom(120000, { contas: [conta({ dia: 25 })] }), HOJE)).toBeNull();
    expect(recompensaDoCard(mesBom(120000, { recompensaDispensadaEm: '2026-11' }), HOJE)).toBeNull();
  });
});
