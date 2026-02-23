# Trabalho em Andamento — facilicita.ia Agent Teams

## Data de Inicio: 17/02/2026

---

## ONDA 1: Infraestrutura de Conexao

### Status: CONCLUIDA (7/7 tasks)

| Task | Agente | Status | Inicio | Fim | Observacoes |
|------|--------|--------|--------|-----|-------------|
| T1 - App.tsx: onSendToChat em todas pages | frontend-bridge-engineer | CONCLUIDO | 17/02 | 17/02 | PageProps em types/index.ts, 20 pages atualizadas |
| T2 - useChat.ts: action_type + resultado | frontend-bridge-engineer | CONCLUIDO | 17/02 | 17/02 | Message com action_type + resultado |
| T5 - Backend: GET /api/dashboard/stats | backend-tools-engineer | CONCLUIDO | 17/02 | 17/02 | endpoint em app.py ~L6935, filtra por user_id |
| T7 - Backend: tool_calcular_aderencia pesos | backend-tools-engineer | CONCLUIDO | 17/02 | 17/02 | helper _get_pesos_score(), defaults se sem config |
| T3 - Dashboard.tsx: dados reais | page-engineer-sprint1 | CONCLUIDO | 17/02 | 17/02 | GET /api/dashboard/stats, setDashboardTokenGetter, refresh manual |
| T4 - EmpresaPage.tsx: CRUD real | page-engineer-sprint1 | CONCLUIDO | 17/02 | 17/02 | CRUD empresas/docs/certidoes/responsaveis, onSendToChat |
| T6 - ParametrizacoesPage.tsx: CRUD real | page-engineer-sprint1 | CONCLUIDO | 17/02 | 17/02 | CRUD parametros-score/fontes-editais, botoes IA |

### Log de Atividades

- **17/02 - Inicio**: Leitura de INSTRUCOES e planejamento. Criacao do time com 3 agentes da Onda 1.
- **17/02 - Agentes lancados**: 3 agentes em paralelo:
  - `frontend-bridge-engineer` → T1 (onSendToChat em 21 pages) + T2 (useChat action_type) — BLOQUEANTES
  - `backend-tools-engineer` → T5 (endpoint dashboard/stats) + T7 (pesos aderencia do banco)
  - `page-engineer-sprint1` → T3 (Dashboard dados reais, apos T5) + T4 (EmpresaPage, apos T1) + T6 (ParametrizacoesPage, apos T1)
