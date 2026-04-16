# Planejamento Editais — v4

**Versão:** 4.0
**Data-base:** 2026-04-15
**Autor:** Claude + Pasteur
**Status:** Ativo
**Substitui:** `planejamento_editaisv3.md` (02/03/2026)

---

## 0. Contexto da revisão

A v3 (02/03/2026) previa 10 sprints de 1 semana cada, organizadas em 3 ondas, com a seguinte distribuição:

- **Onda 1** — Sprints 1–3 (Fundação, Captação/Validação, Precificação/Proposta)
- **Onda 2** — Sprint 4 (Impugnação/Recursos)
- **Onda 3** — Sprints 5–10 (Follow-up, CRM/Perdas/Concorrência, Flags/Monitoria/Auditoria, Mercado/Analytics, Dispensas/Classes, Lances/Health/QA)

Na execução real, a **Sprint 5 entregou em uma única passada o escopo originalmente dividido entre Sprint 5 e Sprint 6 da v3**, totalizando 26 Casos de Uso concentrados nas áreas de Follow-up, Atas, Contratos, Contratado × Realizado e CRM com Pipeline de 13 cards, Parametrizações, Mapa Geográfico, Agenda, KPIs, Decisão de Não-Participação e Registro de Motivo de Perda.

Como consequência:
- O **Sprint 6 v3** (CRM + Perdas + Concorrência + Lead automático) **deixou de ter escopo próprio** — foi absorvido pela Sprint 5 real.
- O **documento `docs/requisitos_completosv8.md`** (versão autoritativa, 13/04/2026) não menciona Sprints 6–10 em parte alguma, confirmando que a alocação de requisitos por sprint é propriedade exclusiva do planejamento.
- As **Sprints 7–10 da v3** estão literalmente intactas quanto ao escopo, porém precisam ser **renumeradas para 6–9**, eliminando o "buraco" deixado pela absorção.
- A **Sprint 9 v4** (ex-10 v3, Lances + Health Check + QA) será **ampliada** com 7 itens do roadmap Fase 1 que foram identificados como lacunas não cobertas pelas Sprints 1–8 v4.

Este documento é a versão autoritativa de planejamento a partir de 2026-04-15.

---

## 1. Resumo em uma linha por sprint

| Sprint v4 | Sprint v3 | Janela | Escopo macro | Status | Horas estim. | Tokens estim. |
|---|---|---|---|---|---|---|
| **1** | 1 | 02/03–08/03/2026 | Fundação (backend, frontend, autenticação, CRUDs base) | ✅ CONCLUÍDO | (já gasto) | (já gasto) |
| **2** | 2 | 09/03–15/03/2026 | Captação PNCP/Brave + Validação Legal de Edital | ✅ CONCLUÍDO | (já gasto) | (já gasto) |
| **3** | 3 | 16/03–22/03/2026 | Precificação em Camadas + Geração de Proposta | ✅ CONCLUÍDO | (já gasto) | (já gasto) |
| **4** | 4 | 23/03–29/03/2026 | Impugnação + Recursos + Contra-Razões | ✅ CONCLUÍDO | (já gasto) | (já gasto) |
| **5** | 5 + 6 | 30/03–12/04/2026 | Follow-up + Atas + Contratos + Contratado × Realizado + **CRM/Perdas/Concorrência** | ✅ CONCLUÍDO | (já gasto) | (já gasto) |
| **6** | 7 (renumerado) | 13/04–19/04/2026 | Flags + Monitoria + Auditoria Universal + SMTP Produção | ⏳ EM EXECUÇÃO | **8–12h** | **1.1M–1.6M** |
| **7** | 8 (renumerado) | 20/04–26/04/2026 | Mercado TAM/SAM/SOM + Analytics + Pipeline de Aprendizado | 📋 PLANEJADA | **7–11h** | **0.95M–1.45M** |
| **8** | 9 (renumerado) | 27/04–03/05/2026 | Dispensas de Licitação + Geração de Classes de Portfolio + Máscaras de Descrição | 📋 PLANEJADA | **6–9h** | **0.8M–1.2M** |
| **9** | 10 (renumerado, AMPLIADA) | 04/05–17/05/2026 | Lances em Tempo Real (sala virtual, envio automático) + Health Check + QA End-to-End + **7 gaps do roadmap** | 📋 PLANEJADA | **14–20h** | **2.0M–2.8M** |
| — | — | — | **TOTAL Sprints 6–9** | — | **35–52h** | **4.85M–7.05M** |

