import { useState } from 'react';
import { AnelScore } from '../componentes/AnelScore';
import { exportarBackup } from '../componentes/arquivos';
import { Card } from '../componentes/Card';
import { ConfirmarAcao } from '../componentes/ConfirmarAcao';
import { GraficoCategorias } from '../componentes/GraficoCategorias';
import { backupAtrasado } from '../dados/backup';
import { comecarComMeusDados, dispensarRecompensa, marcar } from '../dados/operacoes';
import { useApp } from '../estado/contexto';
import { avisoDaConta, proximosVencimentos } from '../regras/avisos';
import { diasEntre, nomeMes, vencimentoEfetivo } from '../regras/datas';
import { formatarReais } from '../regras/dinheiro';
import { precisaFechar } from '../regras/fechamento';
import { totaisPorCategoria } from '../regras/gastos';
import { calcularSobraPrevista } from '../regras/projecao';
import { recompensaDoCard } from '../regras/recompensa';
import { calcularScore, sequencia } from '../regras/score';
import { capitalizar, formatarDiaCurto } from './formato';
import { ResumoFechamento } from './ResumoFechamento';

function quandoVence(dias: number): string {
  if (dias === 0) return 'vence hoje';
  if (dias === 1) return 'vence amanhã';
  return `vence em ${dias} dias`;
}

export function Inicio() {
  const { estado, hoje, atualizar, substituir } = useApp();
  const [confirmarComeco, setConfirmarComeco] = useState(false);
  const [resumoAberto, setResumoAberto] = useState(false);

  const { config, mesAberto } = estado;
  const score = calcularScore(estado, hoje, 'parcial');
  const semScore = score.aportes === null && score.contasEmDia === null;
  const seq = sequencia(estado.historico, config.metaScore);
  const sobra = calcularSobraPrevista(estado);
  const recompensa = recompensaDoCard(estado, hoje);
  const categorias = totaisPorCategoria(estado, mesAberto);
  const proximos = proximosVencimentos(estado, hoje);

  const contasComAviso = estado.contas
    .map((c) => ({ c, aviso: avisoDaConta(c, mesAberto, hoje) }))
    .filter((x) => x.aviso !== null);
  const fecharMes = precisaFechar(estado, hoje);
  const lembrarBackup = backupAtrasado(estado, hoje);
  const temAlertas = contasComAviso.length > 0 || fecharMes || lembrarBackup;

  async function fazerBackup() {
    if (await exportarBackup(estado, hoje)) atualizar((e) => ({ ...e, ultimoBackup: hoje }));
  }

  return (
    <>
      {estado.modoExemplo && (
        <div className="aviso aviso-info faixa-exemplo">
          <p><strong>Você está vendo um exemplo.</strong> Os dados abaixo são fictícios.</p>
          <button type="button" className="botao botao-primario" onClick={() => setConfirmarComeco(true)}>
            Começar com meus dados
          </button>
        </div>
      )}

      <Card titulo="Score do mês" acao={<span className="suave">meta {config.metaScore}</span>}>
        {semScore ? (
          <p className="vazio">Cadastre contas e aportes para ver seu score.</p>
        ) : (
          <div className="score">
            <AnelScore total={score.total} />
            <ul className="score-criterios">
              <li><span>Aportes</span><strong>{score.aportes ?? '—'}<small>/40</small></strong></li>
              <li><span>Contas em dia</span><strong>{score.contasEmDia ?? '—'}<small>/30</small></strong></li>
              <li><span>Mês no azul</span><strong>{score.mesNoAzul}<small>/30</small></strong></li>
            </ul>
          </div>
        )}
        {seq > 0 && <p className="sequencia">🔥 {seq} {seq === 1 ? 'mês' : 'meses'} acima da meta</p>}
      </Card>

      <Card titulo="Sobra prevista no fim do mês">
        <p className={`numero-grande ${sobra < 0 ? 'negativo' : 'positivo'}`}>{formatarReais(sobra)}</p>
        <p className="suave">caixa + renda a receber − contas e aportes pendentes</p>
      </Card>

      {temAlertas && (
        <Card titulo="Alertas">
          <ul className="linhas">
            {fecharMes && (
              <li className="linha">
                <span className="linha-info">{capitalizar(nomeMes(mesAberto))} acabou. Fechar o mês?</span>
                <button type="button" className="botao botao-primario" onClick={() => setResumoAberto(true)}>Fechar</button>
              </li>
            )}
            {contasComAviso.map(({ c, aviso }) => {
              const venc = vencimentoEfetivo(mesAberto, c.dia ?? 1);
              return (
                <li key={c.id} className="linha">
                  <span className={`selo ${aviso === 'atrasada' ? 'selo-vermelho' : 'selo-amarelo'}`}>
                    {aviso === 'atrasada' ? 'atrasada' : 'em breve'}
                  </span>
                  <span className="linha-info">
                    {c.nome} — {aviso === 'atrasada' ? `venceu ${formatarDiaCurto(venc)}` : quandoVence(diasEntre(hoje, venc))}
                  </span>
                </li>
              );
            })}
            {lembrarBackup && (
              <li className="linha">
                <span className="linha-info">Faça um backup dos seus dados</span>
                <button type="button" className="botao botao-secundario" onClick={fazerBackup}>Fazer backup</button>
              </li>
            )}
          </ul>
        </Card>
      )}

      {recompensa && (
        <Card titulo="Mês bom! 🎉" className="card-recompensa">
          <p>{recompensa.texto}</p>
          <div className="botoes">
            <button type="button" className="botao botao-secundario" onClick={() => atualizar(dispensarRecompensa)}>Agora não</button>
          </div>
        </Card>
      )}

      <Card titulo="Próximos vencimentos">
        {proximos.length === 0 ? (
          <p className="vazio">Nenhuma conta pendente com dia fixo.</p>
        ) : (
          <ul className="linhas">
            {proximos.map((c) => (
              <li key={c.id} className="linha">
                <label className="marcador" aria-label={`Marcar ${c.nome} como paga`}>
                  <input type="checkbox" checked={false} onChange={() => atualizar((e) => marcar(e, 'contas', c.id, hoje))} />
                </label>
                <span className="linha-info">
                  <span className="linha-nome">{c.nome}</span>
                  <span className="linha-detalhe"> · dia {c.dia}</span>
                </span>
                <span className="linha-valor">{formatarReais(c.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card titulo="Para onde vai o dinheiro">
        {categorias.length === 0 ? (
          <p className="vazio">Nenhum gasto lançado este mês.</p>
        ) : (
          <GraficoCategorias dados={categorias} />
        )}
      </Card>

      <ResumoFechamento aberto={resumoAberto} aoFechar={() => setResumoAberto(false)} />

      <ConfirmarAcao
        aberto={confirmarComeco}
        titulo="Começar com seus dados?"
        rotuloConfirmar="Começar"
        aoConfirmar={() => {
          setConfirmarComeco(false);
          substituir(comecarComMeusDados(hoje));
        }}
        aoCancelar={() => setConfirmarComeco(false)}
      >
        <p>O exemplo será apagado e o app fica vazio para você cadastrar sua renda, contas, aplicações e metas.</p>
      </ConfirmarAcao>
    </>
  );
}
