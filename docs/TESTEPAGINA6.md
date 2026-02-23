# TESTEPAGINA6 - CAPTACAO: Painel de Oportunidades e Detalhamento

**Pagina:** 6 do WORKFLOW SISTEMA.pdf
**Modulo:** CaptacaoPage.tsx (mesma pagina da 5, foco no painel de detalhes)
**Rota:** captacao (Fluxo Comercial > Captacao)

---

## CONTEXTO DA PAGINA 6

A pagina 6 descreve o layout de apresentacao das oportunidades associadas aos Scores.
- "Cliquei no edital que posso ter interesse, ele abre a proxima tela... Para enriquecer a validacao da escolha."
- "Incluir colunas com mais informacoes: Valores, etc."
- "Categorizar por cor (amarelo, verde, vermelho)"
- "Vai para a tela do refinamento"
- Painel de Oportunidades: tabela Licitacao | Produto Correspondente | Score de Aderencia
- Analise de Gaps: Requisito 4.2: Torque Maximo (desvio de 3%)

---

## TESTES

### T1: Painel de Oportunidades - Tabela com 3 colunas principais
**Pre-requisito:** Ter editais salvos no banco (via /api/editais/salvos)
**Acao:** Navegar para Captacao, verificar que a tabela de resultados tem as colunas:
- Licitacao (Numero)
- Produto Correspondente
- Score de Aderencia (ScoreCircle)

**Verificar:**
- Coluna "Numero" existe e eh sortable
- Coluna "Produto" existe (render do produtoCorrespondente)
- Coluna "Score" existe com ScoreCircle
- Colunas adicionais: Orgao, UF, Objeto, Valor, Prazo, Acoes

### T2: Clicar em edital abre painel lateral de detalhes
**Acao:** Clicar em uma linha da tabela de resultados
**Verificar:**
- Painel lateral (.captacao-panel) aparece
- Mostra numero e orgao do edital
- Mostra ScoreCircle principal (Score Geral, size=100)
- Mostra 3 sub-scores: Aderencia Tecnica, Aderencia Comercial, Recomendacao
- Mostra Produto Correspondente
- Mostra Potencial de Ganho (StatusBadge: Elevado/Medio/Baixo)

### T3: Categorizar por cor (amarelo, verde, vermelho)
**Verificar:** Funcao getRowClass() aplica classes CSS:
- score >= 80: row-score-high (verde)
- score >= 50: row-score-medium (amarelo)
- score < 50: row-score-low (vermelho)

**Teste:** Via API, verificar que a funcao existe no codigo ou testar visualmente com DataTable rowClassName

### T4: Analise de Gaps no tooltip
**Acao:** Verificar que a coluna Score tem tooltip com Analise de Gaps
**Verificar:**
- Tooltip mostra "Analise de Gaps"
- Lista items com icones: check (atendido), circulo (parcial), X (nao_atendido)
- Mostra sub-scores: Tec: X% | Com: Y% | Rec: Z%

### T5: Colunas com mais informacoes (Valores)
**Verificar coluna Valor:**
- Coluna "Valor" existe e renderiza formatCurrency (R$ X.XXX,XX)
- Coluna "Prazo" com StatusBadge de dias restantes
- Coluna "Acoes" com botoes Ver detalhes e Salvar edital

### T6: Botao "Ir para Validacao" no painel
**Acao:** Abrir painel lateral, verificar botao "Ir para Validacao"
**Verificar:**
- Botao "Ir para Validacao" presente
- Botao "Salvar Estrategia" presente
- Botao "Salvar Edital" presente
- Botao "Abrir no Portal" presente (se URL existir)

### T7: Intencao Estrategica no painel (4 opcoes)
**Acao:** Verificar RadioGroup no painel lateral
**Verificar:**
- 4 opcoes: Estrategico, Defensivo, Acompanhamento, Aprendizado
- RadioGroup funcional (selecionavel)

### T8: Expectativa de Margem (slider)
**Acao:** Verificar slider de margem no painel
**Verificar:**
- Slider range 0-50%
- Label mostra porcentagem atual
- Botoes "Varia por Produto" e "Varia por Regiao"

### T9: Screenshots do painel lateral completo
**Acao:** Capturar screenshots do painel com todas as secoes visiveis