- **17/02 - T5 CONCLUIDA**: backend-tools-engineer criou GET /api/dashboard/stats (app.py ~L6935). Retorna total_editais, editais_por_status, propostas, taxa_sucesso, valor_contratado, editais_por_mes, proximos_prazos. Protegido com @require_auth, filtra por user_id.
- **17/02 - T7 CONCLUIDA**: backend-tools-engineer modificou tool_calcular_aderencia para ler pesos de parametros_score. Helper _get_pesos_score(db, user_id) com defaults (peso_tecnico=0.40, limiar_go=70, limiar_nogo=40).
- **17/02 - T1 CONCLUIDA**: frontend-bridge-engineer criou interface PageProps em types/index.ts. 20 pages atualizadas com onSendToChat no App.tsx.
- **17/02 - T2 CONCLUIDA**: frontend-bridge-engineer atualizou Message com action_type e resultado. useChat.ts propaga campos.
- **17/02 - backend-tools-engineer encerrado**: Tasks T5+T7 concluidas.
- **17/02 - frontend-bridge-engineer encerrado**: Tasks T1+T2 concluidas.
- **17/02 - T4 CONCLUIDA**: page-engineer-sprint1 conectou EmpresaPage ao CRUD real (empresas, docs, certidoes, responsaveis). onSendToChat integrado.
- **17/02 - T6 CONCLUIDA**: page-engineer-sprint1 conectou ParametrizacoesPage ao CRUD real (parametros-score, fontes-editais). Botoes IA usando onSendToChat.
- **17/02 - T3 CONCLUIDA**: page-engineer-sprint1 conectou Dashboard ao GET /api/dashboard/stats. setDashboardTokenGetter() no App.tsx. Loading/error states. TypeScript compila sem erros.
- **17/02 - ONDA 1 CONCLUIDA**: 7/7 tasks finalizadas. Todos os agentes encerrados.
- **17/02 - FIX Dashboard.tsx**: Corrigido crash (Cannot read 'captacao'). fetchDashboardStats agora transforma JSON do backend para formato DashboardStats. Adicionado null-safe access em maxFunil.
- **17/02 - FIX ParametrizacoesPage.tsx**: Removidos botoes "Cadastrar via IA" e "Listar via IA" (desnecessarios — ja tem modal CRUD). Botoes IA agora usam handleIaAction() com loading spinner e feedback inline (toast verde/vermelho). Nao jogam mais texto direto no chat.
- **17/02 - FIX EmpresaPage.tsx**: Botao "Alertas IA" renomeado para "Verificar Documentos". Buscar Certidoes agora mostra feedback inline. Ambos com toast de status.
- **17/02 - REDESIGN IA Onda 1**: Redesenhada toda a integracao de IA conforme feedback do usuario:
  - **Problema**: Botoes de IA jogavam texto no chat sem coletar dados. UX pessima.
  - **Analise**: 7 de 8 prompts de IA na Onda 1 NAO TEM backend tool (serao criadas nas Ondas 3/4). Conforme planejamento, EmpresaPage e Docs sao CRUD puro.
  - **Solucao**: Botoes de IA sem tool desabilitados com icone Lock e label "(Em breve)" ou "(Onda 4)". Removidos handleIaAction, iaStatus, iaLoading, buscandoCertidoes. CRUD funciona normalmente.
  - **EmpresaPage.tsx**: "Verificar Documentos" → desabilitado "(Em breve)". "Buscar Certidoes" → desabilitado "(Em breve)". Upload documento usa CRUD puro.
  - **ParametrizacoesPage.tsx**: 5 botoes IA desabilitados: "Gerar com IA (Onda 4)", "Calcular pesos com IA (Onda 4)", "Calcular com IA (Onda 4)", "Gerar do portfolio (Onda 4)", "Sincronizar NCMs (Onda 4)". CRUD de fontes e parametros funciona normalmente.
  - TypeScript compila sem erros.

### Resumo Tecnico Onda 1

**Arquivos modificados:**
- `frontend/src/App.tsx` — onSendToChat passado para 20 pages + setDashboardTokenGetter
- `frontend/src/hooks/useChat.ts` — action_type e resultado na Message
- `frontend/src/types/index.ts` — interface PageProps + campos action_type/resultado na Message
- `frontend/src/components/Dashboard.tsx` — dados reais via /api/dashboard/stats
- `frontend/src/pages/EmpresaPage.tsx` — CRUD real (4 tabelas), botoes IA desabilitados ate Onda 3
- `frontend/src/pages/ParametrizacoesPage.tsx` — CRUD real (2 tabelas), botoes IA desabilitados ate Onda 4
- `backend/app.py` — endpoint GET /api/dashboard/stats (~L6935)
- `backend/tools.py` — tool_calcular_aderencia le pesos de parametros_score

---

## ONDA 2: Captacao + Validacao (funcional completa) + Propostas + Tools Novas

### Status: CONCLUIDA (18/18 tasks — 18/02)

### Correcoes vs plano original (aprendizados da Onda 1 + revisao de requisitos):
- **NAO usar `onSendToChat` para busca de editais** — resultado deve ir para TABELA, nao para chat
- **Criar endpoints REST dedicados** para busca/listagem (performance + UX)
- **Criar tool unificada de scores** (6 dimensoes) em vez de tools separadas
- **Mapear navegacao Captacao → Validacao** (DOC4 pag 6 — ausente no plano original)
- **Separar agentes** Captacao vs Validacao (pages muito complexas para 1 agente)

