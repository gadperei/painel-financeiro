# Roteiro de teste manual

Use o app no ar: <https://painel-financeiro-m2fm.vercel.app/>

Marque cada item com `[x]` quando conferir. Se algo não funcionar, anote o que apareceu na tela.

## Android (Chrome) — celular principal

- [ ] **Instalar:** abrir o link no Chrome → tocar em "Instalar app" (no Início ou no menu ⋮ → "Instalar app") → o ícone aparece na tela inicial.
- [ ] **Abrir sem internet:** ativar o modo avião → abrir o app pelo ícone → ele abre normalmente.
- [ ] **Começar com dados reais:** no Início, tocar em "Começar com meus dados" → confirmar → o Início mostra "Cadastre contas e aportes para ver seu score".
- [ ] **Cadastrar:** na aba Mês, adicionar pelo menos uma renda, duas contas e um aporte; na aba Metas, uma aplicação operacional e uma meta.
- [ ] **Lançar um gasto:** tocar em "+ gasto" → digitar o valor → escolher a categoria → Salvar (3 toques). O gasto aparece na aba Mês e no gráfico do Início.
- [ ] **Marcar uma conta como paga:** no Início (Próximos vencimentos) ou na aba Mês → o score e a sobra prevista mudam.
- [ ] **Excluir com desfazer:** excluir um gasto → tocar em "Desfazer" no aviso → ele volta.
- [ ] **Backup:** Configurações → "Exportar backup" → salvar no Drive ou mandar para o seu WhatsApp. Depois, "Importar backup" com o mesmo arquivo → confirmar → os dados continuam iguais.
- [ ] **Simular o fechamento do mês:** no dia 1º do próximo mês, aparece "{Mês} acabou. Fechar o mês?" no Início → conferir o resumo → fechar → o mês aparece no Histórico. Testar o "Desfazer" do aviso.
- [ ] **Tema escuro:** trocar o celular para o tema escuro → o app acompanha e tudo continua legível.

## iPhone (Safari) — uma passagem rápida

- [ ] Abrir o link no Safari → aparece o aviso para instalar com o passo a passo.
- [ ] Compartilhar → "Adicionar à Tela de Início" → abrir pelo ícone.
- [ ] Lançar um gasto e marcar uma conta como paga.

## Antes de divulgar

- [ ] Conferir no GitHub que nenhum arquivo tem dado financeiro real (só os dados fictícios do exemplo).