**Totais:** 9 sprints (antes 10), ~11 semanas corridas (Sprint 5 tomou 2 semanas por absorver Sprint 6 v3, Sprint 9 v4 toma 2 semanas por ampliação).
**Data-base desta tabela:** 2026-04-15 (quarta-feira da Sprint 6).
**Encerramento previsto do ciclo:** 2026-05-17 (domingo, fim da Sprint 9).

---

### 1.1. Base de cálculo das colunas "Horas" e "Tokens"

As duas colunas adicionais estimam **honestamente** meu esforço (do Claude) para entregar cada sprint restante do começo ao fim. Incluem:

1. **Diagrama de Casos de Uso** — documento UC completo no padrão V4 (~80–150 linhas por UC, com telas ASCII, pré/pós-condições, fluxo ator/sistema, exceções)
2. **Desenho das telas de interface** — blocos ASCII das telas dentro dos UCs + wireframes textuais para os agentes de frontend
3. **Planejamento da sprint** — leitura de requisitos, plano de execução, definição de ondas de agentes, alocação de tasks
4. **Desenvolvimento** — backend (endpoints, tools, migrações), frontend (páginas React/TSX), testes Playwright
5. **Correções** — iterações com o usuário, bugs reportados em validação manual, ajustes de UI, retestes

**Âncora histórica:** a Sprint 5 real entregou 26 UCs + 322 testes Playwright verdes em 1 semana corrida. Estimo retrospectivamente que consumiu entre 1.8M e 2.5M tokens, e de 12 a 18 horas de interação ativa do usuário. Essa é a minha calibração de referência.

**Unidades:**
- **Horas:** tempo de interação ativa do usuário comigo, espalhado ao longo da sprint (não é tempo de CPU nem horas de calendário — é quanto tempo você, o usuário, precisa gastar lendo minhas respostas, respondendo, aprovando planos, validando telas, revisando código).
- **Tokens:** input + output agregados ao longo de toda a sprint, incluindo agentes paralelos (Explore, Plan, sub-agents de codificação). Métrica bruta da API.

**Distribuição típica dos tokens dentro de uma sprint:**

| Fase | % do total | Descrição |
|---|---|---|
| Planejamento | ~10% | Ler requisitos, desenhar arquitetura, escrever PLANO_SPRINTX |
| Diagrama UC + telas | ~15% | Escrever CASOS DE USO SPRINTX V4 com telas ASCII |
| Backend (endpoints + tools + migrações) | ~25% | Agentes paralelos lendo código e escrevendo novas rotas |
| Frontend (páginas TSX + integração) | ~20% | Agentes reescrevendo páginas, removendo mocks |
| Testes Playwright (specs + execução + screenshots) | ~20% | Agente de validação com helpers.ts |
| Correções pós-validação | ~10% | Iteração com usuário, bugs, ajustes |

**Distribuição típica das horas (do usuário) dentro de uma sprint:**

| Fase | Horas típicas | O que você faz |
|---|---|---|
| Briefing + aprovação do plano | 1–2h | Ler, discutir, aprovar, corrigir escopo |
| Revisão do documento UC | 1–2h | Validar telas, aprovar fluxos |
| Acompanhamento do desenvolvimento | 1–2h | Ver progresso, responder bloqueios |
| Validação manual das telas | 2–4h | Testar funcionalidade real no browser |
| Revisão final + ajustes | 1–2h | Bugs, retoques, commit final |

**Premissas usadas:**
- Sprints sem sala virtual real-time são similares em custo entre si (Sprints 6, 7, 8)
- Sprint 9 é ~2× mais cara porque tem 12 entregas, WebSocket, portais externos hostis, 2 semanas
- Estimativas têm incerteza de ±30%: o intervalo é honesto, não um único número mágico
- Correções pós-validação dependem muito de qualidade do plano — se a Sprint for bem planejada antes, correções caem; se mal planejada, podem dobrar

---

