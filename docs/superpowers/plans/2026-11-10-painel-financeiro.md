# Painel Financeiro — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** construir e publicar o Painel Financeiro v1. É um PWA de finanças pessoais, sem servidor: os dados ficam no aparelho de quem usa. O app tem score do mês, recompensa, gastos por categoria e virada de mês.

**Arquitetura:** site estático em React. Todas as regras de cálculo ficam em funções puras, em `src/regras/`, testadas com Vitest. A camada `src/dados/` cuida dos tipos, da validação, das migrações, do `localStorage` e do backup. As telas só leem o `Estado` e aplicam as funções de `src/dados/operacoes.ts`.

**Tecnologias:** React, Vite, TypeScript (strict), Vitest, Recharts, zod, vite-plugin-pwa, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-10-painel-financeiro-design.md`. Leia a spec junto com este plano; os números de seção (§) citados aqui são dela.

**Executor e pessoa:** o Gabriel é iniciante em Git, GitHub, Vercel e npm e quer aprender fazendo. Os passos marcados com **👤 Gabriel** são feitos por ele. Neles, o executor para, explica o que vai acontecer e espera.

## Restrições globais

- Todo texto da interface em português. Valores no formato `R$ 1.234,56` e nomes de mês em pt-BR.
- Dinheiro sempre em centavos inteiros (`Centavos`). Nada de `float` para dinheiro.
- Formatos de data: mês `"AAAA-MM"` e dia `"AAAA-MM-DD"`. "Hoje" é a data **local** do aparelho.
- Funções de `src/regras/` recebem `hoje` como parâmetro. Elas nunca leem o relógio nem o armazenamento.
- As regras ignoram itens com valor zero.
- Chave do `localStorage`: `painel-financeiro`. `VERSAO_ATUAL = 1`.
- Nenhum dado real em código, testes, prints ou repositório. Os dados de exemplo são 100% fictícios.
- Nenhuma requisição externa em tempo de execução: sem analytics e sem fontes de CDN. Usar a fonte do sistema.
- Highcharts é proibido. Os gráficos usam Recharts.
- Proibido `innerHTML` e `dangerouslySetInnerHTML`.
- Layout pensado primeiro para o celular. No PC, coluna centralizada com `max-width: 560px`.
- Alvos de toque com no mínimo 44 px e contraste WCAG AA.
- Tema claro e escuro via `prefers-color-scheme`.
- Rodapé fixo com o texto: "Seus dados ficam só neste aparelho."
- `.gitignore` contém: `node_modules/`, `dist/`, `.env*`, `*backup*.json`.
- Testes automáticos só para `src/regras/`, `src/dados/` e `src/pwa/plataforma.ts`. Telas não têm teste automático: cada tarefa de tela termina com uma verificação manual no navegador, simulando um celular Android.
- Todo commit feito pelo agente termina com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A partir da Task 3, todo commit é seguido de `git push`, e a Vercel publica a nova versão sozinha.

## Pontos de atenção na revisão

1. **"Hoje" em UTC em vez da data local.** Com `toISOString()`, depois das 21h no Brasil a data já vira o dia seguinte, e isso estraga os avisos, o score e a virada do mês. O teste correspondente está na Task 2. Além disso, o app que fica aberto de um dia para o outro precisa atualizar o "hoje" ao voltar para a tela (Task 12).
2. **Estado vazio,** logo depois de "Começar com meus dados". Nenhuma regra pode quebrar, e o Início não deve exibir "score 100" sem nenhum dado. Os testes ficam no arquivo de estado vazio da Task 9 e o comportamento da tela na Task 13.
3. **Valor colado ou digitado com símbolos ou dígitos demais** no campo de valor. O app deve aproveitar só os dígitos e limitar a 12. Testes na Task 2.
4. **Arquivo errado escolhido no "Importar backup":** o `.html` do app antigo, um JSON truncado ou o JSON de outro app. O app deve mostrar uma mensagem amigável e não pode substituir nem quebrar nada. Testes na Task 11.
5. **Referências órfãs,** como um gasto com uma categoria que não existe mais (vindo de um backup) ou uma meta excluída. Os totais agrupam esses gastos em "Outros", e os itens ligados à meta são desligados. Testes nas Tasks 8 e 10.

---

## Estrutura de arquivos

```
painel-financeiro/
├── index.html · package.json · vite.config.ts · tsconfig*.json · .gitignore · README.md
├── public/                     logo.svg + ícones gerados (Task 18)
├── docs/                       spec, plano, prints/, teste-manual.md
└── src/
    ├── main.tsx · App.tsx · estilos.css
    ├── regras/                 datas, dinheiro, projecao, avisos, parcelas, metas, simulador,
    │                           score, gastos, recompensa, fechamento (+ *.test.ts ao lado)
    ├── dados/                  tipos, padroes, esquema, migracoes, armazenamento,
    │                           operacoes, exemplo, backup (+ *.test.ts)
    ├── testes/fabrica.ts       construtores de dados para os testes
    ├── estado/                 useEstado, useHoje, contexto
    ├── componentes/            BarraAbas, PainelInferior, CampoValor, Toast, Card, AnelScore,
    │                           GraficoCategorias, GraficoAlivio, ListaGastos, arquivos.ts
    ├── telas/                  Inicio, Mes, Metas, Simulador, Historico, DetalheMes,
    │                           Configuracoes, ResumoFechamento, ErroDados, formularios/
    └── pwa/                    plataforma.ts (+ teste), AvisoInstalacao, AvisoAtualizacao, ComoInstalar
```

---

### Task 1: Identidade no Git e primeiro commit

**Arquivos:**
- Criar: `.gitignore`
- Commit: `docs/superpowers/specs/…-design.md` e `docs/superpowers/plans/…-painel-financeiro.md`

- [ ] **Passo 1 (👤 Gabriel): conta no GitHub e e-mail privado.**
  1. Entrar ou criar a conta em github.com.
  2. Em Settings → Emails, marcar "Keep my email addresses private" e "Block command line pushes that expose my email".
  3. Copiar o endereço do tipo `12345678+usuario@users.noreply.github.com`.
- [ ] **Passo 2 (👤 Gabriel): configurar o Git.**

```bash
git config --global user.name "Seu Nome"
git config --global user.email "12345678+usuario@users.noreply.github.com"
git config --global init.defaultBranch main
```

Verificar: `git config --global user.email` mostra o endereço *noreply*.

- [ ] **Passo 3: criar o repositório local e o `.gitignore`.** Em `c:\Renda extra\painel-financeiro`, rodar `git init` e criar o `.gitignore` com as 4 linhas das Restrições globais.
- [ ] **Passo 4: primeiro commit.**

```bash
git add .gitignore docs/
git commit -m "docs: spec e plano do Painel Financeiro"
```

Verificar: `git log --oneline` mostra 1 commit e `git status` diz "nothing to commit".

---

### Task 2: Projeto base e utilitários de datas e dinheiro

**Arquivos:**
- Criar: `package.json`, `tsconfig.json` (+ `tsconfig.app.json` e `tsconfig.node.json`), `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/estilos.css`
- Criar: `src/regras/datas.ts`, `src/regras/dinheiro.ts`
- Testes: `src/regras/datas.test.ts`, `src/regras/dinheiro.test.ts`

**Interfaces:**
- Produz, em `datas.ts`:
  - `mesDe(dia: Dia): Mes`
  - `adicionarMeses(mes: Mes, n: number): Mes`
  - `mesesEntre(de: Mes, ate: Mes): number`
  - `ultimoDiaDoMes(mes: Mes): number`
  - `vencimentoEfetivo(mes: Mes, dia: number): Dia`
  - `diasEntre(de: Dia, ate: Dia): number`
  - `nomeMes(mes: Mes): string` (minúsculo, ex.: "novembro")
  - `rotuloMesCurto(mes: Mes): string` (ex.: "fev/27")
  - `primeiroDia(mes: Mes): Dia`
  - `hojeLocal(agora?: Date): Dia` (a única função impura; só a interface usa)
  - Os tipos `Mes` e `Dia` (aliases de `string`) são exportados de `datas.ts` e reexportados por `dados/tipos.ts`.
- Produz, em `dinheiro.ts`:
  - `type Centavos = number`
  - `formatarReais(c: Centavos): string`
  - `centavosDeDigitos(texto: string): Centavos`

- [ ] **Passo 1: criar o projeto à mão.** Não usar `npm create vite`, porque ele faz perguntas interativas.
  - `package.json`: `"name": "painel-financeiro"` e `"type": "module"`.
  - Scripts: `dev: "vite"`, `build: "tsc -b && vite build"`, `preview: "vite preview"`, `test: "vitest run"`.
  - Instalar as dependências (versões atuais):

```bash
npm install react react-dom recharts zod
npm install -D vite @vitejs/plugin-react typescript vitest @types/react @types/react-dom
```

  - `vite.config.ts`: plugin react e `test: { environment: 'node' }`.
  - `tsconfig`: `strict: true`.
  - `index.html`: `lang="pt-BR"`, `<title>Painel Financeiro</title>` e a meta viewport.
  - `App.tsx`: mostra "Painel Financeiro — em construção" e o rodapé "Seus dados ficam só neste aparelho."
  - `estilos.css`: variáveis de cor para o tema claro e para o escuro (`@media (prefers-color-scheme: dark)`), fonte do sistema e `max-width: 560px`.
- [ ] **Passo 2: escrever os testes que devem falhar.**

```ts
// datas.test.ts
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

