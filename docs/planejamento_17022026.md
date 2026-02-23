# Planejamento Definitivo — facilicita.ia

**Data:** 17/02/2026
**Versao:** 4.0 — Agent Teams + Mapeamento completo UI ↔ IA ↔ Backend
**Base:** Inventario real (49 tools, 48 handlers, 210+ prompts) + auditoria de cada botao em cada page
**Execucao:** Claude Code Agent Teams (8 agentes em paralelo)

---

## 1. Arquitetura de Integracao UI ↔ Chat ↔ Backend

### 1.1 Padrao de Referencia: PortfolioPage (unica page funcional)

```
Botao na Page  →  onSendToChat(mensagem, arquivo?)  →  POST /api/chat  →  detectar_intencao_ia()
                                                                               ↓
                  ChatArea renderiza resposta  ←  processar_XXX()  ←  tool_XXX()
                                                                               ↓
                  Page faz setTimeout + refetch  →  REST/CRUD API  →  dados atualizados
```

**Exemplo concreto:**
- Botao "Reprocessar" na PortfolioPage → `onSendToChat("Reprocesse as especificacoes do produto Monitor LG")` → intent `reprocessar_produto` → `processar_reprocessar_produto()` → `tool_reprocessar_produto()` → resposta no chat → `setTimeout(() => fetchProdutos(), 3000)`

### 1.2 O Que Falta em TODAS as Outras Pages

| Camada | Status | O que fazer |
|--------|--------|-------------|
| **Camada 1: Dados** | 18 pages com mockXXX hardcoded | Substituir por chamadas REST/CRUD |
| **Camada 2: Ponte Chat** | So PortfolioPage tem `onSendToChat` | Adicionar prop em todas as pages |
| **Camada 3: Acoes IA** | Botoes fazem setState local | Mapear para `onSendToChat` com mensagens que disparam tools |
| **Camada 4: Resultado** | useChat ignora action_type/resultado | Processar resultado para atualizar page |

### 1.3 Modificacao Necessaria no App.tsx

Passar `onSendToChat={handleSendToChat}` para TODAS as pages, nao so PortfolioPage:

```typescript
// ATUAL: so PortfolioPage recebe
<PortfolioPage onSendToChat={handleSendToChat} />

// NECESSARIO: todas recebem
<CaptacaoPage onSendToChat={handleSendToChat} />
<ValidacaoPage onSendToChat={handleSendToChat} />
// ... etc
```

### 1.4 Modificacao Necessaria no useChat.ts

Processar `action_type` e `resultado` da resposta:

```typescript
// ATUAL: ignora action_type e resultado
const assistantMsg: Message = { role: "assistant", content: response.response, sources: response.sources };

// NECESSARIO: propagar para a page
const assistantMsg: Message = {
  role: "assistant",
  content: response.response,
  sources: response.sources,
  action_type: response.action_type,
  resultado: response.resultado,
};
```

---

## 2. Inventario Backend (Resumo)

### 49 Tools Funcionais

| Categoria | Qtd | Tools |
|-----------|-----|-------|
| Captacao/Busca | 7 | tool_web_search, tool_buscar_editais_scraper, tool_buscar_links_editais, tool_cadastrar_fonte, tool_listar_fontes, tool_buscar_editais_fonte, tool_buscar_atas_pncp |
| Documentos/PDFs | 7 | tool_download_arquivo, tool_processar_upload, tool_extrair_especificacoes, tool_reprocessar_produto, tool_extrair_ata_pdf, tool_baixar_ata_pncp, tool_extrair_datas_edital |
| Produtos | 4 | tool_atualizar_produto, tool_excluir_produto, tool_listar_produtos, tool_verificar_completude_produto |
| Editais | 7 | tool_atualizar_edital, tool_excluir_edital, tool_excluir_editais_multiplos, tool_listar_editais, tool_extrair_requisitos, tool_classificar_edital, tool_salvar_editais_selecionados |
| PNCP Detalhes | 3 | tool_buscar_itens_edital_pncp, tool_buscar_arquivos_edital_pncp, tool_baixar_pdf_pncp |
| Precos/Mercado | 5 | tool_buscar_precos_pncp, tool_historico_precos, tool_recomendar_preco, tool_listar_concorrentes, tool_analisar_concorrente |
| Analise/Proposta | 3 | tool_calcular_aderencia, tool_calcular_score_aderencia, tool_gerar_proposta |
| Resultados | 2 | tool_registrar_resultado, tool_consulta_mindsdb |
| Alertas/Monitoramento | 8 | tool_configurar_alertas, tool_listar_alertas, tool_cancelar_alerta, tool_dashboard_prazos, tool_calendario_editais, tool_configurar_monitoramento, tool_listar_monitoramentos, tool_desativar_monitoramento |
| Notificacoes | 3 | tool_configurar_preferencias_notificacao, tool_historico_notificacoes, tool_marcar_notificacao_lida |

### 210+ Prompts de Chat em 18 Categorias — TODOS conectados a tools

### 48 Handlers + 54 Intents — TODOS funcionais

---

## 3. AGENT TEAMS — Estrutura do Time

### 3.1 Composicao (8 agentes + 1 coordenador)

| # | Agente | Modelo | Responsabilidade |
|---|--------|--------|-----------------|
| 1 | **team-lead** | Opus | Coordenacao, git, verificacao, resolucao de conflitos |
| 2 | **frontend-bridge-engineer** | Sonnet | App.tsx (onSendToChat em todas pages) + useChat.ts (action_type) + types/ |
| 3 | **page-engineer-sprint1** | Sonnet | Dashboard, EmpresaPage, ParametrizacoesPage |
| 4 | **page-engineer-sprint2** | Sonnet | CaptacaoPage, ValidacaoPage |
| 5 | **page-engineer-sprint3-6** | Sonnet | PrecificacaoPage, PropostaPage, SubmissaoPage, ImpugnacaoPage, FollowupPage, ProducaoPage, ContratadoRealizadoPage, CRMPage, PerdasPage, ConcorrenciaPage |
| 6 | **page-engineer-sprint7-10** | Sonnet | FlagsPage, MonitoriaPage, MercadoPage, LancesPage, AtasPage (nova), AnalyticsPage (nova), Sidebar.tsx |
| 7 | **backend-tools-engineer** | Sonnet | 13 tools novas + endpoints de dashboard + intents + handlers |
| 8 | **backend-infra-engineer** | Sonnet | Export PDF/DOCX, middleware auditoria, disclaimers, email SMTP, /api/health |
| 9 | **qa-engineer** | Sonnet | Testes para todas as funcionalidades |

### 3.2 Ownership de Arquivos (EXCLUSIVO — sem conflitos)

| Agente | Arquivos |
|--------|----------|
| frontend-bridge-engineer | `frontend/src/App.tsx`, `frontend/src/hooks/useChat.ts`, `frontend/src/types/` |
| page-engineer-sprint1 | `frontend/src/components/Dashboard.tsx`, `frontend/src/pages/EmpresaPage.tsx`, `frontend/src/pages/ParametrizacoesPage.tsx` |
| page-engineer-sprint2 | `frontend/src/pages/CaptacaoPage.tsx`, `frontend/src/pages/ValidacaoPage.tsx` |
| page-engineer-sprint3-6 | `frontend/src/pages/{Precificacao,Proposta,Submissao,Impugnacao,Followup,Producao,ContratadoRealizado,CRM,Perdas,Concorrencia}Page.tsx` |
| page-engineer-sprint7-10 | `frontend/src/pages/{Flags,Monitoria,Mercado,Lances}Page.tsx`, `AtasPage.tsx` (nova), `AnalyticsPage.tsx` (nova), `frontend/src/components/Sidebar.tsx` |
| backend-tools-engineer | `backend/tools.py`, `backend/app.py` (handlers/intents/endpoints dashboard) |
| backend-infra-engineer | `backend/app.py` (export/health/middleware), `backend/crud_routes.py`, `backend/gerador_documentos.py` |
| qa-engineer | `backend/tests/` (todo o diretorio) |

