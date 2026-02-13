# PLANO: Cobertura Total UI + Funcional do CARA SISTEMA.pdf

## Contexto

O documento CARA SISTEMA.pdf define a visao completa do sistema facilicita.ia para gestao inteligente de licitacoes. A implementacao atual tem ~41% de cobertura UI (mock) e ~12% de cobertura funcional. O gap critico e o sistema de scores multi-dimensionais e a comparacao Edital vs Portfolio, que representam o diferencial do produto mas estao a 0%.

O plano sera salvo tambem em `docs/plano_cara_sistema.md` no repositorio.

---

## FASE 1: Conectar Paginas Existentes a APIs Existentes (Quick Wins)

**Objetivo**: Trocar dados mock por dados reais. Sem criar rotas novas - usar APIs ja existentes.

### 1.1 CaptacaoPage - Busca Real de Editais [M]
- **Frontend**: `frontend/src/pages/CaptacaoPage.tsx` - trocar `mockResultados` por chamada a `POST /api/chat` com intent `buscar_editais`
- **API Client**: `frontend/src/api/client.ts` - adicionar `searchEditais(termo, fonte, uf, calcularScore, incluirEncerrados)`
- **Backend usado**: `tool_buscar_editais_fonte` + `tool_calcular_score_aderencia` (tools.py)
- **Resultado**: Busca real no PNCP, scores reais, salvamento real no banco

### 1.2 ValidacaoPage - Carregar Editais do Banco [S]
- **Frontend**: `frontend/src/pages/ValidacaoPage.tsx` - trocar `mockEditais` por `getEditais()`
- **Backend usado**: `GET /api/editais` (app.py:6575), `GET /api/editais/:id` (app.py:6552)
- **Funcoes**: Resumir via `POST /api/chat` (intent `resumir_edital`), Perguntar via `perguntar_edital`, PDF via `GET /api/editais/:id/pdf`
- **Resultado**: Editais reais do banco, resumo e perguntas via LLM

### 1.3 PortfolioPage - Carregar Produtos do Banco [S]
- **Frontend**: `frontend/src/pages/PortfolioPage.tsx` - trocar `mockProdutos` por `getProdutos()`
- **Backend usado**: `GET /api/produtos` (app.py:6541), `POST /api/upload` para upload
- **Funcoes**: Upload real de PDF, reprocessamento via `reprocessar_produto`, completude via `verificar_completude`
- **Resultado**: Produtos reais com specs extraidas pela IA

### 1.4 PrecificacaoPage - Precos Reais do PNCP [M]
- **Frontend**: `frontend/src/pages/PrecificacaoPage.tsx`
- **Backend usado**: `tool_buscar_precos_pncp` (tools.py:4554), `tool_recomendar_preco` (tools.py:4953)
- **Resultado**: Precos reais do PNCP, recomendacao de preco pela IA

### 1.5 PropostaPage - Geracao Real de Propostas [M]
- **Frontend**: `frontend/src/pages/PropostaPage.tsx`
- **Backend usado**: `GET /api/propostas`, `tool_gerar_proposta` (tools.py:2179)
- **Resultado**: Propostas geradas pelo DeepSeek, persistidas no banco

### 1.6 Dashboard - KPIs Reais [M]
- **Frontend**: `frontend/src/components/Dashboard.tsx`
- **Backend usado**: `GET /api/editais` (contagens por status), `POST /api/chat` (intent `mindsdb_resumo`)
- **Resultado**: Dashboard com numeros reais

### 1.7 ConcorrenciaPage, MonitoriaPage, FlagsPage - Dados Reais [M]
- **Frontend**: 3 paginas, trocar mock por chamadas via `POST /api/chat` com intents existentes
- **Backend usado**: `tool_listar_concorrentes`, `tool_listar_monitoramentos`, `tool_listar_alertas`
- **Resultado**: Dados reais de concorrentes, monitoramentos e alertas

### 1.8 FollowupPage, PerdasPage, LancesPage - Resultados Reais [M]
- **Frontend**: 3 paginas
- **Backend usado**: `GET /api/editais` filtrado por status, `tool_registrar_resultado`
- **Resultado**: Tracking real de resultados

---

## FASE 2: Criar APIs REST Diretas + Conectar

**Objetivo**: Criar endpoints REST diretos para operacoes que hoje so funcionam via chat. CRUD para entidades sem API.

### 2.1 API de Busca Direta de Editais [L]
- **Backend**: `POST /api/editais/search` em `backend/app.py`
- **Logica**: Extrair de `tool_buscar_editais_fonte` (tools.py:1513)
- **Motivo**: Chamada direta e mais rapida que passar pelo pipeline de chat

### 2.2 API de Atualizacao de Status de Edital [S]
- **Backend**: `PATCH /api/editais/:id` em `backend/app.py`
- **Campos**: status, categoria, intencao_estrategica

