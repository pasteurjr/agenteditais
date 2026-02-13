# RELATORIO DE SITUACAO ATUAL DO BANCO DE DADOS — VERSAO CORRIGIDA

**Data:** 2026-02-12 (revisado)
**Banco:** MySQL `editais` (host configurado via .env)
**Objetivo:** Diagnosticar inconsistencias entre banco, models, tools, endpoints, prompts e UI

> **NOTA**: Esta versao corrige erros da versao anterior, que marcava tabelas com 0 rows como
> "nao usadas" quando na verdade possuem CRUD completo implementado via chat pipeline.
> Uma tabela com 0 rows significa "implementada mas sem dados salvos ainda", NAO "nao usada".

---

## 1. ARQUITETURA DO SISTEMA — Como o CRUD Funciona

O sistema usa **o chat como canal unico de CRUD**:

```
Dropdown (140+ prompts) → Texto no Chat → POST /api/chat
    → detectar_intencao_ia() [DeepSeek-chat classifica a intencao]
    → detectar_intencao_fallback() [regex/keywords se IA falhar]
    → processar_*() [51 handlers em app.py]
    → tool_*() [49 funcoes em tools.py]
    → SQLAlchemy Models → MySQL
```

**NAO existem endpoints REST de escrita separados** (exceto auth e upload). Isso e POR DESIGN.
As unicas escritas fora do chat sao:
- `POST /api/auth/register` — criar usuario
- `POST /api/auth/login` — criar token
- `POST /api/upload` / `POST /api/chat-upload` — upload de arquivos com processamento

---

## 2. INVENTARIO COMPLETO — 38 TABELAS

### Legenda
- **Rows**: Contagem exata de registros no banco
- **Model**: Classe SQLAlchemy em `backend/models.py`
- **CRUD Status**: Implementacao completa (Prompt + Intencao + Handler + Tool + Tabela)
- **Endpoint GET**: Rota REST para leitura direta
- **UI Page**: Pagina do frontend que exibe dados

### 2.1 Tabelas do Schema NOVO (UUID) — USADAS PELO APP

| # | Tabela | Rows | Model | CRUD Status | Endpoint GET | UI Page |
|---|--------|------|-------|-------------|--------------|---------|
| 1 | `users` | 3 | User | COMPLETO (auth) | GET /api/auth/user | LoginPage |
| 2 | `refresh_tokens` | 50 | RefreshToken | COMPLETO (auth) | - | - |
| 3 | `sessions` | 101 | Session | COMPLETO | GET /api/sessions | FloatingChat |
| 4 | `messages` | 1118 | Message | COMPLETO | GET /api/sessions/:id | FloatingChat |
| 5 | `produtos` | **22** | Produto | **COMPLETO** — 11 prompts, C/R/U/D | GET /api/produtos | **PortfolioPage** |
| 6 | `produtos_especificacoes` | **263** | ProdutoEspecificacao | **COMPLETO** — via upload/reprocessar | (via produto) | **PortfolioPage** |
| 7 | `produtos_documentos` | **4** | ProdutoDocumento | **COMPLETO** — upload/download | (via produto) | **PortfolioPage** |
| 8 | `editais` | 0 | Edital | **COMPLETO** — 20+ prompts, C/R/U/D | GET /api/editais | CaptacaoPage(mock) |
| 9 | `editais_requisitos` | 0 | EditalRequisito | **COMPLETO** — tool_extrair_requisitos | (via edital) | - |
| 10 | `editais_documentos` | 0 | EditalDocumento | **COMPLETO** — tool_baixar_pdf_pncp, tool_baixar_ata_pncp | (via edital) | - |
| 11 | `editais_itens` | 0 | EditalItem | **COMPLETO** — tool_buscar_itens_edital_pncp | (via edital) | - |
| 12 | `analises` | 0 | Analise | **COMPLETO** — tool_calcular_aderencia | GET /api/analises | - |
| 13 | `analises_detalhes` | 0 | AnaliseDetalhe | **COMPLETO** — via tool_calcular_aderencia | (via analise) | - |
| 14 | `propostas` | 0 | Proposta | **COMPLETO** — tool_gerar_proposta | GET /api/propostas | PropostaPage(mock) |
| 15 | `fontes_editais` | **13** | FonteEdital | **COMPLETO** — cadastrar/listar/ativar/desativar | GET /api/fontes | - |
| 16 | `concorrentes` | **7** | Concorrente | **PARCIAL** — C/R via resultado/ata, sem U/D direto | - | ConcorrenciaPage(mock) |
| 17 | `precos_historicos` | **24** | PrecoHistorico | **COMPLETO** — registrar_resultado, extrair_ata, buscar_precos_pncp | - | - |
| 18 | `participacoes_editais` | 0 | ParticipacaoEdital | **COMPLETO** — via registrar_resultado/extrair_ata | - | - |
| 19 | `alertas` | 0 | Alerta | **COMPLETO** — configurar/listar/cancelar alertas | - | FlagsPage(mock) |
| 20 | `monitoramentos` | **3** | Monitoramento | **COMPLETO** — configurar/listar/desativar | - | MonitoriaPage(mock) |
| 21 | `notificacoes` | 0 | Notificacao | **PARCIAL** — R/U (historico, marcar_lida), sem CREATE direto | - | - |
| 22 | `preferencias_notificacao` | **2** | PreferenciasNotificacao | **COMPLETO** — configurar_preferencias | - | ParametrizacoesPage |
| 23 | `documentos` | 0 | Documento | **NAO IMPLEMENTADO** — model existe, sem tool/prompt | - | - |