### Tasks Backend (backend-engineer)

| Task | Agente | Status | Dependencias | Descricao |
|------|--------|--------|-------------|-----------|
| T8 - Endpoint REST GET /api/editais/buscar | backend-engineer | PENDENTE | - | Encapsula tool_buscar_editais_scraper + tool_calcular_score_aderencia. Params: termo, uf, modalidade, calcularScore, incluirEncerrados. Retorna JSON com lista de editais + scores. NAO passa pelo LLM/intent detection. |
| T9 - Endpoint REST GET /api/editais/salvos | backend-engineer | PENDENTE | - | Lista editais do usuario com status, scores, estrategia. Filtros por status, periodo. Usado pela ValidacaoPage. |
| T10 - tool_calcular_scores_validacao (6 dimensoes) | backend-engineer | PENDENTE | - | Tool unificada: recebe edital_id + user_id. Calcula 6 scores (tecnico reutiliza tool_calcular_aderencia, documental=docs empresa vs exigencias edital, complexidade=analise texto via LLM, juridico=clausulas restritivas via LLM, logistico=UF empresa vs local entrega, comercial=valor+historico+margem). Retorna {scores, score_final, decisao_go_nogo}. Adicionar 3 colunas ao model Analise (score_documental, score_juridico, score_logistico). |
| T11 - tool_atualizar_status_proposta | backend-engineer | PENDENTE | - | Workflow rascunho→revisao→enviada→aceita/rejeitada. Atualiza status + data_envio + observacoes. |
| T12 - Endpoint export PDF/DOCX propostas | backend-engineer | PENDENTE | - | Recebe proposta_id, gera PDF (weasyprint/reportlab) ou DOCX (python-docx). Retorna arquivo para download. |

### Tasks CaptacaoPage (captacao-engineer)

| Task | Agente | Status | Dependencias | Descricao |
|------|--------|--------|-------------|-----------|
| T13 - CaptacaoPage: remover mock, busca real via REST | captacao-engineer | PENDENTE | T8 | Remover mockResultados (7 editais hardcoded). handleBuscar chama GET /api/editais/buscar com params (termo, uf, fonte, modalidade, calcularScore, incluirEncerrados). Resultados na TABELA, nao no chat. Loading state. Erro state. |
| T14 - CaptacaoPage: salvar editais via CRUD | captacao-engineer | PENDENTE | T8 | Botoes "Salvar Todos", "Salvar Score >= 70%", "Salvar Selecionados" chamam crudCreate("editais", edital) para cada edital. Feedback toast sucesso/erro. |
| T15 - CaptacaoPage: persistir intencao e margem | captacao-engineer | PENDENTE | - | RadioGroup intencao estrategica + slider margem → crudCreate/crudUpdate("estrategias-editais", {edital_id, decisao, margem_desejada}). Ao selecionar edital, carregar estrategia existente. |
| T16 - CaptacaoPage: navegacao para Validacao | captacao-engineer | PENDENTE | - | Botao "Ver Detalhes" / clique duplo na linha → navigate("/validacao?edital_id={id}"). Ou abrir panel lateral expandido. Conforme DOC4 pag 6. |
| T17 - CaptacaoPage: monitoramento real | captacao-engineer | PENDENTE | - | Card monitoramento → consumir crudList("monitoramentos") ou dados do parametro_score. Mostrar NCMs monitorados e periodicidade real em vez de texto hardcoded. |

### Tasks ValidacaoPage (validacao-engineer)

