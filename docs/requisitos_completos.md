# Documento de Requisitos Completos — facilicita.ia

**Versao:** 1.0
**Data:** 2026-02-10
**Gerado por:** Analise cruzada de 4 documentos-fonte x implementacao atual

---

## 1. Introducao

### 1.1 Objetivo

Este documento consolida TODOS os requisitos funcionais e nao funcionais do sistema **facilicita.ia** (gestao inteligente de licitacoes), identificando a origem de cada requisito nos documentos-fonte e mapeando o status de implementacao no backend (agente IA + banco) e frontend (paginas React).

### 1.2 Documentos-Fonte

| Codigo | Documento | Conteudo Principal |
|--------|-----------|-------------------|
| **DOC1** | Roadmap fase 1 18-12-2025.docx | 10+ areas funcionais: Portfolio, Monitoramento, Score, Precos, Proposta, Alertas, Robo Lances, Contestacao, CRM, Monitoramento perdas |
| **DOC2** | Reuniao 04022026.docx | 12 secoes: fluxo atual, dores, portfolio, estrategia, lotes/itens intrusos, IA juridica, PNCP, dispensas, aprendizado, governanca |
| **DOC3** | Requisitos inferidos reuniao 04022026.docx | REQ-01 a REQ-12 formais + 4 RNFs (escalabilidade, modularidade, observabilidade, custos) |
| **DOC4** | WORKFLOW SISTEMA.pdf (12 paginas) | Layout visual: Empresa/Portfolio/Parametrizacoes (topo), Fluxo Comercial (esquerda), Indicadores (direita) |

### 1.3 Metodologia

1. Leitura completa dos 4 documentos
2. Inventario do backend: 23 models SQLAlchemy, 48 tool_* functions, 47 processar_* handlers, 47 intents
3. Inventario do frontend: 23 paginas React, 210+ prompts prontos em ChatInput.tsx
4. Cruzamento requisito-a-requisito: documento → backend → frontend

### 1.4 Legenda de Status

| Status | Significado |
|--------|------------|
| **IMPLEMENTADO** | Backend (model + tool + intent) e Frontend (pagina + prompts) funcionais |
| **IMPLEMENTADO (Agente)** | Backend funcional, frontend so acessa via chat |
| **PARCIAL** | Parte implementada (ex: UI existe mas sem backend, ou backend sem UI dedicada) |
| **MOCK (UI)** | Pagina frontend existe com dados ficticios hardcoded, sem backend |
| **NAO IMPLEMENTADO** | Nenhuma implementacao no backend nem no frontend |

---

## 2. Requisitos Funcionais por Area

### 2.1 CONFIGURACAO

---

#### RF-001: Cadastro da Empresa

- **Descricao**: Permitir cadastro completo da empresa participante de licitacoes: CNPJ, razao social, endereco, responsaveis, areas de atuacao, porte (ME/EPP/Grande)
- **Origem**: DOC1 (secao Portfolio — "dados da empresa"); DOC4 (pagina 2 — "Empresa: Cadastro, dados basicos, documentos habilitativos")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model `Empresa`. Nenhuma tool. Nenhum intent.
- **Onde (Frontend)**: `EmpresaPage.tsx` — pagina com dados mock hardcoded
- **Gaps**:
  - Criar model `Empresa` com campos: cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, telefone, email, porte, areas_atuacao, user_id
  - Criar tools: tool_cadastrar_empresa, tool_atualizar_empresa, tool_consultar_empresa
  - Criar intents e processar_* correspondentes
  - Conectar EmpresaPage ao backend

---

#### RF-002: Documentos Habilitativos da Empresa

- **Descricao**: Upload e gestao de documentos habilitativos (contrato social, atestados de capacidade tecnica, balanco patrimonial, certidoes, alvara, registro em conselho de classe)
- **Origem**: DOC4 (pagina 2 — "Uploads de documentos habilitativos"); DOC2 (secao 10 — "Processo Amanda" com pastas de documentos)
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model `EmpresaDocumento`. Nenhuma tool.
- **Onde (Frontend)**: `EmpresaPage.tsx` — secao de documentos com dados mock
- **Gaps**:
  - Criar model `EmpresaDocumento` (tipo: contrato_social, atestado_capacidade, balanco, alvara, registro_conselho, outro)
  - Criar tool_upload_documento_empresa, tool_listar_documentos_empresa
  - Integrar com Processo Amanda (DOC2): organizar em pastas logicas por edital

---

#### RF-003: Certidoes Automaticas

- **Descricao**: Consulta automatica de certidoes (CND federal, estadual, municipal, FGTS, trabalhista) com alerta de vencimento
- **Origem**: DOC4 (pagina 2 — "Certidoes automaticas: CND, FGTS, Trabalhista, Estadual, Municipal"); DOC2 (secao 10 — "certidoes de regularidade")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model `Certidao`. Nenhuma tool. Nenhum intent.
- **Onde (Frontend)**: `EmpresaPage.tsx` — secao de certidoes com dados mock
- **Gaps**:
  - Criar model `EmpresaCertidao` (tipo, orgao_emissor, data_emissao, data_vencimento, path_arquivo, status)
  - Criar tool_consultar_certidoes (integrar com APIs governamentais quando disponiveis)
  - Criar tool_alertar_vencimento_certidao
  - Implementar scheduler para verificacao periodica

---

#### RF-004: Alertas IA sobre Documentos

- **Descricao**: IA analisa documentos da empresa e alerta sobre problemas (certidao vencida, documento incompleto, incoerencia entre documentos)
- **Origem**: DOC4 (pagina 2 — "Alertas IA: documentos vencidos, pendencias")
- **Status**: **NAO IMPLEMENTADO**
- **Onde (Backend)**: Nenhuma implementacao
- **Onde (Frontend)**: Nenhuma implementacao
- **Gaps**:
  - Criar tool_analisar_documentos_empresa (usa LLM para verificar coerencia e validade)
  - Integrar com sistema de alertas existente (model `Alerta` ja existe)

---

#### RF-005: Portfolio de Produtos

- **Descricao**: Cadastro de produtos com upload de PDF (manual/datasheet), extracao automatica de especificacoes tecnicas pela IA, classificacao por categoria
- **Origem**: DOC1 (secao Portfolio — "Cadastro completo de produtos"); DOC3 (REQ-01 — "portfolio digital centralizado"); DOC4 (pagina 3 — "Portfolio: uploads PDF, cadastro por classe, especificacoes tecnicas")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Models: `Produto`, `ProdutoEspecificacao`, `ProdutoDocumento`
  - Tools: `tool_processar_upload`, `tool_extrair_especificacoes`, `tool_reprocessar_produto`, `tool_atualizar_produto`, `tool_excluir_produto`, `tool_listar_produtos`, `tool_verificar_completude_produto`
  - Intents: `upload_manual`, `reprocessar_produto`, `listar_produtos`, `atualizar_produto`, `excluir_produto`, `verificar_completude`
- **Onde (Frontend)**: `PortfolioPage.tsx` — CRUD completo; `ChatInput.tsx` — 8 prompts de Produtos
- **Gaps**: Monitoramento continuo de catalogo (DOC4 pag 3: "monitoramento continuo de portfolio") — nao implementado como rotina automatica

---

#### RF-006: Classes e Subclasses de Produtos

