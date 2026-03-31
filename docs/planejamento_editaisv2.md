# Planejamento de Sprints — facilicita.ia

**Projeto:** facilicita.ia — Plataforma SaaS para Licitacoes Publicas
**Inicio:** 23/02/2026
**Previsao de conclusao:** 01/05/2026
**Entregas:** Semanais (toda sexta-feira)
**Total:** 10 Sprints | 4 Ondas | 52 Tasks | 40 Requisitos Funcionais
**Execucao:** Claude Code Agent Teams (ate 6 agentes IA em paralelo)

---

## Visao Geral — Cronograma Semanal

| Sprint | Onda | Entrega | Semana | Data Entrega (sexta) | Status |
|--------|------|---------|--------|----------------------|--------|
| Sprint 1 | Onda 1 | Infraestrutura + Dashboard + Empresa + Parametros | Semana 1 | **27/02/2026** | EM ANDAMENTO |
| Sprint 2 | Onda 2 | Captacao + Validacao (fluxo completo) | Semana 2 | **06/03/2026** | EM ANDAMENTO |
| Sprint 3 | Onda 2 | Precificacao + Proposta + Submissao + Export | Semana 3 | **13/03/2026** | PENDENTE |
| Sprint 4 | Onda 3 | Impugnacao + Recurso + Disclaimers juridicos | Semana 4 | **20/03/2026** | PENDENTE |
| Sprint 5 | Onda 3 | Follow-up + Producao + Contratado x Realizado + Atas | Semana 5 | **27/03/2026** | PENDENTE |
| Sprint 6 | Onda 3 | CRM + Perdas + Concorrencia + Lead automatico | Semana 6 | **03/04/2026** | PENDENTE |
| Sprint 7 | Onda 3 | Flags + Monitoria + Auditoria + SMTP | Semana 7 | **10/04/2026** | PENDENTE |
| Sprint 8 | Onda 4 | Mercado (TAM/SAM/SOM) + Analytics + Aprendizado | Semana 8 | **17/04/2026** | PENDENTE |
| Sprint 9 | Onda 4 | Dispensas + Classes/Subclasses + Mascaras | Semana 9 | **24/04/2026** | PENDENTE |
| Sprint 10 | Onda 4 | Lances + Health Check + QA end-to-end | Semana 10 | **01/05/2026** | PENDENTE |

---

## SPRINT 1 — Infraestrutura de Conexao
**Onda 1 | Semana 1: 23/02 a 27/02/2026 | Status: EM ANDAMENTO**

### Objetivo
Habilitar a ponte de comunicacao chat↔pages em todas as 21 paginas e entregar as 3 primeiras paginas com dados reais.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **onSendToChat em todas as 21 pages** — Prop drilling de App.tsx para cada pagina, permitindo que qualquer botao envie mensagem ao chat da IA | T1 | RF-028 | App.tsx |
| 2 | **useChat.ts processa action_type e resultado** — Mensagens do backend com action_type e resultado propagadas para as pages | T2 | RF-028 | useChat.ts |
| 3 | **Dashboard com dados reais** — Cards de total de editais, editais por status, propostas, taxa de sucesso, valor contratado, editais por mes, proximos prazos. Endpoint GET /api/dashboard/stats | T3, T5 | RF-028 | Dashboard.tsx |
| 4 | **EmpresaPage com CRUD real** — Cadastro de empresa com 4 abas: dados principais, documentos habilitatorios, certidoes, responsaveis tecnicos. CRUD completo (criar, editar, excluir) para cada aba | T4 | RF-001, RF-002, RF-003 | EmpresaPage.tsx |
| 5 | **ParametrizacoesPage com CRUD real** — Configuracao de parametros de score (pesos tecnico, documental, juridico, logistico, comercial, limiares GO/NO-GO). CRUD de fontes de editais (PNCP, ComprasNET, BEC-SP, etc.) | T6 | RF-008, RF-009 | ParametrizacoesPage.tsx |
| 6 | **tool_calcular_aderencia le pesos do banco** — Helper _get_pesos_score() busca ParametroScore do usuario. Defaults se nao configurado | T7 | RF-009 | tools.py |

### Arquivos modificados
- `frontend/src/App.tsx` — onSendToChat para 20 pages + setDashboardTokenGetter
- `frontend/src/hooks/useChat.ts` — action_type e resultado na Message
- `frontend/src/types/index.ts` — interface PageProps
- `frontend/src/components/Dashboard.tsx` — GET /api/dashboard/stats
- `frontend/src/pages/EmpresaPage.tsx` — CRUD 4 tabelas
- `frontend/src/pages/ParametrizacoesPage.tsx` — CRUD 2 tabelas
- `backend/app.py` — endpoint GET /api/dashboard/stats
- `backend/tools.py` — _get_pesos_score()