**CUIDADO**: backend-tools-engineer e backend-infra-engineer ambos modificam `backend/app.py`. O team-lead coordena para que NAO trabalhem no mesmo trecho simultaneamente.

---

## 4. PLANO DE EXECUCAO — 4 Ondas (52 Tasks)

### Aceleracao com Agent Teams

| Aspecto | Plano v3.0 (humano sequencial) | Plano v4.0 (Agent Teams) |
|---------|-------------------------------|--------------------------|
| Duracao total | 10 sprints (70 dias) | 4 ondas (~3-4 dias uteis) |
| Agentes simultaneos | 1 humano | Ate 6 agentes IA em paralelo |
| Tasks paralelas | 1-2 por sprint | 5-7 por onda |
| Bloqueador critico | T1+T2 (1 semana humano) | T1+T2 (~15 minutos, agente dedicado) |
| Uma page completa | 3-5 dias humano | 1-2 horas agente |
| Uma tool nova | 2-3 dias humano | 30-60 minutos agente |
| 13 tools novas | Espalhadas em 8 sprints | Concentradas no backend-tools-engineer, todas em ~8-10 horas |
| 18 pages | 1 page por sprint | 4-6 pages em paralelo por onda |

**Estimativa de aceleracao: ~20x mais rapido** — agentes IA executam em minutos o que um humano faz em dias. Nao param para debug de IDE, reunioes, context switching, nem almoco. O gargalo real sao apenas as dependencias entre tasks.

### Calibragem de Tempo por Tipo de Task (agente IA)

| Tipo de Task | Tempo Estimado | Exemplos |
|-------------|---------------|----------|
| Prop drilling trivial | ~15 min | T1 (onSendToChat em 21 pages), T2 (2 campos no useChat) |
| Page simples (CRUD puro, sem IA) | ~30-60 min | T27 (ProducaoPage), T30 (CRMPage), T4 (EmpresaPage) |
| Page media (CRUD + 2-3 botoes IA) | ~1-2h | T8 (CaptacaoPage), T10 (ValidacaoPage), T35 (FlagsPage) |
| Page complexa (muitos botoes, modais, estados) | ~2-3h | T15 (PropostaPage), T21 (ImpugnacaoPage) |
| Page nova (criar do zero) | ~2-3h | T26 (AtasPage), T45 (AnalyticsPage) |
| Endpoint REST simples | ~15-30 min | T5 (dashboard stats), T29 (contratado-realizado) |
| Tool nova (LLM + DB) | ~30-60 min | T11 (score documental), T19 (impugnacao), T49 (lances) |
| Infra/middleware | ~30-60 min | T37 (auditoria), T18 (export PDF), T51 (/api/health) |

---

### ONDA 1: Infraestrutura de Conexao (~4-6 horas)
**Objetivo**: Habilitar ponte chat em todas as pages + primeiras pages com dados reais.
**Agentes ativos**: frontend-bridge-engineer, page-engineer-sprint1, backend-tools-engineer
**Paralelismo**: 3 agentes trabalhando simultaneamente

| ID | Task | Agente | Bloqueia | Bloqueado Por | RF |
|----|------|--------|----------|---------------|-----|
| T1 | App.tsx: Passar onSendToChat para TODAS as 21 pages | frontend-bridge-engineer | T4,T6,T8-T52 | — | RF-028 |
| T2 | useChat.ts: Processar action_type e resultado na Message | frontend-bridge-engineer | T4,T6,T8-T52 | — | RF-028 |
| T3 | Dashboard.tsx: Remover mock, consumir GET /api/dashboard/stats | page-engineer-sprint1 | — | T5 | RF-028 |
| T4 | EmpresaPage.tsx: Conectar ao CRUD empresas + docs + certidoes + responsaveis | page-engineer-sprint1 | — | T1 | RF-001,002,003 |
| T5 | Backend: Criar endpoint GET /api/dashboard/stats | backend-tools-engineer | T3 | — | RF-028 |
| T6 | ParametrizacoesPage.tsx: Conectar ao CRUD parametros-score + fontes-editais | page-engineer-sprint1 | — | T1 | RF-008,009 |
| T7 | Backend: tool_calcular_aderencia le pesos de ParametroScore do banco | backend-tools-engineer | — | — | RF-009 |

**Fluxo paralelo Onda 1:**
```
HORA 0-0.5 (30 min):
  frontend-bridge-engineer → T1 (App.tsx ~15min) + T2 (useChat.ts ~15min)  [BLOQUEANTE — libera TUDO]
  backend-tools-engineer   → T5 (dashboard endpoint ~30min) + T7 (pesos score ~30min)

HORA 0.5-4 (apos T1+T2 prontos):
  page-engineer-sprint1    → T3 (Dashboard ~1h) + T4 (EmpresaPage ~2h) + T6 (ParametrizacoesPage ~1h)
  [Onda 2 ja pode comecar em paralelo]
```

**Entregavel Onda 1:** Ponte onSendToChat em todas as pages. Dashboard, Empresa, Parametrizacoes com dados reais.

---

### ONDA 2: Captacao + Validacao + Propostas + Primeiras Tools Novas (~6-10 horas)
**Agentes ativos**: page-engineer-sprint2, page-engineer-sprint3-6, backend-tools-engineer, backend-infra-engineer
**Paralelismo**: 4 agentes trabalhando simultaneamente
**Comeca**: Assim que T1+T2 terminam (~30 min apos inicio)

| ID | Task | Agente | Bloqueia | Bloqueado Por | RF |
|----|------|--------|----------|---------------|-----|
| T8 | CaptacaoPage: Remover mock, busca via onSendToChat, salvar via chat | page-engineer-sprint2 | — | T1 | RF-010 |
| T9 | CaptacaoPage: Coluna estrategia go/nogo com CRUD estrategias-editais | page-engineer-sprint2 | — | T1,T13 | RF-037 |
| T10 | ValidacaoPage: Remover mock, botoes via onSendToChat, decisoes via CRUD | page-engineer-sprint2 | — | T1 | RF-011 |
| T11 | Backend: tool_calcular_score_documental | backend-tools-engineer | — | — | RF-011 |
| T12 | Backend: tool_calcular_score_juridico | backend-tools-engineer | — | — | RF-011 |
| T13 | Backend: decision_engine_go_nogo (scores + ParametroScore) | backend-tools-engineer | T9 | T11,T12 | RF-037 |
| T14 | PrecificacaoPage: Remover mock, botoes via onSendToChat | page-engineer-sprint3-6 | — | T1 | RF-013 |
| T15 | PropostaPage: Remover mock, gerar proposta via onSendToChat | page-engineer-sprint3-6 | — | T1 | RF-014 |
| T16 | SubmissaoPage: Remover mock, workflow de status via onSendToChat | page-engineer-sprint3-6 | — | T1,T17 | RF-015 |
| T17 | Backend: tool_atualizar_status_proposta (workflow rascunho→enviada) | backend-tools-engineer | T16 | — | RF-015 |
| T18 | Backend: Endpoint export PDF/DOCX para propostas | backend-infra-engineer | — | — | RF-014 |

**Fluxo paralelo Onda 2:**
```
HORA 1-4 (4 agentes em paralelo):
  page-engineer-sprint2    → T8 (CaptacaoPage ~2h) + T10 (ValidacaoPage ~2h)
  page-engineer-sprint3-6  → T14 (PrecificacaoPage ~1h) + T15 (PropostaPage ~2h)
  backend-tools-engineer   → T11 (score documental ~45min) + T12 (score juridico ~45min) + T17 (status proposta ~30min)
  backend-infra-engineer   → T18 (export PDF/DOCX ~2h)

HORA 4-8 (tasks dependentes):
  page-engineer-sprint2    → T9 (estrategia go/nogo — depende T13)
  page-engineer-sprint3-6  → T16 (SubmissaoPage — depende T17)
  backend-tools-engineer   → T13 (decision engine — depende T11+T12, ~1h)

HORA 8-10:
  team-lead                → Revisao e integracao
```

