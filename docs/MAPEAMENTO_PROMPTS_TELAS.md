# MAPEAMENTO COMPLETO: PROMPTS DO DROPDOWN -> TELAS

**Data**: 2026-02-10
**Fonte**: ChatInput.tsx (PROMPTS_PRONTOS) + PLANO_TELAS_FUNCIONAIS.md

---

## 1. TABELA COMPLETA DE MAPEAMENTO

| # | Categoria Dropdown | ID do Prompt | Nome no Dropdown | Tela Destino | Elemento UI |
|---|-------------------|--------------|------------------|--------------|-------------|
| | **1. CADASTRO DE PRODUTOS** | | | | |
| 1 | Cadastro | `upload_manual` | 📎 Cadastrar produto (upload PDF) | **Portfolio** | Botao "Upload PDF" |
| 2 | Cadastro | `download_url` | 🔗 Cadastrar produto de URL | **Portfolio** | Botao "Buscar na Web" + URL |
| 3 | Busca Web | `buscar_produto_web` | 🌐 Buscar manual na web | **Portfolio** | Botao "Buscar na Web" |
| 4 | Busca Web | `buscar_datasheet_web` | 🌐 Buscar datasheet na web | **Portfolio** | Botao "Buscar na Web" |
| 5 | Busca Banco | `listar_produtos` | 💾 Listar meus produtos | **Portfolio** | Tabela de produtos (carga inicial) |
| 6 | Busca Banco | `buscar_produto_banco` | 💾 Buscar produto no banco | **Portfolio** | Campo "Buscar" |
| 7 | Busca Banco | `verificar_produto_cadastrado` | 💾 Verificar produto cadastrado | **Portfolio** | Campo "Buscar" |
| 8 | Gestao | `reprocessar_produto` | 🔄 Reprocessar especificacoes | **Portfolio** | Icone 🔄 na linha |
| 9 | Gestao | `atualizar_produto` | ✏️ Atualizar/editar produto | **Portfolio** | Icone ✏️ na linha |
| 10 | Gestao | `excluir_produto` | 🗑️ Excluir produto | **Portfolio** | Icone 🗑️ na linha |
| 11 | Gestao | `excluir_todos_produtos` | 🗑️ Excluir TODOS os produtos | **Portfolio** | Botao "Excluir Todos" (config) |
| | **2. BUSCA E CADASTRO DE EDITAIS** | | | | |
| 12 | Busca Web | `buscar_editais_web` | 🌐 Buscar editais (com score) | **Captacao** | Botao "Buscar" + checkbox score |
| 13 | Busca Web | `buscar_edital_numero_web` | 🌐 Buscar edital por numero | **Captacao** | Campo termo + numero |
| 14 | Busca Web | `buscar_editais_web2` | 🌐 Encontrar editais (com score) | **Captacao** | Botao "Buscar" |
| 15 | Busca Simples | `buscar_editais_simples` | 📋 Buscar editais (sem score) | **Captacao** | Checkbox "score" desmarcado |
| 16 | Busca Simples | `buscar_editais_simples2` | 📋 Listar editais da web | **Captacao** | Checkbox "score" desmarcado |
| 17 | Busca Todos | `buscar_editais_todos` | 📋 Buscar TODOS (incl. encerrados) | **Captacao** | Checkbox "Incluir encerrados" |
| 18 | Busca Todos | `buscar_editais_todos_score` | 🌐 Buscar TODOS com score | **Captacao** | Ambos checkboxes marcados |
| 19 | Links | `buscar_links_editais` | 🔗 Links de editais por area | **Captacao** | Campo termo/area |
| 20 | Links | `buscar_links_editais2` | 🔗 Links editais (equipamentos) | **Captacao** | Campo termo preset |
| 21 | Links | `buscar_links_editais3` | 🔗 Links editais (laboratorio) | **Captacao** | Campo termo preset |
| 22 | Busca Banco | `buscar_editais_banco` | 💾 Buscar editais no banco | **Validacao** | Campo "Buscar" |
| 23 | Busca Banco | `buscar_edital_numero_banco` | 💾 Buscar edital no sistema | **Validacao** | Campo "Buscar" |
| 24 | Busca Banco | `verificar_edital_cadastrado` | 💾 Verificar edital cadastrado | **Validacao** | Campo "Buscar" |
| 25 | Listagem | `listar_editais` | 📋 Listar editais salvos | **Validacao** | Tabela (carga inicial) |
| 26 | Listagem | `listar_editais_status` | 📋 Listar editais por status | **Validacao** | Filtro "Status" |
| 27 | Cadastro | `cadastrar_edital` | ➕ Cadastrar edital manualmente | **Captacao** | Modal "Cadastrar Manual" |
| 28 | Salvar | `salvar_editais` | 💾 Salvar editais da busca | **Captacao** | Botao "Salvar Todos" |
| 29 | Salvar | `salvar_editais_todos` | 💾 Salvar TODOS os editais | **Captacao** | Botao "Salvar Todos" |
| 30 | Salvar | `salvar_editais_recomendados` | 💾 Salvar recomendados | **Captacao** | Botao "Salvar Recomendados" |
| 31 | Salvar | `salvar_edital_especifico` | 💾 Salvar edital especifico | **Captacao** | Icone 💾 na linha |
| 32 | Gestao | `atualizar_edital` | ✏️ Atualizar/editar edital | **Validacao** | Dropdown "Mudar Status" |
| 33 | Gestao | `excluir_edital` | 🗑️ Excluir edital | **Validacao** | Icone 🗑️ na linha |
| 34 | Gestao | `excluir_todos_editais` | 🗑️ Excluir TODOS os editais | **Validacao** | Botao config (modal) |
| | **2.1 ANALISE DE EDITAIS** | | | | |
| 35 | Resumir | `resumir_edital` | 📋 Resumir edital | **Validacao** | Botao "Resumir" |
| 36 | Resumir | `resumir_edital_2` | 📋 Resumo do edital | **Validacao** | Botao "Resumir" |
| 37 | Resumir | `resumir_edital_3` | 📋 Sintetizar edital | **Validacao** | Botao "Resumir" |
| 38 | Perguntar | `perguntar_edital` | 💬 Perguntar ao edital | **Validacao** | Campo "Perguntar ao edital" |
| 39 | Perguntar | `perguntar_edital_2` | 💬 Prazo do edital | **Validacao** | Campo "Perguntar ao edital" |
| 40 | Perguntar | `perguntar_edital_3` | 💬 Documentos exigidos | **Validacao** | Campo "Perguntar ao edital" |
| 41 | Perguntar | `perguntar_edital_4` | 💬 Garantia exigida? | **Validacao** | Campo "Perguntar ao edital" |
| 42 | Perguntar | `perguntar_edital_5` | 💬 Requisitos tecnicos | **Validacao** | Campo "Perguntar ao edital" |
| 43 | Perguntar | `perguntar_edital_6` | 💬 Itens do edital | **Validacao** | Campo "Perguntar ao edital" |
| 44 | Perguntar | `perguntar_edital_7` | 💬 Tudo sobre o edital | **Validacao** | Campo "Perguntar ao edital" |
| 45 | Download | `baixar_pdf_edital` | 📥 Baixar PDF do edital | **Validacao** | Botao "Baixar PDF" |
| 46 | Download | `baixar_pdf_edital_2` | 📥 Download do edital | **Validacao** | Botao "Baixar PDF" |
| 47 | URL | `atualizar_url_edital` | 🔗 Atualizar URL do edital | **Validacao** | Modal editar edital |
| | **3. ANALISE DE ADERENCIA** | | | | |
| 48 | Aderencia | `calcular_aderencia` | 🎯 Calcular aderencia | **Validacao** | Botao "Calcular Aderencia" |
| 49 | Aderencia | `listar_analises` | 📊 Listar analises realizadas | **Validacao** | Aba "Analises" |
| 50 | Aderencia | `verificar_completude_aderencia` | 📝 Verificar completude | **Portfolio** | Botao "Verificar Completude" |
| | **4. GERACAO DE PROPOSTAS** | | | | |
| 51 | Proposta | `gerar_proposta` | 📝 Gerar proposta tecnica | **Proposta** | Formulario + Botao "Gerar" |
| 52 | Proposta | `listar_propostas` | 📄 Listar propostas geradas | **Proposta** | Tabela "Minhas Propostas" |
| 53 | Proposta | `excluir_proposta` | 🗑️ Excluir proposta | **Proposta** | Icone 🗑️ na linha |
| | **5. REGISTRO DE RESULTADOS** | | | | |
| 54 | Resultado | `registrar_vitoria` | 🏆 Registrar vitoria | **Followup** | Radio "Vitoria" + form |
| 55 | Resultado | `registrar_derrota` | 📉 Registrar derrota | **Followup** | Radio "Derrota" + form |
| 56 | Resultado | `registrar_derrota_motivo` | 📉 Registrar derrota c/ motivo | **Followup** | Radio "Derrota" + dropdown motivo |
| 57 | Resultado | `registrar_cancelado` | ⛔ Edital cancelado | **Followup** | Radio "Cancelado" |
| 58 | Resultado | `registrar_deserto` | ⛔ Edital deserto | **Followup** | Radio "Deserto" |
| 59 | Resultado | `registrar_revogado` | ⛔ Edital revogado | **Followup** | Radio "Revogado" |
| 60 | Consulta | `consultar_resultado` | 🔎 Consultar resultado de edital | **Followup** | Tabela "Resultados Recentes" |
| 61 | Consulta | `consultar_todos_resultados` | 📊 Ver todos os resultados | **Followup** / **Perdas** | Tabela completa |
| | **6. BUSCA E EXTRACAO DE ATAS** | | | | |
| 62 | Atas | `buscar_atas` | 🔍 Buscar atas no PNCP | **Precificacao** | Secao "Precos de Mercado" |
| 63 | Atas | `buscar_atas_2` | 🔍 Encontrar atas de pregao | **Precificacao** | Secao "Precos de Mercado" |
| 64 | Atas | `baixar_atas` | 📥 Baixar atas do PNCP | **Precificacao** | Botao download na tabela |
| 65 | Atas | `extrair_ata` | 📄 Extrair resultados de ata | **Followup** | Upload PDF + extracao |
| 66 | Atas | `extrair_vencedor` | 🏆 Quem ganhou este pregao? | **Followup** | Upload PDF + extracao |
| 67 | Atas | `registrar_ata` | 💾 Registrar resultados da ata | **Followup** | Botao apos extracao |
| | **7. HISTORICO DE PRECOS** | | | | |
| 68 | Precos PNCP | `buscar_precos_pncp` | 💰 Buscar precos no PNCP | **Precificacao** | Botao "Buscar no PNCP" |
| 69 | Precos PNCP | `buscar_precos_pncp_2` | 💰 Preco de mercado | **Precificacao** | Botao "Buscar no PNCP" |
| 70 | Precos PNCP | `buscar_precos_pncp_3` | 💰 Quanto custa? | **Precificacao** | Botao "Buscar no PNCP" |
| 71 | Historico | `historico_precos` | 📈 Ver historico de precos | **Precificacao** | Secao "Meu Historico" |
| 72 | Historico | `historico_precos_2` | 📈 Precos registrados | **Precificacao** | Secao "Meu Historico" |
| 73 | Historico | `historico_precos_3` | 📈 Historico do produto | **Precificacao** | Secao "Meu Historico" |
| | **8. ANALISE DE CONCORRENTES** | | | | |
| 74 | Concorrentes | `listar_concorrentes` | 👥 Listar concorrentes | **Concorrencia** | Tabela principal |
| 75 | Concorrentes | `listar_concorrentes_2` | 👥 Quais concorrentes? | **Concorrencia** | Tabela principal |
| 76 | Concorrentes | `analisar_concorrente` | 🔍 Analisar concorrente | **Concorrencia** | Painel de detalhes |
| 77 | Concorrentes | `analisar_concorrente_2` | 🔍 Historico do concorrente | **Concorrencia** | Painel de detalhes |
| 78 | Concorrentes | `analisar_concorrente_3` | 📊 Taxa de vitoria | **Concorrencia** | Painel de detalhes |
| | **9. RECOMENDACAO DE PRECOS** | | | | |
| 79 | Recomendacao | `recomendar_preco` | 💡 Recomendar preco | **Precificacao** | Botao "Recomendar Preco" |
| 80 | Recomendacao | `recomendar_preco_2` | 💡 Qual preco sugerir? | **Precificacao** | Botao "Recomendar Preco" |
| 81 | Recomendacao | `recomendar_preco_3` | 💡 Que preco colocar? | **Precificacao** | Botao "Recomendar Preco" |
| 82 | Recomendacao | `recomendar_preco_4` | 📊 Faixa de preco | **Precificacao** | Resultado da recomendacao |
| | **10. CLASSIFICACAO DE EDITAIS** | | | | |
| 83 | Classificacao | `classificar_edital` | 🏷️ Classificar edital | **Validacao** | Dropdown "Tipo" no filtro |
| 84 | Classificacao | `classificar_edital_2` | 🏷️ Tipo de edital | **Validacao** | Dropdown "Tipo" no filtro |
| 85 | Classificacao | `classificar_edital_3` | 🏷️ E comodato ou venda? | **Validacao** | Badge de tipo na tabela |
| | **10.1 COMPLETUDE DE PRODUTOS** | | | | |
| 86 | Completude | `verificar_completude` | 📋 Verificar completude | **Portfolio** | Botao "Verificar Completude" |
| 87 | Completude | `verificar_completude_2` | 📋 Produto esta completo? | **Portfolio** | Indicador % na tabela |
| 88 | Completude | `verificar_completude_3` | 📋 Falta informacao? | **Portfolio** | Indicador % na tabela |
| | **11. FONTES DE EDITAIS** | | | | |
| 89 | Fontes | `cadastrar_fonte` | ➕ Cadastrar fonte de editais | **Parametrizacoes** | Botao "+ Cadastrar Fonte" |
| 90 | Fontes | `listar_fontes` | 🌐 Listar fontes de editais | **Parametrizacoes** | Tabela "Fontes de Editais" |
| 91 | Fontes | `ativar_fonte` | ✅ Ativar fonte | **Parametrizacoes** | Icone ▶️ na linha |
| 92 | Fontes | `desativar_fonte` | ❌ Desativar fonte | **Parametrizacoes** | Icone ⏸️ na linha |
| | **12. CONSULTAS ANALITICAS (MindsDB)** | | | | |
| 93 | MindsDB | `mindsdb_totais` | 📊 Quantos produtos e editais? | **Dashboard** | Card KPI |
| 94 | MindsDB | `mindsdb_editais_novos` | 📊 Editais com status novo | **Validacao** | Filtro "Status: Novo" |
| 95 | MindsDB | `mindsdb_editais_orgao` | 📊 Editais por orgao | **Validacao** | Filtro por orgao |
| 96 | MindsDB | `mindsdb_editais_mes` | 📊 Editais do mes | **Mercado** | Grafico de tendencias |
| 97 | MindsDB | `mindsdb_score_medio` | 📊 Score medio de aderencia | **Dashboard** | Card KPI |
| 98 | MindsDB | `mindsdb_produtos_categoria` | 📊 Produtos por categoria | **Mercado** | Tabela "Categorias" |
| 99 | MindsDB | `mindsdb_alta_aderencia` | 📊 Produtos c/ alta aderencia | **Validacao** | Filtro score > 70% |
| 100 | MindsDB | `mindsdb_propostas` | 📊 Total de propostas | **Dashboard** | Card KPI |
| 101 | MindsDB | `mindsdb_editais_semana` | 📊 Editais da semana | **Dashboard** / **Flags** | Card "Atencao Imediata" |
| 102 | MindsDB | `mindsdb_melhor_produto` | 📊 Produto c/ melhor score | **Dashboard** | Card insight |
| 103 | MindsDB | `mindsdb_editais_uf` | 📊 Editais por UF | **Mercado** | Grafico/Mapa |
| 104 | MindsDB | `mindsdb_resumo` | 📊 Resumo geral do banco | **Dashboard** | Todos os cards |
| 105 | MindsDB | `mindsdb_vitorias_derrotas` | 📊 Vitorias e derrotas | **Perdas** | Resumo no topo |
| 106 | MindsDB | `mindsdb_concorrentes_frequentes` | 📊 Concorrentes frequentes | **Concorrencia** | Tabela ordenada |
| 107 | MindsDB | `mindsdb_preco_medio_categoria` | 📊 Preco medio por categoria | **Mercado** | Grafico de precos |
| 108 | MindsDB | `mindsdb_editais_valor` | 📊 Editais por faixa de valor | **Mercado** | Grafico de distribuicao |
| 109 | MindsDB | `mindsdb_taxa_sucesso` | 📊 Taxa de sucesso | **Dashboard** / **Perdas** | Card KPI |
| | **13. ALERTAS E PRAZOS (Sprint 2)** | | | | |
| 110 | Alertas | `dashboard_prazos` | 📊 Dashboard de prazos | **Flags** | Secao "Alertas Ativos" |
| 111 | Alertas | `dashboard_prazos_mes` | 📊 Prazos do mes | **Flags** | Filtro periodo |
| 112 | Alertas | `proximos_pregoes` | 📅 Proximos pregoes | **Lances** | Lista "Pregoes Hoje" |
| 113 | Alertas | `configurar_alertas` | 🔔 Configurar alertas | **Flags** | Formulario "Criar Alerta" |
| 114 | Alertas | `configurar_alertas_2` | 🔔 Avise-me antes | **Flags** | Formulario "Criar Alerta" |
| 115 | Alertas | `listar_alertas` | 🔔 Meus alertas | **Flags** | Tabela "Meus Alertas" |
| 116 | Alertas | `cancelar_alerta` | ❌ Cancelar alerta | **Flags** | Icone 🗑️ na linha |
| 117 | Alertas | `cancelar_todos_alertas` | ❌ Cancelar todos alertas | **Flags** | Botao config |
| | **14. CALENDARIO DE EDITAIS (Sprint 2)** | | | | |
| 118 | Calendario | `calendario_mes` | 📅 Calendario do mes | **Dashboard** | Card "Proximos Eventos" |
| 119 | Calendario | `calendario_semana` | 📅 Esta semana | **Dashboard** | Card "Proximos Eventos" |
| 120 | Calendario | `calendario_proximo_mes` | 📅 Calendario marco | **Dashboard** | Card com filtro mes |
| 121 | Calendario | `datas_importantes` | 📅 Datas importantes | **Flags** | Lista de datas |
| | **15. MONITORAMENTO AUTOMATICO (Sprint 2)** | | | | |
| 122 | Monitoria | `configurar_monitoramento` | 👁️ Criar monitoramento | **Monitoria** | Formulario "Criar Monitoramento" |
| 123 | Monitoria | `configurar_monitoramento_uf` | 👁️ Monitorar por UF | **Monitoria** | Checkboxes de UF |
| 124 | Monitoria | `configurar_monitoramento_freq` | 👁️ Monitorar a cada X horas | **Monitoria** | Radio de frequencia |
| 125 | Monitoria | `listar_monitoramentos` | 📋 Meus monitoramentos | **Monitoria** | Tabela principal |
| 126 | Monitoria | `desativar_monitoramento` | ⏸️ Parar monitoramento | **Monitoria** | Icone ⏸️ na linha |
| | **16. NOTIFICACOES (Sprint 2)** | | | | |
| 127 | Notificacoes | `configurar_notificacoes` | ⚙️ Configurar notificacoes | **Parametrizacoes** | Secao "Notificacoes" |
| 128 | Notificacoes | `configurar_email` | 📧 Configurar email | **Parametrizacoes** | Campo email |
| 129 | Notificacoes | `historico_notificacoes` | 📜 Historico de notificacoes | **Flags** | Aba "Historico" |
| 130 | Notificacoes | `notificacoes_nao_lidas` | 🔵 Notificacoes nao lidas | **Flags** | Badge no icone sino |
| | **17. EXTRACAO DE DATAS (Sprint 2)** | | | | |
| 131 | Datas | `extrair_datas` | 📅 Extrair datas do edital | **Validacao** | Apos upload PDF |
| 132 | Datas | `extrair_datas_2` | 📅 Identificar prazos | **Validacao** | Secao "Prazos" |
| | **OUTROS / AJUDA** | | | | |
| 133 | Outros | `ajuda` | ❓ O que posso fazer? | **Chat Flutuante** | Resposta do Dr. Licita |
| 134 | Outros | `chat_livre` | 💬 Perguntar sobre licitacoes | **Chat Flutuante** | Resposta do Dr. Licita |
| 135 | Outros | `chat_lei` | 💬 Duvida sobre legislacao | **Chat Flutuante** | Resposta do Dr. Licita |
| 136 | Outros | `chat_impugnacao` | 💬 Como fazer impugnacao | **Impugnacao** | Botao "Gerar Texto com IA" |
| 137 | Outros | `chat_recurso` | 💬 Como fazer recurso | **Impugnacao** | Botao "Gerar Texto com IA" |