---

## SPRINT 2 — Captacao + Validacao
**Onda 2 | Semana 2: 02/03 a 06/03/2026 | Status: EM ANDAMENTO**

### Objetivo
Entregar o fluxo completo Captacao → Validacao com dados reais, scores de IA em 6 dimensoes, e decisoes estrategicas persistidas.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **Endpoint REST GET /api/editais/buscar** — Encapsula scraper PNCP + calculo de score de aderencia. Params: termo, uf, modalidade, calcularScore, incluirEncerrados, limite | T8 | RF-010 | app.py |
| 2 | **Endpoint REST GET /api/editais/salvos** — Lista editais do usuario com scores e estrategias. Filtros por status, uf, categoria. Paginacao | T9 | RF-011 | app.py |
| 3 | **tool_calcular_scores_validacao (6 dimensoes)** — Score unificado: tecnico, documental, complexidade, juridico, logistico, comercial. Retorna score_geral, potencial_ganho, decisao_ia (GO/NO-GO/CONDICIONAL) | T10 | RF-011 | tools.py |
| 4 | **CaptacaoPage — busca real via REST** — Campo de busca com termo, filtros UF/Fonte/Tipo/Origem. Resultados em tabela com scores. Sem dados mock | T13 | RF-010 | CaptacaoPage.tsx |
| 5 | **CaptacaoPage — salvar editais via CRUD** — Botoes "Salvar Todos", "Salvar Score >= 70%", "Salvar Selecionados", salvar individual. Feedback de confirmacao | T14 | RF-010 | CaptacaoPage.tsx |
| 6 | **CaptacaoPage — intencao estrategica + margem** — RadioGroup (Estrategico/Defensivo/Acompanhamento/Aprendizado) + slider margem (0-50%). Persistido via CRUD estrategias-editais | T15 | RF-037 | CaptacaoPage.tsx |
| 7 | **CaptacaoPage — navegacao para Validacao** — Botao "Ir para Validacao" dispara CustomEvent navigate-to. App.tsx captura e navega | T16 | RF-010 | CaptacaoPage.tsx, App.tsx |
| 8 | **CaptacaoPage — monitoramento real** — Card mostra monitoramentos cadastrados (termo, status, UFs, contagem). Dados de crudList("monitoramentos") | T17 | RF-023 | CaptacaoPage.tsx |
| 9 | **ValidacaoPage — tabela real** — GET /api/editais/salvos. Filtro por status (novo/analisando/validado/descartado). Busca por texto. Sem dados mock | T18 | RF-011 | ValidacaoPage.tsx |
| 10 | **ValidacaoPage — scores reais via IA** — POST /api/editais/{id}/scores-validacao. 6 barras de score + score geral + potencial de ganho. Loading state | T19 | RF-011 | ValidacaoPage.tsx |
| 11 | **ValidacaoPage — aba Cognitiva** — "Gerar Resumo" e "Perguntar a IA" via POST /api/chat. Respostas renderizadas na pagina (nao no chat) | T20 | RF-011 | ValidacaoPage.tsx |
| 12 | **ValidacaoPage — decisao + justificativa** — Botoes Participar/Acompanhar/Ignorar. Modal de justificativa com motivo + detalhes. Persistido via CRUD validacao_decisoes | T21 | RF-011, RF-037 | ValidacaoPage.tsx |
| 13 | **ValidacaoPage — aba Objetiva** — Banner GO/NO-GO da IA, sub-scores tecnicos detalhados, certificacoes, checklist documental, analise de lote (aderente/intruso) | T22 | RF-011 | ValidacaoPage.tsx |
| 14 | **Cards de prazo** — Contagem de editais por faixa de prazo (2d, 5d, 10d, 20d) | — | RF-010 | CaptacaoPage.tsx |
| 15 | **Painel lateral de detalhes** — Score geral, 3 sub-scores, produto correspondente, potencial de ganho, analise de gaps | — | RF-010 | CaptacaoPage.tsx |

### Arquivos modificados
- `backend/app.py` — 3 endpoints novos (buscar, salvos, scores-validacao)
- `backend/tools.py` — tool_calcular_scores_validacao
- `frontend/src/App.tsx` — listener navigate-to
- `frontend/src/pages/CaptacaoPage.tsx` — reescrita completa
- `frontend/src/pages/ValidacaoPage.tsx` — reescrita completa

---

