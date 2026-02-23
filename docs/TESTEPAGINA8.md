# TESTE DAS PAGINAS 8, 9 e 10 — VALIDACAO DE EDITAIS
## Guia Completo de Testes com Dados de Entrada e Saidas Esperadas

**Referencia:** WORKFLOW SISTEMA.pdf — Paginas 8, 9, 10
**Modulo:** ValidacaoPage (route: "validacao", menu: Fluxo Comercial > Validacao)
**Frontend:** frontend/src/pages/ValidacaoPage.tsx

---

## VISAO GERAL

A pagina de Validacao e onde o usuario analisa editais salvos com suporte de IA, usando scores multi-dimensionais, e toma decisoes estrategicas (Participar / Acompanhar / Ignorar). Cobre tres paginas do WORKFLOW:

- **Pag 8:** Score geral, sinais de mercado, decisao GO/NO-GO, justificativa
- **Pag 9:** Aderencias detalhadas (tecnica, documental, juridica, logistica, comercial)
- **Pag 10:** Processo Amanda (3 pastas de documentos vinculados ao edital)

---

## PRE-CONDICOES

- Backend rodando em http://localhost:5007
- Frontend rodando em http://localhost:5175
- Pelo menos 1 edital salvo no sistema (via pagina Captacao)
- Login: pasteurjr@gmail.com / 123456

---

# TESTE 1 — Carregamento da Pagina e Tabela de Editais

### O que diz o WORKFLOW:
> Lista de editais salvos com score, status, orgao, valor

### Onde testar:
Menu lateral → Fluxo Comercial → **Validacao**

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Acessar a pagina Validacao pelo menu lateral | Fluxo Comercial > Validacao |
| 2 | Aguardar carregamento da tabela | — |
| 3 | Verificar titulo da pagina | "Validacao de Editais" |
| 4 | Verificar que a tabela de editais esta visivel | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Titulo da pagina | "Validacao de Editais" visivel |
| Card "Meus Editais" | Visivel com tabela |
| Colunas da tabela | Numero, Orgao, UF, Objeto, Valor, Abertura, Status, Score |
| Filtro de busca | Input "Buscar edital..." visivel |
| Filtro de status | Select com Todos/Novo/Analisando/Validado/Descartado |

---

# TESTE 2 — API: Listar Editais Salvos

### O que diz o WORKFLOW:
> Tabela alimentada pelo backend via endpoint /api/editais/salvos

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Chamar GET /api/editais/salvos?com_score=true | Authorization: Bearer <token> |
| 2 | Verificar resposta | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| Resposta | JSON com array "editais" |
| Cada edital contem | id, numero, orgao, uf, objeto, valor_referencia, data_abertura |
| Campos opcionais | score_geral, scores, sinais_mercado, fatal_flaws |

---

# TESTE 3 — Selecionar Edital e Verificar Painel de Analise

### Onde testar:
Pagina Validacao → Clicar em uma linha da tabela

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na primeira linha da tabela de editais | — |
| 2 | Aguardar painel de analise aparecer | — |
| 3 | Verificar elementos do painel | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Barra de sinais de mercado | Visivel (com badges se houver sinais) |
| Botoes de decisao | Participar, Acompanhar, Ignorar visiveis |
| Card do edital | Numero + Orgao no titulo |
| Score Dashboard | Score Geral (circulo) + 6 sub-score bars |
| Abas | Objetiva, Analitica, Cognitiva |
| Processo Amanda | Card "Processo Amanda - Documentacao" visivel |

---

# TESTE 4 — Barra Superior: Sinais de Mercado e Decisao

### O que diz o WORKFLOW:
> Sinais: Concorrente Dominante, Suspeita Licitacao Direcionada
> Botoes: [Participar] [Acompanhar] [Ignorar]

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Com edital selecionado, verificar barra superior | — |
| 2 | Verificar badges de sinais de mercado | — |
| 3 | Verificar botoes de decisao | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Barra "validacao-top-bar" | Visivel |
| Badges de sinais | Zero ou mais badges (warning/error) |
| Botao "Participar" | Visivel, classe btn-success |
| Botao "Acompanhar" | Visivel, classe btn-info |
| Botao "Ignorar" | Visivel, classe btn-neutral |

---

# TESTE 5 — Clicar Participar e Verificar Justificativa