---

## 2. RESUMO: PROMPTS POR TELA

| Tela | Qtd Prompts | Principais Funcoes |
|------|-------------|-------------------|
| **Portfolio** | 11 | Cadastro, busca, gestao de produtos |
| **Captacao** | 14 | Busca na web, salvar editais |
| **Validacao** | 21 | Listar, resumir, perguntar, aderencia |
| **Precificacao** | 10 | Precos PNCP, historico, recomendacao |
| **Proposta** | 3 | Gerar, listar, excluir propostas |
| **Followup** | 10 | Resultados, vitorias, derrotas, atas |
| **Impugnacao** | 2 | Gerar texto impugnacao/recurso |
| **Lances** | 1 | Proximos pregoes |
| **Flags** | 11 | Alertas, prazos, notificacoes |
| **Monitoria** | 5 | Monitoramento automatico |
| **Concorrencia** | 5 | Analise de concorrentes |
| **Mercado** | 5 | Tendencias, categorias, precos |
| **Perdas** | 3 | Vitorias/derrotas, taxa sucesso |
| **Dashboard** | 8 | KPIs, resumos, calendario |
| **Parametrizacoes** | 6 | Fontes, notificacoes, preferencias |
| **Chat Flutuante** | 3 | Perguntas gerais, legislacao |
| **TOTAL** | **137** | |

