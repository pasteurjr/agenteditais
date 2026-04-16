# CASOS DE USO — SPRINT 6: FLAGS, MONITORIA, AUDITORIA UNIVERSAL E SMTP PRODUCAO

**Data:** 15/04/2026
**Versao:** 4.0
**Base:** requisitos_completosv8.md (RF-047, RF-048, RF-056, RF-002 criterio 5, RF-004, RF-052-01, RNF-003) + SPRINT 6-VI.md (descritivo funcional da sprint) + Lei 14.133/2021 (Art. 117 auditoria dual) + LGPD (retencao de logs com dados pessoais)
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Flags (sinalizadores), Monitoria (monitoramentos automaticos), Auditoria Universal e Notificacoes SMTP de producao.
**Nota:** Todos os casos de uso desta sprint sao NOVOS. A infraestrutura backend ja existe parcialmente (AuditoriaLog model, APScheduler, catalogo de tools DeepSeek) e sera reusada.

---

## Regras de Negocio Aplicadas (V4)

Esta sprint introduz enforcement real de varias RNs que estavam em modo **warn-only** desde a Sprint 5. As seguintes RNs passam para modo **enforced** nesta sprint (`ENFORCE_RN_VALIDATORS=true`):

| RN | Descricao | UC afetado | Origem |
|---|---|---|---|
| RN-037 | Audit log universal em todas as operacoes CRUD e transicoes de estado | Todos os UCs de Auditoria | RF-056 + Sprint 5 parcial |
| RN-132 | Audit de invocacoes DeepSeek (tool_name, input_hash, user, timestamp) | UC-MO03, UC-MO04 | RF-041-02 + FALTANTE V4 |
| RN-080 | Recalcular scores apos decisao GO/NO-GO exige justificativa + versao | UC-AU02 | FALTANTE V4 |
| RN-039 | Documentos da empresa com data_vencimento transitam para `expirado` automaticamente | UC-FL02, UC-MO03 | FALTANTE V4 |
| RN-211 | Alerta formal ao gestor quando divergencia em auditoria >= R$1.000 OU >=5% do empenhado | UC-FL01 | FALTANTE V4 |
| RN-212 | Contador de prazo em Recursos/Contra-Razoes dispara evento automatico ao zerar | UC-FL01, UC-FL02 | FALTANTE V4 |
| RN-186 | Alertas multi-tier: Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d) | UC-FL01, UC-FL02 | RF-052-01 (ja enforced) |
| RN-187 | Canais escalonados: sistema (sempre), email (15d+), WhatsApp (7d+) | UC-SM01, UC-SM02 | RF-052-01 (ja enforced) |
| RN-008 | Status visual de certidao derivado da data de vencimento | UC-FL02, UC-MO03 | RF-002 (ja enforced, agora dispara alerta via scheduler) |
| RN-031 | Empresa nao pode ser usada se tiver certidoes obrigatorias vencidas | UC-FL02 | FALTANTE V4, entra via scheduler |

**Total de RNs enforced nesta sprint:** 10 (4 ja presentes como warn + 6 FALTANTE ativadas).

---

## INDICE

### FASE 1 — FLAGS (SINALIZADORES)
- [UC-FL01] Visualizar Dashboard de Alertas Ativos
- [UC-FL02] Criar Alerta via IA (chatbox)
- [UC-FL03] Listar e Filtrar Historico de Alertas
- [UC-FL04] Cancelar/Silenciar Alerta
- [UC-FL05] Ver Agenda de Disparos (Calendario)

### FASE 2 — MONITORIA (MONITORAMENTOS AUTOMATICOS)
- [UC-MO01] Visualizar Dashboard de Monitoramentos Ativos
- [UC-MO02] Criar Monitoramento PNCP via IA
- [UC-MO03] Analisar Documentos da Empresa (sob demanda)
- [UC-MO04] Verificar Pendencias PNCP de Edital (sob demanda)
- [UC-MO05] Ver Eventos Capturados por Monitoramento
- [UC-MO06] Tratar Monitoramentos com Erro

### FASE 3 — AUDITORIA UNIVERSAL
- [UC-AU01] Consultar Registros de Auditoria
- [UC-AU02] Investigar Alteracoes Sensiveis em Parametrizacoes
- [UC-AU03] Exportar Pacote de Compliance

### FASE 4 — NOTIFICACOES SMTP PRODUCAO
- [UC-SM01] Configurar Servidor SMTP
- [UC-SM02] Gerenciar Templates de Email
- [UC-SM03] Consultar Fila de Envio e Reenviar Manualmente

---

## RESUMO DE IMPLEMENTACAO

| UC | Nome | Fase | Pagina | Aba / Posicao | Status |
|----|------|------|--------|---------------|--------|
| UC-FL01 | Dashboard Alertas Ativos | Flags | FlagsPage | Aba "Ativos" | ⬜ NAO IMPLEMENTADO |
| UC-FL02 | Criar Alerta via IA | Flags | FlagsPage | Floating Chat | ⬜ NAO IMPLEMENTADO |
| UC-FL03 | Historico de Alertas | Flags | FlagsPage | Aba "Historico" | ⬜ NAO IMPLEMENTADO |
| UC-FL04 | Cancelar/Silenciar Alerta | Flags | FlagsPage | Aba "Ativos" > Acao | ⬜ NAO IMPLEMENTADO |
| UC-FL05 | Agenda de Disparos | Flags | FlagsPage | Aba "Calendario" | ⬜ NAO IMPLEMENTADO |
| UC-MO01 | Dashboard Monitoramentos | Monitoria | MonitoriaPage | Aba "Ativos" | ⬜ NAO IMPLEMENTADO |
| UC-MO02 | Criar Monitoramento PNCP via IA | Monitoria | MonitoriaPage | Floating Chat | ⬜ NAO IMPLEMENTADO |
| UC-MO03 | Analisar Documentos Empresa | Monitoria | MonitoriaPage | Aba "Analises Sob Demanda" | ⬜ NAO IMPLEMENTADO |
| UC-MO04 | Verificar Pendencias PNCP | Monitoria | MonitoriaPage | Aba "Analises Sob Demanda" | ⬜ NAO IMPLEMENTADO |
| UC-MO05 | Eventos Capturados | Monitoria | MonitoriaPage | Aba "Eventos" | ⬜ NAO IMPLEMENTADO |
| UC-MO06 | Monitoramentos com Erro | Monitoria | MonitoriaPage | Aba "Erros" | ⬜ NAO IMPLEMENTADO |
| UC-AU01 | Consultar Auditoria | Auditoria | AuditoriaPage | Aba "Registros" | ⬜ NAO IMPLEMENTADO |
| UC-AU02 | Alteracoes Sensiveis | Auditoria | AuditoriaPage | Aba "Sensiveis" | ⬜ NAO IMPLEMENTADO |
| UC-AU03 | Exportar Compliance | Auditoria | AuditoriaPage | Aba "Exportar" | ⬜ NAO IMPLEMENTADO |
| UC-SM01 | Configurar SMTP | Notificacoes | NotificacoesPage | Aba "Servidor" | ⬜ NAO IMPLEMENTADO |
| UC-SM02 | Templates de Email | Notificacoes | NotificacoesPage | Aba "Templates" | ⬜ NAO IMPLEMENTADO |
| UC-SM03 | Fila de Envio | Notificacoes | NotificacoesPage | Aba "Fila" | ⬜ NAO IMPLEMENTADO |

**Totais:** 0 implementados + 0 parciais + 17 nao implementados = **17 casos de uso**

---

# FASE 1 — FLAGS (SINALIZADORES)

---

## [UC-FL01] Visualizar Dashboard de Alertas Ativos

**RNs aplicadas:** RN-037 (audit log), RN-186 (niveis de criticidade), RN-187 (canais escalonados), RN-211 (threshold divergencia), RN-212 (contador prazo dispara automatico)

**RF relacionado:** RF-047 (Flags), RF-052-01 (Alertas Multi-tier)
**Ator:** Usuario (Analista Comercial, Diretor, Gestor de Contrato)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Scheduler `APScheduler` esta ativo no backend
3. Pelo menos um alerta foi criado (via IA, via scheduler automatico, ou via modulo de origem como Sprint 4 Recursos)

### Pos-condicoes
1. Usuario visualiza a lista de alertas ativos classificados por criticidade
2. Registro de visualizacao gravado em `AuditoriaLog` (RN-037)
3. Alertas criticos nao reconhecidos aparecem no topo

### Sequencia de Eventos

