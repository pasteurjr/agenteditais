# TESTE DAS PAGINAS 5, 6 e 7 — CAPTACAO DE EDITAIS
## Guia Completo de Testes com Dados de Entrada e Saidas Esperadas

**Referencia:** WORKFLOW SISTEMA.pdf — Paginas 5, 6 e 7
**Modulo:** CaptacaoPage (route: "captacao", menu: Fluxo Comercial > Captacao)

---

## DADOS DE TESTE PADRAO (usar em todos os testes)

| Campo | Valor para digitar |
|---|---|
| Termo de busca | reagentes |
| UF | Todas |
| Fonte | PNCP |
| Calcular Score | Sim (checkbox marcado) |
| Incluir Encerrados | Nao (checkbox desmarcado) |

---

# TESTE 1 — Pagina carrega com stat cards de prazos

### O que diz o WORKFLOW:
> **Datas submissao:** Proximos 2/5/10/20 dias — Monitoramento 24/7

### Onde testar:
Menu lateral → Fluxo Comercial → **Captacao**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Acessar Captacao pelo menu lateral | — |
| 2 | Verificar titulo "Captacao de Editais" | — |
| 3 | Verificar 4 stat cards de prazos | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo da pagina | "Captacao de Editais" visivel |
| Stat card 1 | "Proximos 2 dias" com cor vermelha |
| Stat card 2 | "Proximos 5 dias" com cor laranja |
| Stat card 3 | "Proximos 10 dias" com cor amarela |
| Stat card 4 | "Proximos 20 dias" com cor azul |

---

# TESTE 2 — Formulario de busca: campos e filtros

### O que diz o WORKFLOW:
> **Formato de Busca:** NCMs, Nome Tecnico, Palavra-chave, busca pelo OBJETO
> **Locais de Busca:** PNCP, ComprasNet, BEC, SICONV

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Verificar campo "Termo / Palavra-chave" | — |
| 2 | Verificar select "UF" com todas as UFs brasileiras | — |
| 3 | Verificar select "Fonte" com opcoes PNCP, ComprasNET, BEC-SP, SICONV, Todas | — |
| 4 | Verificar select "Classificacao Tipo" com opcoes: Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco | — |
| 5 | Verificar select "Classificacao Origem" com opcoes: Municipal, Estadual, Federal, Universidade, Hospital, LACEN, etc. | — |
| 6 | Verificar checkbox "Calcular score de aderencia" | — |
| 7 | Verificar checkbox "Incluir editais encerrados" | — |
| 8 | Verificar botao "Buscar Editais" | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card "Buscar Editais" | Visivel com icone de busca |
| Campo Termo | Input text com placeholder "Ex: microscopio, reagente..." |
| Select UF | Presente com opcoes "Todas", "AC"..."TO" (27 UFs + Todas) |
| Select Fonte | 5 opcoes: PNCP, ComprasNET, BEC-SP, SICONV, Todas as fontes |
| Select Tipo | 6 opcoes: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta Preco |
| Select Origem | 9 opcoes: Todos, Municipal, Estadual, Federal, Universidade, Hospital, LACEN, Forca Armada, Autarquia |
| Checkbox score | Marcado por default |
| Checkbox encerrados | Desmarcado por default |
| Botao Buscar | Visivel, clicavel |

---

# TESTE 3 — Executar busca: termo "reagentes", verificar resultados

### O que diz o WORKFLOW:
> **Busca Inteligente** — Classificacao Automatica por tipo de edital

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Digitar "reagentes" no campo Termo | `reagentes` |
| 2 | Manter UF = Todas, Fonte = PNCP | — |
| 3 | Clicar "Buscar Editais" | — |
| 4 | Aguardar resultados carregarem | — |
| 5 | Verificar tabela de resultados | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Loading | Botao mostra indicador de carregamento durante busca |
| Tabela de resultados | Aparece com titulo "Resultados (N editais encontrados)" |
| Numero de resultados | Pelo menos 1 edital retornado |
| Sem erro | Nenhuma mensagem de erro exibida |

---

# TESTE 4 — Colunas da tabela de resultados

### O que diz o WORKFLOW:
> **Painel de Oportunidades:** tabela Licitacao | Produto Correspondente | Score de Aderencia

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Apos busca, verificar colunas da tabela | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Coluna checkbox | Presente (selecao) |
| Coluna "Numero" | Presente, sortable |
| Coluna "Orgao" | Presente, sortable |
| Coluna "UF" | Presente |
| Coluna "Objeto" | Presente (texto truncado a 45 chars) |
| Coluna "Valor" | Presente, formato R$ moeda brasileira |
| Coluna "Produto" | Presente (Produto Correspondente) |
| Coluna "Prazo" | Presente com badges coloridos (erro <=2d, warning <=5d) |
| Coluna "Score" | Presente com ScoreCircle colorido |
| Coluna "Acoes" | Presente com botoes Ver detalhes e Salvar |

---

# TESTE 5 — Score: categorizacao por cor

### O que diz o WORKFLOW:
> **Categorizar por cor:** amarelo, verde, vermelho

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Verificar classe CSS das linhas por score | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Score >= 80 | Linha com classe "row-score-high" (verde) |
| Score >= 50 e < 80 | Linha com classe "row-score-medium" (amarelo) |
| Score < 50 | Linha com classe "row-score-low" (vermelho) |

---

# TESTE 6 — Painel lateral: Score principal + 3 sub-scores