---

## 3. DETALHAMENTO POR TELA

### 3.1 PORTFOLIO (11 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `upload_manual` | Cadastrar produto (upload PDF) | Botao "Upload PDF" |
| `download_url` | Cadastrar produto de URL | Botao "Buscar na Web" + URL |
| `buscar_produto_web` | Buscar manual na web | Botao "Buscar na Web" |
| `buscar_datasheet_web` | Buscar datasheet na web | Botao "Buscar na Web" |
| `listar_produtos` | Listar meus produtos | Tabela (carga inicial) |
| `buscar_produto_banco` | Buscar produto no banco | Campo "Buscar" |
| `verificar_produto_cadastrado` | Verificar produto cadastrado | Campo "Buscar" |
| `reprocessar_produto` | Reprocessar especificacoes | Icone 🔄 |
| `atualizar_produto` | Atualizar/editar produto | Icone ✏️ |
| `excluir_produto` | Excluir produto | Icone 🗑️ |
| `verificar_completude` | Verificar completude | Botao / Indicador % |

---

### 3.2 CAPTACAO (14 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `buscar_editais_web` | Buscar editais (com score) | Botao "Buscar" + checkbox |
| `buscar_edital_numero_web` | Buscar edital por numero | Campo termo |
| `buscar_editais_web2` | Encontrar editais (com score) | Botao "Buscar" |
| `buscar_editais_simples` | Buscar editais (sem score) | Checkbox desmarcado |
| `buscar_editais_simples2` | Listar editais da web | Checkbox desmarcado |
| `buscar_editais_todos` | Buscar TODOS (incl. encerrados) | Checkbox "encerrados" |
| `buscar_editais_todos_score` | Buscar TODOS com score | Ambos checkboxes |
| `buscar_links_editais` | Links de editais por area | Campo termo |
| `buscar_links_editais2` | Links editais (equipamentos) | Campo preset |
| `buscar_links_editais3` | Links editais (laboratorio) | Campo preset |
| `cadastrar_edital` | Cadastrar edital manualmente | Modal |
| `salvar_editais` | Salvar editais da busca | Botao "Salvar Todos" |
| `salvar_editais_recomendados` | Salvar recomendados | Botao "Salvar Recomendados" |
| `salvar_edital_especifico` | Salvar edital especifico | Icone 💾 |