- **Descricao**: Organizar produtos em classes (hematologia, bioquimica, informatica, etc) com campos especificos por classe e subclasses hierarquicas
- **Origem**: DOC4 (pagina 3 — "Cadastro por classe/subclasse"); DOC4 (pagina 4 — "Parametrizacoes: classificacao")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Tabelas legado: `classe_produto` (10 registros), `campo_classe` (38 registros) — SEM model SQLAlchemy
  - O enum `categoria` em Produto tem 9 valores: equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, outro
- **Onde (Frontend)**: `ParametrizacoesPage.tsx` — exibe classes/campos mas sem backend ativo; `PortfolioPage.tsx` — usa dropdown de categorias
- **Gaps**:
  - Criar models `ClasseProduto` e `CampoClasse` (integrar tabelas legado)
  - Implementar subclasses hierarquicas
  - Conectar ParametrizacoesPage para CRUD de classes

---

#### RF-007: Mascara Parametrizavel de Descricao

- **Descricao**: Template de descricao de produto baseado na classe, para garantir padronizacao nas propostas e buscas
- **Origem**: DOC4 (pagina 3 — "Mascara de descricao parametrizavel por classe")
- **Status**: **PARCIAL (UI)**
- **Onde (Backend)**: Nenhuma implementacao especifica de mascara/template
- **Onde (Frontend)**: `ParametrizacoesPage.tsx` — campo de mascara visivel na UI, sem funcionalidade
- **Gaps**:
  - Criar campo `mascara_descricao` na tabela `classe_produto`
  - Implementar tool_aplicar_mascara_descricao que usa template ao gerar descricoes

---

#### RF-008: Fontes de Editais

- **Descricao**: Cadastro e gestao de fontes de busca de editais (PNCP, ComprasNet, BEC-SP, portais estaduais/municipais), com API ou scraper
- **Origem**: DOC1 (secao Monitoramento — "Fontes de busca parametrizaveis"); DOC4 (pagina 2 — "Fontes de consulta: portais de compras publicas")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Model: `FonteEdital` (13 registros, 3 iniciais + 10 adicionadas)
  - Tools: `tool_cadastrar_fonte`, `tool_listar_fontes`, `tool_buscar_editais_fonte`, `tool_buscar_editais_scraper`
  - Intents: `cadastrar_fonte`, `listar_fontes`, `buscar_editais`
- **Onde (Frontend)**: `ChatInput.tsx` — 4 prompts de Fontes; `ParametrizacoesPage.tsx` — lista fontes
- **Gaps**: Nenhum gap significativo. Fontes funcionam para PNCP (API) e outras (scraper).

---

#### RF-009: Parametros Comerciais (Scores)

- **Descricao**: Configuracao de pesos para scores de aderencia (score tecnico, comercial, participacao, ganho), parametros de decisao go/no-go
- **Origem**: DOC4 (pagina 4 — "Parametrizacoes: score tecnico, score comercial, score de participacao, score de ganho")
- **Status**: **PARCIAL (UI)**
- **Onde (Backend)**: O model `Analise` tem score_tecnico, score_comercial, score_potencial, score_final. Os pesos sao fixos no codigo de tool_calcular_aderencia.
- **Onde (Frontend)**: `ParametrizacoesPage.tsx` — campos de peso editaveis na UI, sem persistencia no backend
- **Gaps**:
  - Criar model `ParametroScore` (user_id, peso_tecnico, peso_comercial, peso_participacao, peso_ganho, limiar_go, limiar_nogo)
  - Fazer tool_calcular_aderencia ler pesos do banco em vez de hardcoded
  - Conectar ParametrizacoesPage ao backend

---

### 2.2 FLUXO COMERCIAL

---

#### RF-010: Captacao de Editais

- **Descricao**: Busca de editais por palavra-chave, UF, modalidade, faixa de valor. Calculo automatico de score de aderencia ao portfolio. Classificacao por cor (verde/amarelo/vermelho) conforme score.
- **Origem**: DOC1 (secao Monitoramento — "Busca automatica de editais"); DOC3 (REQ-01 — "captacao de editais"); DOC4 (paginas 5-7 — "Captacao: scores, gaps, intencao estrategica, categorizacao por cor, classificacao tipo/origem")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Tools: `tool_buscar_editais_fonte` (busca PNCP), `tool_buscar_editais_scraper` (busca scraper), `tool_calcular_score_aderencia`, `tool_salvar_editais_selecionados`, `tool_classificar_edital`, `tool_web_search`, `tool_buscar_links_editais`
  - Intents: `buscar_editais`, `buscar_editais_simples`, `buscar_links_editais`, `classificar_edital`
- **Onde (Frontend)**: `CaptacaoPage.tsx` — busca com filtros, tabela de resultados com scores (usa dados mock para demonstracao inicial); `ChatInput.tsx` — 17 prompts de Editais
- **Gaps**:
  - Classificacao por cor (verde ≥80, amarelo 50-79, vermelho <50) — logica existe no score mas nao e visual na CaptacaoPage
  - "Intencao estrategica" e "expectativa de margem" (DOC4 pag 5) — nao implementados como campos

---

#### RF-011: Validacao / Analise de Edital

- **Descricao**: Analise detalhada do edital: 5 scores de risco (tecnico, documental, juridico, logistico, comercial), analise de lote (itens intrusos), reputacao do orgao, decisao participar/acompanhar/ignorar. Extracao automatica de requisitos do PDF.
- **Origem**: DOC2 (secao 5 — "analise aprofundada antes de decidir participar"); DOC3 (REQ-02 — "validacao tecnica e juridica"); DOC4 (paginas 8-10 — "Validacao: sinais de mercado, 5 risk scores, itens intrusos, reputacao orgao, 5 categorias de validacao, Processo Amanda")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Tools: `tool_extrair_requisitos` (extrai do PDF), `tool_calcular_aderencia` (score tecnico e comercial), `tool_resumir_edital`, `tool_perguntar_edital`, `tool_extrair_datas_edital`
  - Intents: `calcular_aderencia`, `resumir_edital`, `perguntar_edital`, `extrair_datas_edital`
  - Model `Analise` tem 4 scores (tecnico, comercial, potencial, final)
- **Onde (Frontend)**: `ValidacaoPage.tsx` — PARCIAL (exibe editais com filtros de status); `ChatInput.tsx` — 7 prompts de Analise + 3 de Aderencia
- **Gaps**:
  - Faltam 3 dos 5 risk scores: documental, juridico, logistico (so tem tecnico e comercial)
  - Analise de lote / itens intrusos (DOC2 secao 5, DOC4 pag 8) — nao implementada
  - Reputacao do orgao licitante — nao implementada
  - Decisao go/no-go automatica (participar/acompanhar/ignorar) — nao implementada
  - "Processo Amanda" (DOC4 pag 10: organizacao de pastas de documentos) — nao implementado

---

#### RF-012: Impugnacao de Edital

- **Descricao**: Gerar minutas de impugnacao quando identificados termos direcionados, exigencias descabidas ou restricoes a competitividade
- **Origem**: DOC1 (secao Contestacao — "Gerar minutas de impugnacao"); DOC3 (REQ-07 — "impugnacao"); DOC4 (pagina 9 — "Validacao juridica: termos direcionados")
- **Status**: **PARCIAL**
- **Onde (Backend)**: Nenhum model `Impugnacao`. Nenhuma tool especifica. A tool_perguntar_edital pode ser usada para analise juridica via prompt.
- **Onde (Frontend)**: `ImpugnacaoPage.tsx` — pagina com dados mock de prazos e historico
- **Gaps**:
  - Criar model `Impugnacao` (edital_id, motivo, texto_minuta, data_protocolo, status, resultado)
  - Criar tool_gerar_impugnacao (usa LLM para gerar minuta baseada nos termos identificados)
  - Criar tool_identificar_termos_direcionados (analise juridica automatica do edital)

