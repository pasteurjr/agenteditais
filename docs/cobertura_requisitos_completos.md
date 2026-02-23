# Cobertura de Requisitos — Analise Atualizada pos-Onda 2

**Data:** 2026-02-22
**Base:** `docs/requisitos_completos.md` (40 RFs + 4 RNFs, escrito em 2026-02-10)
**Atualizacao:** Analise cruzada do estado ATUAL do codigo apos implementacao da Onda 2 + correcao de 10 bugs

---

## Metodologia

O documento `requisitos_completos.md` foi escrito em 2026-02-10, ANTES da implementacao da Onda 2. Muitos itens marcados como "MOCK (UI)" ou "NAO IMPLEMENTADO" foram implementados posteriormente com:
- 14 novos models SQLAlchemy (`backend/models.py`)
- 37 tabelas no CRUD generico (`backend/crud_routes.py`)
- 8 paginas frontend conectadas ao backend via `crudList/crudCreate/crudUpdate/crudDelete`
- Endpoints especiais (upload, download, scores-validacao, gerar-classes, etc.)

**Legenda de Status Atualizada:**

| Status | Significado |
|--------|------------|
| **IMPLEMENTADO** | Backend (model + CRUD + endpoints) E Frontend (pagina conectada ao backend) |
| **IMPLEMENTADO (Agente)** | Backend funcional via chat, sem pagina CRUD dedicada |
| **PARCIAL** | Parte implementada (ex: backend existe mas frontend ainda mock, ou frontend existe mas sem todas funcionalidades) |
| **MOCK (UI)** | Pagina frontend existe com dados ficticios hardcoded, backend existe com model+CRUD mas nao conectado |
| **NAO IMPLEMENTADO** | Funcionalidade especifica nao existe (embora infra possa existir) |

---

## Resumo Executivo

| Status (antes - 10/02) | Qtd antes | Status (agora - 22/02) | Qtd agora | Delta |
|------------------------|-----------|------------------------|-----------|-------|
| IMPLEMENTADO | 7 | IMPLEMENTADO | 14 | +7 |
| IMPLEMENTADO (Agente) | 5 | IMPLEMENTADO (Agente) | 4 | -1 |
| PARCIAL | 14 | PARCIAL | 14 | 0 |
| MOCK (UI) | 8 | MOCK (Backend+UI) | 5 | -3 |
| NAO IMPLEMENTADO | 6 | NAO IMPLEMENTADO | 3 | -3 |
| **Total** | **40** | **Total** | **40** | — |

---

## 2.1 CONFIGURACAO

---

### RF-001: Cadastro da Empresa

- **Status anterior:** MOCK (UI)
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `Empresa` em `backend/models.py`
  - CRUD: `"empresas"` em `backend/crud_routes.py:58` — user_scoped, search_fields: cnpj, razao_social, nome_fantasia, cidade
  - Campos: id, user_id, cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, telefone, email, porte, areas_atuacao (JSON)
- **Onde (Frontend):**
  - `frontend/src/pages/EmpresaPage.tsx` — usa `crudList("empresas")`, `crudCreate("empresas")`, `crudUpdate("empresas")`
  - Formulario completo com todos os campos, salvar/cancelar funcional
  - Dados persistem no banco MySQL
- **Gaps restantes:** Nenhum gap critico. Campos editaveis e persistentes.

---

### RF-002: Documentos Habilitativos da Empresa

- **Status anterior:** MOCK (UI)
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `EmpresaDocumento` em `backend/models.py`
  - CRUD: `"empresa-documentos"` em `backend/crud_routes.py:65` — parent_fk: empresa_id
  - Endpoint especial: `POST /api/empresa-documentos/upload` em `backend/app.py:7495` — aceita FormData (file, empresa_id, tipo, data_vencimento)
  - Endpoint especial: `GET /api/empresa-documentos/<doc_id>/download` em `backend/app.py:7610`
  - Campos: tipo (enum: contrato_social, atestado_capacidade, balanco, alvara, registro_conselho, procuracao, outro), nome_arquivo, path_arquivo, data_emissao, data_vencimento, texto_extraido, processado
- **Onde (Frontend):**
  - `frontend/src/pages/EmpresaPage.tsx` — secao de documentos com upload via FormData, listagem via crudList, visualizar/download com auth token
  - Bug B1 (upload nao enviava arquivo) **CORRIGIDO** — agora usa FormData + fetch
  - Mapeamento de campos corrigido (nome_arquivo, path_arquivo, data_vencimento)
- **Gaps restantes:** Integracao com Processo Amanda (organizacao em pastas por edital) — escopo futuro.

---

### RF-003: Certidoes Automaticas

- **Status anterior:** MOCK (UI)
- **Status atual:** **PARCIAL**
- **Onde (Backend):**
  - Model: `EmpresaCertidao` em `backend/models.py`
  - CRUD: `"empresa-certidoes"` em `backend/crud_routes.py:74` — parent_fk: empresa_id
  - Endpoint especial: `GET /api/empresa-certidoes/<certidao_id>/download` em `backend/app.py:7655`
  - Endpoint especial: `POST /api/empresa-certidoes/buscar-automatica` em `backend/app.py:7947`
  - Campos: tipo (enum: cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, outro), orgao_emissor, numero, data_emissao, data_vencimento, path_arquivo, status (enum: valida, vencida, pendente), url_consulta
- **Onde (Frontend):**
  - `frontend/src/pages/EmpresaPage.tsx` — card de certidoes com botao "Em breve" (desabilitado, funcionalidade futura)
  - CRUD basico disponivel via crudList/crudCreate
- **O que falta:** Consulta automatica a APIs governamentais (funcionalidade "Em breve"), scheduler de verificacao periodica, alerta de vencimento automatico.

---

