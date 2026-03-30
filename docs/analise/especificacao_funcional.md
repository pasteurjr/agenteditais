# Especificacao Funcional — Agente de Editais (facilicita.ia)

**Data:** 30/03/2026
**Versao:** 1.0
**Fonte primaria:** Implementacao real (codigo-fonte)
**Fonte secundaria:** Documentos de requisitos e casos de uso existentes

---

## 1. Objetivo do Sistema

O Agente de Editais (facilicita.ia) e um sistema de gestao completa do ciclo de licitacoes publicas com apoio de Inteligencia Artificial. O sistema cobre desde a captacao de editais em portais publicos (PNCP, ComprasNet, BEC) ate a execucao de contratos, passando por validacao, precificacao, geracao de propostas, recursos juridicos e acompanhamento de resultados.

O sistema e voltado para empresas que participam de licitacoes publicas, especialmente no segmento de equipamentos laboratoriais e produtos hospitalarios, automatizando tarefas repetitivas e oferecendo analises assistidas por IA (DeepSeek) em cada etapa do fluxo comercial.

**Stack:** React 18 + TypeScript + Vite (frontend :5175) | Python 3.12 + Flask (backend :5007) | MySQL | DeepSeek LLM | PNCP API | Brave/Serper scraper

**Numeros do sistema:** [CODIGO]
- 23 paginas frontend, 119 endpoints REST, 76 tools de IA, 69 modelos SQLAlchemy, 66 tabelas CRUD
- 5 sprints concluidas, 5 sprints planejadas (6-10)

---

## 2. Modulos do Sistema

---

### Modulo 1: Autenticacao
**Sprint:** 1 | **Status:** ✅ Implementado
**Pagina:** LoginPage.tsx / RegisterPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Controlar acesso ao sistema com autenticacao JWT, suportando multiplas empresas por usuario.

**Telas e Componentes:**
- LoginPage: formulario email/senha, link para registro
- RegisterPage: formulario de criacao de conta

**Endpoints:**
- POST /api/auth/login — autentica usuario, retorna access_token + refresh_token
- POST /api/auth/register — cria novo usuario
- POST /api/auth/refresh — renova access_token com refresh_token (validade 30 dias)
- POST /api/auth/logout — invalida sessao

**Tools de IA:**
- Nenhuma

**Fluxos funcionais:**
1. Usuario acessa o sistema e ve tela de login
2. Insere email e senha
3. Backend valida credenciais e retorna JWT (access_token + refresh_token)
4. Frontend armazena token em localStorage("editais_ia_access_token")
5. Todas as requisicoes subsequentes incluem header Authorization: Bearer {token}
6. Decorator @require_auth protege todos os endpoints autenticados

**Regras de negocio:**
- RN-AUTH-001: Access token tem validade curta; refresh token dura 30 dias [CODIGO]
- RN-AUTH-002: Usuario pode estar vinculado a multiplas empresas (switch de empresa) [CODIGO]
- RN-AUTH-003: get_current_user_id() extrai user_id do JWT para escopo de dados [CODIGO]

**Integracoes:**
- Nenhuma externa

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 2: Dashboard
**Sprint:** 1 | **Status:** ✅ Implementado
**Pagina:** Dashboard.tsx (componente, nao pagina autonoma)
**Confirmacao:** [CODIGO]

**Objetivo:** Apresentar visao consolidada dos KPIs do sistema com funil de editais e alertas urgentes.

**Telas e Componentes:**
- KPIs: editais novos, em analise, validados, propostas enviadas
- Funil de editais (captacao → validacao → proposta → resultado)
- Editais urgentes (proximos de vencer prazo)
- Status do scheduler (alertas ativos)

**Endpoints:**
- GET /api/dashboard — retorna KPIs agregados
- GET /api/dashboard/funil — dados do funil
- GET /api/editais/urgentes — editais com prazo proximo

**Tools de IA:**
- Nenhuma especifica do dashboard

**Fluxos funcionais:**
1. Usuario faz login e e redirecionado ao dashboard
2. Sistema carrega KPIs via API
3. Exibe cards de metricas, funil visual e lista de editais urgentes
4. Clique em edital urgente navega para pagina correspondente

**Regras de negocio:**
- RN-DASH-001: KPIs filtrados por empresa do usuario logado [CODIGO]
- RN-DASH-002: Editais urgentes sao aqueles com abertura em ate 7 dias [INFERIDO]

**Integracoes:**
- Scheduler (APScheduler) para status de monitoramentos

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 3: Empresa
**Sprint:** 1 | **Status:** ✅ Implementado
**Pagina:** EmpresaPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Gerenciar dados cadastrais da empresa, documentos, certidoes e responsaveis.

**Telas e Componentes:**
- Tab "Dados Cadastrais": CNPJ, razao social, nome fantasia, endereco, contatos (emails, celulares), redes sociais (website, Instagram, LinkedIn, Facebook)
- Tab "Documentos": upload/gestao de contrato social, alvaras, certidoes
- Tab "Certidoes": busca automatica de certidoes (INSS, FGTS, tributos)
- Tab "Responsaveis": cadastro de responsaveis da empresa

**Endpoints:**
- CRUD /api/crud/empresas — dados cadastrais
- CRUD /api/crud/empresa-documentos — documentos da empresa
- CRUD /api/crud/empresa-certidoes — certidoes
- CRUD /api/crud/empresa-responsaveis — responsaveis
- CRUD /api/crud/fontes-certidoes — fontes para busca automatica
- CRUD /api/crud/categorias-documento — categorias de documentos
- CRUD /api/crud/documentos-necessarios — tipos de documentos necessarios
- CRUD /api/crud/beneficios-fiscais-ncm — beneficios fiscais por NCM

**Tools de IA:**
- tool_buscar_certidoes — busca automatica de certidoes via browser (CAPSolver para CAPTCHAs) [CODIGO]

**Fluxos funcionais:**
1. Usuario acessa EmpresaPage
2. Preenche dados cadastrais (CNPJ, razao social, endereco, etc.)
3. Faz upload de documentos organizados por categoria
4. Solicita busca automatica de certidoes (INSS, FGTS, tributos)
5. Sistema usa certidao_browser.py com CAPSolver para resolver CAPTCHAs
6. Cadastra responsaveis com funcoes

**Regras de negocio:**
- RN-EMP-001: Empresa scoped por usuario (user_scoped no CRUD) [CODIGO]
- RN-EMP-002: Documentos organizados por categorias configuraveis [CODIGO]
- RN-EMP-003: Certidoes tem validade e sistema alerta vencimento [INFERIDO]

**Integracoes:**
- CAPSolver (resolucao de CAPTCHAs para busca de certidoes)
- Sites governamentais (INSS, FGTS, tributos federais)

