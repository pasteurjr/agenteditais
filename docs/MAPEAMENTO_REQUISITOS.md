# Mapeamento Consolidado: Requisitos → Telas → Prompts

## Visão Geral

Este documento mapeia os **Requisitos Funcionais** definidos em `requisitos04022026.md` com as **Telas Implementadas** no frontend e os **Prompts de IA** disponíveis no dropdown do chat.

---

## Índice

1. [Resumo do Mapeamento](#1-resumo-do-mapeamento)
2. [Requisitos Funcionais Mapeados](#2-requisitos-funcionais-mapeados)
3. [Requisitos Não-Funcionais](#3-requisitos-não-funcionais)
4. [Regras de Negócio](#4-regras-de-negócio)
5. [Cobertura por Tela](#5-cobertura-por-tela)
6. [Gaps Identificados](#6-gaps-identificados)

---

## 1. Resumo do Mapeamento

| Categoria | Total | Com Tela | Com Prompt IA | Implementado |
|-----------|-------|----------|---------------|--------------|
| Requisitos Funcionais | 20 | 18 | 15 | 85% |
| Requisitos Não-Funcionais | 14 | N/A | N/A | Infraestrutura |
| Regras de Negócio | 5 | 4 | 3 | 75% |

---

## 2. Requisitos Funcionais Mapeados

### 2.1 FR-001 - Cadastro do Portfólio com IA

| Atributo | Valor |
|----------|-------|
| **Descrição** | Cadastro do Portfólio da empresa com upload de documentos utilizando IA para leitura e upload |
| **Prioridade** | Alta |
| **Tela(s)** | `PortfolioPage.tsx` |
| **Componente UI** | Botão "Upload PDF", Modal de Upload, Tabela de Produtos |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `upload_manual` | 📎 Cadastrar produto (upload PDF) | "Cadastre este produto" |
| `download_url` | 🔗 Cadastrar produto de URL | "Baixe o manual de [URL] e cadastre o produto" |
| `buscar_produto_web` | 🌐 Buscar manual na web | "Busque o manual do produto [NOME] na web" |
| `buscar_datasheet_web` | 🌐 Buscar datasheet na web | "Busque o datasheet do [NOME] na web" |

---

### 2.2 FR-002 - Monitoramento 24/7 de fontes de licitações

| Atributo | Valor |
|----------|-------|
| **Descrição** | Monitoramento 24/7 de fontes públicas e privadas de licitações utilizando IA |
| **Prioridade** | Alta |
| **Tela(s)** | `MonitoriaPage.tsx`, `ParametrizacoesPage.tsx` (aba Fontes) |
| **Componente UI** | Tabela de monitoramentos ativos, Formulário criar monitoramento |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `configurar_monitoramento` | 👁️ Criar monitoramento | "Monitore editais de [TERMO] no PNCP" |
| `configurar_monitoramento_uf` | 👁️ Monitorar por UF | "Monitore editais de [TERMO] em SP e MG" |
| `configurar_monitoramento_freq` | 👁️ Monitorar a cada X horas | "Monitore editais de [TERMO] a cada 2 horas" |
| `listar_monitoramentos` | 📋 Meus monitoramentos | "Quais monitoramentos tenho ativos?" |
| `desativar_monitoramento` | ⏸️ Parar monitoramento | "Desative o monitoramento de [TERMO]" |

---

### 2.3 FR-003 - Classificação parametrizável de tipos de Editais

| Atributo | Valor |
|----------|-------|
| **Descrição** | Classificação parametrizável dos tipos de Editais (ex: Comodatos, Vendas) |
| **Prioridade** | Alta |
| **Tela(s)** | `ParametrizacoesPage.tsx` (aba Produtos) |
| **Componente UI** | Checkboxes "Tipos de Edital Desejados", Tabela de Classes |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `classificar_edital` | 🏷️ Classificar edital | "Classifique este edital: [OBJETO]" |
| `classificar_edital_2` | 🏷️ Tipo de edital | "Que tipo de edital é este: [OBJETO]" |
| `classificar_edital_3` | 🏷️ É comodato ou venda? | "Este edital é comodato ou venda: [OBJETO]" |

---

### 2.4 FR-004 - Cálculo do Score de Aderência Técnica e Comercial

| Atributo | Valor |
|----------|-------|
| **Descrição** | Cálculo e parametrização do Score de Aderência Técnica e Comercial |
| **Prioridade** | Alta |
| **Tela(s)** | `CaptacaoPage.tsx`, `ValidacaoPage.tsx` |
| **Componente UI** | Coluna "Score" na tabela, ScoreBadge, Botão "Calcular Aderência" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `calcular_aderencia` | 🎯 Calcular aderência | "Calcule a aderência do produto [NOME] ao edital [NUMERO]" |
| `listar_analises` | 📊 Listar análises realizadas | "Liste minhas análises de aderência" |
| `mindsdb_score_medio` | 📊 Score médio de aderência | "Qual é o score médio de aderência das análises?" |
| `mindsdb_alta_aderencia` | 📊 Produtos c/ alta aderência | "Quais produtos têm aderência acima de 70%?" |

---

### 2.5 FR-005 - Geração de Recomendações de Preços

| Atributo | Valor |
|----------|-------|
| **Descrição** | Geração de Recomendações de Preços baseado em histórico e concorrentes |
| **Prioridade** | Alta |
| **Tela(s)** | `PrecificacaoPage.tsx` |
| **Componente UI** | Seção "Recomendação de Preço", Botão "Recomendar Preço" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `recomendar_preco` | 💡 Recomendar preço | "Recomende preço para [TERMO]" |
| `recomendar_preco_2` | 💡 Qual preço sugerir? | "Qual preço sugerir para [PRODUTO]?" |
| `recomendar_preco_3` | 💡 Que preço colocar? | "Que preço colocar no edital de [TERMO]?" |
| `recomendar_preco_4` | 📊 Faixa de preço | "Qual a faixa de preço para [TERMO]?" |
| `buscar_precos_pncp` | 💰 Buscar preços no PNCP | "Busque preços de [TERMO] no PNCP" |
| `historico_precos` | 📈 Ver histórico de preços | "Mostre o histórico de preços de [TERMO]" |

---

### 2.6 FR-006 - Geração automática da Proposta

| Atributo | Valor |
|----------|-------|
| **Descrição** | Geração automática da Proposta em minutos com anexo de documentos |
| **Prioridade** | Alta |
| **Tela(s)** | `PropostaPage.tsx` |
| **Componente UI** | Formulário "Gerar Nova Proposta", Botão "Gerar Proposta Técnica" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `gerar_proposta` | 📝 Gerar proposta técnica | "Gere uma proposta do produto [NOME] para o edital [NUMERO] com preço R$ [VALOR]" |
| `listar_propostas` | 📄 Listar propostas geradas | "Liste minhas propostas geradas" |
| `excluir_proposta` | 🗑️ Excluir proposta | "Exclua a proposta do edital [NUMERO]" |

---

### 2.7 FR-007 - Painel no Front End para revisão

| Atributo | Valor |
|----------|-------|
| **Descrição** | Painel para revisão, validação e edição da proposta antes da submissão |
| **Prioridade** | Alta |
| **Tela(s)** | `PropostaPage.tsx`, `SubmissaoPage.tsx` |
| **Componente UI** | Seção "Preview da Proposta", Botões "Baixar DOCX/PDF", "Editar" |
| **Prompts IA** | Não aplicável (UI interativa) |

---

### 2.8 FR-008 - Sistema de Alertas de Abertura do Pregão

| Atributo | Valor |
|----------|-------|
| **Descrição** | Alertas de Abertura do Pregão com calendário e contagem regressiva |
| **Prioridade** | Alta |
| **Tela(s)** | `FlagsPage.tsx`, `LancesPage.tsx` |
| **Componente UI** | Seção "Alertas Ativos", Formulário "Criar Alerta", "Pregões Hoje" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `dashboard_prazos` | 📊 Dashboard de prazos | "Mostre o dashboard de prazos dos editais" |
| `proximos_pregoes` | 📅 Próximos pregões | "Quais editais abrem esta semana?" |
| `configurar_alertas` | 🔔 Configurar alertas | "Configure alertas para o edital PE-[NUMERO]/2026" |
| `listar_alertas` | 🔔 Meus alertas | "Quais alertas tenho configurados?" |
| `cancelar_alerta` | ❌ Cancelar alerta | "Cancele os alertas do edital PE-[NUMERO]/2026" |
| `calendario_mes` | 📅 Calendário do mês | "Mostre o calendário de editais deste mês" |

---

### 2.9 FR-009 - Robô de Lances automatizado

| Atributo | Valor |
|----------|-------|
| **Descrição** | Robô de Lances automatizado com algoritmo para maximizar chances |
| **Prioridade** | Alta |
| **Tela(s)** | `LancesPage.tsx` |
| **Componente UI** | Seção "Pregões Hoje", "Histórico de Lances", Botão "Abrir Sala" |
| **Prompts IA** | Não implementado (robô automatizado - fase futura) |

**Observação:** Este requisito envolve automação em tempo real que será implementada em fase posterior.

---

### 2.10 FR-010 - Auditoria automática da Proposta do concorrente vencedor

| Atributo | Valor |
|----------|-------|
| **Descrição** | Auditoria da Proposta do concorrente vencedor e geração de SCORE DE RECURSO |
| **Prioridade** | Alta |
| **Tela(s)** | `ImpugnacaoPage.tsx`, `ConcorrenciaPage.tsx` |
| **Componente UI** | Modal "Criar Impugnação/Recurso", Botão "Gerar Texto com IA" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `chat_impugnacao` | 💬 Como fazer impugnação | "Como faço uma impugnação de edital?" |
| `chat_recurso` | 💬 Como fazer recurso | "Como faço um recurso administrativo?" |
| `analisar_concorrente` | 🔍 Analisar concorrente | "Analise o concorrente [NOME_EMPRESA]" |

---

### 2.11 FR-011 - Integração com CRM

| Atributo | Valor |
|----------|-------|
| **Descrição** | Integração com CRM para alimentação de Leads e ações pós-perda |
| **Prioridade** | Alta |
| **Tela(s)** | Não implementada (integração backend) |
| **Componente UI** | N/A |
| **Prompts IA** | N/A |

**Observação:** Requisito de integração de backend. Será implementado via API.

---

### 2.12 FR-012 - Monitoramento e análise pós-licitação

| Atributo | Valor |
|----------|-------|
| **Descrição** | Identificação de fatores de perda e aprimoramento do portfólio |
| **Prioridade** | Alta |
| **Tela(s)** | `PerdasPage.tsx`, `ContratadoRealizadoPage.tsx` |
| **Componente UI** | Gráfico "Motivos das Perdas", "Histórico de Perdas" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `mindsdb_vitorias_derrotas` | 📊 Vitórias e derrotas | "Quantas vitórias e derrotas temos registradas?" |
| `mindsdb_taxa_sucesso` | 📊 Taxa de sucesso | "Qual nossa taxa de sucesso em licitações?" |
| `consultar_todos_resultados` | 📊 Ver todos os resultados | "Mostre os resultados de todos os editais" |

---

### 2.13 FR-013 - Interface de parametrização para cadastro de produtos

| Atributo | Valor |
|----------|-------|
| **Descrição** | Interface para cadastro de produtos (equipamentos, reagentes, insumos) |
| **Prioridade** | Alta |
| **Tela(s)** | `PortfolioPage.tsx`, `ParametrizacoesPage.tsx` |
| **Componente UI** | Tabela de Produtos, Modal "Cadastrar Produto", Filtros |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `listar_produtos` | 💾 Listar meus produtos | "Liste todos os meus produtos cadastrados" |
| `buscar_produto_banco` | 💾 Buscar produto no banco | "Busque o produto [NOME] no banco" |
| `reprocessar_produto` | 🔄 Reprocessar especificações | "Reprocesse as especificações do produto [NOME]" |
| `atualizar_produto` | ✏️ Atualizar/editar produto | "Atualize o produto [NOME] com [NOVOS_DADOS]" |
| `excluir_produto` | 🗑️ Excluir produto | "Exclua o produto [NOME]" |

---

### 2.14 FR-014 - Sistema de busca em editais por NCMs, Nome Técnico, Palavra-chave

| Atributo | Valor |
|----------|-------|
| **Descrição** | Busca em editais com leitura completa do texto pela IA |
| **Prioridade** | Alta |
| **Tela(s)** | `CaptacaoPage.tsx` |
| **Componente UI** | Formulário "Buscar Editais" (Termo, UF, Fonte), Checkbox "Calcular score" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `buscar_editais_web` | 🌐 Buscar editais (com score) | "Busque editais de [TERMO] no PNCP" |
| `buscar_editais_simples` | 📋 Buscar editais (sem score) | "Busque editais de [TERMO] sem calcular score" |
| `buscar_editais_todos` | 📋 Buscar TODOS editais (incl. encerrados) | "Busque todos os editais de [TERMO] incluindo encerrados" |
| `buscar_links_editais` | 🔗 Links de editais por área | "Retorne os links para os editais na área [TERMO]" |
| `buscar_edital_numero_web` | 🌐 Buscar edital por número (web) | "Busque o edital [PE-001/2026] no PNCP" |

---

### 2.15 FR-015 - Tela de interface para informar matching do edital

| Atributo | Valor |
|----------|-------|
| **Descrição** | Interface ou mensagem para informar matching com periodicidade definível |
| **Prioridade** | Média |
| **Tela(s)** | `MonitoriaPage.tsx`, `FlagsPage.tsx` |
| **Componente UI** | Seção "Últimos Editais Encontrados", "Alertas Ativos" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `configurar_notificacoes` | ⚙️ Configurar notificações | "Configure minhas preferências de notificação" |
| `configurar_email` | 📧 Configurar email | "Configure notificações para o email [MEU@EMAIL.COM]" |
| `notificacoes_nao_lidas` | 🔵 Notificações não lidas | "Quais notificações não li?" |

---

### 2.16 FR-016 - Extração automática de datas e horários

| Atributo | Valor |
|----------|-------|
| **Descrição** | Extração de datas e horários de abertura de sessões do arquivo do edital |
| **Prioridade** | Média |
| **Tela(s)** | `ValidacaoPage.tsx` |
| **Componente UI** | Campo "Data de Abertura" nos detalhes do edital |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `extrair_datas` | 📅 Extrair datas do edital (PDF) | "Extraia as datas deste edital" |
| `extrair_datas_2` | 📅 Identificar prazos (PDF) | "Quais são os prazos deste edital?" |

---

### 2.17 FR-017 - Gerenciamento de usuários e perfis

| Atributo | Valor |
|----------|-------|
| **Descrição** | Sistema de gerenciamento de usuários com RBAC |
| **Prioridade** | Alta |
| **Tela(s)** | `LoginPage.tsx`, `RegisterPage.tsx` (Sidebar - perfil usuário) |
| **Componente UI** | Formulário de Login/Registro, Seção "User Profile" na Sidebar |
| **Prompts IA** | N/A |

---

### 2.18 FR-018 - Geração de relatórios analíticos

| Atributo | Valor |
|----------|-------|
| **Descrição** | Relatórios personalizáveis sobre desempenho, taxas de sucesso |
| **Prioridade** | Média |
| **Tela(s)** | `MercadoPage.tsx`, `PerdasPage.tsx`, `ContratadoRealizadoPage.tsx` |
| **Componente UI** | Gráficos de tendências, Categorias, Evolução de preços |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `mindsdb_totais` | 📊 Quantos produtos e editais? | "Quantos produtos e editais existem no banco?" |
| `mindsdb_editais_mes` | 📊 Editais do mês | "Quais editais têm data de abertura em [MÊS]?" |
| `mindsdb_produtos_categoria` | 📊 Produtos por categoria | "Quantos produtos temos em cada categoria?" |
| `mindsdb_preco_medio_categoria` | 📊 Preço médio por categoria | "Qual o preço médio dos editais por categoria?" |
| `mindsdb_resumo` | 📊 Resumo geral do banco | "Faça um resumo do banco" |

---

### 2.19 FR-019 - Validação automática de documentos

| Atributo | Valor |
|----------|-------|
| **Descrição** | Validação de documentos quanto à completude e conformidade |
| **Prioridade** | Alta |
| **Tela(s)** | `SubmissaoPage.tsx`, `PortfolioPage.tsx` |
| **Componente UI** | Checklist de Submissão, Coluna "Completude" na tabela de produtos |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `verificar_completude` | 📋 Verificar completude | "Verifique completude do produto [NOME]" |
| `verificar_completude_2` | 📋 Produto está completo? | "O produto [NOME] está completo?" |

---

### 2.20 FR-020 - Sistema de notificações multicanal

| Atributo | Valor |
|----------|-------|
| **Descrição** | Notificações por e-mail e dentro do aplicativo |
| **Prioridade** | Média |
| **Tela(s)** | `ParametrizacoesPage.tsx` (aba Notificações) |
| **Componente UI** | Formulário "Configurações de Notificação" |
| **Prompts IA** | |

| ID Prompt | Nome | Prompt |
|-----------|------|--------|
| `configurar_notificacoes` | ⚙️ Configurar notificações | "Configure minhas preferências de notificação" |
| `historico_notificacoes` | 📜 Histórico de notificações | "Mostre o histórico de notificações" |

---

## 3. Requisitos Não-Funcionais

Os requisitos não-funcionais são implementados a nível de infraestrutura e não possuem telas específicas:

| ID | Nome | Implementação |
|----|------|---------------|
| NFR-001 | Monitoramento 24/7 otimizado | Backend - agendamento de tarefas |
| NFR-002 | Geração de propostas em minutos | Backend - otimização de prompts IA |
| NFR-003 | Proposição de lances em segundos | Backend - robô automatizado (futuro) |
| NFR-004 | Suporte a documentos sensíveis | Backend - storage criptografado |
| NFR-005 | Interface intuitiva | Frontend - todas as telas |
| NFR-006 | Níveis de acesso diferenciados | Backend - RBAC implementado |
| NFR-007 | Conformidade com LGPD | Backend - políticas de dados |
| NFR-008 | Criptografia de dados | Backend - TLS + AES-256 |
| NFR-009 | Autenticação multifator (MFA) | Backend - JWT + OAuth (parcial) |
| NFR-010 | Backup e recuperação | Infraestrutura - automação |
| NFR-011 | Monitoramento de saúde | Backend - health checks |
| NFR-012 | Logs detalhados para auditoria | Backend - logging |
| NFR-013 | Cache para performance | Backend - Redis |
| NFR-014 | Interface responsiva | Frontend - CSS responsivo |

---

## 4. Regras de Negócio

| ID | Nome | Tela | Prompt IA |
|----|------|------|-----------|
| BR-001 | Algoritmo de lances considera valores limites | `LancesPage.tsx` | Robô automatizado (futuro) |
| BR-002 | Envio automático de lances com intervalos | `LancesPage.tsx` | Robô automatizado (futuro) |
| BR-003 | Busca deve ler todo o texto do edital | `CaptacaoPage.tsx`, `ValidacaoPage.tsx` | `buscar_editais_web`, `perguntar_edital` |
| BR-004 | Score de Aderência Comercial considera fatores logísticos | `CaptacaoPage.tsx` | `calcular_aderencia` |
| BR-005 | Classificação de editais por origem | `ParametrizacoesPage.tsx` | `classificar_edital` |

---

## 5. Cobertura por Tela

### 5.1 Fluxo Comercial

| Tela | Requisitos Cobertos | Prompts IA |
|------|---------------------|------------|
| `CaptacaoPage.tsx` | FR-004, FR-014 | 15 prompts (busca de editais) |
| `ValidacaoPage.tsx` | FR-004, FR-016 | 21 prompts (análise, resumo, perguntar) |
| `PrecificacaoPage.tsx` | FR-005 | 9 prompts (preços e recomendação) |
| `PropostaPage.tsx` | FR-006, FR-007 | 3 prompts (gerar proposta) |
| `SubmissaoPage.tsx` | FR-007, FR-019 | UI interativa (checklist) |
| `LancesPage.tsx` | FR-008, FR-009 | UI interativa + alertas |
| `FollowupPage.tsx` | FR-012 | 7 prompts (registrar resultados) |
| `ImpugnacaoPage.tsx` | FR-010 | 2 prompts (impugnação, recurso) |
| `ProducaoPage.tsx` | N/A (pós-contrato) | UI interativa |

### 5.2 Indicadores

| Tela | Requisitos Cobertos | Prompts IA |
|------|---------------------|------------|
| `FlagsPage.tsx` | FR-008, FR-015 | 8 prompts (alertas, prazos) |
| `MonitoriaPage.tsx` | FR-002, FR-015 | 5 prompts (monitoramento) |
| `ConcorrenciaPage.tsx` | FR-010 | 5 prompts (concorrentes) |
| `MercadoPage.tsx` | FR-018 | 10 prompts (analytics) |
| `ContratadoRealizadoPage.tsx` | FR-012, FR-018 | 3 prompts (resultados) |
| `PerdasPage.tsx` | FR-012, FR-018 | 3 prompts (análise) |

### 5.3 Configurações

| Tela | Requisitos Cobertos | Prompts IA |
|------|---------------------|------------|
| `EmpresaPage.tsx` | N/A (cadastro) | UI interativa |
| `PortfolioPage.tsx` | FR-001, FR-013 | 10 prompts (produtos) |
| `ParametrizacoesPage.tsx` | FR-003, FR-020 | 8 prompts (configurações) |

---

## 6. Gaps Identificados

### 6.1 Requisitos sem Tela Específica

| ID | Requisito | Status | Observação |
|----|-----------|--------|------------|
| FR-011 | Integração com CRM | Backend | Será implementado via API |

### 6.2 Requisitos Parcialmente Implementados

| ID | Requisito | Status | Observação |
|----|-----------|--------|------------|
| FR-009 | Robô de Lances | Parcial | Tela existe, automação futura |
| FR-010 | Auditoria do concorrente | Parcial | Geração de texto IA implementada, score automático futuro |

### 6.3 Prompts sem Tela Associada (Uso apenas via Chat)

| ID Prompt | Nome | Observação |
|-----------|------|------------|
| `ajuda` | O que posso fazer? | Help do sistema |
| `chat_livre` | Perguntar sobre licitações | Chat livre |
| `chat_lei` | Dúvida sobre legislação | Consulta jurídica |

---

## 7. Matriz de Rastreabilidade Completa

```
Requisitos → Telas → Prompts

FR-001 → PortfolioPage → upload_manual, buscar_produto_web
FR-002 → MonitoriaPage → configurar_monitoramento, listar_monitoramentos
FR-003 → ParametrizacoesPage → classificar_edital
FR-004 → CaptacaoPage, ValidacaoPage → calcular_aderencia, listar_analises
FR-005 → PrecificacaoPage → recomendar_preco, buscar_precos_pncp
FR-006 → PropostaPage → gerar_proposta, listar_propostas
FR-007 → PropostaPage, SubmissaoPage → (UI interativa)
FR-008 → FlagsPage, LancesPage → configurar_alertas, dashboard_prazos
FR-009 → LancesPage → (robô automático - futuro)
FR-010 → ImpugnacaoPage, ConcorrenciaPage → chat_impugnacao, analisar_concorrente
FR-011 → (Backend CRM) → N/A
FR-012 → PerdasPage, ContratadoRealizadoPage → mindsdb_vitorias_derrotas
FR-013 → PortfolioPage → listar_produtos, atualizar_produto
FR-014 → CaptacaoPage → buscar_editais_web, buscar_links_editais
FR-015 → MonitoriaPage, FlagsPage → configurar_notificacoes
FR-016 → ValidacaoPage → extrair_datas
FR-017 → LoginPage, RegisterPage → (UI autenticação)
FR-018 → MercadoPage, PerdasPage → mindsdb_*
FR-019 → SubmissaoPage, PortfolioPage → verificar_completude
FR-020 → ParametrizacoesPage → configurar_notificacoes
```

---

**Documento gerado em:** 2026-02-10
**Versão:** 1.0
**Baseado em:**
- `requisitos04022026.md` - Requisitos funcionais e não-funcionais
- Telas implementadas em `frontend/src/pages/`
- Prompts do dropdown em `ChatInput.tsx`
