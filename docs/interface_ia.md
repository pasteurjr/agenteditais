# Relatorio Interface IA — facilicita.ia

**Data:** 17/02/2026
**Objetivo:** Mapear TODOS os 108 prompts existentes no chat, cruzar com as paginas do sistema (Fluxo Comercial, Indicadores, Cadastros, Configuracoes), identificar o que falta implementar na interface e o que falta em termos de prompts/tools para cada funcao.

---

## 1. MAPA DE PROMPTS DO CHAT (17 grupos, 108 prompts funcionais)

### Grupo 1: Cadastro de Produtos (11 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | upload_manual | "Cadastre este produto" (+ arquivo PDF) | tool_processar_upload → tool_extrair_especificacoes | OK |
| 2 | download_url | "Baixe o manual de [URL] e cadastre o produto" | tool_download_arquivo | OK |
| 3 | buscar_produto_web | "Busque o manual do produto [NOME] na web" | tool_web_search | OK |
| 4 | buscar_datasheet_web | "Busque o datasheet do [NOME] na web" | tool_web_search | OK |
| 5 | listar_produtos | "Liste todos os meus produtos cadastrados" | tool_listar_produtos | OK |
| 6 | buscar_produto_banco | "Busque o produto [NOME] no banco" | tool_listar_produtos | OK |
| 7 | verificar_produto_cadastrado | "Tenho o produto [NOME] cadastrado?" | tool_listar_produtos | OK |
| 8 | reprocessar_produto | "Reprocesse as especificacoes do produto [NOME]" | tool_reprocessar_produto | OK |
| 9 | atualizar_produto | "Atualize o produto [NOME] com [NOVOS_DADOS]" | tool_atualizar_produto | OK |
| 10 | excluir_produto | "Exclua o produto [NOME]" | tool_excluir_produto | OK |
| 11 | excluir_todos_produtos | "Exclua todos os meus produtos" | tool_excluir_produto | OK |

**Usado em:** Configuracoes → Portfolio (PortfolioPage) — UNICA PAGE 100% FUNCIONAL

---

### Grupo 2: Busca e Cadastro de Editais (23 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | buscar_editais_web | "Busque editais de [TERMO] no PNCP" | tool_buscar_editais_scraper + tool_calcular_score_aderencia | OK |
| 2 | buscar_edital_numero_web | "Busque o edital [PE-001/2026] no PNCP" | tool_buscar_editais_scraper | OK |
| 3 | buscar_editais_web2 | "Encontre editais de [TERMO] na web" | tool_buscar_editais_scraper | OK |
| 4 | buscar_editais_simples | "Busque editais de [TERMO] sem calcular score" | tool_buscar_editais_scraper | OK |
| 5 | buscar_editais_simples2 | "Busque editais de [TERMO] apenas listando" | tool_buscar_editais_scraper | OK |
| 6 | buscar_editais_todos | "Busque todos editais de [TERMO] incl. encerrados sem score" | tool_buscar_editais_scraper | OK |
| 7 | buscar_editais_todos_score | "Busque todos editais de [TERMO] incl. encerrados" | tool_buscar_editais_scraper + score | OK |
| 8 | buscar_links_editais | "Retorne os links para editais na area [TERMO]" | tool_buscar_links_editais | OK |
| 9 | buscar_links_editais2 | "Links editais equipamentos medicos" | tool_buscar_links_editais | OK |
| 10 | buscar_links_editais3 | "Links editais laboratorio" | tool_buscar_links_editais | OK |
| 11 | buscar_editais_banco | "Busque editais de [TERMO] no banco" | tool_listar_editais | OK |
| 12 | buscar_edital_numero_banco | "Busque o edital [PE-001/2026] no sistema" | tool_listar_editais | OK |
| 13 | verificar_edital_cadastrado | "Tenho o edital [PE-001/2026] cadastrado?" | tool_listar_editais | OK |
| 14 | listar_editais | "Liste meus editais cadastrados" | tool_listar_editais | OK |
| 15 | listar_editais_status | "Liste editais com status [STATUS]" | tool_listar_editais | OK |
| 16 | cadastrar_edital | "Cadastre o edital [NUM], orgao [ORG], objeto: [OBJ]" | handler cadastrar_edital | OK |
| 17 | salvar_editais | "Salve os editais encontrados" | tool_salvar_editais_selecionados | OK |
| 18 | salvar_editais_todos | "Salvar todos os editais" | tool_salvar_editais_selecionados | OK |
| 19 | salvar_editais_recomendados | "Salvar editais recomendados" | tool_salvar_editais_selecionados | OK |
| 20 | salvar_edital_especifico | "Salvar edital [PE-001/2026]" | tool_salvar_editais_selecionados | OK |
| 21 | atualizar_edital | "Atualize o edital [NUM] com status [STATUS]" | tool_atualizar_edital | OK |
| 22 | excluir_edital | "Exclua o edital [NUMERO]" | tool_excluir_edital | OK |
| 23 | excluir_todos_editais | "Exclua todos os meus editais" | tool_excluir_editais_multiplos | OK |

**Usado em:** Fluxo Comercial → Captacao (CaptacaoPage) — PAGE MOCK, nao conectada

---

### Grupo 2.1: Analise de Editais (13 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | resumir_edital | "Resuma o edital [PE-001/2026]" | call_deepseek (RAG) | OK |
| 2 | resumir_edital_2 | "Faca um resumo do edital [NUM]" | call_deepseek (RAG) | OK |
| 3 | resumir_edital_3 | "Sintetize o edital [PE-001/2026]" | call_deepseek (RAG) | OK |
| 4 | perguntar_edital | "O edital [PE-001/2026] exige [REQUISITO]?" | call_deepseek (RAG) | OK |
| 5 | perguntar_edital_2 | "Qual o prazo de entrega do edital?" | call_deepseek (RAG) | OK |
| 6 | perguntar_edital_3 | "Quais documentos sao exigidos?" | call_deepseek (RAG) | OK |
| 7 | perguntar_edital_4 | "O edital exige garantia?" | call_deepseek (RAG) | OK |
| 8 | perguntar_edital_5 | "Quais sao os requisitos tecnicos?" | call_deepseek (RAG) | OK |
| 9 | perguntar_edital_6 | "Quais itens o edital comporta?" | call_deepseek (RAG) | OK |
| 10 | perguntar_edital_7 | "Me conte tudo sobre o edital" | call_deepseek (RAG) | OK |
| 11 | baixar_pdf_edital | "Baixe o PDF do edital [PE-001/2026]" | tool_baixar_pdf_pncp | OK |
| 12 | baixar_pdf_edital_2 | "Faca download do edital" | tool_baixar_pdf_pncp | OK |
| 13 | atualizar_url_edital | "Atualize o edital [NUM] com URL: [URL]" | tool_atualizar_edital | OK |

**Usado em:** Fluxo Comercial → Validacao (ValidacaoPage) — PAGE MOCK, nao conectada

---