## SPRINT 3 — Precificacao + Proposta + Submissao
**Onda 2 | Semana 3: 09/03 a 13/03/2026 | Status: PENDENTE**

### Objetivo
Entregar o fluxo de precificacao, geracao de propostas e submissao com dados reais e export PDF/DOCX.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **tool_atualizar_status_proposta** — Workflow rascunho→revisao→aprovada→enviada. Validacao de transicoes. Endpoint PUT /api/propostas/{id}/status | T11 | RF-015 | app.py |
| 2 | **Endpoint export PDF/DOCX** — GET /api/propostas/{id}/export?formato=pdf/docx. Gera documento com dados do edital, produto, precos, texto tecnico | T12 | RF-014 | app.py |
| 3 | **PrecificacaoPage — busca de precos real** — Busca no historico via CRUD preco-historico. Estatisticas (media, min, max). Fallback para IA via chat | T23 | RF-013 | PrecificacaoPage.tsx |
| 4 | **PrecificacaoPage — recomendacao de preco** — Selecionar edital + produto. Preco sugerido baseado em historico (5% abaixo da media). Prompt para IA via chat | T23 | RF-013 | PrecificacaoPage.tsx |
| 5 | **PrecificacaoPage — historico de precos** — Tabela com produto, preco, data, edital, resultado (Ganho/Perdido) | T23 | RF-013 | PrecificacaoPage.tsx |
| 6 | **PropostaPage — gerar proposta real** — Formulario com selects de edital/produto do banco, preco, quantidade. Criar via crudCreate. Texto tecnico via IA | T24 | RF-014 | PropostaPage.tsx |
| 7 | **PropostaPage — preview e download** — Preview com todos os dados. Download PDF e DOCX via endpoint /api/propostas/{id}/export | T24 | RF-014 | PropostaPage.tsx |
| 8 | **PropostaPage — sugerir preco** — Icone lampada consulta historico + envia prompt ao chat | T24 | RF-013 | PropostaPage.tsx |
| 9 | **PropostaPage — excluir proposta** — crudDelete com confirmacao | T24 | RF-014 | PropostaPage.tsx |
| 10 | **SubmissaoPage — tabela de propostas** — Lista propostas do banco (exceto canceladas). Status: Aguardando, Enviada, Confirmada | T25 | RF-015 | SubmissaoPage.tsx |
| 11 | **SubmissaoPage — checklist de submissao** — 4 items: proposta tecnica, preco definido, documentos anexados (X/Y), revisao final | T25 | RF-015 | SubmissaoPage.tsx |
| 12 | **SubmissaoPage — workflow de status** — Botoes "Marcar como Enviada" → "Confirmar Envio". Transicoes validadas | T25 | RF-015 | SubmissaoPage.tsx |
| 13 | **SubmissaoPage — anexar documento** — Modal com tipo (Proposta, Certidao, Contrato, Procuracao), upload de arquivo, observacao | T25 | RF-015 | SubmissaoPage.tsx |
| 14 | **SubmissaoPage — abrir portal PNCP** — Link externo para pncp.gov.br | T25 | RF-015 | SubmissaoPage.tsx |

### Arquivos modificados
- `backend/app.py` — 2 endpoints novos (status, export)
- `backend/tools.py` — tool_atualizar_status_proposta
- `frontend/src/pages/PrecificacaoPage.tsx` — reescrita completa
- `frontend/src/pages/PropostaPage.tsx` — reescrita completa
- `frontend/src/pages/SubmissaoPage.tsx` — reescrita completa

---

## SPRINT 4 — Juridico (Impugnacao + Recurso + Disclaimers)
**Onda 3 | Semana 4: 16/03 a 20/03/2026 | Status: PENDENTE**

### Objetivo
Entregar as ferramentas juridicas com geracao de minutas via IA e disclaimers automaticos.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **tool_gerar_impugnacao** — LLM gera minuta de impugnacao com fundamentacao na Lei 14.133/2021. Identifica clausulas restritivas e termos direcionados | T19 | RF-012 | tools.py |
| 2 | **tool_gerar_recurso + tool_gerar_contra_razoes** — LLM gera textos juridicos de recurso administrativo e contra-razoes | T20 | RF-018 | tools.py |
| 3 | **ImpugnacaoPage — gerar textos via IA** — Remover mock. Botoes "Gerar Impugnacao", "Gerar Recurso", "Gerar Contra-Razoes" chamam onSendToChat. Resultado renderizado na pagina. Salvar rascunho via CRUD recursos | T21 | RF-012, RF-018 | ImpugnacaoPage.tsx |
| 4 | **Disclaimers juridicos automaticos** — Backend detecta respostas com conteudo juridico e adiciona disclaimer automaticamente. Texto legal sobre uso da IA como apoio, nao como assessoria juridica | T22 | RF-032 | app.py |
| 5 | **Componente DisclaimerJuridico** — Componente React reutilizavel que renderiza disclaimer com icone de alerta. Usado em ImpugnacaoPage e qualquer resposta juridica | T23 | RF-032 | components/ |

