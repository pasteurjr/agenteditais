# Instrucoes para Agent Teams — facilicita.ia

## Visao Geral do Projeto

**facilicita.ia** e uma plataforma SaaS para empresas brasileiras participarem de licitacoes publicas (editais). O sistema cobre o ciclo completo: captacao, analise, propostas, submissao, acompanhamento, contratos e aprendizado. Usa IA (DeepSeek Reasoner) para automacao inteligente em cada etapa.

## Estado Atual (17/02/2026)

| O que funciona | Detalhes |
|----------------|----------|
| Backend Flask (porta 5007) | 6,958 linhas, 49 tools, 48 handlers, 54 intents |
| 210+ prompts de chat | TODOS conectados a tools e funcionais |
| 35+ tabelas MySQL | Schema completo em backend/models.py (1,553 linhas) |
| CRUD generico | GET/POST/PUT/DELETE para todas as 30+ tabelas |
| Autenticacao JWT | Login, registro, refresh token |
| Scheduler (APScheduler) | Alertas a cada 5 min, monitoramentos a cada 60 min |
| PortfolioPage | UNICA page funcional (referencia para todas as outras) |
| LoginPage + RegisterPage | Funcionais |

| O que falta | Detalhes |
|-------------|----------|
| 18 pages com mock data | Precisam ser conectadas ao CRUD + onSendToChat |
| onSendToChat em 20 pages | So PortfolioPage recebe — todas precisam |
| useChat.ts ignora action_type | Resultado da IA nao chega nas pages |
| 13 tools novas | Scores documental/juridico/logistico, impugnacao, recurso, etc. |
| Export PDF/DOCX | Nao existe |
| Middleware auditoria | Tabela existe, middleware nao |
| Disclaimers juridicos | Respostas juridicas sem aviso legal |
| Dashboard real | Dados mock no dashboard |
| 2 pages novas | AtasPage e AnalyticsPage |

## Arquitetura de Integracao (O PADRAO)

```
Botao na Page  →  onSendToChat(mensagem)  →  POST /api/chat  →  detectar_intencao_ia()
                                                                        ↓
                  ChatArea renderiza resposta  ←  processar_XXX()  ←  tool_XXX()
                                                                        ↓
                  Page faz setTimeout + refetch  →  CRUD API  →  dados atualizados
```

**Referencia**: PortfolioPage.tsx e a UNICA page que segue esse padrao. TODAS as outras devem seguir o mesmo modelo.

---

## Time de Agentes (8 membros)

| # | Agente | Modelo | Responsabilidade |
|---|--------|--------|-----------------|
| 1 | **team-lead** | Opus | Coordenacao, git, verificacao |
| 2 | **frontend-bridge-engineer** | Sonnet | App.tsx (onSendToChat em todas pages) + useChat.ts (action_type) |
| 3 | **page-engineer-sprint1** | Sonnet | Dashboard, EmpresaPage, ParametrizacoesPage |
| 4 | **page-engineer-sprint2** | Sonnet | CaptacaoPage, ValidacaoPage |
| 5 | **page-engineer-sprint3-6** | Sonnet | PrecificacaoPage, PropostaPage, SubmissaoPage, ImpugnacaoPage, FollowupPage, ProducaoPage, ContratadoRealizadoPage, CRMPage, PerdasPage, ConcorrenciaPage |
| 6 | **page-engineer-sprint7-10** | Sonnet | FlagsPage, MonitoriaPage, MercadoPage, LancesPage, AtasPage (nova), AnalyticsPage (nova) |
| 7 | **backend-tools-engineer** | Sonnet | 13 tools novas + endpoints de dashboard + intents + handlers |
| 8 | **backend-infra-engineer** | Sonnet | Export PDF/DOCX, middleware auditoria, disclaimers, email SMTP, /api/health |
| 9 | **qa-engineer** | Sonnet | Testes para todas as funcionalidades |

---

## Ownership de Arquivos

**REGRA**: Cada agente so modifica seus arquivos. Conflitos sao resolvidos pelo team-lead.