### Grupo 3: Analise de Aderencia (3 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | calcular_aderencia | "Calcule a aderencia do produto [PROD] ao edital [EDIT]" | tool_calcular_aderencia | OK |
| 2 | listar_analises | "Liste minhas analises de aderencia" | handler listar_analises | OK |
| 3 | verificar_completude_aderencia | "Verifique se o produto esta completo para editais" | tool_verificar_completude_produto | OK |

**Usado em:** Fluxo Comercial → Validacao (ValidacaoPage) — PAGE MOCK

---

### Grupo 4: Geracao de Propostas (3 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | gerar_proposta | "Gere proposta do produto [PROD] para edital [EDIT] com preco R$ [VAL]" | tool_gerar_proposta | OK |
| 2 | listar_propostas | "Liste minhas propostas geradas" | handler listar_propostas | OK |
| 3 | excluir_proposta | "Exclua a proposta do edital [NUM]" | handler excluir_proposta | OK |

**Usado em:** Fluxo Comercial → Proposta (PropostaPage) — PAGE MOCK

---

### Grupo 5: Registro de Resultados (8 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | registrar_vitoria | "Ganhamos o edital [NUM] com R$ [VAL]" | tool_registrar_resultado | OK |
| 2 | registrar_derrota | "Perdemos o edital [NUM] para [EMP] com R$ [VAL]" | tool_registrar_resultado | OK |
| 3 | registrar_derrota_motivo | "Perdemos o edital [NUM] por [MOTIVO]" | tool_registrar_resultado | OK |
| 4 | registrar_cancelado | "O edital [NUM] foi cancelado" | tool_registrar_resultado | OK |
| 5 | registrar_deserto | "O edital [NUM] foi deserto" | tool_registrar_resultado | OK |
| 6 | registrar_revogado | "O edital [NUM] foi revogado" | tool_registrar_resultado | OK |
| 7 | consultar_resultado | "Qual o resultado do edital [NUM]?" | tool_registrar_resultado | OK |
| 8 | consultar_todos_resultados | "Mostre os resultados de todos os editais" | tool_registrar_resultado | OK |

**Usado em:** Fluxo Comercial → Followup (FollowupPage) — PAGE MOCK

---

### Grupo 6: Busca e Extracao de Atas (6 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | buscar_atas | "Busque atas de [TERMO]" | tool_buscar_atas_pncp | OK |
| 2 | buscar_atas_2 | "Encontre atas de pregao de [TERMO]" | tool_buscar_atas_pncp | OK |
| 3 | baixar_atas | "Baixe atas de [TERMO] do PNCP" | tool_baixar_ata_pncp | OK |
| 4 | extrair_ata | "Extraia os resultados desta ata" (+ PDF) | tool_extrair_ata_pdf | OK |
| 5 | extrair_vencedor | "Quem ganhou este pregao?" (+ PDF) | tool_extrair_ata_pdf | OK |
| 6 | registrar_ata | "Registre os resultados desta ata" (+ PDF) | tool_extrair_ata_pdf | OK |

**Usado em:** Nenhuma page dedicada — precisa da AtasPage (Onda 3, T26)

---

### Grupo 7: Historico de Precos (6 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | buscar_precos_pncp | "Busque precos de [TERMO] no PNCP" | tool_buscar_precos_pncp | OK |
| 2 | buscar_precos_pncp_2 | "Qual o preco de mercado para [TERMO]?" | tool_buscar_precos_pncp | OK |
| 3 | buscar_precos_pncp_3 | "Quanto custa um [PROD] em licitacoes?" | tool_buscar_precos_pncp | OK |
| 4 | historico_precos | "Mostre o historico de precos de [TERMO]" | tool_historico_precos | OK |
| 5 | historico_precos_2 | "Quais precos ja registramos?" | tool_historico_precos | OK |
| 6 | historico_precos_3 | "Historico de precos do produto [NOME]" | tool_historico_precos | OK |

**Usado em:** Fluxo Comercial → Precificacao (PrecificacaoPage) — PAGE MOCK

---

### Grupo 8: Analise de Concorrentes (5 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | listar_concorrentes | "Liste os concorrentes conhecidos" | tool_listar_concorrentes | OK |
| 2 | listar_concorrentes_2 | "Quais concorrentes conhecemos?" | tool_listar_concorrentes | OK |
| 3 | analisar_concorrente | "Analise o concorrente [NOME]" | tool_analisar_concorrente | OK |
| 4 | analisar_concorrente_2 | "Historico do concorrente [NOME]" | tool_analisar_concorrente | OK |
| 5 | analisar_concorrente_3 | "Qual a taxa de vitoria do concorrente [NOME]?" | tool_analisar_concorrente | OK |

**Usado em:** Indicadores → Concorrencia (ConcorrenciaPage) — PAGE MOCK

---

### Grupo 9: Recomendacao de Precos (4 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | recomendar_preco | "Recomende preco para [TERMO]" | tool_recomendar_preco | OK |
| 2 | recomendar_preco_2 | "Qual preco sugerir para [PROD]?" | tool_recomendar_preco | OK |
| 3 | recomendar_preco_3 | "Que preco colocar no edital de [TERMO]?" | tool_recomendar_preco | OK |
| 4 | recomendar_preco_4 | "Qual a faixa de preco para [TERMO]?" | tool_recomendar_preco | OK |

**Usado em:** Fluxo Comercial → Precificacao (PrecificacaoPage) — PAGE MOCK

---

### Grupo 10: Classificacao de Editais (3 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | classificar_edital | "Classifique este edital: [OBJETO]" | tool_classificar_edital | OK |
| 2 | classificar_edital_2 | "Que tipo de edital e este: [OBJETO]" | tool_classificar_edital | OK |
| 3 | classificar_edital_3 | "Este edital e comodato ou venda: [OBJETO]" | tool_classificar_edital | OK |

**Usado em:** Fluxo Comercial → Validacao (automatico durante analise)

---

### Grupo 10.1: Completude de Produtos (3 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | verificar_completude | "Verifique completude do produto [NOME]" | tool_verificar_completude_produto | OK |
| 2 | verificar_completude_2 | "O produto [NOME] esta completo?" | tool_verificar_completude_produto | OK |
| 3 | verificar_completude_3 | "Falta informacao no produto [NOME]?" | tool_verificar_completude_produto | OK |

**Usado em:** Configuracoes → Portfolio (PortfolioPage) — JA FUNCIONAL

---

### Grupo 11: Fontes de Editais (4 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | cadastrar_fonte | "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]" | tool_cadastrar_fonte | OK |
| 2 | listar_fontes | "Quais sao as fontes de editais cadastradas?" | tool_listar_fontes | OK |
| 3 | ativar_fonte | "Ative a fonte [NOME]" | handler (sem tool dedicada) | PARCIAL |
| 4 | desativar_fonte | "Desative a fonte [NOME]" | handler (sem tool dedicada) | PARCIAL |

**Usado em:** Configuracoes → Parametrizacoes (aba Fontes) — CRUD funcional, prompts nao usados na UI

---