1. Usuario acessa FlagsPage (`/app/flags`) via menu lateral "Indicadores > Flags"
2. [Cabecalho: "Flags e Alertas"] exibe titulo da pagina
3. [Secao: Stat Cards — grid 4 colunas] mostra 4 metricas agregadas: Criticos (vermelho), Altos (laranja), Medios (amarelo), Informativos (azul)
4. Na [Aba: "Ativos"] (default), [Card: "Alertas Ativos"] lista todos os alertas com status `aguardando` ou `disparado_nao_reconhecido`
5. [Tabela: Alertas Ativos] exibe: Criticidade, Tipo, Entidade de Referencia, Responsavel, Data Disparo, Canal, Status, Acoes
6. Usuario pode filtrar via [Select: "Filtrar por Tipo"], [Select: "Filtrar por Responsavel"], [Select: "Filtrar por Criticidade"], [DatePicker: "Periodo"]
7. Cada linha mostra [Badge: criticidade] (cor correspondente), [Texto: tipo do alerta], [Link: entidade clicavel], [Texto: nome do responsavel], [Texto: data/hora ISO], [Badge: canal], [Badge: status]
8. Usuario clica em [Botao: "Reconhecer"] na coluna Acoes para marcar um alerta como ciente
9. Sistema atualiza status do alerta para `reconhecido`, registra timestamp + user_id, grava em `AuditoriaLog`
10. Linha desaparece da tabela "Ativos" e aparece em [Aba: "Historico"]
11. [Stat Cards] recalculam com os novos totais

### Tela(s) Representativa(s)