### Arquivos a modificar
- `backend/tools.py` — 3 tools novas
- `backend/app.py` — logica de deteccao de conteudo juridico
- `frontend/src/pages/ImpugnacaoPage.tsx` — reescrita
- `frontend/src/components/DisclaimerJuridico.tsx` — componente novo

---

## SPRINT 5 — Follow-up + Producao + Contratado + Atas
**Onda 3 | Semana 5: 23/03 a 27/03/2026 | Status: PENDENTE**

### Objetivo
Entregar as paginas de acompanhamento pos-licitacao e gestao de contratos.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **FollowupPage — registrar resultados** — Remover mock. Botoes "Registrar Vitoria" e "Registrar Derrota" via onSendToChat. Aciona tool_registrar_resultado. Lembrete de prazos via tool_configurar_alertas | T24 | RF-017 | FollowupPage.tsx |
| 2 | **tool_calcular_score_logistico** — Calcula viabilidade logistica: distancia UF empresa vs local de entrega, historico de entregas na regiao, custos de frete estimados | T25 | RF-011 | tools.py |
| 3 | **AtasPage — pagina nova** — 3 funcionalidades via IA: buscar atas no PNCP (tool_buscar_atas_pncp), baixar atas (tool_baixar_ata_pncp), extrair resultados de ata em PDF (tool_extrair_ata_pdf). Interface com upload de PDF e tabela de resultados | T26 | RF-035 | AtasPage.tsx (nova) |
| 4 | **ProducaoPage — CRUD contratos + entregas** — Remover mock. Lista de contratos com status. Registrar entregas, anexar NF, acompanhar cronograma. CRUD contrato-entregas | T27 | RF-020 | ProducaoPage.tsx |
| 5 | **Endpoint GET /api/dashboard/contratado-realizado** — Retorna dados de valor contratado vs valor realizado por periodo, produto e orgao | T29 | RF-021 | app.py |
| 6 | **ContratadoRealizadoPage — dashboard real** — Remover mock. Graficos/tabelas com dados do endpoint contratado-realizado. Filtros por periodo | T28 | RF-021 | ContratadoRealizadoPage.tsx |

### Arquivos a modificar
- `backend/tools.py` — tool_calcular_score_logistico
- `backend/app.py` — endpoint contratado-realizado
- `frontend/src/pages/FollowupPage.tsx` — reescrita
- `frontend/src/pages/AtasPage.tsx` — pagina nova
- `frontend/src/pages/ProducaoPage.tsx` — reescrita
- `frontend/src/pages/ContratadoRealizadoPage.tsx` — reescrita
- `frontend/src/components/Sidebar.tsx` — adicionar AtasPage

---

## SPRINT 6 — CRM + Perdas + Concorrencia
**Onda 3 | Semana 6: 30/03 a 03/04/2026 | Status: PENDENTE**

### Objetivo
Entregar o ciclo de pos-venda: CRM ativo, analise de perdas e inteligencia competitiva.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **CRMPage — CRUD leads + acoes pos-perda** — Remover mock. CRUD leads-crm com pipeline de contatos. Registrar interacoes. Acoes pos-perda com follow-up | T30 | RF-019 | CRMPage.tsx |
| 2 | **Endpoint GET /api/dashboard/perdas** — Retorna dados de licitacoes perdidas: motivos, valores, concorrentes vencedores, tendencias por periodo | T32 | RF-026 | app.py |
| 3 | **PerdasPage — dashboard real** — Remover mock. Graficos de motivos de perda, concorrentes frequentes, valores perdidos por periodo | T31 | RF-026 | PerdasPage.tsx |
| 4 | **Lead CRM criado automaticamente ao registrar derrota** — Quando tool_registrar_resultado registra derrota, cria automaticamente um lead no CRM com dados do orgao para reabordagem futura | T33 | RF-019, RF-026 | app.py |
| 5 | **ConcorrenciaPage — analise via IA** — Remover mock. Botao "Analisar Concorrente" via onSendToChat. Usa tool_listar_concorrentes e tool_analisar_concorrente. Exibe perfil, historico de precos e estrategia | T34 | RF-024 | ConcorrenciaPage.tsx |