---

### ONDA 3: Juridico + Follow-up + CRM + Alertas + Monitoria (~8-12 horas)
**Agentes ativos**: page-engineer-sprint3-6, page-engineer-sprint7-10, backend-tools-engineer, backend-infra-engineer
**Paralelismo**: 4-5 agentes simultaneos (MAIS tasks em paralelo — a onda mais pesada)
**Comeca**: Assim que Onda 2 libera as tasks sem dependencia (muitas tasks so dependem de T1)

| ID | Task | Agente | Bloqueia | Bloqueado Por | RF |
|----|------|--------|----------|---------------|-----|
| T19 | Backend: tool_gerar_impugnacao (Lei 14.133/2021) | backend-tools-engineer | T21 | — | RF-012 |
| T20 | Backend: tool_gerar_recurso + tool_gerar_contra_razoes | backend-tools-engineer | T21 | — | RF-018 |
| T21 | ImpugnacaoPage: Remover mock, gerar textos via onSendToChat | page-engineer-sprint3-6 | — | T1,T19,T20 | RF-012,018 |
| T22 | Backend: Disclaimers juridicos automaticos | backend-infra-engineer | — | T19 | RF-032 |
| T23 | Frontend: Componente DisclaimerJuridico | page-engineer-sprint3-6 | — | T22 | RF-032 |
| T24 | FollowupPage: Remover mock, registrar resultado via onSendToChat | page-engineer-sprint3-6 | — | T1 | RF-017 |
| T25 | Backend: tool_calcular_score_logistico | backend-tools-engineer | — | — | RF-011 |
| T26 | AtasPage: CRIAR page nova, 3 botoes via onSendToChat | page-engineer-sprint7-10 | — | T1 | RF-035 |
| T27 | ProducaoPage: Remover mock, CRUD contratos + entregas | page-engineer-sprint3-6 | — | T1 | RF-020 |
| T28 | ContratadoRealizadoPage: Remover mock, endpoint dashboard | page-engineer-sprint3-6 | — | T29 | RF-021 |
| T29 | Backend: Endpoint GET /api/dashboard/contratado-realizado | backend-tools-engineer | T28 | — | RF-021 |
| T30 | CRMPage: Remover mock, CRUD leads-crm + acoes-pos-perda | page-engineer-sprint3-6 | — | T1 | RF-019 |
| T31 | PerdasPage: Remover mock, endpoint dashboard | page-engineer-sprint3-6 | — | T32 | RF-026 |
| T32 | Backend: Endpoint GET /api/dashboard/perdas | backend-tools-engineer | T31 | — | RF-026 |
| T33 | Backend: Ao registrar derrota, criar lead CRM automatico | backend-infra-engineer | — | — | RF-019,026 |
| T34 | ConcorrenciaPage: Remover mock, analise via onSendToChat | page-engineer-sprint3-6 | — | T1 | RF-024 |
| T35 | FlagsPage: Remover mock, alertas via onSendToChat | page-engineer-sprint7-10 | — | T1 | RF-022,039 |
| T36 | MonitoriaPage: Remover mock, monitoramentos via onSendToChat | page-engineer-sprint7-10 | — | T1 | RF-023 |
| T37 | Backend: Middleware auditoria no crud_routes.py | backend-infra-engineer | — | — | RF-030 |
| T38 | Backend: tool_analisar_documentos_empresa | backend-tools-engineer | — | — | RF-004 |
| T39 | Backend: tool_verificar_pendencias_pncp | backend-tools-engineer | — | — | RF-031 |
| T40 | Backend: Configurar SMTP producao + emails reais no scheduler | backend-infra-engineer | — | — | RF-039 |

**Fluxo paralelo Onda 3:**
```
HORA 1-5 (5 agentes em paralelo — muitas tasks so dependem de T1 que ja esta pronto):
  backend-tools-engineer   → T19 (impugnacao ~1h) + T20 (recurso ~1h) + T25 (score logistico ~45min)
  backend-infra-engineer   → T22 (disclaimers ~30min) + T33 (lead auto ~30min) + T37 (middleware auditoria ~1h)
  page-engineer-sprint3-6  → T24 (FollowupPage ~1h) + T27 (ProducaoPage ~1h) + T30 (CRMPage ~1h) + T34 (ConcorrenciaPage ~30min)
  page-engineer-sprint7-10 → T26 (AtasPage nova ~2h) + T35 (FlagsPage ~1h) + T36 (MonitoriaPage ~1h)
  page-engineer-sprint1    → [livre — pode ajudar com revisao]

HORA 5-9 (tasks dependentes):
  backend-tools-engineer   → T29 (dashboard contratado ~30min) + T32 (dashboard perdas ~30min) + T38 (docs empresa ~1h) + T39 (pendencias PNCP ~45min)
  backend-infra-engineer   → T40 (SMTP ~1h)
  page-engineer-sprint3-6  → T21 (ImpugnacaoPage ~2h — depende T19+T20) + T23 (DisclaimerJuridico ~30min — depende T22)
  page-engineer-sprint3-6  → T28 (ContratadoRealizadoPage ~1h — depende T29) + T31 (PerdasPage ~1h — depende T32)

HORA 10-12:
  team-lead                → Revisao e integracao
```

---

### ONDA 4: Analytics + Mercado + Lances + QA (~6-10 horas)
**Agentes ativos**: page-engineer-sprint7-10, backend-tools-engineer, backend-infra-engineer, qa-engineer
**Paralelismo**: 4 agentes + QA comeca em paralelo nos modulos prontos

| ID | Task | Agente | Bloqueia | Bloqueado Por | RF |
|----|------|--------|----------|---------------|-----|
| T41 | Backend: tool_calcular_tam_sam_som | backend-tools-engineer | T43 | — | RF-025 |
| T42 | Backend: tool_detectar_itens_intrusos | backend-tools-engineer | — | — | RF-038 |
| T43 | MercadoPage: Remover mock, TAM/SAM/SOM via onSendToChat | page-engineer-sprint7-10 | — | T1,T41 | RF-025 |
| T44 | Backend: Pipeline aprendizado (resultado → delta → feedback) | backend-infra-engineer | — | — | RF-029 |
| T45 | AnalyticsPage: CRIAR page nova, cards + consulta MindsDB | page-engineer-sprint7-10 | — | T1 | RF-034 |
| T46 | CaptacaoPage aba Dispensas: Filtrar dispensas via CRUD | page-engineer-sprint2 | — | — | RF-027 |
| T47 | ParametrizacoesPage aba Classes: CRUD + gerar com IA | page-engineer-sprint1 | — | T48 | RF-006 |
| T48 | Backend: tool_gerar_classes_portfolio + tool_aplicar_mascara_descricao | backend-tools-engineer | T47 | — | RF-006,007 |
| T49 | Backend: tool_simular_lance + tool_sugerir_lance | backend-tools-engineer | T50 | — | RF-016 |
| T50 | LancesPage: Remover mock, simular e sugerir via onSendToChat | page-engineer-sprint7-10 | — | T1,T49 | RF-016 |
| T51 | Backend: /api/health + logging estruturado | backend-infra-engineer | — | — | RNF-003 |
| T52 | QA: Testes end-to-end completos (todos os modulos) | qa-engineer | — | T1-T51 | Todos |

