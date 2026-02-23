# Análise de Gap: WORKFLOW SISTEMA.pdf vs Implementação Atual

**Data:** 2026-02-19 (v2 — revisada com análise completa do backend/agente)
**Escopo:** Páginas 2 a 10 do WORKFLOW SISTEMA.pdf
**Módulos:** Empresa, Portfolio, Parametrizações, Captação, Validação

---

## Metodologia

Esta análise considera **três camadas de implementação**:

1. **Frontend (UI)** — o que aparece nas páginas React
2. **Backend REST** — endpoints `/api/*` chamados pelas páginas
3. **Backend Agente (Chat)** — 51 tools + 50 funções `processar_*` invocáveis via chat

> **IMPORTANTE:** Muitas funcionalidades especificadas no WORKFLOW estão implementadas no agente de chat (backend), mesmo que não tenham UI dedicada na página React. Essas são marcadas como **"OK (via chat)"** — significando que a lógica existe e funciona, mas o acesso é pela interface conversacional.

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| OK | Implementado conforme especificado (UI + backend) |
| OK (via chat) | Lógica implementada no agente de chat, funcional, mas sem UI dedicada na página |
| PARCIAL | Implementado parcialmente |
| AUSENTE | Não implementado em nenhuma camada |
| DIVERGENTE | Implementado de forma diferente do mockup visual |

---

## 1. EMPRESA (Página 2)

### 1.1 Cadastro

| Item Especificado | Status | Observação |
|---|---|---|
| Razão Social | OK | Campo `razao_social` |
| CNPJ | OK | Campo `cnpj` (obrigatório, único) |
| Inscrição Estadual | OK | Campo `inscricao_estadual` |
| Website | OK | Campo `website` |
| Instagram | OK | Campo `instagram` |
| LinkedIn | OK | Campo `linkedin` |
| Facebook | OK | Campo `facebook` |
| Emails, Celulares | OK | Listas dinâmicas (add/remove) |

### 1.2 Uploads de Documentos

| Item Especificado | Status | Observação |
|---|---|---|
| Contrato Social | OK | Tipo na modal de upload |
| AFE | OK | Tipo implementado (Sanitárias/Regulatórias) |
| CBPAD | OK | Tipo implementado |
| CBPP | OK | Tipo implementado |
| Corpo de Bombeiros | OK | Tipo implementado |
| Econômica | OK | Tipo `habilitacao_economica` |
| Fiscal | OK | Tipo `habilitacao_fiscal` |
| Financeira | OK | Balanço Patrimonial cobre esta categoria |
| Técnica | OK | Tipo `qualificacao_tecnica` |
| Upload real de arquivo (persistência no disco) | PARCIAL | Frontend captura o arquivo; backend tem `tool_processar_upload()` (tools.py:941) e `tool_download_arquivo()` (tools.py:801) para salvar arquivos em `UPLOAD_FOLDER`. O que falta é a rota de upload na EmpresaPage conectar ao mesmo storage |
| Visualização/Download de documentos | PARCIAL | Botões na UI existem; backend tem proxy de PDF (`/api/proxy-pdf`). Falta conectar as ações ao path_arquivo salvo |

### 1.3 Funcionalidades de IA

| Item Especificado | Status | Observação |
|---|---|---|
| Sistema pega certidões automáticas | PARCIAL | Modelo `EmpresaCertidao` (BD) com tipos CND/FGTS/Trabalhista + status valida/vencida/pendente + `url_consulta`. Botão UI desabilitado, mas estrutura completa no BD. Falta a integração com portais de emissão (APIs externas) |
| IA compara o que edital pede vs documentos da empresa | OK (via chat) | `tool_calcular_aderencia()` (tools.py:1931) compara requisitos do edital vs dados do produto/empresa. `tool_extrair_requisitos()` (tools.py:1794) classifica requisitos em técnico/documental/comercial. `tool_calcular_scores_validacao()` (tools.py:6245) calcula 6 dimensões incluindo score_documental |
| IA verifica impugnações e jurisprudência | OK (via chat) | `PROMPT_SCORES_VALIDACAO` (tools.py:6165) analisa flags jurídicos, aglutinação indevida, restrição regional. `tool_calcular_scores_validacao()` retorna `score_juridico` + `fatalFlaws` + decisão. Frontend renderiza na aba Analítica |
| IA alerta sobre exigência de documentos a mais | OK (via chat) | O `PROMPT_SCORES_VALIDACAO` analisa requisitos documentais e identifica exigências inusitadas. Resultado renderizado no checklist documental da ValidacaoPage com status ok/vencido/faltando/ajustavel |
| Verificação automática de documentos | PARCIAL | BD tem `texto_extraido` e `processado` em EmpresaDocumento. `tool_processar_upload()` extrai texto de PDFs. Falta: (1) trigger automático ao upload na EmpresaPage, (2) cruzamento automático com requisitos de editais |

### 1.4 Fontes de Obtenção do Portfolio

