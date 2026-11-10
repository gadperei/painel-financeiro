# Painel Financeiro — Design (v1)

- **Data:** 2026-11-10
- **Status:** aguardando revisão do Gabriel
- **Nome provisório:** Painel Financeiro (`painel-financeiro`) — pode ser trocado antes de publicar

---

## 1. Objetivo e contexto

Reconstruir do zero, fora da Amazon, o painel financeiro pessoal que o Gabriel fez no Amazon Quick, transformando-o num app genérico que qualquer pessoa pode usar.

O projeto tem três objetivos, em ordem:

1. **Portfólio:** primeiro projeto público (GitHub + link no ar) para o perfil de freelancer no 99freela, LinkedIn e GitHub.
2. **Aprendizado:** percorrer o caminho completo de publicar um app — Git, GitHub, Vercel, PWA.
3. **Ferramenta pessoal:** o Gabriel usa no dia a dia com os dados reais dele, no próprio celular.

**Restrições**

- Feito com contas e equipamentos pessoais; nenhum código ou dado copiado da conta da Amazon.
- O app de referência contém dados financeiros reais. **Nenhum dado real vai para o código, o repositório ou o site publicado.**
- O Gabriel tem nível básico de programação; o código é gerado com IA. Clareza e organização importam mais que esperteza.
- Uso principal: celular **Android**. Também precisa funcionar no **iPhone** e no PC.
- Tempo disponível: ~20 h/semana. Estimativa grosseira: ~2 semanas.

**Critérios de sucesso**

- O app está no ar num link público, instalável no Android, funcionando sem internet.
- As regras de cálculo têm testes automáticos passando.
- O repositório público tem um README que explica o projeto, com prints e o link.
- O Gabriel consegue substituir o app antigo e fechar um mês real com o novo.

---

## 2. Escopo

### Dentro da v1

| # | Função | Observação |
|---|--------|------------|
| 1 | Renda do mês | Lista de entradas (nome, dia, valor) com "recebi" |
| 2 | Contas a pagar | Vencimento, "pago" com data, avisos por data real |
| 3 | Caixa e investimentos | Aplicações do tipo operacional ou guardado (ligado a meta) |
| 4 | Aportes e metas | Barra de progresso, prazo, alvo automático da reserva |
| 5 | Projeção do fim do mês | Coração do app |
| 6 | Parcelamentos | Quando acabam + gráfico de alívio |
| 7 | Histórico mensal | Um registro por mês fechado, com gráficos |
| 8 | Simulador de juros compostos | Aberto a partir de uma meta, % do CDI |
| 9 | Gastos por categoria | Lançamento rápido manual; é o gráfico "para onde vai o dinheiro" |
| 10 | Score do mês | 0–100, com meta e sequência |
| 11 | Mensagem de recompensa | Sugere usar parte da sobra quando o mês foi bom |
| 12 | Virada de mês | Fechamento com histórico, reset e "desfazer" |
| 13 | Backup | Exportar/importar arquivo `.json` |
| 14 | Dados de exemplo | Primeiro acesso mostra dados fictícios |
| 15 | Instalável (PWA) | Android, iPhone e PC; funciona offline |

### Removido em relação ao app antigo

- **Simulador de reserva** (coberto por metas + simulador de juros).
- **Projeção de renda extra** (específica demais para um app genérico).
- **Gráfico de pizza das contas pendentes** (substituído pelos gastos por categoria).
- **Exportar como `.html`** (substituído pelo backup `.json`).

### Fora da v1

- Login, nuvem e sincronização entre aparelhos.
- Publicação na Play Store ou App Store.
- Importação de extrato/fatura do banco (CSV/OFX).
- Importador dos dados do app antigo (são ~20 itens; redigitar é mais barato).
- Lançamento de gastos pelo WhatsApp (candidato a projeto futuro com n8n).
- Notificações push.
- Testes automáticos de tela.

---

## 3. Arquitetura

**Tipo de app:** PWA (Progressive Web App) — um site estático que se instala como aplicativo. Um único código para Android, iPhone e PC. Não existe servidor: todos os dados ficam no aparelho de quem usa.

