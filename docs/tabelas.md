# TABELAS DO SISTEMA facilicita.ia

**Banco:** MySQL `editais` (host configurado via .env)
**ORM:** SQLAlchemy (backend/models.py)
**Chaves primarias:** UUID varchar(36) (gerado por `uuid.uuid4()`)

---

## Indice

1. [users](#1-users) — Usuarios do sistema
2. [refresh_tokens](#2-refresh_tokens) — Tokens de refresh JWT
3. [sessions](#3-sessions) — Sessoes de chat
4. [messages](#4-messages) — Mensagens do chat
5. [produtos](#5-produtos) — Catalogo de produtos do usuario
6. [produtos_especificacoes](#6-produtos_especificacoes) — Especificacoes tecnicas dos produtos
7. [produtos_documentos](#7-produtos_documentos) — Documentos anexados aos produtos
8. [fontes_editais](#8-fontes_editais) — Fontes de busca de editais
9. [editais](#9-editais) — Editais de licitacao
10. [editais_requisitos](#10-editais_requisitos) — Requisitos extraidos dos editais
11. [editais_documentos](#11-editais_documentos) — Documentos dos editais
12. [editais_itens](#12-editais_itens) — Itens/lotes dos editais
13. [analises](#13-analises) — Analises de aderencia produto x edital
14. [analises_detalhes](#14-analises_detalhes) — Detalhe requisito-a-requisito da analise
15. [propostas](#15-propostas) — Propostas tecnicas geradas
16. [concorrentes](#16-concorrentes) — Empresas concorrentes identificadas
17. [participacoes_editais](#17-participacoes_editais) — Participacoes de concorrentes em editais
18. [precos_historicos](#18-precos_historicos) — Historico de precos praticados
19. [alertas](#19-alertas) — Alertas de prazos configurados
20. [monitoramentos](#20-monitoramentos) — Monitoramentos automaticos de editais
21. [notificacoes](#21-notificacoes) — Notificacoes enviadas ao usuario
22. [preferencias_notificacao](#22-preferencias_notificacao) — Preferencias de notificacao do usuario
23. [documentos](#23-documentos) — Documentos gerados pelo sistema
24. [classe_produto](#24-classe_produto) — Classes de produtos (legado, com dados)
25. [campo_classe](#25-campo_classe) — Campos por classe de produto (legado, com dados)
26. [categoria_edital](#26-categoria_edital) — Categorias de editais (legado, com dados)

---

## 1. users

**Descricao:** Usuarios autenticados do sistema. Cada usuario tem seus proprios produtos, editais, sessoes e configuracoes isolados.

**Rows:** 3 | **Model:** `User`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `email` | varchar(255) | NO (UNIQUE) | — | Email de login |
| `password_hash` | varchar(255) | YES | — | Hash bcrypt da senha |
| `google_id` | varchar(255) | YES (UNIQUE) | — | ID Google OAuth (futuro) |
| `name` | varchar(255) | NO | — | Nome de exibicao |
| `picture_url` | text | YES | — | URL da foto de perfil |
| `created_at` | datetime | YES | now() | Data de criacao |
| `last_login_at` | datetime | YES | — | Ultimo login |

**Relacionamentos:**
- `sessions` → Session (cascade delete)
- `refresh_tokens` → RefreshToken (cascade delete)
- `produtos` → Produto (cascade delete)
- `editais` → Edital (cascade delete)

---

## 2. refresh_tokens

**Descricao:** Tokens de refresh para manter a sessao JWT ativa. Cada login gera um refresh token que pode ser revogado.

**Rows:** 50 | **Model:** `RefreshToken`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono do token |
| `token` | varchar(64) | NO (UNIQUE) | — | Token de refresh (hex aleatorio) |
| `expires_at` | datetime | NO | — | Data de expiracao |
| `revoked` | tinyint(1) | YES | False | Se foi revogado |
| `created_at` | datetime | YES | now() | Data de criacao |

**FK:** `user_id` → `users.id` ON DELETE CASCADE

---

## 3. sessions

**Descricao:** Sessoes de conversa com o agente de IA. Cada sessao agrupa mensagens de uma conversa.

**Rows:** 101 | **Model:** `Session`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono da sessao |
| `name` | varchar(255) | NO | 'Nova conversa' | Nome da sessao (auto-renomeada pela IA) |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao (auto-update) |

**FK:** `user_id` → `users.id` ON DELETE CASCADE
**Relacionamentos:** `messages` → Message (cascade delete, ordenado por created_at)

---

## 4. messages

**Descricao:** Mensagens individuais dentro de uma sessao de chat. Armazena tanto mensagens do usuario quanto respostas do assistente, incluindo metadados como tipo de acao e fontes usadas.

**Rows:** 1030 | **Model:** `Message`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | int(11) | NO (PK) | auto_increment | Identificador sequencial |
| `session_id` | varchar(36) | NO (FK→sessions) | — | Sessao da mensagem |
| `role` | enum('user','assistant') | NO | — | Quem enviou |
| `content` | text | NO | — | Conteudo da mensagem (markdown) |
| `sources_json` | longtext (JSON) | YES | — | Fontes/editais usados na resposta |
| `action_type` | varchar(50) | YES | — | Intencao detectada (ex: buscar_editais) |
| `created_at` | datetime | YES | now() | Data de criacao |

**FK:** `session_id` → `sessions.id` ON DELETE CASCADE

---

## 5. produtos

**Descricao:** Catalogo de produtos do usuario. Cada produto e cadastrado via upload de PDF (manual/datasheet) ou manualmente. O agente extrai especificacoes automaticamente do documento.

**Rows:** 22 | **Model:** `Produto`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono |
| `nome` | varchar(255) | NO | — | Nome do produto |
| `codigo_interno` | varchar(50) | YES | — | Codigo interno da empresa |
| `ncm` | varchar(20) | YES | — | Codigo NCM (Nomenclatura Comum Mercosul) |
| `categoria` | enum(...) | NO | — | Categoria do produto |
| `fabricante` | varchar(255) | YES | — | Nome do fabricante |
| `modelo` | varchar(255) | YES | — | Modelo do produto |
| `descricao` | text | YES | — | Descricao livre |
| `preco_referencia` | decimal(15,2) | YES | — | Preco de referencia em R$ |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao (auto-update) |

**Enum `categoria`:** `equipamento`, `reagente`, `insumo_hospitalar`, `insumo_laboratorial`, `informatica`, `redes`, `mobiliario`, `eletronico`, `outro`

**FK:** `user_id` → `users.id` ON DELETE CASCADE
**Relacionamentos:**
- `especificacoes` → ProdutoEspecificacao (cascade delete)
- `documentos` → ProdutoDocumento (cascade delete)
- `analises` → Analise (cascade delete)

---

## 6. produtos_especificacoes

**Descricao:** Especificacoes tecnicas extraidas automaticamente dos documentos do produto pela IA. Cada especificacao e um par nome/valor com metadados numericos para comparacao com requisitos de editais.

**Rows:** 263 | **Model:** `ProdutoEspecificacao`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `produto_id` | varchar(36) | NO (FK→produtos) | — | Produto pai |
| `nome_especificacao` | varchar(255) | NO | — | Nome da spec (ex: "Peso", "Voltagem") |
| `valor` | varchar(500) | NO | — | Valor textual (ex: "12kg", "110-220V") |
| `unidade` | varchar(50) | YES | — | Unidade de medida (ex: "kg", "V") |
| `valor_numerico` | decimal(15,6) | YES | — | Valor numerico extraido para comparacao |
| `operador` | varchar(10) | YES | — | Operador (>=, <=, =, ~) |
| `valor_min` | decimal(15,6) | YES | — | Valor minimo de faixa |
| `valor_max` | decimal(15,6) | YES | — | Valor maximo de faixa |
| `pagina_origem` | int(11) | YES | — | Pagina do PDF de onde foi extraida |
| `created_at` | datetime | YES | now() | Data de criacao |

**FK:** `produto_id` → `produtos.id` ON DELETE CASCADE

---

## 7. produtos_documentos

**Descricao:** Arquivos PDF anexados aos produtos (manuais, fichas tecnicas, certificados). O texto e extraido automaticamente para alimentar a IA.

**Rows:** 4 | **Model:** `ProdutoDocumento`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `produto_id` | varchar(36) | NO (FK→produtos) | — | Produto pai |
| `tipo` | enum(...) | NO | — | Tipo do documento |
| `nome_arquivo` | varchar(255) | NO | — | Nome original do arquivo |
| `path_arquivo` | varchar(500) | NO | — | Caminho no disco |
| `texto_extraido` | longtext | YES | — | Texto completo extraido do PDF |
| `processado` | tinyint(1) | YES | False | Se ja foi processado pela IA |
| `created_at` | datetime | YES | now() | Data de criacao |

**Enum `tipo`:** `manual`, `ficha_tecnica`, `certificado_anvisa`, `certificado_outro`

**FK:** `produto_id` → `produtos.id` ON DELETE CASCADE

---

## 8. fontes_editais

**Descricao:** Fontes configuradas para busca de editais (APIs como PNCP, scrapers de portais de compras). O sistema usa essas fontes quando o usuario pede "busque editais de X".

**Rows:** 13 | **Model:** `FonteEdital`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `nome` | varchar(100) | NO | — | Nome da fonte (ex: "PNCP") |
| `tipo` | enum('api','scraper') | NO | — | Tipo de integracao |
| `url_base` | varchar(500) | YES | — | URL base da API/site |
| `api_key` | varchar(255) | YES | — | Chave de API (se aplicavel) |
| `ativo` | tinyint(1) | YES | True | Se esta ativa |
| `descricao` | text | YES | — | Descricao da fonte |
| `created_at` | datetime | YES | now() | Data de criacao |

---

## 9. editais

**Descricao:** Editais de licitacao publica. Podem ser cadastrados automaticamente via busca no PNCP, manualmente pelo chat, ou salvos apos uma busca. Tabela central do sistema — conecta-se a requisitos, itens, documentos, analises, propostas e alertas.

**Rows:** 0 (CRUD completo implementado, sem dados salvos ainda) | **Model:** `Edital`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono |
| `numero` | varchar(100) | NO | — | Numero do edital (ex: "PE-001/2026") |
| `orgao` | varchar(255) | NO | — | Orgao licitante |
| `orgao_tipo` | enum(...) | YES | — | Tipo do orgao |
| `uf` | varchar(2) | YES | — | Estado (sigla) |
| `cidade` | varchar(100) | YES | — | Cidade |
| `objeto` | text | NO | — | Descricao do objeto da licitacao |
| `modalidade` | enum(...) | YES | — | Modalidade da licitacao |
| `categoria` | enum(...) | YES | — | Categoria do edital |
| `valor_referencia` | decimal(15,2) | YES | — | Valor estimado em R$ |
| `data_publicacao` | date | YES | — | Data de publicacao |
| `data_abertura` | datetime | YES | — | Data/hora de abertura |
| `data_limite_proposta` | datetime | YES | — | Prazo limite para proposta |
| `data_limite_impugnacao` | datetime | YES | — | Prazo para impugnacao |
| `data_recursos` | datetime | YES | — | Prazo para recursos |
| `data_homologacao_prevista` | datetime | YES | — | Data prevista de homologacao |
| `horario_abertura` | varchar(10) | YES | — | Horario da abertura (ex: "14:00") |
| `fuso_horario` | varchar(50) | YES | 'America/Sao_Paulo' | Fuso horario |
| `status` | enum(...) | YES | — | Status atual do edital |
| `fonte` | varchar(50) | YES | — | De onde veio (ex: "pncp") |
| `url` | varchar(500) | YES | — | URL do edital no portal |
| `numero_pncp` | varchar(100) | YES | — | Numero no PNCP |
| `cnpj_orgao` | varchar(20) | YES | — | CNPJ do orgao licitante |
| `ano_compra` | int(11) | YES | — | Ano da compra no PNCP |
| `seq_compra` | int(11) | YES | — | Sequencial da compra no PNCP |
| `srp` | tinyint(1) | YES | 0 | Se e Sistema de Registro de Precos |
| `situacao_pncp` | varchar(100) | YES | — | Situacao no PNCP (texto livre) |
| `pdf_url` | varchar(500) | YES | — | URL do PDF do edital |
| `pdf_titulo` | varchar(255) | YES | — | Titulo do PDF |
| `pdf_path` | varchar(500) | YES | — | Caminho local do PDF baixado |
| `dados_completos` | tinyint(1) | YES | 0 | Se os dados foram completamente carregados |
| `fonte_tipo` | varchar(20) | YES | — | Tipo da fonte de origem |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao (auto-update) |

**Enum `orgao_tipo`:** `federal`, `estadual`, `municipal`, `autarquia`, `fundacao`

**Enum `modalidade`:** `pregao_eletronico`, `pregao_presencial`, `concorrencia`, `tomada_precos`, `convite`, `dispensa`, `inexigibilidade`

**Enum `categoria`:** `comodato`, `venda_equipamento`, `aluguel_com_consumo`, `aluguel_sem_consumo`, `consumo_reagentes`, `consumo_insumos`, `servicos`, `informatica`, `redes`, `mobiliario`, `outro`

**Enum `status` (MySQL):** `novo`, `analisando`, `participando`, `proposta_enviada`, `em_pregao`, `vencedor`, `perdedor`, `cancelado`, `desistido`, `aberto`, `fechado`, `suspenso`

> **Nota:** O model Python define tambem `ganho` e `perdido` no enum, mas o MySQL nao tem esses valores. Inconsistencia a corrigir.

**FK:** `user_id` → `users.id` ON DELETE CASCADE
**Relacionamentos:**
- `requisitos` → EditalRequisito (cascade delete)
- `documentos` → EditalDocumento (cascade delete)
- `itens` → EditalItem (cascade delete)
- `analises` → Analise (cascade delete)

---

## 10. editais_requisitos

**Descricao:** Requisitos tecnicos, documentais, comerciais e legais extraidos do texto do edital pela IA. Usados na analise de aderencia para comparar com especificacoes do produto.

**Rows:** 0 (CRUD implementado) | **Model:** `EditalRequisito`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital pai |
| `tipo` | enum('tecnico','documental','comercial','legal') | NO | — | Tipo do requisito |
| `descricao` | text | NO | — | Descricao do requisito |
| `nome_especificacao` | varchar(255) | YES | — | Nome da spec equivalente no produto |
| `valor_exigido` | varchar(500) | YES | — | Valor exigido pelo edital |
| `operador` | varchar(10) | YES | — | Operador de comparacao (>=, <=, =) |
| `valor_numerico` | decimal(15,6) | YES | — | Valor numerico para comparacao |
| `obrigatorio` | tinyint(1) | YES | True | Se e obrigatorio |
| `pagina_origem` | int(11) | YES | — | Pagina do PDF |
| `created_at` | datetime | YES | now() | Data de criacao |

**FK:** `edital_id` → `editais.id` ON DELETE CASCADE

---

## 11. editais_documentos

**Descricao:** Documentos PDF associados a editais (o edital em si, termo de referencia, anexos, planilhas). Baixados do PNCP ou enviados pelo usuario.

**Rows:** 0 (CRUD implementado) | **Model:** `EditalDocumento`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital pai |
| `tipo` | enum(...) | NO | — | Tipo do documento |
| `nome_arquivo` | varchar(255) | NO | — | Nome do arquivo |
| `path_arquivo` | varchar(500) | NO | — | Caminho no disco |
| `texto_extraido` | longtext | YES | — | Texto extraido do PDF |
| `processado` | tinyint(1) | YES | False | Se foi processado |
| `created_at` | datetime | YES | now() | Data de criacao |

**Enum `tipo`:** `edital_principal`, `termo_referencia`, `anexo`, `planilha`, `outro`

**FK:** `edital_id` → `editais.id` ON DELETE CASCADE

---

## 12. editais_itens

**Descricao:** Itens/lotes individuais de um edital. Extraidos automaticamente da API do PNCP com quantidades, valores estimados e codigos.

**Rows:** 0 (CRUD implementado) | **Model:** `EditalItem`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital pai |
| `numero_item` | int(11) | YES | — | Numero do item no edital |
| `descricao` | text | YES | — | Descricao do item |
| `unidade_medida` | varchar(50) | YES | — | Unidade (ex: "UN", "KIT") |
| `quantidade` | decimal(15,4) | YES | — | Quantidade licitada |
| `valor_unitario_estimado` | decimal(15,2) | YES | — | Preco unitario estimado |
| `valor_total_estimado` | decimal(15,2) | YES | — | Preco total estimado |
| `codigo_item` | varchar(100) | YES | — | Codigo CATMAT/CATSER |
| `tipo_beneficio` | varchar(100) | YES | — | Tipo de beneficio (ME/EPP) |
| `created_at` | datetime | YES | now() | Data de criacao |

**FK:** `edital_id` → `editais.id` ON DELETE CASCADE

---

## 13. analises

**Descricao:** Resultado da analise de aderencia entre um produto e um edital. Calcula scores tecnicos, comerciais e um score final que indica o quanto o produto atende aos requisitos do edital.

**Rows:** 0 (CRUD implementado) | **Model:** `Analise`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital analisado |
| `produto_id` | varchar(36) | NO (FK→produtos) | — | Produto comparado |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario que solicitou |
| `score_tecnico` | decimal(5,2) | YES | — | Score tecnico (0-100) |
| `score_comercial` | decimal(5,2) | YES | — | Score comercial (0-100) |
| `score_potencial` | decimal(5,2) | YES | — | Score de potencial (0-100) |
| `score_final` | decimal(5,2) | YES | — | Score final ponderado (0-100) |
| `requisitos_total` | int(11) | YES | 0 | Total de requisitos avaliados |
| `requisitos_atendidos` | int(11) | YES | 0 | Requisitos totalmente atendidos |
| `requisitos_parciais` | int(11) | YES | 0 | Requisitos parcialmente atendidos |
| `requisitos_nao_atendidos` | int(11) | YES | 0 | Requisitos nao atendidos |
| `preco_sugerido_min` | decimal(15,2) | YES | — | Preco minimo sugerido |
| `preco_sugerido_max` | decimal(15,2) | YES | — | Preco maximo sugerido |
| `preco_sugerido` | decimal(15,2) | YES | — | Preco sugerido pela IA |
| `recomendacao` | text | YES | — | Texto de recomendacao da IA |
| `created_at` | datetime | YES | now() | Data de criacao |

**FKs:**
- `edital_id` → `editais.id` ON DELETE CASCADE
- `produto_id` → `produtos.id` ON DELETE CASCADE
- `user_id` → `users.id` ON DELETE CASCADE

**Relacionamentos:** `detalhes` → AnaliseDetalhe (cascade delete)

---

## 14. analises_detalhes

**Descricao:** Detalhe requisito-a-requisito de uma analise de aderencia. Para cada requisito do edital, registra qual especificacao do produto foi comparada e o resultado (atendido, parcial, nao atendido).

**Rows:** 0 (CRUD implementado) | **Model:** `AnaliseDetalhe`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `analise_id` | varchar(36) | NO (FK→analises) | — | Analise pai |
| `requisito_id` | varchar(36) | NO (FK→editais_requisitos) | — | Requisito avaliado |
| `especificacao_id` | varchar(36) | YES | — | Especificacao do produto usada |
| `status` | enum(...) | NO | — | Resultado da comparacao |
| `valor_exigido` | varchar(500) | YES | — | O que o edital exige |
| `valor_produto` | varchar(500) | YES | — | O que o produto oferece |
| `justificativa` | text | YES | — | Justificativa da IA para o status |
| `created_at` | datetime | YES | now() | Data de criacao |

**Enum `status`:** `atendido`, `parcial`, `nao_atendido`, `nao_aplicavel`

**FKs:**
- `analise_id` → `analises.id` ON DELETE CASCADE
- `requisito_id` → `editais_requisitos.id`

---

## 15. propostas

**Descricao:** Propostas tecnicas geradas pela IA. Cada proposta associa um produto a um edital, com texto tecnico formatado e preco.

**Rows:** 0 (CRUD implementado) | **Model:** `Proposta`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital alvo |
| `produto_id` | varchar(36) | NO (FK→produtos) | — | Produto ofertado |
| `analise_id` | varchar(36) | YES (FK→analises) | — | Analise de aderencia usada |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono |
| `texto_tecnico` | text | YES | — | Texto completo da proposta tecnica |
| `preco_unitario` | decimal(15,2) | YES | — | Preco unitario ofertado |
| `preco_total` | decimal(15,2) | YES | — | Preco total ofertado |
| `quantidade` | int(11) | YES | 1 | Quantidade |
| `status` | enum(...) | YES | 'rascunho' | Status da proposta |
| `arquivo_path` | varchar(500) | YES | — | Caminho do arquivo gerado |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao |

**Enum `status`:** `rascunho`, `revisao`, `aprovada`, `enviada`

**FKs:**
- `edital_id` → `editais.id` ON DELETE CASCADE
- `produto_id` → `produtos.id` ON DELETE CASCADE
- `analise_id` → `analises.id`
- `user_id` → `users.id` ON DELETE CASCADE

---

## 16. concorrentes

**Descricao:** Empresas concorrentes identificadas a partir de atas de pregao, registros de resultado e buscas no PNCP. Acumula estatisticas de participacao e vitorias.

**Rows:** 7 | **Model:** `Concorrente`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `nome` | varchar(255) | NO | — | Nome fantasia da empresa |
| `cnpj` | varchar(20) | YES (UNIQUE) | — | CNPJ |
| `razao_social` | varchar(255) | YES | — | Razao social |
| `segmentos` | longtext (JSON) | YES | — | Segmentos de atuacao |
| `editais_participados` | int(11) | YES | 0 | Total de editais em que participou |
| `editais_ganhos` | int(11) | YES | 0 | Total de editais ganhos |
| `preco_medio` | decimal(15,2) | YES | — | Preco medio praticado |
| `taxa_vitoria` | decimal(5,2) | YES | — | Taxa de vitoria (%) |
| `observacoes` | text | YES | — | Observacoes livres |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao |

**Relacionamentos:**
- `precos_historicos` → PrecoHistorico
- `participacoes` → ParticipacaoEdital

---

## 17. participacoes_editais

**Descricao:** Registro de participacao de uma empresa concorrente em um edital especifico. Inclui preco proposto, posicao final e se foi desclassificada.

**Rows:** 0 (CRUD implementado) | **Model:** `ParticipacaoEdital`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital |
| `concorrente_id` | varchar(36) | YES (FK→concorrentes) | — | Empresa participante |
| `preco_proposto` | decimal(15,2) | YES | — | Preco ofertado |
| `posicao_final` | int(11) | YES | — | Posicao no resultado (1=vencedor) |
| `desclassificado` | tinyint(1) | YES | 0 | Se foi desclassificada |
| `motivo_desclassificacao` | text | YES | — | Motivo da desclassificacao |
| `fonte` | enum('manual','pncp','ata_pdf') | YES | — | De onde veio a informacao |
| `created_at` | datetime | YES | now() | Data de criacao |

**FKs:**
- `edital_id` → `editais.id` ON DELETE CASCADE
- `concorrente_id` → `concorrentes.id` ON DELETE SET NULL

---

## 18. precos_historicos

**Descricao:** Historico de precos praticados em licitacoes. Registra precos de referencia, vencedores e nossos precos para analise comparativa e recomendacao de precos futuros.

**Rows:** 24 | **Model:** `PrecoHistorico`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `edital_id` | varchar(36) | YES (FK→editais) | — | Edital relacionado |
| `produto_id` | varchar(36) | YES (FK→produtos) | — | Produto relacionado |
| `user_id` | varchar(36) | YES (FK→users) | — | Usuario |
| `preco_referencia` | decimal(15,2) | YES | — | Preco de referencia do edital |
| `preco_vencedor` | decimal(15,2) | YES | — | Preco do vencedor |
| `nosso_preco` | decimal(15,2) | YES | — | Nosso preco ofertado |
| `desconto_percentual` | decimal(5,2) | YES | — | Desconto sobre referencia (%) |
| `concorrente_id` | varchar(36) | YES (FK→concorrentes) | — | Empresa vencedora |
| `empresa_vencedora` | varchar(255) | YES | — | Nome da empresa vencedora |
| `cnpj_vencedor` | varchar(20) | YES | — | CNPJ do vencedor |
| `resultado` | enum(...) | YES | — | Resultado da participacao |
| `motivo_perda` | enum(...) | YES | — | Motivo da derrota (se aplicavel) |
| `data_homologacao` | date | YES | — | Data de homologacao |
| `data_registro` | datetime | YES | now() | Data do registro |
| `fonte` | enum(...) | YES | — | Origem da informacao |

**Enum `resultado`:** `vitoria`, `derrota`, `cancelado`, `deserto`, `revogado`
**Enum `motivo_perda`:** `preco`, `tecnica`, `documentacao`, `prazo`, `outro`
**Enum `fonte`:** `manual`, `pncp`, `ata_pdf`, `painel_precos`

**FKs:**
- `edital_id` → `editais.id` ON DELETE SET NULL
- `produto_id` → `produtos.id` ON DELETE SET NULL
- `user_id` → `users.id` ON DELETE CASCADE
- `concorrente_id` → `concorrentes.id` ON DELETE SET NULL

---

## 19. alertas

**Descricao:** Alertas de prazo configurados pelo usuario para ser avisado antes de datas importantes de editais (abertura, impugnacao, recursos, etc).

**Rows:** 0 (CRUD implementado) | **Model:** `Alerta`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario |
| `edital_id` | varchar(36) | NO (FK→editais) | — | Edital monitorado |
| `tipo` | enum(...) | NO | 'abertura' | Tipo do alerta |
| `data_disparo` | datetime | NO | — | Quando o alerta deve disparar |
| `tempo_antes_minutos` | int(11) | YES | — | Minutos antes do evento |
| `status` | enum(...) | YES | 'agendado' | Status atual |
| `canal_email` | tinyint(1) | YES | True | Enviar por email |
| `canal_push` | tinyint(1) | YES | True | Enviar por push |
| `canal_sms` | tinyint(1) | YES | False | Enviar por SMS |
| `titulo` | varchar(255) | YES | — | Titulo da notificacao |
| `mensagem` | text | YES | — | Mensagem do alerta |
| `disparado_em` | datetime | YES | — | Quando foi efetivamente disparado |
| `lido_em` | datetime | YES | — | Quando foi lido |
| `created_at` | datetime | YES | now() | Data de criacao |

**Enum `tipo`:** `abertura`, `impugnacao`, `recursos`, `proposta`, `personalizado`
**Enum `status`:** `agendado`, `disparado`, `lido`, `cancelado`

**FKs:**
- `user_id` → `users.id` ON DELETE CASCADE
- `edital_id` → `editais.id` ON DELETE CASCADE

---

## 20. monitoramentos

**Descricao:** Monitoramentos automaticos configurados para buscar novos editais periodicamente. O sistema executa buscas automaticas nos intervalos configurados e notifica o usuario quando encontra editais relevantes.

**Rows:** 3 | **Model:** `Monitoramento`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario |
| `termo` | varchar(255) | NO | — | Termo de busca (ex: "microscopio") |
| `fontes` | longtext (JSON) | YES | — | Fontes a buscar (ex: ["pncp"]) |
| `ufs` | longtext (JSON) | YES | — | UFs filtro (ex: ["MG","SP"]) |
| `valor_minimo` | decimal(15,2) | YES | — | Valor minimo do edital |
| `valor_maximo` | decimal(15,2) | YES | — | Valor maximo do edital |
| `frequencia_horas` | int(11) | YES | 4 | Frequencia de verificacao em horas |
| `ultimo_check` | datetime | YES | — | Ultima verificacao |
| `proximo_check` | datetime | YES | — | Proxima verificacao agendada |
| `notificar_email` | tinyint(1) | YES | True | Notificar por email |
| `notificar_push` | tinyint(1) | YES | True | Notificar por push |
| `score_minimo_alerta` | int(11) | YES | 70 | Score minimo para alertar |
| `ativo` | tinyint(1) | YES | True | Se esta ativo |
| `editais_encontrados` | int(11) | YES | 0 | Total de editais ja encontrados |
| `ultima_execucao` | datetime | YES | — | Ultima execucao efetiva |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao |

**FK:** `user_id` → `users.id` ON DELETE CASCADE

---

## 21. notificacoes

**Descricao:** Registro de notificacoes enviadas ao usuario. Cada notificacao pode estar vinculada a um edital, alerta ou monitoramento e tem controle de envio por canal e leitura.

**Rows:** 0 (CRUD implementado) | **Model:** `Notificacao`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario destinatario |
| `tipo` | enum(...) | NO | — | Tipo da notificacao |
| `edital_id` | varchar(36) | YES (FK→editais) | — | Edital relacionado |
| `alerta_id` | varchar(36) | YES (FK→alertas) | — | Alerta que gerou |
| `monitoramento_id` | varchar(36) | YES (FK→monitoramentos) | — | Monitoramento que gerou |
| `titulo` | varchar(255) | NO | — | Titulo |
| `mensagem` | text | NO | — | Mensagem completa |
| `dados` | longtext (JSON) | YES | — | Dados extras em JSON |
| `enviado_email` | tinyint(1) | YES | False | Se foi enviada por email |
| `enviado_push` | tinyint(1) | YES | False | Se foi enviada por push |
| `enviado_sms` | tinyint(1) | YES | False | Se foi enviada por SMS |
| `lida` | tinyint(1) | YES | False | Se foi lida |
| `lida_em` | datetime | YES | — | Quando foi lida |
| `created_at` | datetime | YES | now() | Data de criacao |

**Enum `tipo`:** `alerta_prazo`, `novo_edital`, `alta_aderencia`, `resultado`, `sistema`

**FKs:**
- `user_id` → `users.id` ON DELETE CASCADE
- `edital_id` → `editais.id` ON DELETE SET NULL
- `alerta_id` → `alertas.id` ON DELETE SET NULL
- `monitoramento_id` → `monitoramentos.id` ON DELETE SET NULL

---

## 22. preferencias_notificacao

**Descricao:** Preferencias globais de notificacao do usuario. Define canais habilitados, horario silencioso, dias da semana e tempos padrao para alertas.

**Rows:** 2 | **Model:** `PreferenciasNotificacao`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users, UNIQUE) | — | Usuario (1:1) |
| `email_habilitado` | tinyint(1) | YES | True | Receber por email |
| `push_habilitado` | tinyint(1) | YES | True | Receber por push |
| `sms_habilitado` | tinyint(1) | YES | False | Receber por SMS |
| `email_notificacao` | varchar(255) | YES | — | Email para notificacoes |
| `horario_inicio` | varchar(5) | YES | '07:00' | Inicio do horario de envio |
| `horario_fim` | varchar(5) | YES | '22:00' | Fim do horario de envio |
| `dias_semana` | longtext (JSON) | YES | ["seg","ter","qua","qui","sex"] | Dias habilitados |
| `alertas_padrao` | longtext (JSON) | YES | [4320,1440,60,15] | Tempos padrao em minutos (3d, 1d, 1h, 15min) |
| `score_minimo_notificacao` | int(11) | YES | 60 | Score minimo para notificar |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao |

**FK:** `user_id` → `users.id` ON DELETE CASCADE

---

## 23. documentos

**Descricao:** Documentos gerados pelo sistema (propostas formatadas, relatorios, analises exportadas). Suporta versionamento e vinculacao a sessao de chat.

**Rows:** 0 (CRUD implementado) | **Model:** `Documento`

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | varchar(36) | NO (PK) | uuid4() | Identificador unico |
| `user_id` | varchar(36) | NO (FK→users) | — | Usuario dono |
| `session_id` | varchar(36) | YES (FK→sessions) | — | Sessao onde foi gerado |
| `tipo` | varchar(50) | NO | — | Tipo do documento (livre) |
| `titulo` | varchar(255) | NO | — | Titulo |
| `conteudo_md` | text | NO | — | Conteudo em Markdown |
| `dados_json` | longtext (JSON) | YES | — | Dados estruturados extras |
| `versao` | int(11) | YES | 1 | Numero da versao |
| `documento_pai_id` | varchar(36) | YES | — | ID do documento anterior (versionamento) |
| `created_at` | datetime | YES | now() | Data de criacao |
| `updated_at` | datetime | YES | now() | Ultima atualizacao |

**FKs:**
- `user_id` → `users.id` ON DELETE CASCADE
- `session_id` → `sessions.id` ON DELETE SET NULL

---

## 24. classe_produto

**Descricao:** Classes de produtos para organizacao do catalogo. **Tabela legado** (schema INT auto-increment) com dados reais que nao esta integrada ao app atual.

**Rows:** 10 | **Model:** Nenhum (sem model SQLAlchemy)

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | int(11) | NO (PK) | auto_increment | Identificador |
| `nome` | varchar(100) | NO (UNIQUE) | — | Nome da classe |
| `descricao` | text | YES | — | Descricao |
| `status` | enum('ATIVO','INATIVO') | YES | 'ATIVO' | Se esta ativa |
| `created_at` | timestamp | YES | now() | Data de criacao |
| `updated_at` | timestamp | YES | now() | Ultima atualizacao |

> **Nota:** Tem 10 registros reais mas nenhum model nem tool no app. Candidata a integracao com `ParametrizacoesPage`.

---

## 25. campo_classe

**Descricao:** Campos personalizados por classe de produto. Permite definir especificacoes obrigatorias para cada classe. **Tabela legado** com dados reais.

**Rows:** 38 | **Model:** Nenhum (sem model SQLAlchemy)

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | int(11) | NO (PK) | auto_increment | Identificador |
| `classe_id` | int(11) | NO (FK→classe_produto) | — | Classe pai |
| `nome` | varchar(100) | NO | — | Nome do campo |
| `tipo` | enum('TEXT','NUMBER','DATE','SELECT','BOOLEAN') | NO | — | Tipo de dado |
| `opcoes` | longtext (JSON) | YES | — | Opcoes para tipo SELECT |
| `obrigatorio` | tinyint(1) | YES | 0 | Se e obrigatorio |
| `ordem` | int(11) | YES | 0 | Ordem de exibicao |
| `created_at` | timestamp | YES | now() | Data de criacao |

**FK:** `classe_id` → `classe_produto.id`

> **Nota:** Tem 38 registros reais com especificacoes para cada classe. Candidata a integracao.

---

## 26. categoria_edital

**Descricao:** Categorias de editais com palavras-chave para classificacao automatica. **Tabela legado** com dados reais.

**Rows:** 6 | **Model:** Nenhum (sem model SQLAlchemy)

| Campo | Tipo MySQL | Nullable | Default | Descricao |
|-------|-----------|----------|---------|-----------|
| `id` | int(11) | NO (PK) | auto_increment | Identificador |
| `nome` | varchar(100) | NO (UNIQUE) | — | Nome da categoria |
| `descricao` | text | YES | — | Descricao |
| `palavras_chave` | longtext (JSON) | YES | — | Palavras-chave para matching |
| `status` | enum('ATIVO','INATIVO') | YES | 'ATIVO' | Se esta ativa |
| `created_at` | timestamp | YES | now() | Data de criacao |

> **Nota:** Tem 6 registros reais. Pode complementar o enum `categoria` da tabela `editais`.

---

## Diagrama de Relacionamentos

```
users (3)
├── refresh_tokens (50)
├── sessions (101)
│   ├── messages (1030)
│   └── documentos (0)
├── produtos (22)
│   ├── produtos_especificacoes (263)
│   ├── produtos_documentos (4)
│   └── analises ──┐
├── editais (0)    │
│   ├── editais_requisitos (0)
│   │   └── analises_detalhes (0) ←── analises (0) ←┘
│   ├── editais_documentos (0)
│   ├── editais_itens (0)
│   ├── propostas (0)
│   ├── alertas (0)
│   │   └── notificacoes (0)
│   ├── participacoes_editais (0)
│   └── precos_historicos (24)
├── monitoramentos (3)
│   └── notificacoes (0)
├── preferencias_notificacao (2)
└── concorrentes (7)
    ├── participacoes_editais (0)
    └── precos_historicos (24)

--- Tabelas legado (sem model) ---
classe_produto (10)
└── campo_classe (38)
categoria_edital (6)
fontes_editais (13) [independente]
```

---

## Tabelas do Schema Antigo (NAO USADAS — candidatas a exclusao)

Estas 12 tabelas usam INT auto-increment e pertencem ao schema antigo. O app usa apenas as tabelas UUID listadas acima.

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
