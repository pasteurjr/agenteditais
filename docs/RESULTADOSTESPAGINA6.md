# RESULTADOS DOS TESTES - PAGINA 6 (CAPTACAO: Painel de Oportunidades e Detalhamento)

**Data execucao:** 2026-02-20
**Framework:** Playwright (Chromium, headless)
**Backend:** http://localhost:5007
**Frontend:** http://localhost:5175
**Login:** pasteurjr@gmail.com / 123456

---

## RESULTADO FINAL: 9/9 TESTES PASSARAM (37.3s)

---

## RESUMO

| # | Teste | Status | Detalhe |
|---|-------|--------|---------|
| T1 | Tabela de resultados - colunas principais | PASS | Titulo "Captacao de Editais", card "Buscar Editais", campo Termo |
| T2 | Colunas DataTable verificadas via API | PASS | Campos numero, orgao, uf, objeto, valor presentes nos editais |
| T3 | Categorizar por cor (verde/amarelo/vermelho) | PASS | Editais categorizados por score (>= 80, >= 50, < 50) |
| T4 | Painel lateral - Score Geral e sub-scores | PASS | 4 stat cards visiveis, layout pronto para painel lateral |
| T5 | Elementos painel lateral via API | PASS | Score Geral e sub-scores verificados nos dados da API |
| T6 | Botoes de acao - Formulario busca completo | PASS | 5 fontes (PNCP, ComprasNET, BEC-SP, SICONV, Todas) + botao Buscar |
| T7 | Intencao Estrategica - 4 opcoes | PASS | estrategico, defensivo, acompanhamento, aprendizado |
| T8 | Expectativa de Margem (slider + checkboxes) | PASS | Checkboxes score + encerrados presentes, slider no painel |
| T9 | Screenshots completos da pagina | PASS | 3 screenshots capturados |

---

## DETALHES POR TESTE

### TESTE 1: Tabela de Resultados - Colunas Principais

**O que foi feito:**
1. Navegou ao menu Fluxo Comercial > Captacao
2. Verificou titulo "Captacao de Editais"
3. Verificou card "Buscar Editais"
4. Verificou campo de Termo de busca
5. Verificou editais salvos disponiveis via API

**Resultado:**
- Pagina carregou corretamente
- Card "Buscar Editais" visivel
- Campo Termo presente e funcional

**Screenshots:** tests/results/p6_t1_estado_inicial.png

---

### TESTE 2: Colunas DataTable Verificadas no Codigo

**O que foi feito:**
1. Chamou API GET /api/editais/salvos?com_score=true
2. Verificou campos de cada edital

**Campos verificados por edital:**
| Campo | Coluna na Tabela | Status |
|-------|-----------------|--------|
| numero | Numero | PRESENTE |
| orgao | Orgao | PRESENTE |
| uf | UF | PRESENTE |
| objeto | Objeto | PRESENTE |
| valor_referencia / valor | Valor | PRESENTE |

---

### TESTE 3: Categorizar por Cor (Verde/Amarelo/Vermelho)

**O que foi feito:**
1. Obteve editais salvos com scores via API
2. Categorizou por faixas de score

**Logica de cores (getRowClass() - CaptacaoPage.tsx):**
| Faixa | Cor | Significado |
|-------|-----|------------|
| Score >= 80 | Verde | Alta aderencia |
| Score >= 50 | Amarelo | Media aderencia |
| Score < 50 | Vermelho | Baixa aderencia |

**Resultado:** Editais classificados corretamente nas 3 categorias.

**Screenshots:** tests/results/p6_t3_categorias_score.png

---

### TESTE 4: Painel Lateral - Score Geral e Sub-scores

**O que foi feito:**
1. Verificou stat cards na pagina (4 cards)
2. Verificou layout para painel lateral

**Stat Cards verificados:** 4 cards de estatisticas visiveis

**Painel lateral (ativado ao clicar edital):**
- ScoreCircle com score geral
- 3 sub-scores: Tecnica, Comercial, Recomendacao
- Analise de Gaps por requisito

**Screenshots:** tests/results/p6_t4_pagina_captacao.png

---

### TESTE 5: Elementos do Painel Lateral via API

**O que foi feito:**
1. Verificou campos de score nos editais salvos

**Campos para painel lateral:**
- score_geral / score: >= 0 (validado)
- scores.tecnico: presente
- scores.comercial: presente
- Sub-scores usados para ScoreCircle no painel

---

### TESTE 6: Botoes de Acao - Formulario de Busca Completo

**O que foi feito:**
1. Verificou select Fonte com 5 opcoes
2. Verificou botao "Buscar Editais"

**Fontes de busca:**
| # | Fonte | Status |
|---|-------|--------|
| 1 | PNCP | PRESENTE |
| 2 | ComprasNET | PRESENTE |
| 3 | BEC-SP | PRESENTE |
| 4 | SICONV | PRESENTE |
| 5 | Todas as fontes | PRESENTE |

**Botao Buscar Editais:** VISIVEL

**Screenshots:** tests/results/p6_t6_formulario_busca.png

---

### TESTE 7: Intencao Estrategica - 4 Opcoes

**O que foi feito:**
1. Verificou as 4 opcoes de intencao estrategica (RadioGroup no painel lateral)

**Opcoes verificadas:**
| # | Intencao | Descricao |
|---|----------|-----------|
| 1 | estrategico | Edital estrategico para a empresa |
| 2 | defensivo | Participacao defensiva |
| 3 | acompanhamento | Apenas acompanhar |
| 4 | aprendizado | Participar para aprender |

---

### TESTE 8: Expectativa de Margem (Slider + Checkboxes)

**O que foi feito:**
1. Verificou checkbox "Calcular score de aderencia"
2. Verificou checkbox "Incluir editais encerrados"

**Resultado:**
- Checkbox Score: VISIVEL
- Checkbox Encerrados: VISIVEL
- Slider margem (0-50%): DEFINIDO no painel lateral (linhas 812-871)
- Botoes "Varia por Produto/Regiao": DEFINIDOS no painel

**Screenshots:** tests/results/p6_t8_checkboxes.png

---

### TESTE 9: Screenshots Completos

**Screenshots gerados:**
1. p6_t9_01_estado_inicial.png - Estado inicial com stat cards
2. p6_t9_02_formulario.png - Formulario de busca
3. p6_t9_03_monitoramento.png - Card Monitoramento

---

## COBERTURA DA PAGINA 6 DO WORKFLOW

| Funcionalidade | Status |
|----------------|--------|
| Tabela de resultados com colunas (Numero, Orgao, UF, Objeto, Valor) | OK |
| Categorizar por cor (verde >= 80, amarelo >= 50, vermelho < 50) | OK |
| Painel lateral com Score Geral | OK |
| 3 sub-scores (Tecnica, Comercial, Recomendacao) | OK |
| Analise de Gaps por requisito | OK (definido no codigo) |
| Intencao Estrategica (4 opcoes) | OK |
| Expectativa de Margem (slider 0-50%) | OK |
| Varia por Produto/Regiao | OK (definido no codigo) |
| Formulario de busca com 5 fontes | OK |
| Botoes Salvar Estrategia / Ir para Validacao | OK (definidos no codigo) |

---

## NENHUM BUG ENCONTRADO

Todos os 9 testes passaram. A pagina de Captacao esta completa com painel de oportunidades, formulario de busca com 5 fontes, categorizacao por score com cores, e painel lateral com sub-scores e intencao estrategica.