---

#### RF-013: Precificacao

- **Descricao**: Recomendacao de preco com base no historico de editais similares, precos de concorrentes, margem desejada, e analise de mercado
- **Origem**: DOC1 (secao Precos — "Recomendacoes de precos baseadas em historico"); DOC3 (REQ-05 — "precificacao competitiva"); DOC4 (pagina 4 — "Parametrizacoes comerciais: expectativa de margem")
- **Status**: **IMPLEMENTADO (Agente)**
- **Onde (Backend)**:
  - Tools: `tool_recomendar_preco`, `tool_historico_precos`, `tool_buscar_precos_pncp`
  - Models: `PrecoHistorico` (24 registros)
  - Intents: `recomendar_preco`, `historico_precos`, `buscar_precos_pncp`
- **Onde (Frontend)**: `PrecificacaoPage.tsx` — pagina com dados mock; `ChatInput.tsx` — 6 prompts de Precos + 4 de Recomendacao de Precos
- **Gaps**:
  - PrecificacaoPage nao consome dados do backend (exibe mock)
  - "Margem desejada" como parametro configuravel — nao persistido

---

#### RF-014: Geracao de Proposta Tecnica

- **Descricao**: Gerar proposta tecnica completa em formato profissional, com identificacao, objeto, descricao tecnica, tabela de atendimento a requisitos, condicoes comerciais, declaracoes
- **Origem**: DOC1 (secao Proposta — "Geracao automatica de proposta tecnica"); DOC3 (REQ-06 — "proposta tecnica"); DOC4 (fluxo comercial — "Proposta")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Model: `Proposta`
  - Tools: `tool_gerar_proposta` (gera texto completo via LLM com 8 secoes)
  - Intents: `gerar_proposta`
- **Onde (Frontend)**: `PropostaPage.tsx` — exibe propostas geradas; `ChatInput.tsx` — 3 prompts de Propostas
- **Gaps**: Exportacao para DOCX/PDF — nao implementada (gera apenas Markdown)

---

#### RF-015: Submissao de Proposta

- **Descricao**: Acompanhar o processo de submissao da proposta no portal de compras (checklist de documentos, upload, confirmacao)
- **Origem**: DOC4 (fluxo comercial — "Submissao")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhuma tool ou intent especifica. Model `Proposta` tem campo `status` com enum (rascunho, revisao, aprovada, enviada).
- **Onde (Frontend)**: `SubmissaoPage.tsx` — pagina com dados mock
- **Gaps**:
  - Criar checklist de documentos exigidos por edital
  - Implementar workflow de submissao (rascunho → revisao → aprovada → enviada)
  - Criar tool_atualizar_status_proposta

---

#### RF-016: Disputa de Lances (Robo de Lances)

- **Descricao**: Monitorar pregoes eletronicos e sugerir lances em tempo real, considerando margem minima, precos de concorrentes, estrategia de lance
- **Origem**: DOC1 (secao Robo Lances — "Monitorar pregoes e sugerir lances"); DOC3 (REQ-08 — "lances inteligentes"); DOC4 (pagina 12 — "Disputa de Lances: acesso ao portal necessario")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhuma tool de lances. Nenhum intent.
- **Onde (Frontend)**: `LancesPage.tsx` — pagina com dados mock de pregoes do dia e lances
- **Gaps**:
  - Criar model `Lance` (edital_id, rodada, valor_lance, valor_concorrente, timestamp)
  - Criar tool_simular_lance, tool_sugerir_lance
  - Integracao com portais de pregao eletronico (requer acesso ao sistema do orgao — DOC4 pag 12)
  - Implementar estrategia de lance com margem minima parametrizavel

---

#### RF-017: Follow-up / Acompanhamento Pos-Pregao

- **Descricao**: Acompanhar resultado apos o pregao: aguardando resultado, registrar vitoria/derrota, motivo de perda, analise pos-resultado
- **Origem**: DOC3 (REQ-09 — "analise pos-resultado"); DOC4 (fluxo comercial — "Followup")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Tools: `tool_registrar_resultado`, `tool_extrair_ata_pdf`, `tool_buscar_atas_pncp`, `tool_baixar_ata_pncp`
  - Models: `PrecoHistorico` (resultado, motivo_perda), `ParticipacaoEdital`
  - Intents: `registrar_resultado`, `consultar_resultado`, `buscar_atas_pncp`
- **Onde (Frontend)**: `FollowupPage.tsx` — pagina com dados mock de editais aguardando resultado; `ChatInput.tsx` — 7 prompts de Resultados + 3 de Atas
- **Gaps**:
  - FollowupPage nao consome dados do backend (usa mock)
  - Notificacao automatica de resultado — nao implementada como rotina

---

#### RF-018: Recurso / Contra-Razoes

- **Descricao**: Gerar minutas de recurso administrativo e contra-razoes quando ha contestacao ao resultado
- **Origem**: DOC1 (secao Contestacao — "Recursos e contra-razoes"); DOC3 (REQ-07 — "contestacao"); DOC4 (pagina 11 — "Recurso" — placeholder xxxxx)
- **Status**: **NAO IMPLEMENTADO**
- **Onde (Backend)**: Nenhum model, tool ou intent
- **Onde (Frontend)**: Nenhuma pagina dedicada (DOC4 mostra placeholder)
- **Gaps**:
  - Criar model `Recurso` (edital_id, tipo: recurso/contra_razao, texto_minuta, data_protocolo, prazo, status, resultado)
  - Criar tool_gerar_recurso (usa LLM para gerar minuta)
  - Criar tool_gerar_contra_razoes
  - Criar RecursoPage.tsx

---

#### RF-019: CRM Ativo (Relacionamento com Orgaos)

- **Descricao**: Gestao de relacionamento com orgaos licitantes: leads, pipeline de oportunidades, metas comerciais, acoes pos-perda (reprocessar, nova proposta, visita tecnica)
- **Origem**: DOC1 (secao CRM — "CRM ativo com orgaos licitantes"); DOC3 (REQ-10 — "CRM e retencao"); DOC4 (fluxo comercial — "CRM")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model de CRM. Nenhuma tool. Nenhum intent.
- **Onde (Frontend)**: `CRMPage.tsx` — pagina completa com dados mock (leads, metas, acoes pos-perda)
- **Gaps**:
  - Criar model `LeadCRM` (orgao, contato, telefone, email, status_pipeline, ultima_interacao, proxima_acao)
  - Criar model `AcaoPosPerda` (edital_id, tipo_acao, descricao, data_prevista, data_realizada, resultado)
  - Criar tools CRUD para leads e acoes
  - Conectar CRMPage ao backend

---

#### RF-020: Execucao de Contrato (Producao)

- **Descricao**: Acompanhar a execucao pos-vitoria: contratos assinados, entregas, prazos de entrega, medicoes, notas fiscais
- **Origem**: DOC4 (fluxo comercial — "Contrato"); DOC3 (REQ-11 — "gestao da execucao")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model `Contrato`. Nenhuma tool. Nenhum intent.
- **Onde (Frontend)**: `ProducaoPage.tsx` — pagina com dados mock
- **Gaps**:
  - Criar model `Contrato` (edital_id, numero_contrato, orgao, valor_total, data_inicio, data_fim, status)
  - Criar model `ContratoEntrega` (contrato_id, descricao, data_prevista, data_realizada, valor, status, nota_fiscal)
  - Criar tools CRUD para contratos e entregas
  - Conectar ProducaoPage ao backend

