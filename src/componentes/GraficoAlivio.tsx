import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from 'recharts';
import type { Mes } from '../regras/datas';
import { rotuloMesCurto } from '../regras/datas';
import type { Centavos } from '../regras/dinheiro';

const reaisCurto = (c: Centavos) => `R$ ${Math.round(c / 100).toLocaleString('pt-BR')}`;

/** Barras com o total de parcelas em cada um dos próximos 6 meses. */
export function GraficoAlivio({ serie }: { serie: { mes: Mes; valor: Centavos }[] }) {
  const dados = serie.map((s) => ({ mes: rotuloMesCurto(s.mes), valor: s.valor }));
  return (
    <div aria-hidden="true">
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={dados} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--texto-suave)' }} />
          <Bar dataKey="valor" fill="var(--primaria)" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            <LabelList dataKey="valor" position="top" formatter={(v: unknown) => reaisCurto(Number(v))} style={{ fontSize: 11, fill: 'var(--texto-2)' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