## 2. Retrospectiva Sprints 1–5 (CONCLUÍDAS)

Nenhuma alteração quanto ao que foi entregue. Esta seção existe apenas para travar o estado atual e servir de referência para as próximas sprints.

### 2.1. Sprint 1 — Fundação

**Entregas (8):**
1. Setup Flask 5007 + Vite 5175 + SQLAlchemy + Alembic
2. Modelagem Empresa, Usuário, Portfólio, Produto, Certidão, Responsável Técnico
3. Autenticação JWT + permissões por perfil
4. CRUDs genéricos via `/api/crud/*` com filtros/paginação
5. Tela de cadastro de empresa e portfólio
6. Chatbox DeepSeek + infra de invocação de tools
7. Parametrizações base (ParametroScore, Pesos, etc.)
8. Seed de 2 empresas de validação (CH Hospitalar e RP3X)

**Status:** ✅ CONCLUÍDO
**Testes Playwright:** ~52 testes ✅ verde
**Documentação:** SPRINT1, CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V4

### 2.2. Sprint 2 — Captação + Validação Legal

**Entregas (7):**
1. Scraper PNCP + infra de busca
2. Busca Brave Search para editais fora do PNCP
3. Classificação automática de tipo de edital por IA
4. Score de Aderência (técnica + comercial) com pesos parametrizáveis
5. Validação Legal de Edital com sugestão de esclarecimento/impugnação via IA
6. Geração de petição de esclarecimento + upload de petição externa
7. Controle de prazo de impugnação com contagem em dias úteis (simples)

**Status:** ✅ CONCLUÍDO
**Testes Playwright:** ~48 testes ✅ verde
**Documentação:** SPRINT2, CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V4

### 2.3. Sprint 3 — Precificação + Proposta

**Entregas (10):**
1. Precificação em camadas (A: volumetria, B: custo, C: margem, D: lance, E: mínimo)
2. Simulador de Disputa (`POST /api/precificacao/simular-disputa`)
3. Estruturação de Lances D/E (UC-P07)
4. Estratégia Competitiva "Quero Ganhar" e "Não Ganhei no Mínimo" (UC-P08)
5. Gate de completude de produto
6. Gate de certidão vencida antes de proposta
7. Geração de proposta com anexos e templates
8. Painel de revisão/edição final
9. Tool `tool_verificar_completude_produto`
10. Tool `tool_gerar_proposta`

**Status:** ✅ CONCLUÍDO
**Testes Playwright:** ~62 testes ✅ verde
**Documentação:** SPRINT3, CASOS DE USO PRECIFICACAO E PROPOSTA V4

### 2.4. Sprint 4 — Impugnação + Recursos + Contra-Razões

**Entregas (11):**
1. UC-I01 (RF-043-01) Validação Legal do Edital
2. UC-I02 (RF-043-02) Sugerir Esclarecimento/Impugnação
3. UC-I03 (RF-043-03) Gerar Petição de Impugnação
4. UC-I04 (RF-043-04) Upload de Petição Externa
5. UC-I05 (RF-043-05) Controle de Prazo
6. UC-RE01 (RF-044-01) Monitorar Janela de Recurso
7. UC-RE02 (RF-044-02) Analisar Proposta Vencedora
8. UC-RE03 (RF-044-03) Chatbox de Análise
9. UC-RE04 (RF-044-04) Gerar Laudo de Recurso
10. UC-RE05 (RF-044-05) Gerar Laudo de Contra-Razão
11. UC-RE06 (RF-044-06) Submissão Assistida

**Status:** ✅ CONCLUÍDO
**Testes Playwright:** ~72 testes ✅ verde
**Documentação:** SPRINT4, CASOS DE USO RECURSOS E IMPUGNACOES V4
**Observação:** UC-D01/D02 (Disputas em sala virtual) foram explicitamente **removidos desta sprint** e movidos para "sprint futura dedicada" — essa sprint futura é agora a Sprint 9 v4.

### 2.5. Sprint 5 — Follow-up + Atas + Contratos + CRM (ABSORVEU SPRINT 6 v3)