// dinheiro.test.ts
it('formata reais com espaço normal', () => {
  expect(formatarReais(123456)).toBe('R$ 1.234,56');
  expect(formatarReais(-5000)).toBe('-R$ 50,00');
  expect(formatarReais(0)).toBe('R$ 0,00');
});
it('máscara de centavos usa só dígitos e limita a 12', () => {
  expect(centavosDeDigitos('1234')).toBe(1234);
  expect(centavosDeDigitos('R$ 1.234,56')).toBe(123456);
  expect(centavosDeDigitos('')).toBe(0);
  expect(centavosDeDigitos('1234567890123')).toBe(123456789012);
});
```

- [ ] **Passo 3: rodar e ver falhar.** Comando: `npm test`. Esperado: FAIL, porque os módulos ainda não existem.
- [ ] **Passo 4: implementar `datas.ts` e `dinheiro.ts`.**
  - Datas: fazer as contas com `Date.UTC` para não sofrer com horário de verão.
  - `hojeLocal`: usar `getFullYear()`, `getMonth()` e `getDate()`.
  - `formatarReais`: usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` e trocar o espaço especial `\u00a0` por um espaço normal.
  - `centavosDeDigitos`: remover tudo que não é dígito e ficar com os 12 primeiros.
- [ ] **Passo 5: verificar.**
  - `npm test`: PASS.
  - `npm run build`: sem erros.
  - `npm run dev`: http://localhost:5173 mostra o texto provisório.
- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat: projeto base e utilitários de datas e dinheiro"`

---

### Task 3: Publicar o esqueleto no GitHub e na Vercel

O objetivo desta task é ensinar o caminho até o app no ar logo no começo. Depois dela, cada `git push` publica uma versão nova.

**Arquivos:**
- Criar: `README.md` (só com `# Painel Financeiro` e "em construção")

- [ ] **Passo 1 (👤 Gabriel): criar o repositório.** No github.com, criar o repositório **público** `painel-financeiro`, **sem** README e **sem** licença.
- [ ] **Passo 2: ligar e enviar.**

```bash
git remote add origin https://github.com/<usuario>/painel-financeiro.git
git push -u origin main
```

O Git Credential Manager abre o navegador para o Gabriel autorizar. Verificar: os arquivos aparecem no GitHub.

- [ ] **Passo 3 (👤 Gabriel): ligar a Vercel.**
  1. Em vercel.com, entrar com a conta do GitHub.
  2. Add New → Project → importar `painel-financeiro`.
  3. Conferir o Framework (Vite), o Build Command (`npm run build`) e o Output (`dist`).
  4. Deploy.
  5. Verificar: o link `*.vercel.app` mostra "em construção".
  6. Anotar o link.
- [ ] **Passo 4: testar a publicação automática.** Criar o `README.md`, fazer commit (`docs: README inicial`) e `git push`. Verificar: em Vercel → Deployments, aparece um deploy novo com status "Ready".

---

### Task 4: Camada de dados: tipos, padrões, validação, migrações e armazenamento

**Arquivos:**
- Criar: `src/dados/tipos.ts`, `padroes.ts`, `esquema.ts`, `migracoes.ts`, `armazenamento.ts` e `src/testes/fabrica.ts`
- Testes: `src/dados/esquema.test.ts`, `migracoes.test.ts`, `armazenamento.test.ts`

**Interfaces:**
- Consome: `Mes`, `Dia` e `mesDe` (Task 2).
- Produz, em `tipos.ts`: todos os tipos da spec §4, copiados exatamente (`Estado`, `Config`, `Renda`, `Conta`, `Aplicacao`, `Meta`, `Aporte`, `Parcelamento`, `Categoria`, `Gasto`, `MesFechado`). Os tipos `Centavos`, `Mes` e `Dia` não são redefinidos: são reexportados de `regras/dinheiro.ts` e `regras/datas.ts`.
- Produz, em `padroes.ts`:
  - `CONFIG_PADRAO: Config = { cdiAnual: 14.9, sobraMinima: 0, metaScore: 70, multiplicadorReserva: 6, recompensaPercentual: 50, recompensaMinima: 10000 }`
  - `ID_OUTROS = 'outros'`
  - `CATEGORIAS_PADRAO: Categoria[]`, com os ids fixos `mercado`, `transporte`, `alimentacao-fora`, `lazer`, `saude`, `casa` e `outros`. Os nomes são os da spec §4 e as cores ficam a critério do executor.
  - `estadoVazio(hoje: Dia): Estado`: `versao: 1`, `modoExemplo: false`, `mesAberto: mesDe(hoje)`, listas vazias, categorias padrão e campos opcionais em `null`.
- Produz, em `esquema.ts`: `validarEstado(x: unknown): Estado | null`, com zod. Regras: centavos inteiros, `Dia` no formato `^\d{4}-\d{2}-\d{2}$`, `Mes` no formato `^\d{4}-\d{2}$` e `dia` de 1 a 31 ou `null`.
- Produz, em `migracoes.ts`:
  - `VERSAO_ATUAL = 1`
  - `type Migracoes = Record<number, (e: any) => any>`, em que a função de índice `v` converte da versão `v` para a `v+1`
  - `MIGRACOES: Migracoes = {}`
  - `migrar(bruto: unknown, migracoes = MIGRACOES): { tipo: 'ok'; estado: Estado } | { tipo: 'versao-nova' } | { tipo: 'invalido' }`
- Produz, em `armazenamento.ts`:
  - `CHAVE = 'painel-financeiro'`
  - `carregar(s: Pick<Storage,'getItem'>): { tipo: 'vazio' } | { tipo: 'ok'; estado: Estado; migrou: boolean } | { tipo: 'corrompido'; bruto: string } | { tipo: 'versao-nova'; bruto: string }`
  - `salvar(s: Pick<Storage,'setItem'>, estado: Estado): boolean`
- Produz, em `fabrica.ts`:
  - `HOJE = '2026-11-10'`
  - `criarEstado(s?: Partial<Estado>): Estado`, que é `estadoVazio(HOJE)` com `s` por cima
  - Construtores com `id` automático:
    - `conta(p?)`: `dia: null`, `valor: 10000`, `pagaEm: null`
    - `renda(p?)`: `valor: 100000`, `dia: null`, `recebidaEm: null`
    - `aporte(p?)`: `valor: 10000`, `metaId: null`, `saiDoBolso: true`, `feitoEm: null`
    - `aplicacao(p?)`: `saldo: 0`, `tipo: 'operacional'`, `metaId: null`, `percentualCdi: null`
    - `meta(p?)`: `alvo: 100000`, `alvoAutomatico: false`
    - `parcelamento(p?)`: `valorParcela: 10000`, `parcelaAtual: 1`, `totalParcelas: 3`
    - `gasto(p?)`: `data: HOJE`, `valor: 1000`, `categoriaId: 'mercado'`
    - `mesFechado(p?)`: `semRegistro: false`, valores zerados, `score: null`
    - Campos não listados recebem padrões simples, por exemplo `nome: 'Item'`, `cor: '#5b3df5'` e `mes: '2026-10'`.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
// esquema.test.ts
it('aceita o estado vazio e recusa estruturas quebradas', () => {
  expect(validarEstado(estadoVazio(HOJE))).not.toBeNull();
  expect(validarEstado({ ...estadoVazio(HOJE), contas: [{ nome: 'x' }] })).toBeNull();
  expect(validarEstado(criarEstado({ contas: [conta({ valor: 12.5 })] }))).toBeNull();
  expect(validarEstado(criarEstado({ contas: [conta({ dia: 32 })] }))).toBeNull();
});

// migracoes.test.ts
it('migra, recusa versão nova e lixo', () => {
  expect(migrar(estadoVazio(HOJE))).toEqual({ tipo: 'ok', estado: estadoVazio(HOJE) });
  expect(migrar({ ...estadoVazio(HOJE), versao: 2 })).toEqual({ tipo: 'versao-nova' });
  expect(migrar('lixo')).toEqual({ tipo: 'invalido' });
  const v0 = { ...estadoVazio(HOJE), versao: 0 };
  expect(migrar(v0, { 0: (e) => ({ ...e, versao: 1 }) })).toEqual({ tipo: 'ok', estado: estadoVazio(HOJE) });
});