**Fluxo paralelo Onda 4:**
```
HORA 1-4 (4 agentes + QA nos modulos prontos):
  backend-tools-engineer   → T41 (TAM/SAM/SOM ~1h) + T42 (itens intrusos ~45min) + T48 (classes portfolio ~1h) + T49 (lances ~1h)
  backend-infra-engineer   → T44 (pipeline aprendizado ~2h) + T51 (/api/health ~30min)
  page-engineer-sprint7-10 → T45 (AnalyticsPage nova ~2h) + T43 (MercadoPage ~1h — depende T41)
  page-engineer-sprint2    → T46 (Dispensas ~1h)
  qa-engineer              → Testes das Ondas 1-2 (~2h)

HORA 4-7 (tasks dependentes):
  page-engineer-sprint1    → T47 (Classes ~1h — depende T48)
  page-engineer-sprint7-10 → T50 (LancesPage ~1h — depende T49)
  qa-engineer              → Testes Onda 3 (~2h)

HORA 7-10:
  qa-engineer              → T52 (testes E2E completos ~3h)
  team-lead                → Revisao final, merge, resolucao de conflitos
```

---

## 5. MAPEAMENTO COMPLETO: UI ↔ IA por Requisito Funcional

### Convencoes

- **[CHAT]** = Funcao ja existe como prompt no chat (tool + handler + intent prontos)
- **[CRUD]** = Dados via CRUD generico (/api/crud/tabela)
- **[REST]** = Endpoint REST dedicado (existente ou a criar)
- **[NOVO]** = Tool/handler/intent a criar
- **[PAGE]** = Modificacao na page frontend

---

### RF-001 — Cadastro da Empresa

**Status:** CRUD OK, Page mock
**Page:** EmpresaPage.tsx | **Agente:** page-engineer-sprint1 | **Onda:** 1
**Fonte de dados:** CRUD empresas + empresa-documentos + empresa-certidoes + empresa-responsaveis

| Botao na UI | Acao Atual (Mock) | Implementacao |
|-------------|-------------------|---------------|
| Salvar Alteracoes | setState local | [CRUD] `crudUpdate("empresas", id, data)` |
| Upload Documento | Modal vazio | [CRUD] `crudCreate("empresa-documentos", {empresa_id, ...})` + upload file |
| Visualizar/Download doc | onClick vazio | [REST] `/uploads/{path}` |
| Excluir documento | onClick vazio | [CRUD] `crudDelete("empresa-documentos", id)` |
| Adicionar responsavel | Modal vazio | [CRUD] `crudCreate("empresa-responsaveis", {...})` |
| Editar/Excluir responsavel | onClick vazio | [CRUD] `crudUpdate/crudDelete` |

**IA na page:** Nenhuma acao de IA necessaria. CRUD puro.

---

### RF-002 — Documentos Habilitativos

**Status:** CRUD OK, Page mock (aba dentro de EmpresaPage)
**Page:** EmpresaPage.tsx | **Agente:** page-engineer-sprint1 | **Onda:** 1
**Fonte de dados:** CRUD empresa-documentos

| Botao na UI | Implementacao |
|-------------|---------------|
| Upload documento | [CRUD] + upload file |
| Listar documentos | [CRUD] `crudList("empresa-documentos", {parent_id: empresa_id})` |

**IA na page:** Nenhuma.

---

### RF-003 — Certidoes Automaticas

**Status:** CRUD OK, sem automacao
**Page:** EmpresaPage.tsx (aba Certidoes) | **Agente:** page-engineer-sprint1 (CRUD) + backend-tools-engineer (tool) | **Onda:** 1 (CRUD) + 3 (tool)

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Buscar Certidoes Agora | setState 2s | [NOVO] `onSendToChat("Busque as certidoes atualizadas da empresa {razao_social}, CNPJ {cnpj}")` |
| Renovar certidao | onClick vazio | [NOVO] `onSendToChat("Renove a certidao {tipo} da empresa {razao_social}")` |
| Visualizar/Download | onClick vazio | [REST] `/uploads/{path}` |

**IA necessaria:**
- [NOVO] tool_buscar_certidoes_empresa — Consulta portais (CND Federal, FGTS, Trabalhista) via web scraping
- [NOVO] intent `buscar_certidoes` + handler `processar_buscar_certidoes`

---

### RF-004 — Alertas IA sobre Documentos

**Status:** NAO IMPLEMENTADO
**Page:** EmpresaPage.tsx (secao alertas) | **Agente:** backend-tools-engineer | **Onda:** 3 (T38)

| Botao na UI | Implementacao |
|-------------|---------------|
| (automatico ao abrir page) | [NOVO] `onSendToChat("Analise os documentos da empresa {razao_social} e verifique coerencia e validade")` |
| Card de alerta com acao sugerida | Exibir resultado da tool no card |

**IA necessaria:**
- [NOVO] tool_analisar_documentos_empresa (T38) — LLM verifica coerencia entre docs, datas vencimento, lacunas

---

### RF-005 — Portfolio de Produtos — COMPLETO (referencia)

**Page:** PortfolioPage.tsx (ja funcional)

| Botao na UI | onSendToChat ja implementado |
|-------------|------------------------------|
| Upload PDF | `onSendToChat("Cadastre este produto a partir do manual", file)` |
| Upload website | `onSendToChat("Busque produtos no website {url} e cadastre")` |
| Busca web | `onSendToChat("Busque o manual do produto {nome} na web e cadastre")` |
| Cadastro manual | `onSendToChat("Cadastre manualmente o produto: Nome=..., Fabricante=...")` |
| Reprocessar | `onSendToChat("Reprocesse as especificacoes do produto {nome}")` |
| Excluir | `onSendToChat("Exclua o produto {nome}")` |
| Verificar completude | `onSendToChat("Verifique a completude do produto {nome}")` |

---

### RF-006 — Classes/Subclasses de Produto

**Status:** PARCIAL (enum basico)
**Page:** ParametrizacoesPage.tsx (aba Classes) | **Agente:** page-engineer-sprint1 (T47) + backend-tools-engineer (T48) | **Onda:** 4

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Nova Classe | Modal local | [CRUD] `crudCreate("classe-produto", {...})` |
| Gerar com IA | Mock 2s | [NOVO] `onSendToChat("Gere classes de produto baseadas no meu portfolio")` |
| Adicionar Subclasse | Modal local | [CRUD] `crudCreate("campo-classe", {...})` |
| Editar/Excluir | onClick vazio | [CRUD] |

**IA necessaria:**
- [NOVO] tool_gerar_classes_portfolio (T48)

---

### RF-007 — Mascara de Descricao

**Status:** NAO IMPLEMENTADO
**Page:** ParametrizacoesPage.tsx + PropostaPage | **Agente:** backend-tools-engineer (T48) | **Onda:** 4

| Botao na UI | Implementacao |
|-------------|---------------|
| Configurar mascara por classe | [NOVO] Campo template no CRUD campo-classe |
| Aplicar mascara ao gerar proposta | [NOVO] tool_gerar_proposta usa template da classe |
| Preview mascara | [PAGE] Renderizar preview com dados do produto |

**IA necessaria:**
- [NOVO] tool_aplicar_mascara_descricao (T48)

---

### RF-008 — Fontes de Editais — COMPLETO

**Page:** ParametrizacoesPage.tsx (aba Fontes) | **Agente:** page-engineer-sprint1 | **Onda:** 1 (T6)
**IA:** [CHAT] tool_cadastrar_fonte + tool_listar_fontes ja existem.

---

### RF-009 — Parametros de Score

**Status:** CRUD OK, sem integracao
**Page:** ParametrizacoesPage.tsx (aba Parametros) | **Agente:** page-engineer-sprint1 (T6) + backend-tools-engineer (T7) | **Onda:** 1

| Botao na UI | Implementacao |
|-------------|---------------|
| Salvar pesos | [CRUD] `crudUpdate("parametros-score", id, {peso_tecnico, ...})` |
| Salvar limiares | [CRUD] junto com pesos |

**IA:** tool_calcular_aderencia deve ler ParametroScore do banco (T7).

---

### RF-010 — Captacao de Editais