---

### 3.3 VALIDACAO (21 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `buscar_editais_banco` | Buscar editais no banco | Campo "Buscar" |
| `buscar_edital_numero_banco` | Buscar edital no sistema | Campo "Buscar" |
| `verificar_edital_cadastrado` | Verificar edital cadastrado | Campo "Buscar" |
| `listar_editais` | Listar editais salvos | Tabela (carga inicial) |
| `listar_editais_status` | Listar editais por status | Filtro "Status" |
| `atualizar_edital` | Atualizar/editar edital | Dropdown "Mudar Status" |
| `excluir_edital` | Excluir edital | Icone 🗑️ |
| `resumir_edital` | Resumir edital | Botao "Resumir" |
| `resumir_edital_2` | Resumo do edital | Botao "Resumir" |
| `resumir_edital_3` | Sintetizar edital | Botao "Resumir" |
| `perguntar_edital` | Perguntar ao edital | Campo de pergunta |
| `perguntar_edital_2` | Prazo do edital | Campo de pergunta |
| `perguntar_edital_3` | Documentos exigidos | Campo de pergunta |
| `perguntar_edital_4` | Garantia exigida? | Campo de pergunta |
| `perguntar_edital_5` | Requisitos tecnicos | Campo de pergunta |
| `perguntar_edital_6` | Itens do edital | Campo de pergunta |
| `perguntar_edital_7` | Tudo sobre o edital | Campo de pergunta |
| `baixar_pdf_edital` | Baixar PDF do edital | Botao "Baixar PDF" |
| `atualizar_url_edital` | Atualizar URL do edital | Modal editar |
| `calcular_aderencia` | Calcular aderencia | Botao "Calcular Aderencia" |
| `listar_analises` | Listar analises realizadas | Aba "Analises" |