### Arquivos a modificar
- `backend/app.py` — endpoint perdas + lead automatico
- `frontend/src/pages/CRMPage.tsx` — reescrita
- `frontend/src/pages/PerdasPage.tsx` — reescrita
- `frontend/src/pages/ConcorrenciaPage.tsx` — reescrita

---

## SPRINT 7 — Flags + Monitoria + Auditoria + SMTP
**Onda 3 | Semana 7: 06/04 a 10/04/2026 | Status: PENDENTE**

### Objetivo
Entregar o sistema de alertas, monitoramento, auditoria e notificacoes por email.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **FlagsPage — alertas via IA** — Remover mock. "Novo Alerta" e "Cancelar Alerta" via onSendToChat. Usa tools: tool_configurar_alertas, tool_listar_alertas, tool_cancelar_alerta, tool_dashboard_prazos, tool_calendario_editais | T35 | RF-022, RF-039 | FlagsPage.tsx |
| 2 | **MonitoriaPage — monitoramentos via IA** — Remover mock. "Novo Monitoramento", "Pausar", "Excluir". Usa tools: tool_configurar_monitoramento, tool_listar_monitoramentos, tool_desativar_monitoramento | T36 | RF-023 | MonitoriaPage.tsx |
| 3 | **Middleware auditoria** — Interceptor no crud_routes.py que loga todas as operacoes CRUD em auditoria_log (tabela ja existe). Registra: usuario, acao, tabela, registro, dados anteriores/novos, timestamp | T37 | RF-030 | crud_routes.py |
| 4 | **tool_analisar_documentos_empresa** — LLM verifica coerencia entre documentos da empresa: datas de vencimento, lacunas, inconsistencias. Retorna alertas e sugestoes | T38 | RF-004 | tools.py |
| 5 | **tool_verificar_pendencias_pncp** — Verifica pendencias e atualizacoes nos editais do usuario no PNCP. Retorna mudancas de status, retificacoes, novos anexos | T39 | RF-031 | tools.py |
| 6 | **SMTP producao + emails reais no scheduler** — Configurar envio de emails reais (alertas de prazo, resultados de monitoramento, notificacoes). Integrar com APScheduler existente | T40 | RF-039 | app.py |

### Arquivos a modificar
- `backend/tools.py` — 2 tools novas
- `backend/app.py` — configuracao SMTP
- `backend/crud_routes.py` — middleware auditoria
- `frontend/src/pages/FlagsPage.tsx` — reescrita
- `frontend/src/pages/MonitoriaPage.tsx` — reescrita

---

## SPRINT 8 — Mercado + Analytics + Aprendizado
**Onda 4 | Semana 8: 13/04 a 17/04/2026 | Status: PENDENTE**

### Objetivo
Entregar inteligencia de mercado, analytics avancado e pipeline de aprendizado continuo.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **tool_calcular_tam_sam_som** — Calcula Total Addressable Market, Serviceable Available Market e Serviceable Obtainable Market com base no portfolio, editais historicos e dados do PNCP | T41 | RF-025 | tools.py |
| 2 | **tool_detectar_itens_intrusos** — Analisa lotes de editais e identifica itens que nao se encaixam no portfolio da empresa (possivel direcionamento) | T42 | RF-038 | tools.py |
| 3 | **MercadoPage — TAM/SAM/SOM via IA** — Remover mock. Botao "Atualizar" calcula metricas de mercado via tool_calcular_tam_sam_som. Dashboard com graficos e indicadores | T43 | RF-025 | MercadoPage.tsx |
| 4 | **Pipeline de aprendizado** — Quando resultado e registrado: calcula delta (score previsto vs real), gera feedback para aprendizado_feedback, ajusta pesos futuros. Ciclo completo resultado→delta→feedback | T44 | RF-029 | app.py |
| 5 | **AnalyticsPage — pagina nova** — Cards com consultas pre-definidas (editais por UF, taxa de sucesso, valor medio, etc.) + consulta livre em linguagem natural. Usa tool_consulta_mindsdb (NL→SQL). 17 prompts analiticos ja existentes | T45 | RF-034 | AnalyticsPage.tsx (nova) |

### Arquivos a modificar
- `backend/tools.py` — 2 tools novas
- `backend/app.py` — pipeline aprendizado
- `frontend/src/pages/MercadoPage.tsx` — reescrita
- `frontend/src/pages/AnalyticsPage.tsx` — pagina nova
- `frontend/src/components/Sidebar.tsx` — adicionar AnalyticsPage

---

## SPRINT 9 — Dispensas + Classes + Mascaras
**Onda 4 | Semana 9: 20/04 a 24/04/2026 | Status: PENDENTE**