**Pagina:** FlagsPage (`/app/flags`)
**Posicao:** Aba "Ativos"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Flags e Alertas                                              |
|                                                               |
|  +---------+  +---------+  +---------+  +---------+          |
|  |Criticos |  |Altos    |  |Medios   |  |Informa- |          |
|  |   12    |  |   28    |  |   45    |  |tivos 67 |          |
|  |(vermelho|  |(laranja)|  |(amarelo)|  | (azul)  |          |
|  +---------+  +---------+  +---------+  +---------+          |
|                                                               |
|  +------+  +-----------+  +------------+  +----------+       |
|  |Ativos|  |Calendario |  |Historico   |  |Silencia- |       |
|  |      |  |           |  |            |  |dos       |       |
|  +------+  +-----------+  +------------+  +----------+       |
|                                                               |
|  [Filtros]                                                    |
|  Tipo: [Select v]  Responsavel: [Select v]                   |
|  Criticidade: [Select v]  Periodo: [DatePicker v]             |
|                                                               |
|  +-----------+-------------+-----------+---------+-------+   |
|  |Criticidade| Tipo        |Entidade   |Respons. |Acoes  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Critico] |Prazo Recurso|Edital 2034|J.Silva  |[Reco- |   |
|  |           |vence em 2h  |           |         | nhe-  |   |
|  |           |             |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Alto]    |Contrato     |Contrato   |M.Costa  |[Reco- |   |
|  |           |vence em 15d |CT-2026-42 |         | nhe-  |   |
|  |           |             |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Medio]   |Certidao     |Empresa 001|P.Junior |[Reco- |   |
|  |           |FGTS vence   |           |         | nhe-  |   |
|  |           |em 20d       |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|                                                               |
|                                        [Floating Chatbox IA] |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (agregados), Tabela Alertas (lista completa filtravel), Badges de criticidade, Links para entidades de origem
- **Preenchidos (input):** Filtros (Tipo, Responsavel, Criticidade, Periodo)
- **Obtidos (resposta do sistema):** Contagem por criticidade, Lista filtrada, Confirmacao de reconhecimento, Atualizacao em tempo real dos Stat Cards apos acao

### Excecoes
- **E1:** Scheduler esta parado - sistema exibe banner vermelho "Scheduler inativo. Alertas nao estao sendo disparados" com botao "Contatar administrador"
- **E2:** Alerta ja foi reconhecido por outro usuario - sistema exibe toast "Alerta ja reconhecido por {nome_usuario} em {timestamp}"

---

## [UC-FL02] Criar Alerta via IA (chatbox)

**RNs aplicadas:** RN-037 (audit log), RN-084 (cooldown 60s DeepSeek), RN-132 (audit de invocacoes), RN-008 (status certidao), RN-031 (bloqueio certidao vencida), RN-039 (transicao automatica de expirado), RN-186 (criticidade), RN-212 (contador prazo)

**RF relacionado:** RF-047, RF-054 (Interface Hibrida Chat+CRUD)
**Ator:** Usuario (qualquer perfil com permissao de criar alertas)

### Pre-condicoes
1. Usuario esta autenticado
2. Tool `tool_configurar_alertas` esta registrada no catalogo DeepSeek
3. Entidade de referencia (edital, contrato, certidao) existe no banco

### Pos-condicoes
1. Alerta criado no banco com todos os campos preenchidos pela IA
2. Scheduler agenda o disparo conforme a data/hora
3. Log de invocacao da tool gravado em `AuditoriaLog` (RN-132)
4. Alerta aparece imediatamente no UC-FL01 (Dashboard Ativos)

### Sequencia de Eventos

1. Usuario abre o [Floating Chat] disponivel em qualquer pagina (inclusive FlagsPage)
2. Usuario digita em [TextArea: "Mensagem para IA"]: "Cria um alerta critico de prazo de recurso para o edital 2034 com disparo amanha as 8h"
3. Usuario clica [Botao: "Enviar"] (icone Send)
4. Sistema verifica cooldown DeepSeek (RN-084). Se <60s da ultima chamada, exibe erro e aborta
5. Backend invoca DeepSeek com o prompt + catalogo de tools
6. DeepSeek responde com tool_call para `tool_configurar_alertas` com os argumentos extraidos: `{tipo: "prazo_recurso", edital_id: 2034, criticidade: "critico", data_disparo: "2026-04-16T08:00:00", canal: "ambos", responsavel_id: current_user}`
7. Backend executa a tool; tool cria registro em `AlertaFlag`, agenda job no APScheduler
8. Tool registra log em `AuditoriaLog` com `tool_name=tool_configurar_alertas`, `input_hash`, `user_id`, `timestamp` (RN-132)
9. Backend retorna resposta da tool para o DeepSeek
10. DeepSeek gera mensagem de confirmacao em PT-BR informal: "Prontinho! Alerta critico de prazo de recurso criado para o edital 2034. Vou te avisar amanha as 8h via email e tela."
11. Chatbox exibe a mensagem no historico da conversa
12. Se usuario navegar para FlagsPage > Aba "Ativos" (UC-FL01), novo alerta aparece no topo da tabela

### Tela(s) Representativa(s)

**Pagina:** Qualquer pagina do sistema (chatbox e flutuante)
**Posicao:** Floating Chat (canto inferior direito)

#### Layout do Chatbox

```
+---------------------------------------+
|  Chat com a IA                   [X] |
+---------------------------------------+
|                                       |
|  [Usuario]                            |
|  Cria um alerta critico de prazo     |
|  de recurso para o edital 2034       |
|  com disparo amanha as 8h            |
|                                       |
|  [IA - Tool Call: tool_configurar_   |
|   alertas] (collapsed, expansivel)   |
|                                       |
|  [IA]                                 |
|  Prontinho! Alerta critico de prazo  |
|  de recurso criado para o edital     |
|  2034. Vou te avisar amanha as 8h    |
|  via email e tela.                   |
|                                       |
|  [Link: Ver alerta criado -->]       |
|                                       |
+---------------------------------------+
|  [TextArea: "Mensagem para IA"]      |
|  [Botao: Enviar] [Botao: Anexar]     |
+---------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico da conversa, Tool calls expandidos, Confirmacoes da IA, Link para ver alerta criado
- **Preenchidos (input):** Mensagem em linguagem natural em [TextArea]
- **Obtidos (resposta do sistema):** Resposta natural da IA, Registro persistido em `AlertaFlag`, Job agendado, Atualizacao da tela FL01

### Excecoes
- **E1:** Edital 2034 nao existe - IA responde "Nao encontrei o edital 2034. Quer que eu liste seus editais recentes para escolher?"
- **E2:** Cooldown ativo (RN-084) - tool retorna erro e IA responde "Aguarda mais {N} segundos antes de me mandar outro pedido pesado. Enquanto isso, quer ver seus alertas ativos?"
- **E3:** Certidao usada como referencia esta vencida (RN-031) - tool valida e IA avisa "O alerta foi criado, mas te aviso que a certidao FGTS dessa empresa esta vencida desde 10/04/2026. Nao da para enviar proposta nesse estado."

---

## [UC-FL03] Listar e Filtrar Historico de Alertas

**RNs aplicadas:** RN-037 (audit log de consulta)

**RF relacionado:** RF-047
**Ator:** Usuario (Diretor, Analista, Auditor Interno)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos 1 alerta ja foi disparado ou expirado nos ultimos N dias

### Pos-condicoes
1. Usuario visualiza historico completo com filtros aplicados
2. Consulta gravada em `AuditoriaLog` (evidencia de "quem consultou o que")

### Sequencia de Eventos

1. Usuario acessa FlagsPage (`/app/flags`) e clica na [Aba: "Historico"]
2. [Card: "Historico de Alertas"] exibe tabela dos ultimos 30 dias (padrao)
3. [Tabela: Historico] mostra: Data/Hora, Tipo, Entidade, Responsavel, Criticidade, Status Final, Tempo ate Reconhecimento
4. [Filtros] permitem ajustar: Periodo (DatePicker), Tipo (Select), Responsavel (Select), Status Final (Select: reconhecido/expirado/cancelado)
5. [Stats de Resumo] exibe no topo: Total Disparados, Total Reconhecidos, Total Expirados, Taxa de Reconhecimento %, Tempo Medio ate Reconhecimento
6. Usuario clica em uma linha para expandir o detalhe [Modal: "Detalhe do Alerta"]
7. Modal mostra: payload completo do alerta, historico de acoes (criado por quem, disparado quando, reconhecido por quem), logs de email (se enviado), mensagem de erro (se falhou)

### Tela(s) Representativa(s)

**Pagina:** FlagsPage
**Posicao:** Aba "Historico"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Flags e Alertas > Historico                                  |
|                                                               |
|  +-------+  +-------+  +-------+  +------+  +---------+      |
|  |Total  |  |Reconh.|  |Expirad|  |Taxa  |  |Tempo    |      |
|  |Dispar.|  |       |  |       |  |Reconh|  |Medio    |      |
|  | 142   |  |  128  |  |   14  |  |90.1% |  |3h 45m   |      |
|  +-------+  +-------+  +-------+  +------+  +---------+      |
|                                                               |
|  [Filtros]                                                    |
|  Periodo: [2026-03-15 -> 2026-04-15]                         |
|  Tipo: [Todos v]  Responsavel: [Todos v]                     |
|  Status: [Todos v]                                            |
|                                                               |
|  +----------+------+---------+---------+--------+----------+ |
|  |Data/Hora |Tipo  |Entidade |Respons. |Critic. |Status    | |
|  +----------+------+---------+---------+--------+----------+ |
|  |14/04 08h |Prazo |Ed. 2034 |J.Silva  |Critico |Reconh.   | |
|  |          |Recur.|         |         |        |(14/04 9h)| |
|  +----------+------+---------+---------+--------+----------+ |
|  |14/04 07h |Cont. |CT-42    |M.Costa  |Alto    |Expirado  | |
|  |          |Vence |         |         |        |          | |
|  +----------+------+---------+---------+--------+----------+ |
|                                                               |
|  [Botao: Exportar CSV]  [Botao: Exportar PDF]                |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stats agregados, Tabela de historico, Detalhe modal com timeline de acoes
- **Preenchidos (input):** Filtros (Periodo, Tipo, Responsavel, Status)
- **Obtidos (resposta do sistema):** Lista filtrada, Agregados recalculados, Exportacao CSV/PDF

---

## [UC-FL04] Cancelar/Silenciar Alerta

**RNs aplicadas:** RN-037 (audit log obrigatorio na acao)

**RF relacionado:** RF-047
**Ator:** Usuario (responsavel do alerta ou diretor)

### Pre-condicoes
1. Usuario autenticado
2. Alerta existe e esta em status `aguardando` ou `disparado_nao_reconhecido`
3. Usuario e o responsavel do alerta OU tem perfil de diretor/gestor

### Pos-condicoes
1. Alerta muda para status `silenciado` ou `cancelado`
2. Scheduler remove o job associado
3. `AuditoriaLog` recebe registro com usuario, motivo, timestamp

### Sequencia de Eventos

1. Usuario acessa [Aba: "Ativos"] da FlagsPage
2. Localiza o alerta e clica no [Botao: "..."] (menu de acoes) da linha
3. [Menu Dropdown] abre com opcoes: [Item: "Reconhecer"], [Item: "Silenciar ate..."], [Item: "Cancelar"]
4. Usuario seleciona [Item: "Silenciar ate..."]
5. [Modal: "Silenciar Alerta"] abre
6. [DatePicker: "Silenciar ate"] com minimo = amanha
7. [TextArea: "Motivo do silenciamento"] (obrigatorio, min 20 chars)
8. Usuario preenche e clica [Botao: "Confirmar Silenciamento"] (variant warning)
9. Sistema valida campos, atualiza alerta, grava em AuditoriaLog, remove job do scheduler
10. Modal fecha, linha desaparece da aba "Ativos" e aparece na aba [Aba: "Silenciados"]
11. Toast: "Alerta silenciado ate {data}. Voce pode reativa-lo a qualquer momento."

### Tela(s) Representativa(s)

#### Modal "Silenciar Alerta"

```
+---------------------------------------+
|  Silenciar Alerta               [X]  |
|                                       |
|  Alerta: Prazo de Recurso vence em 2h|
|  Edital: 2034                         |
|                                       |
|  [DatePicker: Silenciar ate]          |
|  [16/04/2026 v]                       |
|                                       |
|  [TextArea: Motivo (obrigatorio)]     |
|  O edital foi suspenso pelo orgao    |
|  conforme adendo publicado hoje.     |
|                                       |
|  [Botao: Cancelar]  [Botao: Confirmar|
|                      Silenciamento]  |
+---------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Dados do alerta (contexto), Confirmacao visual
- **Preenchidos (input):** Data de silenciamento, Motivo (obrigatorio min 20 chars)
- **Obtidos (resposta do sistema):** Persistencia, Remocao do scheduler, Audit log, Toast de confirmacao

### Excecoes
- **E1:** Motivo <20 chars - validacao frontend bloqueia submit com [Texto de erro: "Motivo deve ter pelo menos 20 caracteres"]
- **E2:** Usuario nao tem permissao - modal exibe erro "Voce nao pode silenciar este alerta. Apenas o responsavel ou um diretor pode faze-lo."

---

## [UC-FL05] Ver Agenda de Disparos (Calendario)

**RNs aplicadas:** RN-186 (cores por criticidade)

**RF relacionado:** RF-047, RF-052-01
**Ator:** Usuario (qualquer perfil)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos um alerta agendado para o futuro

### Pos-condicoes
1. Usuario visualiza calendario com todos os disparos previstos
2. Pode clicar em um disparo para ir ao detalhe do alerta

### Sequencia de Eventos

1. Usuario acessa FlagsPage e clica na [Aba: "Calendario"]
2. [Componente: CalendarioMensal] renderiza com o mes atual
3. Cada dia com disparos mostra [Badge: contador] com numero de eventos
4. Cor do badge segue criticidade mais alta do dia (vermelho > laranja > amarelo > azul)
5. Usuario clica em um dia - [Popover: "Disparos do dia"] abre com lista cronologica
6. [Item da lista] mostra: horario, tipo, entidade, criticidade
7. Usuario clica em um item - sistema navega para [Modal: "Detalhe do Alerta"] ou redireciona para a entidade
8. Toggle [Switch: "Visao"] permite alternar entre Mensal, Semanal, Diaria

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Flags > Calendario            [v Mensal] [Semanal] [Diaria] |
|                                                               |
|  <<  Abril 2026  >>                                          |
|                                                               |
|  +---+---+---+---+---+---+---+                               |
|  |Dom|Seg|Ter|Qua|Qui|Sex|Sab|                               |
|  +---+---+---+---+---+---+---+                               |
|  |   |   |   |1  |2  |3  |4  |                               |
|  |   |   |   |[2]|[1]|   |   |                               |
|  +---+---+---+---+---+---+---+                               |
|  |5  |6  |7  |8  |9  |10 |11 |                               |
|  |   |[5]|[3]|[8]|   |   |   |                               |
|  |   |(v)|(o)|(v)|   |   |   |                               |
|  +---+---+---+---+---+---+---+                               |
|  |12 |13 |14 |*15*|16|17 |18 |                               |
|  |   |   |[1]|[12] |[4]|  |   |                               |
|  |   |   |   |(v)  |(o)|  |   |                               |
|  +---+---+---+---+---+---+---+                               |
|                                                               |
|  * = hoje                                                     |
|  [N] = contador de disparos                                   |
|  (v) = vermelho (critico), (o) = laranja (alto)              |
|                                                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Grid do calendario, badges de contador, popover com disparos do dia
- **Preenchidos (input):** Seletor de visao (Mensal/Semanal/Diaria), navegacao entre meses
- **Obtidos (resposta do sistema):** Grid preenchido, popover dinamico, navegacao para detalhe

---

# FASE 2 — MONITORIA (MONITORAMENTOS AUTOMATICOS)

---

## [UC-MO01] Visualizar Dashboard de Monitoramentos Ativos

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-048 (Monitoria)
**Ator:** Usuario (Analista Comercial, Diretor)

### Pre-condicoes
1. Usuario autenticado
2. APScheduler ativo

### Pos-condicoes
1. Usuario visualiza lista de monitoramentos em background
2. Pode ver status de cada um (ativo, pausado, com erro)

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage (`/app/monitoria`) via menu lateral "Indicadores > Monitoria"
2. [Cabecalho: "Monitoramentos Automaticos"] exibe titulo da pagina
3. [Secao: Stat Cards — grid 4 colunas] mostra: Ativos (verde), Pausados (cinza), Com Erro (vermelho), Eventos/24h (azul)
4. Na [Aba: "Ativos"] (default), [Card: "Monitoramentos Ativos"] lista todos com status `ativo`
5. [Tabela: Monitoramentos] exibe: Nome, Fonte (PNCP/Brave/Portal), Criterio (termo, UFs, NCM), Periodicidade, Ultima Execucao, Proxima Execucao, Status, Acoes
6. Usuario pode clicar em uma linha para ver detalhes [Modal: "Detalhe do Monitoramento"]
7. Modal mostra: historico das ultimas 10 execucoes, total de eventos capturados, tempo medio de execucao, log de erros (se houver)
8. Botoes de acao: [Botao: "Pausar"], [Botao: "Executar Agora"], [Botao: "Editar"], [Botao: "Excluir"]

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Monitoramentos Automaticos                                   |
|                                                               |
|  +--------+  +---------+  +---------+  +---------+           |
|  |Ativos  |  |Pausados |  |Com Erro |  |Eventos  |           |
|  |   12   |  |    3    |  |    2    |  |24h: 47  |           |
|  |(verde) |  |(cinza)  |  |(vermelh)|  | (azul)  |           |
|  +--------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +------+  +----------+  +--------+  +--------+              |
|  |Ativos|  |Eventos   |  |Erros   |  |Analises|              |
|  |      |  |Capturados|  |        |  |Sob Dem.|              |
|  +------+  +----------+  +--------+  +--------+              |
|                                                               |
|  +------------+-------+------------+--------+--------+----+  |
|  |Nome        |Fonte  |Criterio    |Periodi.|Proxima |Sts |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |Reagentes SP|PNCP   |ncm=3822,   |4x/dia  |15/04   |Ativ|  |
|  |            |       |UF=SP,valor |        |18h     |    |  |
|  |            |       |100k-500k   |        |        |    |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |Editais RJ  |Brave  |termo=lab   |2x/dia  |15/04   |Ativ|  |
|  |            |       |UF=RJ       |        |20h     |    |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |TCE-MG      |Portal |termo=      |1x/dia  |16/04   |Erro|  |
|  |            |TCE-MG |hematologia |        |06h     |(!) |  |
|  +------------+-------+------------+--------+--------+----+  |
|                                                               |
|                                       [Floating Chatbox IA]  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards, Tabela de monitoramentos, Detalhe modal com historico
- **Preenchidos (input):** Nenhum nesta tela (criacao e via chatbox no UC-MO02)
- **Obtidos (resposta do sistema):** Lista de monitoramentos, status real-time, acoes via botoes

### Excecoes
- **E1:** Nenhum monitoramento cadastrado - tabela mostra estado vazio com CTA: "Peca a IA para criar seu primeiro monitoramento via chatbox"

---

## [UC-MO02] Criar Monitoramento PNCP via IA

**RNs aplicadas:** RN-084 (cooldown 60s DeepSeek), RN-132 (audit de invocacoes), RN-037 (audit log)

**RF relacionado:** RF-048, RF-054 (Interface Hibrida)
**Ator:** Usuario (qualquer perfil com permissao)

### Pre-condicoes
1. Usuario autenticado
2. Tool `tool_configurar_monitoramento` registrada no catalogo DeepSeek
3. APScheduler ativo

### Pos-condicoes
1. Monitoramento criado em `MonitoramentoConfig` com todos os parametros
2. Job registrado no APScheduler com periodicidade configurada
3. Log de invocacao gravado (RN-132)
4. Primeira execucao disparada imediatamente OU na proxima janela programada

### Sequencia de Eventos

1. Usuario abre o [Floating Chat]
2. Digita: "Cria um monitoramento do PNCP para reagentes de hematologia em SP com valor entre 100k e 500k, roda 4 vezes ao dia"
3. Clica [Botao: Enviar]
4. Sistema verifica cooldown (RN-084)
5. DeepSeek processa e emite tool_call para `tool_configurar_monitoramento` com: `{fonte: "PNCP", termo: "hematologia reagentes", ncm_prefix: "3822", uf: "SP", valor_min: 100000, valor_max: 500000, periodicidade: "6h"}`
6. Tool executa: cria registro em `MonitoramentoConfig`, agenda job APScheduler com intervalo de 6h
7. Tool registra em `AuditoriaLog` (RN-132)
8. Tool retorna sucesso para DeepSeek
9. IA responde: "Criado! Vou olhar o PNCP a cada 6h atras de reagentes de hematologia em SP no intervalo de 100k a 500k. Primeira execucao agora, depois 18h, meia-noite, 6h..."
10. Chatbox exibe a mensagem
11. Usuario navega para MonitoriaPage > Aba "Ativos" e vê o novo monitoramento na tabela

### Tela(s) Representativa(s)

Chatbox ja descrito em UC-FL02.

**Elementos acessiveis:**
- **Acessados (leitura):** Historico da conversa, confirmacao da IA, link para monitoramento criado
- **Preenchidos (input):** Mensagem em linguagem natural
- **Obtidos (resposta do sistema):** Monitoramento persistido, job agendado, resposta natural

### Excecoes
- **E1:** Parametros incompletos - IA pede complemento: "Faltou a UF ou regiao. Pode me dizer onde quer que eu olhe?"
- **E2:** Monitoramento duplicado (mesmo criterio) - IA avisa: "Voce ja tem um monitoramento parecido ativo. Quer que eu atualize ele ou crie um novo?"

---

## [UC-MO03] Analisar Documentos da Empresa (sob demanda)

**RNs aplicadas:** RN-084 (cooldown), RN-132 (audit invocacao), RN-008 (status certidao), RN-031 (bloqueio certidao vencida), RN-039 (transicao automatica)

**RF relacionado:** RF-004 (Documentos da Empresa), RF-048, RF-001 (Cadastro Empresa), RF-002 (Gestao Certidoes)
**Ator:** Usuario (Analista, Gestor de Conformidade)

### Pre-condicoes
1. Usuario autenticado
2. Empresa possui documentos cadastrados (contrato social, certidoes, alvaras, licencas ANVISA)
3. Tool `tool_analisar_documentos_empresa` registrada

### Pos-condicoes
1. Analise realizada e resultado gravado em `AnaliseDocumentosEmpresa`
2. Inconsistencias detectadas geram alertas automaticos (UC-FL02)
3. Log de invocacao em `AuditoriaLog`

### Sequencia de Eventos

1. Usuario abre o Floating Chat (pode estar em qualquer pagina)
2. Digita: "Analisa os documentos da minha empresa e me diz se esta tudo coerente"
3. Clica Enviar
4. Sistema verifica cooldown (RN-084)
5. DeepSeek emite tool_call `tool_analisar_documentos_empresa` com `empresa_id=current_user.empresa_id`
6. Tool carrega: todos os documentos da empresa, todas as certidoes ativas/vencidas, dados cadastrais basicos
7. Tool envia ao DeepSeek (chamada aninhada) um prompt de analise: "Verifique coerencia entre os documentos abaixo. Procure: razao social divergente, datas fora de ordem, certidao vencida, CNPJ inconsistente, campos ausentes, alvaras vencidos, licencas ANVISA vencidas"
8. DeepSeek retorna JSON estruturado: `{inconsistencias: [{tipo: "razao_social_divergente", documentos: [...], gravidade: "alta"}, ...], resumo: "...", alertas_sugeridos: [...]}`
9. Tool persiste resultado em `AnaliseDocumentosEmpresa`
10. Para cada alerta sugerido com gravidade >= alta, tool cria entrada em `AlertaFlag` automaticamente
11. Para cada certidao vencida, tool chama `tool_configurar_alertas` aninhada
12. Tool retorna para DeepSeek original
13. IA gera resposta em PT-BR: "Analisei os 12 documentos da sua empresa. Encontrei 3 problemas: 1) A razao social no contrato social diverge da cadastrada no sistema, 2) A certidao FGTS vence em 5 dias, 3) A licenca da ANVISA 123456 venceu em 10/04. Ja criei 2 alertas criticos para voce. Quer ver o relatorio completo?"
14. Chatbox exibe mensagem com [Botao: "Ver relatorio completo"] que leva ao [Modal: "Analise de Documentos"]
15. Modal mostra lista completa de inconsistencias, agrupadas por gravidade

### Tela(s) Representativa(s)

#### Modal "Analise de Documentos"

```
+---------------------------------------------------------------+
|  Analise de Documentos da Empresa              [X]            |
|                                                               |
|  Empresa: CH Hospitalar LTDA                                 |
|  CNPJ: 12.345.678/0001-90                                    |
|  Analisado em: 15/04/2026 14:32                              |
|  Documentos analisados: 12                                    |
|  Inconsistencias encontradas: 3                              |
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] ALTA - Razao Social Divergente                       ||
|  |     Contrato Social: "CH Hospitalar LTDA - EPP"          ||
|  |     Cadastro Sistema: "CH Hospitalar LTDA"               ||
|  |     [Botao: Corrigir Cadastro]                           ||
|  +-----------------------------------------------------------+|
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] CRITICA - Certidao FGTS vence em 5 dias              ||
|  |     Validade: 20/04/2026                                 ||
|  |     Alerta automatico criado [ID: 123]                   ||
|  |     [Botao: Ver Alerta]                                  ||
|  +-----------------------------------------------------------+|
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] CRITICA - Licenca ANVISA 123456 VENCIDA              ||
|  |     Vencida em: 10/04/2026 (ha 5 dias)                   ||
|  |     Alerta automatico criado [ID: 124]                   ||
|  |     BLOQUEIA PARTICIPACAO EM EDITAIS (RN-031)            ||
|  |     [Botao: Renovar Licenca]                             ||
|  +-----------------------------------------------------------+|
|                                                               |
|  [Botao: Exportar PDF]  [Botao: Fechar]                       |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Metadados da analise, lista de inconsistencias com gravidade, alertas criados automaticamente
- **Preenchidos (input):** Comando em linguagem natural no chatbox
- **Obtidos (resposta do sistema):** Analise LLM estruturada, alertas criados automaticamente, modal detalhado, possibilidade de exportar PDF

### Excecoes
- **E1:** Empresa sem documentos - IA responde: "Sua empresa nao tem documentos cadastrados ainda. Peca para cadastrar em Empresa > Documentos"
- **E2:** Documentos muito grandes para LLM - tool faz chunking e informa: "Sua empresa tem muitos documentos (45 arquivos). Estou analisando em lotes, isso vai levar uns 2 minutos..."

---

## [UC-MO04] Verificar Pendencias PNCP de Edital (sob demanda)

**RNs aplicadas:** RN-084 (cooldown), RN-132 (audit invocacao), RN-037 (audit log)

**RF relacionado:** RF-048, RF-019 (Captacao de Editais)
**Ator:** Usuario (Analista)

### Pre-condicoes
1. Usuario autenticado
2. Edital existe no banco local
3. Tool `tool_verificar_pendencias_pncp` registrada
4. Conexao com API do PNCP disponivel

### Pos-condicoes
1. Consulta PNCP realizada
2. Diferencas entre estado local vs PNCP detectadas e registradas
3. Se houver adendo/prorrogacao/cancelamento, alerta criado automaticamente

### Sequencia de Eventos

1. Usuario abre Floating Chat
2. Digita: "Verifica se o edital 2034 tem pendencias ou atualizacoes no PNCP"
3. Clica Enviar
4. DeepSeek emite tool_call `tool_verificar_pendencias_pncp` com `edital_id=2034`
5. Tool consulta PNCP via API usando numero_controle_pncp do edital local
6. Tool compara campo-a-campo: objeto, data_abertura, valor_estimado, status, termo_referencia_hash
7. Para cada diferenca, registra em `PendenciaPNCP` com: campo, valor_local, valor_pncp, data_deteccao
8. Se diferenca for "adendo publicado" ou "prorrogacao" ou "cancelamento" ou "suspensao", tool chama `tool_configurar_alertas` aninhada com criticidade `alto`
9. Tool registra em `AuditoriaLog`
10. Tool retorna JSON com diferencas
11. IA responde: "Verifiquei o edital 2034 no PNCP. Encontrei 2 mudancas: 1) O orgao publicou um adendo em 14/04 alterando o termo de referencia (tem anexo novo), 2) A data de abertura foi prorrogada de 18/04 para 25/04. Ja criei um alerta alto para voce."

### Tela(s) Representativa(s)

Chatbox com resposta estruturada contendo links para os detalhes.

**Elementos acessiveis:**
- **Acessados (leitura):** Resposta da IA com sumario de pendencias, links para entidades afetadas
- **Preenchidos (input):** Comando natural
- **Obtidos (resposta do sistema):** Lista de pendencias, alertas automaticos, registro em PendenciaPNCP

### Excecoes
- **E1:** Edital nao encontrado no PNCP - IA responde: "Esse edital nao consta mais no PNCP. Pode ter sido removido ou o numero_controle esta errado"
- **E2:** API PNCP indisponivel - IA responde: "O PNCP esta indisponivel agora. Vou tentar novamente em 10 minutos automaticamente. Se urgente, tenta via web"

---

## [UC-MO05] Ver Eventos Capturados por Monitoramento

**RNs aplicadas:** RN-037 (audit log de consulta)

**RF relacionado:** RF-048
**Ator:** Usuario (Analista)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos um monitoramento ja executou e capturou eventos

### Pos-condicoes
1. Usuario visualiza lista de eventos capturados
2. Pode navegar para a entidade descoberta

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage > [Aba: "Eventos Capturados"]
2. [Card: "Eventos das ultimas 24h"] exibe tabela
3. [Tabela: Eventos] mostra: Data/Hora Captura, Monitoramento de Origem, Tipo de Evento (edital_novo/edital_alterado/ata_nova/pregao_reaberto), Entidade, Acao Sugerida pela IA, Acao Tomada
4. [Filtros]: Periodo, Monitoramento, Tipo
5. Usuario clica em um evento - [Modal: "Detalhe do Evento"] abre
6. Modal mostra: dados completos da entidade, diff vs estado anterior (se alteracao), botao para abrir na tela apropriada

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Monitoria > Eventos Capturados                               |
|                                                               |
|  Periodo: [Ultimas 24h v]  Tipo: [Todos v]                   |
|                                                               |
|  +-----------+-----------+------------+-------------+------+ |
|  |Data/Hora  |Monit.     |Tipo        |Entidade     |Acao  | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 14:20|Reagentes  |edital_novo |Ed 2089      |[Ver] | |
|  |           |SP         |            |TCE-SP R$250k|      | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 12:15|Editais RJ |edital_novo |Ed 2088      |[Ver] | |
|  |           |           |            |HUPE R$180k  |      | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 08:00|Reagentes  |edital_alte-|Ed 2034      |[Ver] | |
|  |           |SP         |rado (adend)|UFRJ         |      | |
|  +-----------+-----------+------------+-------------+------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Tabela de eventos, detalhes modais, diffs
- **Preenchidos (input):** Filtros
- **Obtidos (resposta do sistema):** Lista paginada, navegacao para entidade

---

## [UC-MO06] Tratar Monitoramentos com Erro

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-048
**Ator:** Usuario (Administrador, Gestor)

### Pre-condicoes
1. Usuario autenticado com perfil admin
2. Existe pelo menos 1 monitoramento com status `erro`

### Pos-condicoes
1. Usuario tomou acao corretiva (reativar, editar, excluir)
2. Acao registrada em AuditoriaLog

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage > [Aba: "Erros"]
2. [Card: "Monitoramentos com Erro"] lista todos com status `erro`
3. [Tabela] mostra: Nome, Fonte, Ultima Execucao com Sucesso, Tentativas Falhas Consecutivas, Mensagem de Erro, Acao Sugerida
4. Usuario clica em uma linha - [Modal: "Diagnostico do Erro"] abre
5. Modal mostra: stack trace ultima execucao, payload enviado, resposta HTTP (se aplicavel), diagnostico da IA ("A fonte X mudou o schema. Monitoramento precisa ser recriado")
6. Botoes: [Botao: "Executar Manualmente"], [Botao: "Editar Monitoramento"], [Botao: "Reativar"], [Botao: "Excluir"]
7. Usuario clica [Botao: "Executar Manualmente"] para tentar uma vez
8. Sistema executa, se der certo muda status para `ativo`, se falhar atualiza mensagem de erro

### Tela(s) Representativa(s)

#### Modal "Diagnostico do Erro"

```
+---------------------------------------------------------------+
|  Diagnostico: TCE-MG                            [X]           |
|                                                               |
|  Status: ERRO                                                 |
|  Ultima Execucao com Sucesso: 10/04/2026 06:00                |
|  Tentativas Falhas Consecutivas: 12                           |
|  Primeira Falha: 11/04/2026 06:00                             |
|                                                               |
|  [Secao: Ultima Mensagem de Erro]                             |
|  +-----------------------------------------------------------+|
|  | HTTP 404 Not Found                                        ||
|  | URL: https://tce-mg.gov.br/licitacoes/listar               ||
|  | Resposta: "The requested URL was not found"               ||
|  +-----------------------------------------------------------+|
|                                                               |
|  [Secao: Diagnostico IA]                                      |
|  O portal TCE-MG parece ter mudado o endereco da listagem    |
|  de licitacoes. Recomendo: 1) verificar manualmente o novo   |
|  endereco, 2) editar o monitoramento com a URL atualizada,   |
|  3) considerar usar busca PNCP em vez de portal direto.      |
|                                                               |
|  [Botao: Executar Manualmente]                                |
|  [Botao: Editar Monitoramento]                                |
|  [Botao: Reativar]                                            |
|  [Botao: Excluir Monitoramento]                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stack trace, diagnostico IA, historico de falhas
- **Preenchidos (input):** Escolha da acao corretiva
- **Obtidos (resposta do sistema):** Resultado da acao, mudanca de status