---

### 3.4 PRECIFICACAO (10 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `buscar_precos_pncp` | Buscar precos no PNCP | Botao "Buscar no PNCP" |
| `buscar_precos_pncp_2` | Preco de mercado | Botao "Buscar no PNCP" |
| `buscar_precos_pncp_3` | Quanto custa? | Botao "Buscar no PNCP" |
| `historico_precos` | Ver historico de precos | Secao "Meu Historico" |
| `historico_precos_2` | Precos registrados | Secao "Meu Historico" |
| `historico_precos_3` | Historico do produto | Secao "Meu Historico" |
| `recomendar_preco` | Recomendar preco | Botao "Recomendar Preco" |
| `recomendar_preco_2` | Qual preco sugerir? | Botao "Recomendar Preco" |
| `recomendar_preco_3` | Que preco colocar? | Botao "Recomendar Preco" |
| `recomendar_preco_4` | Faixa de preco | Resultado da recomendacao |

---

### 3.5 PROPOSTA (3 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `gerar_proposta` | Gerar proposta tecnica | Formulario + Botao "Gerar" |
| `listar_propostas` | Listar propostas geradas | Tabela "Minhas Propostas" |
| `excluir_proposta` | Excluir proposta | Icone 🗑️ |

---

### 3.6 FOLLOWUP (10 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `registrar_vitoria` | Registrar vitoria | Radio "Vitoria" + form |
| `registrar_derrota` | Registrar derrota | Radio "Derrota" + form |
| `registrar_derrota_motivo` | Registrar derrota c/ motivo | Radio + dropdown motivo |
| `registrar_cancelado` | Edital cancelado | Radio "Cancelado" |
| `registrar_deserto` | Edital deserto | Radio "Deserto" |
| `registrar_revogado` | Edital revogado | Radio "Revogado" |
| `consultar_resultado` | Consultar resultado de edital | Tabela "Resultados Recentes" |
| `consultar_todos_resultados` | Ver todos os resultados | Tabela completa |
| `extrair_ata` | Extrair resultados de ata | Upload PDF |
| `extrair_vencedor` | Quem ganhou este pregao? | Upload PDF |