**Entregas (26 UCs):**
- **Follow-up (3 UCs)**: UC-FU01 Registrar Resultado, UC-FU02 Configurar Alertas, UC-FU03 Score Logístico
- **Atas (3 UCs)**: UC-AT01 Buscar PNCP, UC-AT02 Extrair PDF, UC-AT03 Dashboard
- **Contratos (10 UCs)**: UC-CT01 Cadastrar, UC-CT02 Registrar Entrega+NF, UC-CT03 Cronograma, UC-CT04 Aditivos, UC-CT05 Gestor/Fiscal, UC-CT06 Saldo ARP, UC-CT07 Empenhos, UC-CT08 Auditoria, UC-CT09 Vencer, UC-CT10 KPIs
- **Contratado × Realizado (3 UCs)**: UC-CR01 Dashboard, UC-CR02 Pedidos em Atraso, UC-CR03 Alertas Multi-tier
- **CRM (7 UCs — ex-Sprint 6 v3)**: UC-CRM01 Pipeline com Cards, UC-CRM02 Parametrizações, UC-CRM03 Mapa Geográfico, UC-CRM04 Agenda, UC-CRM05 KPIs, UC-CRM06 Decisão Não-Participação, UC-CRM07 Registrar Motivo de Perda

**Status:** ✅ CONCLUÍDO
**Testes Playwright:** 322/322 testes ✅ verde (data de consolidação: 2026-03-31)
**Documentação:** CASOS DE USO SPRINT5 V4.md (2679 linhas), SPRINT 5 - VF.docx, APRESENTACAO_VALIDACAO_SPRINTS_1A5 (PPT 76 slides)

---

## 3. Sprint 6 v4 — Flags + Monitoria + Auditoria + SMTP (PRÓXIMA)

**Ex-Sprint 7 v3 — escopo literal intacto.**

### 3.1. Escopo

6 entregas, organizadas em 4 grupos funcionais:

1. **FlagsPage — alertas via IA**
   - Remover mock existente
   - Invocação via `onSendToChat` com as tools: `tool_configurar_alertas`, `tool_listar_alertas`, `tool_cancelar_alerta`, `tool_dashboard_prazos`, `tool_calendario_editais`
   - Cards: Alertas Ativos, Disparos do Dia, Histórico, Alertas Silenciados
   - **RF relacionados:** RF-022, RF-039

2. **MonitoriaPage — monitoramentos via IA**
   - Remover mock existente
   - Tools: `tool_configurar_monitoramento`, `tool_listar_monitoramentos`, `tool_desativar_monitoramento`
   - Cards: Monitoramentos Ativos, Eventos Capturados, Monitoramentos com Erro, Análises Sob Demanda
   - **RF relacionados:** RF-023

3. **Middleware de Auditoria Universal**
   - Interceptador transversal em `backend/crud_routes.py` + endpoints sensíveis de `backend/app.py`
   - Gravação em tabela `auditoria_log` (model já existe em `backend/models.py`)
   - Captura: usuário, entidade, operação, estado anterior, estado novo, IP, timestamp
   - Mascaramento de campos sensíveis (senhas, tokens, chaves) antes da gravação
   - Falha graciosa (não bloqueia operação principal se gravação do log falhar)
   - **RF relacionados:** RF-030

4. **tool_analisar_documentos_empresa** — análise de coerência LLM
   - Varre documentos cadastrados da empresa (contrato social, certidões, alvarás, cadastro ANVISA)
   - Reporta inconsistências (razão social divergente, datas fora de ordem, certidão vencida, campo ausente)
   - Integração com `SUBCARD — ANÁLISE DE DOCUMENTOS DA EMPRESA` da MonitoriaPage
   - **RF relacionados:** RF-004

5. **tool_verificar_pendencias_pncp** — reconciliação com fonte externa
   - Consulta PNCP para edital específico
   - Compara estado salvo vs estado remoto
   - Reporta: adendos, prorrogações, alterações de termo de referência, cancelamentos, suspensões
   - Quando aplicável, gera alerta automático para o responsável do edital
   - **RF relacionados:** RF-031

6. **SMTP produção + integração com scheduler**
   - Configuração SMTP real (host, porta, TLS, credenciais criptografadas)
   - Múltiplos remetentes por tipo de alerta
   - Fila de envio com retentativas (backoff exponencial)
   - Templates de email versionados por tipo de alerta
   - Histórico de envios + reenvio manual
   - Promoção dos jobs do scheduler do modo "simulação" (log em arquivo) para o modo "produção" (envio real)
   - **RF relacionados:** RF-039

