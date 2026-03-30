# Inventário do Sistema — Agente de Editais (facilicita.ia)

**Data:** 30/03/2026
**Gerado por:** Auto Research — Fase 1

---

## 1. Visão Geral

| Métrica | Valor |
|---------|-------|
| Backend (Python/Flask) | 23 arquivos, 34.347 linhas |
| Frontend (React/TypeScript) | 46 arquivos, 25.352 linhas |
| Documentação (Markdown) | 120+ arquivos |
| Testes Playwright | 31 specs, 617 test cases |
| Models SQLAlchemy | 69 classes |
| Endpoints REST | 119 rotas |
| Tools de IA | 76 funções |
| CRUD Tables | 66 tabelas registradas |
| Sprints concluídas | 5 (1 a 5) |

---

## 2. Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python 3.12 + Flask |
| ORM | SQLAlchemy |
| Banco | MySQL (prod: camerascasas.no-ip.info:3308) |
| LLM | DeepSeek (deepseek-reasoner, 64K thinking tokens) |
| Testes | Playwright (Chromium headless) |
| Portas | Backend: 5007, Frontend: 5175 |
| Auth | JWT (access_token + refresh_token) |
| Scraping | Serper, Google CSE, Brave Search API |
| API Licitações | PNCP (pncp.gov.br/api/) |

---

## 3. Páginas Frontend (23)

### Fluxo Comercial (Sidebar esquerdo)
| Página | Arquivo | Linhas | Status |
|--------|---------|--------|--------|
| Login | LoginPage.tsx | — | Funcional |
| Register | RegisterPage.tsx | — | Funcional |
| Dashboard | Dashboard.tsx (componente) | — | Funcional |
| Captação | CaptacaoPage.tsx | — | Funcional (API real) |
| Validação | ValidacaoPage.tsx | ~2.300 | Funcional (API real + IA) |
| Impugnação | ImpugnacaoPage.tsx | 806 | Funcional (API real + IA) |
| Precificação | PrecificacaoPage.tsx | — | Funcional (API real + IA) |
| Proposta | PropostaPage.tsx | — | Funcional (API real + IA) |
| Submissão | SubmissaoPage.tsx | 364 | Funcional (API real) |
| Disputa Lances | LancesPage.tsx | 182 | **MOCK** |
| Recursos | RecursosPage.tsx | 951 | Funcional (API real + IA) |
| Follow-up | FollowupPage.tsx | ~500 | Funcional (API real) |
| CRM | CRMPage.tsx | 343 | **MOCK** |
| Execução Contrato | ProducaoPage.tsx | ~700 | Funcional (API real) |
| Atas de Pregão | AtasPage.tsx | ~500 | Funcional (API real + IA) |

### Fundação (Sidebar/Cadastros)
| Página | Arquivo | Status |
|--------|---------|--------|
| Empresa | EmpresaPage.tsx | Funcional (API real) |
| Portfolio | PortfolioPage.tsx | Funcional (API real + IA) |
| Parametrizações | ParametrizacoesPage.tsx | Funcional (API real) |

### Indicadores (Sidebar direito)
| Página | Arquivo | Status |
|--------|---------|--------|
| Flags | FlagsPage.tsx | **MOCK** |
| Monitoria | MonitoriaPage.tsx | **MOCK** |
| Concorrência | ConcorrenciaPage.tsx | 203 | **MOCK** |
| Mercado | MercadoPage.tsx | **MOCK** |
| Contratado x Realizado | ContratadoRealizadoPage.tsx | ~800 | Funcional (API real) |
| Perdas | PerdasPage.tsx | 186 | **MOCK** |

### CRUD Genérico
| Página | Arquivo | Status |
|--------|---------|--------|
| CRUD Page | CrudPage.tsx | Funcional (genérico para todas as tabelas) |

---

## 4. Componentes Comuns

| Componente | Arquivo | Propósito |
|------------|---------|-----------|
| Card | common/Card.tsx | Container com título e ações |
| DataTable | common/DataTable.tsx | Tabela genérica com colunas |
| Modal | common/Modal.tsx | Modal overlay |
| FormField | common/FormField.tsx | Wrapper de campo com label |
| TabPanel | common/TabPanel.tsx | Abas com children render function |
| ScoreBar | common/ScoreBar.tsx | Barra de score com cor |
| StatusBadge | common/StatusBadge.tsx | Badge de status colorido |
| FilterBar | common/FilterBar.tsx | Barra de filtros |
| ActionBar | common/ActionBar.tsx | Barra de ações |
| Sidebar | Sidebar.tsx | Menu lateral com seções |
| FloatingChat | FloatingChat.tsx | Chat flutuante |
| ChatInput | ChatInput.tsx | Input do chat |
| ChatArea | ChatArea.tsx | Área de mensagens |

---