---

# FASE 3 — AUDITORIA UNIVERSAL

---

## [UC-AU01] Consultar Registros de Auditoria

**RNs aplicadas:** RN-037 (audit log — inclusive do proprio ato de consultar)

**RF relacionado:** RF-056 (Governanca e Auditoria), RF-054
**Ator:** Usuario (Auditor Interno, Diretor, Administrador)

### Pre-condicoes
1. Usuario autenticado com perfil que permite consultar auditoria (auditor/diretor/admin)
2. Middleware de auditoria ja populou `auditoria_log` com eventos recentes

### Pos-condicoes
1. Usuario visualiza registros conforme filtros aplicados
2. A propria consulta e registrada em `AuditoriaLog` com flag `consulta_auditoria=true`

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage (`/app/auditoria`) via menu lateral "Governanca > Auditoria"
2. [Cabecalho: "Registros de Auditoria"] exibe pagina
3. [Secao: Filtros — horizontal] com: Entidade (Select multi), Usuario (Select), Operacao (Select: CREATE/UPDATE/DELETE/STATE_TRANSITION/LOGIN/LOGOUT), Periodo (DatePicker), ID da Entidade (TextInput opcional)
4. [Aba: "Registros"] (default) exibe tabela paginada
5. [Tabela: Registros] mostra: Timestamp, Usuario, IP, Entidade, ID, Operacao, Resumo da Mudanca
6. Usuario clica em uma linha - [Modal: "Detalhe do Registro"] abre
7. Modal mostra: timestamp ISO, usuario completo, IP, user_agent, entidade, operacao, estado_anterior (JSON collapsible), estado_novo (JSON collapsible), diff visual (campos em vermelho/verde), contexto adicional
8. Usuario pode clicar [Botao: "Copiar JSON"] para copiar o registro bruto

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Registros de Auditoria                                       |
|                                                               |
|  [Filtros]                                                    |
|  Entidade: [Edital, Proposta v]   Usuario: [Todos v]         |
|  Operacao: [Todos v]   Periodo: [ultimos 7 dias v]           |
|  ID: [____________]  [Botao: Aplicar Filtros]                 |
|                                                               |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |Times-|Usuario    |IP         |Entid. |ID    |Op. |Resumo | |
|  |tamp  |           |           |       |      |    |       | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |15/04 |joao@ch.com|192.168.1.4|Edital |2034  |UPD |status:| |
|  |14:32 |           |           |       |      |    |em_pro-| |
|  |      |           |           |       |      |    |posta  | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |15/04 |maria@ch.co|10.0.0.55  |Param- |1     |UPD |peso_  | |
|  |11:15 |           |           |Score  |      |    |tec 0.4| |
|  |      |           |           |       |      |    |-> 0.6 | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|                                                               |
|  [Paginacao: << 1 2 3 ... >>]  [Botao: Exportar CSV]         |
+---------------------------------------------------------------+
```

#### Modal "Detalhe do Registro"

```
+---------------------------------------------------------------+
|  Detalhe do Registro de Auditoria              [X]            |
|                                                               |
|  Timestamp: 2026-04-15T11:15:32.442Z                          |
|  Usuario: maria@ch.com (id=7, role=diretor)                   |
|  IP: 10.0.0.55  User-Agent: Mozilla/5.0...                    |
|  Entidade: ParametroScore                                     |
|  ID: 1                                                        |
|  Operacao: UPDATE                                             |
|                                                               |
|  [Secao: Estado Anterior] [v expandir]                        |
|  {                                                            |
|    "peso_tecnico": 0.4,                                      |
|    "peso_juridico": 0.2,                                     |
|    ...                                                        |
|  }                                                            |
|                                                               |
|  [Secao: Estado Novo] [v expandir]                            |
|  {                                                            |
|    "peso_tecnico": 0.6,   <- alterado                        |
|    "peso_juridico": 0.2,                                     |
|    ...                                                        |
|  }                                                            |
|                                                               |
|  [Secao: Diff Visual]                                         |
|  - peso_tecnico: 0.4                                          |
|  + peso_tecnico: 0.6                                          |
|                                                               |
|  [Secao: Contexto]                                            |
|  Alerta de Auditoria Sensivel foi disparado                  |
|  (ID: alerta_89)                                              |
|                                                               |
|  [Botao: Copiar JSON]  [Botao: Fechar]                        |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Tabela paginada de registros, detalhes completos em modal, diffs
- **Preenchidos (input):** Filtros (Entidade, Usuario, Operacao, Periodo, ID)
- **Obtidos (resposta do sistema):** Lista filtrada, detalhes, exportacao CSV