**Status:** BACKEND COMPLETO, Page mock
**Page:** CaptacaoPage.tsx | **Agente:** page-engineer-sprint2 (T8,T9) | **Onda:** 2

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Buscar Editais | Filtra mock 1.5s | [CHAT] `onSendToChat("Busque editais de {termo} no PNCP")` |
| Salvar Todos | console.log | [CHAT] `onSendToChat("Salvar todos os editais")` |
| Salvar Score >= 70% | console.log | [CHAT] `onSendToChat("Salvar editais recomendados")` |
| Salvar edital individual | console.log | [CHAT] `onSendToChat("Salvar edital {numero}")` |
| Salvar Selecionados | onClick vazio | [CHAT] `onSendToChat("Salvar editais {numeros}")` |
| Exportar CSV | onClick vazio | [NOVO] Gerar CSV no frontend a partir dos dados |
| Configurar Monitoria | onClick vazio | [CHAT] `onSendToChat("Monitore editais de {termo}")` |

**IA ja existente (7 tools):** tool_buscar_editais_scraper, tool_buscar_links_editais, tool_buscar_editais_fonte, tool_salvar_editais_selecionados, tool_calcular_score_aderencia, tool_buscar_itens_edital_pncp, tool_buscar_arquivos_edital_pncp
**Prompts ja existentes (34)**

---

### RF-011 — Validacao/Analise Multi-dimensional

**Status:** BACKEND PARCIAL (4 de 7 scores), Page mock
**Page:** ValidacaoPage.tsx | **Agente:** page-engineer-sprint2 (T10) + backend-tools-engineer (T11,T12,T25) | **Onda:** 2 (page + 2 scores) + 3 (score logistico)

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Gerar Resumo | Mock 2s | [CHAT] `onSendToChat("Resuma o edital {numero}")` |
| Perguntar ao edital | Mock resposta | [CHAT] `onSendToChat("O edital {numero} exige {pergunta}?")` |
| Baixar PDF | Abre URL | [CHAT] `onSendToChat("Baixe o PDF do edital {numero}")` |
| Participar | setState | [CRUD] `crudUpdate("editais", id, {status: "participando"})` + [CRUD] `crudCreate("estrategias-editais", {decisao: "go"})` |
| Acompanhar | setState | [CRUD] `crudUpdate("editais", id, {status: "analisando"})` + [CRUD] `crudCreate("estrategias-editais", {decisao: "acompanhar"})` |
| Ignorar | setState | [CRUD] `crudUpdate("editais", id, {status: "desistido"})` + [CRUD] `crudCreate("estrategias-editais", {decisao: "nogo"})` |
| Calcular Aderencia | (nao existe) | [CHAT] `onSendToChat("Calcule a aderencia do produto {produto} ao edital {numero}")` |

**Scores:**

| Score | Status | Tool | Task |
|-------|--------|------|------|
| Tecnico (aderencia) | [CHAT] Existe | tool_calcular_aderencia | — |
| Comercial (preco) | [CHAT] Existe | tool_recomendar_preco | — |
| Documental | [NOVO] | tool_calcular_score_documental | T11 |
| Juridico | [NOVO] | tool_calcular_score_juridico | T12 |
| Logistico | [NOVO] | tool_calcular_score_logistico | T25 |

---

### RF-012 — Impugnacao

**Status:** CRUD Recurso, sem tool de geracao
**Page:** ImpugnacaoPage.tsx | **Agente:** page-engineer-sprint3-6 (T21) + backend-tools-engineer (T19) | **Onda:** 3

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Criar impugnacao | Modal local | [CRUD] `crudCreate("recursos", {tipo: "impugnacao", edital_id, ...})` |
| Gerar Texto com IA | Mock 2s | [NOVO] `onSendToChat("Gere uma impugnacao para o edital {numero} com motivo: {motivo}")` |
| Salvar Rascunho | setState | [CRUD] `crudUpdate("recursos", id, {texto_minuta, status: "rascunho"})` |

**IA necessaria:**
- [NOVO] tool_gerar_impugnacao (T19) — LLM gera minuta com fundamentacao Lei 14.133/2021
- [NOVO] tool_identificar_termos_direcionados (T19) — LLM identifica clausulas restritivas

---

### RF-013 — Precificacao

**Status:** BACKEND COMPLETO, Page mock
**Page:** PrecificacaoPage.tsx | **Agente:** page-engineer-sprint3-6 (T14) | **Onda:** 2

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Buscar no PNCP | Mock 1.5s | [CHAT] `onSendToChat("Busque precos de {termo} no PNCP")` |
| Recomendar Preco | Mock 2s | [CHAT] `onSendToChat("Recomende preco para {termo}")` |
| Ver Todos (historico) | onClick vazio | [CHAT] `onSendToChat("Mostre o historico de precos de {termo}")` |
| Exportar | onClick vazio | [NOVO] CSV no frontend |

**IA ja existente (3 tools):** tool_buscar_precos_pncp, tool_historico_precos, tool_recomendar_preco

---

### RF-014 — Proposta Tecnica

**Status:** BACKEND COMPLETO, Page mock
**Page:** PropostaPage.tsx | **Agente:** page-engineer-sprint3-6 (T15) + backend-infra-engineer (T18) | **Onda:** 2

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Sugerir preco | Hardcoded | [CHAT] `onSendToChat("Recomende preco para {produto} no edital {numero}")` |
| Gerar Proposta Tecnica | Mock 2s | [CHAT] `onSendToChat("Gere uma proposta do produto {produto} para o edital {numero} com preco R$ {valor}")` |
| Visualizar proposta | setState | [PAGE] Exibir texto_tecnico |
| Baixar DOCX/PDF | onClick vazio | [NOVO] Endpoint /api/propostas/{id}/export?format=pdf (T18) |
| Enviar por Email | onClick vazio | [NOVO] Endpoint /api/propostas/{id}/email |
| Excluir | setState | [CRUD] `crudDelete("propostas", id)` |

**IA ja existente:** tool_gerar_proposta (8 secoes completas)

---

### RF-015 — Submissao

**Status:** PARCIAL (sem workflow)
**Page:** SubmissaoPage.tsx | **Agente:** page-engineer-sprint3-6 (T16) + backend-tools-engineer (T17) | **Onda:** 2

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Anexar Documento | Modal upload | [CRUD] `crudCreate("editais-documentos", {...})` + upload |
| Marcar como Enviada | setState | [NOVO] `onSendToChat("Atualize o status da proposta do edital {numero} para enviada")` |
| Abrir Portal PNCP | window.open | [PAGE] Link externo |

**IA necessaria:**
- [NOVO] tool_atualizar_status_proposta (T17)

---

### RF-016 — Disputa de Lances

**Status:** NAO IMPLEMENTADO
**Page:** LancesPage.tsx | **Agente:** page-engineer-sprint7-10 (T50) + backend-tools-engineer (T49) | **Onda:** 4

| Botao na UI | Implementacao |
|-------------|---------------|
| Abrir Sala | [PAGE] Link externo comprasnet |
| Simular Lance | [NOVO] `onSendToChat("Simule lances para o edital {numero} com margem minima de {margem}%")` |
| Sugerir Lance | [NOVO] `onSendToChat("Sugira o melhor lance para o edital {numero}")` |

**IA necessaria:**
- [NOVO] tool_simular_lance + tool_sugerir_lance (T49)

---

### RF-017 — Follow-up de Resultados

**Status:** BACKEND COMPLETO, Page mock
**Page:** FollowupPage.tsx | **Agente:** page-engineer-sprint3-6 (T24) | **Onda:** 3

| Botao na UI | Acao Atual | Implementacao |
|-------------|-----------|---------------|
| Registrar Resultado | setState | [CHAT] `onSendToChat("Ganhamos o edital {numero} com R$ {valor}")` ou `"Perdemos o edital {numero}..."` |
| Lembrete | onClick vazio | [CHAT] `onSendToChat("Configure alerta para o edital {numero} com 1 dia de antecedencia")` |

**IA ja existente (4 tools):** tool_registrar_resultado, tool_extrair_ata_pdf, tool_buscar_atas_pncp, tool_baixar_ata_pncp