---

### 3.7 FLAGS (11 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `dashboard_prazos` | Dashboard de prazos | Secao "Alertas Ativos" |
| `dashboard_prazos_mes` | Prazos do mes | Filtro periodo |
| `configurar_alertas` | Configurar alertas | Formulario "Criar Alerta" |
| `configurar_alertas_2` | Avise-me antes | Formulario "Criar Alerta" |
| `listar_alertas` | Meus alertas | Tabela "Meus Alertas" |
| `cancelar_alerta` | Cancelar alerta | Icone 🗑️ |
| `cancelar_todos_alertas` | Cancelar todos alertas | Botao config |
| `datas_importantes` | Datas importantes | Lista de datas |
| `historico_notificacoes` | Historico de notificacoes | Aba "Historico" |
| `notificacoes_nao_lidas` | Notificacoes nao lidas | Badge no icone |
| `extrair_datas` | Extrair datas do edital | Apos upload PDF |

---

### 3.8 MONITORIA (5 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `configurar_monitoramento` | Criar monitoramento | Formulario |
| `configurar_monitoramento_uf` | Monitorar por UF | Checkboxes UF |
| `configurar_monitoramento_freq` | Monitorar a cada X horas | Radio frequencia |
| `listar_monitoramentos` | Meus monitoramentos | Tabela principal |
| `desativar_monitoramento` | Parar monitoramento | Icone ⏸️ |