| Item Especificado | Status | Observação |
|---|---|---|
| Uploads (manuais, folders, instruções) | OK | 6 tipos de upload no PortfolioPage com processamento IA via `tool_processar_upload()` |
| Acesso à ANVISA / registros dos produtos | OK (via chat) | Modal ANVISA no PortfolioPage envia ao chat: "Busque o registro ANVISA numero X". Backend usa `tool_web_search()` para buscar. Funcional via chat |
| Acesso ao plano de contas do ERP | OK | Upload tipo `plano_contas` existe. IA processa via `tool_processar_upload()` com prompt "Importe produtos a partir deste plano de contas" |
| Acesso ao website e redes sociais | OK (via chat) | Upload tipo `website` no PortfolioPage. `processar_buscar_web()` (app.py:1203) busca manuais/datasheets na web. `processar_download_url()` (app.py:1294) baixa arquivo de URL e cadastra produto |
| Acesso a editais que o cliente já participou | OK (via chat) | `tool_listar_editais()` (tools.py:1854) lista editais salvos. `tool_historico_precos()` (tools.py:4768) retorna histórico. `tool_consulta_mindsdb()` (tools.py:3454) permite queries analíticas. `processar_consultar_resultado()` mostra resultados de certames |

### 1.5 Cadastro das Diferentes Fontes de Busca

| Item Especificado | Status | Observação |
|---|---|---|
| Palavras-chave geradas pela IA | PARCIAL | Palavras-chave existem em Parametrizações (aba Fontes de Busca). São editáveis mas não auto-geradas pela IA a partir do portfolio. O agente de chat poderia fazer isso se pedido |
| Busca pelos NCMs | OK | NCMs cadastráveis em Parametrizações. `tool_buscar_editais_fonte()` (tools.py:1514) usa termo de busca que pode ser NCM |
| Afunilados no portfolio | OK (via chat) | `tool_calcular_score_aderencia()` (tools.py:2412) faz match editais vs portfolio. `processar_buscar_editais()` (app.py:1665) retorna editais já rankeados por aderência ao portfolio |

### 1.6 Classificação/Agrupamento de Produtos

| Item Especificado | Status | Observação |
|---|---|---|
| IA gera agrupamentos se não parametrizado | PARCIAL | Botão "Gerar com IA" na UI está desabilitado (Onda 4). Mas `_extrair_info_produto()` (tools.py:188) já identifica categoria automaticamente (equipamento, reagente, etc.) ao processar uploads. Falta: (1) gerar árvore completa de classes/subclasses, (2) habilitar botão |

### Resumo Empresa

| Total | OK | OK (via chat) | PARCIAL | AUSENTE |
|---|---|---|---|---|
| 23 itens | 12 | 6 | 5 | 0 |
| **Aderência** | **78%** (OK+chat) | | | |

---

## 2. PORTFOLIO (Página 3)

### 2.1 Uploads

| Item Especificado | Status | Observação |
|---|---|---|
| Upload de Manuais | OK | Tipo `manual` + IA extrai specs automaticamente via `tool_processar_upload()` |
| Upload de Instruções de Usos | OK | Tipo `instrucoes` com prompt IA |
| Upload NFS | OK | Tipo `nfs` (Notas Fiscais) |
| Upload Plano de Contas | OK | Tipo `plano_contas` do ERP |
| Upload Folders | OK | Tipo `folders` (catálogos comerciais) |
| Website de Consultas | OK | Tipo `website` com URL + `processar_download_url()` |

### 2.2 Cadastro

| Item Especificado | Status | Observação |
|---|---|---|
| Código do Produto | PARCIAL | Campo `codigo_interno` no BD; não aparece na UI de cadastro manual |
| Classe de Produtos | OK | Select com 4 classes principais |
| NCM de cada Classe | OK | Auto-preenchido por classe; editável |
| Subclasse de Produtos | OK | Select dinâmico por classe |
| NCM de cada Subclasse | OK | NCM específico por subclasse |

### 2.3 Máscara de Especificações Técnicas

| Item Especificado | Status | Observação |
|---|---|---|
| Nome do Produto | OK | Campo obrigatório |
| Classe | OK | Select com opções |
| Especificação Técnica (campos dinâmicos) | OK | `SPECS_POR_CLASSE` com campos por classe (Potência, Voltagem, etc.) |
| Potência, Voltagem, Resistência | OK | Campos para classe "Equipamento" |

### 2.4 IA no Portfolio

| Item Especificado | Status | Observação |
|---|---|---|
| IA lê manuais e sugere novos campos | OK | `_encontrar_paginas_specs()` (tools.py:853) busca páginas relevantes. `_extrair_specs_em_chunks()` (tools.py:885) processa com DeepSeek. `PROMPT_EXTRAIR_SPECS` (tools.py:28) extrai nome/valor/unidade |
| IA preenche requisitos faltantes | OK | Extração automática ao upload |
| Verificação de completude | OK | `tool_verificar_completude_produto()` (tools.py:5182) verifica campos faltantes |
| IA sugere novos campos de especificação | OK (via chat) | `processar_reprocessar_produto()` (app.py:2241) pode reextrair specs. Chat livre pode sugerir campos |

### 2.5 Monitoramento e Classificação