### 2.2 Tabelas do Schema ANTIGO (INT id) — NAO usadas, 0 rows, SEM model

| # | Tabela | Rows | Duplica | Recomendacao |
|---|--------|------|---------|--------------|
| 24 | `produto` | 0 | `produtos` | **DROPAR** |
| 25 | `edital` | 0 | `editais` | **DROPAR** |
| 26 | `especificacao_produto` | 0 | `produtos_especificacoes` | **DROPAR** |
| 27 | `documento_produto` | 0 | `produtos_documentos` | **DROPAR** |
| 28 | `documento_edital` | 0 | `editais_documentos` | **DROPAR** |
| 29 | `requisito_edital` | 0 | `editais_requisitos` | **DROPAR** |
| 30 | `aderencia_edital` | 0 | `analises` | **DROPAR** |
| 31 | `gap_aderencia` | 0 | `analises_detalhes` | **DROPAR** |
| 32 | `requisito_atendimento` | 0 | `analises_detalhes` | **DROPAR** |
| 33 | `classificacao_edital` | 0 | Nenhum | **DROPAR** (orfao) |
| 34 | `embedding_produto` | 0 | Nenhum | **DROPAR** (FK para `produto` antigo) |
| 35 | `orgao` | 0 | (inline em editais.orgao) | **DROPAR** (ref pelo schema antigo) |

### 2.3 Tabelas ORFAS com dados reais (no banco, SEM model)

| # | Tabela | Rows | Descricao | Recomendacao |
|---|--------|------|-----------|--------------|
| 36 | `classe_produto` | **10** | Classes de produto com nome, descricao, status | **CRIAR MODEL** + integrar |
| 37 | `campo_classe` | **38** | Campos dinamicos por classe (tipo, opcoes JSON, obrigatorio) | **CRIAR MODEL** + integrar |
| 38 | `categoria_edital` | **6** | Categorias de edital com palavras-chave para classificacao | **CRIAR MODEL** + integrar |

---

## 3. MAPEAMENTO COMPLETO: PROMPT → INTENCAO → HANDLER → TOOL → TABELA