### 3.2. Documentação descritiva

A versão no estilo SPRINT 5 - VF.docx está em `docs/SPRINT 6-VI.md` (descritivo de negócio em PT-BR informal com CARDs, SUBCARDs, KPIs, Pontos Importantes, Referência com Modelo Existente, Integração com Sprints Anteriores, Valor Agregado).

### 3.3. Observação sobre documentos legados

- `docs/sprint6.md` — arquivo anterior, mantido como está (conteúdo não alinhado com v4, mas preservado por decisão explícita).
- `docs/PLANO_SPRINT6.md` — marcado como **histórico** no cabeçalho. Não usar como referência ativa.

### 3.4. Prazo

**Janela: 13/04/2026 (segunda) a 19/04/2026 (domingo)** — 1 semana de execução concentrada.
**Data-base da definição:** 2026-04-15 (quarta-feira, meio da sprint). A execução já começou; conclusão prevista para o fim desta semana.

---

## 4. Sprint 7 v4 — Mercado + Analytics + Aprendizado

**Ex-Sprint 8 v3 — escopo literal intacto.**

### 4.1. Escopo

5 entregas:

1. **tool_calcular_tam_sam_som**
   - Cálculo de Total Addressable Market, Serviceable Addressable Market e Serviceable Obtainable Market
   - Fontes: histórico de editais PNCP + portfolio da empresa + parametrizações de alcance geográfico
   - **RF relacionados:** RF-050

2. **tool_detectar_itens_intrusos**
   - Análise de edital para detectar itens que fogem do padrão do objeto
   - Ex.: edital de reagentes que inclui "calibrador sem valor de venda" sem previsão contratual
   - Geração de alerta crítico para o usuário responsável
   - **RF relacionados:** RF-048, RF-049

3. **MercadoPage**
   - Dashboard de Mercado com TAM/SAM/SOM do portfolio
   - Distribuição geográfica do mercado
   - Análise de participação de mercado da empresa vs concorrentes conhecidos
   - **RF relacionados:** RF-050

4. **Pipeline de Aprendizado**
   - Coleta sistemática de motivos de perda registrados (Sprint 5, UC-CRM07)
   - Coleta de alterações sensíveis em parametrizações (Sprint 6 v4, middleware de auditoria)
   - Alimentação de base de conhecimento que a IA consulta em análises futuras
   - Ex.: "na última análise, você alterou o peso da aderência técnica de 0.4 para 0.6 depois de perder o edital X por critério técnico — quer aplicar a mesma lógica aqui?"
   - **RF relacionados:** nova função de aprendizado, não havia RF específica na v3

5. **AnalyticsPage**
   - Dashboard consolidado com indicadores de performance do sistema
   - Editais analisados, participados, ganhos, perdidos
   - Taxa de conversão por etapa
   - Tempo médio entre etapas
   - Taxa de aderência média
   - ROI estimado do sistema
   - **RF relacionados:** RF-053, RF-050

### 4.2. Prazo

**Janela: 20/04/2026 (segunda) a 26/04/2026 (domingo)** — 1 semana.

---

## 5. Sprint 8 v4 — Dispensas + Classes + Máscaras

**Ex-Sprint 9 v3 — escopo literal intacto.**

### 5.1. Escopo

4 entregas:

1. **CaptacaoPage — aba Dispensas**
   - Nova aba na tela de Captação para capturar dispensas de licitação (Art. 75 Lei 14.133/2021)
   - Cards separados: Dispensas Abertas, Em Análise, Participando, Ganhas, Perdidas
   - Filtros por valor, órgão, tipo de dispensa
   - **RF relacionados:** RF-017 (dispensas)

2. **tool_gerar_classes_portfolio**
   - Análise assistida por IA para gerar automaticamente classes de agrupamento do portfolio
   - Ex.: "gere classes para o meu portfolio" → a IA cria Hematologia, Bioquímica, Coagulação, etc. com base nos produtos cadastrados
   - Resultado vira sugestão na tela de Parametrizações do CRM (a aba já criada na Sprint 5)
   - **RF relacionados:** RF-015, RF-045-02