// armazenamento.test.ts  (armazenamento falso com Map)
it('carrega vazio, ok, corrompido e versão nova', () => {
  const s = falso();
  expect(carregar(s)).toEqual({ tipo: 'vazio' });
  const e = criarEstado({ contas: [conta()] });
  expect(salvar(s, e)).toBe(true);
  expect(carregar(s)).toEqual({ tipo: 'ok', estado: e, migrou: false });
  s.setItem(CHAVE, '{quebrado');
  expect(carregar(s)).toEqual({ tipo: 'corrompido', bruto: '{quebrado' });
  const nova = JSON.stringify({ ...e, versao: 2 });
  s.setItem(CHAVE, nova);
  expect(carregar(s)).toEqual({ tipo: 'versao-nova', bruto: nova });
});
it('salvar devolve false quando o armazenamento falha', () => {
  expect(salvar({ setItem: () => { throw new Error('cheio'); } }, criarEstado())).toBe(false);
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar os 5 módulos e a fábrica.**
  - O esquema tem uma base sem `copiaAntesDoFechamento`, e o estado completo é `base.extend({ copiaAntesDoFechamento: base.nullable() })`.
  - `migrar` lê o campo `versao`. Se ele for maior que `VERSAO_ATUAL`, devolve `versao-nova`. Caso contrário, aplica as migrações em sequência e valida o resultado.
  - `migrou` é `true` quando a versão lida era menor que a atual.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: tipos, validação, migrações e armazenamento`

---

### Task 5: Projeção do fim do mês e avisos de conta (§5.1 e §5.2)

**Arquivos:**
- Criar: `src/regras/projecao.ts`, `src/regras/avisos.ts`
- Testes: `projecao.test.ts`, `avisos.test.ts`

**Interfaces:**
- Consome: os tipos e a fábrica (Task 4), além de `vencimentoEfetivo`, `diasEntre` e `mesDe` (Task 2).
- Produz:
  - `caixaOperacional(e: Estado): Centavos`
  - `calcularSobraPrevista(e: Estado): Centavos`
  - `avisoDaConta(c: Conta, mesAberto: Mes, hoje: Dia): 'atrasada' | 'em-breve' | null`
  - `proximosVencimentos(e: Estado, hoje: Dia, limite = 3): Conta[]`: contas pendentes, com dia e valor maior que zero, ordenadas pelo vencimento efetivo.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
it('sobra prevista segue §5.1', () => {
  const e = criarEstado({
    aplicacoes: [aplicacao({ saldo: 200000 }), aplicacao({ saldo: 999999, tipo: 'guardado' })],
    rendas: [renda({ valor: 300000 }), renda({ valor: 150000, recebidaEm: '2026-11-05' })],
    contas: [conta({ valor: 80000 }), conta({ valor: 50000, pagaEm: '2026-11-03' })],
    aportes: [aporte({ valor: 30000 }), aporte({ valor: 20000, saiDoBolso: false }),
              aporte({ valor: 10000, feitoEm: '2026-11-02' })],
  });
  expect(caixaOperacional(e)).toBe(200000);
  expect(calcularSobraPrevista(e)).toBe(390000);
});

it('avisos de conta', () => {
  const m = '2026-11', h = '2026-11-10';
  expect(avisoDaConta(conta({ dia: 10 }), m, h)).toBe('em-breve');
  expect(avisoDaConta(conta({ dia: 13 }), m, h)).toBe('em-breve');
  expect(avisoDaConta(conta({ dia: 14 }), m, h)).toBeNull();
  expect(avisoDaConta(conta({ dia: 9 }), m, h)).toBe('atrasada');
  expect(avisoDaConta(conta({ dia: 9, pagaEm: '2026-11-09' }), m, h)).toBeNull();
  expect(avisoDaConta(conta({ dia: 9, valor: 0 }), m, h)).toBeNull();
  expect(avisoDaConta(conta({ dia: null }), m, '2026-11-30')).toBeNull();
  expect(avisoDaConta(conta({ dia: 31 }), m, '2026-11-28')).toBe('em-breve');
  expect(avisoDaConta(conta({ dia: 30 }), '2028-02', '2028-02-29')).toBe('em-breve');
  expect(avisoDaConta(conta({ dia: 31 }), '2026-12', '2026-12-29')).toBe('em-breve');
  expect(avisoDaConta(conta({ dia: 30 }), m, '2026-12-01')).toBe('atrasada');
  expect(avisoDaConta(conta({ dia: 31 }), '2026-12', '2027-01-02')).toBe('atrasada');
});

it('próximos vencimentos: pendentes com dia, por data, até 3', () => {
  const e = criarEstado({ contas: [
    conta({ id: 'a', dia: 25 }), conta({ id: 'b', dia: 12 }), conta({ id: 'c', dia: 9 }),
    conta({ id: 'd', dia: null }), conta({ id: 'e', dia: 11, pagaEm: '2026-11-10' }), conta({ id: 'f', dia: 28 }),
  ] });
  expect(proximosVencimentos(e, HOJE).map(c => c.id)).toEqual(['c', 'b', 'a']);
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar os dois módulos** seguindo a §5.1 e a §5.2.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: projeção do fim do mês e avisos de conta`

---

### Task 6: Parcelas, metas e simulador (§5.3, §5.4 e §5.5)

**Arquivos:**
- Criar: `src/regras/parcelas.ts`, `metas.ts`, `simulador.ts`
- Testes: os três `*.test.ts` correspondentes

**Interfaces:**
- Consome: as Tasks 2 e 4, além de `formatarReais`.
- Produz, em `parcelas.ts`:
  - `restantes(p: Parcelamento): number`
  - `mesDeTermino(p: Parcelamento, mesAberto: Mes): Mes`
  - `encargo(ps: Parcelamento[], k: number): Centavos`
  - `serieAlivio(ps: Parcelamento[], mesAberto: Mes): { mes: Mes; valor: Centavos }[]`, com 6 itens
  - `textoAlivio(ps: Parcelamento[], mesAberto: Mes): string | null`
  - `avancarParcelas(ps: Parcelamento[], n: number): Parcelamento[]`
- Produz, em `metas.ts`:
  - `jaTenho(e: Estado, metaId: string): Centavos`
  - `alvoDaMeta(e: Estado, m: Meta): Centavos`
  - `aporteMensal(e: Estado, metaId: string): Centavos`
  - `prazoSemJuros(e: Estado, m: Meta): { tipo: 'atingida' } | { tipo: 'sem-aporte' } | { tipo: 'meses'; meses: number }`
  - `percentualAtingido(e: Estado, m: Meta): number` (de 0 a 100, limitado em 100)
- Produz, em `simulador.ts`:
  - `interface ParametrosSimulacao { inicial: Centavos; aporte: Centavos; alvo: Centavos; percentualCdi: number; cdiAnual: number }`
  - `interface ResultadoSimulacao { taxaMensal: number; mesesAteAlvo: number | null; totalInvestido: Centavos; jurosGanhos: Centavos; mesesAdiantados: number; serieComJuros: Centavos[]; serieSemJuros: Centavos[] }`
  - `simular(p: ParametrosSimulacao): ResultadoSimulacao`
  - `parametrosDaMeta(e: Estado, m: Meta): ParametrosSimulacao`

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
// parcelas.test.ts
const p1 = parcelamento({ valorParcela: 5000, parcelaAtual: 9, totalParcelas: 10 });
const p2 = parcelamento({ valorParcela: 3000, parcelaAtual: 2, totalParcelas: 6 });
it('restantes, término e encargo', () => {
  expect(restantes(p1)).toBe(1);
  expect(mesDeTermino(p1, '2026-11')).toBe('2026-12');
  expect(encargo([p1, p2], 0)).toBe(8000);
  expect(encargo([p1, p2], 2)).toBe(3000);
  const s = serieAlivio([p1, p2], '2026-11');
  expect(s.map(x => x.valor)).toEqual([8000, 8000, 3000, 3000, 3000, 0]);
  expect(s[0].mes).toBe('2026-11');
});
it('texto de alívio', () => {
  expect(textoAlivio([p1, p2], '2026-11'))
    .toBe('Em janeiro, as parcelas caem de R$ 80,00 para R$ 30,00 (−R$ 50,00/mês)');
  expect(textoAlivio([parcelamento({ parcelaAtual: 1, totalParcelas: 12 })], '2026-11'))
    .toBe('Nenhuma parcela termina nos próximos 6 meses');
  expect(textoAlivio([], '2026-11')).toBeNull();
});
it('avançar parcelas remove as terminadas', () => {
  expect(avancarParcelas([p1, p2], 1)).toEqual([{ ...p1, parcelaAtual: 10 }, { ...p2, parcelaAtual: 3 }]);
  expect(avancarParcelas([p1, p2], 2)).toEqual([{ ...p2, parcelaAtual: 4 }]);
});

// metas.test.ts
const reserva = meta({ id: 'r', alvoAutomatico: true, alvo: 0 });
const viagem = meta({ id: 'v', alvo: 500000 });
const e = criarEstado({
  metas: [reserva, viagem],
  contas: [conta({ valor: 100000 }), conta({ valor: 50000, pagaEm: '2026-11-01' })],
  aplicacoes: [aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 120000, percentualCdi: 110 }),
               aplicacao({ tipo: 'guardado', metaId: 'v', saldo: 30000 }), aplicacao({ saldo: 70000 })],
  aportes: [aporte({ metaId: 'v', valor: 50000 }), aporte({ metaId: 'v', valor: 20000, saiDoBolso: false })],
});
it('cálculos de meta', () => {
  expect(jaTenho(e, 'v')).toBe(150000);
  expect(alvoDaMeta(e, reserva)).toBe(900000);
  expect(aporteMensal(e, 'v')).toBe(70000);
  expect(prazoSemJuros(e, viagem)).toEqual({ tipo: 'meses', meses: 5 });
  expect(prazoSemJuros(e, reserva)).toEqual({ tipo: 'sem-aporte' });
  expect(percentualAtingido(e, viagem)).toBe(30);
  const x = meta({ id: 'x', alvo: 100 });
  expect(prazoSemJuros(criarEstado({ metas: [x], aplicacoes: [aplicacao({ tipo: 'guardado', metaId: 'x', saldo: 100 })] }), x))
    .toEqual({ tipo: 'atingida' });
});

