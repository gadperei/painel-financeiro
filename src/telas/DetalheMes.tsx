import { GraficoCategorias } from '../componentes/GraficoCategorias';
import { ListaGastos } from '../componentes/ListaGastos';
import { ID_OUTROS } from '../dados/padroes';
import type { MesFechado } from '../dados/tipos';
import { useApp } from '../estado/contexto';
import { formatarReais } from '../regras/dinheiro';
import { gastosDoMes } from '../regras/gastos';
import { faixaDoScore } from '../regras/score';

/** Detalhe de um mês fechado: score por critério, números, gastos por categoria e a lista de gastos. */
export function DetalheMes({ registro }: { registro: MesFechado }) {
  const { estado } = useApp();
  const cores = new Map(estado.categorias.map((c) => [c.id, c.cor]));
  const corOutros = cores.get(ID_OUTROS) ?? '#7b8494';
  const fatias = registro.gastosPorCategoria.map((g) => ({ nome: g.nome, total: g.total, cor: cores.get(g.categoriaId) ?? corOutros }));
  const s = registro.score;

  return (
    <div className="detalhe-mes">
      {registro.semRegistro ? (
        <p className="aviso aviso-alerta">O app não foi usado neste mês, então não há score nem totais.</p>
      ) : (
        <>
          {s && (
            <div className="totais">
              <span>Score</span><strong className={`num texto-${faixaDoScore(s.total)}`}>{s.total}</strong>
              <span>Aportes</span><span className="num">{s.aportes ?? '—'}/40</span>
              <span>Contas em dia</span><span className="num">{s.contasEmDia ?? '—'}/30</span>
              <span>Mês no azul</span><span className="num">{s.mesNoAzul}/30</span>
            </div>
          )}
          <div className="totais">
            <span>Renda</span><span className="num">{formatarReais(registro.renda)}</span>
            <span>Contas pagas</span><span className="num">{formatarReais(registro.contasPagas)}</span>
            <span>Sobra</span><span className={`num ${registro.sobra < 0 ? 'negativo' : 'positivo'}`}>{formatarReais(registro.sobra)}</span>
          </div>
          {registro.recompensaSugerida != null && (
            <p className="aviso aviso-ok">🎉 Recompensa sugerida: {formatarReais(registro.recompensaSugerida)}</p>
          )}
        </>
      )}

      <h3>Gastos por categoria</h3>
      {fatias.length === 0 ? <p className="vazio">Nenhum gasto neste mês.</p> : <GraficoCategorias dados={fatias} />}

      <h3>Gastos lançados</h3>
      <ListaGastos gastos={gastosDoMes(estado, registro.mes)} categorias={estado.categorias} />
    </div>
  );
}