### Excecoes
- **E1:** Usuario sem permissao - pagina mostra erro 403 "Voce nao tem permissao para acessar Auditoria. Entre em contato com o administrador"
- **E2:** Filtro retorna 0 resultados - tabela exibe estado vazio "Nenhum registro encontrado para os filtros aplicados"
- **E3:** Registro de auditoria com estado_anterior nulo (operacao CREATE) - modal oculta a secao "Estado Anterior"

---

## [UC-AU02] Investigar Alteracoes Sensiveis em Parametrizacoes

**RNs aplicadas:** RN-037, RN-080 (alteracao em score exige justificativa + versao), RN-132

**RF relacionado:** RF-056, RF-018 (ParametroScore)
**Ator:** Usuario (Diretor, Auditor)

### Pre-condicoes
1. Usuario autenticado com perfil diretor/auditor
2. Pelo menos 1 alteracao sensivel registrada (alteracao em ParametroScore, margem_minima, pesos de aderencia, parametros de NCM, parametros de empenho)

### Pos-condicoes
1. Usuario visualiza cadeia temporal das mudancas sensiveis
2. Pode identificar padroes (ex: mesma pessoa alterando varias vezes)

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage > [Aba: "Sensiveis"]
2. [Card: "Alteracoes Sensiveis"] exibe lista filtrada apenas por operacoes em entidades marcadas como sensiveis
3. [Tabela: Alteracoes Sensiveis] mostra: Timestamp, Usuario, Entidade, Campo Alterado, Valor Antes, Valor Depois, Justificativa, Alerta Disparado
4. Cada linha tem indicador visual se havia alerta ("[Badge: Alerta disparado]")
5. Usuario clica em [Botao: "Timeline do Score"] para ver a evolucao de pesos de um ParametroScore especifico
6. [Modal: "Timeline ParametroScore"] abre com grafico de linha mostrando valor de cada peso ao longo do tempo, marcando cada alteracao com o usuario responsavel

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Auditoria > Alteracoes Sensiveis                             |
|                                                               |
|  +--------+  +---------+  +---------+  +---------+           |
|  |Total   |  |Ultimos  |  |Usuarios |  |Alertas  |           |
|  |Sensiv. |  |7 dias   |  |Distinto |  |Disparad |           |
|  |  47    |  |   12    |  |    4    |  |    12   |           |
|  +--------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |Times-|Usuario    |Entid. |Campo   |Ant.|Dep. |Justif.|    |
|  |tamp  |           |       |        |    |     |       |    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |15/04 |maria      |Param- |peso_   |0.4 |0.6  |Reve-  |    |
|  |11:15 |@ch.com    |Score  |tecnico |    |     |r apos |    |
|  |      |           |       |        |    |     |perda..|    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |14/04 |joao       |Param- |margem_ |15% |12%  |Compe- |    |
|  |16:00 |@ch.com    |Score  |minima  |    |     |titivi.|    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|                                                               |
|  [Botao: Timeline ParametroScore]                             |
|  [Botao: Exportar Relatorio Sensivel]                         |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stats agregados, tabela de alteracoes sensiveis, timeline grafica
- **Preenchidos (input):** Filtros de periodo, entidade, usuario
- **Obtidos (resposta do sistema):** Lista filtrada, grafico de evolucao, exportacao