### RF-004: Alertas IA sobre Documentos

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **NAO IMPLEMENTADO**
- **Onde (Backend):** Nenhuma tool especifica de analise de documentos da empresa pela IA. Model `Alerta` existe mas nao ha tool para gerar alertas sobre documentos da empresa.
- **Onde (Frontend):** Nenhuma interface dedicada.
- **Gaps:** Criar tool_analisar_documentos_empresa para verificar coerencia e validade via LLM.

---

### RF-005: Portfolio de Produtos

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Models: `Produto`, `ProdutoEspecificacao`, `ProdutoDocumento` em `backend/models.py`
  - CRUD: `"produtos"` (crud_routes.py:93), `"produtos-especificacoes"` (:100), `"produtos-documentos"` (:109)
  - Tools: tool_processar_upload, tool_extrair_especificacoes, tool_reprocessar_produto, tool_atualizar_produto, tool_excluir_produto, tool_listar_produtos, tool_verificar_completude_produto
  - REST: `GET /api/produtos` (app.py:6566), `GET /api/produtos/<id>` (app.py:6577)
- **Onde (Frontend):**
  - `frontend/src/pages/PortfolioPage.tsx` — usa getProdutos(), getProduto() do client.ts
  - 6 cards de fontes (ANVISA, cadastro manual, upload PDF, busca web, etc.)
  - Cadastro manual com categoria (enum ID) — Bug B3 CORRIGIDO
  - Arvore de classificacao, specs, tabela completude
- **Gaps restantes:** Monitoramento continuo de catalogo como rotina automatica.

---

### RF-006: Classes e Subclasses de Produtos

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **Onde (Backend):**
  - Tabelas legado: `classe_produto` (10 registros), `campo_classe` (38 registros) — sem model SQLAlchemy
  - Enum `categoria` em Produto com 9 valores
  - Endpoint: `POST /api/parametrizacoes/gerar-classes` em `backend/app.py:7699` — gera classes via IA
- **Onde (Frontend):**
  - `frontend/src/pages/ParametrizacoesPage.tsx` — arvore de classes com criar/editar/excluir (state local)
  - Bug B7 CORRIGIDO — botoes editar/excluir agora funcionais
  - Classes/subclasses NAO persistem no backend (state local apenas)
- **O que melhorou:** UI de classes funcional com CRUD local (B7 fix). Endpoint de geracao via IA.
- **O que falta:** Criar models ClasseProduto/CampoClasse, conectar CRUD ao backend, subclasses hierarquicas com persistencia.

---

### RF-007: Mascara Parametrizavel de Descricao

- **Status anterior:** PARCIAL (UI)
- **Status atual:** **PARCIAL**
- **Onde (Backend):** Nenhuma implementacao especifica de mascara/template.
- **Onde (Frontend):** `ParametrizacoesPage.tsx` — campo de mascara visivel na UI, sem funcionalidade de aplicacao.
- **O que falta:** Criar campo mascara_descricao na tabela classe_produto, implementar tool_aplicar_mascara_descricao.

---

### RF-008: Fontes de Editais

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `FonteEdital` em `backend/models.py`
  - CRUD: `"fontes-editais"` em `backend/crud_routes.py:119` — global (nao user_scoped)
  - Tools: tool_cadastrar_fonte, tool_listar_fontes, tool_buscar_editais_fonte, tool_buscar_editais_scraper
  - REST: `GET /api/fontes` (app.py:6871)
- **Onde (Frontend):**
  - `frontend/src/pages/ParametrizacoesPage.tsx` — aba "Fontes de Busca" com crudList("fontes-editais"), criar, editar, excluir fontes
  - Cadastro de palavras-chave e NCMs por fonte
  - 17 fontes cadastraveis, toggle ativo/inativo
- **Gaps restantes:** Nenhum gap significativo.

---

### RF-009: Parametros Comerciais (Scores)

- **Status anterior:** PARCIAL (UI)
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `ParametroScore` em `backend/models.py`
  - CRUD: `"parametros-score"` em `backend/crud_routes.py:306` — user_scoped
  - Campos: peso_tecnico, peso_comercial, peso_participacao, peso_ganho, limiar_go, limiar_nogo, margem_minima
- **Onde (Frontend):**
  - `frontend/src/pages/ParametrizacoesPage.tsx` — aba "Score Comercial" com crudList/crudUpdate("parametros-score")
  - TAM/SAM/SOM editaveis — Bug B4 CORRIGIDO (states com setters)
  - Prazo/Frequencia editaveis — Bug B9 CORRIGIDO
  - 6 norteadores de score com cards
- **O que melhorou:** Campos editaveis funcionais. Model+CRUD criados e conectados.
- **O que falta:** Fazer tool_calcular_aderencia ler pesos do parametro_score em vez de hardcoded. TAM/SAM/SOM e Prazo/Frequencia estao em state local (persistencia backend = Onda 4).

---

## 2.2 FLUXO COMERCIAL

---

### RF-010: Captacao de Editais

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Tools: tool_buscar_editais_fonte (PNCP), tool_buscar_editais_scraper, tool_calcular_score_aderencia, tool_salvar_editais_selecionados, tool_classificar_edital, tool_web_search, tool_buscar_links_editais
  - Model: `Edital` com CRUD "editais" (crud_routes.py:128)
  - REST: `GET /api/editais/buscar` (app.py:7075), `GET /api/editais/salvos` (app.py:7167)
- **Onde (Frontend):**
  - `frontend/src/pages/CaptacaoPage.tsx` — busca com filtros (tipo, origem, fonte, UF, termo), tabela com scores
  - Classificacao por cor: verde (>=80), amarelo (50-79), vermelho (<50) — implementado via CSS classes `row-score-high`, `row-score-medium`
  - Painel lateral com ScoreCircle, sub-scores, gaps tooltips
  - Intencao estrategica + margem: 4 radios (Estrategico/Defensivo/Acompanhamento/Aprendizado) + slider margem + toggles "Varia por Produto/Regiao"