---

### 3.9 CONCORRENCIA (5 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `listar_concorrentes` | Listar concorrentes | Tabela principal |
| `listar_concorrentes_2` | Quais concorrentes? | Tabela principal |
| `analisar_concorrente` | Analisar concorrente | Painel de detalhes |
| `analisar_concorrente_2` | Historico do concorrente | Painel de detalhes |
| `analisar_concorrente_3` | Taxa de vitoria | Painel de detalhes |

---

### 3.10 MERCADO (5 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `mindsdb_editais_mes` | Editais do mes | Grafico de tendencias |
| `mindsdb_produtos_categoria` | Produtos por categoria | Tabela "Categorias" |
| `mindsdb_preco_medio_categoria` | Preco medio por categoria | Grafico de precos |
| `mindsdb_editais_uf` | Editais por UF | Grafico/Mapa |
| `mindsdb_editais_valor` | Editais por faixa de valor | Grafico distribuicao |

---

### 3.11 PERDAS (3 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `mindsdb_vitorias_derrotas` | Vitorias e derrotas | Resumo no topo |
| `mindsdb_taxa_sucesso` | Taxa de sucesso | Card KPI |
| `consultar_todos_resultados` | Ver todos os resultados | Tabela completa |

---

### 3.12 DASHBOARD (8 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `mindsdb_totais` | Quantos produtos e editais? | Card KPI |
| `mindsdb_score_medio` | Score medio de aderencia | Card KPI |
| `mindsdb_propostas` | Total de propostas | Card KPI |
| `mindsdb_editais_semana` | Editais da semana | Card "Atencao Imediata" |
| `mindsdb_melhor_produto` | Produto c/ melhor score | Card insight |
| `mindsdb_resumo` | Resumo geral do banco | Todos os cards |
| `calendario_mes` | Calendario do mes | Card "Proximos Eventos" |
| `calendario_semana` | Esta semana | Card "Proximos Eventos" |