**Divergencias documentacao vs implementacao:**
- EmpresaPage.tsx usa CRUD generico via crudList/crudCreate/crudUpdate/crudDelete (confirmado no import) [CODIGO]
- Campos de redes sociais (instagram, linkedin, facebook) estao no modelo mas nao constam nos requisitos originais [CODIGO]

---

### Modulo 4: Portfolio
**Sprint:** 1 | **Status:** ✅ Implementado
**Pagina:** PortfolioPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Gerenciar catalogo de produtos da empresa com cadastro assistido por IA, extracao automatica de especificacoes e score de completude.

**Telas e Componentes:**
- Lista de produtos com filtros e busca
- Detalhe do produto com especificacoes tecnicas
- Upload assistido por IA (6 tipos de fonte):
  - Manual Tecnico (.pdf, .doc, .docx)
  - Instrucoes de Uso / IFU (.pdf, .doc, .docx)
  - Nota Fiscal / NFS (.pdf, .xlsx, .xls, .csv)
  - Plano de Contas / ERP (.pdf, .xlsx, .xls, .csv)
  - Folder / Catalogo (.pdf, .doc, .docx)
  - Website do Fabricante (URL)
- Score de completude por produto (ScoreBar)
- Reprocessamento de metadados
- Hierarquia: Areas → Classes → Subclasses

**Endpoints:**
- GET /api/produtos — lista produtos
- GET /api/produtos/{id} — detalhe do produto
- GET /api/produtos/{id}/completude — score de completude
- POST /api/produtos/{id}/reprocessar — reprocessa metadados
- CRUD /api/crud/produtos — CRUD de produtos
- CRUD /api/crud/produtos-especificacoes — especificacoes
- CRUD /api/crud/produtos-documentos — documentos do produto
- CRUD /api/crud/areas-produto — areas
- CRUD /api/crud/classes-produto-v2 — classes
- CRUD /api/crud/subclasses-produto — subclasses

**Tools de IA:**
- tool_cadastrar_produto — cadastra produto a partir de documento (manual, IFU, NF, etc.) [CODIGO]
- tool_extrair_especificacoes — extrai especificacoes tecnicas de documento [INFERIDO]
- tool_reprocessar_metadados — reprocessa metadados de produto existente [CODIGO]
- tool_completude_produto — calcula score de completude [CODIGO]

**Fluxos funcionais:**
1. Usuario acessa PortfolioPage
2. Seleciona tipo de fonte (manual, IFU, NF, etc.)
3. Faz upload do arquivo ou informa URL
4. IA (DeepSeek) extrai especificacoes e cria produto automaticamente
5. Usuario revisa e ajusta dados extraidos
6. Sistema calcula score de completude (0-100%)
7. Usuario pode reprocessar metadados a qualquer momento

**Regras de negocio:**
- RN-PORT-001: Produtos organizados em hierarquia Area → Classe → Subclasse [CODIGO]
- RN-PORT-002: Score de completude considera campos preenchidos e qualidade das especificacoes [CODIGO]
- RN-PORT-003: Upload de NF e Plano de Contas cria multiplos produtos de uma vez [CODIGO]
- RN-PORT-004: Cada produto tem NCM, fabricante, modelo como campos obrigatorios [CODIGO]

**Integracoes:**
- DeepSeek (extracao de especificacoes de documentos)

**Divergencias documentacao vs implementacao:**
- PortfolioPage usa tanto API direta (getProdutos, getProduto) quanto CRUD generico — dupla camada [CODIGO]
- Upload por website nao tem accept filter (campo vazio), indicando que pode ser input de URL [CODIGO]

---

### Modulo 5: Parametrizacoes
**Sprint:** 1 | **Status:** ✅ Implementado
**Pagina:** ParametrizacoesPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Configurar parametros do sistema: fontes de editais, classes de produto, pesos de score, modalidades e origens.

**Telas e Componentes:**
- Fontes de editais (PNCP, BEC, ComprasNet, etc.)
- Classes de produto com campos de mascara
- Parametros de score (pesos por dimensao)
- Modalidades de licitacao
- Origens de orgao

**Endpoints:**
- CRUD /api/crud/fontes-edital — fontes de editais
- CRUD /api/crud/classes-produto-v2 — classes com campos de mascara
- CRUD /api/crud/parametros-score — pesos de score
- CRUD /api/crud/modalidades — modalidades de licitacao
- CRUD /api/crud/origens-orgao — origens de orgao

**Tools de IA:**
- Nenhuma

**Fluxos funcionais:**
1. Administrador acessa Parametrizacoes
2. Configura fontes de editais ativas (habilita/desabilita)
3. Define pesos das 6 dimensoes de score
4. Cadastra modalidades de licitacao disponiveis
5. Configuracoes aplicadas automaticamente em captacao e validacao

**Regras de negocio:**
- RN-PAR-001: Pesos de score devem somar 100% (tecnico 30%, documental 25%, complexidade 15%, juridico 10%, logistico 10%, comercial 10%) [CODIGO]
- RN-PAR-002: Fontes de edital possuem UUID unico, frontend envia UUID e backend resolve nome via DB [CODIGO]

**Integracoes:**
- Nenhuma externa

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 6: Captacao de Editais
**Sprint:** 2 | **Status:** ✅ Implementado
**Pagina:** CaptacaoPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Buscar editais em multiplas fontes (PNCP, ComprasNet, BEC via scraper), filtrar por criterios e salvar editais selecionados para analise.

**Telas e Componentes:**
- Formulario de busca com filtros (UF, categoria, modalidade, periodo, valor)
- Lista de resultados com score de aderencia
- Detalhe do edital com itens e requisitos
- Botao de salvar edital para analise
- Download de PDFs do PNCP
- StatCards com metricas de busca

**Endpoints:**
- POST /api/editais/buscar — busca multifontes (PNCP + scraper)
- POST /api/editais/salvar — salva edital selecionado
- GET /api/editais/{id}/pdf — download do PDF do edital
- GET /api/editais/{id}/itens — itens do edital

**Tools de IA:**
- tool_buscar_editais_fonte — busca editais em fonte especifica [CODIGO]
- tool_score_aderencia — calcula score de aderencia ao portfolio [INFERIDO]

**Fluxos funcionais:**
1. Usuario acessa CaptacaoPage
2. Define filtros de busca (palavra-chave, UF, modalidade, periodo)
3. Sistema busca em paralelo: PNCP Search API (rapido, ~15s) + scraper Brave/Serper
4. Para cada resultado PNCP, busca valores via endpoint de detalhes em paralelo
5. Resultados exibidos com score de aderencia ao portfolio
6. Usuario seleciona editais para salvar
7. Editais salvos ficam disponiveis em Validacao