- **O que melhorou:** Classificacao por cor IMPLEMENTADA. Intencao estrategica IMPLEMENTADA. Margem IMPLEMENTADA.
- **Gaps restantes:** Nenhum gap critico. Os gaps listados no requisitos_completos.md (cor, intencao, margem) foram todos implementados.

---

### RF-011: Validacao / Analise de Edital

- **Status anterior:** PARCIAL
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Tools: tool_extrair_requisitos, tool_calcular_aderencia, tool_resumir_edital, tool_perguntar_edital, tool_extrair_datas_edital, tool_calcular_scores_validacao
  - Endpoint: `POST /api/editais/<id>/scores-validacao` (app.py:7247) — retorna 6 dimensoes: tecnico, documental, complexidade, juridico, logistico, comercial
  - Models: `Analise`, `AnaliseDetalhe`, `EstrategiaEdital`
  - Endpoint: `GET /api/editais/<id>/documentacao-necessaria` (app.py:7859)
  - Endpoint: `POST /api/editais/<id>/vincular-documento` (app.py:7793)
- **Onde (Frontend):**
  - `frontend/src/pages/ValidacaoPage.tsx` — alimentada 100% pelo backend
  - 3 abas: Objetiva, Analitica, Cognitiva
  - Tab Objetiva: Aderencia Tecnica, Checklist Documental, Mapa Logistico, Analise de Lote, GO/NO-GO
  - Tab Analitica: Pipeline Riscos + Flags Juridicos, Reputacao do Orgao, Alerta Recorrencia, Trecho-a-Trecho
  - Tab Cognitiva: Resumo IA, Historico Semelhantes, Pergunte a IA
  - Processo Amanda: 3 pastas (Habilitacao, Proposta, Decisao), 10 documentos, 14 StatusBadges
  - Decisao: Participar/Acompanhar/Ignorar com justificativa + dropdown 9 motivos
  - Score Dashboard: 6 sub-scores, 4 radios intencao, slider margem
- **O que melhorou:** 6 risk scores (vs 4 anteriores). Analise de lote (itens intrusos). Reputacao do orgao. Decisao go/no-go. Processo Amanda. Tudo implementado.
- **Gaps restantes:** Dados dependem de enriquecimento via scores-validacao. Reputacao do orgao mostra "-" quando sem dados.

---

### RF-012: Impugnacao de Edital

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend melhorou, frontend ainda mock)
- **Onde (Backend):**
  - Model: `Recurso` em `backend/models.py` (tipo enum inclui: recurso, contra_razao, impugnacao)
  - CRUD: `"recursos"` em `backend/crud_routes.py:267` — user_scoped, required: edital_id, tipo, prazo_limite
  - Campos: motivo, texto_minuta (longtext), fundamentacao_legal, data_protocolo, prazo_limite, status, resultado, arquivo_path
  - Tool: tool_perguntar_edital pode ser usada para analise juridica via prompt
- **Onde (Frontend):**
  - `frontend/src/pages/ImpugnacaoPage.tsx` — dados MOCK hardcoded (mockEditais, mockImpugnacoes)
  - NAO conectada ao CRUD "recursos"
- **O que melhorou:** Model Recurso criado com CRUD completo.
- **O que falta:** Conectar ImpugnacaoPage ao CRUD "recursos". Criar tool_gerar_impugnacao e tool_identificar_termos_direcionados.

---

### RF-013: Precificacao

- **Status anterior:** IMPLEMENTADO (Agente)
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Tools: tool_recomendar_preco, tool_historico_precos, tool_buscar_precos_pncp
  - Models: `PrecoHistorico` (CRUD "precos-historicos" em crud_routes.py:196)
- **Onde (Frontend):**
  - `frontend/src/pages/PrecificacaoPage.tsx` — usa crudList("preco-historico"), getEditais(), getProdutos()
  - Tabela de historico de precos carregada do backend
  - Selects de editais e produtos do banco
- **O que melhorou:** PrecificacaoPage agora consome dados reais do backend (era mock).
- **Gaps restantes:** Margem desejada como parametro configuravel (existe em parametro_score mas nao conectado a precificacao).

---

### RF-014: Geracao de Proposta Tecnica

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `Proposta` (CRUD "propostas" em crud_routes.py:180)
  - Tools: tool_gerar_proposta (gera texto via LLM com 8 secoes)
  - REST: `GET /api/propostas` (app.py:6919), `GET /api/propostas/<id>` (app.py:6934)
  - Endpoint: `PUT /api/propostas/<id>/status` (app.py:7273) — atualiza status
  - Endpoint: `GET /api/propostas/<id>/export` (app.py:7345) — exporta proposta
- **Onde (Frontend):**
  - `frontend/src/pages/PropostaPage.tsx` — usa crudList("propostas"), crudCreate, crudDelete, getEditais, getProdutos
  - Formulario de nova proposta com selects de editais e produtos do banco
  - Botao "Sugerir Preco" integrado
  - Visualizacao de conteudo da proposta
- **O que melhorou:** PropostaPage agora conectada ao backend (era parcialmente mock).
- **Gaps restantes:** Exportacao para DOCX/PDF (gera apenas Markdown). Endpoint /export existe mas formato limitado.

---

### RF-015: Submissao de Proposta

- **Status anterior:** MOCK (UI)
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `Proposta` tem campo status (enum: rascunho, revisao, aprovada, enviada)
  - Endpoint: `PUT /api/propostas/<id>/status` (app.py:7273)
  - Tool: tool_atualizar_status_proposta
