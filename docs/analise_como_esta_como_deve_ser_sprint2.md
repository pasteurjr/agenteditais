# Analise COMO ESTA vs COMO DEVE SER — Sprint 2

**Data:** 2026-02-23
**Fonte:** Codigo-fonte das 5 paginas + `requisitos_completosv2.md` (60 RFs + 4 RNFs)

---

## INDICE

1. [EmpresaPage](#1-empresapage)
2. [PortfolioPage](#2-portfoliopage)
3. [ParametrizacoesPage](#3-parametrizacoespage)
4. [CaptacaoPage](#4-captacaopage)
5. [ValidacaoPage](#5-validacaopage)
6. [Resumo Quantitativo](#6-resumo-quantitativo)
7. [Planejamento para Tornar Aderente](#7-planejamento-para-tornar-aderente)

---

# 1. EMPRESAPAGE

## 1.1 COMO ESTA

**Arquivo:** `frontend/src/pages/EmpresaPage.tsx` (707 linhas)

### Interface Atual

A pagina tem 4 secoes empilhadas verticalmente:

**Secao 1 — Informacoes Cadastrais** (Card)
- Formulario com campos: Razao Social, Nome Fantasia, CNPJ, Inscricao Estadual
- Presenca Digital: Website, Instagram, LinkedIn, Facebook
- Endereco: Endereco, Cidade, UF, CEP
- Emails: lista dinamica com botao +/- (funcional, usa state `emails[]`)
- Celulares: lista dinamica com botao +/- (funcional, usa state `celulares[]`)
- Botao "Salvar Alteracoes" → `crudUpdate("empresas", ...)` ou `crudCreate("empresas", ...)`

**Secao 2 — Documentos da Empresa** (Card + DataTable)
- Tabela com colunas: Documento, Tipo, Validade, Status, Acoes
- Status calculado como: `path_arquivo ? "ok" : "falta"` (L151) — sem verificacao de vencimento
- Acoes: Visualizar, Download, Upload, Excluir
- Modal de upload: dropdown com tipos (Contrato Social, Procuracao, Certidao Negativa, Habilitacao Fiscal, Habilitacao Economica, Balanco Patrimonial, Qualificacao Tecnica, Atestado de Capacidade, AFE, CBPAD, CBPP, Corpo de Bombeiros, Outro)
- Upload via `POST /api/empresa-documentos/upload` com FormData
- **TIPOS do dropdown (L643-668):** Organizados em 5 optgroups — Habilitacao Juridica, Fiscal, Economica/Financeira, Qualificacao Tecnica, Sanitarias/Regulatorias, Outros

**Secao 3 — Certidoes Automaticas** (Card + DataTable) — **ZERO IMPLEMENTADO**
- Tabela com colunas: Certidao, Status, Data Obtencao, Validade, Acoes
- **NADA FUNCIONA nesta secao:**
  1. **Botao "Buscar Certidoes" DESABILITADO:** Lock icon + `onClick={() => {}}` + label "Em breve" (L593-598) — nao existe endpoint de busca automatica
  2. **BUG campo mapeado:** Frontend usa `certidao` (L157) mas backend model `EmpresaCertidao` tem campo `tipo` (enum: cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, outro) → coluna "Certidao" sempre vazia
  3. **BUG enum mismatch:** Frontend define status `obtida/pendente/erro` (L47-53) mas backend armazena `valida/vencida/pendente` (models.py:1061) → badges nunca correspondem
  4. **Acoes sem handler:** Botoes Visualizar, Download e RefreshCw existem visualmente mas nenhum tem onClick real (L380-388)
  5. **Nao tem pre-populacao:** Deveria mostrar as 5 certidoes fixas (CND Federal, Estadual, Municipal, FGTS, Trabalhista) com status pendente por padrao — hoje mostra tabela vazia
  6. **Nao tem nenhuma logica de busca automatica em lugar nenhum do sistema** — nem endpoint, nem agente, nem cron
- Resumo: a secao e puramente visual/decorativa, sem NENHUMA funcionalidade real conectada

**Secao 4 — Responsaveis** (Card + DataTable)
- Tabela com colunas: Nome, Cargo, Email, Acoes
- Modal para adicionar: Nome, Cargo, Email, Telefone
- `crudCreate("empresa-responsaveis", ...)` funcional
- Excluir funcional via `crudDelete`
- **SEM campo `tipo`** (representante_legal/preposto/tecnico) que RF-005 exige
- **SEM botao Editar** — so pode adicionar e excluir

### Funcoes Implementadas
- `loadEmpresa()` → `crudList("empresas", { limit: 1 })`
- `loadSubTables(id)` → Promise.all de 3 crudList (empresa-documentos, empresa-certidoes, empresa-responsaveis)
- `handleSave()` → crudUpdate/crudCreate
- `handleAddEmail/RemoveEmail` → manipulacao de state local
- `handleAddCelular/RemoveCelular` → manipulacao de state local
- `handleSalvarDocumento()` → POST /api/empresa-documentos/upload com FormData
- `handleSalvarResponsavel()` → crudCreate
- `handleExcluirDocumento/Responsavel()` → crudDelete
- Botao "Verificar Documentos" → DESABILITADO (Lock)

### Requisitos Contidos
| RF | Descricao | Status |
|----|-----------|--------|
| RF-001 | Cadastro da Empresa | **OK** — Todos os campos do wireframe implementados (razao social, CNPJ, IE, redes sociais, emails multiplos, celulares multiplos, endereco) |
| RF-002 | Documentos Habilitativos | **PARCIAL** — Upload funciona, tipos corretos, mas status nao calcula vencimento (so "ok" ou "falta"), sem indicador visual amarelo/vermelho |
| RF-003 | Certidoes Automaticas | **NAO** — Secao inteira e decorativa: botao desabilitado, campo mapeado errado (certidao vs tipo), enum mismatch (obtida vs valida), acoes sem handler, sem pre-populacao das 5 certidoes, sem logica de busca automatica em nenhum lugar do sistema |
| RF-004 | Alertas IA sobre Documentos | **NAO** — Nao existe nenhum componente de alerta IA, nenhuma comparacao edital vs documentos |
| RF-005 | Responsaveis da Empresa | **PARCIAL** — CRUD funciona mas falta campo `tipo` (representante_legal/preposto/tecnico), falta botao Editar |

---

## 1.2 COMO DEVE SER

### RF-001: Cadastro da Empresa
**O que falta:** Nada significativo. Todos os campos do wireframe pag 2 estao implementados.

### RF-002: Documentos Habilitativos
**O que falta:**
1. Status deve ser calculado automaticamente: `ok` (tem arquivo + validade > 30 dias), `vence` (tem arquivo + validade <= 30 dias), `falta` (sem arquivo)
2. Indicadores visuais coloridos: verde=ok, amarelo=vence em breve, vermelho=falta
3. Tipos devem incluir todos do workflow pag 2: Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, Economica, Fiscal, Financeira, Tecnica, Outro — **ja implementados**
4. Campo `data_emissao` no formulario de upload (hoje so tem `data_vencimento`)

### RF-003: Certidoes Automaticas — ZERO IMPLEMENTADO
**Status real: secao inteira e decorativa, NADA funciona.**

**O que falta (TUDO):**
1. **CORRIGIR BUG campo:** Mapear `certidao` para campo correto do backend (`tipo`) — backend tem enum (cnd_federal, cnd_estadual, cnd_municipal, fgts, trabalhista, outro)
2. **CORRIGIR BUG enum:** Alinhar frontend (`obtida/pendente/erro`) com backend (`valida/vencida/pendente`)
3. **Pre-popular 5 certidoes fixas:** Ao carregar empresa, se nao existem certidoes, criar automaticamente 5 registros pendentes (CND Federal, CND Estadual, CND Municipal, FGTS, Trabalhista) — hoje mostra tabela vazia
4. **Acoes reais:** Conectar botoes Visualizar/Download/RefreshCw a handlers (hoje sao `<button>` sem onClick)
5. **Botao "Buscar Certidoes":** Hoje desabilitado com Lock. Deve chamar endpoint real (mesmo que retorne mock por agora) ou via onSendToChat("Busque certidoes automaticas para a empresa X")
6. **Alertas de vencimento proximo** (< 30 dias) — nao existe
7. **Nao existe NENHUM endpoint/agente/cron de busca automatica** em todo o backend — precisa ser criado ou pelo menos simulado via chat

### RF-004: Alertas IA sobre Documentos
**O que falta — TUDO:**
1. Card de alertas IA no topo da pagina (ou secao dedicada)
2. Ao selecionar/analisar um edital, IA compara documentos exigidos com os documentos da empresa
3. Lista de alertas: "Documento X faltante", "Documento Y vencido", "Exigencia Z possivelmente ilegal"
4. Verificacao contra jurisprudencia (RAG sobre impugnacoes passadas)
5. Botao "Verificar contra Edital" que recebe edital_id e retorna gap analysis

### RF-005: Responsaveis da Empresa
**O que falta:**
1. Campo `tipo` com dropdown: representante_legal, preposto, tecnico
2. Botao Editar (modal com pre-preenchimento dos dados)
3. Constraint: pelo menos 1 representante_legal por empresa

---

# 2. PORTFOLIOPAGE

## 2.1 COMO ESTA

**Arquivo:** `frontend/src/pages/PortfolioPage.tsx` (1020 linhas)

### Interface Atual

A pagina tem 4 abas:

**Aba 1 — Meus Produtos** (tabela)
- FilterBar com busca por texto + filtro por Classe (dropdown CATEGORIAS_FILTER: 10 opcoes)
- DataTable com colunas: Produto, Fabricante, Modelo, Classe, NCM, Completude (ScoreBar), Acoes
- Completude calculada: `especificacoes preenchidas / total especificacoes * 100` (L376-380)
- Acoes: Visualizar, Reprocessar IA, Verificar Completude, Excluir — todos via `onSendToChat(msg)`
- Ao clicar: Card de detalhes com info-grid (Nome, Fabricante, Modelo, Classe, NCM, Preco Referencia, Descricao) + tabela de especificacoes tecnicas com badge "IA"
- **Dados reais do backend:** `getProdutos()` e `getProduto(id)` via `/api/produtos`

**Aba 2 — Uploads** (grid de 6 tipos)
- Grid com 6 cards de upload: Manuais, Instrucoes de Uso, NFS, Plano de Contas, Folders, Website
- Cada card expande ao clicar: campo de arquivo + nome opcional + botao "Processar com IA"
- Website: campo de URL em vez de file input
- Processamento: envia mensagem ao chat via `onSendToChat(prompt, file)` → IA extrai e cadastra
- Card informativo "Deixe a IA trabalhar por voce" com flow visual (Manual.pdf → IA Extrai → Produto Cadastrado)

**Aba 3 — Cadastro Manual** (formulario)
- Formulario: Nome, Classe (dropdown vinculado a Parametrizacoes ou fallback CLASSES_PRODUTO), Subclasse, NCM, Fabricante, Modelo
- Specs dinamicas por classe: muda os campos conforme a classe selecionada
- Se backend tem `classes-produtos`, usa `campos_mascara` da classe. Senao, usa SPECS_POR_CLASSE hardcoded (4 classes: equipamento, reagente, insumo_hospitalar, informatica)
- Botao "Cadastrar via IA" → `onSendToChat(msg)` com todos os campos
- **FUNCIONAL:** Integra com classes do backend quando existem, fallback local quando nao

**Aba 4 — Classificacao** (arvore read-only)
- Arvore hierarquica: Classe → Subclasses, com contagem de produtos por classe
- Se backend tem classes, mostra do backend. Senao, mostra CLASSES_PRODUTO hardcoded (4 classes, 9 subclasses)
- **READ-ONLY** — nao tem CRUD, so visualizacao
- **DUPLICATA FUNCIONAL:** Mesma informacao que Parametrizacoes > aba Produtos (mas la tem CRUD)
- Card "Funil de Monitoramento" — **ZERO IMPLEMENTADO, 100% DECORATIVO:**
  - Titulo: "Do ruido de milhares de editais a clareza das oportunidades certas" (L917)
  - Subtitulo: "O Agente Autonomo que Monitora o Mercado por Voce" (L919)
  - 3 etapas visuais estaticas: Monitoramento Continuo → Filtro Inteligente → Classificacao Automatica
  - "Filtro Inteligente": 4 tags HARDCODED (Comodato de equipamentos, Alugueis, Venda, Consumo) — deveria vir das classes de Parametrizacoes (L941-945)
  - "Classificacao Automatica": texto estatico, sem dados reais (L956-957)
  - Badge `StatusBadge status="success" label="Agente Ativo"` — **FAKE** (sempre verde, L963)
  - "Ultima verificacao: {new Date().toLocaleDateString()} 06:00" — **FAKE** (sempre "hoje 06:00", L964)
  - **NENHUMA chamada de API, NENHUM state, NENHUM dado real** — secao inteira e marketing visual

### Modals
- Modal ANVISA: busca por registro ou nome do produto via `onSendToChat`
- Modal Busca Web: busca por nome + fabricante via `onSendToChat`

### Funcoes Implementadas
- `fetchProdutos()` → `getProdutos(categoria)` (API real)
- `handleSelectProduto()` → `getProduto(id)` (API real, specs completas)
- `handleUploadConfirm()` → `onSendToChat(prompt, file)`
- `handleCadastroSubmit()` → `onSendToChat(msg)` com dados do form
- `handleReprocessar()` → `onSendToChat("Reprocesse...")`
- `handleExcluir()` → `onSendToChat("Exclua...")`
- `handleAnvisaConfirm()` → `onSendToChat("Busque ANVISA...")`
- `handleBuscaWebConfirm()` → `onSendToChat("Busque manual na web...")`

### Requisitos Contidos
| RF | Descricao | Status |
|----|-----------|--------|
| RF-006 | Fontes de Obtencao | **OK** — 6 tipos de upload (manual, instrucoes, NFS, plano contas, folders, website) + ANVISA + busca web |
| RF-007 | Registros ANVISA | **OK** — Modal funcional via onSendToChat, busca por registro ou nome |
| RF-008 | Cadastro Manual | **OK** — Formulario com classe, subclasse, NCM, specs dinamicas |
| RF-009 | Mascara Parametrizavel | **PARCIAL** — Funciona para 4 classes hardcoded (SPECS_POR_CLASSE). Quando backend tem `campos_mascara`, usa. Mas nao tem interface para DEFINIR novos campos por classe na propria pagina |
| RF-010 | IA Le Manuais | **OK** — Upload de manual → onSendToChat → IA extrai specs. Badge "IA" nas especificacoes |
| RF-011 | Funil Monitoramento | **NAO** — Secao inteira e 100% decorativa/marketing: 3 steps estaticos, 4 categorias hardcoded, "Agente Ativo" fake sempre verde, "Ultima verificacao" fake, ZERO chamadas de API, ZERO dados reais |
| RF-012 | NCM | **OK** — Campo NCM no cadastro, vinculado a classe/subclasse, busca por NCM no Captacao |

---

## 2.2 COMO DEVE SER

### RF-006: Fontes de Obtencao
**O que falta:**
1. Fonte "Editais anteriores" — extrair specs de editais que o cliente ja participou (nao implementada)
2. Fonte "Acesso ao ERP" — integracao direta com plano de contas (hoje so upload de planilha)
3. Fonte "Redes Sociais" — crawl de Instagram/LinkedIn (nao implementada)
4. Indicacao visual da FONTE de cada dado (IA/Manual/Upload/ANVISA/ERP) — hoje so tem badge "IA" generico

### RF-007: Registros ANVISA
**O que falta:** Nada significativo — funcional via chat.

### RF-008: Cadastro Manual
**O que falta:** Nada significativo — formulario completo.

### RF-009: Mascara Parametrizavel
**O que falta:**
1. SPECS_POR_CLASSE tem apenas 4 categorias. Workflow menciona 9+: equipamento, reagente, insumo_hospitalar, insumo_laboratorial, informatica, redes, mobiliario, eletronico, comodato
2. Interface para o usuario DEFINIR novos campos por classe (hoje so consome o que existe)
3. Campos com tipos definidos (texto, numero, selecao, booleano) — hoje tudo e TextInput

### RF-010: IA Le Manuais
**O que falta:**
1. IA pode sugerir NOVOS campos que nao existem na mascara (hoje so preenche os existentes)
2. Indicador visual "preenchido pela IA" vs "preenchido manualmente" por campo (hoje so na tabela de specs)
3. Usuario pode aceitar/rejeitar/editar cada sugestao individualmente (hoje nao tem esse workflow)

### RF-011: Funil de Monitoramento — ZERO IMPLEMENTADO
**Status real: secao inteira e decorativa, NADA conectado a dados reais.**

**O que falta (TUDO):**
1. **"Agente Ativo"** deve refletir status real dos monitoramentos via `crudList("monitoramentos")` — se existe algum ativo=verde, nenhum=cinza, pausados=amarelo
2. **"Ultima verificacao"** deve mostrar data real do ultimo check dos monitoramentos (hoje sempre mostra "hoje 06:00" via `new Date()`)
3. **"Filtro Inteligente"** categorias devem vir das classes cadastradas em Parametrizacoes (`crudList("classes-produtos")`) — hoje sao 4 tags hardcoded
4. **"Classificacao Automatica"** deve mostrar quantos editais foram classificados por categoria — hoje e texto estatico
5. **Contagem de editais** por etapa do funil (encontrados → filtrados → classificados) deve ser calculada dos dados reais
6. Linkar com dados do card de Monitoramento da CaptacaoPage

### RF-012: NCM
**O que falta:** Nada significativo.

### Aba Classificacao — PROBLEMAS
**A aba Classificacao do Portfolio deve ser REMOVIDA ou transformada em read-only de referencia.** Ela duplica a funcionalidade de Parametrizacoes > Produtos. O CRUD de classes/subclasses deve ser EXCLUSIVO de Parametrizacoes. Portfolio deve consumir.

---

# 3. PARAMETRIZACOESPAGE

## 3.1 COMO ESTA

**Arquivo:** `frontend/src/pages/ParametrizacoesPage.tsx` (1235 linhas)

### Interface Atual

A pagina tem 5 abas:

**Aba 1 — Produtos**
- Card "Estrutura de Classificacao": Arvore hierarquica de classes/subclasses
  - CRUD funcional: Nova Classe (modal), Editar Classe, Excluir Classe, Nova Subclasse (modal), Excluir Subclasse
  - Cada classe: nome, NCMs, contagem de subclasses e produtos
  - Botao "Gerar com IA" — DESABILITADO (Lock, "Onda 4")
  - **Dados reais:** `crudList("classes-produtos")`, `crudCreate`, `crudUpdate`, `crudDelete`
- Card "Tipos de Edital Desejados": 6 checkboxes (comodato, venda, aluguel, consumo, insumosLab, insumosHosp)
  - Botao "Salvar Tipos" → `saveParamScore({ tipos_edital: [...] })` — **FUNCIONAL**
- Card "Norteadores de Score": 6 cards (a-f) com icone, titulo, badge, status
  - (a) Classificacao → verde se classes > 0
  - (b) Score Comercial → verde se estados > 0
  - (c) Tipos de Edital → verde se tipos > 0
  - (d) Score Tecnico → sempre verde (dados do Portfolio)
  - (e) Score Participacao → amarelo ("Em configuracao")
  - (f) Score Aderencia de Ganho → cinza ("A definir"), com campos: Taxa Vitoria, Margem Media, Total Licitacoes
  - Botao "Calcular pesos com IA" — DESABILITADO (Lock, "Onda 4")
- Card "Fontes Documentais Exigidas por Editais": 10 checkboxes HARDCODED com status Temos/Nao temos — **MOCK** (L827-851: `checked={true}`, `onChange={() => {}}`)

**Aba 2 — Comercial**
- Card "Regiao de Atuacao": Grid 27 estados + checkbox "Todo Brasil"
  - Botao "Salvar Estados" → `saveParamScore({ estados_atuacao: [...] })` — **FUNCIONAL**
- Card "Tempo de Entrega": Prazo maximo (numero) + Frequencia maxima (dropdown: diaria/semanal/quinzenal/mensal)
  - Botao "Salvar Prazo/Frequencia" → `saveParamScore(...)` — **FUNCIONAL**
- Card "Mercado (TAM/SAM/SOM)": 3 campos monetarios
  - Botao "Salvar Mercado" → `saveParamScore(...)` — **FUNCIONAL**
  - Botao "Calcular com IA" — DESABILITADO (Lock, "Onda 4")

**Aba 3 — Fontes de Busca**
- DataTable de fontes: Nome, Tipo (API/Scraper), URL, Status (Ativa/Inativa), Acoes (Pausar/Ativar, Excluir)
  - CRUD funcional: `crudList/Create/Update/Delete("fontes-editais")`
  - Modal para cadastrar nova fonte
- Card "Palavras-chave de Busca": Tags com botao Editar → salva como CSV em `parametros-score.palavras_chave`
  - Botao "Gerar do portfolio" — DESABILITADO (Lock, "Onda 4")
- Card "NCMs para Busca": Tags com botao Adicionar → salva em `parametros-score.ncms_busca`
  - Botao "Sincronizar NCMs" — DESABILITADO (Lock, "Onda 4")

**Aba 4 — Notificacoes**
- Email, canais (email/sistema/SMS), frequencia do resumo
- **BUG:** Botao "Salvar" → `onClick={() => {}}` — NAO SALVA NADA (L1087)

**Aba 5 — Preferencias**
- Tema (escuro/claro), idioma, fuso horario
- **BUG:** Botao "Salvar" → `onClick={() => {}}` — NAO SALVA NADA (L1141)

### Funcoes Implementadas
- `loadFontes()` → `crudList("fontes-editais")`
- `loadParametros()` → `crudList("parametros-score")`
- `loadClasses()` → `crudList("classes-produtos")` com hierarquia pai/filho
- `loadParamScore()` → `crudList("parametros-score")` → popula estados, prazo, frequencia, TAM/SAM/SOM, tipos
- `ensureParamScore()` → cria registro se nao existe
- `saveParamScore(data)` → `crudUpdate("parametros-score", id, data)`
- `handleSalvarClasse/Subclasse()` → `crudCreate/Update("classes-produtos")`
- `handleEditarClasse()` → pre-preenche modal
- `handleExcluirClasse/Subclasse()` → `crudDelete` (com cascade manual para subclasses)
- `handleSalvarPalavrasChave/NcmsBusca()` → salva em parametros-score
- Handlers CRUD de fontes: criar, toggle (ativa/inativa), excluir

### Requisitos Contidos
| RF | Descricao | Status |
|----|-----------|--------|
| RF-013 | Classificacao/Agrupamento | **OK** — Arvore classes/subclasses com NCMs, CRUD completo |
| RF-014 | Fontes de Busca | **OK** — CRUD de fontes, palavras-chave, NCMs de busca |
| RF-015 | Estrutura de Classificacao | **OK** — Aba Produtos com CRUD de classes/subclasses/NCMs |
| RF-016 | Comerciais (Regiao/Tempo) | **OK** — 27 estados, prazo maximo, frequencia, TAM/SAM/SOM |
| RF-017 | Tipos de Edital | **OK** — 6 checkboxes persistidos |
| RF-018 | Norteadores de Score | **OK** — 6 cards visuais com status de configuracao |

---

## 3.2 COMO DEVE SER

### RF-013: Classificacao/Agrupamento
**O que falta:**
1. IA pode gerar agrupamentos automaticamente a partir dos produtos cadastrados — botao existe mas esta desabilitado
2. Interface de Campos de Mascara por classe — nao tem como definir quais specs cada classe exige (hoje so no banco direto)

### RF-014: Fontes de Busca
**O que falta:**
1. Opcao "Gerar automaticamente do portfolio" para palavras-chave e NCMs — botao existe mas desabilitado

### RF-015: Estrutura de Classificacao
**O que falta:**
1. Editar Subclasse — botao Pencil existe (L672) mas nao tem handler conectado

### RF-016: Comerciais
**O que falta:**
1. Indicacao visual de que configs alimentam o Score Comercial — parcialmente presente via badges "Score Comercial"
2. "Calcular com IA baseado no portfolio" para TAM/SAM/SOM — botao existe mas desabilitado

### RF-017: Tipos de Edital
**O que falta:** Nada significativo.

### RF-018: Norteadores de Score
**O que falta:**
1. Click em cada norteador navegar para a secao de configuracao correspondente — nao implementado (cards sao informativos, nao clicaveis como links)

### Bugs a Corrigir
1. Notificacoes: Botao "Salvar" nao faz nada (L1087)
2. Preferencias: Botao "Salvar" nao faz nada (L1141)
3. "Fontes Documentais Exigidas" e 100% MOCK/hardcoded (L827-851): checkboxes sempre `checked={true}`, `onChange={() => {}}`, dados estaticos
4. Editar Subclasse: botao sem handler

---

# 4. CAPTACAOPAGE

## 4.1 COMO ESTA

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx` (1159 linhas)

### Interface Atual

**Secao 1 — Cards de Prazo** (StatCards)
- 4 StatCards: Proximos 2 dias, 5 dias, 10 dias, 20 dias
- Cores: vermelho, laranja, amarelo, azul
- Valores calculados dos resultados da busca (nao dos editais salvos)
- **FUNCIONAL** — atende RF-022

**Secao 2 — Busca de Editais** (Card com form)
- Linha 1: Termo/palavra-chave, UF (27 + Todas), Fonte (PNCP/ComprasNET/BEC/SICONV/Todas), Botao Buscar
- Linha 2: Classificacao Tipo (Todos/Reagentes/Equipamentos/Comodato/Aluguel/Oferta Preco = 5 opcoes), Classificacao Origem (Todos + 8 opcoes), NCM
- Checkboxes: "Calcular score de aderencia" + "Incluir editais encerrados"
- Busca real via `GET /api/editais/buscar?termo=...&calcularScore=...&uf=...&fontes=...`
- Filtros tipo/origem sao client-side (pos-fetch)

**Secao 3 — Resultados** (DataTable + Painel Lateral)
- Tabela com checkbox de selecao, colunas: Numero, Orgao, UF, Objeto, Valor, Produto Correspondente, Prazo (StatusBadge), Score (ScoreCircle com tooltip de gaps), Acoes (Ver/Salvar)
- Linhas coloridas por faixa de score (row-score-high/medium/low)
- Botoes superiores: Salvar Todos, Salvar Score >= 70%, Exportar CSV
- Barra de selecao: "X edital(is) selecionado(s)" + "Salvar Selecionados"

**Painel Lateral** (ao clicar em edital)
- Score principal (ScoreCircle grande)
- 3 sub-scores: Tecnico (circulo), Comercial (circulo), Recomendacao (estrelas)
- **BUG:** `scores.comercial = score` (L136-138) — score comercial e copia do tecnico, nao e calculado separadamente
- Produto correspondente (da lista `produtos_aderentes` do backend)
- Potencial de Ganho (badge: Elevado/Medio/Baixo, calculado do score)
- Intencao Estrategica: 4 radio buttons (Estrategico/Defensivo/Acompanhamento/Aprendizado)
- Expectativa de Margem: slider 0-50% + botoes "Varia por Produto" e "Varia por Regiao"
- Analise de Gaps: 6 dimensoes de score via `POST /api/editais/{id}/scores-validacao`, com decisao GO/NO-GO, pontos positivos e de atencao
- Info adicional: Valor, Abertura, Tipo, Origem
- Botoes: Salvar Estrategia, Salvar Edital, Ir para Validacao, Abrir no Portal

**Secao 4 — Monitoramento Automatico** (Card)
- Lista de monitoramentos via `crudList("monitoramentos")`
- Cada monitoramento: termo, UFs, status (ativo/inativo), editais encontrados, ultimo check
- Configuracao via chat (texto: "Monitore editais de...")
- Botao "Atualizar"

### Funcoes Implementadas
- `handleBuscar()` → `GET /api/editais/buscar?...` (API real PNCP)
- `normalizarEditalDaBusca()` → converte response para interface EditalBusca
- `salvarEditalNoBanco()` → `crudCreate("editais", ...)` — salva no MySQL
- `handleSalvarEdital/Todos/Recomendados/Selecionados()`
- `handleSalvarEstrategia()` → `crudCreate/Update("estrategias-editais", ...)` — persiste intencao + margem
- `handleIrParaValidacao()` → `window.dispatchEvent(new CustomEvent("navigate-to", ...))`
- `fetchScoresValidacao()` → `POST /api/editais/{id}/scores-validacao`
- `handleExportarCSV()` → gera CSV no browser
- `carregarMonitoramentos()` → `crudList("monitoramentos")`

### Requisitos Contidos
| RF | Descricao | Status |
|----|-----------|--------|
| RF-019 | Painel de Oportunidades | **OK** — Tabela com score, produto correspondente, cores por faixa |
| RF-020 | Painel Lateral de Analise | **PARCIAL** — Score geral + 3 sub-scores + potencial. Falta: score de aderencia geral separado do tecnico |
| RF-021 | Filtros e Classificacao | **PARCIAL** — Tipo tem 5 opcoes (workflow pede 5 — OK). Origem tem 8 opcoes (workflow pede 12+). Busca por NCM existe. Faltam: jornais eletronicos, sistemas de prefeitura como fontes |
| RF-022 | Datas de Submissao | **OK** — 4 faixas (2/5/10/20 dias) com cores |
| RF-023 | Intencao Estrategica e Margem | **OK** — 4 opcoes de intencao, slider de margem, "Varia por Produto/Regiao", persistencia via estrategia-editais |
| RF-024 | Analise de Gaps | **PARCIAL** — Tooltip no score mostra gaps mas `gaps` e sempre `[]` nos resultados da busca (L147). Gaps reais so aparecem via scores-validacao no painel |
| RF-025 | Monitoramento 24/7 | **PARCIAL** — Card mostra monitoramentos existentes. Nao tem interface para criar/editar/pausar (so via chat). Nao mostra "status ativo/pausado" do agente geral |

---

## 4.2 COMO DEVE SER

### RF-019: Painel de Oportunidades
**O que falta:** Nada critico. Tabela funcional com dados reais.

### RF-020: Painel Lateral de Analise
**O que falta:**
1. **CORRIGIR BUG:** `score_comercial = score` (L136-138) — score comercial deve vir separado do backend ou ser calculado
2. Score de Aderencia Geral separado (consolidado dos 3 sub-scores, nao igual ao tecnico)
3. Potencial de Ganho deve considerar intencao estrategica (workflow: "Isso muda completamente a leitura do score")

### RF-021: Filtros e Classificacao
**O que falta:**
1. Origem precisa de mais 4 opcoes: Centros de Pesquisas, Campanhas Governamentais, Fundacoes de Pesquisa, Fundacoes diversas (total: 12)
2. Fontes adicionais: Jornais eletronicos, Sistemas de prefeitura
3. IA le o edital inteiro buscando keywords (busca por OBJETO, nao so titulo) — depende do backend

### RF-022: Datas de Submissao
**O que falta:** Nada — implementado.

### RF-023: Intencao Estrategica e Margem
**O que falta:**
1. A intencao deve INFLUENCIAR a interpretacao do score (score baixo + "Estrategico" = GO). Hoje salva mas nao muda nada

### RF-024: Analise de Gaps
**O que falta:**
1. **CORRIGIR:** Gaps devem vir da busca (hoje `gaps: []` sempre). Ou preencher via calculo local comparando portfolio vs requisitos do edital

### RF-025: Monitoramento 24/7
**O que falta:**
1. Interface visual para CRIAR monitoramento (hoje so via chat)
2. Interface para EDITAR/PAUSAR/EXCLUIR monitoramento
3. Configuracao de periodicidade e fontes monitoradas
4. Notificacoes de novos editais (badge com count)

---

# 5. VALIDACAOPAGE

## 5.1 COMO ESTA

**Arquivo:** `frontend/src/pages/ValidacaoPage.tsx` (1315 linhas)

### Interface Atual

**Secao 1 — Tabela de Editais** (Card + DataTable)
- Carrega editais salvos via `GET /api/editais/salvos?com_score=true&com_estrategia=true`
- Colunas: Numero, Orgao, UF, Objeto, Valor, Abertura, Status (Novo/Analisando/Validado/Descartado), Score (ScoreCircle)
- FilterBar: busca por texto + filtro por status
- Selecao por URL param (`?edital_id=...`)

**Secao 2 — Top Bar: Sinais de Mercado + Decisao** (barra horizontal)
- Badges de sinais de mercado: alertas coloridos baseados em `sinaisMercado[]` e `fatalFlaws[]`
- 3 botoes de decisao: Participar (verde), Acompanhar (azul), Ignorar (cinza)
- Badge "Decisao salva" quando persistida

**Secao 3 — Justificativa** (Card condicional)
- Aparece ao clicar em Participar/Acompanhar/Ignorar
- Dropdown de motivo (8 opcoes: preco_competitivo, portfolio_aderente, margem_insuficiente, etc.)
- Textarea para justificativa livre
- Persiste via `crudCreate/Update("validacao_decisoes", ...)`
- Texto: "A justificativa e o combustivel para a inteligencia futura"

**Secao 4 — Split Layout: Info + Score Dashboard**
- Esquerda: Card com info do edital (numero, orgao, objeto, valor, data, produto correspondente, status editavel)
- Direita: Score Dashboard
  - ScoreCircle grande (score geral)
  - Badge GO/NO-GO/CONDICIONAL da IA (quando calculado)
  - Potencial de Ganho (badge)
  - 6 barras de score (tecnico, documental, complexidade, juridico, logistico, comercial) com ScoreBar + nivel
  - Intencao Estrategica (4 radio buttons, persiste via crudUpdate)
  - Expectativa de Margem (slider 0-50% + labels "Varia por Produto/Regiao")
  - Botao "Calcular Scores IA" → `POST /api/editais/{id}/scores-validacao`

**Secao 5 — 3 Abas** (TabPanel)

**Aba Objetiva:**
- Banner GO/NO-GO/CONDICIONAL (quando calculado)
- Aderencia Tecnica Detalhada: sub-scores do endpoint (ou fallback tecnico+documental)
- Botao "Calcular Scores" quando nao tem dados
- Certificacoes: lista com StatusBadge (OK/Pendente/Vencida)
- Checklist Documental: tabela (Documento, Status, Validade) com mini-table
- Mapa Logistico: UF edital → Empresa (SP hardcoded), distancia e dias estimados baseado no score logistico
- Analise de Lote: barra horizontal segmentada (aderente=verde, intruso=amarelo) com legenda

**Aba Analitica:**
- Pipeline de Riscos: Modalidade (badges), Flags Juridicos (badges)
- Fatal Flaws: card vermelho quando ha problemas criticos
- Reputacao do Orgao: 3 campos (Pregoeiro, Pagamento, Historico) — V4: dados reais calculados do historico de editais do mesmo orgao
- Alerta de Recorrencia: aparece quando >= 2 editais semelhantes foram perdidos
- Aderencia Trecho-a-Trecho: tabela 3 colunas (Trecho Edital, Aderencia%, Trecho Portfolio)

**Aba Cognitiva:**
- Resumo IA: gerado via `POST /api/chat` com dados do edital. Botao Gerar/Regerar
- Historico Semelhante: V3 — busca editais do mesmo orgao via `crudList("editais")`, mostra decisoes passadas
- Pergunte a IA: input livre + botao → `POST /api/chat` com contexto do edital

**Secao 6 — Processo Amanda** (Card)
- 3 pastas coloridas: Documentos da Empresa (azul), Certidoes e Fiscal (amarelo), Qualificacao Tecnica (verde)
- Documentos carregados via `GET /api/editais/{id}/documentacao-necessaria`
- Cada documento: nome, badge "Exigido", status (Disponivel/Vencido/Faltante), validade
- Mensagem de fallback: "Configure documentos da empresa na aba Empresa"

### Funcoes Implementadas
- `loadEditaisSalvos()` → `GET /api/editais/salvos?com_score=true&com_estrategia=true`
- `calcularScoresValidacao()` → `POST /api/editais/{id}/scores-validacao`
- `handleResumirEdital()` → `POST /api/chat` com contexto do edital
- `handlePerguntarEdital()` → `POST /api/chat` com pergunta livre
- `handleDecisao()` → muda status + abre justificativa
- `handleSalvarJustificativa()` → `crudCreate/Update("validacao_decisoes")`
- `handleIntencaoChange()` → atualiza estado + persiste se ja tem decisaoId
- `handleCalcularScores()` → POST scores-validacao, popula 6 dimensoes + sub-scores + GO/NO-GO
- Carregamento de docs necessarios, historico real, reputacao do orgao — todos via APIs reais

### Requisitos Contidos
| RF | Descricao | Status |
|----|-----------|--------|
| RF-026 | Sinais de Mercado | **OK** — Badges coloridas no topo com dados do backend |
| RF-027 | Decisao (Participar/Acompanhar/Ignorar) | **OK** — 3 botoes + justificativa com motivo dropdown + texto livre + persistencia |
| RF-028 | Score Dashboard 6D | **OK** — ScoreCircle grande + 6 barras com nivel High/Medium/Low |
| RF-029 | 3 Abas (Objetiva/Analitica/Cognitiva) | **OK** — Todas implementadas com dados reais |
| RF-030 | Aderencia Trecho-a-Trecho | **OK** — Tabela na aba Analitica com dados do endpoint |
| RF-031 | Analise de Lote | **OK** — Barra horizontal segmentada com aderente/intruso |
| RF-032 | Pipeline de Riscos | **PARCIAL** — Modalidade e Flags existem. Falta: Checklist Documental como secao separada no pipeline, sugestao de contorno por flag |
| RF-033 | Reputacao do Orgao | **OK** — Card com 3 itens, dados calculados do historico real (V4) |
| RF-034 | Alerta de Recorrencia | **OK** — Alerta vermelho quando >= 2 perdas semelhantes |
| RF-035 | Aderencias/Riscos por Dimensao | **PARCIAL** — 6 dimensoes de score existem. Falta classificacao "Impeditivo" vs "Ponto de Atencao" por item |
| RF-036 | Processo Amanda | **OK** — 3 pastas coloridas com documentos reais do endpoint |
| RF-037 | GO/NO-GO | **OK** — Botao "Calcular Scores IA", recomendacao GO/NO-GO/CONDICIONAL, dados fluem para decisao |

---

## 5.2 COMO DEVE SER

### RF-026 a RF-031: Validacao Principal
**O que falta:**
1. Mapa Logistico: "SP" hardcoded (L720) — deve vir do cadastro da empresa (RF-001 UF)

### RF-032: Pipeline de Riscos
**O que falta:**
1. 3 secoes empilhadas: Modalidade, Checklist, Flags — hoje Checklist Documental esta na aba Objetiva separado do Pipeline (aba Analitica)
2. Para cada flag, IA sugere como contornar — nao implementado

### RF-035: Aderencias/Riscos por Dimensao
**O que falta:**
1. Classificacao binaria: "Impeditivo" vs "Ponto de Atencao" para cada dimensao
2. 6 dimensoes: (a) Tecnica/Portfolio, (b) Documental, (c) Juridicos, (d) Logistica, (e) Comerciais, (f) Tipo de empresa
3. Hoje: as 6 dimensoes existem como barras de score, mas sem a classificacao impeditivo/atencao
4. Dimensao (f) "Tipo de empresa" (micro, lucro presumido, etc.) nao existe

### Bugs a Corrigir
1. Mapa Logistico: UF da empresa hardcoded "SP" (L720) — deve vir do backend

---

# 6. RESUMO QUANTITATIVO

## Por Pagina

| Pagina | RFs Cobertos | Total RFs | % Cobertura | OK | PARCIAL | NAO |
|--------|-------------|-----------|-------------|----|---------|----|
| EmpresaPage | RF-001 a RF-005 | 5 | 20% | 1 | 2 | 2 |
| PortfolioPage | RF-006 a RF-012 | 7 | 57% | 4 | 2 | 1 |
| ParametrizacoesPage | RF-013 a RF-018 | 6 | 100% | 6 | 0 | 0 |
| CaptacaoPage | RF-019 a RF-025 | 7 | 57% | 3 | 4 | 0 |
| ValidacaoPage | RF-026 a RF-037 | 12 | 83% | 9 | 3 | 0 |

## Todos os RFs de Fundacao + Captacao + Validacao

| Status | Quantidade | % |
|--------|-----------|---|
| **OK** | 23 | 62% |
| **PARCIAL** | 11 | 30% |
| **NAO** | 3 | 8% |
| **TOTAL** | 37 | 100% |

## Bugs Criticos Identificados

| # | Pagina | Bug | Impacto |
|---|--------|-----|---------|
| 1 | EmpresaPage | Certidoes ZERO implementado: campo `certidao` vs `tipo` mismatch, enum mismatch, botao desabilitado, acoes sem handler, sem pre-populacao, sem endpoint de busca | Secao inteira decorativa, NADA funciona |
| 2 | EmpresaPage | (Englobado no #1 acima) | — |
| 3 | CaptacaoPage | `score_comercial = score` (L136-138) | Score comercial e copia do tecnico |
| 4 | CaptacaoPage | `gaps: []` sempre nos resultados da busca | Tooltip sempre mostra "Todos atendidos" |
| 5 | ParametrizacoesPage | Notificacoes Salvar → `onClick={() => {}}` | Nao salva nada |
| 6 | ParametrizacoesPage | Preferencias Salvar → `onClick={() => {}}` | Nao salva nada |
| 7 | ParametrizacoesPage | Fontes Documentais 100% MOCK hardcoded | Dados falsos |
| 8 | ParametrizacoesPage | Editar Subclasse sem handler | Botao nao funciona |
| 9 | ValidacaoPage | Mapa Logistico: empresa UF "SP" hardcoded | Sempre mostra SP |
| 10 | PortfolioPage | Funil de Monitoramento 100% decorativo: "Agente Ativo" fake, "Ultima verificacao" fake, categorias hardcoded, ZERO dados reais | Secao inteira e marketing visual sem funcionalidade |

---

# 7. PLANEJAMENTO PARA TORNAR ADERENTE

**ESTIMATIVAS: Agent Teams (Claude Code executando), NAO dev humano.**

## Sprint 2A — Bugs Criticos (~2-3 horas, 1 sessao)

### T-2A-01: Corrigir mapeamento basico de Certidoes na EmpresaPage
**Arquivos:** `EmpresaPage.tsx`
**Tarefas:**
1. Mapear `certidao` para `c.tipo` no loadSubTables (L157) — usar label map (cnd_federal→"CND Federal", etc.)
2. Alinhar enums: mudar interface para `valida/vencida/pendente`, adaptar getCertidaoStatus com labels corretos
3. Nota: isso so corrige a EXIBICAO. A funcionalidade completa (pre-populacao, busca, acoes) esta em T-2B-02

### T-2A-02: Corrigir Score Comercial na CaptacaoPage
**Arquivos:** `CaptacaoPage.tsx`
**Tarefas:**
1. Em `normalizarEditalDaBusca` (L135-138): se backend nao retorna score_comercial separado, calcular baseado em UF vs estados de atuacao
2. Score comercial = 100 se UF do edital esta nos estados selecionados, 50 se adjacente, 0 se fora

### T-2A-03: Corrigir Gaps na CaptacaoPage
**Arquivos:** `CaptacaoPage.tsx`
**Tarefas:**
1. Em `normalizarEditalDaBusca`: extrair gaps de `e.analise_gaps` ou `e.gaps` se backend retornar
2. Alternativa: calcular gaps localmente comparando `e.requisitos` vs produtos do portfolio

### T-2A-04: Corrigir Botoes de Salvar na ParametrizacoesPage
**Arquivos:** `ParametrizacoesPage.tsx`
**Tarefas:**
1. Notificacoes (L1087): implementar handler real ou pelo menos mostrar toast "Em breve"
2. Preferencias (L1141): idem
3. Fontes Documentais (L827-851): conectar com dados reais da empresa ou pelo menos marcar como "Configurar na aba Empresa"

### T-2A-05: Corrigir Mapa Logistico na ValidacaoPage
**Arquivos:** `ValidacaoPage.tsx`
**Tarefas:**
1. Buscar UF da empresa via API ou props (em vez de "SP" hardcoded na L720)
2. Calcular distancia real entre UFs

### T-2A-06: Corrigir Editar Subclasse na ParametrizacoesPage
**Arquivos:** `ParametrizacoesPage.tsx`
**Tarefas:**
1. Adicionar handler para botao Editar subclasse (L672) — abrir modal pre-preenchido

### T-2A-07: Corrigir Agente Ativo Fake no Portfolio
**Arquivos:** `PortfolioPage.tsx`
**Tarefas:**
1. Badge "Agente Ativo" (L963) deve refletir status real dos monitoramentos via `crudList("monitoramentos")`
2. Se nenhum monitoramento ativo: "Agente Inativo"

---

## Sprint 2B — Funcionalidades Parciais (~4-6 horas, 2 sessoes)

### T-2B-01: RF-002 — Status de Documentos com Vencimento
**Arquivos:** `EmpresaPage.tsx`
**Tarefas:**
1. Calcular status automaticamente: se tem arquivo + validade > 30 dias = "ok", validade <= 30 dias = "vence", sem arquivo = "falta"
2. Indicadores visuais: verde, amarelo, vermelho
3. Adicionar campo `data_emissao` no modal de upload

### T-2B-02: RF-003 — Certidoes Automaticas (IMPLEMENTAR DO ZERO)
**Arquivos:** `EmpresaPage.tsx`, backend (endpoint)
**Tarefas:**
1. **CORRIGIR campo:** Mapear `certidao` → `c.tipo` no loadSubTables (L157). Criar label map: cnd_federal→"CND Federal", etc.
2. **CORRIGIR enum:** Mudar frontend para usar `valida/vencida/pendente` (mesmo enum do backend)
3. **Pre-popular 5 certidoes:** Ao carregar empresa sem certidoes, criar 5 registros `pendente` via crudCreate (CND Federal, Estadual, Municipal, FGTS, Trabalhista)
4. **Acoes reais:** Conectar botoes Visualizar (abrir PDF), Download (baixar arquivo), RefreshCw (re-consultar) a handlers
5. **Habilitar botao "Buscar Certidoes":** Remover Lock/disabled, chamar onSendToChat("Busque certidoes automaticas para a empresa [CNPJ]") ou endpoint dedicado
6. **Alertas de vencimento:** StatusBadge amarelo se validade < 30 dias, vermelho se vencida

### T-2B-03: RF-005 — Responsaveis com Tipo e Edicao
**Arquivos:** `EmpresaPage.tsx`
**Tarefas:**
1. Adicionar dropdown `tipo` (representante_legal/preposto/tecnico) no modal
2. Adicionar botao Editar com modal pre-preenchido
3. Validacao: pelo menos 1 representante_legal

### T-2B-04: RF-009 — SPECS_POR_CLASSE Completo
**Arquivos:** `PortfolioPage.tsx`
**Tarefas:**
1. Adicionar 5 categorias faltantes: insumo_laboratorial, redes, mobiliario, eletronico, comodato
2. Preferir usar `campos_mascara` do backend quando existir

### T-2B-05: RF-011 — Funil Real
**Arquivos:** `PortfolioPage.tsx`
**Tarefas:**
1. Substituir badge fake "Agente Ativo" por status real dos monitoramentos
2. Mostrar contagem de editais por categoria dos dados reais

### T-2B-06: RF-020 — Score Comercial Separado
**Arquivos:** `CaptacaoPage.tsx`, possivelmente backend
**Tarefas:**
1. Backend deve retornar `score_comercial` separado no endpoint /buscar
2. Frontend usa valor separado em vez de copiar o tecnico

### T-2B-07: RF-021 — Filtros Completos
**Arquivos:** `CaptacaoPage.tsx`
**Tarefas:**
1. Adicionar 4 opcoes faltantes no filtro Origem: Centros de Pesquisas, Campanhas Governamentais, Fundacoes de Pesquisa, Fundacoes diversas
2. Fontes adicionais: Jornais eletronicos, Sistemas de prefeitura

### T-2B-08: RF-025 — Monitoramento CRUD Visual
**Arquivos:** `CaptacaoPage.tsx`
**Tarefas:**
1. Modal para criar monitoramento: termo, UFs, fonte, frequencia
2. Botoes: Pausar, Ativar, Excluir por monitoramento
3. Badge de status do agente geral

### T-2B-09: RF-032 — Pipeline de Riscos Completo
**Arquivos:** `ValidacaoPage.tsx`
**Tarefas:**
1. Mover Checklist Documental para dentro do Pipeline de Riscos na aba Analitica
2. Para cada flag, adicionar sugestao de contorno da IA

### T-2B-10: RF-035 — Impeditivo vs Ponto de Atencao
**Arquivos:** `ValidacaoPage.tsx`
**Tarefas:**
1. Para cada dimensao de score, classificar como "Impeditivo" (< 30%) ou "Ponto de Atencao" (30-70%)
2. Visual: badge vermelha "Impeditivo" vs badge amarela "Ponto de Atencao"

---

## Sprint 2C — Funcionalidades Novas (~4-6 horas, 2 sessoes)

### T-2C-01: RF-004 — Alertas IA sobre Documentos
**Arquivos:** `EmpresaPage.tsx`, backend (novo endpoint)
**Tarefas:**
1. Novo Card "Alertas IA" no topo da EmpresaPage
2. Botao "Verificar contra Edital" que recebe edital_id
3. Backend: endpoint `POST /api/empresa/verificar-documentos` que compara docs empresa vs requisitos do edital
4. Retorna lista de alertas: documento faltante, vencido, exigencia possivelmente ilegal
5. Frontend: lista de alertas com badges vermelhas/amarelas/verdes

### T-2C-02: RF-023 — Intencao Influencia Score
**Arquivos:** `CaptacaoPage.tsx`, `ValidacaoPage.tsx`
**Tarefas:**
1. Quando intencao = "estrategico", multiplicador de 1.3x no score para determinacao de GO/NO-GO
2. Score baixo (< 60) + "estrategico" pode virar GO
3. Visual: indicador de que a intencao influenciou a decisao

### T-2C-03: RF-010 — IA Sugere Novos Campos
**Arquivos:** `PortfolioPage.tsx`, backend
**Tarefas:**
1. Ao processar manual tecnico, IA pode retornar campos novos nao presentes na mascara
2. Frontend: modal de revisao com accept/reject/edit por campo
3. Badge por campo: "IA" vs "Manual"

### T-2C-04: Portfolio Classificacao — Remover Duplicata
**Arquivos:** `PortfolioPage.tsx`
**Tarefas:**
1. Aba Classificacao: transformar em READ-ONLY com link "Editar em Parametrizacoes"
2. Remover qualquer logica de edicao (que alias nao existe, ja e read-only)
3. Manter apenas como referencia visual

### T-2C-05: Parametrizacoes — Campos de Mascara por Classe
**Arquivos:** `ParametrizacoesPage.tsx`
**Tarefas:**
1. No modal de Classe, adicionar secao "Campos da Mascara"
2. Interface para adicionar campos: nome, tipo (texto/numero/selecao/booleano), placeholder
3. Salvar em `campos_mascara` da classe no backend
4. Portfolio consome automaticamente

---

## Prioridade de Execucao

| Ordem | Sprint | ID | Descricao | Tempo (Agent Teams) |
|-------|--------|----|-----------|---------------------|
| 1 | 2A | T-2A-01 | Corrigir certidoes | ~10 min |
| 2 | 2A | T-2A-02 | Corrigir score comercial | ~15 min |
| 3 | 2A | T-2A-03 | Corrigir gaps | ~15 min |
| 4 | 2A | T-2A-04 | Corrigir botoes salvar | ~20 min |
| 5 | 2A | T-2A-05 | Corrigir mapa logistico | ~15 min |
| 6 | 2A | T-2A-06 | Corrigir editar subclasse | ~15 min |
| 7 | 2A | T-2A-07 | Corrigir agente fake | ~15 min |
| | | | **Subtotal 2A** | **~2h** |
| 8 | 2B | T-2B-01 | Docs com vencimento | ~30 min |
| 9 | 2B | T-2B-02 | Certidoes completas | ~30 min |
| 10 | 2B | T-2B-03 | Responsaveis tipo+edicao | ~20 min |
| 11 | 2B | T-2B-04 | SPECS completo | ~15 min |
| 12 | 2B | T-2B-05 | Funil real | ~20 min |
| 13 | 2B | T-2B-06 | Score comercial backend | ~40 min |
| 14 | 2B | T-2B-07 | Filtros completos | ~10 min |
| 15 | 2B | T-2B-08 | Monitoramento CRUD | ~45 min |
| 16 | 2B | T-2B-09 | Pipeline riscos | ~30 min |
| 17 | 2B | T-2B-10 | Impeditivo/Atencao | ~15 min |
| | | | **Subtotal 2B** | **~4-5h** |
| 18 | 2C | T-2C-01 | Alertas IA docs | ~1h |
| 19 | 2C | T-2C-02 | Intencao influencia score | ~30 min |
| 20 | 2C | T-2C-03 | IA sugere campos | ~1h |
| 21 | 2C | T-2C-04 | Classificacao read-only | ~10 min |
| 22 | 2C | T-2C-05 | Mascara por classe | ~45 min |
| | | | **Subtotal 2C** | **~3-4h** |

**Total estimado com Agent Teams: ~10-11 horas de execucao (2-3 dias calendario)**

**Resultado esperado:** Todas as 5 paginas 100% aderentes aos 37 RFs da Fundacao + Captacao + Validacao.

---

## NOTA: Paginas que NAO Existem

Os seguintes RFs requerem paginas NOVAS que nao foram construidas:

| RF | Pagina | Etapa |
|----|--------|-------|
| RF-038 | ImpugnacaoPage | Fluxo Comercial |
| RF-039 | PrecificacaoPage | Fluxo Comercial |
| RF-040 | PropostaPage | Fluxo Comercial |
| RF-041 | SubmissaoPage | Fluxo Comercial |
| RF-042 | DisputaLancesPage | Fluxo Comercial |
| RF-043 | FollowupPage | Fluxo Comercial |
| RF-044 | RecursoPage | Fluxo Comercial |
| RF-045 | CRMPage | Fluxo Comercial |
| RF-046 | ExecucaoContratoPage | Fluxo Comercial |
| RF-047 | FlagsPage | Indicadores |
| RF-048 | MonitoriaPage | Indicadores |
| RF-049 | ConcorrenciaPage | Indicadores |
| RF-050 | MercadoPage | Indicadores |
| RF-051 | ContratadoRealizadoPage | Indicadores |
| RF-052 | PedidosAtrasoPage | Indicadores |
| RF-053 | PerdasPage | Indicadores |

Esses 16 RFs representam 27% do total (16/60) e requerem planejamento de Sprints 3 e 4.

---

*Documento gerado em 2026-02-23 por analise direta do codigo-fonte.*