### Grupo 12: Consultas Analiticas MindsDB (17 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | mindsdb_totais | "Quantos produtos e editais existem no banco?" | tool_consulta_mindsdb | OK |
| 2 | mindsdb_editais_novos | "Quais editais estao com status novo?" | tool_consulta_mindsdb | OK |
| 3 | mindsdb_editais_orgao | "Liste editais do [ORGAO]" | tool_consulta_mindsdb | OK |
| 4 | mindsdb_editais_mes | "Quais editais tem data de abertura em [MES]?" | tool_consulta_mindsdb | OK |
| 5 | mindsdb_score_medio | "Qual e o score medio de aderencia?" | tool_consulta_mindsdb | OK |
| 6 | mindsdb_produtos_categoria | "Quantos produtos temos em cada categoria?" | tool_consulta_mindsdb | OK |
| 7 | mindsdb_alta_aderencia | "Quais produtos tem aderencia acima de 70%?" | tool_consulta_mindsdb | OK |
| 8 | mindsdb_propostas | "Quantas propostas foram geradas?" | tool_consulta_mindsdb | OK |
| 9 | mindsdb_editais_semana | "Quais editais vencem esta semana?" | tool_consulta_mindsdb | OK |
| 10 | mindsdb_melhor_produto | "Qual produto tem o melhor score?" | tool_consulta_mindsdb | OK |
| 11 | mindsdb_editais_uf | "Quantos editais temos por estado (UF)?" | tool_consulta_mindsdb | OK |
| 12 | mindsdb_resumo | "Faca um resumo do banco completo" | tool_consulta_mindsdb | OK |
| 13 | mindsdb_vitorias_derrotas | "Quantas vitorias e derrotas temos?" | tool_consulta_mindsdb | OK |
| 14 | mindsdb_concorrentes_frequentes | "Quais concorrentes aparecem mais?" | tool_consulta_mindsdb | OK |
| 15 | mindsdb_preco_medio_categoria | "Qual o preco medio por categoria?" | tool_consulta_mindsdb | OK |
| 16 | mindsdb_editais_valor | "Quantos editais por faixa de valor?" | tool_consulta_mindsdb | OK |
| 17 | mindsdb_taxa_sucesso | "Qual nossa taxa de sucesso em licitacoes?" | tool_consulta_mindsdb | OK |

**Usado em:** Nenhuma page dedicada — precisa da AnalyticsPage (Onda 4, T45)

---

### Grupo 13: Alertas e Prazos (8 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | dashboard_prazos | "Mostre o dashboard de prazos" | tool_dashboard_prazos | OK |
| 2 | dashboard_prazos_mes | "Prazos dos proximos 30 dias" | tool_dashboard_prazos | OK |
| 3 | proximos_pregoes | "Quais editais abrem esta semana?" | tool_dashboard_prazos | OK |
| 4 | configurar_alertas | "Configure alertas para o edital PE-[NUM]" | tool_configurar_alertas | OK |
| 5 | configurar_alertas_2 | "Avise-me 24 horas antes do edital" | tool_configurar_alertas | OK |
| 6 | listar_alertas | "Quais alertas tenho configurados?" | tool_listar_alertas | OK |
| 7 | cancelar_alerta | "Cancele os alertas do edital" | tool_cancelar_alerta | OK |
| 8 | cancelar_todos_alertas | "Cancele todos os meus alertas" | tool_cancelar_alerta | OK |

**Usado em:** Indicadores → Flags (FlagsPage) — PAGE MOCK

---

### Grupo 14: Calendario de Editais (4 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | calendario_mes | "Calendario de editais deste mes" | tool_calendario_editais | OK |
| 2 | calendario_semana | "Calendario desta semana" | tool_calendario_editais | OK |
| 3 | calendario_proximo_mes | "Calendario de marco" | tool_calendario_editais | OK |
| 4 | datas_importantes | "Proximas datas importantes dos meus editais" | tool_calendario_editais | OK |

**Usado em:** Indicadores → Flags (FlagsPage) — PAGE MOCK

---

### Grupo 15: Monitoramento Automatico (5 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | configurar_monitoramento | "Monitore editais de [TERMO] no PNCP" | tool_configurar_monitoramento | OK |
| 2 | configurar_monitoramento_uf | "Monitore editais de [TERMO] em SP e MG" | tool_configurar_monitoramento | OK |
| 3 | configurar_monitoramento_freq | "Monitore editais de [TERMO] a cada 2 horas" | tool_configurar_monitoramento | OK |
| 4 | listar_monitoramentos | "Quais monitoramentos tenho ativos?" | tool_listar_monitoramentos | OK |
| 5 | desativar_monitoramento | "Desative o monitoramento de [TERMO]" | tool_desativar_monitoramento | OK |

**Usado em:** Indicadores → Monitoria (MonitoriaPage) — PAGE MOCK

---

### Grupo 16: Notificacoes (4 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | configurar_notificacoes | "Configure minhas preferencias de notificacao" | tool_configurar_preferencias_notificacao | OK |
| 2 | configurar_email | "Configure notificacoes para o email [EMAIL]" | tool_configurar_preferencias_notificacao | OK |
| 3 | historico_notificacoes | "Mostre o historico de notificacoes" | tool_historico_notificacoes | OK |
| 4 | notificacoes_nao_lidas | "Quais notificacoes nao li?" | tool_historico_notificacoes | OK |

**Usado em:** Configuracoes → Parametrizacoes (aba Notificacoes) — CRUD funcional

---

### Grupo 17: Extracao de Datas (2 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | extrair_datas | "Extraia as datas deste edital" (+ PDF) | tool_extrair_datas_edital | OK |
| 2 | extrair_datas_2 | "Quais sao os prazos deste edital?" (+ PDF) | tool_extrair_datas_edital | OK |

**Usado em:** Fluxo Comercial → Validacao (ValidacaoPage) — PAGE MOCK

---

### Grupo Outros/Ajuda (5 prompts)

| # | ID | Prompt | Tool Backend | Status |
|---|-----|--------|-------------|--------|
| 1 | ajuda | "O que voce pode fazer?" | chat_livre | OK |
| 2 | chat_livre | "O que e pregao eletronico?" | chat_livre | OK |
| 3 | chat_lei | "O que diz a Lei 14.133/2021 sobre [TEMA]?" | chat_livre | OK |
| 4 | chat_impugnacao | "Como faco uma impugnacao de edital?" | chat_livre | OK |
| 5 | chat_recurso | "Como faco um recurso administrativo?" | chat_livre | OK |

**Usado em:** Chat geral

---

## 2. CRUZAMENTO: Prompts x Paginas x Status

### 2.1 Fluxo Comercial (10 paginas)