### 3.1 CADASTRO DE PRODUTOS (11 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) Afetada(s) |
|--------|----------|---------|------|----------------------|
| Cadastrar produto (upload PDF) | `upload_manual` | processar_upload_manual | tool_processar_upload | produtos(I), produtos_especificacoes(I), produtos_documentos(U) |
| Cadastrar produto de URL | `download_url` | processar_download_url | tool_download_arquivo | produtos_documentos(I) |
| Buscar manual na web | `buscar_web` | processar_buscar_web | tool_web_search | Nenhuma (API externa) |
| Buscar datasheet na web | `buscar_web` | processar_buscar_web | tool_web_search | Nenhuma (API externa) |
| Listar meus produtos | `listar_produtos` | processar_listar_produtos | tool_listar_produtos | produtos(R) |
| Buscar produto no banco | `listar_produtos` | processar_listar_produtos | tool_listar_produtos | produtos(R) |
| Verificar produto cadastrado | `listar_produtos` | processar_listar_produtos | tool_listar_produtos | produtos(R) |
| Reprocessar especificacoes | `reprocessar_produto` | processar_reprocessar_produto | tool_reprocessar_produto | produtos_especificacoes(D+I) |
| Atualizar/editar produto | `atualizar_produto` | processar_atualizar_produto | tool_atualizar_produto | produtos(U) |
| Excluir produto | `excluir_produto` | processar_excluir_produto | tool_excluir_produto | produtos(D CASCADE) |
| Excluir TODOS os produtos | `excluir_produto` | processar_excluir_produto | tool_excluir_produto | produtos(D CASCADE) |

### 3.2 BUSCA E CADASTRO DE EDITAIS (20+ prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Buscar editais (com score) | `buscar_editais` | processar_buscar_editais | tool_buscar_editais_scraper + tool_calcular_score_aderencia | editais(I via salvar), analises(I) |
| Buscar edital por numero | `buscar_edital_numero` | processar_buscar_edital_numero | tool_listar_editais / PNCP API | editais(R ou I) |
| Buscar editais (sem score) | `buscar_editais_simples` | processar_buscar_editais | tool_buscar_editais_scraper | Nenhuma (resultado na mensagem) |
| TODOS editais (incl. encerr.) | `buscar_editais` | processar_buscar_editais | tool_buscar_editais_scraper | Nenhuma (resultado na mensagem) |
| Links de editais por area | `buscar_links_editais` | processar_buscar_links_editais | tool_buscar_links_editais | Nenhuma (links retornados) |
| Buscar editais no banco | `listar_editais` | processar_listar_editais | tool_listar_editais | editais(R) |
| Listar editais salvos | `listar_editais` | processar_listar_editais | tool_listar_editais | editais(R) |
| Listar editais por status | `listar_editais` | processar_listar_editais | tool_listar_editais | editais(R) |
| Cadastrar edital manualmente | `cadastrar_edital` | processar_cadastrar_edital | (direto no handler) | editais(I) |
| Salvar editais da busca | `salvar_editais` | processar_salvar_editais | tool_salvar_editais_selecionados | editais(I) |
| Atualizar/editar edital | `atualizar_edital` | processar_atualizar_edital | tool_atualizar_edital | editais(U) |
| Excluir edital | `excluir_edital` | processar_excluir_edital | tool_excluir_edital | editais(D CASCADE) |
| Excluir TODOS os editais | `excluir_edital` | processar_excluir_edital | tool_excluir_editais_multiplos | editais(D) |

### 3.3 ANALISE DE EDITAIS (12 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Resumir edital | `resumir_edital` | processar_resumir_edital | (LLM sobre PDF) | editais(R), editais_documentos(R) |
| Perguntar ao edital (x7) | `perguntar_edital` | processar_perguntar_edital | (LLM Q&A sobre PDF) | editais(R), editais_documentos(R) |
| Baixar PDF do edital | `baixar_pdf_edital` | processar_baixar_pdf_edital | tool_baixar_pdf_pncp | editais(R/U), editais_documentos(I) |
| Atualizar URL do edital | `atualizar_url_edital` | processar_atualizar_url_edital | tool_atualizar_edital | editais(U) |

### 3.4 ANALISE DE ADERENCIA (3 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Calcular aderencia | `calcular_aderencia` | processar_calcular_aderencia | tool_calcular_aderencia | analises(I/U), analises_detalhes(I) |
| Listar analises | `consulta_mindsdb` | processar_consulta_mindsdb | tool_consulta_mindsdb | analises(R) |
| Verificar completude | `verificar_completude` | processar_verificar_completude | tool_verificar_completude_produto | produtos(R), produtos_especificacoes(R) |

### 3.5 GERACAO DE PROPOSTAS (3 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Gerar proposta tecnica | `gerar_proposta` | processar_gerar_proposta | tool_gerar_proposta | propostas(I) |
| Listar propostas | `listar_propostas` | processar_listar_propostas | (query direta) | propostas(R) |
| Excluir proposta | `excluir_edital` | processar_excluir_edital | (query direta) | propostas(D) |