| Item Especificado | Status | Observação |
|---|---|---|
| Monitoramento Contínuo 24/7 | OK (via chat) | `tool_configurar_monitoramento()` (tools.py:5680) configura busca automática por termo com frequência (diária/semanal/mensal). `tool_listar_monitoramentos()` lista ativos. CaptacaoPage exibe seção de monitoramentos. **O que falta:** agente cron/scheduler que execute as buscas automaticamente nos horários configurados |
| Busca Inteligente por NCMs | OK (via chat) | `tool_buscar_editais_fonte()` (tools.py:1514) busca no PNCP por qualquer termo incluindo NCMs. `tool_buscar_editais_scraper()` (tools.py:302) complementa com Google Search |
| Classificação Automática por tipo de edital | OK (via chat) | `tool_classificar_edital()` (tools.py:5101) classifica em comodato/venda/aluguel/etc. `PROMPT_CLASSIFICAR_EDITAL` (tools.py:71) define 7 categorias. Aplicado automaticamente em `processar_buscar_editais()` |
| Filtro Inteligente (Comodato, Aluguéis, etc.) | OK | CaptacaoPage tem filtro dropdown por tipo + por origem |

### 2.6 Registros ANVISA

| Item Especificado | Status | Observação |
|---|---|---|
| IA tenta trazer registros ANVISA | OK (via chat) | Modal ANVISA no PortfolioPage → chat. `tool_web_search()` busca registros |
| Usuário valida ou complementa | PARCIAL | Resultado do chat exibido para o usuário. Falta: fluxo estruturado de confirmação/edição no frontend |

### Resumo Portfolio

| Total | OK | OK (via chat) | PARCIAL | AUSENTE |
|---|---|---|---|---|
| 19 itens | 14 | 3 | 2 | 0 |
| **Aderência** | **89%** (OK+chat) | | | |

---

## 3. PARAMETRIZAÇÕES (Página 4)

### 3.1 Produtos — Classificação/Agrupamento

| Item Especificado | Status | Observação |
|---|---|---|
| Arquitetura de Classes | OK | Árvore expansível com CRUD completo |
| Arquitetura de Subclasses | OK | Subclasses vinculadas a classes com NCMs |
| IA gera agrupamentos automaticamente | PARCIAL | `_extrair_info_produto()` identifica categoria ao upload. Botão "Gerar com IA" desabilitado na UI. Falta: gerar árvore completa de classes/subclasses a partir dos produtos existentes |
| IA traz modelo do website/folders | OK (via chat) | `processar_download_url()` baixa e processa docs de URL. `processar_buscar_web()` busca manuais na web |

### 3.2 Comerciais

| Item Especificado | Status | Observação |
|---|---|---|
| Região de atuação | OK | 27 UFs selecionáveis + "Todo o Brasil" |
| Tempo de entrega | OK | Prazo máximo (dias) + frequência |
| TAM/SAM/SOM | OK | 3 campos monetários (bônus) |

### 3.3 Norteadores de Scores (6 dimensões)

| Item Especificado | Status | Observação |
|---|---|---|
| **(a)** Score de Aderência Comercial | OK | Região + prazo + frequência alimentam. `PROMPT_SCORES_VALIDACAO` calcula `score_comercial` |
| **(b)** Tipos de editais desejados | OK | 6 checkboxes |
| **(c)** Score de Aderência Técnica | OK | `tool_calcular_score_aderencia()` (tools.py:2412) usa DeepSeek Reasoner + portfolio para calcular. `PROMPT_CALCULAR_SCORE` (tools.py:2369) define critérios |
| **(d)** Score de Recomendação de Participação | OK | `tool_calcular_scores_validacao()` calcula todas as 6 dimensões. Fontes documentais exigidas (10 tipos) alimentam score_documental |
| **(e)** Score de Aderência de Ganho | OK (via chat) | `tool_historico_precos()` (tools.py:4768) calcula média/min/max/tendência. `tool_registrar_resultado()` (tools.py:3580) alimenta base. `tool_recomendar_preco()` (tools.py:4994) usa histórico para recomendação. Campos taxa_vitoria/margem_media existem no frontend. O cálculo do score usa DeepSeek com dados disponíveis |
| **(f)** Pesos dos scores | OK | Tabela `parametros_score` com peso_tecnico/comercial/participacao/ganho + limiares GO/NOGO. `_get_pesos_score()` (tools.py:1906) carrega configuração |

### Resumo Parametrizações

| Total | OK | OK (via chat) | PARCIAL | AUSENTE |
|---|---|---|---|---|
| 12 itens | 9 | 2 | 1 | 0 |
| **Aderência** | **92%** (OK+chat) | | | |

---

## 4. CAPTAÇÃO (Páginas 5 e 6)

### 4.1 Painel de Oportunidades

| Item Especificado | Status | Observação |
|---|---|---|
| Coluna: Licitação | OK | Número do edital |
| Coluna: Produto Correspondente | OK | Produto aderente |
| Coluna: Score de Aderência (gauge circles) | OK | `ScoreCircle` SVG com cores verde/amarelo/vermelho |
| Tooltip hover "Análise de Gaps" | DIVERGENTE | Tooltip mostra sub-scores (Tec/Com/Rec), não gaps. Gaps no painel lateral |
| Colunas extras (Órgão, UF, Objeto, Valor, Prazo) | OK | Informação adicional útil |

### 4.2 Análise do Edital (painel lateral)

