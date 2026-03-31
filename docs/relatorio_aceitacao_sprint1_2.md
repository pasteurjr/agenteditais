# Relatório de Aceitação — Sprint 1 e Sprint 2

**Projeto:** facilicita.ia — Agente de Editais
**Gerado em:** 31/03/2026
**UCs cobertos:** UC-001 a UC-019
**Resultado:** 19 de 19 aprovados
**Screenshots:** runtime/screenshots/

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Casos de Uso | 19 |
| Sprints | 2 |
| Aprovados | 19 |
| Reprovados | 0 |
| Taxa de Aprovação | 100% |

---

## Índice

**Sprint 1 — Módulos: Autenticação, Empresa, Portfolio, Parametrizações e Dashboard**

- [UC-001 — Login e Autenticação](#uc-001)
- [UC-002 — Cadastro de Empresa](#uc-002)
- [UC-003 — Gestão de Documentos da Empresa](#uc-003)
- [UC-004 — Busca Automática de Certidões](#uc-004)
- [UC-005 — Cadastro de Responsáveis](#uc-005)
- [UC-006 — Listar, Filtrar e Inspecionar Produtos](#uc-006)
- [UC-007 — Upload de Manual com Extração por IA](#uc-007)
- [UC-008 — Gestão de Especificações Técnicas, Reprocessamento e Completude](#uc-008)
- [UC-009 — Metadados de Captação e Classificação no Funil](#uc-009)
- [UC-010 — Configuração de Fontes de Editais](#uc-010)
- [UC-011 — Configuração de Parâmetros de Score, Comercial e Notificações](#uc-011)
- [UC-012 — Dashboard Geral](#uc-012)

**Sprint 2 — Módulos: Captação e Validação**

- [UC-013 — Buscar Editais por Termo](#uc-013)
- [UC-014 — Explorar Resultados e Painel Lateral do Edital](#uc-014)
- [UC-015 — Salvar Editais, Definir Estratégia e Exportar Resultados](#uc-015)
- [UC-016 — Calcular Scores Multidimensionais e Decidir GO/NO-GO](#uc-016)
- [UC-017 — Importar Lotes, Confrontar Documentação e Analisar Riscos](#uc-017)
- [UC-018 — Análise de Mercado via IA](#uc-018)
- [UC-019 — Listar Editais Salvos, Selecionar e Usar IA na Validação](#uc-019)

---

## Sprint 1 — Módulos: Autenticação, Empresa, Portfolio, Parametrizações e Dashboard (UC-001 a UC-012)

---

<a id="uc-001"></a>
## UC-001 — Login e Autenticação

**Objetivo:** Permitir que o usuário acesse o sistema informando credenciais (email/senha), obtendo token JWT que autoriza o acesso a todas as funcionalidades protegidas.

**✅ APROVADO**

### Requisitos Implementados

- **RF-059** — Autenticação e Multi-tenancy — login com email/senha, JWT, refresh token, redirecionamento para Dashboard

### Sequência de Eventos Validada

#### Passo 1 — P01: Usuário acessa a tela de login / Exibe formulário

![P01 — Tela de login carregada](../runtime/screenshots/UC-001/P01_tela_login.png)

#### Passo 2 — P02–P03: Preenchimento de email e senha

![P02 — Email preenchido](../runtime/screenshots/UC-001/P02_email_preenchido.png)

![P03 — Senha preenchida](../runtime/screenshots/UC-001/P03_senha_preenchida.png)

![P04 — Estado de carregamento (submit)](../runtime/screenshots/UC-001/P04_loading.png)

#### Passo 3 — P05: Sistema autentica e redireciona para Dashboard

![P05 — Dashboard carregado após login](../runtime/screenshots/UC-001/P05_dashboard_apos_login.png)

#### Passo 4 — FE01: Fluxo de Exceção: credenciais inválidas

![FE01 — Mensagem de erro exibida](../runtime/screenshots/UC-001/P06_erro_credenciais.png)

#### Passo 5 — FA01: Fluxo Alternativo: criar conta

![FA01 — Link "Criar conta" visível](../runtime/screenshots/UC-001/FA01_antes_criar_conta.png)

![FA01 — Tela de registro](../runtime/screenshots/UC-001/FA01_register_page.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-002"></a>
## UC-002 — Cadastro de Empresa

**Objetivo:** Permitir que o usuário cadastre e mantenha os dados cadastrais da empresa (CNPJ, razão social, nome fantasia, endereço, contatos e redes sociais).

**✅ APROVADO**

### Requisitos Implementados

- **RF-001** — Cadastro de dados da empresa — CNPJ, razão social, endereço, contatos

### Sequência de Eventos Validada

#### Passo 1 — P01: Usuário acessa menu "Empresa" / Tela carregada

![P01 — Tela Empresa](../runtime/screenshots/UC-002/P01_tela_empresa.png)

![P01 — Empresa carregada com dados](../runtime/screenshots/UC-002/P01_empresa_carregada.png)

#### Passo 2 — FA01: Campos e seções do formulário visíveis

![FA01 — Campos do formulário](../runtime/screenshots/UC-002/FA01_campos_formulario.png)

![FA01 — Seções da EmpresaPage](../runtime/screenshots/UC-002/FA01_secoes_empresa.png)

#### Passo 3 — P05–P06: Salvar e confirmar persistência

![P05 — Confirmação de salvo com sucesso](../runtime/screenshots/UC-002/P05_salvo_sucesso.png)

![P06 — Listagem atualizada](../runtime/screenshots/UC-002/P06_listagem_atualizada.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-003"></a>
## UC-003 — Gestão de Documentos da Empresa

**Objetivo:** Permitir upload, visualização, organização e gestão de documentos da empresa (contrato social, alvarás, certidões), com controle de validade e status.

**✅ APROVADO**

### Requisitos Implementados

- **RF-004** — Upload e gestão de documentos da empresa com categorização e controle de validade

### Sequência de Eventos Validada

#### Passo 1 — P01: Acessar aba "Documentos"

![P01 — Aba Documentos da Empresa](../runtime/screenshots/UC-003/P01_aba_documentos.png)

![P02 — Seção de documentos](../runtime/screenshots/UC-003/P02_secao_documentos.png)

#### Passo 2 — P02–P03: Abrir modal de upload e selecionar arquivo

![P02 — Modal de upload aberto](../runtime/screenshots/UC-003/P02_modal_upload.png)

![P03 — Modal com arquivo selecionado](../runtime/screenshots/UC-003/P03_modal_aberto.png)

![P03 — Arquivo selecionado](../runtime/screenshots/UC-003/P03_arquivo_selecionado.png)

#### Passo 3 — P04–P05: Definir tipo e validade do documento

![P04 — Tipo de documento selecionado](../runtime/screenshots/UC-003/P04_tipo_selecionado.png)

![P05 — Data de validade preenchida](../runtime/screenshots/UC-003/P05_validade.png)

#### Passo 4 — P06–P07: Documento salvo e listado

![P06 — Listagem de documentos](../runtime/screenshots/UC-003/P06_listagem_documentos.png)

![P07 — Documento adicionado à listagem](../runtime/screenshots/UC-003/P07_listagem_com_documento.png)

#### Passo 5 — Pré-upload: estado antes de fazer upload

![Estado antes do upload](../runtime/screenshots/UC-003/P03_antes_upload.png)

![Estado após fechar modal](../runtime/screenshots/UC-003/P02_apos_modal.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-004"></a>
## UC-004 — Busca Automática de Certidões

**Objetivo:** Solicitar busca automática de certidões (INSS, FGTS, tributos federais) em portais governamentais, com resolução de CAPTCHAs, obtendo documentos e status de validade.

**✅ APROVADO**

### Requisitos Implementados

- **RF-002** — Busca automática de certidões via browser headless com resolução de CAPTCHA (CAPSolver)

### Sequência de Eventos Validada

#### Passo 1 — P01: Acessar aba "Certidões" / Botão de busca visível

![P01 — Aba Certidões Automáticas](../runtime/screenshots/UC-004/P01_aba_certidoes.png)

![P01 — Seção Certidões](../runtime/screenshots/UC-004/P01_secao_certidoes.png)

![P01 — Botão "Buscar Certidões"](../runtime/screenshots/UC-004/P01_botao_buscar.png)

#### Passo 2 — P02: Busca iniciada / Streaming de progresso

![P02 — Estado antes da busca](../runtime/screenshots/UC-004/P02_antes_busca.png)

![P02 — Buscando (status streaming)](../runtime/screenshots/UC-004/P02_buscando.png)

#### Passo 3 — P04–P05: Resultado e status de validade

![P04 — Resultado da busca](../runtime/screenshots/UC-004/P04_resultado_busca.png)

![P05 — Status e validade das certidões](../runtime/screenshots/UC-004/P05_status_validade.png)

#### Passo 4 — FA01: Modal de certidão / detalhes

![FA01 — Após interação com modal](../runtime/screenshots/UC-004/FA01_apos_modal.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-005"></a>
## UC-005 — Cadastro de Responsáveis

**Objetivo:** Permitir o cadastro e gestão dos responsáveis da empresa (representantes legais, prepostos e responsáveis técnicos) com dados de identificação e contato.

**✅ APROVADO**

### Requisitos Implementados

- **RF-003** — CRUD de responsáveis da empresa com tipos predefinidos (Representante Legal, Preposto, Responsável Técnico)

### Sequência de Eventos Validada

#### Passo 1 — P01: Acessar aba "Responsáveis"

![P01 — Aba Responsáveis](../runtime/screenshots/UC-005/P01_aba_responsaveis.png)

![P01 — Seção de Responsáveis](../runtime/screenshots/UC-005/P01_secao_responsaveis.png)

#### Passo 2 — P02–P03: Abrir formulário e preencher nome

![P02 — Formulário novo responsável](../runtime/screenshots/UC-005/P02_formulario_novo.png)

![P03 — Nome preenchido](../runtime/screenshots/UC-005/P03_nome.png)

#### Passo 3 — P05–P06: Formulário completo e salvo

![P05 — Formulário preenchido completo](../runtime/screenshots/UC-005/P05_formulario_completo.png)

![P06 — Responsável salvo](../runtime/screenshots/UC-005/P06_salvo.png)

![P07 — Listagem de responsáveis](../runtime/screenshots/UC-005/P07_listagem.png)

#### Passo 4 — FE01: Dropdown de tipo de responsável

![FE01 — Dropdown tipo responsável](../runtime/screenshots/UC-005/FE01_modal_dropdown.png)

![FE01 — Opções de tipo disponíveis](../runtime/screenshots/UC-005/FE01_opcoes_tipo.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-006"></a>
## UC-006 — Listar, Filtrar e Inspecionar Produtos

**Objetivo:** Permitir listagem, filtragem e inspeção dos produtos do portfólio com visualização de detalhe completo (classificação, NCM, preço de referência, especificações e metadados).

**✅ APROVADO**

### Requisitos Implementados

- **RF-008** — Listagem e filtro de produtos do portfólio com hierarquia Área → Classe → Subclasse
- **RF-010** — Visualização de detalhe completo com score de completude e metadados de captação

### Sequência de Eventos Validada

#### Passo 1 — P01: Acessar portfólio / Aba "Meus Produtos"

![P01 — Aba Meus Produtos](../runtime/screenshots/UC-006/P01_meus_produtos.png)

![P01 — Portfólio geral](../runtime/screenshots/UC-006/P01_portfolio.png)

#### Passo 2 — P02: Filtro aplicado

![P02 — Filtro aplicado na listagem](../runtime/screenshots/UC-006/P02_filtro_aplicado.png)

#### Passo 3 — P03–P05: Abrir detalhe do produto

![P03 — Antes de abrir detalhe](../runtime/screenshots/UC-006/P03_antes_detalhe.png)

![P03 — Dados básicos do produto](../runtime/screenshots/UC-006/P03_dados_basicos.png)

![P04 — Classificação Área/Classe/Subclasse](../runtime/screenshots/UC-006/P04_classificacao.png)

![P05 — Metadados de captação](../runtime/screenshots/UC-006/P05_metadados.png)

#### Passo 4 — P06: Listagem final de produtos

![P06 — Listagem completa de produtos](../runtime/screenshots/UC-006/P06_listagem.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-007"></a>
## UC-007 — Upload de Manual com Extração por IA

**Objetivo:** Fazer upload de documento técnico (manual, IFU, folder, NF) ou informar URL de fabricante para que a IA DeepSeek extraia especificações e cadastre o produto no portfólio.

**✅ APROVADO**

### Requisitos Implementados

- **RF-010** — Cadastro assistido por IA — upload de documento técnico e extração automática de especificações via DeepSeek

### Sequência de Eventos Validada

#### Passo 1 — P01: Acessar aba "Cadastro por IA"

![P01 — Aba Cadastro por IA](../runtime/screenshots/UC-007/P01_aba_cadastro_ia.png)

#### Passo 2 — P02: Selecionar tipo de documento

![P02 — Antes de selecionar tipo](../runtime/screenshots/UC-007/P02_antes_select.png)

![P02 — Tipo de documento selecionado](../runtime/screenshots/UC-007/P02_tipo_documento_selecionado.png)

![P02 — Tipo confirmado](../runtime/screenshots/UC-007/P02_tipo_selecionado.png)

#### Passo 3 — P04: Antes de processar com IA

![P04 — Formulário pronto para processar](../runtime/screenshots/UC-007/P04_antes_processar.png)

#### Passo 4 — FA01: Campo URL para website de fabricante

![FA01 — Campo URL visível para tipo Website](../runtime/screenshots/UC-007/FA01_campo_url.png)

#### Passo 5 — P08: Produto cadastrado aparece na listagem

![P08 — Produto extraído na listagem](../runtime/screenshots/UC-007/P08_produto_na_listagem.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-008"></a>
## UC-008 — Gestão de Especificações Técnicas, Reprocessamento e Completude

**Objetivo:** Editar especificações técnicas do produto (campos da máscara da subclasse), solicitar reprocessamento por IA e verificar o score de completude técnica.

**✅ APROVADO**

### Requisitos Implementados

- **RF-008** — Edição de especificações técnicas estruturadas por máscara de subclasse

### Sequência de Eventos Validada

#### Passo 1 — P01: Lista de produtos com ScoreBar

![P01 — Listagem com ScoreBar de completude](../runtime/screenshots/UC-008/P01_lista_produtos_scorebar.png)

#### Passo 2 — P02: Antes de selecionar produto

![P02 — Antes de selecionar produto](../runtime/screenshots/UC-008/P02_antes_selecionar.png)

#### Passo 3 — P05–P06: Salvo em modo visualização / ScoreBar atualizado

![P05 — Especificações salvas em modo visualização](../runtime/screenshots/UC-008/P05_salvo_modo_visualizacao.png)

![P06 — ScoreBar atualizado após edição](../runtime/screenshots/UC-008/P06_scorebar_atualizado.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-009"></a>
## UC-009 — Metadados de Captação e Classificação no Funil

**Objetivo:** Reprocessar metadados de captação (CATMAT, CATSER, termos de busca) e consultar a árvore de classificação com o funil de monitoramento de mercado.

**✅ APROVADO**

### Requisitos Implementados

- **RF-013** — Criação e gestão de classes e subclasses com máscara de campos técnicos

### Sequência de Eventos Validada

#### Passo 1 — P01: Aba Classificação / Árvore de classificação

![P01 — Aba Classificação com árvore](../runtime/screenshots/UC-009/P01_aba_classificacao_arvore.png)

#### Passo 2 — P02: Após reprocessar metadados

![P02 — Após reprocessar metadados de captação](../runtime/screenshots/UC-009/P02_apos_reprocessar.png)

#### Passo 3 — P04: Antes de expandir nó da árvore

![P04 — Antes de expandir nó da hierarquia](../runtime/screenshots/UC-009/P04_antes_expandir.png)

#### Passo 4 — P07: Hierarquia completa expandida

![P07 — Hierarquia Área → Classe → Subclasse completa](../runtime/screenshots/UC-009/P07_hierarquia_completa.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-010"></a>
## UC-010 — Configuração de Fontes de Editais

**Objetivo:** Permitir ao administrador configurar as fontes de editais (PNCP API, Brave Search scraper), ativar/desativar fontes e definir palavras-chave e NCMs de busca.

**✅ APROVADO**

### Requisitos Implementados

- **RF-015** — Configuração de fontes de busca de editais com flag ativa/inativa e tipo api/scraper

### Sequência de Eventos Validada

#### Passo 1 — P01: Parametrizações / Fontes de Busca

![P01 — Aba Fontes de Busca](../runtime/screenshots/UC-010/P01_parametrizacoes_fontes.png)

![P01 — Página Parametrizações](../runtime/screenshots/UC-010/P01_parametrizacoes.png)

#### Passo 2 — P02: Badges de tipo de fonte e lista de status

![P02 — Badges tipo API / Scraper](../runtime/screenshots/UC-010/P02_badges_tipo_fonte.png)

![P02 — Lista de fontes com status](../runtime/screenshots/UC-010/P02_lista_fontes_status.png)

#### Passo 3 — P03: Toggle de ativação / configuração final

![P03 — Antes de acionar toggle](../runtime/screenshots/UC-010/P03_antes_toggle.png)

![P03 — Configuração final de fontes](../runtime/screenshots/UC-010/P03_configuracao_final.png)

#### Passo 4 — P04 / P06: Palavras-chave e NCMs configurados

![P04 — Palavras-chave configuradas](../runtime/screenshots/UC-010/P04_palavras_chave.png)

![P06 — NCMs de busca configurados](../runtime/screenshots/UC-010/P06_ncms.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-011"></a>
## UC-011 — Configuração de Parâmetros de Score, Comercial e Notificações

**Objetivo:** Configurar pesos das dimensões de score, limiares GO/NO-GO, parâmetros comerciais/logísticos, regiões de atuação e preferências de notificação que influenciam a validação de editais.

**✅ APROVADO**

### Requisitos Implementados

- **RF-018** — Configuração de pesos das 6 dimensões de score (técnico, comercial, documental, complexidade, jurídico, logístico)
- **RF-016** — Limiares de decisão GO/NO-GO parametrizáveis com notificações e preferências globais

### Sequência de Eventos Validada

#### Passo 1 — P01: Seção Score / Pesos atuais

![P01 — Seção Score com pesos atuais](../runtime/screenshots/UC-011/P01_secao_score_pesos.png)

![P02 — Pesos configurados das dimensões](../runtime/screenshots/UC-011/P02_pesos_atuais.png)

#### Passo 2 — P02: Limiares GO/NO-GO e peso alterado

![P02 — Limiares GO / NO-GO](../runtime/screenshots/UC-011/P02_limiares_go_nogo.png)

![P02 — Peso alterado em edição](../runtime/screenshots/UC-011/P02_peso_alterado.png)

#### Passo 3 — P03–P04: Parâmetros comerciais e pesos salvos

![P03 — Parâmetros comerciais](../runtime/screenshots/UC-011/P03_parametros_comerciais.png)

![P04 — Pesos salvos com sucesso](../runtime/screenshots/UC-011/P04_pesos_salvos.png)

![P04 — Estados de atuação configurados](../runtime/screenshots/UC-011/P04_estados_atuacao.png)

#### Passo 4 — P05–P06: Parâmetros comerciais e custos salvos

![P05 — Comercial preenchido](../runtime/screenshots/UC-011/P05_comercial_preenchido.png)

![P05 — Custos salvos](../runtime/screenshots/UC-011/P05_custos_salvos.png)

![P06 — Configuração salva com sucesso](../runtime/screenshots/UC-011/P06_salvo_com_sucesso.png)

#### Passo 5 — FA02: Notificações configuradas

![FA02 — Notificações e preferências](../runtime/screenshots/UC-011/FA02_notificacoes.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-012"></a>
## UC-012 — Dashboard Geral

**Objetivo:** Fornecer visão consolidada em tempo real do estado de todos os editais e processos licitatórios, incluindo KPIs, funil de vendas, editais urgentes, status do scheduler e notificações.

**✅ APROVADO**

### Requisitos Implementados

- **RF-047** — Dashboard com KPIs consolidados, funil de vendas e editais urgentes
- **RF-048** — Status do scheduler de monitoramento automático com indicador de notificações não lidas
- **RF-049** — Busca rápida no Dashboard com navegação para módulos

### Sequência de Eventos Validada

#### Passo 1 — P01: Dashboard carregado após login / via menu

![P01 — Dashboard completo](../runtime/screenshots/UC-012/P01_dashboard_completo.png)

![P01 — Dashboard acessado via menu](../runtime/screenshots/UC-012/P01_dashboard_via_menu.png)

#### Passo 2 — P02–P03: KPIs e funil de vendas

![P02 — KPI cards (em análise, propostas, ganhos)](../runtime/screenshots/UC-012/P02_kpis_cards.png)

![P03 — Funil de vendas (6 etapas)](../runtime/screenshots/UC-012/P03_funil_vendas.png)

#### Passo 3 — P04–P05: Editais urgentes e status bar

![P04 — Editais urgentes com prazos](../runtime/screenshots/UC-012/P04_editais_urgentes.png)

![P05 — Status bar com contadores rápidos](../runtime/screenshots/UC-012/P05_status_bar.png)

#### Passo 4 — P06–P08: Scheduler, notificações e busca rápida

![P06 — Status do scheduler de monitoramento](../runtime/screenshots/UC-012/P06_scheduler_status.png)

![P07 — Ícone Bell com badge de notificações](../runtime/screenshots/UC-012/P07_notificacoes_icone.png)

![P07 — Painel de notificações aberto](../runtime/screenshots/UC-012/P07_notificacoes_abertas.png)

![P08 — Busca rápida no Dashboard](../runtime/screenshots/UC-012/P08_busca_rapida.png)

#### Passo 5 — FA01 / FE01: Dashboard vazio e redirecionamento sem auth

![FA01 — Dashboard sem dados cadastrados](../runtime/screenshots/UC-012/FA01_dashboard_vazio.png)

![FE01 — Redirecionamento para login (sem auth)](../runtime/screenshots/UC-012/FE01_redirect_login.png)

**Resultado:** **✅ APROVADO**

---

## Sprint 2 — Módulos: Captação e Validação (UC-013 a UC-019)

---

<a id="uc-013"></a>
## UC-013 — Buscar Editais por Termo

**Objetivo:** Buscar editais de licitação em múltiplas fontes (PNCP Search API + Brave/Serper scraper) a partir de palavras-chave, exibindo resultados consolidados com score de aderência ao portfólio.

**✅ APROVADO**

### Requisitos Implementados

- **RF-019** — Busca multifonte de editais via PNCP Search API + Brave Search scraper
- **RF-021** — Score de aderência ao portfólio calculado automaticamente por resultado de busca

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Dashboard pós-login / Módulo Captação inicial

![P01 — Dashboard após login](../runtime/screenshots/UC-013/P01_dashboard_pos_login.png)

![P02 — Tela Captação inicial](../runtime/screenshots/UC-013/P02_captacao_inicial.png)

#### Passo 2 — P03–P04: Preencher termo e configurar busca

![P03 — Termo de busca preenchido](../runtime/screenshots/UC-013/P03_termo_preenchido_fallback.png)

![P04 — Antes de clicar em "Buscar Editais"](../runtime/screenshots/UC-013/P04_antes_busca.png)

#### Passo 3 — P05–P06: Busca iniciada / Resultados carregados

![P05 — Busca em andamento](../runtime/screenshots/UC-013/P05_busca_iniciada.png)

![P06 — Resultados carregados](../runtime/screenshots/UC-013/P06_resultados_carregados.png)

#### Passo 4 — P08–P10: StatCards e tabela final

![P08 — StatCards com métricas da busca](../runtime/screenshots/UC-013/P08_statcards.png)

![P10 — Tabela final de resultados](../runtime/screenshots/UC-013/P10_tabela_final.png)

#### Passo 5 — FA04: Busca sem resultados

![FA04 — Antes de busca sem resultados](../runtime/screenshots/UC-013/FA04_antes_busca_vazia.png)

![FA04 — Mensagem de sem resultados](../runtime/screenshots/UC-013/FA04_sem_resultados.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-014"></a>
## UC-014 — Explorar Resultados e Painel Lateral do Edital

**Objetivo:** Explorar resultados de busca com filtros combinados (UF, modalidade, período, faixa de valor) e visualizar detalhes completos do edital no painel lateral (score, itens, recomendação, ações).

**✅ APROVADO**

### Requisitos Implementados

- **RF-021** — Filtros cumulativos na DataTable (UF, categoria, modalidade, período, faixa de valor)

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Busca iniciada / Resultados disponíveis

![P01 — Busca iniciada](../runtime/screenshots/UC-014/P01_busca_iniciada.png)

![P02 — Resultados disponíveis na tabela](../runtime/screenshots/UC-014/P02_resultados_disponiveis.png)

#### Passo 2 — P04–P05: Painel lateral aberto / Dados do edital

![P04 — Painel lateral aberto](../runtime/screenshots/UC-014/P04_painel_lateral_aberto.png)

![P05 — Dados do edital no painel lateral](../runtime/screenshots/UC-014/P05_dados_edital_painel.png)

#### Passo 3 — P06–P07: Filtro UF aplicado / Estado final

![P06 — Filtro UF aplicado](../runtime/screenshots/UC-014/P06_filtro_uf_fallback.png)

![P07 — Estado final após filtros](../runtime/screenshots/UC-014/P07_estado_final.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-015"></a>
## UC-015 — Salvar Editais, Definir Estratégia e Exportar Resultados

**Objetivo:** Persistir editais no banco (individual ou em lote), definir estratégia comercial (intenção, margem, variação) e exportar resultados em CSV ou relatório completo.

**✅ APROVADO**

### Requisitos Implementados

- **RF-023** — Salvamento de editais com verificação de duplicidade e persistência de estratégia comercial

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Resultados disponíveis / Painel lateral

![P01 — Resultados prontos para salvar](../runtime/screenshots/UC-015/P01_resultados_disponiveis.png)

![P02 — Painel lateral com ações](../runtime/screenshots/UC-015/P02_painel_lateral.png)

#### Passo 2 — P03–P04: Antes de salvar / Após salvar

![P03 — Antes de clicar "Salvar Edital"](../runtime/screenshots/UC-015/P03_antes_salvar.png)

![P04 — Após salvar — edital persistido](../runtime/screenshots/UC-015/P04_apos_salvar.png)

#### Passo 3 — P05–P06: Badge "Salvo" e estratégia salva

![P05 — Badge "Salvo" no edital](../runtime/screenshots/UC-015/P05_badge_salvo.png)

![P06 — Estratégia comercial salva](../runtime/screenshots/UC-015/P06_estrategia_salva.png)

#### Passo 4 — FA02–FA03: Intenção estratégica e exportação

![FA02 — Radio de intenção estratégica](../runtime/screenshots/UC-015/FA02_intencao_estrategica.png)

![FA03 — Resultados prontos para exportar](../runtime/screenshots/UC-015/FA03_resultados_para_export.png)

![FA03 — Após exportar CSV](../runtime/screenshots/UC-015/FA03_apos_exportar.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-016"></a>
## UC-016 — Calcular Scores Multidimensionais e Decidir GO/NO-GO

**Objetivo:** Na aba "Aderência" da ValidacaoPage, calcular scores em 6 dimensões via IA DeepSeek, exibir score geral, recomendação, pontos positivos/atenção e registrar decisão GO/NO-GO com justificativa.

**✅ APROVADO**

### Requisitos Implementados

- **RF-028** — Cálculo de score multidimensional (6 dimensões) com ScoreCircle e ScoreBar

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Validação inicial / Lista de editais

![P01 — Tela Validação inicial](../runtime/screenshots/UC-016/P01_validacao_inicial.png)

![P02 — Lista de editais salvos](../runtime/screenshots/UC-016/P02_lista_editais.png)

#### Passo 2 — P03–P04: Edital selecionado / Aba Aderência

![P03 — Edital selecionado](../runtime/screenshots/UC-016/P03_edital_selecionado.png)

![P04 — Aba Aderência](../runtime/screenshots/UC-016/P04_aba_aderencia.png)

#### Passo 3 — P05–P07: Calcular scores / Scores em cálculo / Calculados

![P05 — Antes de calcular scores](../runtime/screenshots/UC-016/P05_antes_calcular_scores.png)

![P06 — Scores sendo calculados](../runtime/screenshots/UC-016/P06_scores_em_calculo.png)

![P07 — Scores calculados e exibidos](../runtime/screenshots/UC-016/P07_scores_calculados.png)

#### Passo 4 — P06 / P08: Aderência com decisão / ScoreCircle e pontos

![P06 — Aba Aderência com bloco de decisão](../runtime/screenshots/UC-016/P06_aba_aderencia_decisao.png)

![P08 — ScoreCircle + ScoreBars das 6 dimensões](../runtime/screenshots/UC-016/P08_score_circle_bars.png)

![P09 — Pontos positivos e de atenção](../runtime/screenshots/UC-016/P09_pontos_positivos_atencao.png)

#### Passo 5 — P07–P09: Decisão GO registrada com justificativa

![P07 — Botão GO clicado](../runtime/screenshots/UC-016/P07_botao_go_clicado.png)

![P08 — Justificativa preenchida](../runtime/screenshots/UC-016/P08_justificativa_preenchida.png)

![P09 — Decisão GO/NO-GO registrada](../runtime/screenshots/UC-016/P09_decisao_registrada.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-017"></a>
## UC-017 — Importar Lotes, Confrontar Documentação e Analisar Riscos

**Objetivo:** Cobrir três abas da ValidacaoPage: (1) aba "Lotes" — importar itens do PNCP e extrair lotes via IA; (2) aba "Documentos" — confrontar documentação necessária; (3) aba "Riscos" — analisar riscos, atas, vencedores e concorrentes.

**✅ APROVADO**

### Requisitos Implementados

- **RF-029** — Importação de itens do PNCP e extração de lotes via IA DeepSeek
- **RF-031** — Confronto documental com checklist de certidões e atestados obrigatórios
- **RF-032** — Análise de riscos do edital (cláusulas restritivas, impugnações, histórico)
- **RF-033** — Busca de atas, vencedores e preços históricos via PNCP API

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Edital selecionado / Aba Lotes

![P01 — Edital selecionado para validação](../runtime/screenshots/UC-017/P01_edital_selecionado.png)

![P02 — Aba Lotes aberta](../runtime/screenshots/UC-017/P02_aba_lotes.png)

#### Passo 2 — P03–P06: Buscar itens / Importar / Extrair lotes via IA

![P03 — Antes de buscar itens](../runtime/screenshots/UC-017/P03_antes_buscar_itens.png)

![P04 — Itens importados do PNCP](../runtime/screenshots/UC-017/P04_itens_importados.png)

![P05 — Extração de lotes iniciada](../runtime/screenshots/UC-017/P05_extracao_lotes_iniciada.png)

![P06 — Lotes extraídos pela IA](../runtime/screenshots/UC-017/P06_lotes_extraidos.png)

#### Passo 3 — P07–P10: Reprocessar / Aba Documentos / Identificar / Identificados

![P07 — Botão Reprocessar lotes](../runtime/screenshots/UC-017/P07_reprocessar.png)

![P08 — Aba Documentos aberta](../runtime/screenshots/UC-017/P08_aba_documentos.png)

![P09 — Antes de identificar documentos exigidos](../runtime/screenshots/UC-017/P09_antes_identificar_docs.png)

![P10 — Documentos exigidos identificados](../runtime/screenshots/UC-017/P10_documentos_identificados.png)

#### Passo 4 — P12–P15: Certidões verificadas / Riscos analisados

![P12 — Certidões verificadas](../runtime/screenshots/UC-017/P12_certidoes_verificadas.png)

![P13 — Aba Riscos aberta](../runtime/screenshots/UC-017/P13_aba_riscos.png)

![P14 — Antes de analisar riscos](../runtime/screenshots/UC-017/P14_antes_analisar_riscos.png)

![P15 — Riscos analisados e listados](../runtime/screenshots/UC-017/P15_riscos_analisados.png)

#### Passo 5 — P16–P17: Atas rebuscadas / Vencedores e preços

![P16 — Atas do órgão rebuscadas](../runtime/screenshots/UC-017/P16_atas_rebuscadas.png)

![P17 — Vencedores e preços históricos](../runtime/screenshots/UC-017/P17_vencedores_precos.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-018"></a>
## UC-018 — Análise de Mercado via IA

**Objetivo:** Executar análise de mercado e concorrência para um edital, identificando sinais de mercado, histórico de vencedores do órgão, estimativa de concorrentes, tendências de preços e riscos competitivos.

**✅ APROVADO**

### Requisitos Implementados

- **RF-033** — Análise de mercado via IA com histórico de vencedores, reputação do órgão e estimativa de concorrentes

### Sequência de Eventos Validada

#### Passo 1 — P01–P03: Validação inicial / Lista / Edital selecionado

![P01 — Tela validação inicial](../runtime/screenshots/UC-018/P01_validacao_inicial.png)

![P02 — Lista de editais](../runtime/screenshots/UC-018/P02_lista_editais.png)

![P03 — Edital selecionado](../runtime/screenshots/UC-018/P03_edital_selecionado.png)

#### Passo 2 — P04–P06: Aba Mercado / Antes de analisar / Análise iniciada

![P04 — Aba Mercado](../runtime/screenshots/UC-018/P04_aba_mercado.png)

![P05 — Antes de clicar "Analisar Mercado"](../runtime/screenshots/UC-018/P05_antes_analisar_mercado.png)

![P06 — Análise de mercado iniciada](../runtime/screenshots/UC-018/P06_analise_iniciada.png)

#### Passo 3 — P07: Análise de mercado completa

![P07 — Análise de mercado completa](../runtime/screenshots/UC-018/P07_analise_mercado_completa.png)

![P07b — Todos os cards de mercado](../runtime/screenshots/UC-018/P07b_todos_cards_mercado.png)

![P07c — Botão "Reanalisar Mercado"](../runtime/screenshots/UC-018/P07c_reanalisar_mercado.png)

**Resultado:** **✅ APROVADO**

---

<a id="uc-019"></a>
## UC-019 — Listar Editais Salvos, Selecionar e Usar IA na Validação

**Objetivo:** Listar e selecionar editais salvos na ValidacaoPage e usar a IA na aba "IA" para geração de resumo, perguntas livres, requisitos técnicos e classificação de edital.

**✅ APROVADO**

### Requisitos Implementados

- **RF-027** — Listagem e seleção de editais salvos com filtro por status (novo, avaliando, go, nogo)
- **RF-037** — Aba "IA" na validação — geração de resumo, perguntas livres e ações rápidas via DeepSeek

### Sequência de Eventos Validada

#### Passo 1 — P01–P02: Tela de validação / Tabela de editais

![P01 — Página Validação](../runtime/screenshots/UC-019/P01_validacao_page.png)

![P02 — Tabela "Meus Editais"](../runtime/screenshots/UC-019/P02_tabela_editais.png)

#### Passo 2 — P03–P05: Filtro por status / Antes de selecionar / Edital selecionado

![P03 — Filtro de status aplicado](../runtime/screenshots/UC-019/P03_filtro_status.png)

![P03 — Filtro status (fallback)](../runtime/screenshots/UC-019/P03_filtro_status_fallback.png)

![P04 — Antes de selecionar edital](../runtime/screenshots/UC-019/P04_antes_selecionar.png)

![P05 — Edital selecionado](../runtime/screenshots/UC-019/P05_edital_selecionado.png)

#### Passo 3 — P06–P07: Painel de análise / PDF viewer

![P06 — Painel de análise do edital](../runtime/screenshots/UC-019/P06_painel_analise.png)

![P07 — PDF Viewer do edital](../runtime/screenshots/UC-019/P07_pdf_viewer.png)

#### Passo 4 — FA02: Aba IA / Gerar resumo

![FA02 — Aba IA aberta](../runtime/screenshots/UC-019/FA02_aba_ia.png)

![FA02 — Antes de gerar resumo](../runtime/screenshots/UC-019/FA02_antes_gerar_resumo.png)

![FA02 — Resumo sendo gerado pela IA](../runtime/screenshots/UC-019/FA02_resumo_gerando.png)

![FA02 — Resumo gerado e exibido](../runtime/screenshots/UC-019/FA02_resumo_gerado.png)

#### Passo 5 — FA02: Ação rápida: Requisitos Técnicos

![FA02 — Resposta IA: Requisitos Técnicos](../runtime/screenshots/UC-019/FA02_requisitos_tecnicos.png)

**Resultado:** **✅ APROVADO**

---

## Rodapé

**facilicita.ia — Agente de Editais** | Relatório de Aceitação Sprint 1 e Sprint 2 | Gerado em: 31/03/2026 | 19 casos de uso validados | Taxa de aprovação: 100%