### 3.6 REGISTRO DE RESULTADOS (8 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Registrar vitoria/derrota | `registrar_resultado` | processar_registrar_resultado | tool_registrar_resultado | precos_historicos(I), concorrentes(I/U), participacoes_editais(I), editais(U) |
| Edital cancelado/deserto/revogado | `registrar_resultado` | processar_registrar_resultado | tool_registrar_resultado | editais(U status) |
| Consultar resultado | `consultar_resultado` | processar_consultar_resultado | (query direta) | precos_historicos(R), editais(R) |
| Ver todos os resultados | `consultar_resultado` | processar_consultar_todos_resultados | (query direta) | precos_historicos(R) |

### 3.7 BUSCA E EXTRACAO DE ATAS (6 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Buscar atas no PNCP | `buscar_atas_pncp` | processar_buscar_atas_pncp | tool_buscar_atas_pncp | Nenhuma (API PNCP) |
| Baixar atas do PNCP | `buscar_atas_pncp` | processar_buscar_atas_pncp | tool_baixar_ata_pncp | editais_documentos(I) |
| Extrair resultados de ata | `extrair_ata` | processar_extrair_ata | tool_extrair_ata_pdf | precos_historicos(I), concorrentes(I), participacoes_editais(I) |
| Registrar resultados da ata | `extrair_ata` | processar_extrair_ata | tool_extrair_ata_pdf | precos_historicos(I), concorrentes(I), participacoes_editais(I) |

### 3.8 HISTORICO DE PRECOS (6 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Buscar precos no PNCP | `buscar_precos_pncp` | processar_buscar_precos_pncp | tool_buscar_precos_pncp | precos_historicos(I) |
| Ver historico de precos | `historico_precos` | processar_historico_precos | tool_historico_precos | precos_historicos(R) |

### 3.9 ANALISE DE CONCORRENTES (5 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Listar concorrentes | `listar_concorrentes` | processar_listar_concorrentes | tool_listar_concorrentes | concorrentes(R) |
| Analisar concorrente | `analisar_concorrente` | processar_analisar_concorrente | tool_analisar_concorrente | concorrentes(R), precos_historicos(R) |

### 3.10 RECOMENDACAO DE PRECOS (4 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Recomendar preco | `recomendar_preco` | processar_recomendar_preco | tool_recomendar_preco | precos_historicos(R), analises(R) |

### 3.11 CLASSIFICACAO DE EDITAIS (3 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Classificar edital | `classificar_edital` | processar_classificar_edital | tool_classificar_edital | Nenhuma (LLM classifica) |

### 3.12 FONTES DE EDITAIS (4 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Cadastrar fonte | `cadastrar_fonte` | processar_cadastrar_fonte | tool_cadastrar_fonte | fontes_editais(I) |
| Listar fontes | `listar_fontes` | processar_listar_fontes | tool_listar_fontes | fontes_editais(R) |
| Ativar/Desativar fonte | (via cadastrar_fonte) | processar_cadastrar_fonte | (query direta) | fontes_editais(U) |

### 3.13 CONSULTAS ANALITICAS MindsDB (18 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Todos os 18 prompts | `consulta_mindsdb` | processar_consulta_mindsdb | tool_consulta_mindsdb | Todas (via SQL analitico) |

### 3.14 ALERTAS E PRAZOS — Sprint 2 (8 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Configurar alertas | `configurar_alertas` | processar_configurar_alertas | tool_configurar_alertas | alertas(I) |
| Listar alertas | `listar_alertas` | processar_listar_alertas | tool_listar_alertas | alertas(R) |
| Cancelar alerta | `cancelar_alerta` | processar_cancelar_alerta | tool_cancelar_alerta | alertas(U/D) |
| Dashboard de prazos | `dashboard_prazos` | processar_dashboard_prazos | tool_dashboard_prazos | editais(R) |
| Proximos pregoes | `listar_alertas` | processar_listar_alertas | tool_listar_alertas | alertas(R), editais(R) |