---

### RF-018 — Recurso/Contra-Razoes

**Status:** CRUD OK, sem tool geracao
**Page:** ImpugnacaoPage.tsx (aba Recursos) | **Agente:** backend-tools-engineer (T20) + page-engineer-sprint3-6 (T21) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Gerar Recurso com IA | [NOVO] `onSendToChat("Gere um recurso administrativo para o edital {numero}")` |
| Gerar Contra-Razoes | [NOVO] `onSendToChat("Gere contra-razoes para o recurso do edital {numero}")` |

**IA necessaria:**
- [NOVO] tool_gerar_recurso + tool_gerar_contra_razoes (T20)

---

### RF-019 — CRM Ativo

**Status:** CRUD OK, Page mock
**Page:** CRMPage.tsx | **Agente:** page-engineer-sprint3-6 (T30) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Novo Lead | [CRUD] `crudCreate("leads-crm", {...})` |
| Ver detalhes | [CRUD] `crudGet("leads-crm", id)` |
| Registrar contato | [CRUD] `crudUpdate("leads-crm", id, {ultima_interacao: now})` |
| Enviar email | [NOVO] Endpoint /api/email/send |

**IA na page:** CRUD puro. Integracao automatica com RF-026 (T33).

---

### RF-020 — Execucao de Contrato

**Status:** CRUD OK, Page mock
**Page:** ProducaoPage.tsx | **Agente:** page-engineer-sprint3-6 (T27) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Registrar Entrega | [CRUD] `crudUpdate("contrato-entregas", id, {status: "entregue"})` |
| Anexar NF | [CRUD] `crudUpdate("contrato-entregas", id, {nota_fiscal: numero})` |
| Ver Historico | [CRUD] `crudList("contrato-entregas", {parent_id: contrato_id})` |

**IA na page:** CRUD puro.

---

### RF-021 — Contratado x Realizado

**Status:** CRUD OK, Page mock
**Page:** ContratadoRealizadoPage.tsx | **Agente:** page-engineer-sprint3-6 (T28) + backend-tools-engineer (T29) | **Onda:** 3

**Dados:** [REST] `/api/dashboard/contratado-realizado` (T29)
**IA na page:** Nenhuma. Dashboard de dados.

---

### RF-022 — Flags/Alertas

**Status:** BACKEND COMPLETO, Page mock
**Page:** FlagsPage.tsx | **Agente:** page-engineer-sprint7-10 (T35) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Novo Alerta | [CHAT] `onSendToChat("Configure alertas para o edital {numero}")` |
| Cancelar Alerta | [CHAT] `onSendToChat("Cancele os alertas do edital {numero}")` |

**IA ja existente (5 tools):** tool_configurar_alertas, tool_listar_alertas, tool_cancelar_alerta, tool_dashboard_prazos, tool_calendario_editais

---

### RF-023 — Monitoria

**Status:** BACKEND COMPLETO, Page mock
**Page:** MonitoriaPage.tsx | **Agente:** page-engineer-sprint7-10 (T36) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Novo Monitoramento | [CHAT] `onSendToChat("Monitore editais de {termo} em {UFs}")` |
| Play/Pause | [CHAT] `onSendToChat("Desative o monitoramento de {termo}")` |
| Excluir | [CRUD] `crudDelete("monitoramentos", id)` |

**IA ja existente (3 tools + scheduler):** tool_configurar_monitoramento, tool_listar_monitoramentos, tool_desativar_monitoramento

---

### RF-024 — Concorrencia

**Status:** BACKEND COMPLETO, Page mock
**Page:** ConcorrenciaPage.tsx | **Agente:** page-engineer-sprint3-6 (T34) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Analise concorrente | [CHAT] `onSendToChat("Analise o concorrente {nome}")` |

**IA ja existente (2 tools):** tool_listar_concorrentes, tool_analisar_concorrente

---

### RF-025 — Mercado TAM/SAM/SOM

**Status:** PARCIAL
**Page:** MercadoPage.tsx | **Agente:** page-engineer-sprint7-10 (T43) + backend-tools-engineer (T41) | **Onda:** 4

| Botao na UI | Implementacao |
|-------------|---------------|
| Atualizar | [NOVO] `onSendToChat("Calcule o TAM/SAM/SOM do meu segmento")` |

**IA necessaria:**
- [NOVO] tool_calcular_tam_sam_som (T41)

---

### RF-026 — Perdas

**Status:** BACKEND COMPLETO, Page mock
**Page:** PerdasPage.tsx | **Agente:** page-engineer-sprint3-6 (T31) + backend-tools-engineer (T32) | **Onda:** 3

**Dados:** [REST] `/api/dashboard/perdas` (T32)
**IA na page:** Dashboard de dados. tool_registrar_resultado ja registra derrotas.

---

### RF-027 — Dispensas

**Status:** CRUD OK, sem workflow
**Page:** CaptacaoPage.tsx (filtro) | **Agente:** page-engineer-sprint2 (T46) | **Onda:** 4

| Botao na UI | Implementacao |
|-------------|---------------|
| Filtrar dispensas | [CRUD] `crudList("dispensas", {status: "aberta"})` |

---

### RF-028 — Interface Hibrida (Chat + Pages) — TRANSVERSAL

**Agentes:** frontend-bridge-engineer (T1,T2) + todos os page-engineers
**Onda:** 1 (infraestrutura) → ondas 2-4 (cada page)

1. T1: App.tsx passa `onSendToChat` para todas as pages
2. T2: useChat.ts processa action_type e resultado
3. Cada page combina CRUD (dados) + Chat (acoes IA)

---

### RF-029 — Aprendizado Continuo

**Status:** CRUD OK, sem pipeline
**Agente:** backend-infra-engineer (T44) | **Onda:** 4

**IA necessaria:**
- [NOVO] Pipeline: resultado → delta → aprendizado_feedback → ajuste (T44)

---

### RF-030 — Governanca/Auditoria

**Status:** CRUD OK, sem middleware
**Agente:** backend-infra-engineer (T37) | **Onda:** 3

**Backend necessario:**
- [NOVO] Middleware no crud_routes.py que loga em auditoria_log (T37)

---

### RF-031 — Pendencias PNCP

**Status:** PARCIAL
**Page:** MonitoriaPage.tsx | **Agente:** backend-tools-engineer (T39) | **Onda:** 3

**IA necessaria:**
- [NOVO] tool_verificar_pendencias_pncp (T39)

---

### RF-032 — Suporte Juridico IA

**Status:** FUNCIONAL VIA CHAT (sem disclaimers)
**Agente:** backend-infra-engineer (T22) + page-engineer-sprint3-6 (T23) | **Onda:** 3

**A criar:** Componente DisclaimerJuridico (T23) + logica de deteccao (T22)

---

### RF-033 — Autenticacao Multi-tenant — COMPLETO

---

### RF-034 — Analytics MindsDB

**Status:** BACKEND COMPLETO, sem page
**Page:** [NOVA] AnalyticsPage.tsx | **Agente:** page-engineer-sprint7-10 (T45) | **Onda:** 4

| Botao na UI | Implementacao |
|-------------|---------------|
| Consulta livre | [CHAT] `onSendToChat("{consulta analitica}")` |
| Queries pre-definidas | [CHAT] `onSendToChat("Quantos editais temos por estado?")` |
| Exportar CSV | [NOVO] Frontend gera CSV |

**IA ja existente:** tool_consulta_mindsdb (NL→SQL) + 17 prompts analiticos

---

### RF-035 — Atas de Pregao

**Status:** BACKEND COMPLETO, sem page
**Page:** [NOVA] AtasPage.tsx | **Agente:** page-engineer-sprint7-10 (T26) | **Onda:** 3