3. **tool_aplicar_mascara_descricao**
   - Normalização de descrição de produto via regex/LLM para casar com termos de edital
   - Ex.: "Reagente Hemoglobina A1C" vira "reagente hemoglobina glicada A1C"
   - Aumenta taxa de match no Score de Aderência
   - **RF relacionados:** RF-015

4. **ParametrizacoesPage — aba Classes**
   - Nova aba para gestão das classes geradas pela `tool_gerar_classes_portfolio`
   - CRUD manual para ajustes
   - Aplicação das classes ao portfolio existente
   - **RF relacionados:** RF-015

### 5.2. Prazo

**Janela: 27/04/2026 (segunda) a 03/05/2026 (domingo)** — 1 semana.

---

## 6. Sprint 9 v4 — Lances Real-Time + Health Check + QA + 7 GAPS DO ROADMAP (AMPLIADA)

**Ex-Sprint 10 v3 AMPLIADA** com 7 itens do roadmap Fase 1 que foram identificados como não cobertos pelas Sprints 1–8 v4.

### 6.1. Escopo original da v3 (5 entregas)

1. **tool_simular_lance**
   - Simulador de lance com base em histórico de disputas
   - Integra com o Simulador de Disputa (UC-P08) já entregue na Sprint 3

2. **tool_sugerir_lance**
   - Sugestão de lance em tempo real durante sessão de pregão
   - Usa histórico + perfil dos concorrentes + estratégia configurada (Quero Ganhar / Não Ganhei no Mínimo)

3. **LancesPage**
   - Tela de operação de lances durante sessão virtual
   - Timer, histórico de lances, sugestão da IA, botão de envio rápido

4. **/api/health**
   - Endpoint de health check com status de DB, cache, PNCP, Brave, DeepSeek, SMTP, scheduler

5. **QA end-to-end**
   - Auditoria final de toda a suíte Playwright (322+ testes)
   - Resolução de testes flaky
   - Documentação operacional final

### 6.2. Ampliação v4 (7 gaps do roadmap Fase 1)

Identificados durante a auditoria comparativa entre o **Roadmap Fase 1 (18/12/2025)** e o estado real do código após Sprints 1–8 v4:

1. **RF-042-01 — Sala Virtual de Disputa**
   - Componente frontend de sala virtual para acompanhar pregão em tempo real
   - WebSocket ou polling de alta frequência
   - Visualização dos lances dos concorrentes
   - **Origem no roadmap:** Item 7 "Alertas de Abertura do Pregão" + Item 8 "Robô de Lances"
   - **UCs relacionados:** UC-D01 (ex-Sprint 4, removido e movido para esta sprint)

2. **RF-042-02 — Lance Aberto + Fechado**
   - Suporte aos dois modos de disputa (lances abertos durante toda a sessão vs lance fechado final)
   - Lógica distinta de sugestão da IA para cada modo
   - **Origem no roadmap:** Item 8 "Robô de Lances"

3. **RF-042-03 — Detecção Automática de Abertura de Sessão**
   - Integração com portais para detectar que a sessão do pregão foi aberta
   - Ativação automática da sala virtual e do robô de lances
   - **Origem no roadmap:** Item 7 "Alertas de Abertura do Pregão"
   - **UCs relacionados:** UC-D02 (ex-Sprint 4, removido e movido para esta sprint)

4. **Envio Automático de Lances**
   - Robô de lances com envio automático (não apenas sugestão)
   - Respeita limites mínimo/satisfatório/estimado configurados no início do processo (Camadas D/E da Sprint 3)
   - Auditoria obrigatória antes do envio (confirmação rápida do usuário)
   - **Origem no roadmap:** Item 8 "Robô de Lances" — parágrafo específico sobre envio automático

5. **Score de Competitividade**
   - Score numérico (0–100) que indica a probabilidade de a empresa vencer o edital com os preços recomendados
   - Calculado a partir de histórico de editais ganhos/perdidos em condições similares
   - **Origem no roadmap:** Item 5 "Recomendações de Preços para Vencer o Edital", sub-item (c)