### Excecoes
- **E1:** Alteracao sem justificativa (RN-080 violada) - linha destacada em vermelho com badge "JUSTIFICATIVA AUSENTE"

---

## [UC-AU03] Exportar Pacote de Compliance

**RNs aplicadas:** RN-037 (audit log do proprio ato de exportar), LGPD (retencao e mascaramento)

**RF relacionado:** RF-056
**Ator:** Usuario (Administrador, Auditor Externo credenciado)

### Pre-condicoes
1. Usuario autenticado com perfil admin
2. Periodo selecionado tem registros de auditoria

### Pos-condicoes
1. Pacote PDF/CSV gerado, versionado e assinado (timestamp + hash SHA-256)
2. Arquivo salvo em storage temporario
3. Email enviado ao solicitante via SMTP com link de download (UC-SM03)
4. Registro da exportacao gravado em `AuditoriaLog`

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage > [Aba: "Exportar"]
2. [Formulario: "Gerar Pacote de Compliance"] com campos: [DatePicker: "Periodo inicio"], [DatePicker: "Periodo fim"], [Select multi: "Entidades incluir"], [Select multi: "Usuarios incluir"], [Select: "Formato"] (PDF/CSV/ambos), [Checkbox: "Mascarar dados pessoais (LGPD)"] (default true), [Email: "Enviar para"] (default = usuario atual)
3. Usuario preenche e clica [Botao: "Gerar Pacote"]
4. Backend inicia job assincrono (pode levar ate alguns minutos para periodos longos)
5. Tela muda para [Card: "Pacote em Geracao"] com barra de progresso
6. Backend coleta registros, aplica mascaramento LGPD (nomes, emails, IPs), gera PDF com cabecalho/rodape/hash
7. Backend grava hash + metadados em `PacoteCompliance` e salva arquivo em storage
8. Backend envia email ao solicitante com link de download (valido por 7 dias)
9. Tela atualiza para [Card: "Pacote Gerado"] com botao [Botao: "Download"] direto
10. [Audit log] registra: quem exportou, periodo, filtros aplicados, hash do arquivo

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Auditoria > Exportar Pacote de Compliance                    |
|                                                               |
|  [Formulario]                                                 |
|  Periodo inicio: [01/04/2026 v]                              |
|  Periodo fim:    [15/04/2026 v]                              |
|                                                               |
|  Entidades:     [Edital, Proposta, Contrato v]              |
|  Usuarios:      [Todos v]                                    |
|  Formato:       (o) PDF  ( ) CSV  ( ) Ambos                 |
|                                                               |
|  [X] Mascarar dados pessoais (LGPD)                           |
|                                                               |
|  Enviar para: [maria@ch.com               ]                  |
|                                                               |
|  [Botao: Gerar Pacote]                                        |
|                                                               |
|  [Historico de Exportacoes]                                   |
|  +-----------+---------+-------+---------+----------+------+ |
|  |Data       |Solicit. |Formato|Hash     |Expira    |Acao  | |
|  +-----------+---------+-------+---------+----------+------+ |
|  |14/04 16:00|maria    |PDF    |a3f8...  |21/04     |[Down]| |
|  |10/04 09:30|joao     |CSV    |b7c2...  |Expirado  |--    | |
|  +-----------+---------+-------+---------+----------+------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico de exportacoes anteriores com metadados
- **Preenchidos (input):** Periodo, Entidades, Usuarios, Formato, Flag LGPD, Email destino
- **Obtidos (resposta do sistema):** Job assincrono, notificacao SMTP, arquivo assinado disponivel para download

