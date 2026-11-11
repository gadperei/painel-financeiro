# Melhorias para a versão 1.1

Pontos menores encontrados na revisão final da v1. Nenhum deles impede o uso do app; ficaram anotados para uma próxima versão.

## Dados e segurança

- [ ] **Backup com dados estranhos:** a validação aceita mês "2026-13", centavos negativos, `parcelaAtual` 0 e estado sem a categoria "Outros". Um backup assim pode deixar uma tela em branco.
- [ ] **Rede de segurança:** falta um ErrorBoundary que, se alguma tela quebrar, ofereça "Baixar dados brutos".
- [ ] **Referências quebradas vindas de backup:** gastos de categoria que não existe mais não entram no chip "Outros", e uma meta inexistente aparece como "Nenhuma". Normalizar depois de migrar.
- [ ] **Seletor de arquivo:** não trata falha de leitura nem limita o tamanho do arquivo.
- [ ] **Dados reais digitados no modo exemplo:** ficam sem lembrete de backup e são apagados pelo "Começar com meus dados".

## Quando existir a v2 do formato de dados

- [ ] A migração v1→v2 precisa converter também a cópia de desfazer do fechamento (`copiaAntesDoFechamento`), ou zerá-la.
- [ ] A tela de erro de dados (`ErroDados`) precisa mostrar o aviso de versão nova do app.

## Comportamento

- [ ] **"Salvar configurações":** fica ativo mesmo sem mudança.
- [ ] **Recompensa:** pode sugerir R$ 0,00 se o valor mínimo for configurado como 0.
- [ ] **Filtro de categoria na aba Mês:** pode ficar preso depois de excluir o último gasto da categoria.
- [ ] **Data do celular adiantada:** um mês aberto no futuro bloqueia o lançamento de gastos sem explicar o motivo.
- [ ] **Mês sem contas nem aportes:** fecha com score 100 e conta na sequência.
- [ ] **Botão "Instalar app":** some ao trocar de aba, porque o evento do navegador só é capturado no Início.

## Testes e polimento

- [ ] O teste de "hoje local" depende do fuso horário da máquina. Fixar `TZ=America/Sao_Paulo` no Vitest.
- [ ] Painel aberto por cima de outro reativa a rolagem da página.
- [ ] `crypto.randomUUID` exige HTTPS, então o teste pelo celular na rede local (http) não funciona.
- [ ] O saldo de uma aplicação não aceita valor negativo.
- [ ] O lembrete de backup aparece logo depois do "Começar com meus dados".