**Tecnologias**

| Uso | Ferramenta |
|-----|-----------|
| Interface | React + Vite + TypeScript |
| PWA (ícone, instalação, offline, atualização) | `vite-plugin-pwa` |
| Gráficos | Recharts (licença MIT) |
| Validação de backup | zod |
| Testes | Vitest |
| Hospedagem | Vercel, ligada ao repositório público no GitHub |

O Highcharts do app antigo **não** é usado: exige licença paga para uso comercial.

**Organização do código**

```
painel-financeiro/
├── src/
│   ├── regras/        # cálculos puros (sem tela), cada um com seu arquivo de teste
│   ├── dados/         # tipos, salvar/carregar, migração de versão, backup, dados de exemplo
│   ├── telas/         # Início, Mês, Metas, Histórico, Configurações
│   └── componentes/   # peças reutilizáveis (cards, painel de baixo, campo de valor...)
├── public/            # ícones do app
└── docs/
```

**Regra de ouro:** tudo em `src/regras/` é função pura — recebe os dados e a data de "hoje" como parâmetros e devolve um resultado. Nada de ler o relógio ou o armazenamento lá dentro. Isso permite testar qualquer dia do ano.

**Dinheiro:** todos os valores são guardados em **centavos inteiros** (R$ 12,34 → `1234`) para evitar erros de arredondamento. Formatação na tela com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

**Datas:** "hoje" é a data local do aparelho. Meses são guardados como `"AAAA-MM"` e dias como `"AAAA-MM-DD"`. Nomes de mês em português.

---

## 4. Modelo de dados

O app guarda **cadastros** (valem todo mês) e o **estado do mês aberto** (o que já foi pago, recebido ou depositado). Na virada do mês, o estado vai para o histórico e é zerado; os cadastros continuam.

```ts
type Centavos = number;      // inteiro
type Mes = string;           // "AAAA-MM"
type Dia = string;           // "AAAA-MM-DD"

interface Estado {
  versao: number;                         // formato dos dados; começa em 1
  modoExemplo: boolean;                   // true enquanto mostra os dados fictícios
  mesAberto: Mes;
  config: Config;
  rendas: Renda[];
  contas: Conta[];
  aplicacoes: Aplicacao[];
  metas: Meta[];
  aportes: Aporte[];
  parcelamentos: Parcelamento[];
  categorias: Categoria[];
  gastos: Gasto[];                        // de todos os meses; o mês vem da data
  historico: MesFechado[];
  ultimoBackup: Dia | null;
  recompensaDispensadaEm: Mes | null;     // usuário tocou "Agora não" neste mês
  copiaAntesDoFechamento: Omit<Estado, 'copiaAntesDoFechamento'> | null;
}

interface Config {
  cdiAnual: number;              // % ao ano, ex.: 14.9
  sobraMinima: Centavos;         // padrão 0
  metaScore: number;             // padrão 70
  multiplicadorReserva: number;  // padrão 6
  recompensaPercentual: number;  // padrão 50
  recompensaMinima: Centavos;    // padrão 10000 (R$ 100)
}

interface Renda        { id: string; nome: string; dia: number | null; valor: Centavos; recebidaEm: Dia | null; }
interface Conta        { id: string; nome: string; dia: number | null; valor: Centavos; pagaEm: Dia | null; }
interface Aplicacao    { id: string; nome: string; saldo: Centavos; tipo: 'operacional' | 'guardado';
                         metaId: string | null; percentualCdi: number | null; }
interface Meta         { id: string; nome: string; alvo: Centavos; alvoAutomatico: boolean; cor: string; }
interface Aporte       { id: string; nome: string; valor: Centavos; metaId: string | null;
                         saiDoBolso: boolean; feitoEm: Dia | null; }
interface Parcelamento { id: string; nome: string; valorParcela: Centavos; parcelaAtual: number; totalParcelas: number; }
interface Categoria    { id: string; nome: string; cor: string; }
interface Gasto        { id: string; data: Dia; valor: Centavos; categoriaId: string; descricao?: string; }

interface MesFechado {
  mes: Mes;
  semRegistro: boolean;          // mês em que o app não foi usado (ver regra 7)
  renda: Centavos;
  contasPagas: Centavos;
  caixaOperacional: Centavos;
  porMeta: { metaId: string; nome: string; valor: Centavos }[];
  sobra: Centavos;
  score: { total: number; aportes: number | null; contasEmDia: number | null; mesNoAzul: number } | null;
  gastosPorCategoria: { categoriaId: string; nome: string; total: Centavos }[];
  recompensaSugerida: Centavos | null;
}
```