6. **Score de Qualidade dos Concorrentes**
   - Score numérico que indica a qualidade média das propostas dos concorrentes, medido pelo número de desclassificações desde a 1ª notificação de empresa vencedora até o atendimento definitivo
   - Ex.: "média de 4 impugnações por edital neste órgão — qualidade baixa, espaço para recursos"
   - **Origem no roadmap:** Item 5 "Recomendações de Preços para Vencer o Edital", sub-item (d)

7. **Tempo Médio do 1º Empenho + DRE do Contrato + Score Numérico de Recurso**

   Três sub-indicadores agregados em uma entrega única por proximidade temática:

   - **Tempo Médio do 1º Empenho** — histórico de quanto tempo a empresa leva, em média, desde a homologação até receber o primeiro empenho do órgão. Alimenta previsão de fluxo de caixa e priorização comercial.
     **Origem no roadmap:** Item 5, sub-item (e)

   - **DRE do Contrato** — demonstrativo de resultado do contrato com base em volumes e preços previstos, para avaliação de atratividade comercial antes de decidir participar.
     **Origem no roadmap:** Item 5, sub-item (f)

   - **Score Numérico de Recurso** — score 0–100 que indica a probabilidade de sucesso de um recurso com base em desvios técnicos detectados na proposta vencedora. Hoje a Sprint 4 entrega o laudo de recurso e o alerta de janela, mas não o número resumido.
     **Origem no roadmap:** Item 9 "Auditoria da Proposta e Documentos do Concorrente Vencedor", sub-item (a)

### 6.3. Total da Sprint 9 v4

**12 entregas** (5 originais + 7 gaps do roadmap).

### 6.4. Prazo

**Janela: 04/05/2026 (segunda) a 17/05/2026 (domingo)** — 2 semanas, devido à ampliação.

Marcos internos:
- **Semana 1 (04/05–10/05):** entregas originais da v3 (tool_simular_lance, tool_sugerir_lance, LancesPage, /api/health) + início da sala virtual RF-042-01
- **Semana 2 (11/05–17/05):** RF-042-02/03 (lance aberto+fechado, detecção automática), envio automático, Score de Competitividade, Score de Qualidade dos Concorrentes, Tempo Médio 1º Empenho, DRE do Contrato, Score numérico de Recurso, QA end-to-end final

Nota sobre viabilidade: considerando o histórico da Sprint 5 real (26 UCs + 322 testes em 1 semana, com a Onda 3 concluindo no prazo), **12 entregas em 2 semanas é conservador**. O risco não está no volume, mas na complexidade específica de sala virtual real-time (WebSockets, concorrência, sincronização com portais externos), que é a parte menos familiar ao time de desenvolvimento do sistema. Por isso a janela de 2 semanas.

---

## 7. Riscos e mitigações

| Risco | Sprint afetada | Mitigação |
|---|---|---|
| Middleware de auditoria explode tamanho do DB | 6 | Particionamento por mês + TTL 24 meses + arquivamento para storage frio |
| SMTP de produção dispara emails em massa no primeiro deploy | 6 | Dry-run (log-only) nos primeiros 7 dias + flag `SMTP_LIVE_MODE=false` default |
| `tool_calcular_tam_sam_som` depende de dados históricos que podem estar escassos | 7 | Dados sintéticos de bootstrap + marca de "estimativa preliminar" até base encher |
| Pipeline de aprendizado pode criar dependência circular (IA influencia próprias decisões) | 7 | Logs de auditoria separados por "decisão com aprendizado" vs "decisão manual", permitindo desabilitar temporariamente |
| `tool_gerar_classes_portfolio` produz classes ruins em portfolios pequenos | 8 | Mínimo de 20 produtos exigido antes de rodar a tool + revisão humana obrigatória |
| Máscaras de descrição quebram match que hoje funciona | 8 | Feature flag por produto + log antes/depois de match score |
| Sala virtual real-time é incompatível com portais que bloqueiam scraping | 9 | Iniciar por portais "amigáveis" (PNCP) + fallback manual para portais hostis |
| Envio automático de lances pode gerar processos em caso de erro | 9 | Exigir auditoria humana obrigatória no primeiro mês (`AUTO_BID_ENABLED=false`) |
| Score de Competitividade e Score de Qualidade dependem de histórico que a empresa não tem no primeiro uso | 9 | Dados públicos do PNCP de editais similares como bootstrap |

