import { describe, expect, it } from 'vitest';
import {
  adicionarMeses,
  diasEntre,
  hojeLocal,
  mesDe,
  mesesEntre,
  nomeMes,
  primeiroDia,
  rotuloMesCurto,
  ultimoDiaDoMes,
  vencimentoEfetivo,
} from './datas';

describe('datas', () => {
  it('converte e soma meses', () => {
    expect(mesDe('2026-11-10')).toBe('2026-11');
    expect(adicionarMeses('2026-11', 2)).toBe('2027-01');
    expect(adicionarMeses('2026-01', -1)).toBe('2025-12');
    expect(mesesEntre('2026-10', '2027-01')).toBe(3);
  });

  it('último dia e vencimento efetivo', () => {
    expect(ultimoDiaDoMes('2028-02')).toBe(29);
    expect(ultimoDiaDoMes('2026-02')).toBe(28);
    expect(vencimentoEfetivo('2026-11', 31)).toBe('2026-11-30');
    expect(vencimentoEfetivo('2026-11', 5)).toBe('2026-11-05');
    expect(primeiroDia('2026-11')).toBe('2026-11-01');
  });

  it('dias entre datas atravessando o ano', () => {
    expect(diasEntre('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('nomes de mês', () => {
    expect(nomeMes('2026-03')).toBe('março');
    expect(rotuloMesCurto('2027-02')).toBe('fev/27');
  });

  it('hoje usa a data local, não UTC', () => {
    expect(hojeLocal(new Date(2026, 10, 30, 22, 30))).toBe('2026-11-30');
  });
});