**Detalhes**

- `dia` de renda/conta vai de 1 a 31, ou `null` = "sem dia fixo".
- Quando `alvoAutomatico` é `true`, o campo `alvo` é ignorado e o alvo é calculado (regra 5.4).
- O valor de uma conta é editável todo mês (fatura muda). Na virada, continua igual ao do mês anterior até ser atualizado.
- Uma aplicação `operacional` paga as contas e entra na projeção. Uma aplicação `guardado` pode ser ligada a uma meta (`metaId`).
- `saiDoBolso: false` representa dinheiro de outra pessoa (ex.: aporte de um parceiro): conta para o progresso da meta, mas não desconta da projeção.
- Marcar um aporte como feito **não** altera o saldo da aplicação. O usuário continua atualizando os saldos (evita contar duas vezes).
- IDs gerados com `crypto.randomUUID()`.
- **Categorias padrão:** Mercado, Transporte, Alimentação fora, Lazer, Saúde, Casa, Outros. Todas editáveis; "Outros" não pode ser excluída. Ao excluir uma categoria, os gastos dela passam para "Outros".
- Ao excluir uma meta, aplicações e aportes ligados a ela ficam com `metaId: null` (o app avisa antes).
- **Gastos:** a data pode ir do 1º dia do mês aberto até hoje. Meses fechados não recebem gastos novos (o histórico fica congelado). Se o mês já acabou mas ainda não foi fechado, gastos com data do mês seguinte são aceitos e aparecem depois do fechamento.

---

## 5. Regras de cálculo (`src/regras/`)

Todas as regras ignoram itens com valor zero.

### 5.1 Projeção do fim do mês

```
sobra prevista = soma dos saldos das aplicações operacionais
               + soma das rendas sem "recebi"
               − soma das contas sem "pago"
               − soma dos aportes sem "feito" com saiDoBolso = true
```

A renda só soma enquanto não foi recebida — corrige a contagem dupla do app antigo, que somava a renda mesmo depois de ela entrar no caixa.

### 5.2 Avisos de conta

- **Vencimento efetivo** = dia da conta no mês aberto; se o mês não tiver esse dia (ex.: dia 31 em novembro), usa o último dia do mês.
- **Atrasada:** sem "pago" e hoje > vencimento efetivo. Se hoje já está num mês depois do mês aberto, toda conta com dia e sem "pago" está atrasada.
- **Vence em breve:** sem "pago" e o vencimento é hoje ou nos próximos 3 dias.
- Contas sem dia fixo não geram aviso.

### 5.3 Parcelamentos

Parcelamentos são informativos: já estão dentro das faturas e **não** entram na projeção.

- `restantes = totalParcelas − parcelaAtual`. Se `restantes = 0`, mostra "última parcela".
- Termina em: mês aberto + `restantes` meses.
- `encargo(k)` = soma de `valorParcela` dos parcelamentos com `restantes ≥ k`, para k = 0 a 5 (gráfico dos próximos 6 meses, começando pelo mês aberto).
- **Texto de alívio:** primeiro k em que `encargo(k) < encargo(k−1)`: "Em {mês}, as parcelas caem de {X} para {Y} (−{X−Y}/mês)". Se nenhuma termina em 6 meses: "Nenhuma parcela termina nos próximos 6 meses". Sem parcelamentos, o card some.

### 5.4 Metas