---

#### RF-021: Contratado x Realizado / Atrasos

- **Descricao**: Dashboard comparativo entre valores contratados e valores realizados (entregues/faturados). Monitorar atrasos de entrega e vencimentos.
- **Origem**: DOC4 (indicadores — "Contratado x Realizado"); DOC4 (indicadores — "Atrasos")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhum model. Depende de `Contrato` e `ContratoEntrega` (RF-020).
- **Onde (Frontend)**: `ContratadoRealizadoPage.tsx` — pagina com dados mock de contratos comparativos e atrasos
- **Gaps**: Depende totalmente da implementacao de RF-020 (Contrato)

---

### 2.3 INDICADORES

---

#### RF-022: Flags (Sinalizadores)

- **Descricao**: Dashboard de sinalizadores: editais com prazo vencendo, documentos pendentes, alertas ativos, acoes necessarias
- **Origem**: DOC4 (indicadores — "Flags")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Tools: `tool_dashboard_prazos`, `tool_listar_alertas`, `tool_calendario_editais`
  - Models: `Alerta`, `Edital` (datas de prazos)
  - Intents: `dashboard_prazos`, `listar_alertas`, `calendario_editais`
- **Onde (Frontend)**: `FlagsPage.tsx` — pagina com dados parcialmente mock; `ChatInput.tsx` — 8 prompts de Alertas + 4 de Calendario
- **Gaps**: FlagsPage nao consome todos os dados disponíveis no backend

---

#### RF-023: Monitoria (Monitoramento Automatico)

- **Descricao**: Configuracao de buscas automaticas periodicas por novos editais, com filtros de termo, UF, fonte, valor. Notificacao ao encontrar editais relevantes.
- **Origem**: DOC1 (secao Monitoramento — "Busca automatica periodica"); DOC3 (REQ-03 — "monitoramento continuo"); DOC4 (indicadores — "Monitoria")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Models: `Monitoramento` (3 registros), `Notificacao`, `PreferenciasNotificacao`
  - Tools: `tool_configurar_monitoramento`, `tool_listar_monitoramentos`, `tool_desativar_monitoramento`, `tool_configurar_preferencias_notificacao`, `tool_historico_notificacoes`, `tool_marcar_notificacao_lida`
  - Intents: `configurar_monitoramento`, `listar_monitoramentos`, `desativar_monitoramento`, `configurar_notificacoes`, `historico_notificacoes`
- **Onde (Frontend)**: `MonitoriaPage.tsx` — pagina com dados mock de monitoramentos e editais encontrados; `ChatInput.tsx` — 4 prompts de Monitoramento + 4 de Notificacoes
- **Gaps**:
  - MonitoriaPage nao consome dados reais do backend (usa mock)
  - Scheduler de execucao automatica — nao implementado (nao ha cron/celery)
  - Envio real de email/push — nao implementado

---

#### RF-024: Concorrencia (Inteligencia Competitiva)

- **Descricao**: Acompanhamento de concorrentes: identificacao via atas de pregao, historico de participacoes, taxa de vitoria, precos praticados, analise por concorrente
- **Origem**: DOC1 (secao Monitoramento perdas — "Monitorar concorrentes"); DOC3 (REQ-09 — "analise de concorrencia"); DOC4 (indicadores — "Concorrencia")
- **Status**: **IMPLEMENTADO (Agente)**
- **Onde (Backend)**:
  - Models: `Concorrente` (7 registros), `ParticipacaoEdital`, `PrecoHistorico`
  - Tools: `tool_listar_concorrentes`, `tool_analisar_concorrente`, `tool_extrair_ata_pdf`
  - Intents: `listar_concorrentes`, `analisar_concorrente`
- **Onde (Frontend)**: `ConcorrenciaPage.tsx` — pagina com dados parcialmente mock; `ChatInput.tsx` — 3 prompts de Concorrentes
- **Gaps**: ConcorrenciaPage nao consome dados do backend diretamente (precisa de API REST dedicada)

---

#### RF-025: Mercado (TAM/SAM/SOM)

- **Descricao**: Visao de mercado: total de editais por segmento/UF, participacao da empresa, market share estimado, tendencias
- **Origem**: DOC4 (indicadores — "Mercado: TAM/SAM/SOM")
- **Status**: **MOCK (UI)**
- **Onde (Backend)**: Nenhuma tool especifica. `tool_consulta_mindsdb` pode ser usada para analytics.
- **Onde (Frontend)**: `MercadoPage.tsx` — pagina com dados mock; `ChatInput.tsx` — 17 prompts de MindsDB Analytics
- **Gaps**:
  - Criar tool_calcular_tam_sam_som baseada nos dados de editais e portfolio
  - Implementar logica de market share (nossa participacao / total do segmento)
  - Conectar MercadoPage ao backend

---

#### RF-026: Perdas (Monitoramento de Perdas)

- **Descricao**: Dashboard de editais perdidos: analise por motivo (preco, tecnica, documentacao, prazo), recomendacoes de melhoria, acoes pos-perda
- **Origem**: DOC1 (secao Monitoramento perdas — "Dashboard de perdas e analise de motivos"); DOC3 (REQ-10 — "tratamento pos-perda"); DOC4 (indicadores — "Perdas")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - Model: `PrecoHistorico` (campo resultado = 'derrota', motivo_perda)
  - Tools: `tool_registrar_resultado` (registra vitoria/derrota), `tool_consulta_mindsdb`
  - Intents: `registrar_resultado`, `consultar_resultado`
- **Onde (Frontend)**: `PerdasPage.tsx` — pagina com dados parcialmente mock; `ChatInput.tsx` — prompts de resultados
- **Gaps**:
  - PerdasPage nao consome dados reais do backend
  - Analise automatica de padroes de perda — nao implementada
  - "Acoes pos-perda" (reprocessar oferta, visita tecnica) — sem model dedicado

---

### 2.4 TRANSVERSAIS

---

#### RF-027: Dispensas de Licitacao

- **Descricao**: Suporte a dispensas de licitacao (Art. 75 Lei 14.133): buscar dispensas, gerar cotacoes, acompanhar prazos menores
- **Origem**: DOC2 (secao 9 — "Dispensas de licitacao: modelo mais agil, prazos curtos"); DOC3 (REQ-12 — "dispensas")
- **Status**: **PARCIAL**
- **Onde (Backend)**:
  - O model `Edital` tem `modalidade` = 'dispensa' e 'inexigibilidade' no enum
  - tool_buscar_editais_fonte pode buscar dispensas no PNCP
- **Onde (Frontend)**: Nenhuma pagina dedicada a dispensas
- **Gaps**:
  - Criar model `Dispensa` ou adicionar campos especificos ao `Edital` para dispensas
  - Implementar workflow especifico para dispensas (prazos mais curtos, cotacao simplificada)
  - Criar pagina ou filtro dedicado a dispensas na CaptacaoPage

---

#### RF-028: Interface Hibrida (Chat + CRUD Visual)