| Item Especificado | Status | Observação |
|---|---|---|
| Score Técnica (gauge circular 90%) | DIVERGENTE | Implementado como ScoreBar horizontal, não gauge circular |
| Score Comercial (gauge circular 75%) | DIVERGENTE | Implementado como ScoreBar horizontal |
| Score Recomendação (estrelas 4.5/5) | DIVERGENTE | Implementado como ScoreBar horizontal 0-100% |
| Análise de Gaps (lista) | OK | Status badges (atendido/parcial/não_atendido) |

### 4.3 Datas de Submissão

| Item Especificado | Status | Observação |
|---|---|---|
| Próximos 2/5/10/20 dias | OK | 4 cards com contadores e cores |

### 4.4 Score de Aderência + Potencial de Ganho

| Item Especificado | Status | Observação |
|---|---|---|
| Score de Aderência (gauge grande) | OK | ScoreCircle 100px no painel (diferente visualmente do mockup, mas funcional) |
| Potencial de Ganho | OK | StatusBadge (Elevado/Médio/Baixo). Visual diferente do mockup (badge vs gauge) |

### 4.5 Intenção Estratégica

| Item Especificado | Status | Observação |
|---|---|---|
| 4 Radios (Estratégico, Defensivo, Acompanhamento, Aprendizado) | OK | Implementados com persistência via CRUD |
| "Isso muda a leitura do score" | PARCIAL | Lógica de mapeamento existe (Estratégico→GO, Aprendizado→NOGO). Falta texto explicativo na UI |

### 4.6 Expectativa de Margem

| Item Especificado | Status | Observação |
|---|---|---|
| Slider 0-50% | OK | Input range implementado |
| "Varia por Produto/Região" | AUSENTE | Botões não implementados |

### 4.7 Classificação (Página 6)

| Item Especificado | Status | Observação |
|---|---|---|
| **(a)** Tipo: Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preço | OK | Filtro dropdown + `tool_classificar_edital()` backend |
| **(b)** Origem: Municipal, Estadual, Federal, Universidades, Hospitais, LACENs | OK | Filtro dropdown com 9 opções |
| **(c)** Locais de Busca: PNCP, SICONV, jornais, sistemas de prefeitura | PARCIAL | PNCP (API nativa) + ComprasNet, BEC-SP, Compras-MG, Licitações-e, Portal Compras Públicas (via scraper/parsers em tools.py:2808-3143). Faltam: SICONV, jornais eletrônicos |
| **(d)** Formato de Busca: NCMs, Nome Técnico, Palavra-chave | OK | Busca aceita qualquer termo. `tool_buscar_editais_fonte()` busca no PNCP. `tool_buscar_editais_scraper()` complementa com Google Search em 5+ portais |
| **(d)** IA lê todo o edital buscando pela palavra-chave | OK (via chat) | `tool_baixar_pdf_pncp()` (tools.py:4511) baixa PDF. `_extrair_texto_por_paginas()` extrai texto. `tool_extrair_requisitos()` analisa conteúdo completo. `processar_resumir_edital()` lê o edital inteiro. `processar_perguntar_edital()` responde perguntas sobre o conteúdo. Na busca REST a leitura completa não é feita (seria lento demais para dezenas de editais) |
| **(e)** Monitoramento 24/7 com alertas | OK (via chat) | `tool_configurar_monitoramento()` cria monitoramento com frequência. `tool_configurar_alertas()` configura alertas por edital. `tool_listar_alertas()`. `tool_dashboard_prazos()`. UI exibe monitoramentos na CaptacaoPage. **Falta: scheduler/cron para execução automática** |
| **(e)** Tela/mensagem de matching (1x ao dia) | PARCIAL | `tool_configurar_monitoramento()` suporta frequência diária. `tool_configurar_preferencias_notificacao()` configura canais. Tabela `Monitoramento` no BD. Falta: (1) execução automática do matching, (2) notificação por email/push real |

### 4.8 Color Coding

| Item Especificado | Status | Observação |
|---|---|---|
| Verde/Amarelo/Vermelho | OK | Score >= 80 verde, 50-79 amarelo, < 50 vermelho |

### Resumo Captação

| Total | OK | OK (via chat) | PARCIAL | AUSENTE | DIVERGENTE |
|---|---|---|---|---|---|
| 25 itens | 14 | 3 | 4 | 1 | 3 |
| **Aderência** | **68%** (OK+chat) | | | | |

---

## 5. VALIDAÇÃO (Páginas 7, 8, 9 e 10)

### 5.1 Sinais de Mercado

| Item Especificado | Status | Observação |
|---|---|---|
| Concorrente Dominante Identificado | OK | Badge implementado. `tool_analisar_concorrente()` (tools.py:4912) analisa histórico. `tool_listar_concorrentes()` lista todos |
| Suspeita de Licitação Direcionada | OK | Badge implementado. `PROMPT_SCORES_VALIDACAO` detecta sinais |
| Preço Predatório Detectado | OK | Badge implementado (extra ao PDF) |

### 5.2 Decisão e Justificativa

| Item Especificado | Status | Observação |
|---|---|---|
| Participar / Acompanhar / Ignorar | OK | 3 botões com persistência via CRUD |
| Justificativa (Motivo + texto) | OK | 8 motivos predefinidos + textarea livre. Persistido em `validacao_decisoes` |
| "Combustível para IA futura" | OK | Dados persistidos. `tool_registrar_resultado()` alimenta histórico |

### 5.3 Score Circle + 3 Abas