- **Já tenho** = soma dos saldos das aplicações `guardado` ligadas à meta.
- **Alvo automático** = `multiplicadorReserva` × soma dos valores de todas as contas (pagas ou não).
- **Aporte mensal da meta** = soma dos aportes ligados a ela (inclusive os com `saiDoBolso: false`).
- **Prazo sem juros** = ⌈(alvo − já tenho) ÷ aporte mensal⌉ meses. Se o aporte for zero: "sem aporte planejado". Se já atingiu: "meta atingida ✅".

### 5.5 Simulador de juros compostos

Aberto ao tocar numa meta, já preenchido: valor inicial = já tenho; aporte = aporte mensal da meta; alvo = alvo da meta; % do CDI = da primeira aplicação ligada (ou 100); CDI anual = configuração. Valores mexidos no simulador **não** são salvos.

```
taxa anual   = (%CDI ÷ 100) × (CDI anual ÷ 100)
taxa mensal  r = (1 + taxa anual)^(1/12) − 1
saldo(k+1)   = saldo(k) × (1 + r) + aporte
```

- Mês em que atinge = primeiro k com `saldo(k) ≥ alvo`; limite de 600 meses ("mais de 50 anos").
- Mostra: meses e anos, total investido, juros ganhos e quantos meses os juros adiantam em relação a guardar sem render.
- Gráfico com as curvas "com juros" e "sem juros" e uma linha na altura da meta.
- Aviso fixo: "Estimativa bruta, sem imposto de renda. Rentabilidade passada não garante rentabilidade futura."

### 5.6 Score do mês (0 a 100)

Calculado ao vivo durante o mês (parcial) e congelado no fechamento.

| Critério | Peso | Como pontua |
|----------|------|-------------|
| Aportes feitos | 40 | 40 × (soma dos aportes **feitos** ÷ soma de todos), considerando só `saiDoBolso: true` |
| Contas em dia | 30 | 30 × (contas em dia ÷ contas avaliadas) |
| Mês no azul | 30 | sobra ≥ sobra mínima → 30; 0 ≤ sobra < sobra mínima → 15; sobra < 0 → 0 |

- **Conta em dia:** com dia fixo, `pagaEm` ≤ vencimento efetivo. Sem dia fixo, paga dentro do mês aberto.
- **Contas avaliadas:** durante o mês, entram as contas já pagas e as que já venceram; conta que ainda não venceu não conta nem a favor nem contra. No fechamento, todas as contas são avaliadas (sem "pago" = não está em dia).
- A data de "pago" vem como hoje, mas pode ser editada (caso o usuário marque no app depois de ter pago em dia).
- **Sobra** = sobra prevista (5.1) no momento do cálculo.
- **Critério sem itens** (nenhum aporte com `saiDoBolso: true`, nenhuma conta avaliada) não conta, e os outros são reajustados: `total = arredondar(pontos obtidos ÷ soma dos pesos que contam × 100)`. "Mês no azul" sempre conta.
- **Faixas:** 80–100 verde, 50–79 amarelo, 0–49 vermelho.
- **Sequência:** quantos meses fechados seguidos, do mais recente para trás, tiveram score ≥ `metaScore`. Um mês "sem registro" quebra a sequência.

### 5.7 Virada do mês

O fechamento **não** é automático: o usuário pode querer marcar um pagamento atrasado antes.