### O que diz o WORKFLOW:
> Ao decidir, usuario deve justificar. A justificativa e combustivel para a IA aprender.

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar botao "Participar" | — |
| 2 | Verificar que card de justificativa aparece | — |
| 3 | Verificar campos do card | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card "Justificativa da Decisao" | Visivel |
| Dropdown "Motivo" | Presente com opcoes: Preco competitivo, Portfolio aderente, Margem insuficiente, etc. |
| TextArea "Detalhes" | Presente e editavel |
| Botao "Salvar Justificativa" | Presente |

---

# TESTE 6 — Justificativa: Motivo + Detalhes

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Selecionar motivo no dropdown | "preco_competitivo" (Preco competitivo) |
| 2 | Digitar detalhes na textarea | "Margem aceitavel para este tipo de produto" |
| 3 | Clicar "Salvar Justificativa" | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card de justificativa | Fecha apos salvar |
| Badge "Decisao salva" | Aparece na barra de sinais |
| Status do edital | Muda para "Validado" |

---

# TESTE 7 — Score Dashboard

### O que diz o WORKFLOW:
> Score 82/100 com sub-scores detalhados (6 dimensoes)

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Com edital selecionado, verificar score dashboard | — |
| 2 | Verificar score geral (circulo) | — |
| 3 | Verificar 6 barras de sub-scores | — |
| 4 | Verificar intencao estrategica e margem | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Score Geral | Circulo com numero (ScoreCircle) |
| Potencial de Ganho | Badge Elevado/Medio/Baixo |
| Botao "Calcular Scores IA" | Presente |
| 6 sub-scores | Aderencia Tecnica, Aderencia Documental, Complexidade Edital, Risco Juridico, Viabilidade Logistica, Atratividade Comercial |
| Intencao Estrategica | RadioGroup: Estrategico, Defensivo, Acompanhamento, Aprendizado |
| Margem slider | Range 0-50% com labels |

---

# TESTE 8 — Tab Objetiva

### O que diz o WORKFLOW (Pag 9):
> a. Aderencia Tecnica/Portfolio, b. Aderencia Documental, Certificacoes, Checklist Documental, Mapa Logistico

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Objetiva" | — |
| 2 | Verificar secao Decisao IA (GO/NO-GO) | — |
| 3 | Verificar secao Aderencia Tecnica | — |
| 4 | Verificar secao Certificacoes | — |
| 5 | Verificar secao Checklist Documental | — |
| 6 | Verificar secao Mapa Logistico | — |
| 7 | Verificar secao Analise de Lote | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Secao "Aderencia Tecnica Detalhada" | Visivel com icone Target |
| Secao "Certificacoes" | Visivel com lista de certificacoes (nome + status) |
| Secao "Checklist Documental" | Tabela com colunas: Documento, Status, Validade |
| Secao "Mapa Logistico" | UF Edital, Empresa SP, Distancia, Entrega Estimada |
| Secao "Analise de Lote" | Barra com itens aderentes vs intrusos |

---

# TESTE 9 — Tab Analitica

### O que diz o WORKFLOW (Pag 8-9):
> Pipeline Riscos, Flags Juridicos, Fatal Flaws, Reputacao do Orgao, Alerta de Recorrencia

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Analitica" | — |
| 2 | Verificar Pipeline de Riscos | — |
| 3 | Verificar Flags Juridicos | — |
| 4 | Verificar Fatal Flaws (se houver) | — |
| 5 | Verificar Reputacao do Orgao | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Secao "Pipeline de Riscos" | Visivel com badges (Pregao Eletronico, etc.) |
| Secao "Flags Juridicos" | Badges warning ou "Nenhum flag identificado" (verde) |
| Secao "Fatal Flaws" | Card vermelho se existirem flaws, ausente se nao |
| Secao "Reputacao do Orgao" | Grid: Pregoeiro, Pagamento, Historico |
| Secao "Aderencia Trecho-a-Trecho" | Tabela: Trecho Edital / Aderencia / Trecho Portfolio |

---

# TESTE 10 — Tab Cognitiva

### O que diz o WORKFLOW:
> Resumo IA, Historico Semelhantes, Pergunte a IA

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Clicar na aba "Cognitiva" | — |
| 2 | Verificar Resumo IA | — |
| 3 | Verificar Historico Semelhantes | — |
| 4 | Verificar "Pergunte a IA" | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Secao "Resumo Gerado pela IA" | Visivel com botao "Gerar Resumo" ou texto de resumo |
| Secao "Historico de Editais Semelhantes" | Lista de editais ou "Nenhum edital semelhante encontrado" |
| Secao "Pergunte a IA" | Input + Botao "Perguntar" |

