# TABELAS DO SISTEMA facilicita.ia

**Banco:** MySQL `editais` (host configurado via .env)
**ORM:** SQLAlchemy (`backend/models.py`)
**Chaves primarias:** UUID varchar(36) (gerado por `uuid.uuid4()`)
**Total:** 37 tabelas ativas + 15 legado (old-schema)

---

## Indice

### Autenticacao e Chat
1. [users](#1-users) — Usuarios do sistema
2. [refresh_tokens](#2-refresh_tokens) — Tokens de renovacao JWT
3. [sessions](#3-sessions) — Sessoes de conversa do chat
4. [messages](#4-messages) — Mensagens trocadas no chat

### Portfolio de Produtos
5. [produtos](#5-produtos) — Catalogo de produtos da empresa
6. [produtos_especificacoes](#6-produtos_especificacoes) — Specs tecnicas extraidas de manuais
7. [produtos_documentos](#7-produtos_documentos) — Manuais e fichas tecnicas dos produtos

### Fontes de Editais
8. [fontes_editais](#8-fontes_editais) — Portais de busca de licitacoes

### Editais (Oportunidades)
9. [editais](#9-editais) — Editais de licitacao capturados
10. [editais_requisitos](#10-editais_requisitos) — Requisitos extraidos dos editais
11. [editais_documentos](#11-editais_documentos) — PDFs e anexos dos editais
12. [editais_itens](#12-editais_itens) — Itens/lotes dos editais (PNCP)

### Analises e Scores
13. [analises](#13-analises) — Analise de aderencia produto x edital
14. [analises_detalhes](#14-analises_detalhes) — Comparacao requisito a requisito

### Propostas
15. [propostas](#15-propostas) — Propostas tecnicas geradas

### Concorrencia e Precos
16. [concorrentes](#16-concorrentes) — Empresas concorrentes
17. [precos_historicos](#17-precos_historicos) — Historico de precos de editais finalizados
18. [participacoes_editais](#18-participacoes_editais) — Participacoes de empresas em editais

### Alertas e Monitoramento
19. [alertas](#19-alertas) — Alertas agendados para prazos de editais
20. [monitoramentos](#20-monitoramentos) — Buscas automaticas periodicas
21. [notificacoes](#21-notificacoes) — Historico de notificacoes enviadas
22. [preferencias_notificacao](#22-preferencias_notificacao) — Preferencias de canais e horarios

### Documentos Gerados
23. [documentos](#23-documentos) — Documentos gerados pelo sistema (propostas, relatorios)

### Empresa do Usuario
24. [empresas](#24-empresas) — Dados cadastrais da empresa
25. [empresa_documentos](#25-empresa_documentos) — Documentos habilitativos da empresa
26. [empresa_certidoes](#26-empresa_certidoes) — Certidoes negativas da empresa
27. [empresa_responsaveis](#27-empresa_responsaveis) — Representantes legais e tecnicos

### Contratos e Execucao
28. [contratos](#28-contratos) — Contratos firmados apos vitoria em licitacao
29. [contrato_entregas](#29-contrato_entregas) — Entregas previstas e realizadas

### Recursos e Impugnacoes
30. [recursos](#30-recursos) — Recursos administrativos e impugnacoes

### CRM e Pos-Venda
31. [leads_crm](#31-leads_crm) — Pipeline de relacionamento com orgaos publicos
32. [acoes_pos_perda](#32-acoes_pos_perda) — Acoes de reconquista apos perda

### Auditoria e Aprendizado
33. [auditoria_log](#33-auditoria_log) — Log de auditoria de todas as acoes
34. [aprendizado_feedback](#34-aprendizado_feedback) — Feedback para melhoria continua dos scores

### Parametrizacoes e Estrategia
35. [parametros_score](#35-parametros_score) — Pesos e limiares de score configuraveis
36. [dispensas](#36-dispensas) — Dispensas de licitacao (Art. 75)
37. [estrategias_editais](#37-estrategias_editais) — Decisao go/nogo por edital

---

## 1. users

**Objetivo:** Armazenar usuarios que acessam o sistema. E a raiz de multi-tenancy — todas as demais tabelas (exceto `fontes_editais` e `concorrentes`) filtram por `user_id` para garantir isolamento de dados.

**Requisitos:** RF-033 (Autenticacao e Multi-tenancy)

**Uso na UI:** LoginPage (autenticacao), RegisterPage (cadastro), Sidebar (exibir nome/avatar do usuario logado)

**Backend:** Rotas `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/logout`

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID do usuario | FK referenciada por todas as tabelas com `user_id`. Identifica dono de cada registro para multi-tenancy (RF-033) |
| `email` | varchar(255) UNIQUE | Sim | Email de login | LoginPage: campo de login. RF-033: credencial unica de acesso |
| `password_hash` | varchar(255) | Nao | Hash bcrypt da senha | RF-033: autenticacao por senha. Null quando login e via Google OAuth |
| `google_id` | varchar(255) UNIQUE | Nao | ID do Google OAuth | RF-033: autenticacao alternativa via Google |
| `name` | varchar(255) | Sim | Nome exibido | Sidebar: exibido no menu lateral. Propostas (RF-014): nome do responsavel |
| `picture_url` | text | Nao | URL do avatar (Google) | Sidebar: avatar exibido ao lado do nome |
| `created_at` | datetime | Sim | Data de criacao | Interno: ordenacao de usuarios |
| `last_login_at` | datetime | Nao | Ultimo login | RF-030 (Auditoria): rastreamento de ultimo acesso |

---

## 2. refresh_tokens

**Objetivo:** Gerenciar tokens de renovacao JWT para manter sessao do usuario ativa sem re-login. Cada token tem validade e pode ser revogado individualmente.

**Requisitos:** RF-033 (Autenticacao e Multi-tenancy)

**Uso na UI:** Transparente — o frontend renova o token automaticamente via `useAuth()` quando o access token expira.

**Backend:** Rota `/api/auth/refresh` (envia refresh_token, recebe novo access_token)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID do token | Identificador interno |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono do token | RF-033: ao excluir usuario, todos os tokens sao invalidados |
| `token` | varchar(64) UNIQUE | Sim | Token opaco (hex) | RF-033: enviado pelo frontend no header para renovacao |
| `expires_at` | datetime | Sim | Expiracao | RF-033: token rejeitado apos esta data |
| `revoked` | boolean | Sim | Se foi revogado | RF-033: logout revoga o token ativo |
| `created_at` | datetime | Sim | Data de criacao | Interno: limpeza de tokens antigos |

---

## 3. sessions

**Objetivo:** Representar uma conversa do chat entre o usuario e o agente IA. Cada sessao agrupa mensagens tematicas e pode ser renomeada, listada ou excluida.

**Requisitos:** RF-028 (Interface Hibrida — chat como interface principal)

**Uso na UI:** FloatingChat (lista de sessoes no painel lateral, criar/renomear/excluir sessoes)

**Backend:** Rotas `/api/sessions`, `/api/session/<id>`, `/api/session/<id>/rename`, `/api/new-session`

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID da sessao | FloatingChat: identificador para selecionar/carregar sessao. Documentos (RF-040): vincula documento a sessao de origem |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono da sessao | RF-033: filtra sessoes por usuario logado |
| `name` | varchar(255) | Sim | Nome da sessao | FloatingChat: exibido na lista de sessoes. Auto-gerado pela IA na 1a mensagem |
| `created_at` | datetime | Sim | Criacao | FloatingChat: ordenar sessoes (mais recentes primeiro) |
| `updated_at` | datetime | Sim | Ultima atividade | FloatingChat: reordenar apos nova mensagem |

---

## 4. messages

**Objetivo:** Armazenar cada mensagem trocada numa sessao de chat — tanto do usuario quanto da IA. Inclui o tipo de acao detectada (intent) para rastreabilidade.

**Requisitos:** RF-028 (Interface Hibrida), RF-030 (Auditoria — acao rastreavel por `action_type`)

**Uso na UI:** FloatingChat/ChatArea (exibir historico de mensagens com markdown renderizado)

**Backend:** Rota `POST /api/chat` (salva pergunta + resposta), `GET /api/session/<id>` (carrega historico)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | int PK AUTO_INCREMENT | Sim | ID sequencial | Unica tabela com INT PK (performance de insercao sequencial) |
| `session_id` | varchar(36) FK → sessions.id CASCADE | Sim | Sessao dona | RF-028: agrupa mensagens por conversa. Ao excluir sessao, mensagens cascadeiam |
| `role` | enum('user','assistant') | Sim | Quem enviou | ChatArea: estilizacao diferenciada (bolha azul vs cinza) |
| `content` | text | Sim | Conteudo da mensagem | ChatArea: renderizado como markdown (marked.js + highlight.js). Contem texto do usuario ou resposta completa da IA |
| `sources_json` | json | Nao | Fontes usadas na resposta | ChatArea: exibir badges de fontes consultadas (PNCP, MindsDB, etc.) |
| `action_type` | varchar(50) | Nao | Intent detectado | RF-030: rastreamento da acao executada (ex: `buscar_editais`, `gerar_proposta`). Permite auditoria de o que foi feito |
| `created_at` | datetime | Sim | Timestamp | ChatArea: exibir horario da mensagem |

---

## 5. produtos

**Objetivo:** Catalogo de produtos/equipamentos/reagentes da empresa do usuario. Base para calcular aderencia a editais, gerar propostas e recomendar precos.

**Requisitos:** RF-005 (Portfolio de Produtos), RF-010 (Captacao — score de aderencia), RF-011 (Validacao), RF-013 (Precificacao), RF-014 (Geracao de Proposta)

**Uso na UI:** PortfolioPage (CRUD de produtos, upload de manuais), CaptacaoPage (selecao de produto para calcular score)

**Backend tools:** `tool_processar_upload` (criar), `tool_extrair_especificacoes` (ler), `tool_reprocessar_produto` (reprocessar), `tool_atualizar_produto` (atualizar), `tool_excluir_produto` (excluir), `tool_listar_produtos` (listar), `tool_verificar_completude_produto` (validar)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID do produto | Referenciado por analises, propostas, precos_historicos. PortfolioPage: ID para navegacao de detalhe |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: cada usuario ve apenas seus produtos |
| `nome` | varchar(255) | Sim | Nome do produto | PortfolioPage: exibido na listagem. RF-005: identificacao principal. RF-014: nome na proposta |
| `codigo_interno` | varchar(50) | Nao | Codigo SKU interno | RF-005: codigo de referencia da empresa. PortfolioPage: coluna na tabela |
| `ncm` | varchar(20) | Nao | Classificacao fiscal NCM | RF-005: identificacao tributaria. Usado em propostas e notas fiscais |
| `categoria` | enum(9 valores) | Sim | Tipo do produto | RF-005: classificacao (equipamento, reagente, insumo...). RF-010: filtro na busca de editais por categoria. CaptacaoPage: filtro dropdown |
| `fabricante` | varchar(255) | Nao | Fabricante | RF-005: dados tecnicos. RF-014: incluido no texto da proposta |
| `modelo` | varchar(255) | Nao | Modelo | RF-005: identificacao unica do equipamento. RF-014: incluido na proposta |
| `descricao` | text | Nao | Descricao livre | RF-005: descricao detalhada. RF-014: base para gerar texto tecnico da proposta |
| `preco_referencia` | decimal(15,2) | Nao | Preco de tabela | RF-013: base para recomendacao de preco. RF-014: preco default se nao informado |
| `created_at` | datetime | Sim | Cadastro | PortfolioPage: ordenacao |
| `updated_at` | datetime | Sim | Ultima alteracao | PortfolioPage: indicar produtos recentemente atualizados |

---

## 6. produtos_especificacoes

**Objetivo:** Armazenar especificacoes tecnicas ESTRUTURADAS extraidas automaticamente de manuais PDF via IA. Permite comparacao numerica precisa entre o que o edital exige e o que o produto oferece.

**Requisitos:** RF-005 (Portfolio — extracao automatica), RF-011 (Validacao — comparacao tecnica), RF-014 (Proposta — tabela de conformidade)

**Uso na UI:** PortfolioPage (tabela de specs do produto selecionado)

**Backend tools:** `tool_processar_upload` (criar automaticamente), `tool_extrair_especificacoes` (criar), `tool_reprocessar_produto` (recriar), `tool_calcular_aderencia` (comparar com requisitos), `tool_gerar_proposta` (incluir na proposta)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID da spec | Referenciado por `analises_detalhes.especificacao_id` para vincular qual spec atendeu qual requisito |
| `produto_id` | varchar(36) FK → produtos.id CASCADE | Sim | Produto dono | RF-005: spec pertence a um produto. Ao excluir produto, specs cascadeiam |
| `nome_especificacao` | varchar(255) | Sim | Nome (ex: "Velocidade de centrifugacao") | RF-011: comparado com `editais_requisitos.nome_especificacao` para matching automatico |
| `valor` | varchar(500) | Sim | Valor textual (ex: "12.000 RPM") | RF-011: exibido na comparacao. RF-014: incluido na tabela de conformidade da proposta |
| `unidade` | varchar(50) | Nao | Unidade de medida | RF-011: normalizar comparacao (ex: converter mm para cm). PortfolioPage: exibido ao lado do valor |
| `valor_numerico` | decimal(15,6) | Nao | Valor numerico parseado | RF-011: comparacao matematica direta (>=, <=, range) com o valor exigido no edital |
| `operador` | varchar(10) | Nao | Operador (<, <=, =, >=, >, range) | RF-011: tipo de comparacao. Ex: ">=12000 RPM" → operador ">=" e valor_numerico 12000 |
| `valor_min` | decimal(15,6) | Nao | Limite inferior (para ranges) | RF-011: range de operacao. Ex: temperatura de 2°C a 8°C |
| `valor_max` | decimal(15,6) | Nao | Limite superior (para ranges) | RF-011: range de operacao |
| `pagina_origem` | int | Nao | Pagina do PDF fonte | RF-005: rastreabilidade da extracao. PortfolioPage: link para pagina do manual |
| `created_at` | datetime | Sim | Data de extracao | Interno: controle |

---

## 7. produtos_documentos

**Objetivo:** Armazenar arquivos PDF (manuais, fichas tecnicas, certificados) vinculados a um produto. O texto extraido alimenta a IA para extracao de specs e para responder perguntas.

**Requisitos:** RF-005 (Portfolio — upload de documentos), RF-036 (Analise de Edital via Upload — reutiliza logica de extracao)

**Uso na UI:** PortfolioPage (upload de PDF, indicador de processamento)

**Backend tools:** `tool_processar_upload` (criar + extrair texto), `tool_extrair_especificacoes` (ler texto extraido)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `produto_id` | varchar(36) FK → produtos.id CASCADE | Sim | Produto dono | RF-005: documento pertence ao produto. Ao excluir produto, documentos cascadeiam |
| `tipo` | enum('manual','ficha_tecnica','certificado_anvisa','certificado_outro') | Sim | Tipo do documento | RF-005: categorizar para busca. PortfolioPage: icone diferenciado por tipo |
| `nome_arquivo` | varchar(255) | Sim | Nome original do arquivo | PortfolioPage: exibido na lista de documentos |
| `path_arquivo` | varchar(500) | Sim | Caminho no disco | Backend: ler conteudo para processamento. Nao exposto na UI |
| `texto_extraido` | longtext | Nao | Texto OCR/PDF extraido | RF-005: base para IA extrair specs. RF-011: base para responder perguntas sobre o produto |
| `processado` | boolean | Sim | Se ja foi processado | PortfolioPage: badge verde (processado) ou amarelo (pendente). Backend: controle de reprocessamento |
| `created_at` | datetime | Sim | Data de upload | PortfolioPage: ordenacao |

---

## 8. fontes_editais

**Objetivo:** Cadastro de portais de licitacao (PNCP, ComprasNet, BEC-SP, etc.) com suas URLs e tipo de integracao (API ou scraper). Independente de usuario — compartilhada por todos.

**Requisitos:** RF-008 (Fontes de Editais), RF-010 (Captacao — buscar editais nas fontes)

**Uso na UI:** ParametrizacoesPage (lista de fontes, ativar/desativar). CaptacaoPage (selecao de fonte para busca)

**Backend tools:** `tool_cadastrar_fonte` (criar), `tool_listar_fontes` (listar), `tool_buscar_editais_fonte` (buscar via API), `tool_buscar_editais_scraper` (buscar via scraper)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID ou slug (ex: 'pncp') | RF-008: identificador da fonte. Referenciado por `editais.fonte` |
| `nome` | varchar(100) | Sim | Nome exibido (ex: "PNCP") | ParametrizacoesPage: nome na lista. CaptacaoPage: label no dropdown |
| `tipo` | enum('api','scraper') | Sim | Tipo de integracao | RF-008: determina qual funcao usar (API REST vs web scraping) |
| `url_base` | varchar(500) | Nao | URL base da API/site | RF-008: endpoint para chamadas. Ex: `https://pncp.gov.br/api/consulta/v1` |
| `api_key` | varchar(255) | Nao | Chave de API | RF-008: autenticacao com a fonte (se necessario) |
| `ativo` | boolean | Sim | Se esta habilitada | ParametrizacoesPage: toggle ativar/desativar. RF-010: fontes inativas ignoradas na busca |
| `descricao` | text | Nao | Descricao da fonte | ParametrizacoesPage: tooltip ou texto auxiliar |
| `created_at` | datetime | Sim | Cadastro | Interno |

---

## 9. editais

**Objetivo:** Tabela central do sistema — armazena editais de licitacao capturados de fontes publicas ou cadastrados manualmente. Contem todos os dados do edital: orgao, datas, status, PDFs e dados PNCP para integracao.

**Requisitos:** RF-010 (Captacao), RF-011 (Validacao), RF-012 (Impugnacao — prazo), RF-013 (Precificacao), RF-014 (Proposta), RF-015 (Submissao — status), RF-017 (Follow-up — resultado), RF-022 (Flags — prazos), RF-023 (Monitoria — novos editais), RF-027 (Dispensas), RF-031 (Pendencias PNCP), RF-036 (Analise via Upload), RF-037 (Estrategia), RF-039 (Alertas de Prazo)

**Uso na UI:** CaptacaoPage (busca e listagem), ValidacaoPage (analise detalhada), ImpugnacaoPage (prazo de impugnacao), PropostaPage (edital da proposta), SubmissaoPage (status de submissao), FollowupPage (resultado), FlagsPage (prazos proximos), MonitoriaPage (novos editais encontrados)

**Backend tools:** `tool_buscar_editais_fonte`, `tool_buscar_editais_scraper`, `tool_salvar_editais_selecionados`, `tool_listar_editais`, `tool_atualizar_edital`, `tool_excluir_edital`, `tool_extrair_requisitos`, `tool_resumir_edital`, `tool_perguntar_edital`, `tool_calcular_aderencia`, `tool_gerar_proposta`, `tool_registrar_resultado`, `tool_dashboard_prazos`, `tool_calendario_editais`, `tool_extrair_datas_edital`

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID do edital | FK para requisitos, documentos, itens, analises, propostas, alertas, contratos, recursos, leads, dispensas, estrategias |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `numero` | varchar(100) | Sim | Numero do edital (ex: "PE-001/2026") | CaptacaoPage: coluna principal. Todos os intents de chat usam este numero para identificar o edital |
| `orgao` | varchar(255) | Sim | Orgao licitante | CaptacaoPage: coluna. RF-019 (CRM): alimenta leads por orgao |
| `orgao_tipo` | enum(5 valores) | Sim | Esfera (federal, estadual...) | RF-010: filtro de busca por esfera governamental |
| `uf` | varchar(2) | Nao | Estado | RF-010: filtro por UF. RF-023: monitoramento por UF. MercadoPage: analise geografica (RF-025) |
| `cidade` | varchar(100) | Nao | Cidade | RF-010: filtro por cidade. ValidacaoPage: informacao de logistica |
| `objeto` | text | Sim | Descricao do objeto da licitacao | RF-010: matching com portfolio. RF-011: analise do agente. CaptacaoPage: coluna principal |
| `modalidade` | enum(7 valores) | Sim | Tipo de licitacao | RF-010: filtro. RF-027: dispensas filtradas por modalidade='dispensa'. CaptacaoPage: badge |
| `categoria` | enum(11 valores) | Nao | Tipo comercial (comodato, venda...) | RF-010: classificacao automatica. CaptacaoPage: coluna. RF-013: precificacao varia por categoria |
| `valor_referencia` | decimal(15,2) | Nao | Valor estimado pelo orgao | RF-010: filtro por faixa de valor. RF-013: base para precificacao. CaptacaoPage: coluna |
| `data_publicacao` | date | Nao | Data de publicacao | RF-010: filtro por periodo. CaptacaoPage: coluna |
| `data_abertura` | datetime | Nao | Data/hora de abertura | RF-016: sessao de lances. RF-022: sinalizador de prazo. RF-039: alerta de abertura. FlagsPage/LancesPage |
| `data_limite_proposta` | datetime | Nao | Prazo para envio de proposta | RF-015: deadline de submissao. RF-039: alerta de proposta. SubmissaoPage: countdown |
| `data_limite_impugnacao` | datetime | Nao | Prazo para impugnacao | RF-012: deadline para impugnar. RF-039: alerta de impugnacao. ImpugnacaoPage: countdown |
| `data_recursos` | datetime | Nao | Prazo para recurso | RF-018: deadline para recurso. RF-039: alerta de recursos |
| `data_homologacao_prevista` | date | Nao | Previsao de homologacao | RF-017: estimativa de resultado. FollowupPage: timeline |
| `horario_abertura` | varchar(5) | Nao | Hora (HH:MM) | RF-016: hora da sessao de lances. LancesPage: exibir horario |
| `fuso_horario` | varchar(50) | Nao | Fuso horario | RF-016: converter hora para local do usuario |
| `status` | enum(14 valores) | Sim | Status no pipeline | RF-015: workflow (novo→analisando→participando→proposta_enviada→em_pregao→vencedor/perdedor). CaptacaoPage: badge colorido. Dashboard: contadores por status |
| `fonte` | varchar(50) | Nao | Nome da fonte de captura | RF-008: rastreabilidade da origem. CaptacaoPage: badge de fonte |
| `url` | varchar(500) | Nao | URL do edital no portal | CaptacaoPage: link para abrir no portal. SubmissaoPage: link para submeter |
| `numero_pncp` | varchar(100) | Nao | ID no PNCP | RF-010: para buscar itens e documentos via API PNCP. Backend: `tool_buscar_itens_edital_pncp` |
| `cnpj_orgao` | varchar(20) | Nao | CNPJ do orgao | RF-010: compor URL da API PNCP. RF-019: vincular ao CRM de orgaos |
| `ano_compra` | int | Nao | Ano da compra (PNCP) | RF-010: compor URL da API PNCP |
| `seq_compra` | int | Nao | Sequencial (PNCP) | RF-010: compor URL da API PNCP |
| `srp` | boolean | Nao | Sistema de Registro de Precos | RF-010: filtro. Editais SRP permitem adesao posterior |
| `situacao_pncp` | varchar(100) | Nao | Status no PNCP (Divulgada, Suspensa...) | RF-031: verificar pendencias. CaptacaoPage: badge |
| `pdf_url` | varchar(500) | Nao | URL para download do PDF | RF-036: baixar e processar PDF. CaptacaoPage: botao download |
| `pdf_titulo` | varchar(255) | Nao | Titulo do PDF | CaptacaoPage: nome do arquivo PDF |
| `pdf_path` | varchar(500) | Nao | Caminho local do PDF baixado | Backend: ler PDF para extracao. Nao exposto na UI |
| `dados_completos` | boolean | Nao | Se tem todos os dados PNCP | RF-031: sinalizar editais incompletos. Backend: flag de controle |
| `fonte_tipo` | varchar(20) | Nao | 'api' ou 'scraper' | RF-008: como foi capturado. Interno |
| `created_at` | datetime | Sim | Cadastro | CaptacaoPage: ordenacao |
| `updated_at` | datetime | Sim | Ultima alteracao | Interno: controle de atualizacao |

---

## 10. editais_requisitos

**Objetivo:** Requisitos extraidos do edital via IA — cada exigencia tecnica, documental ou comercial e parseada em campos estruturados que permitem comparacao automatica com as especificacoes do produto.

**Requisitos:** RF-011 (Validacao — analise tecnica), RF-014 (Proposta — tabela de conformidade), RF-036 (Analise via Upload — extracao automatica)

**Uso na UI:** ValidacaoPage (lista de requisitos com status atendido/parcial/nao atendido)

**Backend tools:** `tool_extrair_requisitos` (criar via IA), `tool_calcular_aderencia` (comparar com specs), `tool_gerar_proposta` (incluir na proposta)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por `analises_detalhes.requisito_id` — vincula o resultado da comparacao |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital dono | RF-011: requisitos pertencem ao edital. Ao excluir edital, requisitos cascadeiam |
| `tipo` | enum('tecnico','documental','comercial','legal') | Sim | Categoria do requisito | RF-011: agrupamento na analise. ValidacaoPage: tabs por tipo. RF-014: secoes da proposta |
| `descricao` | text | Sim | Texto completo do requisito | RF-011: exibido na analise. RF-014: incluido na proposta. ValidacaoPage: coluna principal |
| `nome_especificacao` | varchar(255) | Nao | Nome da spec exigida (ex: "Velocidade") | RF-011: matching automatico com `produtos_especificacoes.nome_especificacao` |
| `valor_exigido` | varchar(500) | Nao | Valor exigido (ex: ">=10.000 RPM") | RF-011: comparado com `produtos_especificacoes.valor`. ValidacaoPage: coluna "Exigido" |
| `operador` | varchar(10) | Nao | Operador de comparacao | RF-011: determina tipo de comparacao (>=, <=, =, range) |
| `valor_numerico` | decimal(15,6) | Nao | Valor numerico parseado | RF-011: comparacao matematica direta com `produtos_especificacoes.valor_numerico` |
| `obrigatorio` | boolean | Sim | Se e eliminatorio | RF-011: requisito obrigatorio nao atendido = nota 0 no score tecnico. ValidacaoPage: icone alerta |
| `pagina_origem` | int | Nao | Pagina no PDF do edital | RF-036: rastreabilidade. ValidacaoPage: link para pagina do PDF |
| `created_at` | datetime | Sim | Extracao | Interno |

---

## 11. editais_documentos

**Objetivo:** Arquivos PDF do edital (edital principal, termo de referencia, anexos). O texto extraido alimenta a IA para responder perguntas e extrair requisitos.

**Requisitos:** RF-036 (Analise de Edital via Upload), RF-011 (Validacao — texto base para analise)

**Uso na UI:** ValidacaoPage (lista de documentos do edital, indicador de processamento)

**Backend tools:** `tool_processar_upload` (upload de PDF de edital), `tool_resumir_edital` (usar texto extraido), `tool_perguntar_edital` (responder perguntas sobre o edital)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital dono | RF-036: documento pertence ao edital |
| `tipo` | enum('edital_principal','termo_referencia','anexo','planilha','outro') | Sim | Tipo de documento | RF-036: categorizar. ValidacaoPage: icone por tipo |
| `nome_arquivo` | varchar(255) | Sim | Nome original | ValidacaoPage: exibido na lista |
| `path_arquivo` | varchar(500) | Sim | Caminho no disco | Backend: ler para processamento |
| `texto_extraido` | longtext | Nao | Texto completo extraido | RF-036: base para IA. RF-011: analise de requisitos |
| `processado` | boolean | Sim | Se foi processado | ValidacaoPage: badge de status |
| `created_at` | datetime | Sim | Upload | Interno |

---

## 12. editais_itens

**Objetivo:** Itens ou lotes do edital, obtidos da API PNCP. Cada item tem descricao, quantidade, valor estimado e beneficios (ME/EPP, cota reservada).

**Requisitos:** RF-010 (Captacao — itens do edital), RF-011 (Validacao — analise por item), RF-038 (Itens Intrusos — deteccao de itens fora do segmento)

**Uso na UI:** ValidacaoPage (tabela de itens do edital)

**Backend tools:** `tool_buscar_itens_edital_pncp` (buscar e salvar itens via API PNCP)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital dono | RF-010: itens pertencem ao edital |
| `numero_item` | int | Nao | Numero sequencial (1, 2, 3...) | ValidacaoPage: coluna "Item". RF-038: referencia na deteccao de itens intrusos |
| `descricao` | text | Nao | Descricao do item | RF-010: matching com portfolio. RF-038: IA analisa para detectar intrusos. ValidacaoPage: coluna |
| `unidade_medida` | varchar(50) | Nao | UN, CX, KIT, etc. | ValidacaoPage: coluna. RF-014: incluido na proposta |
| `quantidade` | decimal(15,4) | Nao | Quantidade estimada | RF-013: calcular preco total. ValidacaoPage: coluna |
| `valor_unitario_estimado` | decimal(15,2) | Nao | Preco unitario estimado | RF-013: referencia de preco. ValidacaoPage: coluna |
| `valor_total_estimado` | decimal(15,2) | Nao | Valor total (qtd x unitario) | RF-010: valor do edital. ValidacaoPage: coluna |
| `codigo_item` | varchar(100) | Nao | Codigo no catalogo PNCP | RF-010: referencia PNCP. Interno |
| `tipo_beneficio` | varchar(100) | Nao | ME/EPP, cota reservada, etc. | RF-010: identificar vantagens competitivas. ValidacaoPage: badge |
| `created_at` | datetime | Sim | Importacao | Interno |

---

## 13. analises

**Objetivo:** Resultado da analise de aderencia entre um produto e um edital. Contem os 4 scores calculados pela IA, contadores de requisitos e preco sugerido. E o "veredicto" do agente sobre a viabilidade de participar.

**Requisitos:** RF-011 (Validacao — scores), RF-009 (Parametros de Score — pesos usados no calculo), RF-010 (Captacao — score para classificar edital), RF-013 (Precificacao — preco sugerido), RF-037 (Estrategia — base para decisao go/nogo)

**Uso na UI:** ValidacaoPage (scores e recomendacao), CaptacaoPage (badge de aderencia)

**Backend tools:** `tool_calcular_aderencia` (criar analise), `tool_gerar_proposta` (ler scores para incluir na proposta), `tool_salvar_editais_selecionados` (criar analise automatica)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por `analises_detalhes` e `propostas` |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital analisado | RF-011: vincular analise ao edital |
| `produto_id` | varchar(36) FK → produtos.id CASCADE | Sim | Produto comparado | RF-011: vincular analise ao produto |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `score_tecnico` | decimal(5,2) | Nao | Score tecnico (0-100) | RF-011: % de requisitos tecnicos atendidos. ValidacaoPage: gauge. RF-009: peso configuravel |
| `score_comercial` | decimal(5,2) | Nao | Score comercial (0-100) | RF-011: viabilidade comercial. RF-009: peso configuravel |
| `score_potencial` | decimal(5,2) | Nao | Score de potencial (0-100) | RF-011: potencial de vitoria. RF-009: peso configuravel |
| `score_final` | decimal(5,2) | Nao | Score ponderado final (0-100) | RF-010: badge verde/amarelo/vermelho (>=80/50-79/<50). RF-037: base para go/nogo. CaptacaoPage: coluna principal |
| `requisitos_total` | int | Sim | Total de requisitos analisados | ValidacaoPage: "23 requisitos encontrados" |
| `requisitos_atendidos` | int | Sim | Requisitos atendidos | ValidacaoPage: barra de progresso verde |
| `requisitos_parciais` | int | Sim | Requisitos parcialmente atendidos | ValidacaoPage: barra amarela |
| `requisitos_nao_atendidos` | int | Sim | Requisitos nao atendidos | ValidacaoPage: barra vermelha. RF-011: risco tecnico |
| `preco_sugerido_min` | decimal(15,2) | Nao | Preco sugerido minimo | RF-013: faixa de preco. PrecificacaoPage: valor inferior |
| `preco_sugerido_max` | decimal(15,2) | Nao | Preco sugerido maximo | RF-013: faixa de preco. PrecificacaoPage: valor superior |
| `preco_sugerido` | decimal(15,2) | Nao | Preco sugerido otimo | RF-013: recomendacao principal. PrecificacaoPage: valor destacado |
| `recomendacao` | text | Nao | Texto de recomendacao da IA | RF-011: parecer descritivo. ValidacaoPage: bloco de texto. RF-037: base textual para decisao |
| `created_at` | datetime | Sim | Data da analise | ValidacaoPage: "Analisado em..." |

---

## 14. analises_detalhes

**Objetivo:** Detalhamento requisito-a-requisito da analise: para cada exigencia do edital, qual a spec do produto que atende (ou nao), com status e justificativa. Permite rastreabilidade total da decisao do agente.

**Requisitos:** RF-011 (Validacao — tabela de conformidade), RF-014 (Proposta — tabela de atendimento)

**Uso na UI:** ValidacaoPage (tabela expandivel de requisitos com semaforo)

**Backend tools:** `tool_calcular_aderencia` (criar detalhes), `tool_gerar_proposta` (montar tabela de conformidade)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `analise_id` | varchar(36) FK → analises.id CASCADE | Sim | Analise pai | RF-011: detalhe pertence a analise. Cascadeia ao excluir analise |
| `requisito_id` | varchar(36) FK → editais_requisitos.id CASCADE | Sim | Requisito do edital | RF-011: qual exigencia esta sendo avaliada. ValidacaoPage: link para o requisito |
| `especificacao_id` | varchar(36) FK → produtos_especificacoes.id SET NULL | Nao | Spec do produto que atende | RF-011: qual spec do produto corresponde. Se null, nenhuma spec encontrada |
| `status` | enum('atendido','parcial','nao_atendido','nao_aplicavel') | Sim | Resultado da comparacao | RF-011: semaforo verde/amarelo/vermelho/cinza. ValidacaoPage: icone por status |
| `valor_exigido` | varchar(500) | Nao | O que o edital exige | ValidacaoPage: coluna "Exigido" |
| `valor_produto` | varchar(500) | Nao | O que o produto oferece | ValidacaoPage: coluna "Produto" |
| `justificativa` | text | Nao | Explicacao da IA | RF-011: porque atendeu ou nao. ValidacaoPage: tooltip. RF-014: incluida na proposta |
| `created_at` | datetime | Sim | Avaliacao | Interno |

---

## 15. propostas

**Objetivo:** Proposta tecnica gerada pelo agente IA para um edital. Contem texto tecnico completo (8 secoes), precos e workflow de aprovacao.

**Requisitos:** RF-014 (Geracao de Proposta Tecnica), RF-015 (Submissao — status da proposta), RF-020 (Contrato — proposta vencedora vinculada)

**Uso na UI:** PropostaPage (lista de propostas, visualizar/editar texto), SubmissaoPage (workflow de envio)

**Backend tools:** `tool_gerar_proposta` (criar proposta completa via LLM)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por `contratos.proposta_id` |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital alvo | RF-014: proposta e para este edital. PropostaPage: link para o edital |
| `produto_id` | varchar(36) FK → produtos.id CASCADE | Sim | Produto ofertado | RF-014: produto base da proposta |
| `analise_id` | varchar(36) FK → analises.id SET NULL | Nao | Analise que gerou a proposta | RF-014: scores e detalhes usados na geracao. Null se gerada sem analise previa |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `texto_tecnico` | text | Nao | Texto completo da proposta (markdown) | RF-014: conteudo principal gerado pela IA (8 secoes). PropostaPage: visualizador markdown |
| `preco_unitario` | decimal(15,2) | Nao | Preco unitario proposto | RF-014: preco ofertado. RF-013: pode vir de recomendacao. PropostaPage: campo editavel |
| `preco_total` | decimal(15,2) | Nao | Preco total (qtd x unitario) | RF-014: valor total. PropostaPage: calculado automaticamente |
| `quantidade` | int | Sim | Quantidade ofertada | RF-014: itens ofertados. PropostaPage: campo editavel |
| `status` | enum('rascunho','revisao','aprovada','enviada') | Sim | Etapa no workflow | RF-015: workflow de submissao. PropostaPage/SubmissaoPage: badge de status |
| `arquivo_path` | varchar(500) | Nao | Caminho do PDF gerado | RF-014: exportacao para PDF/DOCX (futuro). Nao implementado ainda |
| `created_at` | datetime | Sim | Geracao | PropostaPage: data de criacao |
| `updated_at` | datetime | Sim | Ultima edicao | PropostaPage: indicar se foi editada |

---

## 16. concorrentes

**Objetivo:** Cadastro de empresas concorrentes identificadas em atas de pregao ou manualmente. Armazena estatisticas de participacao e vitorias para inteligencia competitiva.

**Requisitos:** RF-024 (Concorrencia — inteligencia competitiva), RF-035 (Atas de Pregao — extracao automatica de participantes)

**Uso na UI:** ConcorrenciaPage (lista de concorrentes, analise detalhada)

**Backend tools:** `tool_listar_concorrentes` (listar), `tool_analisar_concorrente` (analise detalhada), `tool_registrar_resultado` (criar/atualizar ao registrar resultado), `tool_extrair_ata_pdf` (criar automaticamente de atas)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por precos_historicos e participacoes_editais |
| `nome` | varchar(255) | Sim | Nome da empresa | ConcorrenciaPage: coluna principal. RF-024: identificacao |
| `cnpj` | varchar(20) UNIQUE | Nao | CNPJ | RF-024: identificacao unica. ConcorrenciaPage: coluna |
| `razao_social` | varchar(255) | Nao | Razao social completa | RF-024: dado formal |
| `segmentos` | json | Nao | Areas de atuacao (array) | RF-024: classificar por segmento. ConcorrenciaPage: tags |
| `editais_participados` | int | Sim | Total de participacoes | RF-024: estatistica. ConcorrenciaPage: coluna |
| `editais_ganhos` | int | Sim | Total de vitorias | RF-024: estatistica. ConcorrenciaPage: coluna |
| `preco_medio` | decimal(15,2) | Nao | Preco medio praticado | RF-024: analise de precificacao do concorrente. RF-013: referencia de preco |
| `taxa_vitoria` | decimal(5,2) | Nao | % de vitoria (ganhos/participados) | RF-024: indicador de forca. ConcorrenciaPage: gauge |
| `observacoes` | text | Nao | Notas sobre o concorrente | RF-024: inteligencia qualitativa |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

**Nota:** Esta tabela NAO tem `user_id` — concorrentes sao compartilhados entre usuarios. Isso e um gap de multi-tenancy identificado.

---

## 17. precos_historicos

**Objetivo:** Registro de precos e resultados de editais finalizados — vitorias, derrotas, cancelamentos. Base para recomendacao de precos e analise de competitividade.

**Requisitos:** RF-013 (Precificacao — historico de precos), RF-017 (Follow-up — registrar resultado), RF-024 (Concorrencia — precos de concorrentes), RF-026 (Perdas — analise de motivos de perda)

**Uso na UI:** PrecificacaoPage (historico de precos), FollowupPage (registrar resultado), PerdasPage (analise de perdas), ConcorrenciaPage (precos de concorrentes)

**Backend tools:** `tool_registrar_resultado` (criar), `tool_extrair_ata_pdf` (criar automaticamente de atas), `tool_historico_precos` (consultar)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `edital_id` | varchar(36) FK → editais.id SET NULL | Nao | Edital de origem | RF-017: rastrear resultado por edital. SET NULL: historico sobrevive a exclusao do edital |
| `produto_id` | varchar(36) FK → produtos.id SET NULL | Nao | Produto participante | RF-013: historico de preco por produto |
| `user_id` | varchar(36) FK → users.id CASCADE | Nao | Dono do registro | RF-033: multi-tenancy |
| `preco_referencia` | decimal(15,2) | Nao | Preco estimado pelo orgao | RF-013: referencia oficial. PrecificacaoPage: coluna |
| `preco_vencedor` | decimal(15,2) | Nao | Preco que venceu | RF-013: benchmark de mercado. RF-024: preco do concorrente vencedor |
| `nosso_preco` | decimal(15,2) | Nao | Preco que ofertamos | RF-013: comparacao. RF-026: analise de preco vs vencedor |
| `desconto_percentual` | decimal(5,2) | Nao | % de desconto sobre referencia | RF-013: tendencia de desconto no mercado |
| `concorrente_id` | varchar(36) FK → concorrentes.id SET NULL | Nao | Empresa vencedora (se registrada) | RF-024: vincular resultado ao concorrente |
| `empresa_vencedora` | varchar(255) | Nao | Nome do vencedor (texto livre) | RF-017: registro mesmo sem concorrente cadastrado. FollowupPage: coluna |
| `cnpj_vencedor` | varchar(20) | Nao | CNPJ do vencedor | RF-024: matching com concorrente por CNPJ |
| `resultado` | enum('vitoria','derrota','cancelado','deserto','revogado') | Nao | Resultado da participacao | RF-017: classificar resultado. RF-026: filtrar perdas. FollowupPage: badge |
| `motivo_perda` | enum('preco','tecnica','documentacao','prazo','outro') | Nao | Razao da derrota (se derrota) | RF-026: analise de motivos de perda. PerdasPage: grafico por motivo |
| `data_homologacao` | date | Nao | Data de homologacao oficial | RF-017: marco temporal do resultado |
| `data_registro` | datetime | Sim | Quando foi registrado no sistema | Interno: ordenacao |
| `fonte` | enum('manual','pncp','ata_pdf','painel_precos') | Nao | Como o dado foi obtido | RF-035: rastreabilidade da fonte |

---

## 18. participacoes_editais

**Objetivo:** Registrar quais empresas participaram de cada edital — preco proposto, posicao final, desclassificacao. Dados extraidos de atas de pregao ou registrados manualmente.

**Requisitos:** RF-024 (Concorrencia — participacoes por concorrente), RF-035 (Atas de Pregao — extracao automatica)

**Uso na UI:** ConcorrenciaPage (historico de participacoes do concorrente)

**Backend tools:** `tool_registrar_resultado` (criar), `tool_extrair_ata_pdf` (criar de atas), `tool_analisar_concorrente` (consultar)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador interno |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital participado | RF-024: vincular participacao ao edital |
| `concorrente_id` | varchar(36) FK → concorrentes.id SET NULL | Nao | Empresa participante | RF-024: vincular ao concorrente. SET NULL se concorrente for excluido |
| `preco_proposto` | decimal(15,2) | Nao | Preco ofertado | RF-024: analise de precos do concorrente. RF-013: referencia de mercado |
| `posicao_final` | int | Nao | Classificacao (1=vencedor) | RF-024: ranking. ConcorrenciaPage: coluna |
| `desclassificado` | boolean | Sim | Se foi desclassificado | RF-024: indicar fragilidades do concorrente |
| `motivo_desclassificacao` | text | Nao | Razao da desclassificacao | RF-024: analise qualitativa |
| `fonte` | enum('manual','pncp','ata_pdf') | Nao | Como foi registrado | RF-035: rastreabilidade |
| `created_at` | datetime | Sim | Registro | Interno |

---

## 19. alertas

**Objetivo:** Alertas agendados para prazos de editais — data de abertura, limite de proposta, impugnacao, recursos. Cada alerta tem data de disparo calculada, canais de envio e status.

**Requisitos:** RF-039 (Alertas de Prazo — configuracao e disparo), RF-022 (Flags — dashboard de alertas ativos)

**Uso na UI:** FlagsPage (lista de alertas proximos), Dashboard (contadores)

**Backend tools:** `tool_configurar_alertas` (criar multiplos alertas para um edital), `tool_listar_alertas` (listar ativos), `tool_cancelar_alerta` (cancelar), `tool_dashboard_prazos` (contar ativos)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por `notificacoes.alerta_id` |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital monitorado | RF-039: alerta e sobre este edital. FlagsPage: link para edital |
| `tipo` | enum('abertura','impugnacao','recursos','proposta','personalizado') | Sim | Tipo de prazo | RF-039: tipo do alerta. FlagsPage: icone por tipo |
| `data_disparo` | datetime | Sim | Quando disparar | RF-039: scheduler verifica este campo. FlagsPage: countdown |
| `tempo_antes_minutos` | int | Nao | Antecedencia em minutos (ex: 1440=24h) | RF-039: calculado a partir da preferencia do usuario. Ex: 3 dias antes = 4320 min |
| `status` | enum('agendado','disparado','lido','cancelado') | Sim | Estado atual | RF-039: controle de lifecycle. FlagsPage: badge |
| `canal_email` | boolean | Sim | Enviar por email | RF-039: canal de envio |
| `canal_push` | boolean | Sim | Enviar push notification | RF-039: canal de envio |
| `canal_sms` | boolean | Sim | Enviar SMS | RF-039: canal de envio (futuro) |
| `titulo` | varchar(255) | Nao | Titulo do alerta | RF-039: texto do alerta. FlagsPage: texto principal |
| `mensagem` | text | Nao | Mensagem detalhada | RF-039: corpo do alerta |
| `disparado_em` | datetime | Nao | Quando foi disparado | RF-039: registro de disparo |
| `lido_em` | datetime | Nao | Quando foi lido | RF-039: registro de leitura |
| `created_at` | datetime | Sim | Criacao | Interno |

---

## 20. monitoramentos

**Objetivo:** Configuracoes de busca automatica periodica — o usuario define termos de busca, UFs, faixa de valor e frequencia. Um scheduler executa as buscas e notifica quando encontra editais relevantes.

**Requisitos:** RF-023 (Monitoria Automatica), RF-010 (Captacao — busca automatica)

**Uso na UI:** MonitoriaPage (lista de monitoramentos ativos, criar/pausar/excluir)

**Backend tools:** `tool_configurar_monitoramento` (criar), `tool_listar_monitoramentos` (listar), `tool_desativar_monitoramento` (desativar)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por `notificacoes.monitoramento_id` |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `termo` | varchar(255) | Sim | Palavra-chave de busca | RF-023: termo para buscar no PNCP. MonitoriaPage: coluna principal |
| `fontes` | json | Nao | Array de fontes (ex: ["pncp","bec"]) | RF-023: em quais portais buscar. MonitoriaPage: badges |
| `ufs` | json | Nao | Array de UFs (ex: ["SP","MG"]) ou null=todas | RF-023: filtro geografico. MonitoriaPage: badges |
| `valor_minimo` | decimal(15,2) | Nao | Valor minimo do edital | RF-023: filtro. MonitoriaPage: campo |
| `valor_maximo` | decimal(15,2) | Nao | Valor maximo do edital | RF-023: filtro. MonitoriaPage: campo |
| `frequencia_horas` | int | Sim | Intervalo de busca em horas | RF-023: frequencia do scheduler. MonitoriaPage: dropdown (1h, 2h, 4h, 12h, 24h) |
| `ultimo_check` | datetime | Nao | Ultima vez que buscou | RF-023: controle do scheduler. MonitoriaPage: "Ultima busca: ha 2h" |
| `proximo_check` | datetime | Nao | Proxima busca agendada | RF-023: proximo disparo. MonitoriaPage: "Proxima busca: em 2h" |
| `notificar_email` | boolean | Sim | Notificar por email | RF-023: canal de notificacao |
| `notificar_push` | boolean | Sim | Notificar por push | RF-023: canal de notificacao |
| `score_minimo_alerta` | int | Sim | Score minimo para notificar | RF-023: so notifica se aderencia >= este valor. MonitoriaPage: slider |
| `ativo` | boolean | Sim | Se esta ativo | MonitoriaPage: toggle. RF-023: monitoramentos inativos ignorados |
| `editais_encontrados` | int | Sim | Total de editais ja encontrados | MonitoriaPage: contador. RF-023: estatistica |
| `ultima_execucao` | datetime | Nao | Ultima execucao efetiva | RF-023: rastreabilidade |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 21. notificacoes

**Objetivo:** Historico de todas as notificacoes enviadas ao usuario — seja por alerta de prazo, novo edital encontrado por monitoramento, alta aderencia ou resultado de licitacao. Registra quais canais foram usados e se foi lida.

**Requisitos:** RF-039 (Alertas — notificacao gerada pelo alerta), RF-023 (Monitoria — notificacao de novo edital), RF-022 (Flags — badge de nao lidas)

**Uso na UI:** FlagsPage (sino de notificacoes, lista de nao lidas)

**Backend tools:** `tool_historico_notificacoes` (listar), `tool_marcar_notificacao_lida` (marcar como lida)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Destinatario | RF-033: multi-tenancy |
| `tipo` | enum('alerta_prazo','novo_edital','alta_aderencia','resultado','sistema') | Sim | Tipo da notificacao | FlagsPage: icone/cor por tipo |
| `edital_id` | varchar(36) FK → editais.id SET NULL | Nao | Edital relacionado | FlagsPage: link para edital. SET NULL: notificacao sobrevive a exclusao |
| `alerta_id` | varchar(36) FK → alertas.id SET NULL | Nao | Alerta que gerou | RF-039: rastreabilidade. SET NULL: notificacao sobrevive ao cancelamento |
| `monitoramento_id` | varchar(36) FK → monitoramentos.id SET NULL | Nao | Monitoramento que gerou | RF-023: rastreabilidade |
| `titulo` | varchar(255) | Sim | Titulo curto | FlagsPage: texto principal |
| `mensagem` | text | Sim | Mensagem completa | FlagsPage: corpo expandido |
| `dados` | json | Nao | Dados extras (scores, links) | FlagsPage: informacoes complementares |
| `enviado_email` | boolean | Sim | Se foi enviado por email | RF-039: controle de envio |
| `enviado_push` | boolean | Sim | Se foi enviado por push | RF-039: controle de envio |
| `enviado_sms` | boolean | Sim | Se foi enviado por SMS | RF-039: controle de envio |
| `lida` | boolean | Sim | Se foi lida | FlagsPage: badge de nao lidas. RF-022: contador |
| `lida_em` | datetime | Nao | Quando foi lida | RF-039: rastreabilidade |
| `created_at` | datetime | Sim | Envio | FlagsPage: ordenacao |

---

## 22. preferencias_notificacao

**Objetivo:** Configuracoes do usuario para notificacoes — quais canais estao habilitados, em que horarios, quais dias da semana, e antecedencias padrao para alertas. Relacao 1:1 com User.

**Requisitos:** RF-039 (Alertas — antecedencias padrao), RF-023 (Monitoria — canais habilitados)

**Uso na UI:** ParametrizacoesPage (secao de notificacoes)

**Backend tools:** `tool_configurar_preferencias_notificacao` (criar/atualizar), `tool_configurar_alertas` (ler antecedencias padrao)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE UNIQUE | Sim | Dono (1 por usuario) | RF-033: configuracao pessoal |
| `email_habilitado` | boolean | Sim | Habilitar email | RF-039: se false, nao envia email. ParametrizacoesPage: toggle |
| `push_habilitado` | boolean | Sim | Habilitar push | RF-039: se false, nao envia push. ParametrizacoesPage: toggle |
| `sms_habilitado` | boolean | Sim | Habilitar SMS | RF-039: se false, nao envia SMS. ParametrizacoesPage: toggle |
| `email_notificacao` | varchar(255) | Nao | Email alternativo para notificacoes | RF-039: se preenchido, notifica neste email ao inves do de login |
| `horario_inicio` | varchar(5) | Sim | Horario minimo (HH:MM) | RF-039: nao enviar fora do horario. Default 07:00 |
| `horario_fim` | varchar(5) | Sim | Horario maximo (HH:MM) | RF-039: nao enviar fora do horario. Default 22:00 |
| `dias_semana` | json | Sim | Dias habilitados (array) | RF-039: nao enviar no fim de semana. Default ["seg","ter","qua","qui","sex"] |
| `alertas_padrao` | json | Sim | Antecedencias padrao em minutos | RF-039: ao criar alertas, usar estas antecedencias. Default [4320,1440,60,15] = 3 dias, 24h, 1h, 15min |
| `score_minimo_notificacao` | int | Sim | Score minimo para notificar | RF-023: so notifica se aderencia >= este valor. Default 60 |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 23. documentos

**Objetivo:** Armazenar documentos gerados pelo sistema (propostas, relatorios, analises) com versionamento. Cada documento pode ter versoes posteriores vinculadas via `documento_pai_id`.

**Requisitos:** RF-040 (Documentos Gerados — versionamento)

**Uso na UI:** Acessivel via chat (agente gera e salva documentos durante a conversa)

**Backend tools:** Gerado internamente pelas tools de geracao (proposta, relatorio). Sem tool dedicada de CRUD ainda.

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Auto-referenciado por `documento_pai_id` |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `session_id` | varchar(36) FK → sessions.id SET NULL | Nao | Sessao de chat que gerou | RF-040: vincular documento a conversa de origem. SET NULL: documento sobrevive a exclusao da sessao |
| `tipo` | varchar(50) | Sim | Tipo livre (proposta, relatorio, analise...) | RF-040: categorizar documentos |
| `titulo` | varchar(255) | Sim | Titulo do documento | RF-040: identificacao. Futuro: listagem "Meus Documentos" |
| `conteudo_md` | text | Sim | Conteudo em Markdown | RF-040: texto principal renderizado |
| `dados_json` | json | Nao | Dados estruturados extras | RF-040: metadados do documento (scores, datas, etc.) |
| `versao` | int | Sim | Numero da versao | RF-040: versionamento (1, 2, 3...). Incrementado a cada revisao |
| `documento_pai_id` | varchar(36) FK → documentos.id SET NULL | Nao | Versao anterior (self-reference) | RF-040: cadeia de versoes. Ex: versao 2 aponta para versao 1 |
| `created_at` | datetime | Sim | Geracao | RF-040: data de cada versao |
| `updated_at` | datetime | Sim | Ultima edicao | Interno |

---

## 24. empresas

**Objetivo:** Dados cadastrais da empresa do usuario — CNPJ, razao social, endereco, porte, regime tributario e areas de atuacao. Base para gerar propostas com dados formais e verificar elegibilidade em editais (ex: porte ME/EPP para beneficio).

**Requisitos:** RF-001 (Cadastro da Empresa), RF-014 (Proposta — dados da empresa no cabecalho), RF-010 (Captacao — filtrar por porte/beneficio ME/EPP)

**Uso na UI:** EmpresaPage (formulario CRUD de dados da empresa) — atualmente mock, sera conectado ao backend

**Backend tools:** A implementar — CRUD via chat e REST

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por empresa_documentos, empresa_certidoes, empresa_responsaveis |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy. Cada usuario cadastra sua empresa |
| `cnpj` | varchar(20) UNIQUE | Sim | CNPJ da empresa | RF-001: identificacao formal. RF-014: incluido no cabecalho da proposta |
| `razao_social` | varchar(255) | Sim | Razao social completa | RF-001: nome legal. RF-014: cabecalho da proposta |
| `nome_fantasia` | varchar(255) | Nao | Nome fantasia | RF-001: nome comercial. EmpresaPage: campo |
| `inscricao_estadual` | varchar(20) | Nao | Inscricao estadual | RF-001: dado fiscal. RF-002: pode ser exigido em editais |
| `inscricao_municipal` | varchar(20) | Nao | Inscricao municipal | RF-001: dado fiscal |
| `regime_tributario` | enum('simples','lucro_presumido','lucro_real') | Nao | Regime tributario | RF-001: impacta precificacao. RF-013: margem tributaria varia por regime |
| `endereco` | text | Nao | Endereco completo | RF-001: localizacao. RF-014: incluido na proposta |
| `cidade` | varchar(100) | Nao | Cidade | RF-001: logistica. RF-010: proximidade com orgao licitante |
| `uf` | varchar(2) | Nao | Estado | RF-001: filtro. EmpresaPage: dropdown |
| `cep` | varchar(10) | Nao | CEP | RF-001: dado postal |
| `telefone` | varchar(20) | Nao | Telefone | RF-001: contato. RF-014: incluido na proposta |
| `email` | varchar(255) | Nao | Email institucional | RF-001: contato. RF-014: incluido na proposta |
| `porte` | enum('me','epp','medio','grande') | Nao | Porte da empresa | RF-001: elegibilidade ME/EPP. RF-010: filtrar editais com beneficio ME/EPP |
| `areas_atuacao` | json | Nao | Areas de atuacao (array) | RF-001: categorias de atuacao. RF-010: matching com editais |
| `ativo` | boolean | Sim | Se esta ativa | EmpresaPage: controle |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 25. empresa_documentos

**Objetivo:** Documentos habilitativos da empresa — contrato social, atestados de capacidade tecnica, balancos, alvaras, registros em conselhos, procuracoes. O texto extraido permite que a IA verifique automaticamente conformidade com exigencias de editais.

**Requisitos:** RF-002 (Documentos Habilitativos), RF-004 (Alertas IA — analise de documentos), RF-011 (Validacao — checklist documental)

**Uso na UI:** EmpresaPage (aba Documentos — upload, lista, vencimento) — atualmente mock

**Backend tools:** A implementar — upload de PDF + extracao de texto + validacao IA

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `empresa_id` | varchar(36) FK → empresas.id CASCADE | Sim | Empresa dona | RF-002: documento pertence a empresa |
| `tipo` | enum(7 valores) | Sim | Tipo do documento | RF-002: categorizar. RF-011: verificar se edital exige este tipo. EmpresaPage: filtro |
| `nome_arquivo` | varchar(255) | Sim | Nome original | EmpresaPage: exibido na lista |
| `path_arquivo` | varchar(500) | Sim | Caminho no disco | Backend: ler para processamento |
| `data_emissao` | date | Nao | Data de emissao | RF-002: controle de vigencia |
| `data_vencimento` | date | Nao | Data de vencimento | RF-004: alerta automatico quando proximo de vencer. EmpresaPage: badge vermelho se vencido |
| `texto_extraido` | longtext | Nao | Texto OCR/PDF extraido | RF-004: IA analisa conteudo. RF-011: verificar conformidade com edital |
| `processado` | boolean | Sim | Se foi processado | EmpresaPage: badge de status |
| `created_at` | datetime | Sim | Upload | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 26. empresa_certidoes

**Objetivo:** Certidoes negativas da empresa — CND federal/estadual/municipal, FGTS, trabalhista. Controle de validade e URL de consulta online. Alertas automaticos quando proximo de vencer.

**Requisitos:** RF-003 (Certidoes Automaticas), RF-004 (Alertas IA — vencimento), RF-011 (Validacao — checklist de certidoes exigidas)

**Uso na UI:** EmpresaPage (aba Certidoes — lista com semaforo de validade) — atualmente mock

**Backend tools:** A implementar — CRUD + scheduler de verificacao de vencimento + consulta automatica via API de orgaos

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `empresa_id` | varchar(36) FK → empresas.id CASCADE | Sim | Empresa dona | RF-003: certidao pertence a empresa |
| `tipo` | enum('cnd_federal','cnd_estadual','cnd_municipal','fgts','trabalhista','outro') | Sim | Tipo da certidao | RF-003: categorizar. RF-011: verificar se edital exige esta certidao |
| `orgao_emissor` | varchar(255) | Nao | Orgao que emitiu | RF-003: rastreabilidade |
| `numero` | varchar(100) | Nao | Numero da certidao | RF-003: referencia oficial |
| `data_emissao` | date | Nao | Data de emissao | RF-003: controle de vigencia |
| `data_vencimento` | date | Sim | Data de vencimento | RF-003: alerta automatico (30, 15, 7 dias antes). EmpresaPage: badge verde/amarelo/vermelho |
| `path_arquivo` | varchar(500) | Nao | PDF da certidao | RF-003: arquivo para anexar em propostas |
| `status` | enum('valida','vencida','pendente') | Sim | Status atual | RF-003: atualizado automaticamente por scheduler. EmpresaPage: badge |
| `url_consulta` | varchar(500) | Nao | URL para verificar autenticidade | RF-003: consulta automatica. EmpresaPage: link para verificar |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 27. empresa_responsaveis

**Objetivo:** Representantes legais, prepostos e responsaveis tecnicos da empresa. Necessarios para assinatura de propostas, pregoeiros e participacao em sessoes de licitacao.

**Requisitos:** RF-001 (Cadastro — responsaveis), RF-014 (Proposta — dados do responsavel na assinatura), RF-015 (Submissao — preposto para sessao de lances)

**Uso na UI:** EmpresaPage (aba Responsaveis — lista) — atualmente mock

**Backend tools:** A implementar — CRUD

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `empresa_id` | varchar(36) FK → empresas.id CASCADE | Sim | Empresa dona | RF-001: responsavel pertence a empresa |
| `nome` | varchar(255) | Sim | Nome completo | RF-014: nome na assinatura da proposta. EmpresaPage: coluna |
| `cargo` | varchar(100) | Nao | Cargo na empresa | RF-014: cargo na assinatura. EmpresaPage: coluna |
| `cpf` | varchar(14) | Nao | CPF (com mascara) | RF-001: identificacao. UNIQUE com empresa_id (nao global) |
| `email` | varchar(255) | Nao | Email do responsavel | RF-001: contato. RF-015: email para login no portal |
| `telefone` | varchar(20) | Nao | Telefone | RF-001: contato |
| `tipo` | enum('representante_legal','preposto','tecnico') | Nao | Funcao | RF-014: representante legal assina proposta. RF-015: preposto participa do pregao. RF-012: tecnico para impugnacao |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 28. contratos

**Objetivo:** Registrar contratos firmados apos vitoria em licitacao — vincula edital, proposta, orgao, valor, vigencia. Base para acompanhamento de execucao (entregas, prazos, NFs).

**Requisitos:** RF-020 (Execucao de Contrato), RF-021 (Contratado x Realizado)

**Uso na UI:** ProducaoPage (lista de contratos vigentes, timeline de execucao) — atualmente mock

**Backend tools:** A implementar — CRUD via chat e REST. Criacao automatica ao registrar vitoria (RF-017)

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por contrato_entregas |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id SET NULL | Nao | Edital de origem | RF-020: vincular contrato ao edital. SET NULL: contrato sobrevive a exclusao do edital |
| `proposta_id` | varchar(36) FK → propostas.id SET NULL | Nao | Proposta vencedora | RF-020: vincular a proposta que gerou o contrato |
| `numero_contrato` | varchar(100) | Nao | Numero oficial do contrato | RF-020: identificacao formal. ProducaoPage: coluna |
| `orgao` | varchar(255) | Nao | Orgao contratante | RF-020: identificar cliente. ProducaoPage: coluna |
| `objeto` | text | Nao | Objeto do contrato | RF-020: descricao do que foi contratado. ProducaoPage: detalhe |
| `valor_total` | decimal(15,2) | Nao | Valor total do contrato | RF-021: base para comparativo. ProducaoPage: coluna. ContratadoRealizadoPage: valor contratado |
| `data_assinatura` | date | Nao | Data de assinatura | RF-020: marco inicial. ProducaoPage: timeline |
| `data_inicio` | date | Nao | Inicio da vigencia | RF-020: quando comeca a obrigacao. ProducaoPage: timeline |
| `data_fim` | date | Nao | Fim da vigencia | RF-020: prazo final. RF-022: alerta de vencimento. ProducaoPage: countdown |
| `status` | enum('vigente','encerrado','rescindido','suspenso') | Sim | Status do contrato | ProducaoPage: badge. RF-021: filtrar apenas vigentes |
| `arquivo_path` | varchar(500) | Nao | PDF do contrato assinado | RF-020: arquivo de referencia |
| `observacoes` | text | Nao | Notas livres | RF-020: informacoes adicionais |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 29. contrato_entregas

**Objetivo:** Itens a serem entregues dentro de um contrato — cada entrega tem data prevista, data realizada, NF e status. Permite comparativo contratado x realizado e deteccao de atrasos.

**Requisitos:** RF-020 (Execucao — entregas), RF-021 (Contratado x Realizado — comparativo)

**Uso na UI:** ProducaoPage (lista de entregas por contrato), ContratadoRealizadoPage (tabela comparativa, grafico de atrasos) — atualmente mock

**Backend tools:** A implementar — CRUD + scheduler para detectar atrasos automaticamente

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `contrato_id` | varchar(36) FK → contratos.id CASCADE | Sim | Contrato dono | RF-020: entrega pertence ao contrato |
| `produto_id` | varchar(36) FK → produtos.id SET NULL | Nao | Produto entregue | RF-020: vincular ao portfolio. SET NULL: entrega sobrevive a exclusao do produto |
| `descricao` | text | Nao | Descricao do item | RF-020: o que e entregue. ProducaoPage: coluna |
| `quantidade` | decimal(15,4) | Nao | Quantidade | RF-021: qtd contratada. ContratadoRealizadoPage: coluna |
| `valor_unitario` | decimal(15,2) | Nao | Preco unitario | RF-021: valor contratado unitario |
| `valor_total` | decimal(15,2) | Nao | Valor total (qtd x unitario) | RF-021: valor contratado total. ContratadoRealizadoPage: coluna |
| `data_prevista` | date | Sim | Data prevista de entrega | RF-021: comparar com data_realizada. RF-022: alerta de atraso. ProducaoPage: timeline |
| `data_realizada` | date | Nao | Data efetiva de entrega | RF-021: comparar com data_prevista. Null = pendente. ContratadoRealizadoPage: coluna |
| `nota_fiscal` | varchar(100) | Nao | Numero da NF | RF-020: rastreamento fiscal |
| `numero_empenho` | varchar(100) | Nao | Numero do empenho | RF-020: rastreamento orcamentario do orgao |
| `status` | enum('pendente','entregue','atrasado','cancelado') | Sim | Status da entrega | RF-021: semaforo. ProducaoPage: badge. ContratadoRealizadoPage: filtro |
| `observacoes` | text | Nao | Notas | RF-020: detalhes |
| `created_at` | datetime | Sim | Cadastro | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 30. recursos

**Objetivo:** Recursos administrativos, contra-razoes e impugnacoes de editais. Inclui texto da minuta gerada pela IA, fundamentacao legal, prazo limite e resultado.

**Requisitos:** RF-012 (Impugnacao de Edital), RF-018 (Recurso/Contra-Razoes)

**Uso na UI:** ImpugnacaoPage (gerar e gerenciar impugnacoes e recursos) — atualmente mock

**Backend tools:** A implementar — geracao de minuta via LLM + CRUD

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital alvo | RF-012/RF-018: recurso e sobre este edital. ImpugnacaoPage: link |
| `tipo` | enum('recurso','contra_razao','impugnacao') | Sim | Tipo de peca | RF-012: impugnacao. RF-018: recurso ou contra-razao. ImpugnacaoPage: tab |
| `motivo` | text | Nao | Resumo do motivo | RF-012/RF-018: descricao do problema identificado |
| `texto_minuta` | longtext | Nao | Texto completo gerado pela IA | RF-012/RF-018: minuta juridica gerada pelo LLM com fundamentacao legal. ImpugnacaoPage: editor markdown |
| `fundamentacao_legal` | text | Nao | Artigos e leis citados | RF-032: suporte juridico com citacao de legislacao (Lei 14.133/2021, etc.) |
| `data_protocolo` | datetime | Nao | Quando foi protocolado | RF-012/RF-018: registro de envio. ImpugnacaoPage: campo |
| `prazo_limite` | datetime | Sim | Deadline para protocolar | RF-012: prazo de impugnacao (editais.data_limite_impugnacao). RF-018: prazo de recurso (editais.data_recursos). RF-039: alerta |
| `status` | enum('rascunho','protocolado','deferido','indeferido','pendente') | Sim | Status atual | ImpugnacaoPage: badge. RF-017: acompanhar resultado |
| `resultado` | text | Nao | Decisao do orgao | RF-018: texto da decisao do pregoeiro |
| `arquivo_path` | varchar(500) | Nao | PDF do recurso protocolado | RF-012/RF-018: arquivo enviado |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 31. leads_crm

**Objetivo:** Pipeline de CRM para gestao de relacionamento com orgaos publicos — cada lead representa um orgao com potencial de negocio. Permite acompanhar pipeline comercial: prospeccao → contato → proposta → negociacao → ganho/perdido.

**Requisitos:** RF-019 (CRM Ativo — relacionamento com orgaos)

**Uso na UI:** CRMPage (kanban de pipeline, detalhes de contato, historico de interacoes) — atualmente mock

**Backend tools:** A implementar — CRUD + criacao automatica de lead ao registrar vitoria/derrota com orgao novo

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Referenciado por acoes_pos_perda |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id SET NULL | Nao | Edital de origem do lead | RF-019: lead criado a partir de edital. SET NULL: lead sobrevive |
| `orgao` | varchar(255) | Sim | Nome do orgao publico | RF-019: identificacao. CRMPage: coluna principal do kanban |
| `cnpj_orgao` | varchar(20) | Nao | CNPJ do orgao | RF-019: vincular com editais do mesmo orgao |
| `contato_nome` | varchar(255) | Nao | Nome do contato no orgao | RF-019: gestor do relacionamento. CRMPage: ficha de contato |
| `contato_cargo` | varchar(100) | Nao | Cargo do contato | RF-019: contexto. CRMPage: ficha |
| `contato_telefone` | varchar(20) | Nao | Telefone do contato | RF-019: canal direto. CRMPage: click-to-call |
| `contato_email` | varchar(255) | Nao | Email do contato | RF-019: canal direto. CRMPage: click-to-email |
| `status_pipeline` | enum(7 valores) | Sim | Etapa no pipeline | RF-019: kanban (prospeccao→contato→proposta→negociacao→ganho/perdido/inativo). CRMPage: coluna do kanban |
| `origem` | varchar(100) | Nao | Como surgiu o lead | RF-019: rastreabilidade (ex: "PNCP", "indicacao", "evento") |
| `valor_potencial` | decimal(15,2) | Nao | Valor estimado de negocios | RF-019: priorizacao de leads. CRMPage: coluna |
| `proxima_acao` | text | Nao | Proxima acao planejada | RF-019: gestao de follow-up. CRMPage: destaque |
| `data_proxima_acao` | date | Nao | Data da proxima acao | RF-019: alerta de follow-up. RF-022: flag de acao pendente |
| `ultima_interacao` | datetime | Nao | Ultima interacao registrada | RF-019: controle de atividade. CRMPage: "Ultima interacao: ha 15 dias" |
| `observacoes` | text | Nao | Notas livres | RF-019: historico qualitativo |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 32. acoes_pos_perda

**Objetivo:** Plano de acoes para reconquista apos perda em licitacao — reprocessar oferta, visita tecnica, nova proposta, recurso ou acompanhamento. Vincula ao lead CRM e ao edital perdido.

**Requisitos:** RF-019 (CRM — acoes pos-perda), RF-026 (Perdas — plano de recuperacao)

**Uso na UI:** CRMPage (aba acoes no detalhe do lead), PerdasPage (acoes planejadas por edital perdido) — atualmente mock

**Backend tools:** A implementar — CRUD + sugestao automatica de acoes pela IA ao registrar derrota

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id SET NULL | Nao | Edital perdido | RF-026: vincular acao ao edital. SET NULL: acao sobrevive |
| `lead_crm_id` | varchar(36) FK → leads_crm.id SET NULL | Nao | Lead CRM associado | RF-019: vincular ao relacionamento com o orgao |
| `tipo_acao` | enum(5 valores) | Nao | Tipo de acao planejada | RF-026: categorizar estrategia. CRMPage: icone. PerdasPage: filtro |
| `descricao` | text | Nao | Detalhamento da acao | RF-026: o que fazer. CRMPage/PerdasPage: texto |
| `responsavel` | varchar(255) | Nao | Quem vai executar | RF-019: atribuicao. CRMPage: coluna |
| `data_prevista` | date | Nao | Prazo para executar | RF-019: controle de prazo. RF-022: flag se atrasado |
| `data_realizada` | date | Nao | Quando foi executada | RF-026: controle de execucao. Null = pendente |
| `resultado` | text | Nao | Resultado da acao | RF-026: feedback. CRMPage: historico |
| `status` | enum('pendente','em_andamento','concluida','cancelada') | Sim | Status da acao | CRMPage/PerdasPage: badge. RF-022: pendentes no dashboard |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 33. auditoria_log

**Objetivo:** Registro imutavel de todas as acoes realizadas no sistema — criacao, edicao, exclusao de qualquer entidade. Armazena estado anterior e posterior (dados_antes/dados_depois) para rastreabilidade completa. O registro sobrevive a exclusao do usuario (ondelete SET NULL).

**Requisitos:** RF-030 (Governanca e Auditoria)

**Uso na UI:** A implementar — pagina de auditoria com filtros por usuario, entidade, acao e periodo

**Backend tools:** A implementar — middleware que intercepta todas as operacoes de escrita e grava log automaticamente

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id SET NULL | Nao | Quem fez | RF-030: rastreabilidade. SET NULL: log sobrevive a exclusao do usuario |
| `session_id` | varchar(36) FK → sessions.id SET NULL | Nao | Sessao de chat onde ocorreu | RF-030: vincular acao a conversa. SET NULL: log sobrevive |
| `user_email` | varchar(255) | Nao | Email do usuario (redundante) | RF-030: manter referencia mesmo apos exclusao do usuario |
| `acao` | varchar(50) | Sim | Acao executada (criar, editar, excluir, login...) | RF-030: tipo de operacao. Auditoria: filtro |
| `entidade` | varchar(50) | Sim | Tipo da entidade (edital, produto, proposta...) | RF-030: sobre o que agiu. Auditoria: filtro |
| `entidade_id` | varchar(36) | Nao | UUID da entidade afetada | RF-030: qual registro. Auditoria: link para detalhe |
| `dados_antes` | json | Nao | Estado anterior (snapshot JSON) | RF-030: diff — o que era antes da alteracao |
| `dados_depois` | json | Nao | Estado posterior (snapshot JSON) | RF-030: diff — o que ficou depois da alteracao |
| `ip_address` | varchar(50) | Nao | IP do cliente | RF-030: rastreabilidade de acesso |
| `user_agent` | varchar(500) | Nao | Navegador/dispositivo | RF-030: rastreabilidade de dispositivo |
| `created_at` | datetime | Sim | Quando ocorreu | RF-030: timestamp da acao. Auditoria: filtro por periodo |

---

## 34. aprendizado_feedback

**Objetivo:** Registrar eventos de aprendizado para que o sistema melhore suas recomendacoes ao longo do tempo — quando um resultado real (vitoria/derrota) difere da previsao, o delta e registrado para ajustar futuros scores e precos.

**Requisitos:** RF-029 (Aprendizado Continuo)

**Uso na UI:** A implementar — dashboard de evolucao dos scores (grafico de melhoria ao longo do tempo)

**Backend tools:** A implementar — captura automatica ao registrar resultado + pipeline de reajuste de pesos

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `tipo_evento` | enum(4 valores) | Sim | Tipo de feedback | RF-029: categorizar (resultado_edital, score_ajustado, preco_ajustado, feedback_usuario) |
| `entidade` | varchar(50) | Nao | Tipo da entidade (analise, preco, edital...) | RF-029: sobre o que o feedback se refere |
| `entidade_id` | varchar(36) | Nao | UUID da entidade | RF-029: vincular ao registro especifico |
| `dados_entrada` | json | Nao | O que o sistema previa/recomendou | RF-029: snapshot da previsao (ex: score=85, preco_sugerido=50000) |
| `resultado_real` | json | Nao | O que realmente aconteceu | RF-029: resultado efetivo (ex: derrota, preco_vencedor=42000) |
| `delta` | json | Nao | Diferenca calculada | RF-029: delta para ajuste (ex: score_erro=-15, preco_erro=+8000) |
| `aplicado` | boolean | Sim | Se ja foi usado para reajuste | RF-029: controle de pipeline. False = pendente de aplicacao |
| `created_at` | datetime | Sim | Registro | RF-029: timeline de aprendizado |

---

## 35. parametros_score

**Objetivo:** Pesos e limiares configuraveis por usuario para calculo de scores de aderencia. Define quanto cada dimensao (tecnico, comercial, participacao, historico de ganho) pesa no score final, e quais sao os limiares para decisao go/nogo.

**Requisitos:** RF-009 (Parametros Comerciais/Scores), RF-037 (Estrategia — limiares go/nogo)

**Uso na UI:** ParametrizacoesPage (secao de pesos e limiares — sliders) — atualmente mock

**Backend tools:** A implementar — CRUD + `tool_calcular_aderencia` deve ler estes pesos ao inves de usar valores hardcoded

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE UNIQUE | Sim | Dono (1 por usuario) | RF-033: cada usuario configura seus proprios pesos |
| `peso_tecnico` | decimal(5,2) | Sim | Peso do score tecnico (default 0.40) | RF-009: quanto a aderencia tecnica pesa no score final. ParametrizacoesPage: slider |
| `peso_comercial` | decimal(5,2) | Sim | Peso do score comercial (default 0.25) | RF-009: quanto a viabilidade comercial pesa |
| `peso_participacao` | decimal(5,2) | Sim | Peso do historico de participacao (default 0.20) | RF-009: quanto o historico com o orgao pesa |
| `peso_ganho` | decimal(5,2) | Sim | Peso do historico de vitoria (default 0.15) | RF-009: quanto a taxa de vitoria pesa |
| `limiar_go` | decimal(5,2) | Sim | Score minimo para GO (default 70) | RF-037: score_final >= 70 → recomendacao GO. ParametrizacoesPage: slider |
| `limiar_nogo` | decimal(5,2) | Sim | Score maximo para NO-GO (default 40) | RF-037: score_final <= 40 → recomendacao NO-GO. ParametrizacoesPage: slider |
| `margem_minima` | decimal(5,2) | Nao | Margem de lucro minima aceitavel | RF-013: rejeitar precos abaixo desta margem. ParametrizacoesPage: campo |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 36. dispensas

**Objetivo:** Dispensas de licitacao (Art. 75 da Lei 14.133/2021) — processos simplificados de contratacao direta. Armazena cotacoes, fornecedores consultados e workflow especifico (mais rapido que pregao).

**Requisitos:** RF-027 (Dispensas de Licitacao)

**Uso na UI:** A implementar — integracao com CaptacaoPage (filtro por modalidade='dispensa') + pagina dedicada de dispensas

**Backend tools:** A implementar — busca de dispensas no PNCP + geracao de cotacoes + CRUD

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital de dispensa | RF-027: vincula ao edital com modalidade='dispensa' |
| `artigo` | varchar(50) | Nao | Artigo legal (ex: "Art. 75, II") | RF-027: fundamentacao legal da dispensa |
| `valor_limite` | decimal(15,2) | Nao | Valor limite legal para dispensa | RF-027: verificar se valor esta dentro do permitido |
| `justificativa` | text | Nao | Justificativa para contratacao direta | RF-027: texto exigido pelo orgao |
| `cotacao_texto` | longtext | Nao | Texto da cotacao gerada pela IA | RF-027: minuta de cotacao com especificacoes e precos |
| `fornecedores_cotados` | json | Nao | Lista de fornecedores consultados | RF-027: array de {nome, cnpj, preco, contato}. Exigido pelo orgao |
| `status` | enum('aberta','cotacao_enviada','adjudicada','encerrada') | Sim | Status do processo | RF-027: workflow mais curto que pregao |
| `data_limite` | datetime | Nao | Prazo para envio da cotacao | RF-027: deadline. RF-039: alerta |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## 37. estrategias_editais

**Objetivo:** Decisao estrategica por edital — go (participar), nogo (nao participar) ou acompanhar. Registra prioridade, margem desejada, nivel de agressividade de preco e justificativa. Uma decisao por usuario+edital (UNIQUE constraint).

**Requisitos:** RF-037 (Estrategia Comercial — intencao de participacao), RF-009 (Parametros — limiares usados na decisao)

**Uso na UI:** A implementar — integracao com ValidacaoPage (botao GO/NO-GO apos analise) + Dashboard (contadores go/nogo/acompanhar)

**Backend tools:** A implementar — CRUD + decisao automatica baseada em score_final vs limiares do parametro_score

| Campo | Tipo | Obrigatorio | Descricao | Uso nos requisitos e UI |
|-------|------|:-----------:|-----------|-------------------------|
| `id` | varchar(36) PK | Sim | UUID | Identificador |
| `user_id` | varchar(36) FK → users.id CASCADE | Sim | Dono | RF-033: multi-tenancy. UNIQUE com edital_id |
| `edital_id` | varchar(36) FK → editais.id CASCADE | Sim | Edital alvo | RF-037: decisao e sobre este edital. UNIQUE com user_id |
| `decisao` | enum('go','nogo','acompanhar') | Nao | Decisao tomada | RF-037: resultado da analise. ValidacaoPage: badge grande (verde/vermelho/amarelo) |
| `prioridade` | enum('alta','media','baixa') | Nao | Prioridade de atuacao | RF-037: priorizacao no pipeline. Dashboard: filtro |
| `margem_desejada` | decimal(5,2) | Nao | Margem de lucro desejada (%) | RF-013: input para recomendacao de preco. PrecificacaoPage: campo |
| `agressividade_preco` | enum('conservador','moderado','agressivo') | Nao | Estrategia de preco | RF-013: calibrar recomendacao. Conservador: preco alto/seguro. Agressivo: preco baixo/competitivo |
| `justificativa` | text | Nao | Razao da decisao | RF-037: texto explicativo (manual ou gerado pela IA) |
| `data_decisao` | datetime | Nao | Quando foi decidido | RF-037: rastreabilidade temporal |
| `decidido_por` | varchar(255) | Nao | Quem decidiu (nome ou "IA") | RF-037: rastreabilidade de responsabilidade |
| `created_at` | datetime | Sim | Criacao | Interno |
| `updated_at` | datetime | Sim | Atualizacao | Interno |

---

## Diagrama de Relacionamentos

```
users
├── refresh_tokens (CASCADE)
├── sessions (CASCADE)
│   ├── messages (CASCADE)
│   ├── documentos (SET NULL)
│   └── auditoria_log (SET NULL)
├── produtos (CASCADE)
│   ├── produtos_especificacoes (CASCADE)
│   │   └── ← analises_detalhes.especificacao_id (SET NULL)
│   ├── produtos_documentos (CASCADE)
│   └── propostas (CASCADE)
│       └── contratos.proposta_id (SET NULL)
├── editais (CASCADE)
│   ├── editais_requisitos (CASCADE)
│   │   └── analises_detalhes.requisito_id (CASCADE)
│   ├── editais_documentos (CASCADE)
│   ├── editais_itens (CASCADE)
│   ├── analises (CASCADE)
│   │   ├── analises_detalhes (CASCADE)
│   │   └── propostas.analise_id (SET NULL)
│   ├── propostas (CASCADE)
│   ├── alertas (CASCADE)
│   │   └── notificacoes.alerta_id (SET NULL)
│   ├── participacoes_editais (CASCADE)
│   ├── precos_historicos.edital_id (SET NULL)
│   ├── notificacoes.edital_id (SET NULL)
│   ├── contratos.edital_id (SET NULL)
│   ├── recursos (CASCADE)
│   ├── leads_crm.edital_id (SET NULL)
│   ├── acoes_pos_perda.edital_id (SET NULL)
│   ├── dispensas (CASCADE)
│   └── estrategias_editais (CASCADE)
├── empresas (CASCADE)
│   ├── empresa_documentos (CASCADE)
│   ├── empresa_certidoes (CASCADE)
│   └── empresa_responsaveis (CASCADE)
├── contratos (CASCADE)
│   └── contrato_entregas (CASCADE)
│       └── produto_id → produtos (SET NULL)
├── monitoramentos (CASCADE)
│   └── notificacoes.monitoramento_id (SET NULL)
├── preferencias_notificacao (CASCADE, 1:1)
├── parametros_score (CASCADE, 1:1)
├── recursos (CASCADE)
├── leads_crm (CASCADE)
│   └── acoes_pos_perda.lead_crm_id (SET NULL)
├── acoes_pos_perda (CASCADE)
├── auditoria_log (SET NULL — log sobrevive)
├── aprendizado_feedback (CASCADE)
├── dispensas (CASCADE)
├── estrategias_editais (CASCADE)
├── notificacoes (CASCADE)
├── precos_historicos (CASCADE)
└── propostas (CASCADE)

concorrentes (sem user_id — compartilhado)
├── precos_historicos.concorrente_id (SET NULL)
└── participacoes_editais.concorrente_id (SET NULL)

fontes_editais (independente — seeds iniciais)

documentos.documento_pai_id → documentos (self-reference, SET NULL)
```

---

## Tabelas Legado (Old-Schema — NAO USADAS)

15 tabelas do schema antigo com INT auto-increment PK. Nao possuem models SQLAlchemy e nao sao referenciadas pelo app. Candidatas a exclusao:

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
| `classe_produto` | Classes (10 registros — dados uteis para RF-006) |
| `campo_classe` | Campos por classe (38 registros — dados uteis para RF-006) |
| `categoria_edital` | Categorias (6 registros — complementa enum do editais) |