- **Onde (Frontend):**
  - `frontend/src/pages/SubmissaoPage.tsx` — usa crudList("propostas"), crudUpdate
  - Mapeamento via mapCrudToPropostaPronta()
  - Workflow de submissao funcional
- **O que melhorou:** SubmissaoPage agora conectada ao backend.
- **Gaps restantes:** Checklist de documentos exigidos por edital (parcial), integracao com portais de compras.

---

### RF-016: Disputa de Lances (Robo de Lances)

- **Status anterior:** MOCK (UI)
- **Status atual:** **MOCK (Backend+UI)**
- **Onde (Backend):** Nenhuma tool de lances. Nenhum model Lance dedicado.
- **Onde (Frontend):** `frontend/src/pages/LancesPage.tsx` — dados MOCK hardcoded (mockPregoesHoje, mockHistorico). Nao conectado ao backend.
- **O que falta:** Model Lance, tools de simulacao/sugestao, integracao com portais de pregao. Complexidade ALTA (requer acesso ao sistema do orgao).

---

### RF-017: Follow-up / Acompanhamento Pos-Pregao

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend existe, frontend mock)
- **Onde (Backend):**
  - Tools: tool_registrar_resultado, tool_extrair_ata_pdf, tool_buscar_atas_pncp, tool_baixar_ata_pncp
  - Models: PrecoHistorico (resultado, motivo_perda), ParticipacaoEdital
- **Onde (Frontend):**
  - `frontend/src/pages/FollowupPage.tsx` — dados MOCK hardcoded (mockAguardando, mockResultados)
  - NAO conectado ao backend
- **O que falta:** Conectar FollowupPage ao CRUD de editais/precos-historicos. Notificacao automatica de resultado.

---

### RF-018: Recurso / Contra-Razoes

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **PARCIAL** (backend criado, frontend nao dedicado)
- **Onde (Backend):**
  - Model: `Recurso` em `backend/models.py` (tipo enum: recurso, contra_razao, impugnacao)
  - CRUD: `"recursos"` em `backend/crud_routes.py:267`
  - Campos completos: motivo, texto_minuta, fundamentacao_legal, data_protocolo, prazo_limite, status, resultado, arquivo_path
- **Onde (Frontend):** Nenhuma pagina dedicada. O model Recurso pode ser acessado via CRUD generico mas nao ha RecursoPage.tsx.
- **O que melhorou:** Model + CRUD criados (era zero).
- **O que falta:** Criar RecursoPage.tsx. Criar tool_gerar_recurso e tool_gerar_contra_razoes via LLM.

---

### RF-019: CRM Ativo (Relacionamento com Orgaos)

- **Status anterior:** MOCK (UI)
- **Status atual:** **MOCK (Backend+UI)** — backend criado, frontend nao conectado
- **Onde (Backend):**
  - Model: `LeadCRM` em `backend/models.py`
  - CRUD: `"leads-crm"` em `backend/crud_routes.py:275` — user_scoped
  - Model: `AcaoPosPerda` em `backend/models.py`
  - CRUD: `"acoes-pos-perda"` em `backend/crud_routes.py:282`
- **Onde (Frontend):**
  - `frontend/src/pages/CRMPage.tsx` — dados MOCK hardcoded (mockLeads, mockMetas, mockAcoesPosPerda)
  - NAO conectado ao CRUD "leads-crm" e "acoes-pos-perda"
- **O que melhorou:** Models e CRUDs criados.
- **O que falta:** Conectar CRMPage aos CRUDs existentes.

---

### RF-020: Execucao de Contrato (Producao)

- **Status anterior:** MOCK (UI)
- **Status atual:** **MOCK (Backend+UI)** — backend criado, frontend nao conectado
- **Onde (Backend):**
  - Model: `Contrato` em `backend/models.py`
  - CRUD: `"contratos"` em `backend/crud_routes.py:250` — user_scoped
  - Model: `ContratoEntrega` em `backend/models.py`
  - CRUD: `"contrato-entregas"` em `backend/crud_routes.py:257` — parent_fk: contrato_id
- **Onde (Frontend):**
  - `frontend/src/pages/ProducaoPage.tsx` — dados MOCK hardcoded (mockContratos)
  - NAO conectado ao CRUD "contratos" e "contrato-entregas"
- **O que melhorou:** Models e CRUDs criados.
- **O que falta:** Conectar ProducaoPage aos CRUDs existentes.

---

### RF-021: Contratado x Realizado / Atrasos

- **Status anterior:** MOCK (UI)
- **Status atual:** **MOCK (Backend+UI)** — depende de RF-020
- **Onde (Backend):** Depende dos models `Contrato` e `ContratoEntrega` (criados).
- **Onde (Frontend):**
  - `frontend/src/pages/ContratadoRealizadoPage.tsx` — dados MOCK hardcoded (mockContratos, mockAtrasos, mockProximosVencimentos)
  - NAO conectado ao backend
- **O que melhorou:** Infraestrutura backend existe.
- **O que falta:** Conectar ContratadoRealizadoPage aos CRUDs de contratos e entregas.

---

## 2.3 INDICADORES

---

### RF-022: Flags (Sinalizadores)

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend existe, frontend mock)
- **Onde (Backend):**
  - Models: `Alerta`, `Edital` (datas de prazos)
  - CRUD: `"alertas"` em `backend/crud_routes.py:213`
  - Tools: tool_dashboard_prazos, tool_listar_alertas, tool_calendario_editais
- **Onde (Frontend):**
  - `frontend/src/pages/FlagsPage.tsx` — dados MOCK hardcoded (mockAlertasAtivos, mockAlertas)
  - NAO conectado ao CRUD "alertas"
- **O que falta:** Conectar FlagsPage ao CRUD de alertas.

---