### Excecoes
- **E1:** Periodo muito grande (>90 dias) - sistema avisa "Periodo maior que 90 dias pode demorar. Quer continuar?" e exige confirmacao
- **E2:** Falha na geracao - exibe erro com botao "Tentar novamente" e loga em AuditoriaLog com flag `erro_exportacao=true`
- **E3:** Email nao enviado (fila SMTP) - pacote fica disponivel direto na tela e badge amarelo "Email pendente, download direto disponivel"

---

# FASE 4 — NOTIFICACOES SMTP PRODUCAO

---

## [UC-SM01] Configurar Servidor SMTP

**RNs aplicadas:** RN-037 (audit log), RN-187 (canais escalonados)

**RF relacionado:** RF-052-01, RNF-003 (Observabilidade)
**Ator:** Usuario (Administrador)

### Pre-condicoes
1. Usuario autenticado como administrador
2. Credenciais SMTP validas disponiveis (Gmail/M365/SendGrid/SES/proprio)

### Pos-condicoes
1. Configuracao persistida em `ConfiguracaoSMTP` com senha criptografada
2. Conexao testada com envio de email de verificacao
3. Sistema em modo SMTP_LIVE_MODE=true
4. Registro em AuditoriaLog

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage (`/app/notificacoes`) via menu "Administracao > Notificacoes"
2. Clica na [Aba: "Servidor"]
3. [Card: "Configuracao SMTP"] exibe formulario
4. Usuario preenche: [TextInput: "Host"] (ex: smtp.gmail.com), [NumericInput: "Porta"] (ex: 587), [Select: "Seguranca"] (TLS/SSL/Nenhuma), [TextInput: "Usuario"], [PasswordInput: "Senha"], [TextInput: "Remetente padrao"] (ex: notificacoes@empresa.com), [TextInput: "Nome do remetente"]
5. Usuario pode adicionar remetentes alternativos por tipo de alerta via [Botao: "+ Adicionar Remetente Alternativo"]: [Select: "Tipo de alerta"], [TextInput: "Remetente alternativo"]
6. Clica [Botao: "Testar Conexao"]
7. Sistema tenta conectar + enviar email de verificacao para o proprio remetente
8. Se sucesso: [Toast: "Email de verificacao enviado. Confira a caixa de entrada"]
9. Se falha: [Toast erro: "Falha: {mensagem_detalhada}"]
10. Usuario clica [Botao: "Salvar Configuracao"] apos teste OK
11. Backend criptografa senha (AES-256), persiste, muda flag `SMTP_LIVE_MODE=true`
12. [Audit log] registra com usuario, timestamp, IP (senha nunca e logada)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Notificacoes > Servidor SMTP                                 |
|                                                               |
|  [Card: Configuracao SMTP]                                    |
|                                                               |
|  Host:     [smtp.gmail.com___________]                       |
|  Porta:    [587_____]                                         |
|  Seguranca: (o) TLS  ( ) SSL  ( ) Nenhuma                    |
|  Usuario:  [notif@empresa.com________]                       |
|  Senha:    [*********_________________]                      |
|  Remetente padrao: [notif@empresa.com]                       |
|  Nome: [Facilitia Notificacoes__________]                    |
|                                                               |
|  [Card: Remetentes Alternativos]                              |
|  +----------------------+---------------------------+       | |
|  |Tipo de Alerta        |Remetente                  |       | |
|  +----------------------+---------------------------+       | |
|  |prazo_recurso         |juridico@empresa.com       |       | |
|  |contrato_vencimento   |comercial@empresa.com      |       | |
|  +----------------------+---------------------------+       | |
|  [Botao: + Adicionar]                                         |
|                                                               |
|  [Botao: Testar Conexao]  [Botao: Salvar Configuracao]       |
|                                                               |
|  Status: ✓ Conectado (ultima verificacao: 15/04 14:00)       |
|  Modo: SMTP_LIVE_MODE=true                                    |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Status de conexao, ultimo teste OK, lista de remetentes alternativos
- **Preenchidos (input):** Host, Porta, Seguranca, Usuario, Senha, Remetente padrao, Nome, Remetentes alternativos por tipo
- **Obtidos (resposta do sistema):** Teste de conexao, envio de email de verificacao, persistencia criptografada

### Excecoes
- **E1:** Credenciais invalidas - [Toast: "Falha de autenticacao. Verifique usuario e senha"]
- **E2:** Porta bloqueada por firewall - [Toast: "Timeout ao conectar. Porta pode estar bloqueada"]
- **E3:** Servidor SMTP nao aceita STARTTLS - [Toast: "Servidor nao suporta TLS. Tente SSL ou Nenhuma"]

---

## [UC-SM02] Gerenciar Templates de Email

**RNs aplicadas:** RN-037 (audit log de edicao de template)

**RF relacionado:** RF-052-01, RF-056
**Ator:** Usuario (Administrador, Comunicacao)

### Pre-condicoes
1. Usuario autenticado com perfil admin/comunicacao
2. Configuracao SMTP ativa (UC-SM01 concluido)

### Pos-condicoes
1. Templates persistidos em `TemplateEmail` com versionamento
2. Versao anterior preservada (historico)

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage > [Aba: "Templates"]
2. [Card: "Templates de Email"] exibe lista dos 10 templates pre-cadastrados (1 por tipo de alerta)
3. [Tabela: Templates] mostra: Tipo, Nome, Ultima Edicao, Versao, Acoes
4. Usuario clica [Botao: "Editar"] em um template
5. [Modal Fullscreen: "Editor de Template"] abre
6. Editor tem 3 paineis:
   - Esquerda: [Editor WYSIWYG: "Corpo HTML"] com toolbar (negrito, italico, link, imagem)
   - Centro: [TextArea: "Variaveis disponiveis"] com lista: `{{ nome_usuario }}`, `{{ numero_edital }}`, `{{ data_limite }}`, `{{ link_sistema }}`, `{{ criticidade }}`, etc
   - Direita: [Preview: "Visualizacao em tempo real"] renderiza com valores de exemplo