| Task | Agente | Status | Dependencias | Descricao |
|------|--------|--------|-------------|-----------|
| T18 - ValidacaoPage: remover mock, tabela real | validacao-engineer | PENDENTE | T9 | Remover mockEditais (5 editais hardcoded). useEffect → crudList("editais", {status: filtroAtual}) ou GET /api/editais/salvos. Filtro por status (novo/analisando/validado/descartado). Se URL tem ?edital_id=X, selecionar automaticamente. |
| T19 - ValidacaoPage: scores reais via IA | validacao-engineer | PENDENTE | T10 | Ao selecionar edital, chamar POST /api/chat com "Calcule os scores de validacao do edital {id}" ou endpoint REST dedicado. Preencher as 6 barras de score (tecnico, documental, complexidade, juridico, logistico, comercial) + score geral + potencial de ganho com dados reais. Loading skeleton enquanto calcula. |
| T20 - ValidacaoPage: aba Cognitiva real (resumo + perguntar) | validacao-engineer | PENDENTE | - | "Gerar Resumo" → fetch POST /api/chat com "Resuma o edital {numero}". Renderizar resultado no componente (nao no chat). "Perguntar" → fetch POST /api/chat com pergunta do usuario. Historico de perguntas na aba. |
| T21 - ValidacaoPage: decisao + justificativa persistem | validacao-engineer | PENDENTE | - | Botoes Participar/Acompanhar/Ignorar → crudUpdate("editais", id, {status}) + crudCreate("estrategias-editais", {edital_id, decisao, justificativa, motivo}). Ao reabrir edital, carregar decisao e justificativa anteriores. |
| T22 - ValidacaoPage: aba Objetiva real (aderencia + certificacoes + checklist + lote) | validacao-engineer | PENDENTE | T10 | Aderencia tecnica detalhada: consumir detalhes de tool_calcular_aderencia (AnaliseDetalhe). Certificacoes: crudList("certidoes", {empresa_id}). Checklist documental: comparar docs empresa vs exigencias. Analise de lote: EditalItem com flag aderente/intruso dos scores. |

### Tasks Propostas/Submissao (propostas-engineer)

| Task | Agente | Status | Dependencias | Descricao |
|------|--------|--------|-------------|-----------|
| T23 - PrecificacaoPage: remover mock, conectar ao backend | propostas-engineer | PENDENTE | - | Conectar botoes de recomendacao de preco ao chat (onSendToChat funciona aqui — resultado e texto). Historico de precos via crudList("preco-historico"). |
| T24 - PropostaPage: gerar proposta real | propostas-engineer | PENDENTE | - | Botao "Gerar Proposta" → onSendToChat ou fetch /api/chat com "Gere proposta para edital {X} produto {Y} preco {Z}". Resultado: texto da proposta renderizado na page. Salvar via CRUD. |
| T25 - SubmissaoPage: workflow status real | propostas-engineer | PENDENTE | T11 | Listar propostas via crudList("propostas"). Botoes de transicao de status (rascunho→revisao→enviada). Chamar tool_atualizar_status_proposta via chat ou CRUD. Timeline de status. |

### Resumo da Onda 2

| Grupo | Tasks | Agente | Arquivos |
|-------|-------|--------|----------|
| Backend | T8, T9, T10, T11, T12 | backend-engineer | app.py, tools.py, models.py |
| Captacao | T13, T14, T15, T16, T17 | captacao-engineer | CaptacaoPage.tsx |
| Validacao | T18, T19, T20, T21, T22 | validacao-engineer | ValidacaoPage.tsx |
| Propostas | T23, T24, T25 | propostas-engineer | PrecificacaoPage.tsx, PropostaPage.tsx, SubmissaoPage.tsx |

**Total: 18 tasks, 4 agentes, ~15-20h estimadas**

### Dependencias criticas:
```
T8 (endpoint buscar) ──→ T13 (CaptacaoPage busca real)
T9 (endpoint salvos) ──→ T18 (ValidacaoPage tabela real)
T10 (tool scores)    ──→ T19 (ValidacaoPage scores reais) + T22 (aba Objetiva)
T11 (status proposta)──→ T25 (SubmissaoPage workflow)
```