### RF-023: Monitoria (Monitoramento Automatico)

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend + frontend parcial)
- **Onde (Backend):**
  - Models: `Monitoramento` (CRUD "monitoramentos"), `Notificacao` (CRUD "notificacoes"), `PreferenciasNotificacao` (CRUD "preferencias-notificacao")
  - Tools: tool_configurar_monitoramento, tool_listar_monitoramentos, tool_desativar_monitoramento
  - Endpoint: `POST /api/notificacoes/enviar-email` (app.py:8097)
  - Endpoint: `GET /api/notificacoes/config-smtp` (app.py:8173)
- **Onde (Frontend):**
  - `frontend/src/pages/MonitoriaPage.tsx` — dados MOCK hardcoded (mockMonitoramentos, mockEncontrados)
  - NAO conectado ao CRUD "monitoramentos"
  - CaptacaoPage.tsx — usa crudList("monitoramentos") para listar monitoramentos ativos
- **O que melhorou:** Endpoints de email criados.
- **O que falta:** Conectar MonitoriaPage ao CRUD. Scheduler de execucao automatica. Envio real de email/push.

---

### RF-024: Concorrencia (Inteligencia Competitiva)

- **Status anterior:** IMPLEMENTADO (Agente)
- **Status atual:** **IMPLEMENTADO (Agente)** — backend funcional via chat, frontend mock
- **Onde (Backend):**
  - Models: `Concorrente` (CRUD "concorrentes"), `ParticipacaoEdital` (CRUD "participacoes-editais"), `PrecoHistorico`
  - Tools: tool_listar_concorrentes, tool_analisar_concorrente, tool_extrair_ata_pdf
- **Onde (Frontend):**
  - `frontend/src/pages/ConcorrenciaPage.tsx` — dados MOCK hardcoded
  - NAO conectado ao CRUD "concorrentes"
- **O que falta:** Conectar ConcorrenciaPage ao CRUD de concorrentes.

---

### RF-025: Mercado (TAM/SAM/SOM)

- **Status anterior:** MOCK (UI)
- **Status atual:** **PARCIAL**
- **Onde (Backend):** tool_consulta_mindsdb para analytics. Campos TAM/SAM/SOM editaveis no frontend (state local, sem persistencia).
- **Onde (Frontend):**
  - `frontend/src/pages/MercadoPage.tsx` — dados MOCK hardcoded (mockTendencias, mockCategorias)
  - `frontend/src/pages/ParametrizacoesPage.tsx` — campos TAM/SAM/SOM editaveis (Bug B4 corrigido) mas em state local
- **O que melhorou:** Campos TAM/SAM/SOM editaveis na UI.
- **O que falta:** Conectar MercadoPage ao backend. Criar tool_calcular_tam_sam_som. Persistir TAM/SAM/SOM.

---

### RF-026: Perdas (Monitoramento de Perdas)

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend existe, frontend mock)
- **Onde (Backend):**
  - Models: PrecoHistorico (resultado, motivo_perda), AcaoPosPerda (CRUD "acoes-pos-perda")
  - Tools: tool_registrar_resultado
- **Onde (Frontend):**
  - `frontend/src/pages/PerdasPage.tsx` — dados MOCK hardcoded (mockPerdas, mockMotivos)
  - NAO conectado ao backend
- **O que melhorou:** Model AcaoPosPerda criado com CRUD.
- **O que falta:** Conectar PerdasPage ao CRUD de precos-historicos + acoes-pos-perda.

---

## 2.4 TRANSVERSAIS

---

### RF-027: Dispensas de Licitacao

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL** (backend criado, sem UI dedicada)
- **Onde (Backend):**
  - Model: `Dispensa` em `backend/models.py`
  - CRUD: `"dispensas"` em `backend/crud_routes.py:313` — user_scoped
  - Campos: artigo, valor_limite, justificativa, cotacao_texto, fornecedores_cotados (JSON), status, data_limite
  - O model `Edital` tem modalidade = 'dispensa' no enum
- **Onde (Frontend):** Nenhuma pagina dedicada a dispensas. Filtro por modalidade disponivel na CaptacaoPage.
- **O que melhorou:** Model Dispensa criado com CRUD.
- **O que falta:** Criar filtro/pagina dedicada a dispensas. Workflow especifico para prazos curtos.

---

### RF-028: Interface Hibrida (Chat + CRUD Visual)

- **Status anterior:** PARCIAL
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - 47 intents reconhecidos via POST /api/chat
  - 37 tabelas no CRUD generico com REST completo (GET list, GET detail, POST create, PUT update, DELETE)
  - Endpoints especiais para upload, download, scores, export
- **Onde (Frontend):**
  - 8 paginas conectadas ao backend via CRUD: EmpresaPage, PortfolioPage, ParametrizacoesPage, CaptacaoPage, ValidacaoPage, PrecificacaoPage, SubmissaoPage, PropostaPage
  - FloatingChat com upload de arquivos e 210+ prompts prontos
  - 11 paginas ainda mock (mas com backend CRUD disponivel)
- **O que melhorou:** De "maioria mock" para "8 paginas conectadas". CRUD generico com 37 tabelas. REST APIs dedicadas criadas.
- **Gaps restantes:** 11 paginas ainda nao conectadas ao CRUD existente.

---

### RF-029: Aprendizado Continuo

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **PARCIAL** (backend criado, sem pipeline ativo)
- **Onde (Backend):**
  - Model: `AprendizadoFeedback` em `backend/models.py`
  - CRUD: `"aprendizado-feedback"` em `backend/crud_routes.py:298`
  - Campos: tipo_evento (enum), entidade, entidade_id, dados_entrada (JSON), resultado_real (JSON), delta (JSON), aplicado (boolean)
- **Onde (Frontend):** Nenhuma interface de feedback.
- **O que melhorou:** Model e CRUD criados (era zero).
- **O que falta:** Pipeline ativo de coleta → calculo de delta → ajuste de pesos. Integracao com tool_calcular_aderencia.