| Botao na UI | Implementacao |
|-------------|---------------|
| Buscar atas | [CHAT] `onSendToChat("Busque atas de {termo}")` |
| Baixar ata | [CHAT] `onSendToChat("Baixe atas de {termo} do PNCP")` |
| Extrair resultados | [CHAT] `onSendToChat("Extraia os resultados desta ata", file)` |

**IA ja existente (3 tools):** tool_buscar_atas_pncp, tool_extrair_ata_pdf, tool_baixar_ata_pncp

---

### RF-036 — Analise Upload Edital — COMPLETO

---

### RF-037 — Estrategia Comercial

**Status:** CRUD OK, sem engine
**Page:** CaptacaoPage.tsx (coluna) + ValidacaoPage | **Agente:** page-engineer-sprint2 (T9) + backend-tools-engineer (T13) | **Onda:** 2

| Botao na UI | Implementacao |
|-------------|---------------|
| Go/NoGo na CaptacaoPage | [CRUD] `crudCreate("estrategias-editais", {...})` |
| Calculo automatico | [NOVO] decision_engine_go_nogo (T13) |

---

### RF-038 — Itens Intrusos

**Status:** NAO IMPLEMENTADO
**Page:** ValidacaoPage.tsx (badge) | **Agente:** backend-tools-engineer (T42) | **Onda:** 4

**IA necessaria:**
- [NOVO] tool_detectar_itens_intrusos (T42)

---

### RF-039 — Alertas de Prazo — BACKEND COMPLETO (mesma page de RF-022)

---

### RF-040 — Documentos Gerados — COMPLETO

---

## 6. Mapeamento Consolidado: Prompt Chat ↔ Botao UI ↔ Task Agent Teams

### LEGENDA
- **[EXISTE]** = Prompt ja implementado no ChatInput.tsx
- **[NOVO]** = A criar
- **Tn** = Numero da task no Agent Teams

### Captacao (CaptacaoPage) — page-engineer-sprint2 (T8)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Buscar Editais | "Busque editais de {termo} no PNCP" | tool_buscar_editais_scraper | [EXISTE] | T8 |
| Salvar Todos | "Salvar todos os editais" | tool_salvar_editais_selecionados | [EXISTE] | T8 |
| Salvar Recomendados | "Salvar editais recomendados" | tool_salvar_editais_selecionados | [EXISTE] | T8 |
| Salvar edital X | "Salvar edital {numero}" | tool_salvar_editais_selecionados | [EXISTE] | T8 |
| Configurar Monitoria | "Monitore editais de {termo}" | tool_configurar_monitoramento | [EXISTE] | T8 |
| Exportar CSV | (frontend-only) | — | [NOVO] | T8 |

### Validacao (ValidacaoPage) — page-engineer-sprint2 (T10)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Gerar Resumo | "Resuma o edital {numero}" | call_deepseek | [EXISTE] | T10 |
| Perguntar | "O edital {numero} exige {pergunta}?" | call_deepseek | [EXISTE] | T10 |
| Baixar PDF | "Baixe o PDF do edital {numero}" | tool_baixar_pdf_pncp | [EXISTE] | T10 |
| Calcular Aderencia | "Calcule a aderencia do produto {X} ao edital {Y}" | tool_calcular_aderencia | [EXISTE] | T10 |
| Score Documental | (automatico) | tool_calcular_score_documental | [NOVO] | T11 |
| Score Juridico | (automatico) | tool_calcular_score_juridico | [NOVO] | T12 |
| Score Logistico | (automatico) | tool_calcular_score_logistico | [NOVO] | T25 |

### Precificacao (PrecificacaoPage) — page-engineer-sprint3-6 (T14)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Buscar no PNCP | "Busque precos de {termo} no PNCP" | tool_buscar_precos_pncp | [EXISTE] | T14 |
| Recomendar Preco | "Recomende preco para {termo}" | tool_recomendar_preco | [EXISTE] | T14 |
| Ver historico | "Mostre o historico de precos de {termo}" | tool_historico_precos | [EXISTE] | T14 |

### Proposta (PropostaPage) — page-engineer-sprint3-6 (T15)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Gerar Proposta | "Gere proposta do produto {X} para o edital {Y} com preco R$ {Z}" | tool_gerar_proposta | [EXISTE] | T15 |
| Sugerir preco | "Recomende preco para {produto}" | tool_recomendar_preco | [EXISTE] | T15 |
| Exportar PDF | — | /api/propostas/{id}/export | [NOVO] | T18 |

### Submissao (SubmissaoPage) — page-engineer-sprint3-6 (T16)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Marcar Enviada | "Atualize o status da proposta do edital {X} para enviada" | tool_atualizar_status_proposta | [NOVO] | T17 |

### Impugnacao (ImpugnacaoPage) — page-engineer-sprint3-6 (T21)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Gerar impugnacao IA | "Gere uma impugnacao para o edital {X} com motivo: {Y}" | tool_gerar_impugnacao | [NOVO] | T19 |
| Gerar recurso IA | "Gere um recurso para o edital {X} com motivo: {Y}" | tool_gerar_recurso | [NOVO] | T20 |
| Gerar contra-razoes | "Gere contra-razoes para o recurso do edital {X}" | tool_gerar_contra_razoes | [NOVO] | T20 |

### Follow-up (FollowupPage) — page-engineer-sprint3-6 (T24)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Registrar vitoria | "Ganhamos o edital {X} com R$ {valor}" | tool_registrar_resultado | [EXISTE] | T24 |
| Registrar derrota | "Perdemos o edital {X} para {empresa} com R$ {valor}" | tool_registrar_resultado | [EXISTE] | T24 |
| Lembrete | "Configure alerta para edital {X}" | tool_configurar_alertas | [EXISTE] | T24 |

### Atas (AtasPage — NOVA) — page-engineer-sprint7-10 (T26)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Buscar atas | "Busque atas de {termo}" | tool_buscar_atas_pncp | [EXISTE] | T26 |
| Baixar ata | "Baixe atas de {termo} do PNCP" | tool_baixar_ata_pncp | [EXISTE] | T26 |
| Extrair resultados | "Extraia os resultados desta ata" (+ file) | tool_extrair_ata_pdf | [EXISTE] | T26 |

### Concorrencia (ConcorrenciaPage) — page-engineer-sprint3-6 (T34)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Analisar concorrente | "Analise o concorrente {nome}" | tool_analisar_concorrente | [EXISTE] | T34 |

### Alertas (FlagsPage) — page-engineer-sprint7-10 (T35)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Novo Alerta | "Configure alertas para o edital {X}" | tool_configurar_alertas | [EXISTE] | T35 |
| Cancelar | "Cancele os alertas do edital {X}" | tool_cancelar_alerta | [EXISTE] | T35 |

### Monitoria (MonitoriaPage) — page-engineer-sprint7-10 (T36)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Novo Monitoramento | "Monitore editais de {termo} em {UFs}" | tool_configurar_monitoramento | [EXISTE] | T36 |
| Pausar | "Desative o monitoramento de {termo}" | tool_desativar_monitoramento | [EXISTE] | T36 |
| Verificar pendencias PNCP | "Verifique pendencias nos meus editais" | tool_verificar_pendencias_pncp | [NOVO] | T39 |

### Mercado (MercadoPage) — page-engineer-sprint7-10 (T43)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Atualizar TAM/SAM/SOM | "Calcule o TAM/SAM/SOM do meu segmento" | tool_calcular_tam_sam_som | [NOVO] | T41 |

### Analytics (AnalyticsPage — NOVA) — page-engineer-sprint7-10 (T45)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Editais por UF | "Quantos editais temos por estado?" | tool_consulta_mindsdb | [EXISTE] | T45 |
| Taxa de sucesso | "Qual nossa taxa de sucesso?" | tool_consulta_mindsdb | [EXISTE] | T45 |
| Consulta livre | "{texto livre}" | tool_consulta_mindsdb | [EXISTE] | T45 |
| (+ 14 outros cards) | (17 prompts analiticos) | tool_consulta_mindsdb | [EXISTE] | T45 |