### 2.3 CRUD Empresa [M]
- **Modelo novo**: `Empresa`, `EmpresaDocumento`, `Responsavel` em `backend/models.py`
- **Endpoints**: `GET/PUT /api/empresa`, CRUD `/api/empresa/documentos`, CRUD `/api/empresa/responsaveis`
- **Frontend**: Conectar `EmpresaPage.tsx`

### 2.4 CRUD Parametrizacoes [L]
- **Modelo novo**: `ClasseProduto`, `Parametrizacao` (key-value) em `backend/models.py`
- **Endpoints**: `GET/PUT /api/parametrizacoes`, CRUD `/api/classes`
- **Frontend**: Conectar `ParametrizacoesPage.tsx`

### 2.5 API Direta de Calculo de Score [L]
- **Backend**: `POST /api/analises/calcular` em `backend/app.py`
- **Logica**: Extrair de `tool_calcular_aderencia` (tools.py:1905)

### 2.6 API Direta de Geracao de Proposta [M]
- **Backend**: `POST /api/propostas/gerar`
- **Logica**: Extrair de `tool_gerar_proposta` (tools.py:2179)

### 2.7 CRUD Monitoramento/Alertas/Notificacoes [M]
- **Endpoints**: CRUD `/api/monitoramentos`, `/api/alertas`, `/api/notificacoes`
- **Modelos existentes**: `Monitoramento` (models.py:708), `Alerta` (models.py:654), `Notificacao` (models.py:760)

### 2.8 CRUD Resultados/Concorrentes/Precos [M]
- **Endpoints**: `POST /api/resultados`, `GET /api/precos-historicos`, CRUD `/api/concorrentes`
- **Modelos existentes**: `PrecoHistorico` (models.py:571), `Concorrente` (models.py:536)

---

## FASE 3: Sistema de Scores Multi-Dimensionais (Diferencial Core)

**Objetivo**: Implementar os 6 scores descritos nas paginas 5, 7 e 8 do CARA SISTEMA.pdf.

### 3.1 Estender Modelo Analise [M]
- **Arquivo**: `backend/models.py` - estender `Analise`
- **Novos campos**: `score_documental`, `score_juridico`, `score_logistico`, `score_portfolio`, `score_recomendacao`, `intencao_estrategica`, `expectativa_margem`, `potencial_ganho`, `fatal_flaws` (JSON), `flags_juridicos` (JSON), `sinais_mercado` (JSON), `analise_lote` (JSON), `justificativa_decisao`

### 3.2 Motor de Calculo de Scores (6 dimensoes) [XL]
- **Arquivo novo**: `backend/calculadora_score.py`
- **6 dimensoes**:
  - **Score Tecnico (30%)**: Comparar `EditalRequisito` tipo=tecnico vs `ProdutoEspecificacao` via LLM
  - **Score Comercial (20%)**: Regiao, prazo, categoria, precos historicos
  - **Score Portfolio (20%)**: Cobertura de itens do lote, deteccao de itens intrusos
  - **Score Documental (10%)**: `EditalRequisito` tipo=documental vs `EmpresaDocumento` + validade
  - **Score Juridico (10%)**: LLM analisa texto do edital para riscos legais
  - **Score Logistico (10%)**: Distancia, frequencia de entrega, custo
- **Pesos configuraveis** via `Parametrizacao`

### 3.3 Comparacao Edital vs Portfolio (Trecho a Trecho) [XL]
- **Backend**: `GET /api/analises/:id/comparacao` em `backend/app.py`
- **Logica**: LLM compara cada requisito do edital com specs do produto, retorna JSON estruturado com `trecho_edital`, `trecho_portfolio`, `aderencia_percentual`, `gaps`

### 3.4 Frontend - Dashboard de Scores Multi-Dimensionais [XL]
- **ValidacaoPage.tsx**: Overhaul completo
  - Topo: Resumo + botoes Participar/Acompanhar/Ignorar com justificativa
  - Esquerda: Sinais de mercado, analise de lote
  - Direita: Score dashboard com 6 barras + radar chart
  - Abas: Objetiva / Analitica / Cognitiva
  - Baixo: Tabela comparacao trecho-a-trecho
- **CaptacaoPage.tsx**: Coluna "Produto Correspondente", tooltip multi-score, contador de prazos
- **Componentes novos**: `ScoreRadar.tsx`, `AderenciaComparacao.tsx`, `ScoreDetailTabs.tsx`

### 3.5 Frontend - Intencao Estrategica e Gap Analysis [M]
- **ValidacaoPage.tsx**: Radio buttons (Estrategico/Defensivo/Acompanhamento/Aprendizado), slider margem, painel de gaps, campo justificativa

---

## FASE 4: Features Avancadas de Inteligencia

**Objetivo**: Memoria corporativa, sinais de mercado, fatal flaws - o que faz o sistema "aprender".

### 4.1 Memoria Corporativa Permanente [XL]
- **Modelo novo**: `MemoriaCorporativa` em `backend/models.py`
- **Logica**: Ao registrar resultado (vitoria/derrota), extrair padroes e armazenar
- **Uso**: Alimentar scores e alertas com aprendizado historico