---

### RF-030: Governanca e Auditoria

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **PARCIAL** (backend criado, sem middleware ativo)
- **Onde (Backend):**
  - Model: `AuditoriaLog` em `backend/models.py`
  - CRUD: `"auditoria-log"` em `backend/crud_routes.py:290` — read_only: True
  - Campos: acao, entidade, entidade_id, dados_antes (JSON), dados_depois (JSON), ip_address, user_agent, session_id
- **Onde (Frontend):** Nenhuma interface de auditoria.
- **O que melhorou:** Model e CRUD criados (era zero).
- **O que falta:** Middleware que registra automaticamente operacoes CRUD. Dashboard de auditoria para administradores.

---

### RF-031: Pendencias PNCP

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **Onde (Backend):** Model Edital tem campo dados_completos. Tools de busca no PNCP.
- **Onde (Frontend):** Nenhuma interface dedicada.
- **O que falta:** Rotina de verificacao de completude. Alertar editais com documentos faltando.

---

### RF-032: Suporte Juridico (IA com Limitacoes)

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **Onde (Backend):** tool_perguntar_edital e tool_resumir_edital analisam clausulas. Model Recurso permite armazenar analises juridicas com fundamentacao_legal.
- **Onde (Frontend):** Tab Analitica da ValidacaoPage mostra Pipeline Riscos + Flags Juridicos.
- **O que melhorou:** Flags Juridicos visiveis na ValidacaoPage. Model Recurso com campo fundamentacao_legal.
- **O que falta:** Disclaimers automaticos em respostas juridicas. Base de legislacao para RAG juridico.

---

### RF-033: Autenticacao e Multi-tenancy

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Models: User, RefreshToken
  - Rotas: /api/auth/login, /api/auth/register, /api/auth/refresh, /api/auth/logout, /api/auth/user
  - Todas as tabelas user_scoped filtram por user_id
- **Onde (Frontend):** LoginPage.tsx, RegisterPage.tsx, AuthContext com JWT
- **Gaps restantes:** Google OAuth (campo google_id existe mas nao implementado).

---

### RF-034: Analytics com MindsDB

- **Status anterior:** IMPLEMENTADO (Agente)
- **Status atual:** **IMPLEMENTADO (Agente)**
- **Onde (Backend):** Tool: tool_consulta_mindsdb. Intent: consulta_mindsdb.
- **Onde (Frontend):** ChatInput.tsx — 17 prompts de MindsDB Analytics.
- **Gaps restantes:** Nenhuma pagina dedicada de analytics.

---

### RF-035: Atas de Pregao (Extracao e Analise)

- **Status anterior:** IMPLEMENTADO (Agente)
- **Status atual:** **IMPLEMENTADO (Agente)**
- **Onde (Backend):** Tools: tool_extrair_ata_pdf, tool_buscar_atas_pncp, tool_baixar_ata_pncp. Models: ParticipacaoEdital, Concorrente.
- **Onde (Frontend):** ChatInput.tsx — 3 prompts de Atas.
- **Gaps restantes:** Nenhuma pagina dedicada de atas.

---

### RF-036: Analise de Edital via Upload

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):** Tools: tool_processar_upload, tool_extrair_requisitos, tool_resumir_edital, tool_perguntar_edital, tool_extrair_datas_edital, tool_baixar_pdf_pncp.
- **Onde (Frontend):** Upload no FloatingChat. ValidacaoPage com tab Cognitiva (Resumo IA, Pergunte a IA).
- **Gaps restantes:** Nenhum gap significativo.

---

### RF-037: Estrategia Comercial (Intencao de Participacao)

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):**
  - Model: `EstrategiaEdital` em `backend/models.py`
  - CRUD: `"estrategias-editais"` em `backend/crud_routes.py:320` — user_scoped
  - Campos: decisao (enum: go, nogo, acompanhar), prioridade, margem_desejada, agressividade_preco, justificativa, data_decisao, decidido_por
  - Bug B5 CORRIGIDO — search_fields inclui edital_id para busca de estrategia existente
- **Onde (Frontend):**
  - `frontend/src/pages/CaptacaoPage.tsx` — secao 6.5 com 4 radios intencao, slider margem, toggles, salvar/re-salvar
  - `frontend/src/pages/ValidacaoPage.tsx` — secao de decisao (Participar/Acompanhar/Ignorar) com justificativa
  - crudCreate/crudUpdate de "estrategias-editais"
- **O que melhorou:** De "NAO IMPLEMENTADO" para totalmente funcional (model + CRUD + 2 paginas frontend).

---

### RF-038: Itens Intrusos (Analise de Lote)

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **Onde (Backend):** Model EditalItem (CRUD "editais-itens"). Nenhuma tool de deteccao de intrusos.
- **Onde (Frontend):** ValidacaoPage tab Objetiva mostra secao "Analise de Lote" com barra de segmentos e legenda Aderente/Intruso (visualizacao existe).
- **O que melhorou:** Visualizacao na ValidacaoPage implementada.
- **O que falta:** Tool de deteccao automatica de intrusos. Score de "casamento de lote".

---

### RF-039: Alertas de Prazo (Configuracao e Disparo)

- **Status anterior:** IMPLEMENTADO (Agente)
- **Status atual:** **IMPLEMENTADO (Agente)**
- **Onde (Backend):**
  - Models: Alerta, Notificacao, PreferenciasNotificacao (todos com CRUD)
  - Tools: tool_configurar_alertas, tool_listar_alertas, tool_cancelar_alerta, tool_dashboard_prazos, tool_calendario_editais
  - Endpoints: POST /api/notificacoes/enviar-email, GET /api/notificacoes/config-smtp
