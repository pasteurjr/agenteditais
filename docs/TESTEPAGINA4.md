# TESTE DA PAGINA 4 — PARAMETRIZACOES
## Guia Completo de Testes com Dados de Entrada e Saidas Esperadas

**Referencia:** WORKFLOW SISTEMA.pdf — Pagina 4
**Modulo:** ParametrizacoesPage (route: "parametros", menu: Configuracoes > Parametrizacoes)

---

## CONTEXTO

A pagina de Parametrizacoes e a etapa chave para geracao dos Scores e apresentacao das oportunidades.
Contem 5 abas: Produtos, Comercial, Fontes de Busca, Notificacoes e Preferencias.

---

# TESTE 1 — Carregamento da Pagina com 5 Abas

### O que verificar:
> A pagina carrega corretamente com titulo "Parametrizacoes" e exibe 5 abas navegaveis.

### Onde testar:
Menu lateral → **Configuracoes** → **Parametrizacoes**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer login | pasteurjr@gmail.com / 123456 |
| 2 | Expandir secao "Configuracoes" no menu lateral | — |
| 3 | Clicar em "Parametrizacoes" | — |
| 4 | Verificar titulo h1 "Parametrizacoes" | — |
| 5 | Verificar presenca das 5 abas | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo da pagina | "Parametrizacoes" visivel |
| Subtitulo | "Configuracoes gerais do sistema" |
| Aba "Produtos" | Visivel e clicavel |
| Aba "Comercial" | Visivel e clicavel |
| Aba "Fontes de Busca" | Visivel e clicavel |
| Aba "Notificacoes" | Visivel e clicavel |
| Aba "Preferencias" | Visivel e clicavel |

---

# TESTE 2 — Aba Produtos: Estrutura de Classificacao

### O que verificar:
> Card "Estrutura de Classificacao" com arvore de classes/subclasses, botoes "Nova Classe" e "Gerar com IA".

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Produtos" (ja ativa por padrao) | — |
| 2 | Verificar card "Estrutura de Classificacao" | — |
| 3 | Verificar botao "Nova Classe" | — |
| 4 | Verificar botao "Gerar com IA (Onda 4)" desabilitado | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Estrutura de Classificacao" visivel |
| Botao "Nova Classe" | Presente e clicavel |
| Botao "Gerar com IA" | Presente mas desabilitado (Onda 4) |
| Area classes-tree | Presente (pode estar vazia) |

---

# TESTE 3 — Aba Produtos: Tipos de Edital

### O que verificar:
> Card "Tipos de Edital Desejados" com 6 checkboxes para tipos de editais.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Na aba "Produtos", localizar card "Tipos de Edital Desejados" | — |
| 2 | Verificar presenca de 6 checkboxes | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Tipos de Edital Desejados" visivel |
| Checkbox "Comodato de equipamentos" | Presente, checked por padrao |
| Checkbox "Venda de equipamentos" | Presente, checked por padrao |
| Checkbox "Aluguel com consumo de reagentes" | Presente, checked por padrao |
| Checkbox "Consumo de reagentes" | Presente, checked por padrao |
| Checkbox "Compra de insumos laboratoriais" | Presente, unchecked |
| Checkbox "Compra de insumos hospitalares" | Presente, unchecked |

---

# TESTE 4 — Aba Produtos: Norteadores de Score

### O que verificar:
> Card "Norteadores de Score" com 6 itens (a-f) e campos de configuracao.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Na aba "Produtos", localizar card "Norteadores de Score" | — |
| 2 | Verificar 6 itens norteadores | — |
| 3 | Verificar campos de Score Aderencia de Ganho | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Norteadores de Score" visivel |
| Item (a) | "Classificacao/Agrupamento" — Score Tecnico |
| Item (b) | "Score Comercial" — Score Comercial |
| Item (c) | "Tipos de Edital" — Score Recomendacao |
| Item (d) | "Score Tecnico" — Score Tecnico |
| Item (e) | "Score Recomendacao" — parcial |
| Item (f) | "Score Aderencia de Ganho" — nao configurado |
| Campos do Score Ganho | Taxa Vitoria, Margem Media, Total Licitacoes |

---

# TESTE 5 — Aba Produtos: Fontes Documentais

### O que verificar:
> Card "Fontes Documentais Exigidas por Editais" com 10 documentos e status Temos/Nao temos.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Na aba "Produtos", localizar card "Fontes Documentais Exigidas por Editais" | — |
| 2 | Verificar presenca de 10 itens documentais | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Fontes Documentais Exigidas por Editais" visivel |
| Itens documentais | 10 documentos listados |
| Status badges | Cada item tem "Temos" (verde) ou "Nao temos" (vermelho) |

---

# TESTE 6 — Aba Comercial: Regiao de Atuacao

### O que verificar:
> Card "Regiao de Atuacao" com grid de 27 estados brasileiros e checkbox "Todo Brasil".

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Comercial" | — |
| 2 | Verificar card "Regiao de Atuacao" | — |
| 3 | Verificar grid com 27 estados | — |
| 4 | Verificar estados pre-selecionados (SP, MG, RJ, ES) | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Regiao de Atuacao" visivel |
| Checkbox "Todo Brasil" | Presente |
| Total botoes de estado | 27 botoes (AC a TO) |
| Estados selecionados por padrao | SP, MG, RJ, ES destacados |
| Resumo | "Estados selecionados: ES, MG, RJ, SP" |

---

# TESTE 7 — Aba Comercial: Tempo de Entrega e Mercado