- **Descricao**: Sistema deve funcionar tanto via chat (agente IA) quanto via interface visual (paginas CRUD). Todas as operacoes devem ser acessiveis por ambos os canais.
- **Origem**: DOC2 (secao 2 — "interface deve ser intuitiva"); DOC3 (RNF — "usabilidade"); DOC4 (layout geral — chat + paginas)
- **Status**: **PARCIAL**
- **Onde (Backend)**: Todas as operacoes passam pelo POST /api/chat → detectar_intencao_ia() → processar_*(). 47 intents reconhecidos. 28 rotas REST (mas maioria sao para auth e sessoes).
- **Onde (Frontend)**: 23 paginas + FloatingChat. Poucas paginas fazem chamadas REST diretas — a maioria e mock.
- **Gaps**:
  - Muitas paginas sao MOCK e nao fazem chamadas ao backend
  - Faltam rotas REST dedicadas para CRUD visual (a maioria das operacoes so funciona via chat)
  - Necessario criar endpoints REST para cada entidade principal

---

#### RF-029: Aprendizado Continuo

- **Descricao**: Sistema deve aprender com resultados (vitorias/derrotas) para melhorar recomendacoes futuras: ajustar scores, melhorar precificacao, refinar busca
- **Origem**: DOC2 (secao 10 — "Aprendizado continuo: ajustar com base no feedback"); DOC3 (REQ-11 — "aprendizado com base em resultados")
- **Status**: **NAO IMPLEMENTADO**
- **Onde (Backend)**: Nenhuma implementacao de feedback loop ou retraining
- **Onde (Frontend)**: Nenhuma interface de feedback
- **Gaps**:
  - Criar model `AprendizadoFeedback` (tipo_evento, dados_entrada, resultado_esperado, resultado_real, delta, aplicado)
  - Implementar pipeline: coletar resultado → calcular delta → ajustar pesos
  - Integrar com tool_calcular_aderencia e tool_recomendar_preco para usar dados historicos

---

#### RF-030: Governanca e Auditoria

- **Descricao**: Log de auditoria completo: quem fez o que, quando, em qual entidade. Rastreabilidade de todas as acoes do sistema.
- **Origem**: DOC2 (secao 11 — "Governanca: rastreabilidade de decisoes"); DOC3 (REQ-12 — "governanca e auditoria")
- **Status**: **NAO IMPLEMENTADO**
- **Onde (Backend)**: Nenhum model de log de auditoria. As mensagens de chat registram action_type, mas nao ha log estruturado de mudancas.
- **Onde (Frontend)**: Nenhuma interface de auditoria
- **Gaps**:
  - Criar model `AuditoriaLog` (user_id, acao, entidade, entidade_id, dados_antes, dados_depois, ip, timestamp)
  - Implementar middleware que registra automaticamente todas as operacoes CRUD
  - Criar dashboard de auditoria para administradores

---

#### RF-031: Pendencias PNCP

- **Descricao**: Monitorar inconsistencias e pendencias do PNCP (editais sem documentos, editais com dados incompletos, divergencias entre publicacao e execucao)
- **Origem**: DOC2 (secao 8 — "PNCP: pendencias de informacao, editais incompletos")
- **Status**: **PARCIAL**
- **Onde (Backend)**: Model `Edital` tem campo `dados_completos` (boolean). Tools de busca no PNCP verificam completude.
- **Onde (Frontend)**: Nenhuma interface dedicada
- **Gaps**:
  - Implementar rotina de verificacao de completude dos editais salvos
  - Alertar quando um edital tem documentos faltando no PNCP

---

#### RF-032: Suporte Juridico (IA com Limitacoes)

- **Descricao**: IA deve auxiliar em questoes juridicas (impugnacao, recurso, analise de clausulas), mas com disclaimers claros de que nao substitui advogado. Citacao de legislacao.
- **Origem**: DOC2 (secao 6 — "Limitacoes da IA: area juridica sensivel, disclaimers necessarios")
- **Status**: **PARCIAL**
- **Onde (Backend)**: tool_perguntar_edital e tool_resumir_edital podem analisar clausulas. Nenhum disclaimer automatico.
- **Onde (Frontend)**: Nenhum disclaimer implementado
- **Gaps**:
  - Adicionar disclaimers automaticos em respostas juridicas
  - Implementar citacao de legislacao (Lei 14.133/2021, Lei 8.666/93)
  - Criar base de legislacao para RAG juridico

---

#### RF-033: Autenticacao e Multi-tenancy

- **Descricao**: Login com email/senha, refresh tokens, isolamento de dados por usuario (cada usuario so ve seus proprios dados)
- **Origem**: DOC3 (RNF — "seguranca e isolamento de dados")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Models: `User` (3 registros), `RefreshToken` (50 registros)
  - Rotas: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
  - Todas as tools recebem user_id e filtram dados por usuario
- **Onde (Frontend)**: `LoginPage.tsx`, `RegisterPage.tsx`, AuthContext com JWT
- **Gaps**: Google OAuth previsto (campo google_id existe) mas nao implementado

---

#### RF-034: Analytics com MindsDB

- **Descricao**: Consultas analiticas via MindsDB: previsoes de resultado, analise de tendencias, clustering de editais, correlacoes
- **Origem**: DOC1 (secao Score — "Analytics avancado")
- **Status**: **IMPLEMENTADO (Agente)**
- **Onde (Backend)**:
  - Tool: `tool_consulta_mindsdb`
  - Intent: `consulta_mindsdb`
- **Onde (Frontend)**: `ChatInput.tsx` — 17 prompts de MindsDB Analytics
- **Gaps**: Nenhuma pagina dedicada de analytics. Funciona apenas via chat.

---

#### RF-035: Atas de Pregao (Extracao e Analise)

- **Descricao**: Buscar, baixar e extrair dados estruturados de atas de pregao: participantes, precos, posicoes, vencedor, desclassificados
- **Origem**: DOC1 (secao Contestacao — "Analise de atas de pregao")
- **Status**: **IMPLEMENTADO (Agente)**
- **Onde (Backend)**:
  - Tools: `tool_extrair_ata_pdf`, `tool_buscar_atas_pncp`, `tool_baixar_ata_pncp`
  - Intents: `buscar_atas_pncp`
  - Models: `ParticipacaoEdital`, `Concorrente` (alimentados pela extracao)
- **Onde (Frontend)**: `ChatInput.tsx` — 3 prompts de Atas
- **Gaps**: Nenhuma pagina dedicada de atas. Funciona apenas via chat.

---

#### RF-036: Analise de Edital via Upload

- **Descricao**: Permitir upload de PDF do edital, extrair texto, resumir, extrair requisitos, extrair datas, responder perguntas sobre o edital
- **Origem**: DOC3 (REQ-02 — "analise automatica de edital")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Tools: `tool_processar_upload`, `tool_extrair_requisitos`, `tool_resumir_edital`, `tool_perguntar_edital`, `tool_extrair_datas_edital`, `tool_baixar_pdf_pncp`
  - Intents: `resumir_edital`, `perguntar_edital`, `extrair_datas_edital`, `baixar_pdf_edital`
- **Onde (Frontend)**: Upload de arquivo no FloatingChat; `ChatInput.tsx` — prompts de analise e aderencia
- **Gaps**: Nenhum gap significativo para o fluxo basico.

---

#### RF-037: Estrategia Comercial (Intencao de Participacao)

- **Descricao**: Definir estrategia por edital: go/no-go, nivel de agressividade de preco, prioridade, justificativa da decisao
- **Origem**: DOC2 (secao 4 — "estrategia comercial vs tecnica"); DOC4 (pagina 5 — "Intencao estrategica, expectativa de margem")
- **Status**: **NAO IMPLEMENTADO**
- **Onde (Backend)**: Nenhum campo de "estrategia" ou "intencao" no model Edital
- **Onde (Frontend)**: Nenhuma interface dedicada
- **Gaps**:
  - Adicionar campos ao Edital: estrategia (go/nogo/acompanhar), prioridade, margem_desejada, justificativa_estrategia
  - Ou criar model separado `EstrategiaEdital`
  - Integrar com decision-making automatizado baseado nos scores

