# Roteiro Completo de Teste — Página de Validação

**Data:** 2026-03-05
**Página:** ValidacaoPage (`frontend/src/pages/ValidacaoPage.tsx`)
**Endpoint principal:** `GET /api/editais/salvos?com_score=true&com_estrategia=true`

---

## Pré-requisitos

1. Backend rodando na porta 5007 (`python3 backend/app.py`)
2. Frontend rodando na porta 5175 (`cd frontend && npm run dev`)
3. Login com `pasteurjr@gmail.com` / `123456`
4. Ter pelo menos 1 edital salvo (via Captação → botão Salvar)

---

## TESTE 1 — Lista de Editais Salvos

1. Navegar para **Fluxo Comercial → Validação**
2. Verificar que a tabela carrega editais salvos
3. **Colunas esperadas:** número, órgão, UF, objeto (truncado 30 chars), valor (R$), data abertura, status (badge colorido), score (ScoreCircle)
4. Testar **ordenação** clicando nos headers (número, órgão, data abertura, status, score)
5. Testar **busca por texto** — digitar parte do número ou nome do órgão
6. Testar **filtro por status**: Todos / Novo / Analisando / Validado / Descartado
7. Clicar em um edital → painel direito deve abrir com detalhes

**Resultado esperado:** Tabela populada com editais salvos, filtros e busca funcionais, seleção abre painel lateral.

---

## TESTE 2 — Sinais de Oportunidade (barra superior)

1. Com edital selecionado, verificar a barra superior (`.validacao-top-bar`)
2. Verificar **badges de sinais de mercado** (se existirem — ex: "Direcionada", "Predatório")
3. Verificar **contador de Fatal Flaws** (badge vermelho, se houver)
4. Verificar **3 botões de decisão**:
   - **Participar** (verde)
   - **Acompanhar** (azul)
   - **Ignorar** (cinza)
5. Após salvar decisão, verificar badge **"Decisão salva"** (verde)

**Resultado esperado:** Barra superior mostra sinais + botões de decisão funcionais.

---

## TESTE 3 — Card de Informações do Edital

1. Verificar título: `{número} - {órgão}`
2. Verificar campos exibidos:
   - Objeto (texto completo)
   - Valor Estimado (formatado em R$)
   - Data Abertura
   - Produto Correspondente (ou "-")
3. Clicar **"Ver Edital"** → modal PdfViewer deve abrir
4. Testar **dropdown de status** — mudar de "novo" para "analisando" e verificar que a tabela à esquerda reflete

**Resultado esperado:** Card com dados completos do edital, PDF viewer funcional, status editável.

---

## TESTE 4 — Calcular Scores IA (6 dimensões)

1. Clicar botão **"Calcular Scores IA"**
2. Aguardar loading (spinner, pode demorar ~10-30s)
3. Verificar que aparece:
   - **ScoreCircle** grande (110px) com Score Geral (0-100)
   - **6 barras de sub-scores:**
     - Aderência Técnica
     - Aderência Documental
     - Complexidade do Edital
     - Risco Jurídico
     - Viabilidade Logística
     - Atratividade Comercial
   - **Badge de Potencial:** Elevado (verde) / Médio (amarelo) / Baixo (vermelho)
   - **Decisão IA:** GO (verde) / NO-GO (vermelho) / CONDICIONAL (amarelo)
   - **Justificativa da IA:** parágrafo de texto explicativo
   - **Pontos Positivos:** lista com itens verdes
   - **Pontos de Atenção:** lista com itens amarelos

**Endpoint:** `POST /api/editais/{editalId}/scores-validacao`

**Resultado esperado:** Todos os 6 scores + decisão + justificativa + pontos aparecem após cálculo.

---

## TESTE 5 — Aba Aderência

1. Clicar na aba **"Aderência"** (ícone Target)
2. Verificar **Banner de Decisão IA** no topo (GO verde / NO-GO vermelho / CONDICIONAL amarelo)
3. Verificar **Sub-scores Técnicos Detalhados** — grid de barras com labels e valores
4. Verificar **Certificações** — lista com badges:
   - OK (verde)
   - Vencida (vermelho)
   - Pendente (amarelo)
5. Verificar **Análise de Lote:**
   - Barra visual horizontal com segmentos coloridos
   - Segmentos verdes = "aderente" (produto compatível)
   - Segmentos vermelhos = "intruso" (produto incompatível)
   - Legenda abaixo: "Aderente (N)" / "Item Intruso (N)"
