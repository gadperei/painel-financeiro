import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatarReais, type Centavos } from '../regras/dinheiro';

export interface FatiaCategoria {
  nome: string;
  total: Centavos;
  cor: string;
  variacao?: number | null;
}

/** Rosca de gastos por categoria, com a lista (valor, % e seta comparando com o mês anterior). */
export function GraficoCategorias({ dados }: { dados: FatiaCategoria[] }) {
  const soma = dados.reduce((s, d) => s + d.total, 0);
  return (
    <div className="grafico-categorias">
      <div className="rosca" aria-hidden="true">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={dados} dataKey="total" nameKey="nome" innerRadius={44} outerRadius={70} paddingAngle={1} isAnimationActive={false}>
              {dados.map((d) => <Cell key={d.nome} fill={d.cor} stroke="var(--superficie)" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="linhas legenda">
        {dados.map((d) => (
          <li key={d.nome} className="linha">
            <span className="bolinha" style={{ background: d.cor }} />
            <span className="linha-info">
              <span className="linha-nome">{d.nome}</span>
              <span className="linha-detalhe">
                {' '}{soma > 0 ? Math.round((d.total / soma) * 100) : 0}%
                {d.variacao != null && Math.round(d.variacao) === 0 && <span> · igual ao mês anterior</span>}
                {d.variacao != null && Math.round(d.variacao) !== 0 && (
                  <span className={d.variacao > 0 ? 'negativo' : 'positivo'}>
                    {' · '}{d.variacao > 0 ? '↑' : '↓'} {Math.abs(Math.round(d.variacao))}% vs. mês anterior
                  </span>
                )}
              </span>
            </span>
            <span className="linha-valor">{formatarReais(d.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