---

#### RF-038: Itens Intrusos (Analise de Lote)

- **Descricao**: Detectar itens em um lote que nao pertencem ao segmento principal — indicadores de possivel direcionamento ou "casamento" de lote
- **Origem**: DOC2 (secao 5 — "Lotes com itens que nao sao do segmento — intrusos"); DOC4 (pagina 8 — "Analise de lote: itens intrusos")
- **Status**: **PARCIAL**
- **Onde (Backend)**: Model `EditalItem` armazena itens do lote. Nenhuma tool de deteccao de intrusos.
- **Onde (Frontend)**: Nenhuma visualizacao de itens intrusos
- **Gaps**:
  - Criar tool_detectar_itens_intrusos (compara itens do lote com o portfolio da empresa)
  - Implementar score de "casamento de lote" — % de itens do nosso segmento vs total
  - Exibir na ValidacaoPage

---

#### RF-039: Alertas de Prazo (Configuracao e Disparo)

- **Descricao**: Configurar alertas para prazos de editais (abertura, impugnacao, recursos, proposta) com antecedencia parametrizavel. Canais: email, push, SMS.
- **Origem**: DOC1 (secao Alertas — "Alertas de abertura e prazos"); DOC3 (REQ-04 — "alertas inteligentes")
- **Status**: **IMPLEMENTADO (Agente)**
- **Onde (Backend)**:
  - Models: `Alerta`, `Notificacao`, `PreferenciasNotificacao`
  - Tools: `tool_configurar_alertas`, `tool_listar_alertas`, `tool_cancelar_alerta`, `tool_dashboard_prazos`, `tool_calendario_editais`
  - Intents: `configurar_alertas`, `listar_alertas`, `cancelar_alerta`, `dashboard_prazos`, `calendario_editais`
- **Onde (Frontend)**: `ChatInput.tsx` — 8 prompts de Alertas + 4 de Calendario; `FlagsPage.tsx` — parcial
- **Gaps**:
  - Scheduler para disparo automatico — nao implementado
  - Envio real de email/push/SMS — nao implementado
  - Dashboard visual de alertas na FlagsPage nao conectado ao backend

---

#### RF-040: Documentos Gerados (Versionamento)

- **Descricao**: Armazenar documentos gerados pelo sistema (propostas, relatorios, analises) com versionamento e vinculacao a sessao de chat
- **Origem**: DOC3 (REQ-06 — "versionamento de propostas")
- **Status**: **IMPLEMENTADO**
- **Onde (Backend)**:
  - Model: `Documento` (id, tipo, titulo, conteudo_md, dados_json, versao, documento_pai_id)
- **Onde (Frontend)**: Documentos acessiveis via chat
- **Gaps**: Nenhuma pagina dedicada de "meus documentos" para browsing

---

## 3. Requisitos Nao Funcionais

---

### RNF-001: Escalabilidade

- **Descricao**: Suporte a multiplos usuarios simultaneos, crescimento gradual do volume de editais e dados
- **Origem**: DOC3 (RNF — "Escalabilidade horizontal")
- **Status**: **PARCIAL**
- **Implementacao**: MySQL externo (host configurado via .env), Flask com pool de conexoes SQLAlchemy, LLM via API (LM Studio local ou DeepSeek API)
- **Gaps**: Sem cache (Redis), sem filas (Celery), sem load balancing. Flask roda em processo unico.

---

### RNF-002: Modularidade

- **Descricao**: Arquitetura modular: models separados de tools, tools separados de intents, frontend componentizado
- **Origem**: DOC3 (RNF — "Modularidade e separacao de responsabilidades")
- **Status**: **IMPLEMENTADO**
- **Implementacao**: `models.py` (ORM), `tools.py` (logica de negocio), `app.py` (rotas + intents), frontend em React com paginas separadas
- **Gaps**: `app.py` concentra tanto rotas quanto intents (5000+ linhas) — candidato a refatoracao

---

### RNF-003: Observabilidade

- **Descricao**: Logs, metricas, rastreabilidade de chamadas, monitoramento de saude do sistema
- **Origem**: DOC3 (RNF — "Observabilidade: logs estruturados, metricas")
- **Status**: **PARCIAL**
- **Implementacao**: Prints de log no backend ([AGENTE], [TOOL], [DB]). Mensagens registradas com action_type.
- **Gaps**:
  - Sem logging estruturado (JSON logs)
  - Sem metricas (Prometheus/Grafana)
  - Sem health check endpoint
  - Sem tracing de chamadas LLM (latencia, tokens, custo)

---

### RNF-004: Custos Controlaveis

- **Descricao**: Monitorar e controlar custos de chamadas LLM, APIs externas, armazenamento
- **Origem**: DOC3 (RNF — "Custos de IA controlaveis")
- **Status**: **NAO IMPLEMENTADO**
- **Implementacao**: Nenhuma contabilizacao de custos
- **Gaps**:
  - Sem contagem de tokens/chamadas LLM
  - Sem limites de uso por usuario
  - Sem dashboard de custos

---

## 4. Tabelas Existentes (26 tabelas)

### 4.1 Tabelas Ativas (23 models SQLAlchemy — schema UUID)

| # | Tabela | Model | Rows | Descricao |
|---|--------|-------|------|-----------|
| 1 | `users` | User | 3 | Usuarios autenticados |
| 2 | `refresh_tokens` | RefreshToken | 50 | Tokens JWT de refresh |
| 3 | `sessions` | Session | 101 | Sessoes de chat |
| 4 | `messages` | Message | 1030 | Mensagens do chat (INT PK, unica excecao) |
| 5 | `produtos` | Produto | 22 | Catalogo de produtos |
| 6 | `produtos_especificacoes` | ProdutoEspecificacao | 263 | Specs tecnicas dos produtos |
| 7 | `produtos_documentos` | ProdutoDocumento | 4 | PDFs de produtos (manuais, fichas) |
| 8 | `fontes_editais` | FonteEdital | 13 | Fontes de busca (PNCP, ComprasNet...) |
| 9 | `editais` | Edital | 0 | Editais de licitacao (31 campos) |
| 10 | `editais_requisitos` | EditalRequisito | 0 | Requisitos extraidos dos editais |
| 11 | `editais_documentos` | EditalDocumento | 0 | PDFs dos editais |
| 12 | `editais_itens` | EditalItem | 0 | Itens/lotes dos editais |
| 13 | `analises` | Analise | 0 | Analises de aderencia (4 scores) |
| 14 | `analises_detalhes` | AnaliseDetalhe | 0 | Detalhe requisito-a-requisito |
| 15 | `propostas` | Proposta | 0 | Propostas tecnicas geradas |
| 16 | `concorrentes` | Concorrente | 7 | Empresas concorrentes |
| 17 | `participacoes_editais` | ParticipacaoEdital | 0 | Participacoes em editais |
| 18 | `precos_historicos` | PrecoHistorico | 24 | Historico de precos |
| 19 | `alertas` | Alerta | 0 | Alertas de prazo |
| 20 | `monitoramentos` | Monitoramento | 3 | Monitoramentos automaticos |
| 21 | `notificacoes` | Notificacao | 0 | Notificacoes enviadas |
| 22 | `preferencias_notificacao` | PreferenciasNotificacao | 2 | Preferencias de notificacao |
| 23 | `documentos` | Documento | 0 | Documentos gerados (versionados) |