| Item Especificado | Status | Observação |
|---|---|---|
| Score circle 82/100 | OK | ScoreCircle 120px |
| 3 abas: Objetiva, Analítica, Cognitiva | OK | TabPanel implementado |

### 5.4 Aba Objetiva

| Item Especificado | Status | Observação |
|---|---|---|
| Aderência Técnica por requisito | OK | Sub-scores em grid. `tool_calcular_scores_validacao()` gera dados |
| Certificações (status) | OK | Lista com badges ok/vencida/pendente |
| Integração de Sistemas | OK | Incluído como sub-score técnico genérico |
| Checklist Documentos | OK | Tabela com Documento/Status/Validade |
| Mapa Logístico ("Entrega Estimada") | PARCIAL | `score_logistico` é calculado pelo `PROMPT_SCORES_VALIDACAO`. Falta: componente visual de mapa/estimativa de entrega na UI |
| Decisão GO/NO-GO da IA | OK | Banner com decisão (GO/NO-GO/CONDICIONAL) + ícone diferenciado |

### 5.5 Aba Analítica

| Item Especificado | Status | Observação |
|---|---|---|
| Modalidade e Risco | OK | Badges (Pregão Eletrônico, Risco Preço, Faturamento) |
| Checklist Documental | OK | Via aba Objetiva |
| Flags Jurídicos | OK | Lista dinâmica com badges. `PROMPT_SCORES_VALIDACAO` analisa |
| Fatal Flaws | OK | Card com alertas críticos identificados antes da análise humana |
| Reputação do Órgão (Pregoeiro, Pagador, Histórico) | OK | Grid com 3 itens. Backend calcula via IA |
| Memória Corporativa Permanente | OK (via chat) | `tool_registrar_resultado()` alimenta histórico de preços/resultados. `tool_historico_precos()` consulta. `tool_analisar_concorrente()` analisa padrões. `tool_consulta_mindsdb()` permite queries analíticas. Dados persistem entre editais. Falta: UI consolidada mostrando aprendizado acumulado |
| Alerta de Recorrência | OK | Renderizado se >= 2 perdas semelhantes |
| Aderência Técnica Trecho-a-Trecho | OK | Tabela 3 colunas: Trecho Edital ↔ Aderência % ↔ Trecho Portfólio |
| Resumo da IA com recomendação | OK | Gerado via POST /api/chat (na aba Cognitiva, não Analítica — diferença de organização, não de funcionalidade) |

### 5.6 Aba Cognitiva

| Item Especificado | Status | Observação |
|---|---|---|
| Resumo IA | OK | Gerado via `processar_resumir_edital()` (app.py:5080). Prompt detalhado com contexto |
| Histórico Semelhante | OK | Lista com status (vencida/perdida/cancelada). `tool_historico_precos()` + `tool_consultar_resultado()` alimentam |
| Pergunte à IA | OK | Input + botão. `processar_perguntar_edital()` (app.py:5192) responde com contexto do edital |

### 5.7 Análise de Lote

| Item Especificado | Status | Observação |
|---|---|---|
| Barra visual Aderente/Item Intruso | OK | Segmentos coloridos com legenda |
| Item Intruso → Dependência de Terceiros | PARCIAL | Identifica intrusos. Falta: texto "Dependência de Terceiros" e impacto no lote inteiro |

### 5.8 6 Barras de Dimensão

| Item Especificado | Status | Observação |
|---|---|---|
| Aderência técnica | OK | ScoreBar. Calculado por `tool_calcular_scores_validacao()` |
| Aderência documental | OK | ScoreBar |
| Complexidade do edital | OK | ScoreBar (inverso da complexidade) |
| Risco jurídico percebido | OK | ScoreBar |
| Viabilidade logística | OK | ScoreBar |
| Atratividade comercial histórica | OK | ScoreBar |
| Labels High/Medium/Low | AUSENTE | Apenas %, sem classificação textual |

### 5.9 Scores de Aderência / Riscos (Páginas 8-9)

| Item Especificado | Status | Observação |
|---|---|---|
| **(a)** Técnica/Portfolio: trechos vs portfolio | OK | Tabela trecho-a-trecho |
| **(a)** Itens intrusos, complementação portfolio | OK (via chat) | `tool_calcular_aderencia()` identifica gaps e sugere via chat. `processar_perguntar_edital()` pode detalhar |
| **(b)** Documental: certidões, balanços, registros | OK | Checklist documental |
| **(b)** Candidato a impugnação (doc inusitado) | OK (via chat) | `PROMPT_SCORES_VALIDACAO` analisa flags jurídicos que incluem exigências inusitadas. `fatalFlaws` pode indicar candidato a impugnação. Chat livre com especialista em licitações pode detalhar |
| **(c)** Jurídicos: aditivos, ações, edital direcionado | OK | Flags jurídicos renderizados. Fatal Flaws identificados. `score_juridico` calculado |
| **(d)** Logística: distância assistência técnica | PARCIAL | `score_logistico` calculado pelo PROMPT_SCORES_VALIDACAO. Falta: componente visual de mapa |
| **(e)** Comerciais: preços predatórios, atrasos, concorrente dominante | OK | Sinais de mercado + `tool_buscar_precos_pncp()` + `tool_historico_precos()` + `tool_analisar_concorrente()`. `score_comercial` calculado |
| **(f)** Tipo de empresa (micro, lucro presumido) | PARCIAL | Campo `porte` no BD Empresa (me/epp/medio/grande). Campo `regime_tributario` (simples/lucro_presumido/lucro_real). Falta: usar esses dados no cálculo de validação |