**Regras de negocio:**
- RN-CAP-001: Estrategia hibrida — Search API para busca rapida + detalhes para valores [CODIGO]
- RN-CAP-002: Search API (pncp.gov.br/api/search/?q=) filtra por texto mas NAO retorna valorTotalEstimado [CODIGO]
- RN-CAP-003: Detalhes via /orgaos/{cnpj}/compras/{ano}/{seq} retorna valorTotalEstimado [CODIGO]
- RN-CAP-004: Chat e UI usam mesmo caminho: _buscar_editais_multifonte() → tool_buscar_editais_fonte() [CODIGO]
- RN-CAP-005: CaptacaoPage usa crudList/crudCreate para persistencia [CODIGO]

**Integracoes:**
- PNCP API (busca e detalhes de editais)
- Brave Search API (scraping de fontes alternativas)
- Serper / Google CSE (busca web alternativa)

**Divergencias documentacao vs implementacao:**
- Endpoint antigo /contratacoes/publicacao com sub-janelas foi abandonado por ser muito lento (~200s+) [CODIGO]
- CaptacaoPage importa useAuth do AuthContext, confirmando integracao real com backend [CODIGO]

---

### Modulo 7: Validacao de Editais
**Sprint:** 2 | **Status:** ✅ Implementado
**Pagina:** ValidacaoPage.tsx (~2.300 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Analisar editais salvos em 6 dimensoes de score, com analise de mercado, riscos e historico de vencedores, para decidir participacao.

**Telas e Componentes:**
- Lista de editais salvos com filtros
- Painel de scores por dimensao (6 barras)
- Score geral ponderado com recomendacao
- Analise de mercado via IA
- Analise de riscos
- Historico de vencedores do orgao
- Checklist de validacao (itens obrigatorios)
- Botao de decisao: participar / nao participar

**Endpoints:**
- GET /api/editais/validacao — lista editais para validacao
- POST /api/editais/{id}/validar — executa validacao com IA
- GET /api/editais/{id}/scores — retorna scores por dimensao
- GET /api/editais/{id}/mercado — analise de mercado
- POST /api/editais/{id}/decisao — registra decisao participar/nao

**Tools de IA:**
- tool_validar_edital — analise completa com scores 6D [CODIGO]
- tool_analise_mercado — analise de mercado e concorrencia [INFERIDO]
- tool_historico_vencedores — busca vencedores anteriores [INFERIDO]

**Fluxos funcionais:**
1. Usuario acessa ValidacaoPage e ve lista de editais salvos
2. Seleciona edital para validar
3. Sistema executa analise IA nas 6 dimensoes
4. Exibe scores individuais + score geral ponderado
5. Apresenta recomendacao: PARTICIPAR (≥70), AVALIAR (40-69), NAO PARTICIPAR (<40)
6. Usuario consulta analise de mercado e riscos
7. Registra decisao final (participar / nao participar / avaliar)

**Regras de negocio:**
- RN-VAL-001: 6 dimensoes de score — tecnico (30%), documental (25%), complexidade (15%), juridico (10%), logistico (10%), comercial (10%) [CODIGO]
- RN-VAL-002: Score geral = media ponderada 0-100 [CODIGO]
- RN-VAL-003: Recomendacao automatica baseada no score: ≥70 PARTICIPAR, 40-69 AVALIAR, <40 NAO PARTICIPAR [CODIGO]
- RN-VAL-004: Score logistico tem 4 sub-dimensoes: distancia (30%), historico entregas (25%), custo frete (25%), prazo (20%) [CODIGO]

**Integracoes:**
- DeepSeek (analise de aderencia e riscos)
- PNCP (historico de precos e vencedores)

**Divergencias documentacao vs implementacao:**
- ValidacaoPage e a maior pagina do sistema (~2.300 linhas), indicando alta complexidade de UI [CODIGO]

---

### Modulo 8: Impugnacao e Esclarecimentos
**Sprint:** 4 | **Status:** ✅ Implementado
**Pagina:** ImpugnacaoPage.tsx (806 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Validar legalidade do edital com IA, gerar peticoes de impugnacao e controlar prazos legais.

**Telas e Componentes:**
- Lista de editais com status de impugnacao
- Analise legal do edital (comparacao com Lei 14.133)
- Gerador de peticao de impugnacao
- Upload de peticoes externas
- Badge de prazo (verde/amarelo/vermelho/expirado)
- Templates de peticao

**Endpoints:**
- GET /api/impugnacoes — lista impugnacoes
- POST /api/impugnacoes — cria impugnacao
- POST /api/impugnacoes/{id}/validacao-legal — analise legal com IA
- POST /api/impugnacoes/{id}/gerar-peticao — gera peticao com IA
- CRUD /api/crud/impugnacoes — CRUD generico

**Tools de IA:**
- tool_validacao_legal — le PDF do edital e compara com Lei 14.133 [CODIGO]
- tool_gerar_peticao_impugnacao — gera texto de peticao baseado em irregularidades encontradas [CODIGO]

**Fluxos funcionais:**
1. Usuario acessa ImpugnacaoPage
2. Seleciona edital para analise legal
3. IA le o PDF do edital e compara clausulas com Lei 14.133/2021
4. Sistema identifica irregularidades e recomenda impugnacao
5. Usuario solicita geracao automatica de peticao
6. IA gera peticao com fundamentos legais
7. Usuario revisa, edita e submete peticao
8. Sistema controla prazo de 3 dias uteis antes da abertura

**Regras de negocio:**
- RN-IMP-001: Prazo de impugnacao = 3 dias uteis antes da data de abertura (Art. 164 Lei 14.133) [CODIGO]
- RN-IMP-002: Badge de prazo: verde (>3 dias), amarelo (2-3 dias), vermelho (1 dia), expirado (0 dias) [CODIGO]
- RN-IMP-003: Peticao pode ser gerada por IA ou uploaded manualmente [CODIGO]

**Integracoes:**
- DeepSeek (analise legal e geracao de peticao)

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 9: Precificacao
**Sprint:** 3 | **Status:** ✅ Implementado
**Pagina:** PrecificacaoPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Organizar itens em lotes, vincular produtos, definir precos em 5 camadas e simular estrategias competitivas.

**Telas e Componentes:**
- Organizacao por lotes
- Vinculacao item-produto (manual e por IA)
- 5 camadas de preco: A (custo), B (markup), C (referencia), D (proposta), E (minimo)
- Historico de precos PNCP
- Simulacao de disputa
- Estrategia competitiva
- Insights de precificacao por IA
- Beneficios fiscais NCM

**Endpoints:**
- GET /api/editais/{id}/precificacao — dados de precificacao
- POST /api/editais/{id}/lotes — cria/organiza lotes
- POST /api/editais/{id}/vincular-produto — vincula item a produto
- POST /api/editais/{id}/preco-camada — define preco por camada
- GET /api/precos-historicos — historico de precos PNCP
- POST /api/editais/{id}/simular-disputa — simulacao de disputa

**Tools de IA:**
- tool_vincular_item_produto — vincula item do edital a produto do portfolio automaticamente [INFERIDO]
- tool_sugerir_preco — sugere precos baseados em historico PNCP [INFERIDO]
- tool_insights_precificacao — gera insights estrategicos de preco [INFERIDO]
- tool_simulacao_disputa — simula cenarios de disputa [INFERIDO]

**Fluxos funcionais:**
1. Usuario acessa PrecificacaoPage para edital em analise
2. Sistema organiza itens do edital em lotes
3. Para cada item, IA sugere produto do portfolio (ou usuario vincula manualmente)
4. Usuario define precos nas 5 camadas (A→E)
5. Sistema busca historico de precos PNCP para referencia
6. Usuario pode simular disputas com diferentes cenarios
7. IA gera insights sobre estrategia competitiva

**Regras de negocio:**
- RN-PRE-001: 5 camadas de preco: A=custo, B=markup, C=referencia, D=proposta, E=minimo [CODIGO]
- RN-PRE-002: Historico de precos vem do PNCP via API [CODIGO]
- RN-PRE-003: Beneficios fiscais NCM sao considerados no calculo [CODIGO]

**Integracoes:**
- DeepSeek (vinculacao, insights, simulacao)
- PNCP (historico de precos)

**Divergencias documentacao vs implementacao:**
- Camadas de preco A-E sao definidas no modelo PrecoCamada no backend [CODIGO]
- calculadora.py e calculadora_ia.py contem logica de calculo separada [CODIGO]

---

### Modulo 10: Proposta
**Sprint:** 3 | **Status:** ✅ Implementado
**Pagina:** PropostaPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Gerar propostas tecnicas e comerciais com apoio de IA, com editor rico, templates, validacao ANVISA e exportacao PDF/DOCX.

**Telas e Componentes:**
- Editor rico com markdown para texto da proposta
- Geracao automatica de texto tecnico por IA
- Templates de proposta
- Validacao ANVISA (registro de produtos)
- Auditoria documental
- Exportacao PDF/DOCX
- Log de alteracoes
- Status: rascunho → revisao → aprovada → enviada

**Endpoints:**
- GET /api/propostas — lista propostas
- POST /api/propostas — cria proposta
- PUT /api/propostas/{id} — atualiza proposta
- POST /api/propostas/{id}/gerar-texto — gera texto com IA
- POST /api/propostas/{id}/exportar — exporta PDF/DOCX
- POST /api/propostas/{id}/validar-anvisa — valida registros ANVISA
- CRUD /api/crud/proposta-templates — templates de proposta

**Tools de IA:**
- tool_gerar_proposta — gera texto da proposta tecnica inline (sem chat) [CODIGO]
- tool_validar_anvisa — verifica registro ANVISA dos produtos [CODIGO]
- tool_auditoria_documental — verifica completude documental [INFERIDO]

**Fluxos funcionais:**
1. Usuario acessa PropostaPage para edital precificado
2. Seleciona template de proposta (ou usa padrao)
3. Solicita geracao automatica de texto tecnico
4. IA gera texto baseado em especificacoes do produto e requisitos do edital
5. Usuario edita texto no editor markdown
6. Solicita validacao ANVISA (verifica registros dos produtos)
7. Exporta proposta em PDF ou DOCX via gerador_documentos.py
8. Altera status: rascunho → revisao → aprovada → enviada

**Regras de negocio:**
- RN-PRO-001: Fluxo de status: rascunho → revisao → aprovada → enviada [CODIGO]
- RN-PRO-002: Todas as alteracoes sao registradas em PropostaLog [CODIGO]
- RN-PRO-003: Validacao ANVISA verifica se produtos tem registro vigente [CODIGO]
- RN-PRO-004: Geracao de proposta e inline (sem chat), corrigido em commit f21aa2b [CODIGO]

**Integracoes:**
- DeepSeek (geracao de texto, validacao ANVISA)
- gerador_documentos.py (exportacao PDF/DOCX)

**Divergencias documentacao vs implementacao:**
- Geracao de proposta originalmente usava chat; foi corrigida para inline (commit f21aa2b) [CODIGO]

---

### Modulo 11: Submissao
**Sprint:** 3 | **Status:** ✅ Implementado
**Pagina:** SubmissaoPage.tsx (364 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Gerenciar checklist pre-submissao, tracking de status e fracionamento de PDF para portais com limite de tamanho.

**Telas e Componentes:**
- Checklist pre-submissao (documentos obrigatorios)
- Tracking de status de submissao
- Smart Split PDF (fracionamento para limites de portal)
- Link externo para portal de submissao

**Endpoints:**
- GET /api/submissoes — lista submissoes
- POST /api/submissoes — cria submissao
- PUT /api/submissoes/{id}/status — atualiza status
- POST /api/submissoes/{id}/split-pdf — fraciona PDF

**Tools de IA:**
- Nenhuma especifica

**Fluxos funcionais:**
1. Usuario acessa SubmissaoPage com proposta aprovada
2. Sistema exibe checklist de documentos obrigatorios
3. Usuario verifica cada item do checklist
4. Se PDF excede limite do portal, usa Smart Split para fracionar
5. Sistema fornece link para portal externo (ComprasNet, gov.br)
6. Usuario registra protocolo de submissao

**Regras de negocio:**
- RN-SUB-001: Checklist valida completude documental antes da submissao [CODIGO]
- RN-SUB-002: Smart Split respeita limites de tamanho dos portais [INFERIDO]

**Integracoes:**
- Portal ComprasNet/gov.br (link externo, submissao manual assistida)

**Divergencias documentacao vs implementacao:**
- Submissao e assistida (checklist + link), nao automatica — portal nao tem API de submissao [CODIGO]

---

### Modulo 12: Disputa de Lances
**Sprint:** 10 (planejado) | **Status:** ⚠️ Mock
**Pagina:** LancesPage.tsx (182 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Acompanhar pregoes eletronicos em tempo real e registrar historico de lances.

**Telas e Componentes:**
- Pregoes de hoje (aguardando / em andamento / encerrado)
- Historico de lances (vitoria / derrota)
- Campos: edital, orgao, hora, status, tempo restante
- Campos historico: nosso lance, lance vencedor, resultado

**Endpoints:**
- Nenhum real — dados hardcoded no frontend

**Tools de IA:**
- Nenhuma

**Fluxos funcionais:**
1. Pagina exibe dados mock estaticos
2. Nao ha interacao com backend

**Regras de negocio:**
- Nenhuma implementada

**Integracoes:**
- Nenhuma (planejado: integracao com ComprasNet para lances em tempo real)

**Divergencias documentacao vs implementacao:**
- Pagina inteiramente mock com dados hardcoded (mockPregoesHoje, mockHistorico) [CODIGO]
- Planejada para Sprint 10 — depende de integracao com portal ComprasNet [CODIGO]

---

### Modulo 13: Recursos e Contra-Razoes
**Sprint:** 4 | **Status:** ✅ Implementado
**Pagina:** RecursosPage.tsx (951 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Monitorar janelas de recurso, analisar propostas vencedoras, gerar laudos de recurso e contra-razao com IA.

**Telas e Componentes:**
- Lista de editais com janela de recurso
- Monitoramento de janela (WhatsApp/Email/Alerta)
- Analise de proposta vencedora com IA
- Chatbox interativo para explorar desvios
- Gerador de laudo de recurso (secoes juridica + tecnica)
- Gerador de laudo de contra-razao (secoes defesa + ataque)
- Submissao assistida (checklist + exportar + link + protocolo)
- Templates de recurso
- Botoes "Novo Laudo" e "Upload"

**Endpoints:**
- GET /api/recursos — lista recursos
- POST /api/recursos — cria recurso
- POST /api/recursos/{id}/analisar-vencedora — analisa proposta vencedora
- POST /api/recursos/{id}/gerar-laudo — gera laudo de recurso
- POST /api/recursos/{id}/gerar-contra-razao — gera contra-razao
- CRUD /api/crud/recursos-detalhados — CRUD de recursos

**Tools de IA:**
- tool_analisar_proposta_vencedora — analisa desvios na proposta vencedora [CODIGO]
- tool_gerar_laudo_recurso — gera laudo com secoes juridica e tecnica [CODIGO]
- tool_gerar_contra_razao — gera laudo de contra-razao [CODIGO]
- tool_chatbox_recurso — chatbox interativo para explorar desvios [INFERIDO]

**Fluxos funcionais:**
1. Sistema monitora janela de recurso dos editais participados
2. Quando janela abre, dispara alerta (in-app, email, WhatsApp)
3. Usuario acessa analise da proposta vencedora
4. IA identifica desvios tecnicos e juridicos
5. Usuario explora desvios via chatbox interativo
6. Solicita geracao de laudo de recurso (juridico + tecnico)
7. Ou gera contra-razao se recurso foi interposto contra a empresa
8. Exporta documento e submete no portal

**Regras de negocio:**
- RN-REC-001: Janela de recurso monitorada pelo scheduler (APScheduler) a cada hora [CODIGO]
- RN-REC-002: Alertas multi-canal: in-app, email, WhatsApp [CODIGO]
- RN-REC-003: Laudo tem secoes separadas: juridica e tecnica [CODIGO]
- RN-REC-004: Contra-razao tem secoes: defesa e ataque [CODIGO]

**Integracoes:**
- DeepSeek (analise de vencedora, geracao de laudos)
- Scheduler (monitoramento de janela)
- Email/WhatsApp (alertas)

**Divergencias documentacao vs implementacao:**
- Frontend usava crudList("recursos") em vez de "recursos-detalhados" — corrigido em commit 1007e0a [CODIGO]

---

### Modulo 14: Follow-up
**Sprint:** 5 | **Status:** ✅ Implementado
**Pagina:** FollowupPage.tsx (~500 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Registrar resultados de licitacoes (vitoria/derrota/cancelado), criar contratos automaticamente em vitorias e monitorar prazos.

**Telas e Componentes:**
- Lista de editais com resultado pendente
- Registro de resultado: vitoria / derrota / cancelado
- Stats: pendentes, vitorias, derrotas, taxa de sucesso
- Alertas de vencimento multi-tier

**Endpoints:**
- GET /api/followup/pendentes — editais aguardando resultado
- POST /api/followup/{id}/resultado — registra resultado
- GET /api/followup/stats — estatisticas de resultados
- GET /api/alertas — alertas de vencimento

**Tools de IA:**
- Nenhuma especifica

**Fluxos funcionais:**
1. Usuario acessa FollowupPage
2. Ve lista de editais com resultado pendente (status: submetido, proposta_enviada, em_pregao)
3. Registra resultado: vitoria, derrota ou cancelado
4. Em caso de vitoria, sistema cria contrato automaticamente
5. Em caso de derrota, edital pode ir para analise de perdas
6. Dashboard atualiza stats de taxa de sucesso

**Regras de negocio:**
- RN-FOL-001: Auto-criacao de contrato quando resultado = vitoria [CODIGO]
- RN-FOL-002: Alertas multi-tier: 30d (in-app), 15d (+email), 7d (todos canais), 1d (banner critico) [CODIGO]
- RN-FOL-003: Pendentes filtram status "submetido", "proposta_enviada", "em_pregao" — corrigido em commit 3cdd5d4 [CODIGO]

**Integracoes:**
- Scheduler (alertas de vencimento)
- Notificacoes (notifications.py)

**Divergencias documentacao vs implementacao:**
- Filtro de pendentes originalmente so incluia "submetido" — corrigido para incluir "proposta_enviada" e "em_pregao" [CODIGO]

---

### Modulo 15: Atas de Pregao
**Sprint:** 5 | **Status:** ✅ Implementado
**Pagina:** AtasPage.tsx (~500 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Buscar atas de registro de preco no PNCP, extrair dados via IA, controlar saldo e caronas com validacao legal.

**Telas e Componentes:**
- Busca de atas no PNCP
- Dashboard de atas consultadas (vigentes / vencidas)
- Extracao de dados de ata PDF via IA
- Saldo ARP por item
- Controle de carona com validacao legal

**Endpoints:**
- GET /api/atas — lista atas consultadas
- POST /api/atas/buscar — busca atas no PNCP
- POST /api/atas/{id}/extrair — extrai dados do PDF com IA
- POST /api/atas/{id}/carona — registra carona
- GET /api/atas/{id}/saldo — saldo por item
- CRUD /api/crud/atas-consultadas — CRUD de atas

**Tools de IA:**
- tool_extrair_ata — extrai dados estruturados de ata PDF [CODIGO]
- tool_validar_carona — valida limites de carona conforme Lei 14.133 [INFERIDO]

**Fluxos funcionais:**
1. Usuario busca atas no PNCP por orgao ou produto
2. Sistema retorna atas disponiveis
3. Usuario seleciona ata para extrair dados
4. IA extrai itens, quantidades, precos e vigencia do PDF
5. Sistema calcula saldo disponivel por item
6. Usuario pode registrar carona com validacao automatica de limites

**Regras de negocio:**
- RN-ATA-001: Limite individual de carona = 50% da quantidade registrada por orgao (Art. 82-86) [CODIGO]
- RN-ATA-002: Limite global de carona = 2x a quantidade registrada total [CODIGO]
- RN-ATA-003: Validacao server-side no endpoint POST de caronas [CODIGO]
- RN-ATA-004: Dashboard separa atas vigentes e vencidas [INFERIDO]

**Integracoes:**
- PNCP (busca de atas)
- DeepSeek (extracao de PDF)

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 16: Execucao de Contratos
**Sprint:** 5 | **Status:** ✅ Implementado
**Pagina:** ProducaoPage.tsx (~700 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Gerenciar contratos vigentes com entregas, cronograma, aditivos, designacoes de gestor/fiscal e atividades fiscais.

**Telas e Componentes:**
- CRUD de contratos com stats (vigentes, encerrados, rescindidos, suspensos)
- Registro de entregas com NF e empenho
- Cronograma semanal com indicacao de atrasados
- Gestao de aditivos (acrescimo/supressao com barra de progresso)
- Designacao de gestor e fiscal
- Atividades fiscais (medicao, vistoria, atesto, parecer)

**Endpoints:**
- CRUD /api/crud/contratos — contratos
- CRUD /api/crud/contrato-entregas — entregas
- CRUD /api/crud/contrato-aditivos — aditivos
- CRUD /api/crud/contrato-designacoes — designacoes
- CRUD /api/crud/atividades-fiscais — atividades de fiscalizacao
- GET /api/contratos/cronograma — cronograma semanal

**Tools de IA:**
- Nenhuma especifica

**Fluxos funcionais:**
1. Contrato criado automaticamente via Follow-up (vitoria)
2. Usuario registra entregas com numero de NF e empenho
3. Sistema exibe cronograma semanal com entregas previstas vs realizadas
4. Em caso de aditivo, usuario registra com tipo e valor
5. Sistema calcula % do limite de aditivo (barra de progresso)
6. Alerta quando aditivo atinge 80% do limite
7. Designacao de gestor e fiscal (obrigatorio, nao pode ser mesma pessoa)
8. Fiscal registra atividades: medicao, vistoria, atesto, parecer

**Regras de negocio:**
- RN-CON-001: Limite de aditivo = 25% do valor original (geral), 50% para reformas (Art. 124-126) [CODIGO]
- RN-CON-002: Alerta visual quando aditivo atinge 80% do limite [CODIGO]
- RN-CON-003: Obrigatorio designar gestor e fiscal (Art. 117 Lei 14.133) [CODIGO]
- RN-CON-004: Mesma pessoa NAO pode ser gestor e fiscal simultaneamente (§5o) [CODIGO]
- RN-CON-005: Status de contrato: vigente, encerrado, rescindido, suspenso [CODIGO]

**Integracoes:**
- Scheduler (alertas de vencimento de contrato)
- Notificacoes (entregas atrasadas)

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

### Modulo 17: Contratado x Realizado
**Sprint:** 5 | **Status:** ✅ Implementado
**Pagina:** ContratadoRealizadoPage.tsx (~800 linhas)
**Confirmacao:** [CODIGO]

**Objetivo:** Dashboard comparativo entre valores contratados e realizados, com indicadores de saude e alertas de desvio.

**Telas e Componentes:**
- Dashboard comparativo com filtros (periodo, contrato, produto)
- Variacao % por contrato com semaforo de cores
- Saude do portfolio (verde/amarelo/vermelho)
- Pedidos em atraso por severidade (HIGH/MEDIUM/LOW)
- Proximos vencimentos consolidados

**Endpoints:**
- GET /api/contratado-realizado — dados comparativos
- GET /api/contratado-realizado/saude — saude do portfolio
- GET /api/contratado-realizado/atrasos — pedidos em atraso
- GET /api/contratado-realizado/vencimentos — proximos vencimentos

**Tools de IA:**
- Nenhuma especifica

**Fluxos funcionais:**
1. Usuario acessa ContratadoRealizadoPage
2. Sistema calcula variacao entre contratado e realizado por contrato
3. Exibe semaforo: verde (≤5%), amarelo (5-15%), vermelho (>15%)
4. Mostra saude do portfolio (percentual de entregas em dia)
5. Lista pedidos em atraso com severidade: HIGH (>30 dias), MEDIUM (15-30), LOW (<15)
6. Consolida proximos vencimentos de contratos e ARPs

**Regras de negocio:**
- RN-CR-001: Variacao ≤5% = verde, 5-15% = amarelo, >15% = vermelho [CODIGO]
- RN-CR-002: Severidade de atraso: HIGH (>30 dias), MEDIUM (15-30 dias), LOW (<15 dias) [CODIGO]

**Integracoes:**
- Nenhuma externa

**Divergencias documentacao vs implementacao:**
- Nenhuma identificada

---

## Modulos Mock (Nao Implementados)

### Modulo M1: CRM Ativo
**Sprint:** 6 (planejado) | **Status:** ⚠️ Mock
**Pagina:** CRMPage.tsx (343 linhas)
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Gestao de leads oriundos de editais, pipeline de vendas, metas por vendedor.

**Evidencia de mock:** Pagina importa apenas useState, nao importa crudList nem faz fetch a API. Dados hardcoded como mockLeads e mockMetas. Interfaces Lead e Meta definidas localmente com dados estaticos. [CODIGO]

---

### Modulo M2: Flags e Alertas Visuais
**Sprint:** 7 (planejado) | **Status:** ⚠️ Mock
**Pagina:** FlagsPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Sistema de alertas visuais configuravel para editais, propostas, contratos e documentos.

**Evidencia de mock:** Pagina usa dados hardcoded (mockAlertasAtivos, mockAlertas) com "// Dados mock" explicito no codigo. Nao importa crudList nem faz chamadas a API. [CODIGO]

---

### Modulo M3: Monitoria de Termos
**Sprint:** 7 (planejado) | **Status:** ⚠️ Mock
**Pagina:** MonitoriaPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Monitoramento automatico de novos editais por termos de busca, com frequencia configuravel.

**Evidencia de mock:** Dados hardcoded (mockMonitoramentos). Interface local sem integracao backend. [CODIGO]

---

### Modulo M4: Inteligencia Competitiva (Concorrencia)
**Sprint:** 6 (planejado) | **Status:** ⚠️ Mock
**Pagina:** ConcorrenciaPage.tsx (203 linhas)
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Analise de concorrentes com historico de vitorias/derrotas e taxa de sucesso.

**Evidencia de mock:** Dados hardcoded (mockConcorrentes). Nao importa API client. [CODIGO]

---

### Modulo M5: Mercado TAM/SAM/SOM
**Sprint:** 8 (planejado) | **Status:** ⚠️ Mock
**Pagina:** MercadoPage.tsx
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Analise de tamanho de mercado com tendencias mensais e categorias de demanda.

**Evidencia de mock:** Dados hardcoded (mockTendencias, mockCategorias). Nao importa API client. [CODIGO]

---

### Modulo M6: Analise de Perdas
**Sprint:** 6 (planejado) | **Status:** ⚠️ Mock
**Pagina:** PerdasPage.tsx (186 linhas)
**Confirmacao:** [CODIGO]

**Objetivo planejado:** Analise de licitacoes perdidas com motivos (preco, tecnico, documentacao, prazo) e benchmarks.

**Evidencia de mock:** Dados hardcoded (mockPerdas). Nao importa API client. Interface define motivos: "preco" | "tecnico" | "documentacao" | "prazo" | "outro". [CODIGO]

---

## Modulo Transversal: Chat com IA

**Sprint:** 1-5 (evoluiu a cada sprint) | **Status:** ✅ Implementado
**Componentes:** FloatingChat.tsx, ChatArea.tsx, ChatInput.tsx
**Confirmacao:** [CODIGO]

**Objetivo:** Oferecer interface de chat com acesso a todas as 76 tools de IA via linguagem natural.

**Telas e Componentes:**
- FloatingChat: balao flutuante em todas as paginas
- ChatArea: area de mensagens com markdown rendering
- ChatInput: input com upload de arquivos
- Sessoes persistentes com historico

**Endpoints:**
- POST /api/chat/send — envia mensagem
- GET /api/chat/sessions — lista sessoes
- POST /api/chat/sessions — cria sessao
- GET /api/chat/sessions/{id}/messages — historico de mensagens

**Tools de IA:**
- 76 tools acessiveis via linguagem natural (TOOLS_MAP em tools.py) [CODIGO]
- DeepSeek classifica intencao e roteia para tool adequada [CODIGO]

**Fluxos funcionais:**
1. Usuario abre chat flutuante em qualquer pagina
2. Digita pergunta ou solicitacao em linguagem natural
3. DeepSeek classifica intencao e seleciona tool adequada
4. Tool executa acao (buscar edital, gerar proposta, analisar documento, etc.)
5. Resposta exibida com formatacao markdown e fontes/referencias
6. Historico persistido em sessoes

**Regras de negocio:**
- RN-CHAT-001: Cada sessao tem historico persistente [CODIGO]
- RN-CHAT-002: Upload de arquivos suportado no chat [CODIGO]
- RN-CHAT-003: 76 tools registradas em TOOLS_MAP [CODIGO]

**Integracoes:**
- DeepSeek (classificacao de intencao e execucao de tools)
- Todas as APIs internas (via tools)

**Divergencias documentacao vs implementacao:**
- Chat generico originalmente era usado para chamar tools de IA das paginas — corrigido para usar endpoints diretos (commit 89f4472) [CODIGO]

---

## 3. Situacao por Sprint

| Sprint | Tema | Planejado | Implementado | Status |
|--------|------|-----------|-------------|--------|
| **1** | Infraestrutura + Cadastros | Dashboard, Empresa, Portfolio, Parametrizacoes, Auth | Dashboard, Empresa, Portfolio, Parametrizacoes, Auth, Chat, CRUD generico | ✅ Concluida — entregou MAIS que o planejado (CRUD generico e Chat nao estavam no plano original) [CODIGO] |
| **2** | Captacao + Validacao | CaptacaoPage, ValidacaoPage | CaptacaoPage, ValidacaoPage com scores 6D e busca multifonte | ✅ Concluida — conforme planejado [CODIGO] |
| **3** | Precificacao + Proposta + Submissao | PrecificacaoPage, PropostaPage, SubmissaoPage | PrecificacaoPage (5 camadas), PropostaPage (geracao IA + ANVISA), SubmissaoPage (checklist + Smart Split) | ✅ Concluida — conforme planejado [CODIGO] |
| **4** | Impugnacao + Recursos | ImpugnacaoPage, RecursosPage | ImpugnacaoPage (validacao legal + peticao), RecursosPage (13 UCs: analise vencedora, chatbox, laudo recurso, contra-razao, submissao assistida) | ✅ Concluida — conforme planejado [CODIGO] |
| **5** | Follow-up + Atas + Contratos + Contratado x Realizado | FollowupPage, AtasPage, ProducaoPage, ContratadoRealizadoPage | FollowupPage (resultado + auto-contrato), AtasPage (PNCP + carona), ProducaoPage (entregas + aditivos + designacoes), ContratadoRealizadoPage (dashboard comparativo) | ✅ Concluida — conforme planejado [CODIGO] |
| **6** | CRM + Perdas + Concorrencia | CRMPage, PerdasPage, ConcorrenciaPage com backend real | Paginas mock existem no frontend mas sem backend | ❌ Nao iniciada [CODIGO] |
| **7** | Flags + Monitoria + Auditoria + SMTP | FlagsPage, MonitoriaPage com backend real | Paginas mock existem no frontend mas sem backend | ❌ Nao iniciada [CODIGO] |
| **8** | Mercado TAM/SAM/SOM + Analytics | MercadoPage com backend real | Pagina mock existe no frontend mas sem backend | ❌ Nao iniciada [CODIGO] |
| **9** | Dispensas + Classes/Subclasses | Dispensas eletronicas | Nao iniciada | ❌ Nao iniciada |
| **10** | Lances + Health Check + QA | LancesPage com integracao ComprasNet | Pagina mock existe no frontend mas sem backend | ❌ Nao iniciada [CODIGO] |

---

## 4. Divergencias Conhecidas

### D-001: Chat generico usado como substituto de endpoints diretos [CORRIGIDO]
**Descricao:** Frontend de varias paginas chamava sendMessage (chat) para executar tools de IA em vez de usar endpoints REST dedicados. Isso causava respostas inconsistentes e problemas de UX.
**Correcao:** Commit 89f4472 — endpoints diretos criados para cada tool de IA usada pelas paginas.
**Marcacao:** [CODIGO]

### D-002: Token de autenticacao com chave errada [CORRIGIDO]
**Descricao:** 7 paginas usavam localStorage.getItem("token") em vez de "editais_ia_access_token", causando falha de autenticacao.
**Correcao:** Commit 2c88ab9 — padronizado para "editais_ia_access_token".
**Marcacao:** [CODIGO]

### D-003: db.session vs db.query em endpoints Sprint 5 [CORRIGIDO]
**Descricao:** 70 linhas em endpoints Sprint 5 usavam db.session.query em vez de db.query, incompativel com o padrao do sistema.
**Correcao:** Commit e9d1d52.
**Marcacao:** [CODIGO]

### D-004: Pool MySQL subdimensionado [CORRIGIDO]
**Descricao:** pool_size=5 (default SQLAlchemy) causava esgotamento de conexoes sob carga.
**Correcao:** Commit e9d1d52 — pool_size=20, max_overflow=30.
**Marcacao:** [CODIGO]

### D-005: Filtro de pendentes no Follow-up incompleto [CORRIGIDO]
**Descricao:** Endpoint de pendentes filtrava apenas status "submetido", excluindo editais com status "proposta_enviada" e "em_pregao".
**Correcao:** Commit 3cdd5d4.
**Marcacao:** [CODIGO]

### D-006: CRUD de recursos com nome errado [CORRIGIDO]
**Descricao:** Frontend chamava crudList("recursos") mas tabela CRUD esta registrada como "recursos-detalhados".
**Correcao:** Commit 1007e0a.
**Marcacao:** [CODIGO]

### D-007: Geracao de proposta via chat em vez de inline [CORRIGIDO]
**Descricao:** PropostaPage usava chat para gerar proposta, resultando em proposta aparecendo na janela de chat em vez de na pagina.
**Correcao:** Commit f21aa2b — geracao inline sem chat.
**Marcacao:** [CODIGO]

### D-008: Erro de tipo datetime na subtracoes de cronograma [CORRIGIDO]
**Descricao:** Cronograma misturava datetime.date e datetime.datetime em operacoes de subtracao.
**Correcao:** Commit e9d1d52.
**Marcacao:** [CODIGO]

### D-009: Paginas mock coexistem com paginas reais no sidebar
**Descricao:** O sidebar apresenta todas as 23 paginas sem distincao visual entre implementadas e mock. Usuario pode acessar pagina mock sem saber que os dados sao ficticios.
**Correcao:** Nao corrigido — seria necessario badge ou indicador visual.
**Marcacao:** [CODIGO]

### D-010: PortfolioPage com dupla camada de acesso a dados
**Descricao:** PortfolioPage importa TANTO API direta (getProdutos, getProduto, getProdutoCompletude) do client.ts QUANTO CRUD generico (crudList, crudCreate, crudUpdate, crudDelete). Isso cria duas vias de acesso que podem divergir.
**Marcacao:** [CODIGO]

---

## 5. Pontos Duvidosos

### PD-001: Scheduler APScheduler — estabilidade em producao [DUVIDOSO]
O scheduler roda em thread separada dentro do Flask. Em producao com Gunicorn (multiplos workers), cada worker criaria sua propria instancia do scheduler, duplicando execucoes. Necessario verificar se ha lock ou worker unico para scheduler.

### PD-002: Smart Split PDF — comportamento real [DUVIDOSO]
SubmissaoPage menciona Smart Split PDF para fracionamento, mas nao foi possivel confirmar se a logica de fracionamento esta implementada no backend ou e apenas um placeholder. Necessita execucao para confirmar.

### PD-003: Busca automatica de certidoes — taxa de sucesso [DUVIDOSO]
certidao_browser.py usa CAPSolver para resolver CAPTCHAs, mas a taxa de sucesso e tempo de execucao nao foram verificados. Sites governamentais mudam layouts frequentemente.

### PD-004: Limites de carona — validacao server-side completa [DUVIDOSO]
Documentacao afirma validacao server-side nos limites de carona (50% individual, 2x global), mas a implementacao exata no endpoint POST nao foi verificada por execucao.

### PD-005: RAG (rag.py) — uso real no sistema [DUVIDOSO]
Arquivo rag.py existe no backend mas nao esta claro quais funcionalidades o utilizam. Pode ser usado para indexacao de PDFs de editais para consulta via chat, mas necessita verificacao.

### PD-006: Alertas email e WhatsApp — configuracao SMTP [DUVIDOSO]
Sistema menciona alertas multi-canal (email, WhatsApp) mas SMTP esta planejado para Sprint 7. Necessario verificar se email ja funciona ou e apenas notificacao in-app.

### PD-007: Gerador de documentos (gerador_documentos.py) — formatos suportados [DUVIDOSO]
Documentacao menciona export PDF/DOCX mas nao foi confirmado por execucao quais templates e formatos estao efetivamente funcionais.

### PD-008: Concorrencia de acesso a dados multiempresa [DUVIDOSO]
Sistema suporta multiplas empresas por usuario (switch de empresa). Necessario verificar se todos os endpoints respeitam o escopo de empresa ativa e nao vazam dados entre empresas.

### PD-009: Performance do DeepSeek com 76 tools [DUVIDOSO]
Com 76 tools no TOOLS_MAP, a classificacao de intencao pelo DeepSeek pode ter dificuldade em rotear corretamente para a tool adequada. Necessario verificar taxa de acerto do roteamento.

### PD-010: Endpoint antigo de contratacoes — ainda existe? [DUVIDOSO]
O endpoint antigo /contratacoes/publicacao com sub-janelas foi abandonado por lentidao (~200s+). Necessario verificar se o codigo morto foi removido ou se ainda existe no app.py.

---

## Anexo A: Resumo Quantitativo

| Metrica | Valor | Marcacao |
|---------|-------|----------|
| Paginas frontend total | 23 | [CODIGO] |
| Paginas funcionais (backend real) | 16 | [CODIGO] |
| Paginas mock | 7 | [CODIGO] |
| Endpoints REST | 119 | [CODIGO] |
| Tools de IA | 76 | [CODIGO] |
| Modelos SQLAlchemy | 69 | [CODIGO] |
| Tabelas CRUD generico | 66 | [CODIGO] |
| Testes Playwright | 31 specs, 617 cases | [CODIGO] |
| Linhas backend (Python) | ~34.347 | [CODIGO] |
| Linhas frontend (TypeScript) | ~25.352 | [CODIGO] |
| Sprints concluidas | 5 | [CODIGO] |
| Sprints pendentes | 5 (6-10) | [CODIGO] |
| Bugs corrigidos (sessao autoresearch) | 7 | [CODIGO] |
| Regras de negocio mapeadas | 10 criticas + 30+ secundarias | [CODIGO] |

## Anexo B: Mapa de Arquivos Principais

| Camada | Arquivo | Linhas | Funcao |
|--------|---------|--------|--------|
| Backend | app.py | ~14.100 | Aplicacao Flask, 119 endpoints |
| Backend | models.py | ~3.100 | 69 modelos SQLAlchemy |
| Backend | tools.py | ~11.000 | 76 tools de IA |
| Backend | crud_routes.py | ~1.100 | CRUD generico 66 tabelas |
| Backend | llm.py | — | Wrapper DeepSeek |
| Backend | scheduler.py | — | APScheduler |
| Backend | prompts.py | — | Templates de prompts |
| Backend | gerador_documentos.py | — | Geracao PDF/DOCX |
| Backend | calculadora.py | — | Calculos de precificacao |
| Backend | calculadora_ia.py | — | Calculos assistidos por IA |
| Backend | certidao_browser.py | — | Busca de certidoes via browser |
| Backend | rag.py | — | Retrieval Augmented Generation |
| Frontend | App.tsx | — | Roteamento e layout principal |
| Frontend | Sidebar.tsx | — | Menu lateral com 3 secoes |
| Frontend | FloatingChat.tsx | — | Chat flutuante |
| Frontend | ValidacaoPage.tsx | ~2.300 | Maior pagina do sistema |
| Frontend | RecursosPage.tsx | 951 | Recursos e contra-razoes |
| Frontend | ImpugnacaoPage.tsx | 806 | Impugnacao e esclarecimentos |
| Frontend | ContratadoRealizadoPage.tsx | ~800 | Dashboard comparativo |
| Frontend | ProducaoPage.tsx | ~700 | Execucao de contratos |