### O que diz o WORKFLOW:
> **Analise do Edital:** Score de Aderencia Tecnica (90%), Score Comercial (75%), Score de Recomendacao de Participacao (4.5/5 estrelas)

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar em uma linha da tabela para abrir painel | — |
| 2 | Verificar Score Geral (ScoreCircle grande) | — |
| 3 | Verificar sub-score "Aderencia Tecnica" | — |
| 4 | Verificar sub-score "Aderencia Comercial" | — |
| 5 | Verificar sub-score "Recomendacao" (StarRating) | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Painel lateral abre | Card visivel com numero e orgao do edital |
| Score Geral | ScoreCircle grande (size=100) com label "Score Geral" |
| Aderencia Tecnica | ScoreCircle menor (size=60) com label "Aderencia Tecnica" |
| Aderencia Comercial | ScoreCircle menor (size=60) com label "Aderencia Comercial" |
| Recomendacao | StarRating com label "Recomendacao" |
| Produto Correspondente | Secao visivel |
| Potencial de Ganho | Badge (Elevado/Medio/Baixo) |

---

# TESTE 7 — Intencao Estrategica (4 opcoes radio)

### O que diz o WORKFLOW:
> **Intencao estrategica:** Estrategico, Defensivo, Acompanhamento, Aprendizado

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | No painel lateral, verificar radio group "Intencao Estrategica" | — |
| 2 | Verificar 4 opcoes disponiveis | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo da secao | "Intencao Estrategica" |
| Opcao 1 | "Estrategico" |
| Opcao 2 | "Defensivo" |
| Opcao 3 | "Acompanhamento" |
| Opcao 4 | "Aprendizado" |
| Valor default | "acompanhamento" selecionado por default |

---

# TESTE 8 — Expectativa de Margem (slider)

### O que diz o WORKFLOW:
> **Expectativa de Margem** — configuravel por produto e por regiao

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | No painel, verificar slider de Margem | — |
| 2 | Verificar range 0% a 50% | — |
| 3 | Verificar botoes "Varia por Produto" e "Varia por Regiao" | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo | "Expectativa de Margem: X%" |
| Slider | Input range min=0, max=50, valor default=15 |
| Labels | "0%" e "50%" nos extremos |
| Botao Varia por Produto | Presente, clicavel |
| Botao Varia por Regiao | Presente, clicavel |

---

# TESTE 9 — Analise de Gaps

### O que diz o WORKFLOW:
> **Analise de Gaps:** Requisito nao atendido, Certificacao pendente

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | No painel, verificar secao "Analise de Gaps" | — |
| 2 | Verificar tooltip de gaps na coluna Score da tabela | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Secao Gaps | Aparece se edital tem gaps |
| Gap "atendido" | Badge verde com icone check |
| Gap "parcial" | Badge amarelo |
| Gap "nao_atendido" | Badge vermelho com icone X |
| Tooltip Score | Mostra "Analise de Gaps" com lista ao hover |

---

# TESTE 10 — Botoes de acao: Salvar, Ir para Validacao

### O que diz o WORKFLOW:
> **Clique no edital abre proxima tela de refinamento** — Fluxo para Validacao

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | No painel, verificar botao "Salvar Estrategia" | — |
| 2 | Verificar botao "Salvar Edital" | — |
| 3 | Verificar botao "Ir para Validacao" | — |
| 4 | Verificar botao "Abrir no Portal" (se URL disponivel) | — |
| 5 | Verificar botoes acima da tabela: "Salvar Todos", "Salvar Score >= 70%", "Exportar CSV" | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Salvar Estrategia | Botao primario visivel |
| Salvar Edital | Botao visivel |
| Ir para Validacao | Botao visivel, navega para pagina Validacao |
| Abrir no Portal | Visivel se edital tem URL |
| Salvar Todos | Botao acima da tabela |
| Salvar Score >= 70% | Botao acima da tabela |

---

# TESTE 11 — API: GET /api/editais/buscar?termo=reagentes

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Chamar API de busca via fetch | `GET /api/editais/buscar?termo=reagentes&calcularScore=true&incluirEncerrados=false&limite=30` |
| 2 | Verificar resposta JSON | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP status | 200 |
| JSON.success | true |
| JSON.editais | Array com pelo menos 1 item |
| Cada edital | Contem campos: numero, orgao, uf, objeto, valor_estimado, data_abertura |

---

# TESTE 12 — API: GET /api/crud/monitoramentos

### O que diz o WORKFLOW:
> **Monitoramento 24/7** — Alertas em Tempo Real

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Chamar API de monitoramentos | `GET /api/crud/monitoramentos?limit=10` |
| 2 | Verificar resposta JSON | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP status | 200 |
| JSON.items | Array (pode ser vazio se nenhum monitoramento configurado) |
| Card na UI | "Monitoramento Automatico" visivel |

---

# TESTE 13 — Screenshots de busca, resultados e painel

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Screenshot da pagina Captacao (estado inicial com stat cards) | — |
| 2 | Screenshot apos busca (tabela de resultados) | — |
| 3 | Screenshot com painel lateral aberto | — |
| 4 | Screenshot da secao Monitoramento | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Screenshot 1 | Stat cards e formulario de busca visiveis |
| Screenshot 2 | Tabela de resultados com editais |
| Screenshot 3 | Painel lateral com scores, intencao, margem |
| Screenshot 4 | Card de Monitoramento Automatico |