#### CAPTACAO (CaptacaoPage)
**Menu:** Fluxo Comercial → Captacao
**Status da Page:** MOCK (dados hardcoded)
**Prompts que alimentam esta page:**

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Buscar editais no PNCP | Grupo 2 #1-7 (7 prompts) | tool_buscar_editais_scraper | NAO | Botao "Buscar" com campo de termo + filtros (UF, data, com/sem score, incl. encerrados) |
| Buscar por links | Grupo 2 #8-10 (3 prompts) | tool_buscar_links_editais | NAO | Botao "Links" com campo de area |
| Buscar no banco local | Grupo 2 #11-15 (5 prompts) | tool_listar_editais | NAO | Filtro "Salvos" com select de status |
| Salvar editais | Grupo 2 #17-20 (4 prompts) | tool_salvar_editais_selecionados | NAO | Botoes "Salvar Todos", "Salvar Recomendados", checkbox por edital |
| Cadastrar manualmente | Grupo 2 #16 | handler | NAO | Modal com campos numero/orgao/objeto |
| Calcular score (durante busca) | Grupo 3 #1 | tool_calcular_score_aderencia | NAO | Automatico ao buscar com score |
| **Classificar edital** | Grupo 10 #1-3 | tool_classificar_edital | NAO | Automatico ou botao "Classificar" |
| **Configurar monitoramento** | Grupo 15 #1-3 | tool_configurar_monitoramento | NAO | Botao "Monitorar" com campo termo + frequencia |

**PROMPTS FALTANDO:** Nenhum — todos os prompts necessarios ja existem no backend.
**O QUE FALTA:** Conectar a page ao CRUD real e colocar botoes/forms que geram esses prompts.

---

#### VALIDACAO (ValidacaoPage)
**Menu:** Fluxo Comercial → Validacao
**Status da Page:** MOCK (dados hardcoded)
**Prompts que alimentam esta page:**

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Resumir edital | Grupo 2.1 #1-3 | call_deepseek (RAG) | NAO | Botao "Resumir" por edital |
| Perguntar ao edital | Grupo 2.1 #4-10 | call_deepseek (RAG) | NAO | Campo de pergunta livre por edital |
| Baixar PDF | Grupo 2.1 #11-12 | tool_baixar_pdf_pncp | NAO | Botao "Baixar PDF" por edital |
| Calcular aderencia | Grupo 3 #1 | tool_calcular_aderencia | NAO | Botao "Calcular" com select produto + edital |
| Verificar completude | Grupo 10.1 #1-3 | tool_verificar_completude_produto | NAO | Botao por produto |
| Extrair datas | Grupo 17 #1-2 | tool_extrair_datas_edital | NAO | Automatico ao baixar PDF |
| Decisao Go/NoGo | Grupo 3 #1 + decisao | tool_calcular_aderencia | NAO | Botoes "Participar/Acompanhar/Ignorar" com CRUD |
| **Score Documental** | - | **NAO EXISTE** | NAO | **CRIAR tool_calcular_score_documental** |
| **Score Juridico** | - | **NAO EXISTE** | NAO | **CRIAR tool_calcular_score_juridico** |
| **Score Logistico** | - | **NAO EXISTE** | NAO | **CRIAR tool_calcular_score_logistico** |
| **Decision Engine** | - | **NAO EXISTE** | NAO | **CRIAR decision_engine_go_nogo** |

**PROMPTS FALTANDO:** 4 (scores documental/juridico/logistico + decision engine)
**TOOLS FALTANDO:** tool_calcular_score_documental, tool_calcular_score_juridico, tool_calcular_score_logistico, decision_engine_go_nogo

---

#### IMPUGNACAO (ImpugnacaoPage)
**Menu:** Fluxo Comercial → Impugnacao
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Perguntas sobre legislacao | Grupo Outros #3-5 | chat_livre | NAO | Campo de pergunta livre |
| **Gerar impugnacao** | - | **NAO EXISTE** | NAO | **CRIAR tool_gerar_impugnacao** + prompt + form (edital + motivo + fundamento legal) |
| **Gerar recurso** | - | **NAO EXISTE** | NAO | **CRIAR tool_gerar_recurso** + prompt + form (edital + motivo) |
| **Gerar contra-razoes** | - | **NAO EXISTE** | NAO | **CRIAR tool_gerar_contra_razoes** + prompt |
| **Disclaimers juridicos** | - | **NAO EXISTE** | NAO | **CRIAR componente DisclaimerJuridico** |

**PROMPTS FALTANDO:** 3 (gerar impugnacao, recurso, contra-razoes)
**TOOLS FALTANDO:** tool_gerar_impugnacao, tool_gerar_recurso, tool_gerar_contra_razoes

---

#### PRECIFICACAO (PrecificacaoPage)
**Menu:** Fluxo Comercial → Precificacao
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Buscar precos PNCP | Grupo 7 #1-3 | tool_buscar_precos_pncp | NAO | Botao "Buscar Precos" com campo de termo |
| Historico de precos | Grupo 7 #4-6 | tool_historico_precos | NAO | Botao "Historico" por produto/termo |
| Recomendar preco | Grupo 9 #1-4 | tool_recomendar_preco | NAO | Botao "Sugerir Preco" com select produto + edital |
| Concorrentes | Grupo 8 #1-5 | tool_listar/analisar_concorrente | NAO | Panel lateral com concorrentes |

**PROMPTS FALTANDO:** Nenhum — tudo existe no backend.
**O QUE FALTA:** Conectar page aos prompts com forms adequados.

---

#### PROPOSTA (PropostaPage)
**Menu:** Fluxo Comercial → Proposta
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Gerar proposta | Grupo 4 #1 | tool_gerar_proposta | NAO | Form com select produto + edital + preco |
| Listar propostas | Grupo 4 #2 | handler | NAO | Tabela com dados reais |
| Excluir proposta | Grupo 4 #3 | handler | NAO | Botao excluir por proposta |
| **Exportar PDF/DOCX** | - | **NAO EXISTE** | NAO | **CRIAR endpoint /api/propostas/export** |
| Sugerir preco | Grupo 9 | tool_recomendar_preco | NAO | Botao integrado no form |

**PROMPTS FALTANDO:** 1 (exportar proposta)
**TOOLS FALTANDO:** endpoint export PDF/DOCX

---

#### SUBMISSAO (SubmissaoPage)
**Menu:** Fluxo Comercial → Submissao
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Workflow de status | - | **NAO EXISTE** | NAO | **CRIAR tool_atualizar_status_proposta** |
| Checklist pre-envio | - | CRUD | NAO | Form com checklist de documentos |
| Abrir portal externo | - | N/A (link) | NAO | Botao com URL |

**PROMPTS FALTANDO:** 1 (atualizar status proposta)
**TOOLS FALTANDO:** tool_atualizar_status_proposta

---

#### DISPUTA DE LANCES (LancesPage)
**Menu:** Fluxo Comercial → Disputa Lances
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| **Simular lance** | - | **NAO EXISTE** | NAO | **CRIAR tool_simular_lance** + form (valor atual + decrementos) |
| **Sugerir lance** | - | **NAO EXISTE** | NAO | **CRIAR tool_sugerir_lance** + botao |
| Abrir sala disputa | - | N/A (link) | NAO | Botao com URL ComprasNet |
| Historico precos (ref.) | Grupo 7 | tool_historico_precos | NAO | Panel lateral |