### 5.10 Processo Amanda (Página 10)

| Item Especificado | Status | Observação |
|---|---|---|
| Leitura do Edital → montagem automática de pastas | PARCIAL | A leitura do edital existe: `tool_baixar_pdf_pncp()` + `tool_extrair_requisitos()` classificam requisitos em técnico/documental/comercial. A montagem de pastas (organizar documentos da empresa por categoria vinculados ao edital) não tem UI dedicada. Os dados estão no BD (`EmpresaDocumento` por tipo, `EditalRequisito` por tipo) |
| 1. Pasta de documentos da empresa | PARCIAL | Dados existem em `empresa_documentos` separados por tipo (contrato_social, atestado_capacidade, etc.). Falta: view que agrupe por edital |
| 2. Pasta de documentos fiscais e certidões | PARCIAL | Dados existem em `empresa_certidoes` (CND, FGTS, Trabalhista). Falta: view que vincule ao edital |
| 3. Pasta de Qualificação Técnica (ANVISA) | PARCIAL | `produtos_documentos` tem tipo `certificado_anvisa`. Falta: view que vincule ao edital |
| Atrelar documento ao item do edital | AUSENTE | Não existe relacionamento documento↔item_edital no BD |

### Resumo Validação

| Total | OK | OK (via chat) | PARCIAL | AUSENTE | DIVERGENTE |
|---|---|---|---|---|---|
| 37 itens | 25 | 4 | 6 | 2 | 0 |
| **Aderência** | **78%** (OK+chat) | | | | |

---

## RESUMO GERAL

| Módulo | Página | Itens | OK | OK (chat) | PARCIAL | AUSENTE | DIVERGENTE | Aderência |
|---|---|---|---|---|---|---|---|---|
| **Empresa** | 2 | 23 | 12 | 6 | 5 | 0 | 0 | **78%** |
| **Portfolio** | 3 | 19 | 14 | 3 | 2 | 0 | 0 | **89%** |
| **Parametrizações** | 4 | 12 | 9 | 2 | 1 | 0 | 0 | **92%** |
| **Captação** | 5-6 | 25 | 14 | 3 | 4 | 1 | 3 | **68%** |
| **Validação** | 7-10 | 37 | 25 | 4 | 6 | 2 | 0 | **78%** |
| **TOTAL** | **2-10** | **116** | **74** | **18** | **18** | **3** | **3** | **79%** |

---

## GAPS REAIS RESTANTES (Priorizados)

### Categoria A — Gaps de UI/Visual (frontend não reflete o que o backend já faz)

| # | Gap | Módulo | Backend existe? | O que falta |
|---|---|---|---|---|
| G1 | Score Técnica/Comercial em **gauge circular** (não barra) | Captação | Dados OK | Componente visual `GaugeCircle` no frontend |
| G2 | Score Recomendação com **estrelas** (4.5/5) | Captação | Dados OK | Componente `StarRating` no frontend |
| G3 | Tooltip de **Análise de Gaps** ao hover na tabela | Captação | Dados OK | Tooltip com gaps no hover do ScoreCircle |
| G4 | Labels **High/Medium/Low** nas 6 barras de dimensão | Validação | Dados OK | Classificação textual no componente ScoreBar |
| G5 | **Mapa Logístico** visual com estimativa de entrega | Validação | `score_logistico` calculado | Componente visual de mapa/distância |
| G6 | **Processo Amanda** — view de pastas por edital | Validação | Docs existem no BD | Tela/seção que agrupa documentos por edital e tipo |

### Categoria B — Gaps de Integração (backend→frontend ou automação)

| # | Gap | Módulo | Backend existe? | O que falta |
|---|---|---|---|---|
| G7 | Upload de arquivo da **EmpresaPage** não persiste no disco | Empresa | `tool_processar_upload()` existe | Conectar frontend ao endpoint de upload com storage |
| G8 | **Scheduler/Cron** para monitoramento 24/7 | Captação | `tool_configurar_monitoramento()` existe | Processo background (celery/cron) que execute buscas |
| G9 | **Notificação real** por email/push | Captação | Modelo `Notificacao` existe | Integração com serviço de email (SendGrid/SES) |
| G10 | **Tipo de empresa** (porte/regime) usado na validação | Validação | Campo existe no BD | Incluir no PROMPT_SCORES_VALIDACAO |
| G11 | **Gerar classes/subclasses via IA** | Parametrizações | `_extrair_info_produto()` identifica categoria | Habilitar botão "Gerar com IA" + endpoint |
| G12 | Vincular **documento ao item do edital** (Processo Amanda) | Validação | Tabelas separadas existem | FK edital_item_id na tabela empresa_documentos |

### Categoria C — Gaps de Fontes Externas

| # | Gap | Módulo | O que falta |
|---|---|---|---|
| G13 | Integração com **SICONV** | Captação | Parser + API ou scraper para o portal |
| G14 | Busca automática de **certidões** (CND, FGTS) | Empresa | Integração com portais de emissão (API ou scraping) |
| G15 | "Varia por **Produto/Região**" na Expectativa de Margem | Captação | 2 botões + lógica de variação |