| Agente | Arquivos |
|--------|----------|
| frontend-bridge-engineer | frontend/src/App.tsx, frontend/src/hooks/useChat.ts, frontend/src/types/ |
| page-engineer-sprint1 | frontend/src/components/Dashboard.tsx, frontend/src/pages/EmpresaPage.tsx, frontend/src/pages/ParametrizacoesPage.tsx |
| page-engineer-sprint2 | frontend/src/pages/CaptacaoPage.tsx, frontend/src/pages/ValidacaoPage.tsx |
| page-engineer-sprint3-6 | frontend/src/pages/{Precificacao,Proposta,Submissao,Impugnacao,Followup,Producao,ContratadoRealizado,CRM,Perdas,Concorrencia}Page.tsx |
| page-engineer-sprint7-10 | frontend/src/pages/{Flags,Monitoria,Mercado,Lances}Page.tsx, AtasPage.tsx (nova), AnalyticsPage.tsx (nova), frontend/src/components/Sidebar.tsx |
| backend-tools-engineer | backend/tools.py, backend/app.py (handlers/intents/endpoints dashboard) |
| backend-infra-engineer | backend/app.py (export/health/middleware), backend/crud_routes.py, backend/gerador_documentos.py |
| qa-engineer | backend/tests/ (todo o diretorio) |

**CUIDADO**: backend-tools-engineer e backend-infra-engineer ambos modificam `backend/app.py`. O team-lead deve coordenar para que nao trabalhem no mesmo trecho simultaneamente.

---

## Tasks Detalhadas (52 Tasks em 4 Ondas)

### ONDA 1: Infraestrutura de Conexao (Sprint 1)
**Objetivo**: Habilitar ponte chat em todas as pages + primeiras pages com dados reais.
**Agentes ativos**: frontend-bridge-engineer, page-engineer-sprint1, backend-tools-engineer

| ID | Task | Agente | Bloqueia | Bloqueado Por |
|----|------|--------|----------|---------------|
| T1 | App.tsx: Passar onSendToChat para TODAS as 21 pages | frontend-bridge-engineer | T6-T11 | - |
| T2 | useChat.ts: Processar action_type e resultado na Message | frontend-bridge-engineer | T6-T11 | - |
| T3 | Dashboard.tsx: Remover mock, consumir GET /api/dashboard/stats | page-engineer-sprint1 | - | T5 |
| T4 | EmpresaPage.tsx: Conectar ao CRUD empresas + docs + certidoes + responsaveis | page-engineer-sprint1 | - | T1 |
| T5 | Backend: Criar endpoint GET /api/dashboard/stats | backend-tools-engineer | T3 | - |
| T6 | ParametrizacoesPage.tsx: Conectar ao CRUD parametros-score + fontes-editais | page-engineer-sprint1 | - | T1 |
| T7 | Backend: tool_calcular_aderencia le pesos de ParametroScore do banco | backend-tools-engineer | - | - |

### ONDA 2: Captacao + Validacao + Primeiras Tools (Sprints 2-3)
**Agentes ativos**: page-engineer-sprint2, page-engineer-sprint3-6, backend-tools-engineer

| ID | Task | Agente | Bloqueia | Bloqueado Por |
|----|------|--------|----------|---------------|
| T8 | CaptacaoPage: Remover mock, busca via onSendToChat, salvar via chat | page-engineer-sprint2 | - | T1 |
| T9 | CaptacaoPage: Coluna estrategia go/nogo com CRUD estrategias-editais | page-engineer-sprint2 | - | T1, T12 |
| T10 | ValidacaoPage: Remover mock, botoes via onSendToChat, decisoes via CRUD | page-engineer-sprint2 | - | T1 |
| T11 | Backend: tool_calcular_score_documental | backend-tools-engineer | - | - |
| T12 | Backend: tool_calcular_score_juridico | backend-tools-engineer | - | - |
| T13 | Backend: decision_engine_go_nogo (scores + ParametroScore) | backend-tools-engineer | T9 | T11, T12 |
| T14 | PrecificacaoPage: Remover mock, botoes via onSendToChat | page-engineer-sprint3-6 | - | T1 |
| T15 | PropostaPage: Remover mock, gerar proposta via onSendToChat | page-engineer-sprint3-6 | - | T1 |
| T16 | SubmissaoPage: Remover mock, workflow de status via onSendToChat | page-engineer-sprint3-6 | - | T1, T17 |
| T17 | Backend: tool_atualizar_status_proposta (workflow rascunho→enviada) | backend-tools-engineer | T16 | - |
| T18 | Backend: Endpoint export PDF/DOCX para propostas | backend-infra-engineer | - | - |

### ONDA 3: Juridico + Follow-up + CRM + Alertas (Sprints 4-7)
**Agentes ativos**: page-engineer-sprint3-6, page-engineer-sprint7-10, backend-tools-engineer, backend-infra-engineer