### Objetivo
Entregar funcionalidades avancadas de configuracao: dispensas, classificacao de produtos e mascaras de descricao.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **CaptacaoPage aba Dispensas** — Filtro dedicado para dispensas de licitacao via CRUD. Lista dispensas abertas com opcao de acompanhamento | T46 | RF-027 | CaptacaoPage.tsx |
| 2 | **tool_gerar_classes_portfolio** — LLM analisa portfolio de produtos e sugere arvore de classes/subclasses (ex: Equipamentos Laboratoriais > Microscopios > Opticos) | T48 | RF-006 | tools.py |
| 3 | **tool_aplicar_mascara_descricao** — Aplica template de descricao por classe ao gerar propostas. Padroniza formato conforme tipo de produto | T48 | RF-007 | tools.py |
| 4 | **ParametrizacoesPage aba Classes** — CRUD classes/subclasses de produto. Botao "Gerar com IA" usa tool_gerar_classes_portfolio. Configuracao de campos por classe | T47 | RF-006 | ParametrizacoesPage.tsx |

### Arquivos a modificar
- `backend/tools.py` — 2 tools novas
- `frontend/src/pages/CaptacaoPage.tsx` — aba dispensas
- `frontend/src/pages/ParametrizacoesPage.tsx` — aba classes

---

## SPRINT 10 — Lances + Infraestrutura + QA
**Onda 4 | Semana 10: 27/04 a 01/05/2026 | Status: PENDENTE**

### Objetivo
Entregar a ultima pagina funcional (Lances), infraestrutura de monitoramento e testes end-to-end completos.

### Entregas

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **tool_simular_lance** — Simula cenarios de lances com margem minima, decrementos e estrategia agressiva/conservadora. Retorna tabela de simulacao | T49 | RF-016 | tools.py |
| 2 | **tool_sugerir_lance** — Sugere o lance ideal baseado em historico de precos, concorrentes conhecidos e margem desejada | T49 | RF-016 | tools.py |
| 3 | **LancesPage — simular e sugerir via IA** — Remover mock. "Simular Lance" e "Sugerir Lance" via onSendToChat. Interface com parametros (margem, decrementos) e tabela de resultados. Link para sala de disputa | T50 | RF-016 | LancesPage.tsx |
| 4 | **/api/health + logging estruturado** — Endpoint de health check que verifica: backend, banco MySQL, LLM (DeepSeek), scheduler. Logging estruturado com niveis e rotacao | T51 | RNF-003 | app.py |
| 5 | **QA end-to-end completo** — Testes automatizados cobrindo todos os 40 RFs. Testes de integracao (backend), testes de UI (Playwright), testes de fluxo completo (captacao→validacao→proposta→submissao) | T52 | Todos | tests/ |

### Criterios de aceite finais
- [ ] 23/23 paginas com dados reais (0 mock)
- [ ] 40/40 requisitos funcionais implementados
- [ ] ~62 tools backend (49 existentes + 13 novas)
- [ ] ~55 botoes de IA funcionais
- [ ] Frontend compila sem erros TypeScript
- [ ] Testes end-to-end passando
- [ ] Export PDF/DOCX funcional
- [ ] Emails de alerta enviando
- [ ] Auditoria logando operacoes
- [ ] Health check funcional

### Arquivos a modificar
- `backend/tools.py` — 2 tools novas
- `backend/app.py` — /api/health + logging
- `frontend/src/pages/LancesPage.tsx` — reescrita
- `backend/tests/` — suite de testes completa

---

## Inventario Completo — 40 Requisitos Funcionais