- **Quando oferece:** o mês de hoje é posterior ao `mesAberto`. O Início mostra "{Mês} acabou. Fechar o mês?".
- **Antes de confirmar:** um resumo com o score final, a sobra e a recompensa (se houver). O resumo também lista o que ainda está pendente (rendas sem "recebi", contas sem "pago", aportes sem "feito"), para o usuário corrigir antes de fechar.
- **Ao confirmar:**
  1. Guarda `copiaAntesDoFechamento` com o estado atual.
  2. Cria o `MesFechado` do mês aberto:
     - `renda`: soma de todas as rendas;
     - `contasPagas`: soma das contas com "pago";
     - `caixaOperacional`: soma das aplicações operacionais;
     - `porMeta`: o "já tenho" de cada meta;
     - `sobra`: a sobra prevista (5.1) no momento do fechamento;
     - `score`: o score final, com as regras de fechamento de 5.6;
     - `gastosPorCategoria`: totais dos gastos com data no mês;
     - `recompensaSugerida`: regra 5.9.
  3. Para cada mês entre o mês aberto e o mês de hoje (exclusive), cria um `MesFechado` com `semRegistro: true`, `score: null` e valores zerados, exceto `gastosPorCategoria`, calculado com os gastos que tiverem data nesse mês.
  4. Zera `recebidaEm`, `pagaEm` e `feitoEm`.
  5. Avança cada parcelamento em **n** parcelas, n = número de meses entre o mês aberto e o mês de hoje; remove os que passarem de `totalParcelas`.
  6. Define `mesAberto` = mês de hoje e limpa `recompensaDispensadaEm`.
  7. Sugere salvar um backup.
- **Desfazer último fechamento** (em Configurações e num aviso logo após fechar): restaura `copiaAntesDoFechamento`. Antes, avisa que as alterações feitas depois do fechamento serão perdidas. Depois de restaurar, a cópia é apagada (`null`), então dá para desfazer só uma vez.

### 5.8 Gastos por categoria

- Total e % de cada categoria com gastos no mês aberto.
- Comparação com o último mês fechado com registro: seta ↑/↓ e variação em %. Sem mês anterior, sem seta.

### 5.9 Mensagem de recompensa

**Quando é avaliada**

- Durante o mês, quando não há pendências: todas as contas pagas e todos os aportes com `saiDoBolso: true` feitos.
- No resumo do fechamento do mês.

**Condições (todas)**

- Score ≥ `metaScore`.
- Todos os aportes com `saiDoBolso: true` feitos.
- Sobra > `sobraMinima`.

**Cálculo**

```
livre    = sobra − sobraMinima
sugestão = livre × recompensaPercentual ÷ 100, arredondado para baixo em múltiplos de R$ 10
```

Se `sugestão < recompensaMinima`, não mostra.

**Texto**

> Você bateu suas metas de {mês} e sobraram {livre} além do planejado. Que tal separar {sugestão} para {ideia}? O resto pode adiantar a meta {meta}.

- `{ideia}`: sugestão < R$ 300 → "um jantar ou passeio"; R$ 300 a R$ 1.500 → "um fim de semana fora"; acima de R$ 1.500 → "uma viagem".
- `{meta}`: a meta não concluída com menor % atingido. Sem metas abertas, a última frase some.
- Botão "Agora não" grava `recompensaDispensadaEm = mesAberto`; o card some até o próximo mês (mas aparece no resumo do fechamento).
- A sugestão fica registrada em `MesFechado.recompensaSugerida`.

---

## 6. Telas e navegação

Celular primeiro; no PC o conteúdo fica centralizado com largura máxima. Tema claro e escuro seguindo o aparelho. Alvos de toque com pelo menos 44 px. Contraste mínimo WCAG AA.

**Navegação:** barra fixa embaixo com 4 abas — **Início, Mês, Metas, Histórico** — e um botão redondo **"+ gasto"** sempre visível.

### Início
- Aviso de modo exemplo (se `modoExemplo`), com o botão "Começar com meus dados".
- **Score do mês:** anel com o número e a cor da faixa, a sequência ("🔥 3 meses acima da meta") e os pontos de cada critério até agora.
- **Sobra prevista** em número grande.
- **Alertas:** contas atrasadas, contas que vencem em breve, "Fechar o mês?", backup atrasado.
- **Card de recompensa**, quando as condições da regra 5.9 forem atendidas.
- **Próximos vencimentos:** as 3 contas pendentes mais próximas, com "pago" num toque.
- **Para onde vai o dinheiro:** gráfico de rosca dos gastos por categoria.
- Engrenagem no topo → Configurações.