**PROMPTS FALTANDO:** 2 (simular lance, sugerir lance)
**TOOLS FALTANDO:** tool_simular_lance, tool_sugerir_lance

---

#### FOLLOWUP (FollowupPage)
**Menu:** Fluxo Comercial → Followup
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Registrar vitoria | Grupo 5 #1 | tool_registrar_resultado | NAO | Form com edital + valor ganho |
| Registrar derrota | Grupo 5 #2-3 | tool_registrar_resultado | NAO | Form com edital + vencedor + valor + motivo |
| Registrar cancelado/deserto/revogado | Grupo 5 #4-6 | tool_registrar_resultado | NAO | Botao rapido por edital |
| Consultar resultado | Grupo 5 #7-8 | tool_registrar_resultado | NAO | Tabela com dados reais |
| Configurar alertas | Grupo 13 #4-5 | tool_configurar_alertas | NAO | Botao "Lembrar" por edital |

**PROMPTS FALTANDO:** Nenhum.
**O QUE FALTA:** Conectar page com forms.

---

#### CRM (CRMPage)
**Menu:** Fluxo Comercial → CRM
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| CRUD leads | - | CRUD leads-crm | NAO | Tabela + modal CRUD |
| CRUD acoes pos-perda | - | CRUD acoes-pos-perda | NAO | Tabela + modal CRUD |
| **Lead automatico ao perder** | - | **NAO EXISTE** | NAO | **CRIAR trigger no backend** |

**PROMPTS FALTANDO:** Nenhum (CRUD puro).
**TOOLS FALTANDO:** Trigger automatico: derrota → cria lead CRM.

---

#### EXECUCAO CONTRATO / PRODUCAO (ProducaoPage)
**Menu:** Fluxo Comercial → Execucao Contrato
**Status da Page:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| CRUD contratos | - | CRUD contratos | NAO | Tabela + modal CRUD |
| CRUD entregas | - | CRUD contrato-entregas | NAO | Tabela + modal CRUD |
| Anexar NF | - | CRUD + upload | NAO | Modal com upload |

**PROMPTS FALTANDO:** Nenhum (CRUD puro).
**O QUE FALTA:** Conectar page ao CRUD.

---

### 2.2 Indicadores (7 paginas)

#### FLAGS (FlagsPage)
**Menu:** Indicadores → Flags
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Dashboard de prazos | Grupo 13 #1-3 | tool_dashboard_prazos | NAO | Cards com prazos |
| Calendario editais | Grupo 14 #1-4 | tool_calendario_editais | NAO | Componente calendario |
| Configurar alertas | Grupo 13 #4-5 | tool_configurar_alertas | NAO | Form com edital + horarios |
| Listar alertas | Grupo 13 #6 | tool_listar_alertas | NAO | Tabela de alertas |
| Cancelar alertas | Grupo 13 #7-8 | tool_cancelar_alerta | NAO | Botao por alerta |

**PROMPTS FALTANDO:** Nenhum.
**O QUE FALTA:** Conectar page com forms.

---

#### MONITORIA (MonitoriaPage)
**Menu:** Indicadores → Monitoria
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Criar monitoramento | Grupo 15 #1-3 | tool_configurar_monitoramento | NAO | Form com termo + UF + frequencia |
| Listar monitoramentos | Grupo 15 #4 | tool_listar_monitoramentos | NAO | Tabela dados reais |
| Desativar monitoramento | Grupo 15 #5 | tool_desativar_monitoramento | NAO | Botao por monitoramento |
| **Verificar pendencias PNCP** | - | **NAO EXISTE** | NAO | **CRIAR tool_verificar_pendencias_pncp** |

**PROMPTS FALTANDO:** 1 (verificar pendencias).
**TOOLS FALTANDO:** tool_verificar_pendencias_pncp

---

#### CONCORRENCIA (ConcorrenciaPage)
**Menu:** Indicadores → Concorrencia
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Listar concorrentes | Grupo 8 #1-2 | tool_listar_concorrentes | NAO | Tabela dados reais |
| Analisar concorrente | Grupo 8 #3-5 | tool_analisar_concorrente | NAO | Botao "Analisar" por concorrente |

**PROMPTS FALTANDO:** Nenhum.
**O QUE FALTA:** Conectar page com dados reais.

---

#### MERCADO (MercadoPage)
**Menu:** Indicadores → Mercado
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| **Calcular TAM/SAM/SOM** | - | **NAO EXISTE** | NAO | **CRIAR tool_calcular_tam_sam_som** + form |
| Precos de mercado | Grupo 7 #1-3 | tool_buscar_precos_pncp | NAO | Panel com precos |

**PROMPTS FALTANDO:** 1 (calcular TAM/SAM/SOM).
**TOOLS FALTANDO:** tool_calcular_tam_sam_som

---

#### CONTRATADO X REALIZADO (ContratadoRealizadoPage)
**Menu:** Indicadores → Contratado X Realizado
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Dashboard contratado x realizado | - | **NAO EXISTE** | NAO | **CRIAR endpoint /api/dashboard/contratado-realizado** |

**PROMPTS FALTANDO:** Nenhum (dashboard puro, sem IA).
**TOOLS FALTANDO:** Endpoint REST dedicado.

---

#### PEDIDOS EM ATRASO
**Menu:** Indicadores → Pedidos em Atraso
**Status:** Mesma page que Contratado X Realizado com filtro

---

#### PERDAS (PerdasPage)
**Menu:** Indicadores → Perdas
**Status:** MOCK

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Dashboard de perdas | - | **NAO EXISTE** | NAO | **CRIAR endpoint /api/dashboard/perdas** |
| Consultar resultados | Grupo 5 #7-8 | tool_registrar_resultado | NAO | Tabela com dados reais |

**PROMPTS FALTANDO:** Nenhum.
**TOOLS FALTANDO:** Endpoint REST dedicado.

---

### 2.3 Configuracoes (3 paginas)

#### EMPRESA (EmpresaPage)
**Menu:** Configuracoes → Empresa
**Status:** CRUD FUNCIONAL (Onda 1), botoes IA desabilitados

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| CRUD empresa | - | CRUD empresas | SIM | OK |
| CRUD documentos | - | CRUD empresa-documentos | SIM | OK |
| CRUD certidoes | - | CRUD empresa-certidoes | SIM | OK |
| CRUD responsaveis | - | CRUD empresa-responsaveis | SIM | OK |
| **Buscar certidoes** | - | **NAO EXISTE** | DESABILITADO | **CRIAR tool_buscar_certidoes_empresa** |
| **Analisar documentos** | - | **NAO EXISTE** | DESABILITADO | **CRIAR tool_analisar_documentos_empresa** |

**PROMPTS FALTANDO:** 2 (buscar certidoes, analisar docs).
**TOOLS FALTANDO:** tool_buscar_certidoes_empresa, tool_analisar_documentos_empresa

---