### 3.15 CALENDARIO — Sprint 2 (4 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Calendario do mes/semana | `calendario_editais` | processar_calendario_editais | tool_calendario_editais | editais(R) |
| Datas importantes | `calendario_editais` | processar_calendario_editais | tool_calendario_editais | editais(R) |

### 3.16 MONITORAMENTO — Sprint 2 (5 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Criar monitoramento | `configurar_monitoramento` | processar_configurar_monitoramento | tool_configurar_monitoramento | monitoramentos(I) |
| Meus monitoramentos | `listar_monitoramentos` | processar_listar_monitoramentos | tool_listar_monitoramentos | monitoramentos(R) |
| Parar monitoramento | `desativar_monitoramento` | processar_desativar_monitoramento | tool_desativar_monitoramento | monitoramentos(U) |

### 3.17 NOTIFICACOES — Sprint 2 (4 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Configurar notificacoes | `configurar_notificacoes` | processar_configurar_notificacoes | tool_configurar_preferencias_notificacao | preferencias_notificacao(I/U) |
| Historico de notificacoes | `historico_notificacoes` | processar_historico_notificacoes | tool_historico_notificacoes | notificacoes(R) |

### 3.18 EXTRACAO DE DATAS — Sprint 2 (2 prompts)

| Prompt | Intencao | Handler | Tool | Tabela(s) |
|--------|----------|---------|------|-----------|
| Extrair datas do edital (PDF) | `extrair_datas_edital` | processar_extrair_datas_edital | tool_extrair_datas_edital | alertas(I) |

---

## 4. TABELAS DUPLICADAS — Schema Antigo vs Novo

O banco possui **dois schemas coexistentes** (migracao incompleta):

| Schema Antigo (INT) | Schema Novo (UUID) | Dados Antigo | Dados Novo | App Usa |
|---|---|---|---|---|
| `produto` | `produtos` | 0 | 22 | **produtos** |
| `edital` | `editais` | 0 | 0 | **editais** |
| `especificacao_produto` | `produtos_especificacoes` | 0 | 263 | **produtos_especificacoes** |
| `documento_produto` | `produtos_documentos` | 0 | 4 | **produtos_documentos** |
| `documento_edital` | `editais_documentos` | 0 | 0 | **editais_documentos** |
| `requisito_edital` | `editais_requisitos` | 0 | 0 | **editais_requisitos** |
| `aderencia_edital` + `requisito_atendimento` + `gap_aderencia` | `analises` + `analises_detalhes` | 0 | 0 | **analises** |

**RECOMENDACAO**: Dropar TODAS as 12 tabelas do schema antigo (todas vazias, nenhuma referenciada):

```sql
DROP TABLE IF EXISTS requisito_atendimento;
DROP TABLE IF EXISTS gap_aderencia;
DROP TABLE IF EXISTS aderencia_edital;
DROP TABLE IF EXISTS embedding_produto;
DROP TABLE IF EXISTS classificacao_edital;
DROP TABLE IF EXISTS especificacao_produto;
DROP TABLE IF EXISTS documento_produto;
DROP TABLE IF EXISTS documento_edital;
DROP TABLE IF EXISTS requisito_edital;
DROP TABLE IF EXISTS edital;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS orgao;
```

---

## 5. TABELAS ORFAS COM DADOS VALIOSOS

### 5.1 `classe_produto` — 10 registros

```
id INT PK, nome VARCHAR(100) UNIQUE, descricao TEXT, status ENUM('ATIVO','INATIVO')
```

O app **IGNORA** esta tabela. O PortfolioPage hardcoda classes no frontend. A tabela antiga `produto` tinha `classe_id FK → classe_produto.id`, mas a nova `produtos` usa `categoria ENUM(...)`.

### 5.2 `campo_classe` — 38 registros

```
id INT PK, classe_id FK→classe_produto, nome VARCHAR(100), tipo ENUM('TEXT','NUMBER','DATE','SELECT','BOOLEAN'),
opcoes LONGTEXT (JSON), obrigatorio TINYINT(1), ordem INT
```

Sistema de **campos dinamicos por classe** — formularios parametrizaveis para cada tipo de produto. Totalmente ignorado.

### 5.3 `categoria_edital` — 6 registros