### Mês
- Resumo da sobra prevista.
- Renda (com "recebi"), contas a pagar (com "pago" e avisos), aportes (com "feito").
- Parcelamentos com o gráfico e o texto de alívio.
- Gastos do mês, com filtro por categoria.

### Metas
- Aplicações com saldo e tipo.
- Metas com barra de progresso, já tenho / alvo e prazo.
- Tocar numa meta → simulador de juros.

### Histórico
- Gráfico de barras do score mês a mês (cor pela faixa) com uma linha na meta do score.
- Gráfico da evolução: caixa operacional e cada meta em linhas, sobra do mês em colunas.
- Lista dos meses fechados. Tocar num mês → detalhe com o score por critério, os gastos por categoria e a lista de gastos.

### Painel "+ gasto"
Sobe da parte de baixo da tela:
- O campo de valor já vem focado com teclado numérico. É um campo com **máscara de centavos**: digitar `1234` mostra R$ 12,34, o que evita a confusão entre ponto e vírgula.
- As categorias aparecem como botões.
- A data vem como hoje e pode ser alterada.
- Descrição opcional.
- Caminho normal: valor → categoria → salvar.

### Edição
- As listas **mostram** os valores; marcar "pago", "recebi" ou "feito" é um toque.
- Tocar num item abre o mesmo tipo de painel de baixo para editar ou excluir.
- Cada lista tem um botão "+ adicionar".

### Configurações
- CDI anual, sobra mínima, meta do score, multiplicador da reserva, % e valor mínimo da recompensa.
- Categorias (adicionar, renomear, cor, excluir).
- Backup: exportar, importar e data do último backup.
- Situação do armazenamento (persistente ou não).
- "Desfazer último fechamento" (quando disponível).
- "Apagar tudo" e "Voltar ao exemplo", ambos com confirmação e sugestão de backup antes.
- "Como instalar no celular".

### Instalação
- **Android/PC (Chrome):** botão "Instalar app" usando o evento `beforeinstallprompt`.
- **iPhone (Safari):** instruções passo a passo (Compartilhar → Adicionar à Tela de Início), com o aviso de que os dados do app instalado são separados dos do Safari: "instale primeiro e use sempre pelo ícone".
- Some quando o app já está instalado (modo `standalone`).

### Atualização do app
Quando uma versão nova é publicada, o app mostra "Nova versão disponível — Atualizar".

---

## 7. Dados, backup e erros

### Armazenamento
- `localStorage`, chave `painel-financeiro`, contendo o `Estado` em JSON com o campo `versao`.
- Ao abrir, se `versao` for menor que a atual, o app roda as migrações em sequência (1→2→3...) e salva.
- No primeiro uso com dados reais, o app chama `navigator.storage.persist()` e mostra o resultado em Configurações.
- Limite conhecido: o `localStorage` tem cerca de 5 MB, o que dá anos de uso (cada gasto ocupa ~100 bytes).

### Dados de exemplo
- 100% fictícios: 2 rendas, 6 contas, 3 aplicações, 2 metas, 3 aportes (um com `saiDoBolso: false`), 3 parcelamentos, ~25 gastos no mês e 4 meses de histórico com scores variados.
- As datas são geradas **a partir de hoje**, para o exemplo sempre parecer atual.
- "Começar com meus dados" apaga tudo, define o mês aberto como o mês de hoje e mantém as categorias e configurações padrão.

### Backup
- **Exportar:** gera `financas-backup-AAAA-MM-DD.json` com `{ app: "painel-financeiro", versao, exportadoEm, dados }`. A cópia de desfazer não entra. No Android, usa a tela de compartilhar do sistema (Web Share API com arquivo), o que permite mandar para o Drive ou o WhatsApp. Se não houver suporte, baixa o arquivo. Atualiza `ultimoBackup`.
- **Importar:** o usuário escolhe o arquivo e o app:
  1. confere `app` e valida a estrutura com zod;
  2. migra se a versão for antiga; recusa se for mais nova ("backup de uma versão mais nova do app — atualize o app");
  3. mostra um resumo ("backup de 10/11/2026, 7 contas, 120 gastos");
  4. pede confirmação ("isso substitui seus dados atuais").