#### PORTFOLIO (PortfolioPage)
**Menu:** Configuracoes → Portfolio
**Status:** 100% FUNCIONAL — referencia

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| Upload PDF | Grupo 1 #1 | tool_processar_upload | SIM | OK |
| Upload URL | Grupo 1 #2 | tool_download_arquivo | SIM | OK |
| Busca web | Grupo 1 #3-4 | tool_web_search | SIM | OK |
| Listar produtos | Grupo 1 #5-7 | tool_listar_produtos | SIM | OK |
| Reprocessar | Grupo 1 #8 | tool_reprocessar_produto | SIM | OK |
| Atualizar | Grupo 1 #9 | tool_atualizar_produto | SIM | OK |
| Excluir | Grupo 1 #10-11 | tool_excluir_produto | SIM | OK |
| Verificar completude | Grupo 10.1 #1-3 | tool_verificar_completude_produto | SIM | OK |

**TUDO OK.** Nada a fazer.

---

#### PARAMETRIZACOES (ParametrizacoesPage)
**Menu:** Configuracoes → Parametrizacoes
**Status:** CRUD FUNCIONAL (Onda 1), botoes IA desabilitados

| Funcionalidade | Prompt(s) do Chat | Tool Backend | Tem na UI? | O que falta? |
|---------------|-------------------|-------------|-----------|-------------|
| CRUD fontes editais | Grupo 11 #1-4 | tool_cadastrar_fonte, tool_listar_fontes | SIM (CRUD) | Prompts nao usados, ja tem modal |
| CRUD parametros score | - | CRUD parametros-score | SIM | OK |
| **Gerar classes IA** | - | **NAO EXISTE** | DESABILITADO | **CRIAR tool_gerar_classes_portfolio** |
| **Calcular pesos IA** | - | **NAO EXISTE** | DESABILITADO | Calculados manualmente por CRUD |
| **TAM/SAM/SOM** | - | **NAO EXISTE** | DESABILITADO | **CRIAR tool_calcular_tam_sam_som** |
| **Gerar palavras-chave** | - | **NAO EXISTE** | DESABILITADO | Onda 4 |
| **Sincronizar NCMs** | - | **NAO EXISTE** | DESABILITADO | Onda 4 |
| Configurar notificacoes | Grupo 16 #1-4 | tool_configurar_preferencias_notificacao | SIM (CRUD) | OK |

**PROMPTS FALTANDO:** 4 (gerar classes, palavras-chave, NCMs, TAM/SAM/SOM).
**TOOLS FALTANDO:** tool_gerar_classes_portfolio, tool_aplicar_mascara_descricao, tool_calcular_tam_sam_som

---

### 2.4 Paginas que NAO EXISTEM e precisam ser CRIADAS

| Page | Menu | Prompts Existentes | Tools Existentes | Onda |
|------|------|-------------------|-----------------|------|
| **AtasPage** | Indicadores → Atas | Grupo 6 (6 prompts) | tool_buscar_atas_pncp, tool_baixar_ata_pncp, tool_extrair_ata_pdf | Onda 3 (T26) |
| **AnalyticsPage** | Indicadores → Analytics | Grupo 12 (17 prompts) | tool_consulta_mindsdb | Onda 4 (T45) |

---

## 3. RESUMO: O QUE FALTA PARA COMPLETAR O SISTEMA

### 3.1 Tools que NAO EXISTEM (a criar)

| # | Tool | Page que precisa | Prompts necessarios | Prioridade |
|---|------|-----------------|--------------------|-----------|
| 1 | tool_calcular_score_documental | ValidacaoPage | "Calcule o score documental do edital [NUM]" | ALTA |
| 2 | tool_calcular_score_juridico | ValidacaoPage | "Calcule o score juridico do edital [NUM]" | ALTA |
| 3 | tool_calcular_score_logistico | ValidacaoPage | "Calcule o score logistico do edital [NUM]" | MEDIA |
| 4 | decision_engine_go_nogo | ValidacaoPage | "Calcule a decisao Go/NoGo do edital [NUM]" | ALTA |
| 5 | tool_gerar_impugnacao | ImpugnacaoPage | "Gere impugnacao para o edital [NUM] com motivo [MOT]" | MEDIA |
| 6 | tool_gerar_recurso | ImpugnacaoPage | "Gere recurso para o edital [NUM]" | MEDIA |
| 7 | tool_gerar_contra_razoes | ImpugnacaoPage | "Gere contra-razoes para o edital [NUM]" | MEDIA |
| 8 | tool_atualizar_status_proposta | SubmissaoPage | "Atualize o status da proposta do edital [NUM] para [STATUS]" | ALTA |
| 9 | tool_simular_lance | LancesPage | "Simule lances para o edital [NUM] com valor [VAL]" | MEDIA |
| 10 | tool_sugerir_lance | LancesPage | "Sugira lance para o edital [NUM]" | MEDIA |
| 11 | tool_calcular_tam_sam_som | MercadoPage / Parametrizacoes | "Calcule TAM/SAM/SOM baseado no portfolio" | BAIXA |
| 12 | tool_gerar_classes_portfolio | ParametrizacoesPage | "Gere classes de produto baseadas no portfolio" | BAIXA |
| 13 | tool_aplicar_mascara_descricao | PropostaPage | (automatico durante geracao de proposta) | BAIXA |
| 14 | tool_buscar_certidoes_empresa | EmpresaPage | "Busque certidoes da empresa [RAZAO] CNPJ [CNPJ]" | MEDIA |
| 15 | tool_analisar_documentos_empresa | EmpresaPage | "Analise documentos da empresa e verifique validade" | MEDIA |
| 16 | tool_verificar_pendencias_pncp | MonitoriaPage | "Verifique pendencias no PNCP" | BAIXA |
| 17 | tool_detectar_itens_intrusos | ValidacaoPage | "Detecte itens intrusos no edital [NUM]" | BAIXA |
| 18 | endpoint /api/dashboard/contratado-realizado | ContratadoRealizadoPage | (REST, sem prompt) | MEDIA |
| 19 | endpoint /api/dashboard/perdas | PerdasPage | (REST, sem prompt) | MEDIA |
| 20 | endpoint /api/propostas/export (PDF/DOCX) | PropostaPage | (REST, sem prompt) | ALTA |

### 3.2 Pages que precisam ser CONECTADAS (mock → real)