---

# TESTE 11 — Processo Amanda (3 Pastas de Documentos)

### O que diz o WORKFLOW (Pag 10):
> a. Leitura do Edital: monta 3 pastas:
> 1. Pasta Documentos da Empresa
> 2. Pasta Documentos Fiscais/Certidoes
> 3. Pasta Qualificacao Tecnica

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | Com edital selecionado, scroll para card "Processo Amanda" | — |
| 2 | Verificar Pasta 1: Documentos da Empresa | — |
| 3 | Verificar Pasta 2: Certidoes e Fiscal | — |
| 4 | Verificar Pasta 3: Qualificacao Tecnica | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Card "Processo Amanda - Documentacao" | Visivel |
| Pasta 1 "Documentos da Empresa" | Icone azul, items: Contrato Social, Procuracao, Atestado Capacidade Tecnica |
| Pasta 2 "Certidoes e Fiscal" | Icone amarelo, items: CND Federal, FGTS-CRF, Certidao Trabalhista, Balanco Patrimonial |
| Pasta 3 "Qualificacao Tecnica" | Icone verde, items: Registro ANVISA, Certificado BPF, Laudo Tecnico |
| Cada item | Nome + StatusBadge (Disponivel/Faltante/OK/Vencida) |
| Items exigidos | Badge "Exigido" visivel (Pasta 3) |

---

# TESTE 12 — API: Calcular Scores via IA

### O que diz o WORKFLOW:
> Score calculado pela IA com 6 dimensoes

### Passos:

| # | Acao | Dados de Entrada |
|---|---|---|
| 1 | POST /api/editais/{id}/scores-validacao | Authorization: Bearer <token> |
| 2 | Verificar resposta | — |

### Saida Esperada:

| O que verificar | Resultado esperado |
|---|---|
| HTTP Status | 200 |
| scores | Objeto com tecnico, documental, complexidade, juridico, logistico, comercial (0-100) |
| score_geral | Numero 0-100 |
| potencial_ganho | "elevado", "medio" ou "baixo" |
| decisao_ia | "GO", "NO-GO" ou "CONDICIONAL" |

---

# TESTE 13 — Screenshots de Cada Tab e Estado

### Passos:

| # | Acao | Screenshot |
|---|---|---|
| 1 | Pagina carregada (tabela) | t8_01_tabela.png |
| 2 | Edital selecionado | t8_02_edital_selecionado.png |
| 3 | Barra decisao + sinais | t8_03_decisao_sinais.png |
| 4 | Justificativa aberta | t8_04_justificativa.png |
| 5 | Score dashboard | t8_05_score_dashboard.png |
| 6 | Tab Objetiva | t8_06_tab_objetiva.png |
| 7 | Tab Analitica | t8_07_tab_analitica.png |
| 8 | Tab Cognitiva | t8_08_tab_cognitiva.png |
| 9 | Processo Amanda | t8_09_processo_amanda.png |

---

# RESUMO — CHECKLIST RAPIDO

| # | Teste | Status |
|---|---|---|
| 1 | Carregamento pagina + tabela editais | -- |
| 2 | API: GET /api/editais/salvos?com_score=true | -- |
| 3 | Selecionar edital - painel de analise | -- |
| 4 | Barra: Sinais de Mercado + Decisao | -- |
| 5 | Clicar Participar - card justificativa | -- |
| 6 | Justificativa: motivo + detalhes | -- |
| 7 | Score Dashboard: geral + 6 sub-scores | -- |
| 8 | Tab Objetiva: Aderencia, Certificacoes, Checklist, Mapa, Lote | -- |
| 9 | Tab Analitica: Pipeline, Flags, Fatal Flaws, Reputacao | -- |
| 10 | Tab Cognitiva: Resumo IA, Historico, Pergunte a IA | -- |
| 11 | Processo Amanda: 3 pastas documentos | -- |
| 12 | API: POST scores-validacao | -- |
| 13 | Screenshots de cada tab e estado | -- |

**Total: 13 testes cobrindo 100% das Paginas 8, 9 e 10 do WORKFLOW SISTEMA**