| ID | Task | Agente | Bloqueia | Bloqueado Por |
|----|------|--------|----------|---------------|
| T19 | Backend: tool_gerar_impugnacao (Lei 14.133/2021) | backend-tools-engineer | T21 | - |
| T20 | Backend: tool_gerar_recurso + tool_gerar_contra_razoes | backend-tools-engineer | T21 | - |
| T21 | ImpugnacaoPage: Remover mock, gerar textos via onSendToChat | page-engineer-sprint3-6 | - | T1, T19, T20 |
| T22 | Backend: Disclaimers juridicos automaticos | backend-infra-engineer | - | T19 |
| T23 | Frontend: Componente DisclaimerJuridico | page-engineer-sprint3-6 | - | T22 |
| T24 | FollowupPage: Remover mock, registrar resultado via onSendToChat | page-engineer-sprint3-6 | - | T1 |
| T25 | Backend: tool_calcular_score_logistico | backend-tools-engineer | - | - |
| T26 | AtasPage: CRIAR page nova, 3 botoes via onSendToChat | page-engineer-sprint7-10 | - | T1 |
| T27 | ProducaoPage: Remover mock, CRUD contratos + entregas | page-engineer-sprint3-6 | - | T1 |
| T28 | ContratadoRealizadoPage: Remover mock, endpoint dashboard | page-engineer-sprint3-6 | - | T29 |
| T29 | Backend: Endpoint GET /api/dashboard/contratado-realizado | backend-tools-engineer | T28 | - |
| T30 | CRMPage: Remover mock, CRUD leads-crm + acoes-pos-perda | page-engineer-sprint3-6 | - | T1 |
| T31 | PerdasPage: Remover mock, endpoint dashboard | page-engineer-sprint3-6 | - | T32 |
| T32 | Backend: Endpoint GET /api/dashboard/perdas | backend-tools-engineer | T31 | - |
| T33 | Backend: Ao registrar derrota, criar lead CRM automatico | backend-infra-engineer | - | - |
| T34 | ConcorrenciaPage: Remover mock, analise via onSendToChat | page-engineer-sprint3-6 | - | T1 |
| T35 | FlagsPage: Remover mock, alertas via onSendToChat | page-engineer-sprint7-10 | - | T1 |
| T36 | MonitoriaPage: Remover mock, monitoramentos via onSendToChat | page-engineer-sprint7-10 | - | T1 |
| T37 | Backend: Middleware auditoria no crud_routes.py | backend-infra-engineer | - | - |
| T38 | Backend: tool_analisar_documentos_empresa | backend-tools-engineer | - | - |
| T39 | Backend: tool_verificar_pendencias_pncp | backend-tools-engineer | - | - |
| T40 | Backend: Configurar SMTP producao + emails reais no scheduler | backend-infra-engineer | - | - |

### ONDA 4: Analytics + Mercado + Lances + QA (Sprints 8-10)
**Agentes ativos**: page-engineer-sprint7-10, backend-tools-engineer, backend-infra-engineer, qa-engineer

| ID | Task | Agente | Bloqueia | Bloqueado Por |
|----|------|--------|----------|---------------|
| T41 | Backend: tool_calcular_tam_sam_som | backend-tools-engineer | T43 | - |
| T42 | Backend: tool_detectar_itens_intrusos | backend-tools-engineer | - | - |
| T43 | MercadoPage: Remover mock, TAM/SAM/SOM via onSendToChat | page-engineer-sprint7-10 | - | T1, T41 |
| T44 | Backend: Pipeline aprendizado (resultado → delta → feedback) | backend-infra-engineer | - | - |
| T45 | AnalyticsPage: CRIAR page nova, cards + consulta MindsDB | page-engineer-sprint7-10 | - | T1 |
| T46 | CaptacaoPage aba Dispensas: Filtrar dispensas via CRUD | page-engineer-sprint7-10 | - | - |
| T47 | ParametrizacoesPage aba Classes: CRUD + gerar com IA | page-engineer-sprint7-10 | - | T48 |
| T48 | Backend: tool_gerar_classes_portfolio + tool_aplicar_mascara_descricao | backend-tools-engineer | T47 | - |
| T49 | Backend: tool_simular_lance + tool_sugerir_lance | backend-tools-engineer | T50 | - |
| T50 | LancesPage: Remover mock, simular e sugerir via onSendToChat | page-engineer-sprint7-10 | - | T1, T49 |
| T51 | Backend: /api/health + logging estruturado | backend-infra-engineer | - | - |
| T52 | QA: Testes end-to-end completos (todos os modulos) | qa-engineer | - | T1-T51 |