## 5. Backend — Arquivos Principais

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| app.py | ~14.100 | Aplicação Flask, 119 endpoints |
| models.py | ~3.100 | 69 modelos SQLAlchemy |
| tools.py | ~11.000 | 76 tools de IA e processamento |
| crud_routes.py | ~1.100 | CRUD genérico para 66 tabelas |
| config.py | — | Configurações e variáveis de ambiente |
| llm.py | — | Wrapper para chamadas DeepSeek |
| scheduler.py | — | APScheduler para alertas e monitoramentos |
| prompts.py | — | Templates de prompts para IA |
| seed_data.py | — | Dados iniciais do banco |
| notifications.py | — | Sistema de notificações |
| gerador_documentos.py | — | Geração de PDF/DOCX |
| calculadora.py | — | Cálculos de precificação |
| calculadora_ia.py | — | Cálculos assistidos por IA |
| certidao_browser.py | — | Busca de certidões via browser |
| rag.py | — | Retrieval Augmented Generation |

---

## 6. Documentação Existente

### Requisitos
- requisitos_completosv6.md (versão atual — 2.320 linhas)
- Versões anteriores: v1 a v5

### Casos de Uso
- CASOS DE USO PRECIFICACAO E PROPOSTA v2.md
- CASOS DE USO RECURSOS E IMPUGNACOES.md (v1.1 — sem Disputas)
- CASOS DE USO SPRINT5.md

### Planejamento
- planejamento_editaisv3.md (10 sprints planejadas)
- planejamento_sprints_completo.md
- SPRINT5.md
- PLANO_SPRINT6.md

### Validação
- PIPELINE_VALIDACAO_SPRINTS.md (pipeline de 4 agentes)
- ACEITACAOVALIDACAOSPRINT4.md
- ACEITACAOVALIDACAOSPRINT5.md
- ACEITACAOVALIDACAOPROPOSTA.md

### Outros
- autoresearch.md (este processo)
- WORKFLOW SISTEMA.pdf (fluxo visual)
- Roadmap fase 1 18-12-2025.docx (roadmap original)

---

## 7. Sprints Concluídas

| Sprint | Tema | Páginas | Status |
|--------|------|---------|--------|
| 1 | Infraestrutura, Dashboard, Empresa, Parametrizações | Dashboard, Empresa, Portfolio, Parametrizações | ✅ Concluída |
| 2 | Captação + Validação | Captação, Validação | ✅ Concluída |
| 3 | Precificação + Proposta + Submissão | Precificação, Proposta, Submissão | ✅ Concluída |
| 4 | Impugnação + Recursos | Impugnação, Recursos | ✅ Concluída |
| 5 | Follow-up + Atas + Contratos + Contratado x Realizado | Follow-up, Atas, Produção, Contratado x Realizado | ✅ Concluída |

### Sprints Pendentes
| Sprint | Tema | Status |
|--------|------|--------|
| 6 | CRM + Perdas + Concorrência | Planejado |
| 7 | Flags + Monitoria + Auditoria + SMTP | Planejado |
| 8 | Mercado (TAM/SAM/SOM) + Analytics | Planejado |
| 9 | Dispensas + Classes/Subclasses | Planejado |
| 10 | Lances + Health Check + QA | Planejado |

---

## 8. Páginas MOCK (não implementadas com backend real)

| Página | Sprint Prevista | Motivo |
|--------|----------------|--------|
| LancesPage | Sprint 10 | Depende de integração com portal ComprasNet |
| CRMPage | Sprint 6 | Planejado |
| PerdasPage | Sprint 6 | Planejado |
| ConcorrenciaPage | Sprint 6 | Planejado |
| FlagsPage | Sprint 7 | Planejado |
| MonitoriaPage | Sprint 7 | Planejado |
| MercadoPage | Sprint 8 | Planejado |

---

## 9. Bugs Corrigidos Nesta Sessão

| Bug | Descrição | Commit |
|-----|-----------|--------|
| Token auth | `localStorage.getItem("token")` → `"editais_ia_access_token"` em 7 páginas | 2c88ab9 |
| Chat genérico | Frontend chamava sendMessage (chat) em vez de endpoints reais (tools de IA) | 89f4472 |
| db.session | 70 linhas em endpoints Sprint 5 usavam `db.session.query` em vez de `db.query` | e9d1d52 |
| Pool MySQL | pool_size=5 (default) → pool_size=20, max_overflow=30 | e9d1d52 |
| Cronograma | datetime.date vs datetime.datetime na subtração | e9d1d52 |
| CRUD laudos | Frontend usava `crudList("recursos")` em vez de `"recursos-detalhados"` | 1007e0a |
| Endpoint pendentes | Filtrava apenas status "submetido" — adicionado "proposta_enviada", "em_pregao" | 3cdd5d4 |