---

## 8. Cronograma consolidado

```
Sprint 1    ✅  02/03–08/03/2026   Fundação
Sprint 2    ✅  09/03–15/03/2026   Captação + Validação
Sprint 3    ✅  16/03–22/03/2026   Precificação + Proposta
Sprint 4    ✅  23/03–29/03/2026   Impugnação + Recursos
Sprint 5    ✅  30/03–12/04/2026   Follow-up + Atas + Contratos + CRM (absorveu Sprint 6 v3)
Sprint 6    ⏳  13/04–19/04/2026   Flags + Monitoria + Auditoria + SMTP   [EM EXECUÇÃO]
Sprint 7    📋  20/04–26/04/2026   Mercado + Analytics + Aprendizado
Sprint 8    📋  27/04–03/05/2026   Dispensas + Classes + Máscaras
Sprint 9    📋  04/05–17/05/2026   Lances Real-Time + Health + QA + 7 gaps [AMPLIADA]
```

**Data-base:** 2026-04-15 (quarta-feira, meio da Sprint 6)
**Conclusão prevista da Sprint 6:** 2026-04-19 (domingo desta semana)
**Conclusão prevista do ciclo completo (Sprint 9):** 2026-05-17 (domingo)
**Janela total do restante do plano (Sprints 6–9):** 5 semanas corridas a contar de 13/04/2026

---

## 9. Documentos relacionados

| Documento | Papel |
|---|---|
| `docs/requisitos_completosv8.md` | Autoritativo sobre RFs e RNs. Não menciona distribuição por sprint — por isso não precisa ser versionado para v9. |
| `docs/SPRINT 6-VI.md` | Descritivo de negócio da Sprint 6 v4 no estilo SPRINT 5 - VF.docx |
| `docs/sprint6.md` | Arquivo anterior, preservado por decisão explícita. Conteúdo não alinhado com v4. |
| `docs/PLANO_SPRINT6.md` | Histórico, marcado como tal no cabeçalho. |
| `docs/CASOS DE USO SPRINT5 V4.md` | 26 UCs entregues na Sprint 5 real (absorveu Sprint 6 v3). |
| `docs/CASOS DE USO RECURSOS E IMPUGNACOES V4.md` | UCs da Sprint 4 (incluindo marca de remoção de UC-D01/D02). |
| `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V4.md` | UCs da Sprint 3 incluindo UC-P07 (Lances D/E) e UC-P08 (Estratégia). |
| `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V4.md` | UCs da Sprint 2. |
| `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V4.md` | UCs da Sprint 1. |
| `docs/planejamento_editaisv3.md` | **Superseded.** Mantido para rastreabilidade histórica. |
| `/tmp/roadmap/Roadmap fase 1 18-12-2025.txt` | Fonte dos 7 gaps da Sprint 9 v4. |

---

## 10. Checklist antes de iniciar a Sprint 6

- [ ] Dono do projeto aprovou `planejamento_editaisv4.md` (este documento)
- [ ] Dono do projeto aprovou `docs/SPRINT 6-VI.md` como descritivo da Sprint 6
- [ ] `docs/PLANO_SPRINT6.md` marcado como histórico
- [ ] Suite Playwright 322/322 continua verde
- [ ] `backend/models.py` → `AuditoriaLog` confirmado como presente e vazio
- [ ] `backend/scheduler.py` → `APScheduler` confirmado como importado e em uso
- [ ] SMTP sandbox / dry-run disponível para testes sem spammar ninguém
- [ ] Flag de feature para middleware de auditoria (permitir rollback se explodir o DB)

---

## 11. Nota final

Este planejamento é um documento vivo. Qualquer alteração de escopo de sprint a partir de agora deve ser **registrada aqui como commit**, com motivo. A prática da v3 (alterar o texto sem registrar o motivo) foi o que levou à confusão entre "Sprint 5 planejada" e "Sprint 5 real". Na v4, qualquer mudança do que está escrito acima deve incluir, no commit message, a frase: `planejamento_editaisv4: revisão Sprint X motivo Y`.