---

### 3.13 PARAMETRIZACOES (6 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `cadastrar_fonte` | Cadastrar fonte de editais | Botao "+ Cadastrar Fonte" |
| `listar_fontes` | Listar fontes de editais | Tabela "Fontes" |
| `ativar_fonte` | Ativar fonte | Icone ▶️ |
| `desativar_fonte` | Desativar fonte | Icone ⏸️ |
| `configurar_notificacoes` | Configurar notificacoes | Secao "Notificacoes" |
| `configurar_email` | Configurar email | Campo email |

---

### 3.14 IMPUGNACAO (2 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `chat_impugnacao` | Como fazer impugnacao | Botao "Gerar Texto com IA" |
| `chat_recurso` | Como fazer recurso | Botao "Gerar Texto com IA" |

---

### 3.15 LANCES (1 prompt)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `proximos_pregoes` | Proximos pregoes | Lista "Pregoes Hoje" |

---

### 3.16 CHAT FLUTUANTE (3 prompts)

| ID | Prompt | Elemento UI |
|----|--------|-------------|
| `ajuda` | O que posso fazer? | Resposta do Dr. Licita |
| `chat_livre` | Perguntar sobre licitacoes | Resposta do Dr. Licita |
| `chat_lei` | Duvida sobre legislacao | Resposta do Dr. Licita |

---

## 4. PROMPTS SEM TELA DEDICADA (Executados via Chat)

Estes prompts sao executados diretamente no chat flutuante sem necessidade de tela especifica:

| ID | Prompt | Onde Executar |
|----|--------|---------------|
| `ajuda` | O que posso fazer? | Chat Flutuante |
| `chat_livre` | Perguntar sobre licitacoes | Chat Flutuante |
| `chat_lei` | Duvida sobre legislacao | Chat Flutuante |
| `excluir_todos_produtos` | Excluir TODOS os produtos | Chat (acao perigosa) |
| `excluir_todos_editais` | Excluir TODOS os editais | Chat (acao perigosa) |

---

## 5. OBSERVACOES

### Prompts Duplicados (Mesmo Comportamento)
Varios prompts no dropdown tem o mesmo comportamento, apenas com texto diferente para facilitar o uso:
- `buscar_editais_web` = `buscar_editais_web2`
- `resumir_edital` = `resumir_edital_2` = `resumir_edital_3`
- `buscar_precos_pncp` = `buscar_precos_pncp_2` = `buscar_precos_pncp_3`

### Prompts Compartilhados Entre Telas
Alguns prompts aparecem em mais de uma tela:
- `consultar_todos_resultados` -> Followup E Perdas
- `mindsdb_editais_semana` -> Dashboard E Flags
- `mindsdb_taxa_sucesso` -> Dashboard E Perdas

### Proximos Passos
1. Implementar as telas conforme UNIFICACAO_TELAS.md
2. Conectar cada botao/formulario ao prompt correspondente
3. Manter dropdown no chat como alternativa de acesso rapido

---

**Documento gerado em**: 2026-02-10
**Total de prompts mapeados**: 137