| # | Page | Grupo Menu | Status Atual | Prompts Existentes | Tools Existentes | Falta Tool? |
|---|------|-----------|-------------|-------------------|-----------------|------------|
| 1 | CaptacaoPage | Fluxo Comercial | MOCK | 23 prompts (Grupo 2) | TUDO PRONTO | NAO |
| 2 | ValidacaoPage | Fluxo Comercial | MOCK | 16 prompts (Grupos 2.1+3) | PARCIAL | SIM (4 tools) |
| 3 | ImpugnacaoPage | Fluxo Comercial | MOCK | 0 prompts dedicados | NADA | SIM (3 tools) |
| 4 | PrecificacaoPage | Fluxo Comercial | MOCK | 10 prompts (Grupos 7+9) | TUDO PRONTO | NAO |
| 5 | PropostaPage | Fluxo Comercial | MOCK | 3 prompts (Grupo 4) | PARCIAL | SIM (export) |
| 6 | SubmissaoPage | Fluxo Comercial | MOCK | 0 prompts | NADA | SIM (1 tool) |
| 7 | LancesPage | Fluxo Comercial | MOCK | 0 prompts | NADA | SIM (2 tools) |
| 8 | FollowupPage | Fluxo Comercial | MOCK | 8 prompts (Grupo 5) | TUDO PRONTO | NAO |
| 9 | CRMPage | Fluxo Comercial | MOCK | 0 prompts (CRUD puro) | CRUD | NAO (trigger auto) |
| 10 | ProducaoPage | Fluxo Comercial | MOCK | 0 prompts (CRUD puro) | CRUD | NAO |
| 11 | FlagsPage | Indicadores | MOCK | 12 prompts (Grupos 13+14) | TUDO PRONTO | NAO |
| 12 | MonitoriaPage | Indicadores | MOCK | 5 prompts (Grupo 15) | PARCIAL | SIM (1 tool) |
| 13 | ConcorrenciaPage | Indicadores | MOCK | 5 prompts (Grupo 8) | TUDO PRONTO | NAO |
| 14 | MercadoPage | Indicadores | MOCK | 0 prompts | NADA | SIM (1 tool) |
| 15 | ContratadoRealizadoPage | Indicadores | MOCK | 0 prompts (dashboard) | NADA | SIM (endpoint) |
| 16 | PerdasPage | Indicadores | MOCK | 0 prompts (dashboard) | NADA | SIM (endpoint) |

---

## 4. REORGANIZACAO PROPOSTA DAS ONDAS

Reorganizacao baseada na **aderencia aos prompts existentes** — priorizar o que ja funciona no backend.

### ONDA 1: Infraestrutura de Conexao — CONCLUIDA (7/7 tasks)

**O que foi feito:**

| # | Task | Page/Arquivo | Status | Prompts Envolvidos |
|---|------|-------------|--------|-------------------|
| T1 | onSendToChat em todas as 20 pages | App.tsx + types/index.ts | CONCLUIDO | Infraestrutura (nenhum prompt direto) |
| T2 | action_type + resultado no useChat | useChat.ts | CONCLUIDO | Infraestrutura |
| T3 | Dashboard dados reais | Dashboard.tsx | CONCLUIDO | Nenhum (endpoint REST) |
| T4 | EmpresaPage CRUD real | EmpresaPage.tsx | CONCLUIDO | Nenhum (CRUD puro, conforme RF-001/002) |
| T5 | GET /api/dashboard/stats | backend/app.py | CONCLUIDO | Nenhum (endpoint REST) |
| T6 | ParametrizacoesPage CRUD real | ParametrizacoesPage.tsx | CONCLUIDO | Grupo 11 (fontes) parcial — CRUD funciona, prompts nao usados |
| T7 | tool_calcular_aderencia le pesos do banco | backend/tools.py | CONCLUIDO | Grupo 3 #1 (calcular aderencia) — agora le pesos do DB |

**Prompts da Onda 1 — Analise de Aderencia:**

A Onda 1 nao adicionou prompts novos na interface. Sua funcao foi **criar a infraestrutura** para as ondas seguintes:
- `onSendToChat` em todas as pages (T1) — permite que qualquer page envie prompts
- `action_type` + `resultado` (T2) — permite que pages recebam respostas estruturadas
- CRUD real nas pages de configuracao (T4, T6) — dados reais para alimentar os prompts
- Dashboard com endpoint real (T3, T5) — visao geral funcional
- Pesos de score do banco (T7) — prompts de aderencia usam config do usuario

**O que ficou pendente na Onda 1 (corrigido depois):**

| Problema | Correcao | Impacto nos Prompts |
|----------|---------|-------------------|
| Dashboard crash (Cannot read 'captacao') | Transformacao JSON → DashboardStats | Nenhum (REST puro) |
| Botoes IA jogavam texto no chat (UX ruim) | Desabilitados com Lock + "(Em breve)" | Botoes nao geram mais prompts incorretos |
| "Cadastrar via IA" criou lixo no banco | Removido botao, CRUD ja tem modal | Fonte cadastrada errada foi deletada |

**Conclusao Onda 1:** A infraestrutura esta pronta. A ponte `onSendToChat` funciona em todas as 20 pages. O problema e que **nenhuma page do Fluxo Comercial ou Indicadores usa essa ponte ainda** — todas estao em mock. As tools do backend que ja existem (49 tools, 108 prompts) nao estao acessiveis pela interface grafica, so pelo dropdown de prompts do chat.

---

### ONDA 2 (PRIORIDADE MAXIMA): Pages com prompts+tools 100% prontos

Essas pages so precisam de frontend — TODOS os prompts e tools ja existem.

| # | Page | Prompts Prontos | O que fazer |
|---|------|----------------|------------|
| 1 | **CaptacaoPage** | 23 prompts (buscar/salvar/classificar editais) | Remover mock, form de busca com filtros, tabela com botoes salvar, checkbox selecao |
| 2 | **PrecificacaoPage** | 10 prompts (precos PNCP + historico + recomendacao) | Remover mock, form busca preco, panel historico, botao recomendar |
| 3 | **FollowupPage** | 8 prompts (registrar resultados) | Remover mock, forms vitoria/derrota com campos, tabela resultados |
| 4 | **FlagsPage** | 12 prompts (alertas + calendario + prazos) | Remover mock, form configurar alerta, calendario visual, dashboard prazos |
| 5 | **MonitoriaPage** | 5 prompts (monitoramento automatico) | Remover mock, form com termo+UF+freq, tabela monitoramentos ativos |
| 6 | **ConcorrenciaPage** | 5 prompts (listar + analisar concorrentes) | Remover mock, tabela concorrentes, botao analisar com resultado |
| 7 | **CRMPage** | 0 (CRUD puro) | Remover mock, CRUD leads-crm + acoes-pos-perda |
| 8 | **ProducaoPage** | 0 (CRUD puro) | Remover mock, CRUD contratos + entregas |

**Estimativa:** 6-8 horas com 3 agentes em paralelo
**Zero backend novo necessario.**

---

### ONDA 3: Pages que precisam de tools novas no backend

| # | Page | Tools a CRIAR | Prompts a CRIAR |
|---|------|-------------|----------------|
| 1 | **ValidacaoPage** | tool_calcular_score_documental, tool_calcular_score_juridico, decision_engine_go_nogo | 3 prompts de score |
| 2 | **PropostaPage** | endpoint /api/propostas/export | 0 (export REST) |
| 3 | **SubmissaoPage** | tool_atualizar_status_proposta | 1 prompt |
| 4 | **ImpugnacaoPage** | tool_gerar_impugnacao, tool_gerar_recurso, tool_gerar_contra_razoes | 3 prompts |
| 5 | **EmpresaPage** (ativar IA) | tool_buscar_certidoes_empresa, tool_analisar_documentos_empresa | 2 prompts |
| 6 | **ContratadoRealizadoPage** | endpoint /api/dashboard/contratado-realizado | 0 (REST) |
| 7 | **PerdasPage** | endpoint /api/dashboard/perdas | 0 (REST) |
| 8 | **AtasPage** (NOVA) | Nenhum (tools ja existem!) | 0 |