- **Onde (Frontend):** ChatInput.tsx — 8 prompts de Alertas + 4 de Calendario. FlagsPage — ainda mock.
- **O que melhorou:** Endpoints de email criados.
- **O que falta:** Scheduler para disparo automatico. Envio real de email/push. Conectar FlagsPage ao backend.

---

### RF-040: Documentos Gerados (Versionamento)

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Onde (Backend):** Model: Documento (CRUD "documentos"). Campos: tipo, titulo, conteudo_md, dados_json, versao, documento_pai_id (versionamento).
- **Onde (Frontend):** Documentos acessiveis via chat e via CRUD generico.
- **Gaps restantes:** Pagina dedicada de "meus documentos" para browsing.

---

## 3. Requisitos Nao Funcionais

---

### RNF-001: Escalabilidade

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **Implementacao:** MySQL externo, Flask + SQLAlchemy pool, LLM via API.
- **O que melhorou:** 37 tabelas ativas com CRUD generico escalavel.
- **O que falta:** Redis, Celery, load balancing. Flask roda em processo unico.

---

### RNF-002: Modularidade

- **Status anterior:** IMPLEMENTADO
- **Status atual:** **IMPLEMENTADO**
- **Implementacao:** models.py (ORM), tools.py (logica), app.py (rotas+intents), crud_routes.py (CRUD generico), frontend componentizado.
- **O que melhorou:** crud_routes.py separa CRUD generico de app.py. 37 tabelas em config declarativa.
- **Gaps:** app.py ainda concentra intents (8000+ linhas).

---

### RNF-003: Observabilidade

- **Status anterior:** PARCIAL
- **Status atual:** **PARCIAL**
- **O que melhorou:** Model AuditoriaLog criado. Endpoints de notificacao.
- **O que falta:** Logging estruturado (JSON), metricas Prometheus/Grafana, health check, tracing de LLM.

---

### RNF-004: Custos Controlaveis

- **Status anterior:** NAO IMPLEMENTADO
- **Status atual:** **NAO IMPLEMENTADO**
- **O que falta:** Contagem de tokens/chamadas LLM, limites de uso por usuario, dashboard de custos.

---

## 4. Tabela Resumo de Cobertura

### 4.1 Requisitos Funcionais (40 RFs)

| RF | Nome | Status Anterior (10/02) | Status Atual (22/02) | Backend | Frontend |
|----|------|------------------------|---------------------|---------|----------|
| RF-001 | Cadastro Empresa | MOCK (UI) | **IMPLEMENTADO** | Model+CRUD | CRUD conectado |
| RF-002 | Documentos Empresa | MOCK (UI) | **IMPLEMENTADO** | Model+CRUD+Upload | FormData+Download |
| RF-003 | Certidoes Automaticas | MOCK (UI) | **PARCIAL** | Model+CRUD+Endpoints | Card "Em breve" |
| RF-004 | Alertas IA Docs | NAO IMPL | **NAO IMPL** | — | — |
| RF-005 | Portfolio Produtos | IMPLEMENTADO | **IMPLEMENTADO** | Models+Tools+REST | getProdutos |
| RF-006 | Classes/Subclasses | PARCIAL | **PARCIAL** | Legado+Gerar-classes | State local (B7 fix) |
| RF-007 | Mascara Descricao | PARCIAL (UI) | **PARCIAL** | — | Campo visivel |
| RF-008 | Fontes Editais | IMPLEMENTADO | **IMPLEMENTADO** | Model+CRUD+Tools | CRUD conectado |
| RF-009 | Parametros Score | PARCIAL (UI) | **IMPLEMENTADO** | Model+CRUD | CRUD conectado (B4/B9 fix) |
| RF-010 | Captacao Editais | IMPLEMENTADO | **IMPLEMENTADO** | Tools+CRUD+REST | Busca+filtros+cores+intencao |
| RF-011 | Validacao Edital | PARCIAL | **IMPLEMENTADO** | 6 scores+tools+endpoints | 3 abas+Amanda+decisao |
| RF-012 | Impugnacao | PARCIAL | **PARCIAL** | Model Recurso+CRUD | Mock (nao conectado) |
| RF-013 | Precificacao | IMPL (Agente) | **IMPLEMENTADO** | Tools+Model | crudList conectado |
| RF-014 | Proposta Tecnica | IMPLEMENTADO | **IMPLEMENTADO** | Model+Tools+REST | CRUD+gerar+export |
| RF-015 | Submissao | MOCK (UI) | **IMPLEMENTADO** | Status workflow | crudList/Update |
| RF-016 | Disputa Lances | MOCK (UI) | **MOCK (B+UI)** | — | Mock hardcoded |
| RF-017 | Follow-up | PARCIAL | **PARCIAL** | Tools existem | Mock hardcoded |
| RF-018 | Recurso/Contra-Razoes | NAO IMPL | **PARCIAL** | Model+CRUD | Sem pagina |
| RF-019 | CRM Ativo | MOCK (UI) | **MOCK (B+UI)** | Models+CRUDs | Mock hardcoded |
| RF-020 | Contrato/Producao | MOCK (UI) | **MOCK (B+UI)** | Models+CRUDs | Mock hardcoded |
| RF-021 | Contratado x Realizado | MOCK (UI) | **MOCK (B+UI)** | Depende RF-020 | Mock hardcoded |
| RF-022 | Flags | PARCIAL | **PARCIAL** | Model+CRUD+Tools | Mock hardcoded |
| RF-023 | Monitoria | PARCIAL | **PARCIAL** | Models+CRUDs+Tools+Email | Mock (CaptacaoPage parcial) |
| RF-024 | Concorrencia | IMPL (Agente) | **IMPL (Agente)** | Models+Tools | Mock hardcoded |
| RF-025 | Mercado TAM/SAM/SOM | MOCK (UI) | **PARCIAL** | MindsDB + state local | Mock (campos editaveis) |
| RF-026 | Perdas | PARCIAL | **PARCIAL** | Models+Tools | Mock hardcoded |
| RF-027 | Dispensas | PARCIAL | **PARCIAL** | Model+CRUD | Sem pagina dedicada |
| RF-028 | Interface Hibrida | PARCIAL | **IMPLEMENTADO** | 37 CRUDs + 47 intents | 8 paginas conectadas |
| RF-029 | Aprendizado | NAO IMPL | **PARCIAL** | Model+CRUD | — |
| RF-030 | Governanca | NAO IMPL | **PARCIAL** | Model+CRUD(read_only) | — |
| RF-031 | Pendencias PNCP | PARCIAL | **PARCIAL** | Campo dados_completos | — |
| RF-032 | Suporte Juridico | PARCIAL | **PARCIAL** | Tools+Model Recurso | Flags Juridicos |
| RF-033 | Autenticacao | IMPLEMENTADO | **IMPLEMENTADO** | JWT+MultiTenant | Login+Register |
| RF-034 | Analytics MindsDB | IMPL (Agente) | **IMPL (Agente)** | Tool+Intent | 17 prompts |
| RF-035 | Atas Pregao | IMPL (Agente) | **IMPL (Agente)** | Tools+Models | 3 prompts |
| RF-036 | Analise Edital Upload | IMPLEMENTADO | **IMPLEMENTADO** | Tools completas | Chat+ValidacaoPage |
| RF-037 | Estrategia Comercial | NAO IMPL | **IMPLEMENTADO** | Model+CRUD (B5 fix) | CaptacaoPage+ValidacaoPage |
| RF-038 | Itens Intrusos | PARCIAL | **PARCIAL** | EditalItem model | ValidacaoPage (visual) |
| RF-039 | Alertas Prazo | IMPL (Agente) | **IMPL (Agente)** | Models+Tools+Email | Prompts+FlagsPage mock |
| RF-040 | Docs Gerados | IMPLEMENTADO | **IMPLEMENTADO** | Model+CRUD | Via chat+CRUD |