7. Usuario edita o HTML usando as variaveis
8. [TextInput: "Assunto"] com variaveis tambem
9. Usuario clica [Botao: "Salvar Nova Versao"]
10. Sistema cria nova entrada em `TemplateEmail` com `versao=N+1`, mantem a anterior como `ativo=false`, define a nova como `ativo=true`
11. Registra em AuditoriaLog com diff antes/depois
12. [Toast: "Template salvo como versao {N+1}"]

### Tela(s) Representativa(s)

#### Modal Fullscreen "Editor de Template"

```
+---------------------------------------------------------------+
|  Editor de Template: Prazo de Recurso        [X]              |
|                                                               |
|  Versao atual: v3  |  Criado por: joao@ch.com                |
|                                                               |
|  Assunto: [Alerta: Prazo de recurso vence em {{horas}}h_]    |
|                                                               |
|  +---------------------+------------+--------------------+   |
|  | Corpo HTML          |Variaveis   |Preview             |   |
|  +---------------------+------------+--------------------+   |
|  | [B][I][Link][Img]   |{{nome_usu-}|                    |   |
|  |                     |ario}}      |Ola Joao,           |   |
|  | Ola {{nome_usuario}}|{{numero_   |                    |   |
|  | ,                   |edital}}    |O prazo do recurso  |   |
|  |                     |{{data_limi}|do edital 2034      |   |
|  | O prazo do recurso  |te}}        |vence em 2 horas.   |   |
|  | do edital           |{{horas}}   |                    |   |
|  | {{numero_edital}}   |{{link_sis-}|Acesse o sistema    |   |
|  | vence em {{horas}}  |tema}}      |para fazer o envio: |   |
|  | horas.              |{{criticid-}|                    |   |
|  |                     |ade}}       |[Acessar Sistema]   |   |
|  | Acesse o sistema    |            |                    |   |
|  | para fazer o envio: |            |                    |   |
|  |                     |            |                    |   |
|  | [{{link_sistema}}]  |            |                    |   |
|  +---------------------+------------+--------------------+   |
|                                                               |
|  [Botao: Salvar Nova Versao]  [Botao: Historico]  [Botao:    |
|                                                   Descartar]|
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico de versoes, lista de variaveis disponiveis, preview em tempo real
- **Preenchidos (input):** HTML do corpo, Assunto, todas via editor WYSIWYG
- **Obtidos (resposta do sistema):** Nova versao persistida, preview renderizado, audit log

---

## [UC-SM03] Consultar Fila de Envio e Reenviar Manualmente

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-052-01, RNF-003
**Ator:** Usuario (Administrador, Suporte)

### Pre-condicoes
1. Usuario autenticado com perfil admin/suporte
2. SMTP configurado e ativo

### Pos-condicoes
1. Usuario visualiza fila de envio em tempo real
2. Pode reenviar emails que falharam

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage > [Aba: "Fila"]
2. [Secao: Stat Cards] mostra: Pendentes (azul), Enviados hoje (verde), Falhas hoje (vermelho), Taxa de sucesso % (amarelo)
3. [Tabela: Fila de Envio] exibe: Data/Hora Enfileiramento, Destinatario, Tipo, Assunto, Status (pendente/enviando/enviado/falhou/reagendado), Tentativas, Ultima Mensagem, Acoes
4. [Filtros]: Status, Destinatario, Periodo
5. Usuario localiza um email com status "falhou" e clica [Botao: "Reenviar"] na coluna Acoes
6. [Modal de confirmacao: "Reenviar email?"] abre mostrando preview do email
7. Usuario confirma, backend reenfileira o email com tentativa 1 zerada
8. [Toast: "Email reenfileirado. Proximo envio em ~10s"]
9. Usuario pode clicar [Botao: "Ver Detalhes"] em qualquer email para ver [Modal: "Detalhe do Envio"] com payload HTML, headers, resposta do servidor SMTP, stack trace (se erro)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Notificacoes > Fila de Envio                                 |
|                                                               |
|  +--------+  +--------+  +--------+  +--------+              |
|  |Pendent.|  |Enviados|  |Falhas  |  |Taxa    |              |
|  |   8    |  | hoje   |  | hoje   |  |sucesso |              |
|  |(azul)  |  |  142   |  |   3    |  |97.9%   |              |
|  +--------+  +--------+  +--------+  +--------+              |
|                                                               |
|  Status: [Todos v]  Destinat.: [___]  Periodo: [hoje v]     |
|                                                               |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |Data  |Destinat.  |Tipo  |Assunto  |Status  |Tent|Acao   | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |15:00 |joao@ch.com|prazo |Alerta:..|Enviado | 1  |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:55 |maria@ch...|cont. |Contrato.|Falhou  | 3  |[Reen] | |
|  |      |           |vence |..       |        |    |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:50 |pedro@ch...|audit.|Alterac..|Enviando| 1  |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:45 |ana@ch.com |prazo |Alerta:..|Pendente| 0  |[Can]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards, Fila completa, Detalhes por email (payload, headers, erros)
- **Preenchidos (input):** Filtros, acao Reenviar, acao Cancelar pendente
- **Obtidos (resposta do sistema):** Fila em tempo real, reenvio confirmado, detalhes completos

### Excecoes
- **E1:** Email ja foi enviado com sucesso mas usuario quer reenviar - sistema permite mas marca o reenvio como `duplicado=true` no audit
- **E2:** Quota SMTP atingida - banner vermelho "Provedor SMTP atingiu quota diaria. Novos envios ficarao em fila"

---

# ANEXO — MAPEAMENTO RF x UC x RN

| RF | Descricao | UCs |
|---|---|---|
| RF-047 | Flags (Sinalizadores) | UC-FL01, UC-FL02, UC-FL03, UC-FL04, UC-FL05 |
| RF-048 | Monitoria | UC-MO01, UC-MO02, UC-MO05, UC-MO06 |
| RF-052-01 | Alertas Multi-tier | UC-FL01, UC-FL02, UC-SM01, UC-SM02 |
| RF-056 | Governanca e Auditoria | UC-AU01, UC-AU02, UC-AU03 |
| RF-054 | Interface Hibrida Chat+CRUD | UC-FL02, UC-MO02, UC-MO03, UC-MO04 |
| RF-004 | Documentos da Empresa | UC-MO03 |
| RF-002 | Gestao de Certidoes | UC-FL02, UC-MO03 (integracao) |
| RF-019 | Captacao de Editais | UC-MO04 |
| RNF-003 | Observabilidade | UC-SM01, UC-SM03 |

| RN | Descricao | UCs afetados | Status nesta sprint |
|---|---|---|---|
| RN-008 | Status visual certidao | UC-FL02, UC-MO03 | Enforced (ja existia) |
| RN-031 | Bloqueio certidao vencida | UC-FL02 | **Ativada FALTANTE->V4** |
| RN-037 | Audit log universal | Todos | **Ativada FALTANTE->V4** |
| RN-039 | Transicao automatica documento vencido | UC-FL02, UC-MO03 | **Ativada FALTANTE->V4** |
| RN-080 | Versionamento de decisao GO/NO-GO | UC-AU02 | **Ativada FALTANTE->V4** |
| RN-084 | Cooldown DeepSeek | UC-FL02, UC-MO02, UC-MO03, UC-MO04 | Enforced (ja existia) |
| RN-132 | Audit invocacoes DeepSeek | UC-FL02, UC-MO02, UC-MO03, UC-MO04 | **Ativada FALTANTE->V4** |
| RN-186 | Niveis de criticidade (cores) | UC-FL01, UC-FL05 | Enforced (ja existia) |
| RN-187 | Canais escalonados | UC-SM01, UC-SM02 | Enforced (ja existia) |
| RN-211 | Threshold divergencia auditoria | UC-FL01 | **Ativada FALTANTE->V4** |
| RN-212 | Contador prazo dispara automatico | UC-FL01, UC-FL02 | **Ativada FALTANTE->V4** |

---

**Total de RFs cobertos nesta sprint:** 7 (RF-002 parcial, RF-004, RF-047, RF-048, RF-052-01, RF-054, RF-056)
**Total de RNs enforced nesta sprint:** 11 (5 ja enforced + 6 ativadas a partir de FALTANTE)
**Total de UCs nesta sprint:** 17 (5 Flags + 6 Monitoria + 3 Auditoria + 3 SMTP)