---

## Estrategia de Execucao

### Paralelismo Maximo

| Onda | Tasks | Agentes Ativos | Observacao |
|------|-------|----------------|------------|
| Onda 1 | T1-T7 | frontend-bridge, page-sprint1, backend-tools | T1 e T2 sao BLOQUEANTES para todas as pages |
| Onda 2 | T8-T18 | page-sprint2, page-sprint3-6, backend-tools, backend-infra | Comeca assim que T1 e T2 terminam |
| Onda 3 | T19-T40 | page-sprint3-6, page-sprint7-10, backend-tools, backend-infra | Mais tasks em paralelo |
| Onda 4 | T41-T52 | page-sprint7-10, backend-tools, backend-infra, qa | QA comeca quando Onda 3 termina |

### Caminho Critico

```
T1 (onSendToChat todas pages) → T8 (CaptacaoPage) → T10 (ValidacaoPage) → T14 (PrecificacaoPage) → ... → T52 (QA)
T5 (dashboard endpoint) → T3 (Dashboard page)
T19 (tool impugnacao) → T21 (ImpugnacaoPage)
T49 (tool lances) → T50 (LancesPage)
```

**T1 (App.tsx onSendToChat) e T2 (useChat.ts) sao as tasks mais criticas** — todas as pages dependem delas. Mas sao triviais (~15 min cada) — o frontend-bridge-engineer libera tudo em menos de 30 minutos.

---

## Dado Critico do Planejamento

> Dos ~55 botoes que chamarao IA nas pages, **~38 ja tem prompt+tool existente** no backend.
> Apenas ~12 precisam de tools novas.
> O MAIOR ESFORCO e **frontend** (conectar pages), nao backend.

Isso significa que os **page-engineers** sao os agentes mais ocupados. O **backend-tools-engineer** cria tools em paralelo, mas a maioria das pages pode ser conectada SEM esperar tools novas (usando os 49 tools existentes).

---

## Documento de Referencia Principal

O planejamento detalhado com TODOS os 40 requisitos funcionais, mapeamento de cada botao em cada page, e cada prompt ↔ tool esta em:

**`docs/planejamento_17022026.md`** (v4.0, 1,107 linhas)

Cada agente DEVE ler este documento antes de comecar a trabalhar. Ele contem:
- Secao 1: Arquitetura de integracao (padrao PortfolioPage)
- Secao 2: Inventario backend (49 tools, 210+ prompts)
- Secao 3: Agent Teams — composicao, ownership de arquivos, regras de conflito
- Secao 4: Plano de execucao — 4 Ondas (52 Tasks) com dependencias e fluxo paralelo
- Secao 5: Mapeamento completo de CADA RF (RF-001 a RF-040) com agente, onda, botoes, implementacao
- Secao 6: Mapeamento consolidado Prompt ↔ Botao UI ↔ Tool ↔ Task Agent Teams
- Secao 7: Diagrama de Gantt (35 dias)
- Secao 8: Caminho critico
- Secao 9: Metricas e distribuicao de trabalho por agente
- Secao 10: Conclusao e como iniciar

---

## Ambiente de Desenvolvimento

### Backend
```bash
cd /mnt/data1/progpython/agenteditais/backend
source ../venv/bin/activate  # ou usar venv local
python app.py                # Porta 5007
```

### Frontend
```bash
cd /mnt/data1/progpython/agenteditais/frontend
npm install  # se necessario
npm run dev  # Porta 5173 ou 5175
```

### Banco MySQL
- Host: `camerascasas.no-ip.info`
- Porta: `3308`
- Database: `editais`
- User: `producao`
- Senha: `112358123`

### LLM
- Provider: DeepSeek
- Model: `deepseek-reasoner` (64K thinking tokens)
- API Key: no arquivo `.env` na raiz

### Verificacao Rapida
```bash
# Backend roda?
cd backend && source ../venv/bin/activate && python -c "from app import app; print('OK')"

# Frontend compila?
cd frontend && npm run build

# Banco conecta?
python -c "from backend.database import get_db_connection; print(get_db_connection())"
```

---

