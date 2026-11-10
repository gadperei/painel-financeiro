export type Aba = 'inicio' | 'mes' | 'metas' | 'historico';

const ABAS: { id: Aba; rotulo: string; icone: string }[] = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'mes', rotulo: 'Mês', icone: '📅' },
  { id: 'metas', rotulo: 'Metas', icone: '🎯' },
  { id: 'historico', rotulo: 'Histórico', icone: '📈' },
];

interface Props {
  aba: Aba;
  aoTrocar(a: Aba): void;
  aoNovoGasto(): void;
}

export function BarraAbas({ aba, aoTrocar, aoNovoGasto }: Props) {
  return (
    <>
      <button type="button" className="botao-gasto" onClick={aoNovoGasto} aria-label="Lançar gasto">
        <span aria-hidden="true">+</span> gasto
      </button>
      <nav className="barra-abas" aria-label="Seções">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`aba ${aba === a.id ? 'aba-ativa' : ''}`}
            aria-current={aba === a.id ? 'page' : undefined}
            onClick={() => aoTrocar(a.id)}
          >
            <span className="aba-icone" aria-hidden="true">{a.icone}</span>
            <span>{a.rotulo}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
