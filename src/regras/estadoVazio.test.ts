// Nenhuma regra pode quebrar com tudo vazio (logo depois de "Começar com meus dados").
import { describe, expect, it } from 'vitest';
import { proximosVencimentos } from './avisos';
import { fecharMes } from './fechamento';
import { totaisPorCategoria } from './gastos';
import { textoAlivio } from './parcelas';
import { calcularSobraPrevista } from './projecao';
import { calcularRecompensa } from './recompensa';
import { calcularScore, sequencia } from './score';
import { estadoVazio } from '../dados/padroes';
import { HOJE } from '../testes/fabrica';

describe('estado vazio', () => {
  it('todas as regras respondem sem quebrar', () => {
    const v = estadoVazio(HOJE);
    expect(calcularSobraPrevista(v)).toBe(0);
    expect(calcularScore(v, HOJE, 'parcial')).toEqual({ total: 100, aportes: null, contasEmDia: null, mesNoAzul: 30 });
    expect(textoAlivio(v.parcelamentos, v.mesAberto)).toBeNull();
    expect(totaisPorCategoria(v, v.mesAberto)).toEqual([]);
    expect(calcularRecompensa(v, HOJE, 'parcial')).toBeNull();
    expect(proximosVencimentos(v, HOJE)).toEqual([]);
    expect(sequencia(v.historico, 70)).toBe(0);
    expect(fecharMes(v, '2026-12-01').historico).toHaveLength(1);
  });
});