| RF | Descricao | Sprint | Onda | Status |
|----|-----------|--------|------|--------|
| RF-001 | Cadastro da Empresa | Sprint 1 | Onda 1 | CONCLUIDO |
| RF-002 | Documentos Habilitativos | Sprint 1 | Onda 1 | CONCLUIDO |
| RF-003 | Certidoes Automaticas | Sprint 1 (CRUD) + Sprint 7 (IA) | Onda 1+3 | PARCIAL |
| RF-004 | Alertas IA sobre Documentos | Sprint 7 | Onda 3 | PENDENTE |
| RF-005 | Portfolio de Produtos | Pre-existente | — | CONCLUIDO |
| RF-006 | Classes/Subclasses de Produto | Sprint 9 | Onda 4 | PENDENTE |
| RF-007 | Mascara de Descricao | Sprint 9 | Onda 4 | PENDENTE |
| RF-008 | Fontes de Editais | Sprint 1 | Onda 1 | CONCLUIDO |
| RF-009 | Parametros de Score | Sprint 1 | Onda 1 | CONCLUIDO |
| RF-010 | Captacao de Editais | Sprint 2 | Onda 2 | CONCLUIDO |
| RF-011 | Validacao/Analise Multi-dimensional | Sprint 2 | Onda 2 | CONCLUIDO |
| RF-012 | Impugnacao | Sprint 4 | Onda 3 | PENDENTE |
| RF-013 | Precificacao | Sprint 3 | Onda 2 | CONCLUIDO |
| RF-014 | Proposta Tecnica | Sprint 3 | Onda 2 | CONCLUIDO |
| RF-015 | Submissao | Sprint 3 | Onda 2 | CONCLUIDO |
| RF-016 | Disputa de Lances | Sprint 10 | Onda 4 | PENDENTE |
| RF-017 | Follow-up de Resultados | Sprint 5 | Onda 3 | PENDENTE |
| RF-018 | Recurso/Contra-Razoes | Sprint 4 | Onda 3 | PENDENTE |
| RF-019 | CRM Ativo | Sprint 6 | Onda 3 | PENDENTE |
| RF-020 | Execucao de Contrato | Sprint 5 | Onda 3 | PENDENTE |
| RF-021 | Contratado x Realizado | Sprint 5 | Onda 3 | PENDENTE |
| RF-022 | Flags/Alertas | Sprint 7 | Onda 3 | PENDENTE |
| RF-023 | Monitoria | Sprint 7 | Onda 3 | PENDENTE |
| RF-024 | Concorrencia | Sprint 6 | Onda 3 | PENDENTE |
| RF-025 | Mercado TAM/SAM/SOM | Sprint 8 | Onda 4 | PENDENTE |
| RF-026 | Perdas | Sprint 6 | Onda 3 | PENDENTE |
| RF-027 | Dispensas | Sprint 9 | Onda 4 | PENDENTE |
| RF-028 | Interface Hibrida (Chat + Pages) | Sprint 1 | Onda 1 | CONCLUIDO |
| RF-029 | Aprendizado Continuo | Sprint 8 | Onda 4 | PENDENTE |
| RF-030 | Governanca/Auditoria | Sprint 7 | Onda 3 | PENDENTE |
| RF-031 | Pendencias PNCP | Sprint 7 | Onda 3 | PENDENTE |
| RF-032 | Suporte Juridico IA | Sprint 4 | Onda 3 | PENDENTE |
| RF-033 | Autenticacao Multi-tenant | Pre-existente | — | CONCLUIDO |
| RF-034 | Analytics MindsDB | Sprint 8 | Onda 4 | PENDENTE |
| RF-035 | Atas de Pregao | Sprint 5 | Onda 3 | PENDENTE |
| RF-036 | Analise Upload Edital | Pre-existente | — | CONCLUIDO |
| RF-037 | Estrategia Comercial | Sprint 2 | Onda 2 | CONCLUIDO |
| RF-038 | Itens Intrusos | Sprint 8 | Onda 4 | PENDENTE |
| RF-039 | Alertas de Prazo (email) | Sprint 7 | Onda 3 | PENDENTE |
| RF-040 | Documentos Gerados | Pre-existente | — | CONCLUIDO |

---

## Inventario de Tools Backend

### Existentes (49 tools — funcionais)
tool_web_search, tool_buscar_editais_scraper, tool_buscar_links_editais, tool_cadastrar_fonte, tool_listar_fontes, tool_buscar_editais_fonte, tool_buscar_atas_pncp, tool_download_arquivo, tool_processar_upload, tool_extrair_especificacoes, tool_reprocessar_produto, tool_extrair_ata_pdf, tool_baixar_ata_pncp, tool_extrair_datas_edital, tool_atualizar_produto, tool_excluir_produto, tool_listar_produtos, tool_verificar_completude_produto, tool_atualizar_edital, tool_excluir_edital, tool_excluir_editais_multiplos, tool_listar_editais, tool_extrair_requisitos, tool_classificar_edital, tool_salvar_editais_selecionados, tool_buscar_itens_edital_pncp, tool_buscar_arquivos_edital_pncp, tool_baixar_pdf_pncp, tool_buscar_precos_pncp, tool_historico_precos, tool_recomendar_preco, tool_listar_concorrentes, tool_analisar_concorrente, tool_calcular_aderencia, tool_calcular_score_aderencia, tool_gerar_proposta, tool_registrar_resultado, tool_consulta_mindsdb, tool_configurar_alertas, tool_listar_alertas, tool_cancelar_alerta, tool_dashboard_prazos, tool_calendario_editais, tool_configurar_monitoramento, tool_listar_monitoramentos, tool_desativar_monitoramento, tool_configurar_preferencias_notificacao, tool_historico_notificacoes, tool_marcar_notificacao_lida