### 4.2 Estatisticas Atualizadas

| Status | Antes (10/02) | Agora (22/02) | Delta |
|--------|:---:|:---:|:---:|
| **IMPLEMENTADO** | 7 (17.5%) | **14 (35.0%)** | **+7** |
| **IMPLEMENTADO (Agente)** | 5 (12.5%) | **4 (10.0%)** | -1 |
| **PARCIAL** | 14 (35.0%) | **14 (35.0%)** | 0 |
| **MOCK (Backend+UI)** | 8 (20.0%) | **5 (12.5%)** | **-3** |
| **NAO IMPLEMENTADO** | 6 (15.0%) | **3 (7.5%)** | **-3** |

**Cobertura efetiva (IMPLEMENTADO + IMPLEMENTADO Agente):** 12 (30%) → **18 (45%)** (+50% de melhoria)

### 4.3 Requisitos Nao Funcionais

| RNF | Antes | Agora |
|-----|-------|-------|
| RNF-001: Escalabilidade | PARCIAL | PARCIAL |
| RNF-002: Modularidade | IMPLEMENTADO | IMPLEMENTADO |
| RNF-003: Observabilidade | PARCIAL | PARCIAL (AuditoriaLog criado) |
| RNF-004: Custos | NAO IMPL | NAO IMPL |

---

## 5. Proximos Passos — Prioridade por Impacto

### Prioridade 1 — Conectar frontend mock ao CRUD existente (esforco BAIXO, impacto ALTO)

Essas paginas ja tem backend CRUD criado, so precisam substituir dados mock por chamadas crudList/crudCreate:

| Pagina | CRUD Backend | Esforco |
|--------|-------------|---------|
| CRMPage → "leads-crm" + "acoes-pos-perda" | Existe | Baixo |
| ProducaoPage → "contratos" + "contrato-entregas" | Existe | Baixo |
| ContratadoRealizadoPage → "contratos" + "contrato-entregas" | Existe | Baixo |
| FollowupPage → "editais" + "precos-historicos" | Existe | Baixo |
| FlagsPage → "alertas" | Existe | Baixo |
| MonitoriaPage → "monitoramentos" + "notificacoes" | Existe | Baixo |
| ConcorrenciaPage → "concorrentes" + "participacoes-editais" | Existe | Baixo |
| PerdasPage → "precos-historicos" + "acoes-pos-perda" | Existe | Baixo |
| MercadoPage → analytics via MindsDB | Parcial | Medio |
| ImpugnacaoPage → "recursos" | Existe | Baixo |

### Prioridade 2 — Criar paginas/tools faltantes (esforco MEDIO)

| Item | O que falta |
|------|------------|
| RecursoPage.tsx | Pagina dedicada para CRUD de recursos/contra-razoes |
| tool_gerar_recurso | Gerar minuta de recurso via LLM |
| tool_gerar_impugnacao | Gerar minuta de impugnacao via LLM |
| Middleware de auditoria | Registrar automaticamente operacoes CRUD no AuditoriaLog |
| Scheduler de monitoramento | Cron/Celery para busca automatica periodica |

### Prioridade 3 — Funcionalidades avancadas (esforco ALTO)

| Item | O que falta |
|------|------------|
| RF-016 Disputa Lances | Model Lance + integracao com portais (muito complexo) |
| RF-029 Pipeline aprendizado | Coleta → delta → ajuste de pesos |
| RNF-004 Custos IA | Contagem de tokens, limites, dashboard |
| Certidoes automaticas | Integracao com APIs governamentais |

---

*Documento gerado em 2026-02-22 por analise cruzada de requisitos_completos.md vs estado atual do codigo.*