- **Lembretes:** sugestão de backup ao fechar o mês e aviso discreto no Início quando o último backup tem mais de 30 dias (fora do modo exemplo).

### Erros
- **Formulário inválido** (vazio, zero onde não pode, texto): o botão Salvar fica desativado e aparece uma mensagem curta no campo.
- **Falha ao salvar** (armazenamento cheio ou bloqueado): aviso visível "Não consegui salvar. Exporte um backup." Nunca falha em silêncio.
- **Dados corrompidos ao abrir:** não apaga nada. Mostra uma tela com três opções: importar backup, baixar os dados brutos ou começar do zero.
- **Excluir item:** remove na hora e mostra "Desfazer" por 5 segundos.
- **Textos digitados** (nomes com aspas ou símbolos) aparecem como texto. O React já escapa por padrão; nada de `innerHTML`.

---

## 8. Testes

### Automáticos (Vitest, em `src/regras/` e `src/dados/`)
- **Projeção:** renda recebida e não recebida, aportes com e sem `saiDoBolso`, contas pagas e pendentes.
- **Avisos de vencimento:** em breve (0 a 3 dias), atrasada, dia 31 em mês de 30, fevereiro (inclusive ano bissexto), virada de ano, hoje num mês depois do aberto.
- **Score:**
  - parcial (conta ainda não vencida não conta);
  - fechamento (conta sem "pago" conta contra);
  - critério sem itens e reajuste;
  - as três faixas do "mês no azul";
  - sequência com mês "sem registro".
- **Recompensa:** cada condição falhando, arredondamento em R$ 10, abaixo do mínimo, as três faixas de ideia, escolha da meta.
- **Parcelamentos:** restantes, mês de término, `encargo(k)`, texto de alívio.
- **Metas:** já tenho, alvo automático, prazo, aporte zero, meta atingida.
- **Simulador:** taxa mensal, mês em que atinge, limite de 600 meses.
- **Virada:** um mês, vários meses pulados (parcelas avançam n), reset dos estados, desfazer.
- **Dados:** migração de versão, validação de backup (válido, de outro app, versão mais nova, estrutura quebrada), máscara de centavos.

### Manuais
Roteiro no celular Android do Gabriel:
- instalar o app;
- abrir sem internet;
- começar com dados reais;
- lançar um gasto;
- marcar uma conta como paga;
- exportar e importar um backup;
- simular um fechamento de mês.

Uma passagem rápida num iPhone (de um conhecido) antes de considerar pronto.

---

## 9. Publicação e privacidade

- **Repositório público** `painel-financeiro` no GitHub. A Vercel fica ligada a ele e publica a branch `main` a cada `git push`.
- **Identidade do Git:** usar o e-mail *noreply* do GitHub, porque o e-mail dos commits fica público.
- **`.gitignore`:** `node_modules/`, `dist/`, `.env*`, `*backup*.json`.
- **O app não faz nenhuma requisição externa:** sem analytics, sem fontes de CDN (usa a fonte do sistema). O rodapé diz: "Seus dados ficam só neste aparelho."
- **README em português:**
  - o que é e para quem;
  - prints;
  - link do app no ar;
  - como o score, a projeção e a recompensa funcionam;
  - tecnologias;
  - como rodar localmente;
  - nota de privacidade.
- **Pasta do projeto:** `c:\Renda extra\painel-financeiro\`, separada de `c:\Renda extra\C--Users-win\` (que guarda conversas com dados pessoais e nunca entra no repositório).

---

## 10. Definição de pronto (v1)

- [ ] `npm test` passa com todas as regras da seção 8.
- [ ] `npm run build` termina sem erros de TypeScript.
- [ ] App no ar na Vercel, com link público.
- [ ] Instalável no Android, com ícone, e abrindo sem internet.
- [ ] Roteiro manual concluído no Android; passagem rápida no iPhone.
- [ ] Nenhum dado real no repositório nem no site.
- [ ] README completo, com prints e link.