### Criadas na Onda 2 (2 tools)
tool_calcular_scores_validacao, tool_atualizar_status_proposta

### A criar nas Ondas 3-4 (11 tools)

| Tool | Sprint | Onda | RF |
|------|--------|------|-----|
| tool_gerar_impugnacao | Sprint 4 | Onda 3 | RF-012 |
| tool_gerar_recurso | Sprint 4 | Onda 3 | RF-018 |
| tool_gerar_contra_razoes | Sprint 4 | Onda 3 | RF-018 |
| tool_calcular_score_logistico | Sprint 5 | Onda 3 | RF-011 |
| tool_analisar_documentos_empresa | Sprint 7 | Onda 3 | RF-004 |
| tool_verificar_pendencias_pncp | Sprint 7 | Onda 3 | RF-031 |
| tool_calcular_tam_sam_som | Sprint 8 | Onda 4 | RF-025 |
| tool_detectar_itens_intrusos | Sprint 8 | Onda 4 | RF-038 |
| tool_gerar_classes_portfolio | Sprint 9 | Onda 4 | RF-006 |
| tool_aplicar_mascara_descricao | Sprint 9 | Onda 4 | RF-007 |
| tool_simular_lance + tool_sugerir_lance | Sprint 10 | Onda 4 | RF-016 |

**Total apos conclusao: ~62 tools**

---

## Inventario de Paginas (24 pages)

| # | Pagina | Tipo | Sprint | Status |
|---|--------|------|--------|--------|
| 1 | LoginPage | Auth | Pre-existente | CONCLUIDA |
| 2 | RegisterPage | Auth | Pre-existente | CONCLUIDA |
| 3 | Dashboard | Painel | Sprint 1 | CONCLUIDA |
| 4 | PortfolioPage | CRUD + IA | Pre-existente | CONCLUIDA |
| 5 | EmpresaPage | CRUD | Sprint 1 | CONCLUIDA |
| 6 | ParametrizacoesPage | CRUD | Sprint 1 + 9 | PARCIAL |
| 7 | CaptacaoPage | REST + IA | Sprint 2 + 9 | PARCIAL |
| 8 | ValidacaoPage | REST + IA | Sprint 2 | CONCLUIDA |
| 9 | PrecificacaoPage | CRUD + IA | Sprint 3 | CONCLUIDA |
| 10 | PropostaPage | CRUD + IA | Sprint 3 | CONCLUIDA |
| 11 | SubmissaoPage | CRUD | Sprint 3 | CONCLUIDA |
| 12 | ImpugnacaoPage | CRUD + IA | Sprint 4 | PENDENTE |
| 13 | FollowupPage | CRUD + IA | Sprint 5 | PENDENTE |
| 14 | AtasPage | IA (nova) | Sprint 5 | PENDENTE |
| 15 | ProducaoPage | CRUD | Sprint 5 | PENDENTE |
| 16 | ContratadoRealizadoPage | Dashboard | Sprint 5 | PENDENTE |
| 17 | CRMPage | CRUD | Sprint 6 | PENDENTE |
| 18 | PerdasPage | Dashboard | Sprint 6 | PENDENTE |
| 19 | ConcorrenciaPage | IA | Sprint 6 | PENDENTE |
| 20 | FlagsPage | IA | Sprint 7 | PENDENTE |
| 21 | MonitoriaPage | IA | Sprint 7 | PENDENTE |
| 22 | MercadoPage | IA | Sprint 8 | PENDENTE |
| 23 | AnalyticsPage | IA (nova) | Sprint 8 | PENDENTE |
| 24 | LancesPage | IA | Sprint 10 | PENDENTE |

---

## Metricas de Progresso

| Metrica | Antes (02/03) | Apos Onda 1 | Apos Onda 2 | Meta final |
|---------|---------------|-------------|-------------|------------|
| Pages com dados reais | 3/21 | 6/21 | 11/21 | 23/23 |
| Pages com onSendToChat | 1/21 | 21/21 | 21/21 | 23/23 |
| Tools backend | 49 | 49 | 51 | ~62 |
| Botoes IA funcionais | ~10 | ~10 | ~30 | ~55 |
| RFs implementados | ~12/40 | 17/40 | 24/40 | 40/40 |
| Endpoints REST | 0 | 1 | 6 | ~10 |

---

*Documento gerado em 05/03/2026 — facilicita.ia v4.0*