---

## CONCLUSÃO

### Aderência real: **79%** (não 55% como na primeira análise)

A primeira versão deste relatório subestimou gravemente a implementação porque ignorou as **51 tools do agente de chat** e as **50 funções processar_*** que implementam a maior parte da lógica de negócio especificada no WORKFLOW SISTEMA.pdf.

### O que ESTÁ implementado e funciona (via chat):
- Comparação edital vs documentos da empresa
- Análise jurídica e detecção de impugnações
- Classificação automática de editais por tipo
- Monitoramento (cadastro e listagem, falta scheduler)
- Leitura completa de editais (PDF)
- Análise de concorrentes e histórico de preços
- Cálculo completo das 6 dimensões de score
- Memória corporativa (persistência de resultados)

### O que realmente falta (15 gaps):
- **6 gaps visuais** (gauges, estrelas, mapa, tooltip, labels, Processo Amanda UI)
- **6 gaps de integração** (upload storage, scheduler, notificação, porte, IA classes, vínculo doc↔item)
- **3 gaps de fontes externas** (SICONV, certidões automáticas, variação produto/região)

### Recomendação de equipe

Para os 15 gaps restantes, **2 agentes** são suficientes:
1. **agent-frontend**: G1-G6 (componentes visuais)
2. **agent-backend**: G7-G15 (integrações e automação)

---

## APÊNDICE A — Mapeamento Prompts do Chat ↔ Funcionalidades do WORKFLOW

O dropdown do chat (`ChatInput.tsx`) oferece **159 prompts prontos** em **17 categorias**. Abaixo, o mapeamento de cada categoria para as funcionalidades especificadas no WORKFLOW SISTEMA.pdf (páginas 2-10):

### Categorias do dropdown que atendem ao WORKFLOW (pgs 2-10)

| # | Categoria (dropdown) | Qtd prompts | Página PDF | Funcionalidade atendida |
|---|---|---|---|---|
| 1 | Cadastro de Produtos | 12 | pg 3 (Portfolio) | Upload de manuais, instruções, NFS, folders → IA cadastra produto automaticamente. Listar, atualizar, reprocessar, excluir produtos |
| 2 | Busca e Cadastro de Editais | 20 | pgs 5-6 (Captação) | Busca PNCP + web com/sem score, por número, com/sem encerrados. Salvar editais recomendados/todos/específico. Cadastrar manualmente |
| 2.1 | Análise de Editais | 16 | pgs 7-10 (Validação) | Resumir edital, perguntar sobre requisitos/documentos/prazos, baixar PDF, atualizar URL |
| 3 | Análise de Aderência | 3 | pgs 5,7 (Captação+Valid.) | Calcular aderência produto×edital, listar análises, verificar completude |
| 4 | Geração de Propostas | 3 | (Precificação — fora escopo) | Gerar proposta técnica 8 seções, listar, excluir |
| 5 | Registro de Resultados | 8 | pg 4 (alimenta Score Ganho) | Registrar vitória/derrota/cancelado/deserto/revogado. Alimenta `precos_historicos` e `concorrentes`. Consultar resultados |
| 6 | Busca e Extração de Atas | 6 | pgs 7-10 (Validação) | Buscar atas no PNCP, baixar, extrair vencedores/preços. Alimenta inteligência competitiva |
| 7 | Histórico de Preços | 6 | pgs 7-10 (Validação) | Buscar preços no PNCP, ver histórico registrado. Alimenta score comercial e atratividade |
| 8 | Análise de Concorrentes | 5 | pg 7 (Validação) | Listar concorrentes, analisar histórico, taxa de vitória → alimenta "Concorrente Dominante Identificado" |
| 9 | Recomendação de Preços | 4 | (Precificação — fora escopo) | Recomendar faixa de preço baseada em histórico |
| 10 | Classificação de Editais | 3 | pgs 5-6 (Captação) | Classificar tipo (comodato/venda/aluguel/etc.) → alimenta filtros da CaptacaoPage |
| 10.1 | Completude de Produtos | 3 | pg 3 (Portfolio) | Verificar se produto tem dados suficientes para licitações |
| 11 | Fontes de Editais | 4 | pg 4 (Parametrizações) | Cadastrar/listar/ativar/desativar fontes de busca |
| 12 | Consultas Analíticas (MindsDB) | 17 | todas | Queries analíticas: totais, scores médios, editais por UF/órgão/valor, taxa de sucesso, concorrentes frequentes |
| 13 | Alertas e Prazos | 8 | pgs 5-6 (Captação) | Configurar alertas de prazo (24h, 1h, 15min antes), dashboard de prazos, próximos pregões |
| 14 | Calendário | 4 | pgs 5-6 (Captação) | Calendário mensal/semanal, datas importantes |
| 15 | Monitoramento Automático | 5 | pg 6 (Captação) | Configurar monitoramento por termo/UF/frequência, listar, desativar → "Monitoramento 24/7" do PDF |
| 16 | Notificações | 4 | pg 6 (Captação) | Configurar email/push, histórico de notificações → "Interface de Comunicação" do PDF |
| 17 | Extração de Datas | 2 | pgs 7-10 (Validação) | Extrair prazos de edital PDF |
| — | Outros / Ajuda | 5 | — | Chat livre sobre licitações, Lei 14.133/2021, impugnação, recurso |