6. Verificar **Mapa Logístico (F5):**
   - UF do Edital (📍) ↔ UF da Empresa (🏢)
   - Badge de distância: Próximo (verde) / Médio (amarelo) / Distante (vermelho)
   - Estimativa de entrega em dias
7. Testar **Intenção Estratégica** (radio buttons):
   - Selecionar: estratégico / defensivo / acompanhamento / aprendizado
   - Verificar que a seleção persiste ao trocar de aba e voltar
8. Testar **Slider de Margem** (0-50%):
   - Mover slider e verificar que o percentual atualiza
   - Labels: "Varia por Produto" ↔ "Varia por Região"

**Resultado esperado:** Todas as seções populadas com dados do cálculo de scores.

---

## TESTE 6 — Aba Documentos

1. Clicar na aba **"Documentos"** (ícone FolderOpen)

### 6a. Itens do Edital
2. Verificar **tabela de itens** com colunas: #, Descrição, Qtd, Unidade, Valor Unit., Valor Total
3. Se não houver itens, verificar botão **"Buscar Itens no PNCP"** (envia comando ao chat)

### 6b. Documentação Necessária (3 pastas)
4. Verificar **3 pastas coloridas**:
   - **Documentos da Empresa** (azul) — categoria "empresa"
   - **Certidões e Fiscal** (amarelo) — categoria "fiscal"
   - **Qualificação Técnica** (verde) — categoria "tecnica"
5. Cada documento mostra: nome, badge "Exigido" (se aplicável), validade, status:
   - Disponível (verde)
   - Vencido (amarelo)
   - Faltante (vermelho)

### 6c. Resumo de Completude
6. Verificar **barra de progresso** com percentual
   - Verde: 100%
   - Amarelo: >= 70%
   - Vermelho: < 70%
7. Verificar **contadores**: Disponíveis / Vencidos / Faltantes

### 6d. Checklist Documental IA
8. Verificar **tabela** com colunas: Documento, Status (badge), Validade

### 6e. Ações
9. Se fonte = "padrão_licitação", testar botão **"Extrair Requisitos do Edital"**
   - Chama `POST /api/editais/{editalId}/extrair-requisitos`
   - Deve recarregar a documentação após sucesso
10. Testar botão **"Documentos Exigidos via IA"** (envia ao chat)

**Endpoint docs:** `GET /api/editais/{editalId}/documentacao-necessaria`
**Endpoint itens:** `GET /api/crud/editais-itens?edital_id={id}&per_page=200`

**Resultado esperado:** Itens listados, 3 pastas de documentos com status, completude calculada.

---

## TESTE 7 — Aba Riscos

1. Clicar na aba **"Riscos"** (ícone AlertTriangle)
2. Verificar **Pipeline de Riscos:**
   - Badge de modalidade (ex: "Pregão Eletrônico")
   - Badge de risco preço predatório (se detectado)
   - Badge de prazo faturamento
3. Verificar **Flags Jurídicos:**
   - Lista de flags (badges amarelos) OU "Nenhum flag identificado" (badge verde)
4. Verificar **Fatal Flaws** (se existirem):
   - Card vermelho com lista de problemas críticos
   - Nota: "O sistema identificou estes problemas críticos antes da leitura humana."
5. Verificar **Alerta de Recorrência** (se 2+ editais semelhantes perdidos):
   - Mensagem: "Editais semelhantes foram perdidos N vezes..."
6. Verificar **Aderência Trecho-a-Trecho:**
   - Tabela com colunas: Trecho do Edital | Aderência (ScoreBadge) | Trecho do Portfolio
7. Verificar **Avaliação por Dimensão:**
   - Grid com 6 dimensões: Técnico, Documental, Complexidade, Jurídico, Logístico, Comercial
   - Cada uma com badge: Atendido (verde >70) / Ponto de Atenção (amarelo 30-70) / Impeditivo (vermelho <30)

**Resultado esperado:** Riscos identificados e visualizados com badges e classificações corretas.

---

## TESTE 8 — Aba Mercado

1. Clicar na aba **"Mercado"** (ícone Building)
2. Verificar **Reputação do Órgão — {nome do órgão}:**
   - Pregoeiro (texto)
   - Pagamento (texto — "Pagador regular" ou equivalente)
   - Histórico (quantidade de participações + GO/NO-GO)