### Lances (LancesPage) — page-engineer-sprint7-10 (T50)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Simular Lance | "Simule lances para edital {X} com margem minima de {Y}%" | tool_simular_lance | [NOVO] | T49 |
| Sugerir Lance | "Sugira o melhor lance para o edital {X}" | tool_sugerir_lance | [NOVO] | T49 |

### Empresa (EmpresaPage) — page-engineer-sprint1 (T4)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Buscar Certidoes | "Busque certidoes da empresa {X}, CNPJ {Y}" | tool_buscar_certidoes_empresa | [NOVO] | — (Onda 3+) |
| Analise docs IA | "Analise os documentos da empresa {X}" | tool_analisar_documentos_empresa | [NOVO] | T38 |

### Parametrizacoes (ParametrizacoesPage) — page-engineer-sprint1 (T6, T47)

| Botao na UI | Prompt no Chat | Tool Backend | Status | Task |
|-------------|---------------|-------------|--------|------|
| Gerar classes IA | "Gere classes de produto baseadas no meu portfolio" | tool_gerar_classes_portfolio | [NOVO] | T48 |

---

## 7. Cronograma Agent Teams — Diagrama de Gantt (em horas)

```
HORA:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25   26   27   28   29   30
       |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
ONDA 1 |===ONDA 1====|
  bridge   |T1T2|                                T1+T2 prontos em ~15-30min → libera TUDO
  sprint1  |    T3|T4=====|T6==|
  bk-tools |T5=|T7|
       |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
ONDA 2          |=========ONDA 2=============|
  sprint2       |T8====|T10====|T9==|
  sprint3-6     |T14=|T15===|T16==|
  bk-tools      |T11|T12|T17|T13==|
  bk-infra      |T18====|
       |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
ONDA 3                              |==============ONDA 3====================|
  sprint3-6                         |T24|T27|T30|T34|T21====|T23|T28|T31|
  sprint7-10                        |T26===|T35=|T36=|
  bk-tools                         |T19=|T20=|T25|T29|T32|T38|T39|
  bk-infra                         |T22|T33|T37=|T40=|
       |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
ONDA 4                                                         |==========ONDA 4=============|
  sprint7-10                                                   |T45===|T43=|T50=|
  sprint2                                                      |T46|
  sprint1                                                      |   T47=|
  bk-tools                                                    |T41|T42|T48=|T49=|
  bk-infra                                                     |T44===|T51|
  qa                                                           |=====T52 (parcial)====T52 (E2E)===|
       |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
```

**Total: ~24-30 horas de execucao (3-4 dias uteis) vs 70 dias humano sequencial = ~20x mais rapido**

Nota: As ondas se sobrepoe — tasks da Onda 3 que so dependem de T1 (ja pronto) comecam antes da Onda 2 terminar. O paralelismo real e ainda maior do que o diagrama mostra.

---

## 8. Caminho Critico

```
T1 (App.tsx onSendToChat) ─→ T8 (CaptacaoPage) ─→ T21 (ImpugnacaoPage, depende T19+T20) ─→ T52 (QA)
                            ↘ T10 (ValidacaoPage)
                            ↘ T14 (PrecificacaoPage)
                            ↘ T24 (FollowupPage)
                            ↘ T35 (FlagsPage)
                            ↘ T36 (MonitoriaPage)

T5 (dashboard endpoint) ─→ T3 (Dashboard page)

T11+T12 (scores) ─→ T13 (decision engine) ─→ T9 (estrategia go/nogo)

T19 (tool impugnacao) ─→ T21 (ImpugnacaoPage)
T20 (tool recurso) ────→ T21 (ImpugnacaoPage)

T41 (tool TAM/SAM/SOM) ─→ T43 (MercadoPage)
T48 (tool classes) ─────→ T47 (ParametrizacoesPage classes)
T49 (tool lances) ─────→ T50 (LancesPage)
```

**T1 e T2 sao as tasks MAIS CRITICAS** — todas as pages dependem delas. O frontend-bridge-engineer conclui em ~15-30 minutos (copiar prop para 21 pages + adicionar 2 campos no useChat). Apos isso, TODAS as ondas desbloqueim.

---

## 9. Metricas

### Estado Atual (17/02/2026)

| Metrica | Valor |
|---------|-------|
| Tools backend funcionais | **49** |
| Prompts de chat conectados | **210+** (TODOS funcionais) |
| Pages com dados reais | **3 de 21** (PortfolioPage, LoginPage, RegisterPage) |
| Pages com ponte onSendToChat | **1** (PortfolioPage) |
| Botoes que chamam IA | **~10** (todos na PortfolioPage) |

### Meta apos Onda 4 (~3-4 dias uteis com Agent Teams)

| Metrica | Meta |
|---------|------|
| RFs implementados | **40/40 (100%)** |
| Tools backend | **~62** (49 + 13 novas) |
| Pages com dados reais | **23/23** (21 + AtasPage + AnalyticsPage) |
| Pages com ponte onSendToChat | **23/23 (100%)** |
| Botoes que chamam IA via chat | **~55** |
| Prompts [EXISTE] reutilizados | **~38** |
| Prompts [NOVO] a criar | **~12** |

### Distribuicao de Trabalho por Agente

| Agente | Tasks | Arquivos | Complexidade |
|--------|-------|----------|-------------|
| frontend-bridge-engineer | T1, T2 | 3 arquivos | Media (bloqueante) |
| page-engineer-sprint1 | T3, T4, T6, T47 | 3 pages | Media |
| page-engineer-sprint2 | T8, T9, T10, T46 | 2 pages | Alta (muitos botoes) |
| page-engineer-sprint3-6 | T14-T16, T21, T23-T24, T27-T28, T30-T31, T34 | 10 pages | Alta (volume) |
| page-engineer-sprint7-10 | T26, T35-T36, T43, T45, T50 | 6 pages + 2 novas | Alta (2 pages novas) |
| backend-tools-engineer | T5, T7, T11-T13, T17, T19-T20, T25, T29, T32, T38-T39, T41-T42, T48-T49 | tools.py + app.py | Alta (13 tools novas) |
| backend-infra-engineer | T18, T22, T33, T37, T40, T44, T51 | app.py + crud_routes.py | Media |
| qa-engineer | T52 | tests/ | Alta (E2E completo) |

---

## 10. Conclusao

### O sistema ja tem:
- **49 tools** + **210+ prompts** + **48 handlers** — tudo funcional via chat
- O gap real e a **desconexao entre as pages e o chat**

### Com Agent Teams:
1. **T1+T2 em ~15 minutos** (vs 1 semana humano) — desbloqueiam TUDO
2. **4-6 agentes simultaneos** por onda — pages, tools, infra em paralelo
3. **~24-30 horas (3-4 dias uteis) vs 70 dias** — aceleracao ~20x
4. **Ownership exclusivo** de arquivos — zero conflitos de merge
5. **QA em paralelo** — comeca a testar modulos prontos antes do final
6. **Ondas se sobrepoe** — tasks que so dependem de T1 comecam imediatamente, sem esperar onda anterior

### Dado critico:
Dos ~55 botoes que chamarao IA nas pages, **~38 ja tem prompt+tool existente** no backend. Apenas ~12 precisam de tools novas. O maior esforco e **frontend** (conectar pages), e por isso temos **4 page-engineers** vs **2 backend-engineers**.

### Como iniciar:

```bash
cd /mnt/data1/progpython/agenteditais
tmux new -s editais
claude
```

Instruir o team-lead:
```
Leia INSTRUCOES_PARA_AGENT_TEAMS_NESSE_REPO.md e docs/planejamento_17022026.md.
Inicie o Agent Teams: Onda 1 primeiro (T1+T2 bloqueantes, T5+T7 em paralelo, T3 espera T5).
```

**MVP com 100% dos requisitos: 4 ondas, ~3-4 dias uteis com Agent Teams (17/02 → ~20/02/2026).**