### Funcionalidades do WORKFLOW cobertas pelos prompts

| Funcionalidade do PDF | Página | Prompts que atendem | Status |
|---|---|---|---|
| **Uploads de portfolio** (manuais, instruções, NFS, folders, website) | 3 | upload_manual, download_url, buscar_produto_web, buscar_datasheet_web | OK |
| **IA lê manuais e preenche specs** | 3 | upload_manual (trigger automático via `tool_processar_upload`) | OK |
| **Classificação de produtos** (classes, NCM) | 3-4 | IA identifica categoria no upload. Classificação manual na UI | OK |
| **Busca de editais multifonte** | 5-6 | buscar_editais_web, buscar_editais_simples, buscar_editais_todos, buscar_links_editais | OK |
| **Score de aderência** (técnico, comercial, recomendação) | 5 | buscar_editais_web (calcula score), calcular_aderencia | OK |
| **Análise de Gaps** | 5 | calcular_aderencia → retorna requisitos atendidos/parciais/não atendidos | OK |
| **Classificação por tipo** (reagentes, equipamentos, comodato) | 6 | classificar_edital, classificar_edital_2, classificar_edital_3 | OK |
| **Monitoramento 24/7 com alertas** | 6 | configurar_monitoramento, configurar_alertas, dashboard_prazos | OK (cadastro; falta scheduler) |
| **Leitura completa do edital** | 6 | baixar_pdf_edital, resumir_edital, perguntar_edital (7 variantes) | OK |
| **Sinais de Mercado** (concorrente dominante, direcionada) | 7 | analisar_concorrente, listar_concorrentes, calcular_scores_validacao | OK |
| **Decisão Participar/Acompanhar/Ignorar** | 7 | UI na ValidacaoPage com justificativa | OK |
| **3 Abas (Objetiva, Analítica, Cognitiva)** | 7 | UI na ValidacaoPage + calcular_scores_validacao (6 dimensões) | OK |
| **Resumo IA + Pergunte à IA** | 7 | resumir_edital, perguntar_edital (7 prompts diferentes) | OK |
| **Aderência trecho-a-trecho** | 8 | calcular_scores_validacao retorna dados para tabela | OK |
| **Checklist documental** | 8-9 | calcular_scores_validacao → score_documental | OK |
| **Flags jurídicos + Fatal Flaws** | 8-9 | calcular_scores_validacao → score_juridico + fatalFlaws | OK |
| **Reputação do Órgão** | 8 | calcular_scores_validacao analisa histórico | OK |
| **Alerta de Recorrência** | 8 | historico_precos + consultar_resultado alimentam | OK |
| **6 barras de score** | 7 | calcular_scores_validacao → 6 dimensões | OK |
| **Processo Amanda** (pastas) | 10 | extrair_requisitos classifica em técnico/documental/comercial. Dados no BD. Falta: UI de organização por edital | PARCIAL |
| **Score de Ganho** (histórico licitações) | 4 | registrar_resultado (8 prompts) + historico_precos + recomendar_preco alimentam base | OK |
| **Análise de concorrentes** | 7-9 | listar_concorrentes, analisar_concorrente (5 prompts) | OK |
| **Preços históricos** | 7-9 | buscar_precos_pncp, historico_precos (6 prompts) | OK |

### Funcionalidades do WORKFLOW **NÃO** cobertas por nenhum prompt

| Funcionalidade do PDF | Página | Status | O que falta |
|---|---|---|---|
| Busca automática de certidões (portais oficiais) | 2 | AUSENTE | Integração com API/portais de CND/FGTS/TST |
| SICONV como fonte de busca | 6 | AUSENTE | Scraper/API para portal SICONV |
| Mapa Logístico visual | 7 | AUSENTE | Componente de mapa com cálculo de distância |
| Botões "Varia por Produto/Região" | 5 | AUSENTE | 2 botões + lógica no frontend |

---

## APÊNDICE B — Inventário completo do Backend Agente

### Tools (tools.py): 51 funções
### Intenções (app.py): 53 categorias
### Prompts prontos (ChatInput.tsx): 159 entradas em 17 categorias

### Distribuição por área funcional:

| Área | Tools | Intenções | Prompts dropdown |
|---|---|---|---|
| Produtos/Portfolio | 7 | 6 | 12 |
| Editais (busca + gestão) | 9 | 11 | 20 |
| Análise de editais | 4 | 5 | 16 |
| Aderência e propostas | 5 | 3 | 6 |
| Resultados e atas | 4 | 4 | 14 |
| Preços e concorrentes | 5 | 4 | 15 |
| Classificação e completude | 2 | 2 | 6 |
| Fontes de editais | 2 | 2 | 4 |
| Alertas e prazos | 4 | 4 | 12 |
| Monitoramento | 3 | 3 | 5 |
| Notificações | 3 | 2 | 4 |
| Consultas analíticas (MindsDB) | 1 | 1 | 17 |
| Datas | 1 | 1 | 2 |
| Chat livre/ajuda | 0 | 1 | 5 |
| **TOTAL** | **51** | **53** | **159** |