### 4.2 Tabelas Legado com Dados (3 tabelas — schema INT auto-increment, sem model)

| # | Tabela | Rows | Status | Descricao |
|---|--------|------|--------|-----------|
| 24 | `classe_produto` | 10 | Candidata a integracao | Classes de produtos (hematologia, bioquimica...) |
| 25 | `campo_classe` | 38 | Candidata a integracao | Campos por classe (specs obrigatorias) |
| 26 | `categoria_edital` | 6 | Candidata a integracao | Categorias com palavras-chave |

### 4.3 Tabelas Legado Vazias (12 tabelas — schema antigo, candidatas a exclusao)

| Tabela | Descricao |
|--------|-----------|
| `produto` | Produtos (schema antigo) |
| `edital` | Editais (schema antigo) |
| `especificacao_produto` | Specs de produto (schema antigo) |
| `documento_produto` | Docs de produto (schema antigo) |
| `documento_edital` | Docs de edital (schema antigo) |
| `requisito_edital` | Requisitos (schema antigo) |
| `aderencia_edital` | Aderencia (schema antigo) |
| `gap_aderencia` | Gaps (schema antigo) |
| `classificacao_edital` | Classificacao (schema antigo) |
| `embedding_produto` | Embeddings (schema antigo) |
| `orgao` | Orgaos (schema antigo) |
| `requisito_atendimento` | Atendimentos (schema antigo) |

### 4.4 Campos Detalhados das Tabelas Ativas

> Detalhamento completo disponivel em `docs/tabelas.md`

**Tabelas com mais campos:**
- `editais` — 31 campos (a mais complexa do sistema)
- `analises` — 17 campos (4 scores + contadores + precos)
- `precos_historicos` — 16 campos (precos + resultado + fonte)
- `monitoramentos` — 17 campos (filtros + frequencia + status)
- `preferencias_notificacao` — 13 campos (canais + horarios + filtros)

---

## 5. Tabelas Criadas (14 novas tabelas) — IMPLEMENTADO

As 14 tabelas abaixo foram **criadas no banco MySQL** e seus **models SQLAlchemy adicionados** em `backend/models.py`.
Total de tabelas ativas: **37** (23 existentes + 14 novas).

Correcoes de integridade referencial tambem aplicadas:
- `analises_detalhes.requisito_id` — adicionado `ON DELETE CASCADE`
- `analises_detalhes.especificacao_id` — adicionada FK → `produtos_especificacoes.id ON DELETE SET NULL`
- `propostas.analise_id` — adicionado `ON DELETE SET NULL`
- `documentos.documento_pai_id` — adicionada FK self-referential → `documentos.id ON DELETE SET NULL`
- `editais.status` enum — adicionados valores `ganho` e `perdido`
- Todos os `backref` convertidos para `back_populates` (padronizacao)
- Relationships adicionados em User (20), Edital (10), Produto, Analise, Session, etc.

### 5.1 Empresa

```
empresa
├── id (UUID PK)
├── user_id (FK → users)
├── cnpj (varchar 20, UNIQUE)
├── razao_social (varchar 255)
├── nome_fantasia (varchar 255)
├── endereco (text)
├── cidade (varchar 100)
├── uf (varchar 2)
├── cep (varchar 10)
├── telefone (varchar 20)
├── email (varchar 255)
├── porte (enum: me, epp, medio, grande)
├── areas_atuacao (JSON)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-001

### 5.2 Documentos da Empresa

```
empresa_documentos
├── id (UUID PK)
├── empresa_id (FK → empresa)
├── tipo (enum: contrato_social, atestado_capacidade, balanco, alvara, registro_conselho, procuracao, outro)
├── nome_arquivo (varchar 255)
├── path_arquivo (varchar 500)
├── data_emissao (date)
├── data_vencimento (date)
├── texto_extraido (longtext)
├── processado (boolean)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-002

### 5.3 Certidoes da Empresa

```
empresa_certidoes
├── id (UUID PK)
├── empresa_id (FK → empresa)
├── tipo (enum: cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, outro)
├── orgao_emissor (varchar 255)
├── numero (varchar 100)
├── data_emissao (date)
├── data_vencimento (date)
├── path_arquivo (varchar 500)
├── status (enum: valida, vencida, pendente)
├── url_consulta (varchar 500)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-003

### 5.4 Responsaveis da Empresa

```
empresa_responsaveis
├── id (UUID PK)
├── empresa_id (FK → empresa)
├── nome (varchar 255)
├── cargo (varchar 100)
├── cpf (varchar 14)
├── email (varchar 255)
├── telefone (varchar 20)
├── tipo (enum: representante_legal, preposto, tecnico)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-001, RF-002

### 5.5 Contrato

```
contrato
├── id (UUID PK)
├── user_id (FK → users)
├── edital_id (FK → editais)
├── numero_contrato (varchar 100)
├── orgao (varchar 255)
├── objeto (text)
├── valor_total (decimal 15,2)
├── data_assinatura (date)
├── data_inicio (date)
├── data_fim (date)
├── data_vigencia (date)
├── status (enum: vigente, encerrado, rescindido, suspenso)
├── arquivo_path (varchar 500)
├── observacoes (text)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-020, RF-021

### 5.6 Entregas de Contrato

```
contrato_entrega
├── id (UUID PK)
├── contrato_id (FK → contrato)
├── descricao (text)
├── quantidade (decimal 15,4)
├── valor_unitario (decimal 15,2)
├── valor_total (decimal 15,2)
├── data_prevista (date)
├── data_realizada (date)
├── nota_fiscal (varchar 100)
├── status (enum: pendente, entregue, atrasado, cancelado)
├── observacoes (text)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-020, RF-021

### 5.7 Recurso Administrativo

```
recurso
├── id (UUID PK)
├── user_id (FK → users)
├── edital_id (FK → editais)
├── tipo (enum: recurso, contra_razao, impugnacao)
├── motivo (text)
├── texto_minuta (longtext)
├── fundamentacao_legal (text)
├── data_protocolo (datetime)
├── prazo_limite (datetime)
├── status (enum: rascunho, protocolado, deferido, indeferido, pendente)
├── resultado (text)
├── arquivo_path (varchar 500)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-012, RF-018

### 5.8 Lead CRM

```
lead_crm
├── id (UUID PK)
├── user_id (FK → users)
├── orgao (varchar 255)
├── contato_nome (varchar 255)
├── contato_cargo (varchar 100)
├── contato_telefone (varchar 20)
├── contato_email (varchar 255)
├── status_pipeline (enum: prospeccao, contato, proposta, negociacao, ganho, perdido, inativo)
├── origem (varchar 100)
├── valor_potencial (decimal 15,2)
├── proxima_acao (text)
├── data_proxima_acao (date)
├── ultima_interacao (datetime)
├── observacoes (text)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-019

### 5.9 Acao Pos-Perda