**Estimativa:** 8-12 horas com 4 agentes
**Backend: 9 tools/endpoints novos + 9 prompts novos**

---

### ONDA 4: Funcionalidades avancadas + QA

| # | Page | Tools a CRIAR | Prompts a CRIAR |
|---|------|-------------|----------------|
| 1 | **ValidacaoPage** (completar) | tool_calcular_score_logistico | 1 prompt |
| 2 | **LancesPage** | tool_simular_lance, tool_sugerir_lance | 2 prompts |
| 3 | **MercadoPage** | tool_calcular_tam_sam_som | 1 prompt |
| 4 | **ParametrizacoesPage** (ativar IA) | tool_gerar_classes_portfolio, tool_aplicar_mascara_descricao | 2 prompts |
| 5 | **MonitoriaPage** (completar) | tool_verificar_pendencias_pncp | 1 prompt |
| 6 | **AnalyticsPage** (NOVA) | Nenhum (tool_consulta_mindsdb ja existe!) | 0 |
| 7 | **ValidacaoPage** | tool_detectar_itens_intrusos | 1 prompt |
| 8 | QA end-to-end | - | - |
| 9 | Backend: pipeline aprendizado | - | - |
| 10 | Backend: middleware auditoria | - | - |
| 11 | Backend: SMTP producao | - | - |

**Estimativa:** 6-10 horas com 4 agentes
**Backend: 7 tools novos + 8 prompts novos**

---

## 5. TOTAIS

| Metrica | Valor |
|---------|-------|
| Total de prompts existentes no chat | 108 |
| Total de prompts com tool funcional | 103 (95%) |
| Total de prompts sem tool (marcados ❌) | 5 |
| Pages 100% funcionais | 1 (PortfolioPage) |
| Pages CRUD funcional (Onda 1) | 3 (Dashboard, EmpresaPage, ParametrizacoesPage) |
| Pages MOCK a conectar | 16 |
| Pages a CRIAR | 2 (AtasPage, AnalyticsPage) |
| Tools que faltam criar | 17 |
| Prompts que faltam criar | ~17 |
| Endpoints REST que faltam criar | 3 |

### O que funciona HOJE no chat vs o que esta na UI:

| Capacidade | No Chat (prompt) | Na UI (page) | Gap |
|-----------|-----------------|-------------|-----|
| Cadastrar produto (PDF/URL/web) | SIM (11 prompts) | SIM (PortfolioPage) | ZERO |
| Buscar editais PNCP | SIM (23 prompts) | NAO (CaptacaoPage mock) | ALTO |
| Analisar edital (resumir/perguntar) | SIM (13 prompts) | NAO (ValidacaoPage mock) | ALTO |
| Calcular aderencia | SIM (3 prompts) | NAO (ValidacaoPage mock) | ALTO |
| Gerar proposta | SIM (3 prompts) | NAO (PropostaPage mock) | ALTO |
| Registrar resultados | SIM (8 prompts) | NAO (FollowupPage mock) | ALTO |
| Buscar precos / recomendar | SIM (10 prompts) | NAO (PrecificacaoPage mock) | ALTO |
| Analisar concorrentes | SIM (5 prompts) | NAO (ConcorrenciaPage mock) | MEDIO |
| Alertas e prazos | SIM (12 prompts) | NAO (FlagsPage mock) | MEDIO |
| Monitoramento automatico | SIM (5 prompts) | NAO (MonitoriaPage mock) | MEDIO |
| Consultas analiticas MindsDB | SIM (17 prompts) | NAO (nao tem page) | MEDIO |
| Buscar/extrair atas | SIM (6 prompts) | NAO (nao tem page) | MEDIO |
| Fontes de editais | SIM (4 prompts) | SIM (CRUD funcional) | ZERO |
| Notificacoes | SIM (4 prompts) | SIM (CRUD funcional) | ZERO |
| Gerar impugnacao/recurso | NAO (0 prompts) | NAO (mock) | CRIAR TUDO |
| Simular/sugerir lances | NAO (0 prompts) | NAO (mock) | CRIAR TUDO |
| Scores documental/juridico | NAO (0 prompts) | NAO (mock) | CRIAR TUDO |
| TAM/SAM/SOM | NAO (0 prompts) | NAO (mock) | CRIAR TUDO |

---

## 6. DESIGN DE INTERFACE PARA CADA FUNCAO

Para cada funcao onde o prompt exige dados do usuario, a UI deve ter um **form/modal** que coleta esses dados e gera o prompt automaticamente. O usuario NUNCA deve digitar o prompt manualmente.

### Padroes de UI por tipo de acao:

**Padrao A — Busca com Filtros:**
Usado em: CaptacaoPage, PrecificacaoPage, Atas
```
[ Campo texto: termo de busca ]
[ Filtros: UF, data, com/sem score, incl. encerrados ]
[ Botao: Buscar ]
→ Gera: "Busque editais de {termo} no PNCP" (com filtros aplicados)
→ Exibe resultado em tabela na propria page (nao no chat)
```

**Padrao B — Acao sobre item selecionado:**
Usado em: ValidacaoPage, ConcorrenciaPage, FlagsPage
```
Tabela com dados
[ Selecionar item ] → [ Botao: Resumir | Analisar | Calcular ]
→ Gera: "Resuma o edital {numero}" (numero vem do item selecionado)
→ Exibe resultado inline ou em modal (nao no chat)
```

**Padrao C — Form de cadastro com IA:**
Usado em: FollowupPage, ImpugnacaoPage, PropostaPage
```
Modal com campos obrigatorios:
  [ Select: edital ]
  [ Select: produto ]
  [ Campo: valor / motivo / fundamento ]
[ Botao: Gerar / Registrar ]
→ Gera: "Gere proposta do produto {prod} para edital {edit} com preco R$ {val}"
→ Exibe resultado inline com opcoes (salvar, editar, exportar)
```

**Padrao D — Dashboard puro (sem IA):**
Usado em: ContratadoRealizadoPage, PerdasPage, Dashboard
```
Cards + graficos carregados de endpoint REST dedicado
Sem interacao com chat
Atualizar com botao "Refresh"
```

**Padrao E — Monitoramento/Alerta:**
Usado em: MonitoriaPage, FlagsPage
```
Form de configuracao:
  [ Campo: termo ]
  [ Multi-select: UFs ]
  [ Select: frequencia ]
[ Botao: Criar Monitoramento ]
→ Gera: "Monitore editais de {termo} em {UFs} a cada {freq} horas"
→ Tabela de monitoramentos ativos com botao Pausar/Excluir
```