### 4.2 Reputacao do Orgao [L]
- **Modelo novo**: `ReputacaoOrgao` em `backend/models.py`
- **Dados**: Pregoeiro rigoroso, bom pagador, historico de problemas
- **Frontend**: Card no ValidacaoPage

### 4.3 Sinais de Mercado [L]
- **Backend**: Nova funcao em `backend/tools.py`
- **Detecta**: Concorrente dominante, suspeita de licitacao direcionada, preco predatorio
- **Frontend**: Badges no ValidacaoPage

### 4.4 Fatal Flaws Auto-Deteccao [L]
- **Backend**: Nova funcao em `backend/tools.py`
- **Detecta**: Certificacao obrigatoria faltando, documento vencido, requisito hard nao atendido
- **Frontend**: Badge vermelho prominente no ValidacaoPage

### 4.5 Checklist Documental [M]
- **Backend**: Cruzar `EditalRequisito` tipo=documental vs `EmpresaDocumento`
- **Frontend**: Checklist no ValidacaoPage (OK / Vencido / Faltando)

### 4.6 Analise de Lote / Item Intruso [L]
- **Backend**: Para cada `EditalItem`, verificar se empresa tem produto correspondente
- **Frontend**: Barra horizontal de segmentos coloridos (verde=aderente, amarelo=intruso)

### 4.7 Alerta de Recorrencia [M]
- **Backend**: Buscar em `MemoriaCorporativa` editais similares rejeitados/perdidos
- **Frontend**: Card "Editais semelhantes foram recusados X vezes por Y motivo"

### 4.8 Flags Juridicos [M]
- **Backend**: LLM analisa texto do edital para aglutinacao indevida, restricao regional, marca especifica
- **Frontend**: Badges no ValidacaoPage

---

## FASE 5: Polimento e Paginas Restantes

### 5.1 Dashboard conforme PDF pagina 1 [M]
- Barra de badges de status, campo buscar editais, 3 cards de atencao, barra de atalhos inferior, secao "O que o sistema aprendeu"

### 5.2 Corrigir Ordem do Menu Sidebar [S]
- `frontend/src/components/Sidebar.tsx`: Reordenar para Captacao > Validacao > Precificacao > Proposta > Submissao > Lances > Followup > Impugnacao > Producao > CRM

### 5.3 ImpugnacaoPage - Geracao de Texto com IA [M]
- Conectar a `gerador_documentos.py` para gerar impugnacao/recurso

### 5.4 CRMPage - Backend Completo [M]
- Modelos novos: `Lead`, `MetaVendedor`
- CRUD endpoints

### 5.5 ProducaoPage / ContratadoRealizadoPage [M]
- Modelos novos: `Contrato`, `Entrega`
- CRUD endpoints

---

## RESUMO

| Fase | Tarefas | Duracao Estimada | Valor Entregue |
|------|---------|-----------------|----------------|
| **Fase 1** | 8 tarefas (S-M) | 2-3 semanas | Todas as paginas com dados reais |
| **Fase 2** | 8 tarefas (S-L) | 3-4 semanas | APIs REST diretas, CRUD completo |
| **Fase 3** | 5 tarefas (M-XL) | 4-6 semanas | **Diferencial: scores multi-dimensionais** |
| **Fase 4** | 8 tarefas (M-XL) | 4-6 semanas | Inteligencia: memoria, sinais, fatal flaws |
| **Fase 5** | 5 tarefas (S-M) | 2-3 semanas | Polimento e paginas restantes |
| **TOTAL** | **34 tarefas** | **15-22 semanas** | **100% cobertura UI + funcional** |

## Arquivos Criticos

- `backend/tools.py` (6117 linhas) - Todas as funcoes de ferramenta, score, busca
- `backend/models.py` (958 linhas) - 19 modelos ORM + novos a criar
- `backend/app.py` - 28 rotas existentes + 25+ novas
- `frontend/src/pages/ValidacaoPage.tsx` - Pagina mais defasada, precisa overhaul completo
- `frontend/src/pages/CaptacaoPage.tsx` - Segunda mais importante
- `frontend/src/api/client.ts` - Cliente API, precisa 20+ funcoes novas
- `frontend/src/components/common/` - Componentes reutilizaveis ja existentes (DataTable, ScoreBadge, ScoreBar, ScoreCircle, Modal, etc.)
- `backend/calculadora_score.py` - NOVO: motor de scores 6-dimensionais

## Verificacao

Apos cada fase, testar:
1. `cd /mnt/data1/progpython/agenteditais && python -m backend.app` (backend porta 5007)
2. `cd frontend && npm run dev` (frontend porta 5175)
3. Fazer login, navegar por cada pagina, verificar dados reais
4. Testar busca de editais, calculo de score, geracao de proposta
5. Verificar persistencia no MySQL (banco `editais`)