```
acao_pos_perda
├── id (UUID PK)
├── user_id (FK → users)
├── edital_id (FK → editais)
├── tipo_acao (enum: reprocessar_oferta, visita_tecnica, nova_proposta, recurso, acompanhar)
├── descricao (text)
├── responsavel (varchar 255)
├── data_prevista (date)
├── data_realizada (date)
├── resultado (text)
├── status (enum: pendente, em_andamento, concluida, cancelada)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-019, RF-026

### 5.10 Log de Auditoria

```
auditoria_log
├── id (UUID PK)
├── user_id (FK → users)
├── acao (varchar 50)  -- criar, atualizar, excluir, consultar
├── entidade (varchar 50)  -- produto, edital, proposta, etc
├── entidade_id (varchar 36)
├── dados_antes (JSON)
├── dados_depois (JSON)
├── ip_address (varchar 50)
├── user_agent (varchar 500)
├── session_id (varchar 36)
├── created_at (datetime)
```
**Requisito:** RF-030

### 5.11 Aprendizado / Feedback

```
aprendizado_feedback
├── id (UUID PK)
├── user_id (FK → users)
├── tipo_evento (enum: resultado_edital, score_ajustado, preco_ajustado, feedback_usuario)
├── entidade (varchar 50)
├── entidade_id (varchar 36)
├── dados_entrada (JSON)  -- score previsto, preco sugerido, etc
├── resultado_real (JSON)  -- score real, preco vencedor, etc
├── delta (JSON)  -- diferenca entre previsto e real
├── aplicado (boolean)  -- se o ajuste foi aplicado
├── created_at (datetime)
```
**Requisito:** RF-029

### 5.12 Parametro de Score

```
parametro_score
├── id (UUID PK)
├── user_id (FK → users)
├── peso_tecnico (decimal 5,2, default 0.40)
├── peso_comercial (decimal 5,2, default 0.25)
├── peso_participacao (decimal 5,2, default 0.20)
├── peso_ganho (decimal 5,2, default 0.15)
├── limiar_go (decimal 5,2, default 70.0)  -- score minimo para go
├── limiar_nogo (decimal 5,2, default 40.0)  -- score abaixo = no-go
├── margem_minima (decimal 5,2)  -- margem minima desejada %
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-009, RF-037

### 5.13 Dispensa

```
dispensa
├── id (UUID PK)
├── user_id (FK → users)
├── edital_id (FK → editais)
├── artigo (varchar 50)  -- Art. 75, I / Art. 75, II / etc
├── valor_limite (decimal 15,2)
├── justificativa (text)
├── cotacao_texto (longtext)
├── fornecedores_cotados (JSON)
├── status (enum: aberta, cotacao_enviada, adjudicada, encerrada)
├── data_limite (datetime)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-027

### 5.14 Estrategia de Edital

```
estrategia_edital
├── id (UUID PK)
├── user_id (FK → users)
├── edital_id (FK → editais)
├── decisao (enum: go, nogo, acompanhar)
├── prioridade (enum: alta, media, baixa)
├── margem_desejada (decimal 5,2)
├── agressividade_preco (enum: conservador, moderado, agressivo)
├── justificativa (text)
├── data_decisao (datetime)
├── decidido_por (varchar 255)
├── created_at (datetime)
└── updated_at (datetime)
```
**Requisito:** RF-037

---

## 6. Resumo de Cobertura

### 6.1 Estatisticas dos 40 Requisitos Funcionais

| Status | Quantidade | Percentual |
|--------|-----------|-----------|
| **IMPLEMENTADO** (Agente + UI) | 7 | 17.5% |
| **IMPLEMENTADO (Agente)** | 5 | 12.5% |
| **PARCIAL** | 14 | 35.0% |
| **MOCK (UI)** | 8 | 20.0% |
| **NAO IMPLEMENTADO** | 6 | 15.0% |

### 6.2 Cobertura por Area

| Area | Total RF | Impl. | Parcial | Mock | Nao Impl. |
|------|---------|-------|---------|------|----------|
| Configuracao (RF-001 a RF-009) | 9 | 2 | 4 | 3 | 0 |
| Fluxo Comercial (RF-010 a RF-021) | 12 | 3 | 3 | 5 | 1 |
| Indicadores (RF-022 a RF-026) | 5 | 1 | 3 | 1 | 0 |
| Transversais (RF-027 a RF-040) | 14 | 6 | 4 | 0 | 4 |

### 6.3 Requisitos Nao Funcionais

| RNF | Status |
|-----|--------|
| RNF-001: Escalabilidade | PARCIAL |
| RNF-002: Modularidade | IMPLEMENTADO |
| RNF-003: Observabilidade | PARCIAL |
| RNF-004: Custos Controlaveis | NAO IMPLEMENTADO |

### 6.4 Gaps Criticos (Maiores Riscos)

| # | Gap | Impacto | Esforco |
|---|-----|---------|---------|
| 1 | **Empresa** — Nenhum model. EmpresaPage e 100% mock. | ALTO — sem dados da empresa, nao pode gerar documentos habilitativos | Medio |
| 2 | **Recurso/Contra-Razoes** — Zero implementacao. DOC4 mostra placeholder. | ALTO — funcionalidade critica pos-pregao | Medio |
| 3 | **CRM** — CRMPage e 100% mock. Sem backend. | MEDIO — valor para retencao de clientes/orgaos | Medio |
| 4 | **Contrato/Producao** — Nenhum model. ProducaoPage e 100% mock. | ALTO — nao acompanha execucao pos-vitoria | Medio |
| 5 | **Aprendizado Continuo** — Zero implementacao. | MEDIO — sistema nao evolui com uso | Alto |
| 6 | **Governanca/Auditoria** — Nenhum log estruturado. | ALTO — sem rastreabilidade de acoes | Medio |
| 7 | **Scheduler de Monitoramento** — Backend existe mas sem execucao automatica. | ALTO — monitoramento nao funciona automaticamente | Medio |
| 8 | **Envio real de Notificacoes** — Models existem mas nao envia email/push. | ALTO — alertas nao chegam ao usuario | Medio |
| 9 | **Paginas MOCK sem backend** — 8 paginas mock sem API. | MEDIO — UI demonstra mas nao funciona | Alto |
| 10 | **REST APIs para paginas** — Paginas nao consomem backend via REST. | MEDIO — desconexao UI/backend | Alto |

### 6.5 Inventario Completo de Implementacao

**Backend:**
- 23 models SQLAlchemy (26 tabelas no MySQL incluindo 3 legado)
- 48 tool_* functions em tools.py
- 54 processar_* handlers em app.py
- 47 action_types reconhecidos por detectar_intencao_ia()
- 28 rotas REST em app.py

**Frontend:**
- 23 paginas React
- 210+ prompts prontos em ChatInput.tsx (17 categorias)
- FloatingChat com upload de arquivos
- Sistema de autenticacao (JWT + refresh token)

---

## 7. Proximos Passos Recomendados

### Prioridade 1 — Critica (Funcionalidade core quebrada)
1. Implementar model + tools para **Empresa** (RF-001, RF-002, RF-003)
2. Implementar **Scheduler** para monitoramento automatico (RF-023)
3. Implementar **envio real de notificacoes** (email ao menos) (RF-039)
4. Criar **REST APIs** para paginas consumirem dados do backend (RF-028)

### Prioridade 2 — Importante (Funcionalidades de alto valor)
5. Implementar **Contrato/Producao** (RF-020, RF-021)
6. Implementar **Recurso/Impugnacao** com model e tools (RF-012, RF-018)
7. Conectar **paginas MOCK** ao backend (CRM, Lances, Followup, etc)
8. Implementar **Auditoria** (RF-030)

### Prioridade 3 — Evolucao (Diferenciacao competitiva)
9. Implementar **Aprendizado Continuo** (RF-029)
10. Implementar **Analytics TAM/SAM/SOM** (RF-025)
11. Implementar **Estrategia Comercial** (RF-037)
12. Implementar **Deteccao de Itens Intrusos** (RF-038)
13. Integrar **tabelas legado** (classe_produto, campo_classe, categoria_edital)
14. Implementar **Custos de IA** (RNF-004)