### O que verificar:
> Cards "Tempo de Entrega" e "Mercado (TAM/SAM/SOM)".

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Na aba "Comercial", localizar card "Tempo de Entrega" | — |
| 2 | Verificar campos de prazo e frequencia | — |
| 3 | Localizar card "Mercado (TAM/SAM/SOM)" | — |
| 4 | Verificar campos TAM, SAM, SOM | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card "Tempo de Entrega" | Visivel |
| Campo "Prazo maximo aceito (dias)" | Presente com valor "30" |
| Campo "Frequencia maxima" | Select com opcoes (Diaria, Semanal, Quinzenal, Mensal) |
| Card "Mercado (TAM/SAM/SOM)" | Visivel |
| Campo TAM | Presente com prefixo "R$" |
| Campo SAM | Presente |
| Campo SOM | Presente |

---

# TESTE 8 — Aba Fontes de Busca: DataTable de Fontes

### O que verificar:
> Card "Fontes de Editais" com DataTable, botoes "Atualizar" e "Cadastrar Fonte".

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Fontes de Busca" | — |
| 2 | Verificar card "Fontes de Editais" | — |
| 3 | Verificar botoes "Atualizar" e "Cadastrar Fonte" | — |
| 4 | Verificar colunas da tabela: Nome, Tipo, URL, Status, Acoes | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Fontes de Editais" visivel |
| Botao "Atualizar" | Presente |
| Botao "Cadastrar Fonte" | Presente |
| Tabela/DataTable | Presente (pode ter dados ou mensagem "Nenhuma fonte cadastrada") |

---

# TESTE 9 — Aba Fontes de Busca: Palavras-chave e NCMs

### O que verificar:
> Cards "Palavras-chave de Busca" e "NCMs para Busca" com tags.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Na aba "Fontes de Busca", localizar card "Palavras-chave de Busca" | — |
| 2 | Verificar tags de palavras-chave | — |
| 3 | Localizar card "NCMs para Busca" | — |
| 4 | Verificar tags de NCMs | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card "Palavras-chave" | Visivel |
| Tags de palavras | microscopio, centrifuga, autoclave, etc. |
| Botao "+ Editar" | Presente |
| Card "NCMs para Busca" | Visivel |
| Tags de NCMs | 9011.10.00, 9011.20.00, 8421.19.10, etc. |
| Botao "+ Adicionar NCM" | Presente |

---

# TESTE 10 — Aba Notificacoes

### O que verificar:
> Card "Configuracoes de Notificacao" com email, checkboxes e frequencia.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Notificacoes" | — |
| 2 | Verificar campo de email | — |
| 3 | Verificar checkboxes (Email, Sistema, SMS) | — |
| 4 | Verificar select de frequencia | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Configuracoes de Notificacao" visivel |
| Campo email | Preenchido com "contato@aquila.com.br" |
| Checkbox "Email" | Presente, checked |
| Checkbox "Sistema" | Presente, checked |
| Checkbox "SMS" | Presente, unchecked |
| Frequencia do resumo | Select com opcoes (Imediato, Diario, Semanal), valor "Diario" |
| Botao "Salvar" | Presente |

---

# TESTE 11 — Aba Preferencias

### O que verificar:
> Card "Preferencias do Sistema" com Tema, Idioma e Fuso horario.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Preferencias" | — |
| 2 | Verificar campo Tema (radio buttons) | — |
| 3 | Verificar campo Idioma (select) | — |
| 4 | Verificar campo Fuso horario (select) | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card titulo | "Preferencias do Sistema" visivel |
| Tema | Radio buttons: "Escuro" e "Claro", "Claro" selecionado |
| Idioma | Select com opcoes: Portugues (Brasil), English (US), Espanol |
| Fuso horario | Select com opcoes: America/Sao_Paulo, America/Manaus, America/Belem |
| Botao "Salvar" | Presente |

---

# TESTE 12 — API: Listar Fontes de Editais

### O que verificar:
> Endpoint GET /api/crud/fontes-editais retorna lista de fontes.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer POST /api/auth/login para obter token | email/password |
| 2 | Fazer GET /api/crud/fontes-editais com Bearer token | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| Resposta contem "items" | Array de fontes |

---

# TESTE 13 — API: Obter Parametros de Score

### O que verificar:
> Endpoint GET /api/crud/parametros-score retorna parametros.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Fazer GET /api/crud/parametros-score com Bearer token | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| Resposta contem "items" | Array de parametros |

---

# RESUMO — CHECKLIST RAPIDO

| # | Teste | Status |
|---|---|---|
| 1 | Pagina carrega com 5 abas | :white_large_square: |
| 2 | Aba Produtos: Estrutura de Classificacao | :white_large_square: |
| 3 | Aba Produtos: Tipos de Edital (6 checkboxes) | :white_large_square: |
| 4 | Aba Produtos: Norteadores de Score (6 itens) | :white_large_square: |
| 5 | Aba Produtos: Fontes Documentais (10 docs) | :white_large_square: |
| 6 | Aba Comercial: Regiao de Atuacao (27 estados) | :white_large_square: |
| 7 | Aba Comercial: Tempo Entrega + Mercado TAM/SAM/SOM | :white_large_square: |
| 8 | Aba Fontes: DataTable de Fontes | :white_large_square: |
| 9 | Aba Fontes: Palavras-chave + NCMs | :white_large_square: |
| 10 | Aba Notificacoes: Email, checkboxes, frequencia | :white_large_square: |
| 11 | Aba Preferencias: Tema, Idioma, Fuso | :white_large_square: |
| 12 | API: GET /api/crud/fontes-editais | :white_large_square: |
| 13 | API: GET /api/crud/parametros-score | :white_large_square: |

**Total: 13 testes cobrindo 100% da Pagina 4 (Parametrizacoes) do WORKFLOW SISTEMA**