3. Verificar **Histórico de Editais Semelhantes:**
   - Lista com: número do edital, badge de decisão (GO verde / NO-GO vermelho), score, objeto truncado
   - Ou "Nenhum edital semelhante encontrado no histórico."
4. Testar botão **"Buscar Preços"** → envia ao chat: "Busque preços de {objeto} no PNCP"
5. Testar botão **"Analisar Concorrentes"** → envia ao chat: "Liste os concorrentes conhecidos"

**Resultado esperado:** Dados de mercado + histórico carregados, botões de ação enviam comandos ao chat.

---

## TESTE 9 — Aba IA

1. Clicar na aba **"IA"** (ícone Sparkles)

### 9a. Resumo Gerado pela IA
2. Clicar **"Gerar Resumo"** → aguardar loading → verificar que texto aparece
   - Chama `POST /api/chat` com prompt de resumo
3. Clicar **"Regerar Resumo"** → deve substituir o texto anterior

### 9b. Perguntar à IA
4. Digitar pergunta (ex: "Qual o prazo de entrega?") no campo de texto
5. Clicar **"Perguntar"** → aguardar → verificar resposta no box abaixo

### 9c. Ações Rápidas via IA
6. Testar cada botão rápido (verifica que envia mensagem ao chat):
   - **Requisitos Técnicos** → "Quais são os requisitos técnicos do edital {número}?"
   - **Classificar Edital** → "Classifique este edital: {objeto}"
   - **Gerar Proposta** → "Gere uma proposta do produto {produto} para o edital {número}"
   - **Baixar PDF do Edital** → "Baixe o PDF do edital {número}"
   - **Buscar Itens** → "Busque os itens do edital {número}"

**Resultado esperado:** Resumo e perguntas funcionam via /api/chat, ações rápidas enviam ao chat.

---

## TESTE 10 — Fluxo de Decisão GO/NO-GO

1. Na barra superior, clicar **"Participar"** (verde)
2. Verificar que **modal de justificativa** aparece com:
   - **Motivo** (SelectInput): preço competitivo, portfólio aderente, margem insuficiente, falta documentação, concorrente forte, risco jurídico, fora região, outro
   - **Detalhes** (TextArea)
3. Selecionar motivo + digitar detalhes
4. Clicar **Salvar**
5. Verificar:
   - Badge **"Decisão salva"** aparece no topo (verde)
   - **Status** do edital mudou para "validado" na tabela à esquerda
6. Repetir com **"Acompanhar"** → status deve mudar para "analisando"
7. Repetir com **"Ignorar"** → status deve mudar para "descartado"
8. Verificar que a decisão é **atualizada** (não duplicada) ao mudar de decisão

**Endpoint:** `POST/PUT /api/crud/validacao_decisoes`

**Resultado esperado:** Decisão persiste no banco, status reflete na tabela, modal funcional.

---

## TESTE 11 — Reprocessar Scores

1. Com scores já calculados, clicar novamente **"Calcular Scores IA"**
2. Verificar que os scores são **recalculados** e atualizados
3. Verificar que a decisão IA pode mudar (se o edital tiver dados diferentes)
4. Verificar que os sub-scores técnicos detalhados são recarregados

**Resultado esperado:** Reprocessamento funciona sem erros, valores atualizados.

---

## Resumo dos Endpoints Testados

| Endpoint | Método | Teste |
|----------|--------|-------|
| `/api/editais/salvos` | GET | T1 — Lista de editais |
| `/api/editais/{id}/scores-validacao` | POST | T4, T11 — Calcular/recalcular scores |
| `/api/editais/{id}/documentacao-necessaria` | GET | T6 — Documentação |
| `/api/editais/{id}/extrair-requisitos` | POST | T6e — Extrair requisitos do PDF |
| `/api/crud/editais-itens` | GET | T6a — Itens do edital |
| `/api/crud/validacao_decisoes` | POST/PUT | T10 — Decisão GO/NO-GO |
| `/api/crud/editais` | GET | T8 — Histórico semelhantes |
| `/api/crud/estrategias-editais` | GET | T8 — Estratégias |
| `/api/chat` | POST | T9 — Resumo, perguntas, ações rápidas |