### Ordem de execucao:
```
PARALELO IMEDIATO (sem dependencia):
  backend-engineer     → T8 + T9 + T10 (endpoints + tool scores)
  captacao-engineer    → T15 + T16 + T17 (persistencia + navegacao + monitoramento)
  validacao-engineer   → T20 + T21 (aba Cognitiva + decisoes — nao precisam de scores)
  propostas-engineer   → T23 + T24 (Precificacao + Proposta)

APOS BACKEND TERMINAR T8/T9/T10:
  captacao-engineer    → T13 + T14 (busca real + salvar)
  validacao-engineer   → T18 + T19 + T22 (tabela + scores + aba Objetiva)
  backend-engineer     → T11 + T12 (status proposta + export)
  propostas-engineer   → T25 (SubmissaoPage — depende T11)
```

### Log de Atividades

- **18/02 - Inicio Onda 2**: Revisao de requisitos UI concluida. Plano original corrigido (REST em vez de onSendToChat, tool unificada de scores, navegacao Captacao→Validacao).
- **18/02 - Time lancado**: 4 agentes em paralelo: backend-engineer, captacao-engineer, validacao-engineer, propostas-engineer.
- **18/02 - propostas-engineer CONCLUIDO**: T23 (PrecificacaoPage), T24 (PropostaPage), T25 (SubmissaoPage) — todas conectadas ao CRUD real. TypeScript limpo.
- **18/02 - validacao-engineer fase 1**: T20 (aba Cognitiva — resumo/perguntar via POST /api/chat), T21 (decisao/justificativa persistem via CRUD).
- **18/02 - backend-engineer CONCLUIDO**: T8 (GET /api/editais/buscar), T9 (GET /api/editais/salvos), T10 (tool_calcular_scores_validacao 6 dimensoes + GO/NO-GO), T11 (tool_atualizar_status_proposta), T12 (export PDF/DOCX). 5 endpoints + 2 tools novas. Testados com curl.
- **18/02 - captacao-engineer CONCLUIDO**: T13 (busca real REST), T14 (salvar editais CRUD), T15 (persistir intencao/margem), T16 (navegacao→Validacao via CustomEvent), T17 (monitoramento real). Mock removido.
- **18/02 - FIX App.tsx**: Adicionado listener para CustomEvent 'navigate-to' (navegacao Captacao→Validacao).
- **18/02 - validacao-engineer fase 2 CONCLUIDO**: T18 (tabela real — GET /api/editais/salvos, mock removido), T19 (scores reais — POST /api/editais/{id}/scores-validacao), T22 (aba Objetiva real — GO/NO-GO banner, sub-scores, certificacoes, checklist, lote).
- **18/02 - ONDA 2 CONCLUIDA**: 18/18 tasks finalizadas. Todos os agentes encerrados. TypeScript compila sem erros.

### Resumo Tecnico Onda 2

**Arquivos modificados (28 arquivos, +2948/-962 linhas):**

Backend:
- `backend/app.py` — 5 endpoints novos: /api/editais/buscar, /api/editais/salvos, /api/editais/{id}/scores-validacao, /api/propostas/{id}/status, /api/propostas/{id}/export
- `backend/tools.py` — 2 tools novas: tool_calcular_scores_validacao (6 dimensoes), tool_atualizar_status_proposta

Frontend:
- `frontend/src/App.tsx` — listener navigate-to para navegacao entre pages
- `frontend/src/pages/CaptacaoPage.tsx` — busca real REST, salvar CRUD, persistir estrategia, navegacao, monitoramento. Mock removido.
- `frontend/src/pages/ValidacaoPage.tsx` — tabela real, 6 scores IA, aba Cognitiva (resumo/perguntar), decisao/justificativa, aba Objetiva. Mock removido.
- `frontend/src/pages/PrecificacaoPage.tsx` — historico CRUD, recomendacao IA
- `frontend/src/pages/PropostaPage.tsx` — CRUD propostas, gerar via IA, export
- `frontend/src/pages/SubmissaoPage.tsx` — workflow status, checklist, upload

---