```
id INT PK, nome VARCHAR(100) UNIQUE, descricao TEXT, palavras_chave LONGTEXT (JSON), status ENUM('ATIVO','INATIVO')
```

Categorias com **palavras-chave para classificacao automatica**. O model `Edital` usa `categoria ENUM(...)` hardcodado.

---

## 6. ENTIDADE EMPRESA — COMPLETAMENTE AUSENTE

| Camada | Status |
|--------|--------|
| Tabela no banco | **NAO EXISTE** |
| Model SQLAlchemy | **NAO EXISTE** |
| Tool functions | **NAO EXISTE** |
| Intencao no agente | **NAO EXISTE** |
| Prompt no ChatInput | **NAO EXISTE** |
| Endpoint REST | **NAO EXISTE** |
| Pagina UI (EmpresaPage) | **EXISTE mas com dados 100% MOCK** |

A EmpresaPage precisa gerenciar: CNPJ, razao social, endereco, contatos, documentacao (certidoes, atestados), dados bancarios, porte, ramos de atividade.

---

## 7. STATUS DAS PAGINAS DO FRONTEND

### FULLY FUNCTIONAL (3 paginas)
| Pagina | Descricao | Dados |
|--------|-----------|-------|
| LoginPage | Autenticacao real | API auth |
| RegisterPage | Registro real | API auth |
| **PortfolioPage** | **Produtos com CRUD completo** | **getProdutos + onSendToChat** |

### PARTIALLY FUNCTIONAL (2 paginas)
| Pagina | Descricao | O que falta |
|--------|-----------|-------------|
| EmpresaPage | Formularios locais, sem save | Tabela + model + tools + prompts + endpoint |
| ParametrizacoesPage | Config local, sem persistencia | Endpoints para ler/salvar dados reais |

### MOCK ONLY (16 paginas)
| Pagina | Dados | Backend correspondente |
|--------|-------|------------------------|
| Dashboard | KPIs hardcoded | Precisa endpoints ou MindsDB |
| CaptacaoPage | 7 editais mock | **Backend EXISTE** (20+ prompts de editais implementados) |
| ValidacaoPage | 5 editais mock | **Backend EXISTE** (resumir/perguntar edital implementado) |
| PrecificacaoPage | Precos mock | **Backend EXISTE** (buscar_precos_pncp, recomendar_preco) |
| PropostaPage | 3 propostas mock | **Backend EXISTE** (gerar_proposta, listar_propostas) |
| SubmissaoPage | Checklists mock | Precisa implementar |
| LancesPage | Lances mock | Precisa implementar |
| FollowupPage | Resultados mock | **Backend EXISTE** (registrar_resultado, consultar_resultado) |
| ImpugnacaoPage | Impugnacoes mock | Precisa implementar |
| ProducaoPage | Contratos mock | Precisa implementar |
| FlagsPage | Alertas mock | **Backend EXISTE** (configurar_alertas, listar_alertas) |
| MonitoriaPage | Monitoramentos mock | **Backend EXISTE** (configurar_monitoramento) |
| ConcorrenciaPage | Concorrentes mock | **Backend EXISTE** (listar_concorrentes, analisar_concorrente) |
| MercadoPage | Tendencias mock | Precisa implementar (parcialmente MindsDB) |
| ContratadoRealizadoPage | Contratos mock | Precisa implementar |
| PerdasPage | Perdas mock | **Backend EXISTE parcial** (historico_precos com resultado) |
| CRMPage | Leads mock | Precisa implementar |

**CONCLUSAO CRITICA**: 10 das 16 paginas mock ja tem backend implementado via chat pipeline. O problema NAO e backend faltante — e **conectar as paginas ao backend existente** (via endpoints GET para leitura + onSendToChat para escrita).

---

## 8. INCONSISTENCIAS REAIS

### 8.1 Enum Edital.status — Divergencia Model vs Banco

**No models.py** tem valores `'ganho'` e `'perdido'` que **NAO EXISTEM** no banco:
```sql
-- Banco: ENUM('novo','analisando','participando','proposta_enviada','em_pregao',
--              'vencedor','perdedor','cancelado','desistido','aberto','fechado','suspenso')
-- Model adiciona: 'ganho', 'perdido' (vao dar erro se usados)
```