// simulador.test.ts
it('juros compostos com CDI', () => {
  const r = simular({ inicial: 0, aporte: 100000, alvo: 2400000, percentualCdi: 100, cdiAnual: 12 });
  expect(r.taxaMensal).toBeCloseTo(0.0094888, 6);
  expect(r.mesesAteAlvo).toBe(22);
  expect(r.mesesAdiantados).toBe(2);
  expect(r.totalInvestido).toBe(2200000);
});
it('sem juros e limite de 600 meses', () => {
  expect(simular({ inicial: 0, aporte: 100000, alvo: 1000000, percentualCdi: 0, cdiAnual: 12 }).mesesAteAlvo).toBe(10);
  expect(simular({ inicial: 0, aporte: 0, alvo: 100, percentualCdi: 100, cdiAnual: 0 }).mesesAteAlvo).toBeNull();
});
it('parâmetros vêm da meta', () => {
  expect(parametrosDaMeta(e, viagem)).toEqual({ inicial: 150000, aporte: 70000, alvo: 500000, percentualCdi: 110, cdiAnual: 14.9 });
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar** seguindo a §5.3, a §5.4 e a §5.5.
  - Saldo do mês: `saldo(0) = inicial` e `saldo(k+1) = arredondar(saldo(k) × (1+r)) + aporte`.
  - As séries vão do mês 0 até `mesesAteAlvo + 2`, ou até 600 se a meta não for atingida.
  - `mesesAdiantados = ⌈(alvo − inicial) ÷ aporte⌉ − mesesAteAlvo`. Vale 0 se o aporte for 0 ou se a meta não for atingida.
  - `jurosGanhos = saldo(mesesAteAlvo) − totalInvestido`.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: parcelas, metas e simulador de juros`

---

### Task 7: Score do mês (§5.6)

**Arquivos:**
- Criar: `src/regras/score.ts`
- Teste: `score.test.ts`

**Interfaces:**
- Consome: `calcularSobraPrevista` (Task 5) e `vencimentoEfetivo` e `ultimoDiaDoMes` (Task 2).
- Produz:
  - `type ModoScore = 'parcial' | 'fechamento'`
  - `interface Score { total: number; aportes: number | null; contasEmDia: number | null; mesNoAzul: number }`. É o mesmo formato de `MesFechado.score`. Os pontos de cada critério são arredondados para inteiro, e o total é calculado a partir dos valores não arredondados.
  - `calcularScore(e: Estado, hoje: Dia, modo: ModoScore): Score`
  - `faixaDoScore(total: number): 'verde' | 'amarelo' | 'vermelho'`
  - `sequencia(historico: MesFechado[], metaScore: number): number`. O histórico está em ordem cronológica crescente, e a contagem começa pelo fim.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
const contas3 = [conta({ dia: 5, pagaEm: '2026-11-05' }), conta({ dia: 8 }), conta({ dia: 20 })];
const aportes3 = [aporte({ valor: 30000, feitoEm: '2026-11-02' }), aporte({ valor: 50000 }),
                  aporte({ valor: 99999, saiDoBolso: false })];
it('contas em dia: parcial ignora as que não venceram; fechamento avalia todas', () => {
  const e = criarEstado({ contas: contas3 });
  expect(calcularScore(e, HOJE, 'parcial').contasEmDia).toBe(15);
  expect(calcularScore(e, HOJE, 'fechamento').contasEmDia).toBe(10);
  expect(calcularScore(criarEstado({ contas: [conta({ dia: 5, pagaEm: '2026-11-07' })] }), HOJE, 'parcial').contasEmDia).toBe(0);
  expect(calcularScore(criarEstado({ contas: [conta({ dia: null })] }), HOJE, 'parcial').contasEmDia).toBeNull();
  expect(calcularScore(criarEstado({ contas: [conta({ dia: null, pagaEm: '2026-11-09' })] }), HOJE, 'parcial').contasEmDia).toBe(30);
  expect(calcularScore(criarEstado({ contas: [conta({ dia: null })] }), HOJE, 'fechamento').contasEmDia).toBe(0);
});
it('aportes só contam saiDoBolso', () => {
  expect(calcularScore(criarEstado({ aportes: aportes3 }), HOJE, 'parcial').aportes).toBe(15);
});
it('critério sem itens não conta e o total é reajustado', () => {
  const e = criarEstado({ contas: [conta({ dia: 5, pagaEm: '2026-11-04' })] });
  expect(calcularScore(e, HOJE, 'parcial')).toEqual({ total: 100, aportes: null, contasEmDia: 30, mesNoAzul: 30 });
});
it('mês no azul', () => {
  const com = (saldo: number) => criarEstado({ config: { ...CONFIG_PADRAO, sobraMinima: 10000 }, aplicacoes: [aplicacao({ saldo })] });
  expect(calcularScore(com(15000), HOJE, 'parcial').mesNoAzul).toBe(30);
  expect(calcularScore(com(10000), HOJE, 'parcial').mesNoAzul).toBe(30);
  expect(calcularScore(com(5000), HOJE, 'parcial').mesNoAzul).toBe(15);
  expect(calcularScore(com(-1), HOJE, 'parcial').mesNoAzul).toBe(0);
});
it('total combinado', () => {
  const e = criarEstado({ contas: contas3, aportes: aportes3, aplicacoes: [aplicacao({ saldo: 1000000 })] });
  expect(calcularScore(e, HOJE, 'parcial')).toEqual({ total: 60, aportes: 15, contasEmDia: 15, mesNoAzul: 30 });
});
it('faixas e sequência', () => {
  expect([80, 79, 50, 49].map(faixaDoScore)).toEqual(['verde', 'amarelo', 'amarelo', 'vermelho']);
  const s = (total: number) => mesFechado({ score: { total, aportes: null, contasEmDia: null, mesNoAzul: 30 } });
  const h = [s(75), s(80), mesFechado({ semRegistro: true }), s(90), s(72)];
  expect(sequencia(h, 70)).toBe(2);
  expect(sequencia([s(90), s(60)], 70)).toBe(0);
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar** seguindo a §5.6.
  - Uma conta é avaliada no modo `parcial` quando já foi paga, ou quando tem dia fixo e `hoje` é depois do vencimento efetivo.
  - Uma conta sem dia fixo está em dia se foi paga até o último dia do mês aberto.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: score do mês`

---

### Task 8: Gastos por categoria e mensagem de recompensa (§5.8 e §5.9)

**Arquivos:**
- Criar: `src/regras/gastos.ts`, `src/regras/recompensa.ts`
- Testes: `gastos.test.ts`, `recompensa.test.ts`

**Interfaces:**
- Consome: as Tasks 5 a 7, além de `ID_OUTROS`, `formatarReais` e `nomeMes`.
- Produz, em `gastos.ts`:
  - `interface TotalCategoria { categoriaId: string; nome: string; cor: string; total: Centavos; percentual: number; variacao: number | null }`
  - `gastosDoMes(e: Estado, mes: Mes): Gasto[]`
  - `totaisPorCategoria(e: Estado, mes: Mes): TotalCategoria[]`: em ordem decrescente de total; um gasto com categoria inexistente conta como "Outros"; a variação é comparada com o último `MesFechado` com registro antes de `mes`.
  - `validarDataGasto(data: Dia, mesAberto: Mes, hoje: Dia): boolean`
- Produz, em `recompensa.ts`:
  - `interface Recompensa { livre: Centavos; sugestao: Centavos; ideia: string; metaSugerida: string | null; texto: string }`
  - `semPendencias(e: Estado): boolean`
  - `calcularRecompensa(e: Estado, hoje: Dia, modo: ModoScore): Recompensa | null`
  - `recompensaDoCard(e: Estado, hoje: Dia): Recompensa | null`. Exige `semPendencias` e `recompensaDispensadaEm !== mesAberto`, e usa o modo `parcial`.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
// gastos.test.ts
it('totais, percentual, variação e categoria órfã', () => {
  const e = criarEstado({
    gastos: [gasto({ valor: 30000 }), gasto({ valor: 10000 }), gasto({ categoriaId: 'lazer', valor: 10000 }),
             gasto({ categoriaId: 'apagada', valor: 5000 }), gasto({ valor: 99999, data: '2026-10-31' })],
    historico: [mesFechado({ mes: '2026-10', gastosPorCategoria: [{ categoriaId: 'mercado', nome: 'Mercado', total: 50000 }] })],
  });
  const t = totaisPorCategoria(e, '2026-11');
  expect(t.map(x => [x.categoriaId, x.total])).toEqual([['mercado', 40000], ['lazer', 10000], ['outros', 5000]]);
  expect(t[0].percentual).toBeCloseTo(72.7, 1);
  expect(t[0].variacao).toBe(-20);
  expect(t[1].variacao).toBeNull();
});
it('data do gasto: do 1º dia do mês aberto até hoje', () => {
  expect(validarDataGasto('2026-11-01', '2026-11', '2026-11-10')).toBe(true);
  expect(validarDataGasto('2026-10-31', '2026-11', '2026-11-10')).toBe(false);
  expect(validarDataGasto('2026-11-11', '2026-11', '2026-11-10')).toBe(false);
  expect(validarDataGasto('2026-12-02', '2026-11', '2026-12-03')).toBe(true);
});

// recompensa.test.ts
const mesBom = (saldo: number, s: Partial<Estado> = {}) => criarEstado({
  aplicacoes: [aplicacao({ saldo })],
  contas: [conta({ dia: 5, pagaEm: '2026-11-05' })],
  aportes: [aporte({ valor: 50000, feitoEm: '2026-11-02' })],
  metas: [meta({ nome: 'Viagem', alvo: 500000 })],
  ...s,
});
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
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar** seguindo a §5.8 e a §5.9.
  - A variação é `(atual − anterior) ÷ anterior × 100`. Vale `null` quando não existe valor anterior ou quando ele é zero.
  - Faixas: sugestão abaixo de 30000 → "um jantar ou passeio"; até 150000, inclusive → "um fim de semana fora"; acima disso → "uma viagem".
  - `metaSugerida` é a meta com `percentualAtingido < 100` e menor percentual. Em caso de empate, vale a primeira da lista.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: gastos por categoria e recompensa`

---

### Task 9: Virada do mês (§5.7) e estado vazio

**Arquivos:**
- Criar: `src/regras/fechamento.ts`
- Testes: `fechamento.test.ts`, `src/regras/estadoVazio.test.ts`

**Interfaces:**
- Consome: as Tasks 5 a 8, além de `avancarParcelas`, `jaTenho`, `mesesEntre` e `adicionarMeses`.
- Produz:
  - `precisaFechar(e: Estado, hoje: Dia): boolean`
  - `pendencias(e: Estado): { rendas: Renda[]; contas: Conta[]; aportes: Aporte[] }` (só itens com valor maior que zero)
  - `resumoFechamento(e: Estado, hoje: Dia): MesFechado`
  - `fecharMes(e: Estado, hoje: Dia): Estado`
  - `desfazerFechamento(e: Estado): Estado | null`

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
const e = criarEstado({
  rendas: [renda({ valor: 300000, recebidaEm: '2026-11-05' })],
  contas: [conta({ dia: 5, valor: 80000, pagaEm: '2026-11-05' }), conta({ dia: 20, valor: 20000 })],
  aportes: [aporte({ valor: 10000, feitoEm: '2026-11-02' })],
  aplicacoes: [aplicacao({ saldo: 50000 })],
  parcelamentos: [parcelamento({ parcelaAtual: 2, totalParcelas: 3 }), parcelamento({ parcelaAtual: 3, totalParcelas: 3 })],
  gastos: [gasto({ data: '2026-11-03', valor: 4000 }), gasto({ data: '2026-12-01', valor: 1000 })],
  recompensaDispensadaEm: '2026-11',
});
it('quando fechar e pendências', () => {
  expect(precisaFechar(e, '2026-11-30')).toBe(false);
  expect(precisaFechar(e, '2026-12-01')).toBe(true);
  expect(pendencias(e)).toEqual({ rendas: [], contas: [e.contas[1]], aportes: [] });
});
it('fecha um mês', () => {
  const f = fecharMes(e, '2026-12-01');
  expect(f.mesAberto).toBe('2026-12');
  expect(f.historico[0]).toMatchObject({ mes: '2026-11', semRegistro: false, renda: 300000, contasPagas: 80000,
    caixaOperacional: 50000, sobra: 30000, recompensaSugerida: 15000,
    score: { total: 85, aportes: 40, contasEmDia: 15, mesNoAzul: 30 },
    gastosPorCategoria: [{ categoriaId: 'mercado', nome: 'Mercado', total: 4000 }] });
  expect(f.contas.every(c => c.pagaEm === null) && f.rendas[0].recebidaEm === null && f.aportes[0].feitoEm === null).toBe(true);
  expect(f.parcelamentos).toEqual([{ ...e.parcelamentos[0], parcelaAtual: 3 }]);
  expect(f.recompensaDispensadaEm).toBeNull();
  expect(resumoFechamento(e, '2026-12-01')).toEqual(f.historico[0]);
});
it('meses pulados', () => {
  const g = fecharMes(e, '2027-02-10');
  expect(g.historico.map(h => [h.mes, h.semRegistro])).toEqual([['2026-11', false], ['2026-12', true], ['2027-01', true]]);
  expect(g.historico[1].score).toBeNull();
  expect(g.historico[1].gastosPorCategoria).toEqual([{ categoriaId: 'mercado', nome: 'Mercado', total: 1000 }]);
  expect(g.parcelamentos).toEqual([]);
  expect(g.mesAberto).toBe('2027-02');
});
it('desfazer só uma vez', () => {
  const f = fecharMes(e, '2026-12-01');
  const d = desfazerFechamento(f)!;
  expect(d).toEqual(e);
  expect(desfazerFechamento(d)).toBeNull();
});

// estadoVazio.test.ts — nenhuma regra quebra com tudo vazio
it('estado vazio', () => {
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
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar** seguindo a §5.7.
  - A cópia guardada é o estado sem `copiaAntesDoFechamento`.
  - `desfazerFechamento` devolve a cópia com `copiaAntesDoFechamento: null`.
  - `resumoFechamento` é o mesmo cálculo do passo 2 da §5.7. `fecharMes` reaproveita esse cálculo.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: virada do mês com desfazer`

---

### Task 10: Operações de edição e dados de exemplo

**Arquivos:**
- Criar: `src/dados/operacoes.ts`, `src/dados/exemplo.ts`
- Testes: `operacoes.test.ts`, `exemplo.test.ts`

**Interfaces:**
- Consome: as Tasks 4 e 8 (`validarDataGasto`) e `adicionarMeses`.
- Produz, em `operacoes.ts`. Todas as funções são imutáveis: devolvem um `Estado` novo.
  - `type Colecao = 'rendas' | 'contas' | 'aplicacoes' | 'metas' | 'aportes' | 'parcelamentos' | 'categorias' | 'gastos'`
  - `novoId(): string`, que usa `crypto.randomUUID()`
  - `salvarItem<C extends Colecao>(e: Estado, colecao: C, item: Estado[C][number]): Estado`: substitui pelo `id` ou acrescenta no fim.
  - `excluirItem(e: Estado, colecao: Colecao, id: string): Estado`. Ao excluir uma categoria, os gastos dela vão para `outros`; a categoria `outros` não pode ser excluída, e a função devolve o mesmo objeto. Ao excluir uma meta, as aplicações e os aportes ligados a ela ficam com `metaId: null`.
  - `marcar(e: Estado, colecao: 'rendas' | 'contas' | 'aportes', id: string, data: Dia | null): Estado`: preenche `recebidaEm`, `pagaEm` ou `feitoEm`.
  - `dispensarRecompensa(e: Estado): Estado`
  - `comecarComMeusDados(hoje: Dia): Estado`
- Produz, em `exemplo.ts`: `gerarExemplo(hoje: Dia): Estado`. A função é determinística (sem `Math.random`) e usa nomes 100% fictícios.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
// operacoes.test.ts
it('salvar novo, editar e não mutar', () => {
  const e = criarEstado(); const c = conta({ id: 'c1', nome: 'Luz' });
  const e2 = salvarItem(e, 'contas', c);
  expect(e2.contas).toEqual([c]);
  expect(salvarItem(e2, 'contas', { ...c, nome: 'Energia' }).contas).toEqual([{ ...c, nome: 'Energia' }]);
  expect(e.contas).toEqual([]);
  expect(marcar(e2, 'contas', 'c1', HOJE).contas[0].pagaEm).toBe(HOJE);
});
it('excluir categoria move gastos para Outros; Outros não sai', () => {
  const e = criarEstado({ gastos: [gasto({ categoriaId: 'lazer' })] });
  const e2 = excluirItem(e, 'categorias', 'lazer');
  expect(e2.categorias.some(c => c.id === 'lazer')).toBe(false);
  expect(e2.gastos[0].categoriaId).toBe('outros');
  expect(excluirItem(e, 'categorias', 'outros')).toBe(e);
});
it('excluir meta desliga aplicações e aportes', () => {
  const e = criarEstado({ metas: [meta({ id: 'm' })], aplicacoes: [aplicacao({ tipo: 'guardado', metaId: 'm' })],
                          aportes: [aporte({ metaId: 'm' })] });
  const e2 = excluirItem(e, 'metas', 'm');
  expect([e2.metas.length, e2.aplicacoes[0].metaId, e2.aportes[0].metaId]).toEqual([0, null, null]);
});
it('começar do zero e dispensar recompensa', () => {
  expect(comecarComMeusDados(HOJE)).toEqual(estadoVazio(HOJE));
  expect(dispensarRecompensa(criarEstado()).recompensaDispensadaEm).toBe('2026-11');
});

// exemplo.test.ts
it('exemplo é válido, completo e relativo a hoje', () => {
  const ex = gerarExemplo(HOJE);
  expect(validarEstado(ex)).not.toBeNull();
  expect(ex.modoExemplo).toBe(true);
  expect([ex.rendas, ex.contas, ex.aplicacoes, ex.metas, ex.aportes, ex.parcelamentos].map(l => l.length))
    .toEqual([2, 6, 3, 2, 3, 3]);
  expect(ex.aportes.filter(a => !a.saiDoBolso)).toHaveLength(1);
  expect(ex.gastos.length).toBeGreaterThanOrEqual(20);
  expect(ex.gastos.every(g => validarDataGasto(g.data, ex.mesAberto, HOJE))).toBe(true);
  expect(ex.historico.map(h => h.mes)).toEqual(['2026-07', '2026-08', '2026-09', '2026-10']);
  expect(new Set(ex.historico.map(h => h.score?.total)).size).toBe(4);
  expect(gerarExemplo('2026-01-01').historico.map(h => h.mes)).toEqual(['2025-09', '2025-10', '2025-11', '2025-12']);
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar os dois módulos.**
  - Os gastos do exemplo são distribuídos entre o dia 1 do mês aberto e `hoje`. Se `hoje` for o dia 1, todos ficam no dia 1.
  - O histórico do exemplo tem scores diferentes entre si, por exemplo 58, 72, 85 e 91.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: operações de edição e dados de exemplo`

---

### Task 11: Backup (§7)

**Arquivos:**
- Criar: `src/dados/backup.ts`
- Teste: `backup.test.ts`

**Interfaces:**
- Consome: `migrar` (Task 4), `hojeLocal` e `diasEntre` (Task 2).
- Produz:
  - `nomeArquivoBackup(hoje: Dia): string`
  - `gerarBackup(e: Estado, agoraIso: string): string`: devolve o texto JSON de `{ app: 'painel-financeiro', versao, exportadoEm, dados }`, com `dados.copiaAntesDoFechamento: null`.
  - `lerBackup(texto: string): { tipo: 'ok'; estado: Estado; resumo: { exportadoEm: Dia; contas: number; gastos: number } } | { tipo: 'erro'; mensagem: string }`
  - `backupAtrasado(e: Estado, hoje: Dia): boolean`: vale `false` no modo exemplo. Vale `true` se nunca houve backup ou se o último tem mais de 30 dias.

- [ ] **Passo 1: escrever os testes que devem falhar.**

```ts
const NAO_E = 'Este arquivo não é um backup do Painel Financeiro.';
const e = criarEstado({ contas: [conta(), conta()], gastos: [gasto()] });
const comCopia = { ...e, copiaAntesDoFechamento: { ...e } };
const texto = gerarBackup(comCopia, '2026-11-10T15:00:00.000Z');
it('nome e conteúdo', () => {
  expect(nomeArquivoBackup('2026-11-10')).toBe('financas-backup-2026-11-10.json');
  const obj = JSON.parse(texto);
  expect(obj).toMatchObject({ app: 'painel-financeiro', versao: 1, exportadoEm: '2026-11-10T15:00:00.000Z' });
  expect(obj.dados.copiaAntesDoFechamento).toBeNull();
});
it('lê backup válido com resumo', () => {
  expect(lerBackup(texto)).toEqual({ tipo: 'ok', estado: { ...e, copiaAntesDoFechamento: null },
    resumo: { exportadoEm: '2026-11-10', contas: 2, gastos: 1 } });
});
it('recusa arquivos errados com mensagem amigável', () => {
  const obj = JSON.parse(texto);
  expect(lerBackup('<!DOCTYPE html><html><head></head></html>')).toEqual({ tipo: 'erro', mensagem: NAO_E });
  expect(lerBackup(JSON.stringify({ app: 'outro' }))).toEqual({ tipo: 'erro', mensagem: NAO_E });
  expect(lerBackup(texto.slice(0, 50)).tipo).toBe('erro');
  expect(lerBackup(JSON.stringify({ ...obj, versao: 2, dados: { ...obj.dados, versao: 2 } })))
    .toEqual({ tipo: 'erro', mensagem: 'Backup de uma versão mais nova do app — atualize o app.' });
  expect(lerBackup(JSON.stringify({ ...obj, dados: { contas: 'x' } })))
    .toEqual({ tipo: 'erro', mensagem: 'O backup está danificado ou incompleto.' });
});
it('backup atrasado', () => {
  expect(backupAtrasado(criarEstado({ ultimoBackup: null }), HOJE)).toBe(true);
  expect(backupAtrasado(criarEstado({ ultimoBackup: '2026-10-11' }), HOJE)).toBe(false);
  expect(backupAtrasado(criarEstado({ ultimoBackup: '2026-10-10' }), HOJE)).toBe(true);
  expect(backupAtrasado(criarEstado({ modoExemplo: true, ultimoBackup: null }), HOJE)).toBe(false);
});
```

- [ ] **Passo 2:** rodar `npm test`. Esperado: FAIL.
- [ ] **Passo 3: implementar.**
  - Se o `JSON.parse` falhar ou se `app` for diferente de `'painel-financeiro'`, mostrar a mensagem `NAO_E`.
  - Se `migrar(dados)` devolver `versao-nova`, mostrar a mensagem de versão nova. Se devolver `invalido`, mostrar a de backup danificado.
  - `resumo.exportadoEm = hojeLocal(new Date(exportadoEm))`.
- [ ] **Passo 4:** rodar `npm test`. Esperado: PASS.
- [ ] **Passo 5: commit e push.** `feat: backup com validação`

---

### Task 12: Estrutura do app: estado, abas, tema e componentes base

**Arquivos:**
- Criar: `src/estado/useHoje.ts`, `useEstado.ts`, `contexto.tsx`
- Criar: `src/componentes/BarraAbas.tsx`, `PainelInferior.tsx`, `CampoValor.tsx`, `Toast.tsx`, `Card.tsx`, `arquivos.ts`
- Criar: `src/telas/ErroDados.tsx`, mais as telas provisórias `Inicio`, `Mes`, `Metas`, `Historico` e `Configuracoes`, que só mostram o título
- Modificar: `src/App.tsx`, `src/estilos.css`

**Interfaces:**
- Consome: `carregar`, `salvar`, `gerarExemplo`, `lerBackup`, `gerarBackup`, `nomeArquivoBackup`, `comecarComMeusDados`, `excluirItem`, `hojeLocal` e `centavosDeDigitos`.
- Produz:
  - `useHoje(): Dia`: recalcula no `visibilitychange` e a cada 60 s.
  - `useEstado(): { status: { tipo: 'carregando' } | { tipo: 'pronto' } | { tipo: 'erro-dados'; bruto: string; versaoNova: boolean }; estado: Estado | null; atualizar(f: (e: Estado) => Estado): void; substituir(e: Estado): void; erroSalvar: boolean }`
  - `ContextoApp`, com o hook `useApp()`, que devolve:

    ```ts
    { estado: Estado; hoje: Dia;
      atualizar; substituir;
      excluir(colecao: Colecao, id: string): void;   // exclui e mostra o Toast "Item excluído" com "Desfazer" por 5 s
      abrirConfig(): void;
      abrirNovoGasto(): void;
      avisar(mensagem: string, acao?: { rotulo: string; aoClicar(): void }): void }
    ```

  - `type Aba = 'inicio' | 'mes' | 'metas' | 'historico'`
  - `<PainelInferior aberto titulo aoFechar>{children}</PainelInferior>`
  - `<CampoValor rotulo valor={Centavos} aoMudar={(c: Centavos) => void} autoFocus? />`: usa `inputMode="numeric"`, mostra `formatarReais(valor)` e converte com `centavosDeDigitos`.
  - `<Toast mensagem acao? duracaoMs=5000 aoSumir />`
  - Em `arquivos.ts`:
    - `baixarArquivo(nome: string, conteudo: string, tipo: string): void`
    - `compartilharOuBaixar(nome: string, conteudo: string): Promise<void>`: usa `navigator.canShare({ files })` quando disponível e, se não, baixa o arquivo.
    - `escolherArquivo(accept: string): Promise<string | null>`
    - `exportarBackup(e: Estado, hoje: Dia): Promise<void>`

- [ ] **Passo 1: implementar `useHoje`, `useEstado` e o contexto.**
  - Quando `carregar` devolver `vazio`, salvar `gerarExemplo(hoje)`.
  - Quando devolver `ok` com `migrou`, salvar o estado migrado.
  - Quando devolver `corrompido` ou `versao-nova`, ir para o status `erro-dados`.
  - Toda mudança chama `salvar`. Se falhar, `erroSalvar = true`.
  - Quando `modoExemplo` passar de `true` para `false`, chamar `navigator.storage?.persist?.()`.
- [ ] **Passo 2: implementar os componentes e o `App`.**
  - Barra de abas fixa embaixo e botão redondo "+ gasto". Por enquanto ele abre um `PainelInferior` vazio.
  - A engrenagem abre Configurações por cima.
  - Faixa de erro com o texto: "Não consegui salvar. Exporte um backup."
  - Rodapé com o texto das Restrições globais.
- [ ] **Passo 3: implementar `ErroDados`,** com três botões: "Importar backup" (`escolherArquivo` → `lerBackup` → `substituir`), "Baixar dados brutos" (`dados-brutos-AAAA-MM-DD.txt`) e "Começar do zero" (com confirmação).
- [ ] **Passo 4: verificar.**
  - `npm test` e `npm run build` passam.
  - Rodar `npm run dev` e abrir no Chrome com o DevTools simulando um Pixel 7. Conferir:
    1. A chave `painel-financeiro` aparece no Local Storage com o exemplo.
    2. As abas trocam.
    3. O "+ gasto" abre o painel de baixo.
    4. O tema escuro funciona (DevTools → Rendering → `prefers-color-scheme: dark`).
    5. Com `localStorage.setItem('painel-financeiro','{x')` e um recarregamento, aparece a tela `ErroDados`.
- [ ] **Passo 5: commit e push.** `feat: estrutura do app com abas, estado e componentes base`

---

### Task 13: Tela Início e resumo do fechamento (§6 Início e §5.7)

**Arquivos:**
- Criar: `src/componentes/AnelScore.tsx`, `GraficoCategorias.tsx` (rosca do Recharts, recebe `{ nome, total, cor }[]`) e `src/telas/ResumoFechamento.tsx`
- Modificar: `src/telas/Inicio.tsx`

**Interfaces:**
- Consome:
  - `calcularScore`, `faixaDoScore` e `sequencia`
  - `calcularSobraPrevista`, `avisoDaConta` e `proximosVencimentos`
  - `precisaFechar`, `pendencias`, `resumoFechamento`, `fecharMes` e `desfazerFechamento`
  - `recompensaDoCard` e `calcularRecompensa`
  - `totaisPorCategoria` e `backupAtrasado`
  - `marcar`, `dispensarRecompensa` e `comecarComMeusDados`
  - `useApp` e `exportarBackup`
- Produz: `<GraficoCategorias dados />`, que as Tasks 15 e 16 reutilizam.

- [ ] **Passo 1: implementar o Início, nesta ordem.**
  1. **Aviso de exemplo:** "Você está vendo um exemplo", com o botão "Começar com meus dados" (pede confirmação).
  2. **Score:** `AnelScore` com a cor da faixa e os pontos de cada critério, mostrando "—" para os nulos. Quando `aportes` e `contasEmDia` forem ambos `null`, mostrar no lugar do anel: "Cadastre contas e aportes para ver seu score".
  3. **Sequência:** "🔥 {n} meses acima da meta", só quando n > 0.
  4. **Sobra prevista** em número grande.
  5. **Alertas:** contas atrasadas, contas que vencem em breve, "{Mês} acabou. Fechar o mês?" (com o nome do mês capitalizado) e "Faça um backup dos seus dados" quando `backupAtrasado`.
  6. **Card de recompensa:** o texto de `recompensaDoCard` e o botão "Agora não".
  7. **Próximos vencimentos:** com "pago" num toque (`marcar` com `hoje`, ou `null` ao desmarcar).
  8. **Gráfico de categorias:** sem gastos, mostra "Nenhum gasto lançado este mês".
- [ ] **Passo 2: implementar o `ResumoFechamento`.**
  - É um painel de baixo com o `resumoFechamento` (score final, sobra e `recompensaSugerida`, com o texto de `calcularRecompensa(..., 'fechamento')`) e a lista de `pendencias`.
  - Botões: "Fechar o mês" e "Voltar".
  - Depois de fechar, mostrar o Toast "Mês fechado" com "Desfazer" (que aplica `desfazerFechamento`) e, em seguida, a pergunta "Salvar um backup agora?". Se o Gabriel aceitar, chamar `exportarBackup` e gravar `ultimoBackup = hoje`.
- [ ] **Passo 3: verificar no navegador.**
  - O exemplo mostra o score, a sobra, os alertas e o gráfico.
  - Marcar "pago" muda o score na hora.
  - Para simular a virada, mudar o `mesAberto` no Local Storage para o mês anterior e recarregar. Devem aparecer o alerta, o resumo, o fechamento e o desfazer.
  - Depois de "Começar com meus dados", aparece a mensagem de score vazio.
  - `npm run build` passa.
- [ ] **Passo 4: commit e push.** `feat: tela Início com score, alertas, recompensa e fechamento`

---

### Task 14: Tela Mês, formulários e o painel "+ gasto" (§6 Mês, Painel "+ gasto" e Edição)

**Arquivos:**
- Criar: `src/telas/Mes.tsx`
- Criar: `src/telas/formularios/FormGasto.tsx`, `FormRenda.tsx`, `FormConta.tsx`, `FormAporte.tsx`, `FormParcelamento.tsx`
- Criar: `src/componentes/GraficoAlivio.tsx`, `ListaGastos.tsx`
- Modificar: `App.tsx`, para ligar o "+ gasto" ao `FormGasto`

**Interfaces:**
- Consome:
  - `salvarItem`, `excluir` (do contexto), `marcar` e `novoId`
  - `validarDataGasto`, `avisoDaConta` e `calcularSobraPrevista`
  - `restantes`, `mesDeTermino`, `serieAlivio` e `textoAlivio`
  - `gastosDoMes`, `CampoValor` e `PainelInferior`
- Produz: `<ListaGastos gastos categorias aoTocar? />`, que a Task 16 reutiliza.

- [ ] **Passo 1: implementar os formulários.** Todos ficam dentro de um `PainelInferior` e servem tanto para criar quanto para editar. Na edição, aparece também o botão "Excluir". O botão Salvar fica desativado enquanto houver erro, e a mensagem curta aparece no campo:
  - **Nome:** obrigatório, depois de remover espaços → "Informe um nome".
  - **Valor:** maior que 0 → "Informe um valor".
  - **Dia:** de 1 a 31, ou vazio para "sem dia fixo" → "Dia entre 1 e 31".
  - **Data do gasto:** precisa passar em `validarDataGasto` → "Data fora do mês aberto". O campo `type=date` tem `min` no 1º dia do mês aberto e `max` em hoje.

  O que muda em cada formulário:
  - **`FormGasto`:** o `CampoValor` vem com `autoFocus`; as categorias aparecem como botões; a data começa em hoje; a descrição é opcional.
  - **`FormConta`:** quando a conta está paga, a data de pagamento pode ser editada.
  - **`FormAporte`:** tem a escolha da meta (ou nenhuma) e a opção "Sai do meu bolso?".
  - **`FormParcelamento`:** a parcela atual precisa estar entre 1 e o total.
- [ ] **Passo 2: implementar a tela Mês.**
  - No topo, a sobra prevista.
  - Seções: Renda (com "recebi"), Contas (com "pago" e o selo de aviso), Aportes (com "feito" e o selo "não sai do bolso"), Parcelamentos e Gastos.
  - Parcelamentos: mostrar "termina {rotuloMesCurto}" ou "última parcela", o `GraficoAlivio` (barras de `serieAlivio`) e o `textoAlivio`.
  - Gastos: filtro por categoria com botões.
  - Cada seção tem "+ adicionar", e tocar num item abre o formulário dele.
- [ ] **Passo 3: verificar no navegador.**
  - O caminho valor → categoria → salvar funciona em 3 toques.
  - Uma data fora do mês deixa o Salvar desativado.
  - Excluir mostra o "Desfazer".
  - O gráfico de alívio bate com o texto.
  - `npm run build` passa.
- [ ] **Passo 4: commit e push.** `feat: tela Mês, formulários e lançamento de gasto`

---

### Task 15: Tela Metas e simulador (§6 Metas e §5.5)

**Arquivos:**
- Criar: `src/telas/Metas.tsx`, `src/telas/Simulador.tsx`, `src/telas/formularios/FormAplicacao.tsx`, `FormMeta.tsx`

**Interfaces:**
- Consome:
  - `jaTenho`, `alvoDaMeta`, `prazoSemJuros` e `percentualAtingido`
  - `simular` e `parametrosDaMeta`
  - `salvarItem`, `excluir` (a exclusão de meta avisa: "Aplicações e aportes ligados a ela ficarão sem meta.")

- [ ] **Passo 1: implementar `FormAplicacao` e `FormMeta`.**
  - **`FormAplicacao`:** nome, saldo (aceita 0), tipo, meta (só aparece quando o tipo é "guardado") e % do CDI opcional.
  - **`FormMeta`:** nome, a opção "alvo automático" (que desativa o campo de alvo e mostra "alvo = {N}× contas") e cor.
- [ ] **Passo 2: implementar a tela Metas.**
  - Lista de aplicações e lista de metas. Cada meta mostra a barra de progresso, "já tenho / alvo" e o prazo:
    - "faltam {n} meses (sem juros)"
    - "sem aporte planejado"
    - "meta atingida ✅"
  - Tocar numa meta abre o `Simulador`.
- [ ] **Passo 3: implementar o `Simulador`.**
  - Os campos vêm preenchidos com `parametrosDaMeta` e podem ser editados, mas não são salvos.
  - Mostra a taxa efetiva ao ano.
  - O texto do resultado traz meses e anos, total investido, juros ganhos e meses adiantados. Se `null`, mostra: "Com esses valores, a meta leva mais de 50 anos."
  - O gráfico tem a área "Com juros", a linha "Sem juros" e uma linha de referência na meta.
  - Aviso fixo, copiado da §5.5: "Estimativa bruta, sem imposto de renda. Rentabilidade passada não garante rentabilidade futura."
- [ ] **Passo 4: verificar no navegador** que as metas do exemplo calculam o prazo, que o simulador reage aos campos e que `npm run build` passa.
- [ ] **Passo 5: commit e push.** `feat: tela Metas e simulador de juros`

---

### Task 16: Tela Histórico e detalhe do mês (§6 Histórico)

**Arquivos:**
- Criar: `src/telas/Historico.tsx`, `src/telas/DetalheMes.tsx`

**Interfaces:**
- Consome: `faixaDoScore`, `gastosDoMes`, `GraficoCategorias` (Task 13), `ListaGastos` (Task 14) e `rotuloMesCurto`.

- [ ] **Passo 1: implementar o Histórico.**
  - **Gráfico de barras do score:** a cor segue a faixa, há uma linha de referência no `metaScore`, e os meses sem registro aparecem como "sem registro".
  - **Gráfico de evolução:** linhas para o caixa operacional e para cada meta (`porMeta`) e colunas para a sobra.
  - **Lista dos meses:** do mais recente para o mais antigo, cada um com o selo do score.
  - **Sem histórico:** mostrar "Nenhum mês fechado ainda."
- [ ] **Passo 2: implementar o `DetalheMes`.**
  - Score por critério, com "—" para os nulos.
  - Gráfico de categorias a partir de `gastosPorCategoria`.
  - `ListaGastos` com `gastosDoMes(estado, mes)`.
  - A recompensa sugerida, se houver.
- [ ] **Passo 3: verificar no navegador** que os 4 meses do exemplo aparecem nos dois gráficos e no detalhe, e que `npm run build` passa.
- [ ] **Passo 4: commit e push.** `feat: tela Histórico`

---

### Task 17: Configurações e backup na interface (§6 Configurações e §7 Backup)

**Arquivos:**
- Criar: `src/telas/formularios/FormCategoria.tsx`
- Modificar: `src/telas/Configuracoes.tsx`

**Interfaces:**
- Consome:
  - `exportarBackup`, `escolherArquivo` e `lerBackup`
  - `desfazerFechamento`, `comecarComMeusDados` e `gerarExemplo`
  - `salvarItem` e `excluir`
  - `CONFIG_PADRAO`, para os limites e valores iniciais dos campos

- [ ] **Passo 1: campos de configuração.**
  - **CDI anual:** número em %, aceitando vírgula.
  - **Sobra mínima:** `CampoValor`.
  - **Meta do score:** de 0 a 100.
  - **Multiplicador da reserva:** de 1 a 24.
  - **% da recompensa:** de 0 a 100.
  - **Valor mínimo da recompensa:** `CampoValor`.
- [ ] **Passo 2: categorias.** Adicionar, renomear, trocar a cor e excluir.
  - A categoria "Outros" não tem o botão de excluir.
  - Ao excluir, avisar: "Os gastos desta categoria vão para Outros."
- [ ] **Passo 3: backup.**
  - **Exportar:** chama `exportarBackup` e grava `ultimoBackup`.
  - **Importar:**
    1. Se `lerBackup` der erro, mostrar a mensagem do erro.
    2. Se der certo, abrir um painel de confirmação: "Backup de {dd/mm/aaaa}, {n} contas, {m} gastos. Isso substitui seus dados atuais."
    3. Ao confirmar, aplicar `substituir`.
  - **Último backup:** "Último backup: dd/mm/aaaa" ou "Nenhum backup ainda".
- [ ] **Passo 4: armazenamento e ações.**
  - Mostrar o resultado de `navigator.storage.persisted()`: "Persistente ✅" ou "Não persistente — faça backups com frequência".
  - "Desfazer último fechamento": só aparece se houver cópia, e confirma antes com "As alterações feitas depois do fechamento serão perdidas.".
  - "Apagar tudo" e "Voltar ao exemplo": cada um pede confirmação e oferece o botão "Exportar backup antes".
- [ ] **Passo 5: verificar no navegador.**
  - Exportar e importar o mesmo arquivo deixa os dados iguais.
  - Importar um `.html` qualquer mostra a mensagem amigável e não altera nada.
  - Excluir uma categoria com gastos move esses gastos para Outros.
  - `npm run build` passa.
- [ ] **Passo 6: commit e push.** `feat: configurações e backup`

---

### Task 18: PWA: instalação, funcionamento sem internet e atualização (§3 e §6 Instalação)

**Arquivos:**
- Criar: `public/logo.svg` (ícone simples desenhado pelo executor) e os ícones gerados a partir dele
- Criar: `src/pwa/plataforma.ts` e `plataforma.test.ts`
- Criar: `src/pwa/AvisoInstalacao.tsx`, `AvisoAtualizacao.tsx`, `ComoInstalar.tsx`
- Modificar: `vite.config.ts`, `src/vite-env.d.ts`, `App.tsx` e `Configuracoes.tsx` (link "Como instalar no celular")

**Interfaces:**
- Produz: `plataformaInstalacao(userAgent: string, standalone: boolean): 'instalado' | 'ios' | 'outro'`

- [ ] **Passo 1: escrever o teste que deve falhar.**

```ts
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';
it('detecta plataforma de instalação', () => {
  expect(plataformaInstalacao(IPHONE, false)).toBe('ios');
  expect(plataformaInstalacao(IPHONE, true)).toBe('instalado');
  expect(plataformaInstalacao(ANDROID, false)).toBe('outro');
  expect(plataformaInstalacao(ANDROID, true)).toBe('instalado');
});
```

- [ ] **Passo 2:** rodar `npm test` e ver falhar. Depois, implementar `plataforma.ts` e rodar de novo até passar.
- [ ] **Passo 3: configurar o PWA.**
  1. Instalar as ferramentas: `npm install -D vite-plugin-pwa @vite-pwa/assets-generator`.
  2. Gerar os ícones: `npx pwa-assets-generator --preset minimal-2023 public/logo.svg`.
  3. Configurar o `VitePWA` com:
     - `registerType: 'prompt'`;
     - manifest: `name: 'Painel Financeiro'`, `short_name: 'Finanças'`, `lang: 'pt-BR'`, `display: 'standalone'`, `start_url: '/'`, cores do tema e os ícones gerados;
     - workbox: `globPatterns: ['**/*.{js,css,html,svg,png,ico}']`.
  4. Adicionar a referência de tipos `vite-plugin-pwa/react`.
- [ ] **Passo 4: implementar os avisos.**
  - **`AvisoAtualizacao`:** usa `useRegisterSW`. Quando `needRefresh` for verdadeiro, mostra "Nova versão disponível — Atualizar".
  - **`AvisoInstalacao`:**
    - Em `'outro'`, guarda o evento `beforeinstallprompt` e mostra o botão "Instalar app".
    - Em `'ios'`, mostra os passos Compartilhar → Adicionar à Tela de Início, mais o aviso "Os dados do app instalado ficam separados dos do Safari: instale primeiro e use sempre pelo ícone."
    - Em `'instalado'`, não mostra nada.
    - O aviso pode ser dispensado.
  - **`ComoInstalar`:** traz o mesmo conteúdo para Android e para iPhone e é aberto pelas Configurações.
- [ ] **Passo 5: verificar.**
  - `npm run build` gera `dist/sw.js` e `dist/manifest.webmanifest`.
  - Com `npm run preview`, no DevTools → Application, o Manifest aparece sem erros e o Service Worker fica ativo.
  - Com o Network em modo Offline e um recarregamento, o app abre.
- [ ] **Passo 6: commit e push.** `feat: PWA instalável e offline`
- [ ] **Passo 7 (👤 Gabriel): testar no Android.**
  1. Abrir o link da Vercel no Chrome do celular → "Instalar app".
  2. Ativar o modo avião e abrir o app pelo ícone.
  3. Conferir que o app funciona.

---

### Task 19: README, prints, roteiro de teste manual e entrega (§8, §9 e §10)

**Arquivos:**
- Modificar: `README.md`
- Criar: `docs/teste-manual.md`, `docs/prints/inicio.png`, `mes.png`, `metas.png`, `historico.png`

- [ ] **Passo 1: escrever o `docs/teste-manual.md`.** Ele é uma lista de verificação com os itens manuais da §8: instalar, abrir sem internet, começar com dados reais, lançar um gasto, marcar uma conta como paga, exportar e importar um backup, simular um fechamento de mês. Inclui também a passagem rápida no iPhone.
- [ ] **Passo 2 (👤 Gabriel): tirar os prints.** No celular, com o app **no modo exemplo** (só dados fictícios), tirar prints das 4 abas e salvar em `docs/prints/`.
- [ ] **Passo 3: escrever o README em português.** Seções, conforme a §9:
  - o que é e para quem;
  - os prints;
  - o link do app no ar;
  - como funcionam o score, a projeção e a recompensa;
  - as tecnologias usadas;
  - como rodar localmente (`npm install`, `npm run dev`, `npm test`);
  - uma nota de privacidade: "Seus dados ficam só neste aparelho; o app não envia nada para fora."
- [ ] **Passo 4 (👤 Gabriel): executar o `teste-manual.md`.** Executar o roteiro no Android e marcar cada item. Depois, fazer a passagem rápida num iPhone de algum conhecido.
- [ ] **Passo 5: conferir a Definição de pronto (§10).**
  - `npm test` e `npm run build` passam.
  - O link público funciona.
  - O app é instalável e abre offline.
  - O Gabriel revisa o repositório no GitHub e confirma que não há nenhum dado real.
- [ ] **Passo 6: commit e push.** `docs: README com prints e roteiro de teste manual`