## Como Iniciar o Agent Teams

### 1. Abrir terminal e navegar para o repo
```bash
cd /mnt/data1/progpython/agenteditais
```

### 2. Iniciar tmux (OBRIGATORIO para Agent Teams)
```bash
tmux new -s editais
```

### 3. Rodar Claude Code
```bash
claude
```

### 4. Instruir o Claude (team-lead)
```
Leia o arquivo INSTRUCOES_PARA_AGENT_TEAMS_NESSE_REPO.md e docs/planejamento_17022026.md.
Inicie o Agent Teams criando tasks e atribuindo para os agentes conforme o plano.
Comece pela Onda 1: T1 (onSendToChat em todas pages), T2 (useChat action_type), T5 (endpoint dashboard), T7 (tool_calcular_aderencia pesos do banco).
Os page-engineers sprint2+ so podem comecar APOS T1 e T2 estarem prontos.
```

---

## Criterios de Conclusao (40 RFs)

### Sprint 1 (Onda 1)
- [ ] onSendToChat passado para todas as 21 pages no App.tsx
- [ ] useChat.ts propaga action_type e resultado
- [ ] Dashboard com dados reais do banco
- [ ] EmpresaPage com CRUD real (documentos, certidoes, responsaveis)
- [ ] ParametrizacoesPage com CRUD real (pesos score, fontes)
- [ ] tool_calcular_aderencia le pesos de ParametroScore

### Sprint 2 (Onda 2)
- [ ] CaptacaoPage busca editais via chat e exibe resultados reais
- [ ] CaptacaoPage tem coluna go/nogo com CRUD
- [ ] ValidacaoPage lista editais com analises reais
- [ ] tool_calcular_score_documental funciona
- [ ] tool_calcular_score_juridico funciona
- [ ] Decision engine go/nogo calcula sugestao

### Sprint 3
- [ ] PrecificacaoPage busca precos via chat
- [ ] PropostaPage gera propostas via chat
- [ ] SubmissaoPage com workflow de status
- [ ] Export PDF/DOCX de propostas funciona

### Sprint 4
- [ ] tool_gerar_impugnacao gera minuta juridica
- [ ] tool_gerar_recurso + tool_gerar_contra_razoes funcionam
- [ ] ImpugnacaoPage conectada ao chat
- [ ] Disclaimers juridicos automaticos

### Sprint 5
- [ ] FollowupPage registra resultados via chat
- [ ] ProducaoPage com CRUD contratos
- [ ] ContratadoRealizadoPage com dashboard real
- [ ] AtasPage criada e funcional
- [ ] tool_calcular_score_logistico funciona

### Sprint 6
- [ ] CRMPage com CRUD leads
- [ ] PerdasPage com dashboard real
- [ ] ConcorrenciaPage com analise via chat
- [ ] Lead CRM criado automaticamente ao registrar derrota

### Sprint 7
- [ ] FlagsPage com alertas via chat
- [ ] MonitoriaPage com monitoramentos via chat
- [ ] Middleware auditoria logando no banco
- [ ] SMTP configurado para emails reais

### Sprint 8
- [ ] tool_calcular_tam_sam_som funciona
- [ ] tool_detectar_itens_intrusos funciona
- [ ] MercadoPage com dados TAM/SAM/SOM
- [ ] AnalyticsPage criada com consultas MindsDB
- [ ] Pipeline de aprendizado funciona

### Sprint 9
- [ ] Dispensas na CaptacaoPage
- [ ] Classes/subclasses na ParametrizacoesPage
- [ ] tool_gerar_classes_portfolio funciona
- [ ] tool_aplicar_mascara_descricao funciona

### Sprint 10
- [ ] tool_simular_lance + tool_sugerir_lance funcionam
- [ ] LancesPage conectada ao chat
- [ ] /api/health funciona
- [ ] **Todas as 23 pages com dados reais (0 mock)**
- [ ] **Todos os 40 RFs implementados**
- [ ] **Testes end-to-end passando**
- [ ] **Frontend compila sem erros**

---

## Metricas Atuais vs Meta

| Metrica | Atual | Meta |
|---------|-------|------|
| Tools backend | 49 | ~62 (+13) |
| Pages com dados reais | 3/21 | 23/23 |
| Pages com onSendToChat | 1/21 | 23/23 |
| Botoes IA funcionais | ~10 | ~55 |
| RFs implementados | ~12/40 | 40/40 |