**Correcao**:
```sql
ALTER TABLE editais MODIFY COLUMN status ENUM('novo','analisando','participando',
    'proposta_enviada','em_pregao','vencedor','perdedor','cancelado','desistido',
    'aberto','fechado','suspenso','ganho','perdido');
```

### 8.2 Produto.categoria — Enum vs tabela classe_produto

O model usa `ENUM('equipamento','reagente',...)` hardcodado, enquanto a tabela `classe_produto` tem 10 classes cadastradas que deveriam ser a classificacao real.

### 8.3 Edital.categoria — Enum vs tabela categoria_edital

O model usa `ENUM('comodato','venda_equipamento',...)` hardcodado, enquanto a tabela `categoria_edital` tem 6 categorias com palavras-chave.

### 8.4 Tabela `documentos` sem implementacao

Model `Documento` existe em models.py, tabela existe no banco, mas nenhuma tool/prompt a utiliza.

---

## 9. PLANO DE CORRECAO — PRIORIDADES

### PRIORIDADE 1 — Critica

**9.1 Criar entidade Empresa completa**
- Criar tabelas `empresas` + `empresas_documentos`
- Criar models, tools, intencoes, prompts, endpoint GET
- Conectar EmpresaPage a dados reais

**9.2 Corrigir enum Edital.status no banco** (script SQL acima)

### PRIORIDADE 2 — Alta (conectar frontend ao backend existente)

**9.3 Conectar paginas mock ao backend via onSendToChat + endpoints GET**

As paginas que JA TEM backend implementado mas usam dados mock:
- CaptacaoPage → `getEditais()` + `onSendToChat`
- ValidacaoPage → `getEditais()` + `onSendToChat` (resumir/perguntar)
- PrecificacaoPage → endpoint GET precos + `onSendToChat`
- PropostaPage → `getPropostas()` + `onSendToChat`
- FollowupPage → endpoint GET resultados + `onSendToChat`
- FlagsPage → endpoint GET alertas + `onSendToChat`
- MonitoriaPage → endpoint GET monitoramentos + `onSendToChat`
- ConcorrenciaPage → endpoint GET concorrentes + `onSendToChat`

Endpoints GET necessarios (atualmente faltantes no backend):
```
GET /api/concorrentes          → listar concorrentes
GET /api/concorrentes/:id      → detalhe concorrente
GET /api/precos-historicos     → historico de precos
GET /api/alertas               → listar alertas
GET /api/monitoramentos        → listar monitoramentos
GET /api/notificacoes          → central de notificacoes
GET /api/empresa               → dados da empresa
GET /api/classes-produto       → classes + campos
GET /api/categorias-edital     → categorias
```

**9.4 Integrar classe_produto, campo_classe, categoria_edital**
- Criar models SQLAlchemy
- Criar endpoints GET
- PortfolioPage ler classes/campos do banco em vez de hardcodar

### PRIORIDADE 3 — Media

**9.5 Dropar 12 tabelas do schema antigo** (script SQL na secao 4)

**9.6 Decidir sobre tabela `documentos`** — implementar ou dropar

---

## 10. RESUMO EXECUTIVO

| Metrica | Valor |
|---------|-------|
| Total tabelas no banco | 38 |
| Tabelas schema novo (usadas pelo app) | 23 |
| Tabelas schema antigo (dropar) | 12 |
| Tabelas orfas com dados valiosos | 3 |
| Prompts implementados no dropdown | ~140 |
| Intencoes detectaveis pelo agente | 46 + 6 arquivo |
| Handlers processar_*() | 51 |
| Tool functions tool_*() | 49 |
| Paginas frontend | 21 |
| Paginas FUNCTIONAL | 3 (Login, Register, Portfolio) |
| Paginas MOCK com backend JA EXISTENTE | 10 (desconectadas) |
| Paginas MOCK sem backend | 6 (a implementar) |
| Entidades faltantes | 1 (Empresa — 0% implementado) |
| Models faltantes | 4 (ClasseProduto, CampoClasse, CategoriaEdital, Empresa) |
| Endpoints GET faltantes | 9 |
| Inconsistencias de enum | 2 (Edital.status, Produto.categoria) |
