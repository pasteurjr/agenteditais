# CASOS DE USO — SPRINT 5: FOLLOW-UP, ATAS, EXECUCAO E CONTRATADO X REALIZADO

**Data:** 27/03/2026
**Versao:** 1.0
**Base:** requisitos_completosv6.md (RF-017, RF-011, RF-035, RF-046, RF-051, RF-052) + Lei 14.133/2021 (Arts. 82-86, 117, 124-126) + boas praticas de gestao contratual
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Follow-up, Atas de Pregao, Execucao de Contratos e Contratado x Realizado.

---

## INDICE

### FASE 1 — FOLLOW-UP
- [UC-FU01] Registrar Resultado (Vitoria/Derrota)
- [UC-FU02] Configurar Alertas de Prazo
- [UC-FU03] Score Logistico

### FASE 2 — ATAS DE PREGAO
- [UC-AT01] Buscar Atas no PNCP
- [UC-AT02] Extrair Resultados de Ata PDF
- [UC-AT03] Dashboard de Atas Consultadas

### FASE 3 — EXECUCAO DE CONTRATOS
- [UC-CT01] Cadastrar Contrato
- [UC-CT02] Registrar Entrega + NF
- [UC-CT03] Acompanhar Cronograma de Entregas
- [UC-CT04] Gestao de Aditivos (NOVO — Lei 14.133/2021)
- [UC-CT05] Designar Gestor/Fiscal (NOVO — Lei 14.133/2021)
- [UC-CT06] Saldo de ARP / Controle de Carona (NOVO — Lei 14.133/2021)

### FASE 4 — CONTRATADO X REALIZADO
- [UC-CR01] Dashboard Contratado X Realizado
- [UC-CR02] Pedidos em Atraso
- [UC-CR03] Alertas de Vencimento Multi-tier (NOVO — Boas Praticas)

---

---

# FASE 1 — FOLLOW-UP

---

## [UC-FU01] Registrar Resultado (Vitoria/Derrota)

**RF relacionado:** RF-017, RF-046
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um edital possui status "submetido" no banco de dados
3. Proposta foi enviada para o orgao contratante (submissao registrada)
4. Backend tool `tool_registrar_resultado` esta operacional
5. Tabelas `editais`, `propostas` e `preco_historico` existem no banco

### Pos-condicoes
1. Resultado registrado no banco com tipo (vitoria/derrota/cancelado)
2. Edital atualizado com status final correspondente
3. Base de precos historicos alimentada com valor final (vitoria)
4. Concorrente vencedor registrado na tabela `concorrentes` (derrota)
5. Motivo de derrota catalogado para analise de perdas (RF-053)
6. Contrato automaticamente sugerido para criacao (vitoria → UC-CT01)

### Layout da Tela — FollowupPage > Secao Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FOLLOW-UP                                                                │
│ Acompanhamento pos-submissao e registro de resultados                   │
│                                                                          │
│ [Aba: Aguardando] [Aba: Resultados] [Aba: Alertas]                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Aguardando]  [Card: Vitorias]  [Card: Derrotas]  [Card: Tax]  ││
│ │    3 editais           12 (58%)          7 (34%)         Canc: 2(8%) ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Editais Aguardando Resultado ─────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Edital      │ Orgao      │ Submetido  │ Dias Ag.│ Valor     │ Acao│ ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-001/2026 │ UFMG       │ 15/02/2026 │ 5 dias  │ R$ 55.000 │ [R]│ ││
│ │ │ PE-045/2026 │ CEMIG      │ 12/02/2026 │ 8 dias  │ R$ 42.500 │ [R]│ ││
│ │ │ CC-012/2026 │ Pref. BH   │ 08/02/2026 │ 12 dias │ R$ 30.000 │ [R]│ ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ [R] = [ActionButton: Registrar Resultado]                             ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Resultados Registrados ───────────────────────────────────────┐│
│ │ [SearchInput: Filtrar...]  [SelectInput: Tipo ▼]  [DateRange]         ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Edital      │ Orgao   │ Resultado         │ Valor Final │ Data  │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-032/2026 │ USP     │ [🟢 Vitoria]      │ R$ 28.000   │ 01/02│   ││
│ │ │ PE-050/2026 │ UFMG    │ [🔴 Derrota]      │ R$ 43.500   │ 05/02│   ││
│ │ │ PE-018/2026 │ UNICAMP │ [🟡 Cancelado]    │ —           │ 03/02│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Registrar Resultado ─────────────────────────────────────────┐│
│ │                                                                       ││
│ │ Edital: PE-001/2026 — UFMG                                           ││
│ │ Valor Proposto: R$ 55.000,00                                          ││
│ │                                                                       ││
│ │ ── Tipo de Resultado ──                                               ││
│ │ ( ) Vitoria    ( ) Derrota    ( ) Cancelado                           ││
│ │                                                                       ││
│ │ ── Dados do Resultado ──                                              ││
│ │ [NumberInput: Valor Final]  R$ ___________                            ││
│ │                                                                       ││
│ │ ── Campos adicionais (se Derrota) ──                                  ││
│ │ [TextInput: Empresa Vencedora]  "Lab Solutions"                       ││
│ │ [SelectInput: Motivo ▼]                                               ││
│ │   Opcoes: Preco | Tecnico | Documental | Recurso | ME/EPP | Outro    ││
│ │                                                                       ││
│ │ ── Campos adicionais (se Cancelado) ──                                ││
│ │ [TextArea: Justificativa do Cancelamento]                             ││
│ │                                                                       ││
│ │ [CheckBox: Alimentar base de precos historicos]  [x]                  ││
│ │ [CheckBox: Registrar concorrente vencedor]       [x]                  ││
│ │                                                                       ││
│ │ [ActionButton: Confirmar]  [ActionButton: Cancelar]                   ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| FU01-F01 | Stats Aguardando | DisplayCard | — | Contador de editais com status "submetido" aguardando resultado |
| FU01-F02 | Stats Vitorias | DisplayCard | — | Contador e percentual de vitorias no periodo |
| FU01-F03 | Stats Derrotas | DisplayCard | — | Contador e percentual de derrotas no periodo |
| FU01-F04 | Stats Cancelados | DisplayCard | — | Contador e percentual de cancelamentos no periodo |
| FU01-F05 | Tabela Aguardando | DataTable | — | Colunas: Edital, Orgao, Data Submissao, Dias Aguardando, Valor Proposto, Acao. Fonte: editais com status="submetido" |
| FU01-F06 | Botao Registrar | ActionButton | — | Abre modal de registro de resultado para o edital selecionado |
| FU01-F07 | Tabela Resultados | DataTable | — | Colunas: Edital, Orgao, Resultado (badge colorido), Valor Final, Data. Fonte: editais com resultado registrado |
| FU01-F08 | Tipo Resultado | RadioGroup | Sim | Opcoes: Vitoria, Derrota, Cancelado. Determina campos adicionais visiveis |
| FU01-F09 | Valor Final | NumberInput | Sim (vitoria/derrota) | Valor final de adjudicacao. Pre-preenchido com valor proposto |
| FU01-F10 | Empresa Vencedora | TextInput | Sim (se derrota) | Nome da empresa que venceu o certame. Visivel apenas se Derrota |
| FU01-F11 | Motivo Derrota | SelectInput | Sim (se derrota) | Opcoes: Preco, Tecnico, Documental, Recurso, ME/EPP, Outro |
| FU01-F12 | Justificativa Cancelamento | TextArea | Sim (se cancelado) | Motivo do cancelamento do certame |
| FU01-F13 | Check Preco Historico | CheckBox | — | Se marcado, insere valor na tabela `preco_historico`. Default: marcado |
| FU01-F14 | Check Concorrente | CheckBox | — | Se marcado, registra vencedor na tabela `concorrentes`. Default: marcado |
| FU01-F15 | Botao Confirmar | ActionButton primary | — | Envia dados ao backend via `tool_registrar_resultado`. Valida campos obrigatorios |

### Sequencia de Eventos

1. Usuario acessa **FollowupPage** e visualiza aba **"Aguardando"** ativa por padrao
2. Sistema carrega stats em **[FU01-F01]** a **[FU01-F04]** com contadores do periodo
3. **[FU01-F05]** exibe editais com status "submetido" ordenados por dias aguardando (decrescente)
4. Usuario clica **[FU01-F06] Registrar** em um edital — modal abre com dados pre-preenchidos
5. Sistema exibe edital, orgao e valor proposto no cabecalho do modal
6. Usuario seleciona tipo em **[FU01-F08]**: Vitoria, Derrota ou Cancelado
7. Se **Vitoria**: sistema mostra apenas **[FU01-F09] Valor Final** (pre-preenchido com valor proposto)
8. Se **Derrota**: sistema mostra **[FU01-F09]**, **[FU01-F10] Empresa Vencedora** e **[FU01-F11] Motivo**
9. Se **Cancelado**: sistema mostra **[FU01-F12] Justificativa** e oculta valor final
10. Usuario preenche campos obrigatorios conforme o tipo selecionado
11. Usuario confirma checkboxes **[FU01-F13]** e **[FU01-F14]** (marcados por padrao)
12. Usuario clica **[FU01-F15] Confirmar** — sistema envia ao backend via `tool_registrar_resultado`
13. Backend processa via LLM, atualiza status do edital, alimenta preco historico e concorrentes
14. Modal fecha, **[FU01-F07] Tabela Resultados** atualiza com novo registro e **[FU01-F05]** remove edital
15. Se vitoria, sistema sugere criacao de contrato via toast: "Deseja criar contrato? [Ir para Producao]"

### Implementacao Atual
**⚠️ PARCIAL** — Mock frontend completo em `FollowupPage.tsx` com interfaces `EditalAguardando` e `Resultado`, tabelas e modal. Backend `tool_registrar_resultado` existe em `tools.py` e processa via LLM. Pendente: integracao frontend-backend via API REST, alimentacao real da tabela aguardando (hoje usa dados mock), link automatico com criacao de contrato.

---

## [UC-FU02] Configurar Alertas de Prazo

**RF relacionado:** RF-017
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um edital esta salvo no sistema com prazos definidos
3. Backend tool `tool_configurar_alertas` esta operacional
4. Sistema de notificacoes configurado (push interno no minimo)

### Pos-condicoes
1. Alerta salvo na tabela `alerta_editais` com tipo, limiar e canais
2. Sistema agendara verificacao periodica dos prazos
3. Notificacoes disparadas automaticamente ao atingir limiares configurados
4. Historico de alertas disparados registrado para auditoria

### Layout da Tela — FollowupPage > Aba "Alertas"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FOLLOW-UP                                                                │
│ Acompanhamento pos-submissao e registro de resultados                   │
│                                                                          │
│ [Aba: Aguardando] [Aba: Resultados] [Aba: Alertas ●]                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Configuracao de Alertas ──────────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Tipo de Alerta ──                                                  ││
│ │ [SelectInput: Tipo ▼]                                                 ││
│ │   Opcoes: Abertura de Sessao | Entrega de Documentos |                ││
│ │           Vencimento de Contrato | Renovacao de ARP |                 ││
│ │           Prazo de Recurso | Prazo de Impugnacao                      ││
│ │                                                                       ││
│ │ ── Edital/Contrato Alvo ──                                           ││
│ │ [SelectInput: Edital/Contrato ▼]                                      ││
│ │   "PE-001/2026 — UFMG"                                               ││
│ │                                                                       ││
│ │ ── Limiares de Antecedencia ──                                       ││
│ │ [x] 30 dias antes                                                     ││
│ │ [x] 15 dias antes                                                     ││
│ │ [x] 7 dias antes                                                      ││
│ │ [x] 1 dia antes                                                       ││
│ │ [ ] Personalizado: [NumberInput: ___ ] dias                           ││
│ │                                                                       ││
│ │ ── Canais de Notificacao ──                                           ││
│ │ [x] Notificacao no sistema (push)                                     ││
│ │ [x] E-mail                                                            ││
│ │ [ ] WhatsApp                                                          ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Alerta]  [ActionButton: Limpar]                 ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Alertas Ativos ───────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Tipo            │ Edital/Contrato │ Limiares     │ Canais │ Acao│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Abertura Sessao │ PE-001/2026     │ 30,15,7,1d   │ Push,E │ [E][X]│ ││
│ │ │ Entrega Docs    │ PE-045/2026     │ 15,7,1d      │ Push   │ [E][X]│ ││
│ │ │ Venc. Contrato  │ CT-032/2026     │ 30,15,7d     │ Push,W │ [E][X]│ ││
│ │ │ Renovacao ARP   │ ARP-018/2026    │ 30,15d       │ E-mail │ [E][X]│ ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ [E] = Editar    [X] = Desativar                                       ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Historico de Alertas Disparados ──────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Data/Hora        │ Tipo           │ Edital      │ Canal │ Status│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ 27/03 09:00      │ Abertura Sessao│ PE-001/2026 │ Push  │ Lido  │   ││
│ │ │ 25/03 14:30      │ Entrega Docs   │ PE-045/2026 │ E-mail│ Enviad│   ││
│ │ │ 20/03 08:00      │ Venc. Contrato │ CT-032/2026 │ WhatsA│ Enviad│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| FU02-F01 | Tipo de Alerta | SelectInput | Sim | Opcoes: Abertura de Sessao, Entrega de Documentos, Vencimento de Contrato, Renovacao de ARP, Prazo de Recurso, Prazo de Impugnacao |
| FU02-F02 | Edital/Contrato Alvo | SelectInput | Sim | Lista editais salvos (status qualquer) e contratos ativos. Formato: "PE {numero} — {orgao}" ou "CT {numero}" |
| FU02-F03 | Check 30 dias | CheckBox | — | Limiar de 30 dias de antecedencia para disparo do alerta |
| FU02-F04 | Check 15 dias | CheckBox | — | Limiar de 15 dias de antecedencia. Default: marcado |
| FU02-F05 | Check 7 dias | CheckBox | — | Limiar de 7 dias de antecedencia. Default: marcado |
| FU02-F06 | Check 1 dia | CheckBox | — | Limiar de 1 dia de antecedencia. Default: marcado |
| FU02-F07 | Limiar Personalizado | NumberInput | Nao | Dias de antecedencia customizado (ex: 45, 60, 90) |
| FU02-F08 | Canal Push | CheckBox | — | Notificacao interna no sistema. Default: marcado |
| FU02-F09 | Canal E-mail | CheckBox | — | Envio de e-mail ao usuario. Requer e-mail configurado no perfil |
| FU02-F10 | Canal WhatsApp | CheckBox | — | Envio via WhatsApp. Requer integracao configurada (futuro) |
| FU02-F11 | Botao Salvar Alerta | ActionButton primary | — | Salva configuracao via `tool_configurar_alertas`. Valida que ao menos 1 limiar e 1 canal estejam selecionados |
| FU02-F12 | Tabela Alertas Ativos | DataTable | — | Colunas: Tipo, Edital/Contrato, Limiares, Canais, Acoes. Fonte: tabela `alerta_editais` |
| FU02-F13 | Botao Editar Alerta | IconButton | — | Carrega configuracao do alerta no formulario para edicao |
| FU02-F14 | Botao Desativar | IconButton | — | Desativa alerta com confirmacao. Nao exclui, apenas marca inativo |
| FU02-F15 | Tabela Historico Disparos | DataTable | — | Colunas: Data/Hora, Tipo, Edital, Canal, Status (Enviado/Lido/Erro) |

### Sequencia de Eventos

1. Usuario acessa **FollowupPage** e clica na aba **"Alertas"**
2. Sistema carrega **[FU02-F12]** com alertas ativos do usuario e **[FU02-F15]** com historico
3. Usuario seleciona **[FU02-F01]** tipo de alerta (ex: "Abertura de Sessao")
4. Sistema filtra **[FU02-F02]** para mostrar apenas editais/contratos compativeis com o tipo
5. Usuario seleciona edital/contrato em **[FU02-F02]** (ex: "PE-001/2026 — UFMG")
6. Usuario marca limiares desejados em **[FU02-F03]** a **[FU02-F06]** (default: 15, 7 e 1 dia)
7. Opcionalmente preenche **[FU02-F07]** limiar personalizado (ex: 45 dias)
8. Usuario seleciona canais de notificacao em **[FU02-F08]** a **[FU02-F10]**
9. **Validacao:** ao menos 1 limiar e 1 canal devem estar marcados, senao sistema bloqueia salvamento
10. Usuario clica **[FU02-F11] Salvar Alerta** — backend processa via `tool_configurar_alertas`
11. Backend salva na tabela `alerta_editais` com parametros: tipo, edital, tempos_minutos, canais
12. **[FU02-F12]** atualiza com novo alerta registrado
13. Para editar: usuario clica **[FU02-F13]** — formulario carrega valores existentes
14. Para desativar: usuario clica **[FU02-F14]** — confirmacao via dialog, alerta marcado inativo

### Implementacao Atual
**⚠️ PARCIAL** — Backend `tool_configurar_alertas` existe em `tools.py` e aceita parametros `edital_numero`, `tempos_minutos`, `tipo`, `canais`. Funciona para alertas de abertura de sessao de editais. Pendente: expansao para alertas de contrato/ARP, frontend dedicado (hoje so funciona via chat), canal WhatsApp, historico de disparos, tab Alertas na FollowupPage.

---

## [UC-FU03] Score Logistico

**RF relacionado:** RF-011
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital esta salvo e validado (score de aderencia calculado)
3. Empresa possui UF e endereco cadastrados (RF-001)
4. Tabela de parametrizacao de regioes configurada (RF-015)
5. Historico de entregas em regioes similares disponivel (desejavel)

### Pos-condicoes
1. Score logistico calculado com nota de 0 a 100
2. Score salvo como sub-dimensao do score de aderencia do edital
3. Badge de recomendacao atribuido (VIAVEL/ATENCAO/INVIAVEL)
4. Dados de custo de frete estimado registrados para uso na precificacao

### Layout da Tela — ValidacaoPage > Card Score Logistico

```
┌─────────────────────────────────────────────────────────────────────────┐
│ VALIDACAO — Score de Aderencia                                           │
│ Edital: PE-001/2026 — UFMG (Belo Horizonte/MG)                         │
│                                                                          │
│ [Card: Tecnico 85] [Card: Documental 92] [Card: Juridico 78]           │
│ [Card: Comercial 88] [Card: Complexidade 65] [Card: Logistico ●]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Score Logistico ──────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────┐                   ││
│ │ │          SCORE LOGISTICO: 72/100                 │                   ││
│ │ │  [==============================--------]        │                   ││
│ │ │  [Badge: 🟡 ATENCAO — Avaliar custos de frete]  │                   ││
│ │ └─────────────────────────────────────────────────┘                   ││
│ │                                                                       ││
│ │ ── Dimensoes Avaliadas ──                                             ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Dimensao            │ Peso │ Nota  │ Contrib. │ Status          │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Distancia UF        │ 30%  │ 60/100│ 18 pts   │ [🟡 1.200 km]  │   ││
│ │ │ Historico Regiao     │ 20%  │ 85/100│ 17 pts   │ [🟢 3 entregas]│   ││
│ │ │ Custo Frete Estimado│ 30%  │ 65/100│ 19.5 pts │ [🟡 R$ 2.800]  │   ││
│ │ │ Prazo Estimado       │ 20%  │ 88/100│ 17.6 pts │ [🟢 5 dias]    │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Detalhes ──                                                        ││
│ │                                                                       ││
│ │ Origem:    Sao Paulo/SP (sede da empresa)                             ││
│ │ Destino:   Belo Horizonte/MG (orgao contratante)                      ││
│ │ Distancia: ~590 km (rodoviario)                                       ││
│ │ Frete Est: R$ 2.800,00 (base: R$ 4,75/km × peso estimado)            ││
│ │ Prazo Est: 5 dias uteis (rodoviario convencional)                     ││
│ │                                                                       ││
│ │ ── Historico na Regiao ──                                             ││
│ │ Entregas anteriores em MG: 3                                          ││
│ │ Taxa de sucesso: 100%                                                  ││
│ │ Tempo medio realizado: 4.2 dias                                       ││
│ │                                                                       ││
│ │ ── Recomendacao ──                                                    ││
│ │ Logistica viavel com custo moderado. Considerar custo de frete         ││
│ │ na formacao de preco (Camada A — Custo Base). Regiao com               ││
│ │ historico positivo de entregas.                                        ││
│ │                                                                       ││
│ │ [ActionButton: Recalcular]  [ActionButton: Ajustar Pesos]            ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| FU03-F01 | Score Global | DisplayBar | — | Barra de progresso 0-100 com valor numerico do score logistico final |
| FU03-F02 | Badge Recomendacao | Badge colorido | — | VIAVEL (verde, >=70), ATENCAO (amarelo, 40-69), INVIAVEL (vermelho, <40) |
| FU03-F03 | Tabela Dimensoes | DataTable readonly | — | Colunas: Dimensao, Peso (%), Nota (0-100), Contribuicao (pts), Status (badge) |
| FU03-F04 | Dimensao Distancia UF | Display | — | Nota baseada na distancia entre sede e orgao. Score inversamente proporcional a distancia |
| FU03-F05 | Dimensao Historico Regiao | Display | — | Nota baseada em entregas anteriores na mesma UF/regiao. Mais entregas = nota maior |
| FU03-F06 | Dimensao Custo Frete | Display | — | Nota baseada no custo estimado de frete. Menor custo = nota maior |
| FU03-F07 | Dimensao Prazo Estimado | Display | — | Nota baseada no prazo estimado de entrega vs prazo exigido pelo edital |
| FU03-F08 | Detalhes Origem | Display readonly | — | UF/cidade da sede da empresa (fonte: cadastro empresa RF-001) |
| FU03-F09 | Detalhes Destino | Display readonly | — | UF/cidade do orgao contratante (fonte: dados do edital) |
| FU03-F10 | Detalhes Distancia | Display readonly | — | Distancia estimada em km (calculo baseado em tabela UF x UF) |
| FU03-F11 | Detalhes Frete | Display readonly | — | Custo estimado de frete (formula: custo/km x peso estimado) |
| FU03-F12 | Texto Recomendacao | Display | — | Recomendacao textual gerada pelo calculo (template baseado no score) |
| FU03-F13 | Botao Recalcular | ActionButton | — | Refaz calculo do score logistico com dados atualizados |
| FU03-F14 | Botao Ajustar Pesos | ActionButton secondary | — | Abre modal para editar pesos das 4 dimensoes (soma = 100%) |

### Sequencia de Eventos

1. Usuario acessa **ValidacaoPage** de um edital salvo e visualiza cards de score
2. Sistema identifica card **"Logistico"** como sub-score da aderencia
3. Usuario clica no card **Score Logistico** para expandir detalhes
4. Sistema chama `tool_calcular_score_logistico` passando edital_id e user_id
5. Backend consulta UF da empresa (tabela `empresas`) e UF do orgao (tabela `editais`)
6. Backend calcula distancia via tabela interna UF x UF (ou API de geocodificacao)
7. Backend consulta historico de entregas na regiao (tabela `contrato_entregas` filtrado por UF)
8. Backend estima custo de frete com formula: distancia_km x custo_km x peso_estimado
9. Backend estima prazo de entrega com base na distancia e modalidade de transporte
10. Backend calcula nota de cada dimensao **[FU03-F04]** a **[FU03-F07]** e score ponderado final
11. **[FU03-F01]** exibe barra de score e **[FU03-F02]** exibe badge de recomendacao
12. **[FU03-F03]** exibe tabela com detalhamento por dimensao
13. **[FU03-F12]** exibe recomendacao textual gerada por template
14. Usuario pode clicar **[FU03-F13] Recalcular** para atualizar apos mudancas no cadastro
15. Usuario pode clicar **[FU03-F14] Ajustar Pesos** para customizar relevancia de cada dimensao

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — A `tool_calcular_score_logistico` nao existe no backend. O score de aderencia atual na ValidacaoPage considera 6 dimensoes (RF-018) mas "Logistico" e calculado como placeholder fixo. Necessario: criar tool no backend, tabela de distancias UF x UF, formula de custo de frete, integracao com historico de entregas.

---

---

# FASE 2 — ATAS DE PREGAO

---

## [UC-AT01] Buscar Atas no PNCP

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Backend tool `tool_buscar_atas_pncp` esta operacional
3. API do PNCP esta acessivel (endpoint de busca de atas)
4. Conexao com internet disponivel

### Pos-condicoes
1. Atas encontradas exibidas na tabela de resultados
2. Atas selecionadas podem ser salvas na tabela `atas_consultadas`
3. Dados de atas disponiveis para extracao de precos (UC-AT02)
4. Historico de buscas registrado para consulta futura

### Layout da Tela — AtasPage > Secao Buscar

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ATAS DE PREGAO                                                           │
│ Busca, extracao e gestao de atas de registro de preco                   │
│                                                                          │
│ [Aba: Buscar ●] [Aba: Extrair] [Aba: Minhas Atas] [Aba: Saldo ARP]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Busca de Atas no PNCP ───────────────────────────────────────┐│
│ │                                                                       ││
│ │ [SearchInput: Termo de Busca]                                         ││
│ │   "reagente hematologia"                                              ││
│ │                                                                       ││
│ │ ── Filtros ──                                                         ││
│ │ [SelectInput: UF ▼]  [DateRange: Periodo]  [SelectInput: Modalid. ▼] ││
│ │   "MG"                 01/01/2025-27/03/2026   "Pregao Eletronico"   ││
│ │                                                                       ││
│ │ [ActionButton: Buscar]  [ActionButton: Limpar Filtros]                ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Resultados (12 atas encontradas) ─────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Titulo               │ Orgao       │ UF │ Publicacao│ Vigencia │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE 15/2025 - Reagent │ UFMG        │ MG │ 15/03/25 │ 15/03/26 │   ││
│ │ │ [Badge: 🟢 Vigente]  │             │    │          │          │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE 28/2024 - Kit Hem │ USP         │ SP │ 01/08/24 │ 01/08/25 │   ││
│ │ │ [Badge: 🔴 Expirada] │             │    │          │          │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE 42/2025 - Insumos │ HC/UFPE     │ PE │ 20/01/25 │ 20/01/26 │   ││
│ │ │ [Badge: 🟢 Vigente]  │             │    │          │          │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Acoes por Ata ──                                                   ││
│ │ [ActionButton: Baixar PDF]  [ActionButton: Extrair Dados]             ││
│ │ [ActionButton: Salvar]      [ActionButton: Ver no PNCP]               ││
│ │                                                                       ││
│ │ [Pagination: < 1 2 3 ... 4 >]                                        ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| AT01-F01 | Termo de Busca | SearchInput | Sim | Texto livre para busca de atas. Minimo 3 caracteres. Busca por objeto/descricao |
| AT01-F02 | Filtro UF | SelectInput | Nao | Lista de UFs brasileiras para filtrar resultados. Default: todas |
| AT01-F03 | Filtro Periodo | DateRange | Nao | Data inicial e final para filtrar por data de publicacao |
| AT01-F04 | Filtro Modalidade | SelectInput | Nao | Opcoes: Pregao Eletronico, Pregao Presencial, Concorrencia, Todas |
| AT01-F05 | Botao Buscar | ActionButton primary | — | Executa busca via `tool_buscar_atas_pncp` com termo e filtros |
| AT01-F06 | Botao Limpar | ActionButton secondary | — | Limpa todos os filtros e resultado |
| AT01-F07 | Tabela Resultados | DataTable | — | Colunas: Titulo, Orgao, UF, Data Publicacao, Vigencia. Cada linha com badge de vigencia |
| AT01-F08 | Badge Vigencia | Badge colorido | — | Verde: vigente (data_fim > hoje), Vermelho: expirada (data_fim < hoje) |
| AT01-F09 | Botao Baixar PDF | ActionButton | — | Baixa documento PDF da ata via `tool_baixar_ata_pncp` |
| AT01-F10 | Botao Extrair Dados | ActionButton | — | Navega para aba Extrair com a ata pre-selecionada (UC-AT02) |
| AT01-F11 | Botao Salvar | ActionButton | — | Salva ata na tabela `atas_consultadas` para consulta futura |
| AT01-F12 | Botao Ver PNCP | ActionButton link | — | Abre URL da ata no portal PNCP em nova aba |
| AT01-F13 | Paginacao | Pagination | — | Navegacao entre paginas de resultados (10 por pagina) |
| AT01-F14 | Contador Resultados | Display | — | Total de atas encontradas exibido no titulo do card |

### Sequencia de Eventos

1. Usuario acessa **AtasPage** — aba **"Buscar"** ativa por padrao
2. Usuario digita termo de busca em **[AT01-F01]** (ex: "reagente hematologia")
3. Opcionalmente, usuario define filtros em **[AT01-F02]** UF, **[AT01-F03]** periodo, **[AT01-F04]** modalidade
4. Usuario clica **[AT01-F05] Buscar** — sistema envia requisicao ao backend
5. Backend executa `tool_buscar_atas_pncp(termo, user_id)` contra API do PNCP
6. **[AT01-F14]** exibe total de resultados e **[AT01-F07]** lista atas encontradas
7. Cada ata exibe **[AT01-F08]** badge de vigencia (verde/vermelho) comparando data_fim com hoje
8. Usuario clica **[AT01-F09] Baixar PDF** — backend baixa via `tool_baixar_ata_pncp` e exibe para download
9. Usuario clica **[AT01-F10] Extrair Dados** — sistema navega para aba "Extrair" com ata pre-carregada
10. Usuario clica **[AT01-F11] Salvar** — ata inserida em `atas_consultadas` com dados completos
11. Se ata ja salva, botao muda para "Ja Salva" (desabilitado) com indicador visual
12. Usuario clica **[AT01-F12] Ver PNCP** — nova aba abre com URL do portal
13. Para mais resultados, usuario navega pela **[AT01-F13]** paginacao

### Implementacao Atual
**⚠️ PARCIAL** — Backend `tool_buscar_atas_pncp` existe e funciona via PNCP Search API. Retorna titulo, orgao, CNPJ, UF, URL. Salvamento em `atas_consultadas` implementado. Pendente: pagina AtasPage no frontend (nao existe), filtros UF/periodo/modalidade no frontend, badge de vigencia, acoes visuais de download/extracao.

---

## [UC-AT02] Extrair Resultados de Ata PDF

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. PDF da ata disponivel (via download do PNCP ou upload manual)
3. Backend tools `tool_baixar_ata_pncp` e `tool_extrair_ata_pdf` estao operacionais
4. LLM configurada para extracao de dados estruturados do PDF

### Pos-condicoes
1. Itens da ata extraidos com descricao, vencedor, preco e quantidade
2. Dados disponiveis para importacao na base de precos historicos
3. Concorrentes identificados na ata registrados na tabela `concorrentes`
4. Registro de extracao vinculado a ata na `atas_consultadas`

### Layout da Tela — AtasPage > Aba "Extrair"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ATAS DE PREGAO                                                           │
│ Busca, extracao e gestao de atas de registro de preco                   │
│                                                                          │
│ [Aba: Buscar] [Aba: Extrair ●] [Aba: Minhas Atas] [Aba: Saldo ARP]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Fonte do Documento ───────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Opcao 1: Upload de PDF ──                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │                                                                 │   ││
│ │ │         Arraste um arquivo PDF aqui ou clique para enviar       │   ││
│ │ │                                                                 │   ││
│ │ │     Formatos aceitos: .pdf  |  Tamanho maximo: 20 MB            │   ││
│ │ │                                                                 │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Opcao 2: URL do PNCP ──                                          ││
│ │ [TextInput: URL do documento]                                         ││
│ │   "https://pncp.gov.br/api/..."                                      ││
│ │                                                                       ││
│ │ [ActionButton: Extrair Dados]  [ActionButton: Limpar]                 ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Processamento ───────────────────────────────────────────────-┐│
│ │ [ProgressBar: ████████░░░░ 65% — Extraindo itens via IA...]          ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Dados Extraidos (8 itens) ────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Item│ Descricao          │ Vencedor      │ Preco Un. │ Qtd     │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ 01  │ Reagente hemograma │ Lab Solutions │ R$ 120,00 │ 500 kit │   ││
│ │ │ 02  │ Controle hematolog │ DiagBrasil    │ R$ 45,00  │ 100 und │   ││
│ │ │ 03  │ Ponteira pipeta    │ Lab Solutions │ R$ 0,85   │ 10000 un│   ││
│ │ │ 04  │ Tubo coleta EDTA   │ MedSupply     │ R$ 1,20   │ 5000 un │   ││
│ │ │ 05  │ Lanceta seguranca  │ DiagBrasil    │ R$ 0,55   │ 8000 un │   ││
│ │ │ 06  │ Reagente bioquimica│ Lab Solutions │ R$ 95,00  │ 300 kit │   ││
│ │ │ 07  │ Calibrador multipar│ QualiLab      │ R$ 280,00 │ 50 un   │   ││
│ │ │ 08  │ Controle qualidade │ QualiLab      │ R$ 150,00 │ 60 un   │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Acoes em Lote ──                                                   ││
│ │ [x] Selecionar todos                                                  ││
│ │ [ActionButton: Salvar em Preco Historico]                             ││
│ │ [ActionButton: Registrar Concorrentes]                                ││
│ │ [ActionButton: Exportar CSV]                                          ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Concorrentes Identificados ──────────────────────────────────-┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Empresa       │ Itens Vencidos │ Valor Total │ [Registrar]      │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Lab Solutions │ 3 itens        │ R$ 57.750   │ [ActionButton]   │   ││
│ │ │ DiagBrasil    │ 2 itens        │ R$ 8.900    │ [ActionButton]   │   ││
│ │ │ QualiLab      │ 2 itens        │ R$ 23.000   │ [ActionButton]   │   ││
│ │ │ MedSupply     │ 1 item         │ R$ 6.000    │ [ActionButton]   │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| AT02-F01 | Upload PDF | FileUpload (drag-drop) | Condicional | Area de upload para arquivo PDF da ata. Aceita .pdf, max 20 MB |
| AT02-F02 | URL do Documento | TextInput | Condicional | URL direta do documento no PNCP. Alternativa ao upload |
| AT02-F03 | Botao Extrair | ActionButton primary | — | Inicia extracao: upload envia PDF ao backend, URL usa `tool_baixar_ata_pncp` + `tool_extrair_ata_pdf` |
| AT02-F04 | Barra de Progresso | ProgressBar | — | Indica etapa: Baixando (0-30%), Extraindo texto (30-50%), Analisando via IA (50-90%), Concluido (100%) |
| AT02-F05 | Tabela Dados Extraidos | DataTable editavel | — | Colunas: Item, Descricao, Vencedor, Preco Unitario, Quantidade. Celulas editaveis para correcao manual |
| AT02-F06 | Contador Itens | Display | — | Total de itens extraidos exibido no titulo do card |
| AT02-F07 | Check Selecionar Todos | CheckBox | — | Marca/desmarca todos os itens para acoes em lote |
| AT02-F08 | Botao Salvar Historico | ActionButton | — | Insere itens selecionados na tabela `preco_historico` para referencia futura |
| AT02-F09 | Botao Registrar Concorrentes | ActionButton | — | Insere empresas vencedoras na tabela `concorrentes` |
| AT02-F10 | Botao Exportar CSV | ActionButton secondary | — | Exporta dados extraidos em formato CSV para analise externa |
| AT02-F11 | Tabela Concorrentes | DataTable | — | Agrupamento por empresa: nome, qtd itens vencidos, valor total. Botao individual de registro |
| AT02-F12 | Botao Registrar Individual | ActionButton | — | Registra concorrente individual na tabela `concorrentes` |

### Sequencia de Eventos

1. Usuario acessa **AtasPage** e clica na aba **"Extrair"**
2. Se veio da aba Buscar (UC-AT01), **[AT02-F02]** ja esta pre-preenchido com URL da ata
3. Usuario escolhe fonte: upload PDF em **[AT02-F01]** OU URL em **[AT02-F02]**
4. Usuario clica **[AT02-F03] Extrair Dados** — processamento inicia
5. **[AT02-F04]** exibe progresso: "Baixando..." → "Extraindo texto..." → "Analisando via IA..."
6. Backend executa `tool_baixar_ata_pncp(url)` para obter texto do PDF
7. Backend executa `tool_extrair_ata_pdf(texto_pdf, user_id)` para extracao via LLM
8. LLM retorna JSON estruturado com itens, vencedores, precos e quantidades
9. **[AT02-F05]** exibe tabela com dados extraidos — celulas editaveis para correcao
10. **[AT02-F11]** agrupa empresas vencedoras com totais por empresa
11. Usuario revisa e corrige dados conforme necessario (edicao inline)
12. Usuario marca itens desejados e clica **[AT02-F08] Salvar em Preco Historico**
13. Usuario clica **[AT02-F09] Registrar Concorrentes** para alimentar base competitiva
14. Opcionalmente, usuario clica **[AT02-F10] Exportar CSV** para backup externo

### Implementacao Atual
**⚠️ PARCIAL** — Backend `tool_baixar_ata_pncp` baixa PDF e extrai texto, `tool_extrair_ata_pdf` analisa via LLM e retorna itens estruturados. Ambos funcionais via chat. Pendente: pagina AtasPage com aba Extrair no frontend, upload drag-drop, barra de progresso visual, edicao inline de dados extraidos, acoes em lote (salvar historico, registrar concorrentes).

---

## [UC-AT03] Dashboard de Atas Consultadas

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos uma ata foi salva na tabela `atas_consultadas` (via UC-AT01)
3. Modelo `AtaConsultada` com campos: numero_controle_pncp, titulo, orgao, cnpj_orgao, uf, data_publicacao, data_vigencia_inicio, data_vigencia_fim

### Pos-condicoes
1. Dashboard exibe visao consolidada de todas as atas consultadas
2. Filtros aplicados persistem na sessao do usuario
3. Atas expiradas sinalizadas visualmente para limpeza ou referencia

### Layout da Tela — AtasPage > Aba "Minhas Atas"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ATAS DE PREGAO                                                           │
│ Busca, extracao e gestao de atas de registro de preco                   │
│                                                                          │
│ [Aba: Buscar] [Aba: Extrair] [Aba: Minhas Atas ●] [Aba: Saldo ARP]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Total Atas]  [Card: Vigentes]    [Card: Expiradas]            ││
│ │    24 atas             18 (75%)            6 (25%)                    ││
│ │                                                                       ││
│ │ [Card: UFs Cobertas] [Card: Orgaos]    [Card: Ultima Consulta]       ││
│ │    8 UFs               15 orgaos          27/03/2026                  ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Filtros ──────────────────────────────────────────────────────┐│
│ │ [SearchInput: Buscar ata...]  [SelectInput: UF ▼]                     ││
│ │ [DateRange: Data publicacao]  [SelectInput: Status ▼]                 ││
│ │   Opcoes Status: Todas | Vigentes | Expiradas                        ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Atas Consultadas ─────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Titulo             │ Orgao     │ UF │ Publicacao │ Vigencia    │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE 15/2025 - Reag. │ UFMG      │ MG │ 15/03/25  │ 15/03/26   │   ││
│ │ │ [Badge: 🟢 Vigente — 353 dias]│    │           │             │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE 42/2025 - Insum.│ HC/UFPE   │ PE │ 20/01/25  │ 20/01/26   │   ││
│ │ │ [Badge: 🟢 Vigente — 299 dias]│    │           │             │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE 28/2024 - Kit H.│ USP       │ SP │ 01/08/24  │ 01/08/25   │   ││
│ │ │ [Badge: 🔴 Expirada — ha 238d]│    │           │             │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ CC 05/2025 - Autoc. │ UNESP    │ SP │ 10/02/25  │ 10/02/26   │   ││
│ │ │ [Badge: 🟢 Vigente — 320 dias]│    │           │             │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Acoes ──                                                           ││
│ │ [ActionButton: Ver Detalhes]  [ActionButton: Re-extrair]              ││
│ │ [ActionButton: Excluir]       [ActionButton: Ver no PNCP]             ││
│ │                                                                       ││
│ │ [Pagination: < 1 2 3 >]                                               ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| AT03-F01 | Stat Total Atas | DisplayCard | — | Contador total de atas salvas na tabela `atas_consultadas` |
| AT03-F02 | Stat Vigentes | DisplayCard | — | Contador de atas com data_vigencia_fim > hoje. Percentual sobre total |
| AT03-F03 | Stat Expiradas | DisplayCard | — | Contador de atas com data_vigencia_fim < hoje. Percentual sobre total |
| AT03-F04 | Stat UFs Cobertas | DisplayCard | — | Quantidade distinta de UFs nas atas consultadas |
| AT03-F05 | Stat Orgaos | DisplayCard | — | Quantidade distinta de orgaos nas atas consultadas |
| AT03-F06 | Filtro Busca | SearchInput | Nao | Busca textual por titulo ou orgao da ata |
| AT03-F07 | Filtro UF | SelectInput | Nao | Filtra atas por UF do orgao |
| AT03-F08 | Filtro Periodo | DateRange | Nao | Filtra por data de publicacao da ata |
| AT03-F09 | Filtro Status | SelectInput | Nao | Opcoes: Todas, Vigentes, Expiradas. Default: Todas |
| AT03-F10 | Tabela Atas | DataTable | — | Colunas: Titulo, Orgao, UF, Data Publicacao, Vigencia, Badge status |
| AT03-F11 | Badge Vigencia Detalhado | Badge colorido | — | Verde + "X dias restantes" (vigente) ou Vermelho + "ha X dias" (expirada) |
| AT03-F12 | Botao Ver Detalhes | ActionButton | — | Expande card com itens extraidos, concorrentes e precos da ata |
| AT03-F13 | Botao Re-extrair | ActionButton | — | Refaz extracao de dados via `tool_extrair_ata_pdf` (atualiza dados) |
| AT03-F14 | Botao Excluir | ActionButton danger | — | Remove ata da tabela `atas_consultadas` com confirmacao |
| AT03-F15 | Paginacao | Pagination | — | Navegacao entre paginas (10 atas por pagina) |

### Sequencia de Eventos

1. Usuario acessa **AtasPage** e clica na aba **"Minhas Atas"**
2. Sistema carrega stats **[AT03-F01]** a **[AT03-F05]** com contadores agregados
3. **[AT03-F10]** exibe todas as atas salvas, ordenadas por data de publicacao (mais recente primeiro)
4. Cada ata exibe **[AT03-F11]** badge com vigencia detalhada (dias restantes ou dias expirada)
5. Usuario aplica filtros em **[AT03-F06]** a **[AT03-F09]** — tabela atualiza em tempo real
6. Para filtrar apenas vigentes: usuario seleciona "Vigentes" em **[AT03-F09]**
7. Usuario clica **[AT03-F12] Ver Detalhes** — card expande mostrando itens extraidos e precos
8. Se dados desatualizados, usuario clica **[AT03-F13] Re-extrair** para atualizar via LLM
9. Para remover ata: usuario clica **[AT03-F14] Excluir** — dialog de confirmacao aparece
10. Confirmacao remove ata do banco e atualiza stats e tabela
11. Para mais atas: usuario navega via **[AT03-F15]** paginacao
12. Filtros persistem durante a sessao do usuario (nao resetam ao trocar aba)

### Implementacao Atual
**⚠️ PARCIAL** — Modelo `AtaConsultada` existe em `models.py` com todos os campos necessarios (numero_controle_pncp, titulo, orgao, cnpj_orgao, uf, datas). CRUD basico funciona via backend (salvar/listar atas). Pendente: pagina AtasPage com aba "Minhas Atas", stats agregados, filtros visuais, badges de vigencia calculados, acoes de detalhe/re-extracao.

---

---

# FASE 3 — EXECUCAO DE CONTRATOS

---

## [UC-CT01] Cadastrar Contrato

**RF relacionado:** RF-046-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Modelo `Contrato` existe com campos: numero_contrato, orgao, objeto, valor_total, data_assinatura, data_inicio, data_fim, status
3. Edital de origem salvo no banco (desejavel, para auto-preenchimento)
4. Resultado de vitoria registrado em UC-FU01 (desejavel, para fluxo integrado)

### Pos-condicoes
1. Contrato cadastrado na tabela `contratos` com todos os campos obrigatorios
2. Contrato vinculado ao edital de origem (edital_id) e proposta (proposta_id)
3. Status inicial definido como "ativo"
4. Entregas previstas podem ser cadastradas (UC-CT02)

### Layout da Tela — ProducaoPage > Secao Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Execucao de Contratos                                         │
│ Gestao de contratos, entregas e notas fiscais                           │
│                                                                          │
│ [Aba: Contratos ●] [Aba: Cronograma] [Aba: Aditivos] [Aba: Gestor]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Contratos]  [Card: Valor Total] [Card: Em Dia]  [Card: Atr.] ││
│ │    4 ativos           R$ 123.000        3 (75%)          1 (25%)     ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Lista de Contratos ───────────────────────────────────────────┐│
│ │ [ActionButton: + Novo Contrato]  [SearchInput: Buscar...]             ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Edital      │ Orgao  │ Produto      │ Qtd│ Valor    │ Prazo   │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-032/2026 │ USP    │ Microscopio  │ 2  │ R$28.000 │ 20/03/26│   ││
│ │ │ Dias Rest.: 35  │ Status: [🟢 OK]  │ NF: —           │         │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-018/2026 │ UFMG   │ Centrifuga   │ 3  │ R$45.000 │ 15/03/26│   ││
│ │ │ Dias Rest.: 30  │ Status: [🟡 Atencao] │ NF: —       │         │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-020/2026 │ UNESP  │ Autoclave    │ 1  │ R$35.000 │ 01/03/26│   ││
│ │ │ Dias Rest.: 16  │ Status: [🟢 OK]  │ NF: Anexada     │         │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-010/2026 │ UNICAMP│ Reagente     │100 │ R$15.000 │ 01/02/26│   ││
│ │ │ Dias Rest.: -9  │ Status: [🔴 Atrasado]│ NF: —       │         │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Novo Contrato ───────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Dados do Contrato ──                                               ││
│ │ [TextInput: Numero do Contrato]  "CT-2026/001"                        ││
│ │ [SelectInput: Edital de Origem ▼]  "PE-032/2026 — USP"               ││
│ │ [TextInput: Orgao Contratante]  (auto-fill do edital)                 ││
│ │ [TextArea: Objeto do Contrato]  (auto-fill do edital)                 ││
│ │                                                                       ││
│ │ ── Valores ──                                                         ││
│ │ [NumberInput: Valor Total]  R$ ___________                            ││
│ │                                                                       ││
│ │ ── Datas ──                                                           ││
│ │ [DateInput: Data de Assinatura]  __/__/____                           ││
│ │ [DateInput: Data de Inicio]      __/__/____                           ││
│ │ [DateInput: Data de Fim]         __/__/____                           ││
│ │                                                                       ││
│ │ ── Vinculacao ──                                                      ││
│ │ [SelectInput: Proposta ▼]  "Prop. PE-032/2026"                       ││
│ │ [FileUpload: Arquivo do Contrato]  .pdf                               ││
│ │                                                                       ││
│ │ [TextArea: Observacoes]                                               ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Contrato]  [ActionButton: Cancelar]             ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT01-F01 | Stats Contratos Ativos | DisplayCard | — | Contador de contratos com status "ativo" |
| CT01-F02 | Stats Valor Total | DisplayCard | — | Soma de valor_total de todos os contratos ativos |
| CT01-F03 | Stats Em Dia | DisplayCard | — | Contratos com status "ok" ou "atencao" (percentual) |
| CT01-F04 | Stats Atrasados | DisplayCard | — | Contratos com status "atrasado" (percentual) |
| CT01-F05 | Botao Novo Contrato | ActionButton primary | — | Abre modal de cadastro de novo contrato |
| CT01-F06 | Tabela Contratos | DataTable | — | Colunas: Edital, Orgao, Produto, Qtd, Valor, Prazo, Dias Rest., Status, NF. Fonte: tabela `contratos` |
| CT01-F07 | Numero Contrato | TextInput | Sim | Numero do contrato formal (ex: CT-2026/001) |
| CT01-F08 | Edital de Origem | SelectInput | Nao | Lista editais com resultado "vitoria". Auto-preenche orgao e objeto |
| CT01-F09 | Orgao Contratante | TextInput | Sim | Nome do orgao. Auto-fill se edital selecionado |
| CT01-F10 | Objeto do Contrato | TextArea | Sim | Descricao do objeto contratual. Auto-fill do edital |
| CT01-F11 | Valor Total | NumberInput | Sim | Valor total do contrato em R$ |
| CT01-F12 | Data Assinatura | DateInput | Sim | Data de assinatura do contrato |
| CT01-F13 | Data Inicio | DateInput | Sim | Data de inicio da vigencia do contrato |
| CT01-F14 | Data Fim | DateInput | Sim | Data de termino da vigencia do contrato |
| CT01-F15 | Proposta Vinculada | SelectInput | Nao | Proposta que originou o contrato (tabela `propostas`) |
| CT01-F16 | Arquivo Contrato | FileUpload | Nao | Upload do PDF do contrato assinado |
| CT01-F17 | Observacoes | TextArea | Nao | Notas livres sobre o contrato |
| CT01-F18 | Botao Salvar | ActionButton primary | — | Salva contrato via POST /api/contratos. Valida campos obrigatorios |

### Sequencia de Eventos

1. Usuario acessa **ProducaoPage** e visualiza aba **"Contratos"** ativa por padrao
2. Sistema carrega stats **[CT01-F01]** a **[CT01-F04]** com contadores dos contratos
3. **[CT01-F06]** exibe contratos existentes com status colorido e dias restantes
4. Usuario clica **[CT01-F05] Novo Contrato** — modal abre
5. Se usuario veio de UC-FU01 (vitoria), **[CT01-F08]** esta pre-selecionado e campos auto-preenchidos
6. Sistema auto-preenche **[CT01-F09]** orgao e **[CT01-F10]** objeto a partir do edital selecionado
7. **[CT01-F11]** valor pre-preenchido com valor final da adjudicacao (se disponivel)
8. Usuario preenche **[CT01-F07]** numero do contrato, **[CT01-F12]** a **[CT01-F14]** datas
9. Opcionalmente, usuario seleciona **[CT01-F15]** proposta e faz upload do contrato em **[CT01-F16]**
10. **Validacao:** numero contrato, orgao, objeto, valor e datas sao obrigatorios
11. Usuario clica **[CT01-F18] Salvar** — backend cria registro na tabela `contratos`
12. Modal fecha, **[CT01-F06]** atualiza com novo contrato e stats recalculados
13. Sistema calcula status automaticamente: ok (>15d), atencao (7-15d), atrasado (<0d)
14. Contrato disponivel para registro de entregas (UC-CT02)

### Implementacao Atual
**⚠️ PARCIAL** — Mock frontend completo em `ProducaoPage.tsx` com interface `Contrato` (edital, orgao, produto, quantidade, valorTotal, prazoEntrega, diasRestantes, status, nfAnexada). Modelo `Contrato` existe em `models.py` com campos completos. Pendente: integracao frontend-backend via API REST (CRUD /api/contratos), auto-preenchimento a partir do edital, upload de arquivo, link com fluxo de vitoria (UC-FU01).

---

## [UC-CT02] Registrar Entrega + NF

**RF relacionado:** RF-046-03
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contrato cadastrado com status "ativo" (UC-CT01)
3. Modelo `ContratoEntrega` com campos: descricao, quantidade, valor_unitario, valor_total, data_prevista, data_realizada, nota_fiscal, numero_empenho, status
4. Produto vinculado ao contrato (desejavel)

### Pos-condicoes
1. Entrega registrada na tabela `contrato_entregas` vinculada ao contrato
2. Nota fiscal anexada e vinculada a entrega (se fornecida)
3. Status da entrega atualizado (pendente → entregue)
4. Status do contrato recalculado automaticamente
5. Dados disponiveis para dashboard Contratado x Realizado (UC-CR01)

### Layout da Tela — ProducaoPage > Detalhe do Contrato

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Detalhe do Contrato CT-2026/001                               │
│ Orgao: USP  |  Edital: PE-032/2026  |  Status: [🟢 OK]                 │
│ Valor: R$ 28.000,00  |  Vigencia: 01/02/2026 a 01/08/2026              │
│                                                                          │
│ [ActionButton: Voltar]  [ActionButton: Editar Contrato]                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Entregas do Contrato ─────────────────────────────────────────┐│
│ │ [ActionButton: + Nova Entrega]                                        ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Descricao      │ Qtd │ Valor Un. │ Previsto  │ Realizado│Status│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Microscopio Mod │ 1   │ R$14.000  │ 15/03/26  │ 12/03/26 │[🟢] │   ││
│ │ │ NF: 001234      │ Empenho: 2026NE00456                  │     │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ Microscopio Mod │ 1   │ R$14.000  │ 30/03/26  │ —        │[🟡] │   ││
│ │ │ NF: —           │ Empenho: —                             │     │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Resumo ──                                                          ││
│ │ Entregas concluidas: 1/2  |  Valor entregue: R$ 14.000/28.000        ││
│ │ Proxima entrega: 30/03/2026 (3 dias)                                  ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Nova Entrega ────────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ [TextInput: Descricao do Item]  "Microscopio Modelo XYZ-500"          ││
│ │ [NumberInput: Quantidade]  ___                                        ││
│ │ [NumberInput: Valor Unitario]  R$ ___________                         ││
│ │ [Display: Valor Total]  R$ 14.000,00 (calculado)                      ││
│ │                                                                       ││
│ │ [DateInput: Data Prevista]  __/__/____                                ││
│ │ [DateInput: Data Realizada]  __/__/____ (preencher na entrega)        ││
│ │                                                                       ││
│ │ ── Nota Fiscal ──                                                     ││
│ │ [TextInput: Numero da NF]  ___________                                ││
│ │ [TextInput: Numero do Empenho]  ___________                           ││
│ │ [FileUpload: Arquivo NF]  .pdf / .xml                                 ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Entrega]  [ActionButton: Cancelar]              ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT02-F01 | Cabecalho Contrato | Display readonly | — | Numero, orgao, edital, status, valor e vigencia do contrato |
| CT02-F02 | Botao Nova Entrega | ActionButton primary | — | Abre modal de registro de nova entrega |
| CT02-F03 | Tabela Entregas | DataTable | — | Colunas: Descricao, Qtd, Valor Unitario, Data Prevista, Data Realizada, Status. Sub-linha com NF e Empenho |
| CT02-F04 | Descricao Item | TextInput | Sim | Descricao do item entregue. Autocomplete se produto vinculado |
| CT02-F05 | Quantidade | NumberInput | Sim | Quantidade de itens entregues |
| CT02-F06 | Valor Unitario | NumberInput | Sim | Valor unitario do item entregue |
| CT02-F07 | Valor Total Calculado | Display | — | Calculado automaticamente: quantidade x valor unitario |
| CT02-F08 | Data Prevista | DateInput | Sim | Data prevista para entrega conforme contrato |
| CT02-F09 | Data Realizada | DateInput | Nao | Data efetiva da entrega. Nulo enquanto pendente |
| CT02-F10 | Numero NF | TextInput | Nao | Numero da nota fiscal emitida para a entrega |
| CT02-F11 | Numero Empenho | TextInput | Nao | Numero do empenho vinculado a entrega |
| CT02-F12 | Arquivo NF | FileUpload | Nao | Upload do arquivo da NF (.pdf ou .xml DANFE) |
| CT02-F13 | Botao Salvar Entrega | ActionButton primary | — | Salva entrega via POST /api/contratos/{id}/entregas |
| CT02-F14 | Resumo Entregas | Display | — | Entregas concluidas vs total, valor entregue vs contratado, proxima entrega |
| CT02-F15 | Status Entrega | Badge colorido | — | Verde: entregue, Amarelo: pendente (prazo proximo), Vermelho: atrasado (prazo vencido) |

### Sequencia de Eventos

1. Usuario acessa **ProducaoPage** e clica em um contrato na tabela para ver detalhes
2. Sistema exibe **[CT02-F01]** com dados do contrato e **[CT02-F03]** com entregas existentes
3. **[CT02-F14]** mostra resumo: entregas concluidas, valor entregue, proxima entrega
4. Usuario clica **[CT02-F02] Nova Entrega** — modal abre
5. Usuario preenche **[CT02-F04]** descricao do item (autocomplete se produto vinculado)
6. Usuario preenche **[CT02-F05]** quantidade e **[CT02-F06]** valor unitario
7. **[CT02-F07]** calcula valor total automaticamente (qtd x valor unitario)
8. Usuario preenche **[CT02-F08]** data prevista (obrigatoria)
9. Se entrega ja realizada, usuario preenche **[CT02-F09]** data realizada
10. Opcionalmente, usuario preenche **[CT02-F10]** numero NF, **[CT02-F11]** empenho e faz upload em **[CT02-F12]**
11. Usuario clica **[CT02-F13] Salvar** — backend insere na tabela `contrato_entregas`
12. Status da entrega definido automaticamente: "entregue" (se data realizada preenchida) ou "pendente"
13. **[CT02-F03]** atualiza com nova entrega e **[CT02-F15]** exibe badge colorido
14. Status do contrato recalculado: se alguma entrega atrasada, contrato muda para "atrasado"

### Implementacao Atual
**⚠️ PARCIAL** — Mock frontend em `ProducaoPage.tsx` possui modal de entrega e modal de NF (botoes existem). Modelo `ContratoEntrega` existe em `models.py` com todos os campos (descricao, quantidade, valor_unitario, valor_total, data_prevista, data_realizada, nota_fiscal, numero_empenho, status). Pendente: integracao frontend-backend via API CRUD, upload de arquivo NF, calculo automatico de valor total, recalculo de status do contrato.

---

## [UC-CT03] Acompanhar Cronograma de Entregas

**RF relacionado:** RF-046-04, RF-046-05
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um contrato cadastrado com entregas previstas (UC-CT02)
3. Entregas possuem data_prevista definida
4. Tabela `contrato_entregas` com registros vinculados a contratos ativos

### Pos-condicoes
1. Cronograma visual exibido com todas as entregas do portfolio de contratos
2. Entregas atrasadas sinalizadas visualmente
3. Alertas configurados para entregas proximas do vencimento

### Layout da Tela — ProducaoPage > Aba "Cronograma"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Execucao de Contratos                                         │
│ Gestao de contratos, entregas e notas fiscais                           │
│                                                                          │
│ [Aba: Contratos] [Aba: Cronograma ●] [Aba: Aditivos] [Aba: Gestor]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Pendentes]  [Card: Entregues] [Card: Atrasados] [Card: Valor]││
│ │    8 entregas         15 (62%)         3 (13%)        R$ 245.000    ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Timeline de Entregas ─────────────────────────────────────────┐│
│ │                                                                       ││
│ │ [SelectInput: Mes ▼]  Marco/2026                                      ││
│ │ [SelectInput: Contrato ▼]  Todos                                      ││
│ │                                                                       ││
│ │ ── Semana 1 (01/03 - 07/03) ──────────────────────────────────────   ││
│ │ │ 01/03 │ [🟢] Autoclave AM-123      │ UNESP  │ R$ 35.000 │ Entreg.││
│ │                                                                       ││
│ │ ── Semana 2 (08/03 - 14/03) ──────────────────────────────────────   ││
│ │ │ 12/03 │ [🟢] Microscopio XYZ #1    │ USP    │ R$ 14.000 │ Entreg.││
│ │                                                                       ││
│ │ ── Semana 3 (15/03 - 21/03) ──────────────────────────────────────   ││
│ │ │ 15/03 │ [🟡] Centrifuga XYZ-2000   │ UFMG   │ R$ 45.000 │ Pend. ││
│ │ │ 20/03 │ [🟡] Microscopio XYZ #2    │ USP    │ R$ 14.000 │ Pend. ││
│ │                                                                       ││
│ │ ── Semana 4 (22/03 - 31/03) ──────────────────────────────────────   ││
│ │ │ 30/03 │ [🟡] Microscopio XYZ #2    │ USP    │ R$ 14.000 │ Pend. ││
│ │                                                                       ││
│ │ ── ATRASADOS ─────────────────────────────────────────────────────   ││
│ │ │ 01/02 │ [🔴] Reagente TR-001       │ UNICAMP│ R$ 15.000 │ -54d  ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Proximos Vencimentos (7 dias) ────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Entrega             │ Contrato    │ Orgao  │ Prazo    │ Dias   │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Microscopio XYZ #2  │ CT-001/2026 │ USP    │ 30/03/26 │ 3 dias │   ││
│ │ │ Centrifuga XYZ-2000 │ CT-002/2026 │ UFMG   │ 02/04/26 │ 6 dias │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ [ActionButton: Configurar Alertas de Entrega]                         ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT03-F01 | Stats Pendentes | DisplayCard | — | Entregas com status "pendente" em todos os contratos |
| CT03-F02 | Stats Entregues | DisplayCard | — | Entregas com status "entregue" (percentual) |
| CT03-F03 | Stats Atrasados | DisplayCard | — | Entregas com data_prevista < hoje e status != "entregue" |
| CT03-F04 | Stats Valor Total | DisplayCard | — | Soma de valor_total de todas as entregas pendentes |
| CT03-F05 | Filtro Mes | SelectInput | Nao | Seleciona mes para visualizacao do cronograma. Default: mes atual |
| CT03-F06 | Filtro Contrato | SelectInput | Nao | Filtra entregas de um contrato especifico. Default: "Todos" |
| CT03-F07 | Timeline Semanal | TimelineView | — | Agrupamento de entregas por semana do mes, com cor por status |
| CT03-F08 | Badge Entrega Verde | Badge | — | Entrega realizada (data_realizada preenchida) |
| CT03-F09 | Badge Entrega Amarelo | Badge | — | Entrega pendente com prazo no futuro |
| CT03-F10 | Badge Entrega Vermelho | Badge | — | Entrega atrasada (data_prevista < hoje, sem data_realizada) |
| CT03-F11 | Secao Atrasados | Display destaque | — | Secao especial para entregas atrasadas (sempre visivel) |
| CT03-F12 | Tabela Proximos Vencimentos | DataTable | — | Entregas com prazo nos proximos 7 dias. Colunas: Entrega, Contrato, Orgao, Prazo, Dias |
| CT03-F13 | Botao Config. Alertas | ActionButton secondary | — | Abre configuracao de alertas para entregas (integra UC-FU02) |

### Sequencia de Eventos

1. Usuario acessa **ProducaoPage** e clica na aba **"Cronograma"**
2. Sistema carrega stats **[CT03-F01]** a **[CT03-F04]** agregando todas as entregas
3. **[CT03-F07]** exibe timeline do mes atual com entregas agrupadas por semana
4. Cada entrega exibe badge colorido: **[CT03-F08]** verde, **[CT03-F09]** amarelo, **[CT03-F10]** vermelho
5. **[CT03-F11]** secao "ATRASADOS" exibe entregas vencidas com destaque vermelho
6. Usuario pode filtrar por mes via **[CT03-F05]** ou por contrato via **[CT03-F06]**
7. **[CT03-F12]** exibe entregas dos proximos 7 dias como lista de urgencia
8. Usuario pode clicar em uma entrega na timeline para ir ao detalhe do contrato (UC-CT02)
9. Usuario clica **[CT03-F13]** para configurar alertas automaticos para entregas
10. Sistema integra com `tool_configurar_alertas` (tipo="entrega") para disparar notificacoes
11. Timeline atualiza automaticamente quando entregas sao registradas (UC-CT02)
12. Dados do cronograma alimentam dashboard Contratado x Realizado (UC-CR01)

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — ProducaoPage atual tem apenas lista de contratos com status simples. Nao possui aba de cronograma, timeline visual, agrupamento por semana ou secao de proximos vencimentos. Modelo `ContratoEntrega` existe com `data_prevista` e `data_realizada` mas nao ha endpoint ou view de cronograma.

---

## [UC-CT04] Gestao de Aditivos (NOVO — Lei 14.133/2021)

**RF relacionado:** NOVO (Art. 124-126, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contrato cadastrado e ativo (UC-CT01)
3. Valor original do contrato registrado
4. Fundamentacao legal da Lei 14.133/2021 carregada como referencia

### Pos-condicoes
1. Aditivo registrado na tabela `contrato_aditivos` (novo modelo)
2. Valor acumulado de aditivos calculado e validado contra limites legais
3. Alerta emitido se percentual de aditivos se aproxima do limite (25% ou 50%)
4. Historico de aditivos disponivel para auditoria

### Layout da Tela — ProducaoPage > Detalhe do Contrato > Tab "Aditivos"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Detalhe do Contrato CT-2026/001                               │
│ Orgao: USP  |  Valor Original: R$ 28.000,00                             │
│                                                                          │
│ [Tab: Entregas] [Tab: Aditivos ●] [Tab: Gestor/Fiscal]                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Limites Legais de Aditivo ────────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Limite de Acrescimo (Art. 125 — Obras/Servicos) ──                ││
│ │ Valor Original: R$ 28.000,00                                          ││
│ │ Limite 25%:     R$ 7.000,00                                           ││
│ │ Consumido:      R$ 3.500,00 (12,5%)                                   ││
│ │                                                                       ││
│ │ [ProgressBar: ██████████████░░░░░░░░░░░░░░░░ 50% do limite 25%]      ││
│ │ [Badge: 🟢 Dentro do limite legal]                                    ││
│ │                                                                       ││
│ │ ── Limite de Supressao (Art. 125) ──                                  ││
│ │ Supressao acumulada: R$ 0,00 (0%)                                     ││
│ │ Limite 25%:          R$ 7.000,00                                      ││
│ │ [ProgressBar: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% do limite 25%]        ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Aditivos Registrados ─────────────────────────────────────────┐│
│ │ [ActionButton: + Novo Aditivo]                                        ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ # │ Tipo     │ Justificativa         │ Valor Orig.│ Valor Adit.│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ 1 │ Valor    │ Acrescimo quantitativo│ R$ 28.000  │ +R$ 2.000  │   ││
│ │ │   │ Data: 15/03/2026 | Fundamento: Art. 124, I   │              │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ 2 │ Prazo    │ Prorrogacao por atraso│ —          │ +30 dias    │   ││
│ │ │   │ Data: 20/03/2026 | Fundamento: Art. 124, II  │              │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ 3 │ Valor    │ Reajuste contratual   │ R$ 30.000  │ +R$ 1.500  │   ││
│ │ │   │ Data: 25/03/2026 | Fundamento: Art. 124, I   │              │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Novo Aditivo ────────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ [SelectInput: Tipo de Aditivo ▼]                                      ││
│ │   Opcoes: Valor (acrescimo) | Valor (supressao) | Prazo | Escopo     ││
│ │                                                                       ││
│ │ [TextArea: Justificativa]                                             ││
│ │   "Necessidade de acrescimo quantitativo..."                          ││
│ │                                                                       ││
│ │ [NumberInput: Valor do Aditivo]  R$ ___________   (se tipo=Valor)     ││
│ │ [NumberInput: Dias de Prorrogacao]  ___  dias     (se tipo=Prazo)     ││
│ │ [TextArea: Alteracao de Escopo]                   (se tipo=Escopo)    ││
│ │                                                                       ││
│ │ [DateInput: Data do Aditivo]  __/__/____                              ││
│ │                                                                       ││
│ │ [SelectInput: Fundamentacao Legal ▼]                                  ││
│ │   Opcoes: Art. 124, I | Art. 124, II | Art. 124, III |                ││
│ │           Art. 124, IV | Art. 124, V | Art. 125 | Art. 126           ││
│ │                                                                       ││
│ │ [FileUpload: Documento do Aditivo]  .pdf                              ││
│ │                                                                       ││
│ │ [ActionButton: Registrar Aditivo]  [ActionButton: Cancelar]           ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT04-F01 | Display Valor Original | Display readonly | — | Valor original do contrato (fonte: `contratos.valor_total`) |
| CT04-F02 | Display Limite 25% | Display readonly | — | Calculado: valor_original x 0.25 (limite legal de acrescimo/supressao) |
| CT04-F03 | Display Consumido | Display readonly | — | Soma dos aditivos de valor ja registrados. Percentual sobre valor original |
| CT04-F04 | ProgressBar Acrescimo | ProgressBar | — | Percentual consumido do limite de 25%. Cor muda: verde (<50%), amarelo (50-80%), vermelho (>80%) |
| CT04-F05 | Badge Limite Legal | Badge colorido | — | Verde: dentro do limite, Amarelo: >80% do limite, Vermelho: excedeu limite |
| CT04-F06 | ProgressBar Supressao | ProgressBar | — | Percentual de supressao acumulada vs limite de 25% |
| CT04-F07 | Botao Novo Aditivo | ActionButton primary | — | Abre modal de registro de aditivo |
| CT04-F08 | Tabela Aditivos | DataTable | — | Colunas: #, Tipo, Justificativa, Valor Original, Valor Aditivo, Data, Fundamento |
| CT04-F09 | Tipo de Aditivo | SelectInput | Sim | Opcoes: Valor (acrescimo), Valor (supressao), Prazo, Escopo |
| CT04-F10 | Justificativa | TextArea | Sim | Justificativa tecnica/administrativa para o aditivo |
| CT04-F11 | Valor do Aditivo | NumberInput | Condicional | Obrigatorio se tipo=Valor. Valor monetario do aditivo |
| CT04-F12 | Dias Prorrogacao | NumberInput | Condicional | Obrigatorio se tipo=Prazo. Dias de prorrogacao do contrato |
| CT04-F13 | Data do Aditivo | DateInput | Sim | Data de formalizacao do aditivo |
| CT04-F14 | Fundamentacao Legal | SelectInput | Sim | Artigo da Lei 14.133 que fundamenta o aditivo |
| CT04-F15 | Documento Aditivo | FileUpload | Nao | Upload do termo aditivo assinado (.pdf) |
| CT04-F16 | Botao Registrar | ActionButton primary | — | Salva aditivo. Valida se nao excede limite legal (alerta se exceder) |

### Sequencia de Eventos

1. Usuario acessa detalhe de um contrato na **ProducaoPage** e clica tab **"Aditivos"**
2. Sistema carrega limites legais: **[CT04-F01]** valor original, **[CT04-F02]** limite 25%
3. **[CT04-F03]** mostra valor ja consumido e **[CT04-F04]** barra de progresso visual
4. **[CT04-F05]** exibe badge de conformidade legal (verde/amarelo/vermelho)
5. **[CT04-F08]** lista aditivos ja registrados com tipo, valor e fundamentacao
6. Usuario clica **[CT04-F07] Novo Aditivo** — modal abre
7. Usuario seleciona **[CT04-F09]** tipo (ex: "Valor — acrescimo")
8. Sistema mostra campos condicionais: **[CT04-F11]** valor (se tipo=Valor) ou **[CT04-F12]** dias (se tipo=Prazo)
9. Usuario preenche **[CT04-F10]** justificativa e **[CT04-F14]** fundamentacao legal
10. **Validacao:** se tipo=Valor e acrescimo acumulado exceder 25%, sistema exibe alerta critico
11. **Validacao:** sistema permite salvar com alerta, mas registra flag de "limite excedido"
12. Usuario preenche **[CT04-F13]** data e opcionalmente faz upload em **[CT04-F15]**
13. Usuario clica **[CT04-F16] Registrar** — backend salva na tabela `contrato_aditivos`
14. **[CT04-F04]** atualiza barra de progresso com novo percentual consumido
15. Se limite excedido ou proximo (>80%), sistema dispara alerta ao usuario

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — Novo caso de uso baseado na pesquisa da Lei 14.133/2021 (Arts. 124-126). Modelo `ContratoAditivo` nao existe. Necessario: criar modelo no backend (tipo, justificativa, valor, data, fundamentacao), criar endpoints CRUD, implementar calculo de limites legais (25%/50%), implementar tab "Aditivos" na ProducaoPage.

---

## [UC-CT05] Designar Gestor/Fiscal (NOVO — Lei 14.133/2021)

**RF relacionado:** NOVO (Art. 117, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial / Gestor Administrativo)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contrato cadastrado e ativo (UC-CT01)
3. Dados de responsaveis da empresa cadastrados (RF-003)
4. Conhecimento dos requisitos do Art. 117 da Lei 14.133

### Pos-condicoes
1. Gestor e fiscal(is) designados e registrados na tabela `contrato_designacoes` (novo modelo)
2. Portaria de designacao vinculada ao contrato
3. Atividades de gestao/fiscalizacao registraveis (atesto, medicao, parecer)
4. Historico de atuacao dos designados disponivel para auditoria

### Layout da Tela — ProducaoPage > Detalhe do Contrato > Tab "Gestor/Fiscal"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Detalhe do Contrato CT-2026/001                               │
│ Orgao: USP  |  Valor: R$ 28.000,00                                      │
│                                                                          │
│ [Tab: Entregas] [Tab: Aditivos] [Tab: Gestor/Fiscal ●]                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Designacoes do Contrato ──────────────────────────────────────┐│
│ │ [ActionButton: + Nova Designacao]                                     ││
│ │                                                                       ││
│ │ ── Gestor do Contrato (Art. 117, caput) ──                           ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Nome:     Maria Silva Costa                                     │   ││
│ │ │ Cargo:    Coordenadora de Compras                                │   ││
│ │ │ Portaria: Port. 045/2026 de 01/02/2026                          │   ││
│ │ │ Periodo:  01/02/2026 a 01/08/2026                                │   ││
│ │ │ Status:   [🟢 Ativo]                                             │   ││
│ │ │ [ActionButton: Editar]  [ActionButton: Encerrar]                 │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Fiscal Tecnico (Art. 117, §1o) ──                                 ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Nome:     Carlos Ferreira Santos                                 │   ││
│ │ │ Cargo:    Engenheiro Biomedico                                   │   ││
│ │ │ Portaria: Port. 046/2026 de 01/02/2026                          │   ││
│ │ │ Periodo:  01/02/2026 a 01/08/2026                                │   ││
│ │ │ Status:   [🟢 Ativo]                                             │   ││
│ │ │ [ActionButton: Editar]  [ActionButton: Encerrar]                 │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Fiscal Administrativo (Art. 117, §1o) ──                          ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ [Badge: 🔴 Nao designado]                                       │   ││
│ │ │ [ActionButton: Designar Fiscal Administrativo]                   │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Registro de Atividades ───────────────────────────────────────┐│
│ │ [ActionButton: + Nova Atividade]                                      ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Data       │ Tipo        │ Responsavel      │ Descricao         │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ 25/03/2026 │ Atesto      │ C. Ferreira (FT) │ Atesto receb. #1  │   ││
│ │ │ 20/03/2026 │ Medicao     │ C. Ferreira (FT) │ Medicao mensal    │   ││
│ │ │ 15/03/2026 │ Parecer     │ M. Silva (G)     │ Parecer entrega   │   ││
│ │ │ 10/03/2026 │ Fiscalizacao│ C. Ferreira (FT) │ Visita tecnica    │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Nova Designacao ─────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ [SelectInput: Funcao ▼]                                               ││
│ │   Opcoes: Gestor | Fiscal Tecnico | Fiscal Administrativo             ││
│ │                                                                       ││
│ │ [TextInput: Nome Completo]  ___________                               ││
│ │ [TextInput: Cargo/Funcao]   ___________                               ││
│ │ [TextInput: Portaria de Designacao]  ___________                      ││
│ │                                                                       ││
│ │ [DateInput: Data Inicio]  __/__/____                                  ││
│ │ [DateInput: Data Fim]     __/__/____                                  ││
│ │                                                                       ││
│ │ [FileUpload: Portaria (PDF)]  .pdf                                    ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Designacao]  [ActionButton: Cancelar]           ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT05-F01 | Botao Nova Designacao | ActionButton primary | — | Abre modal de registro de nova designacao de gestor ou fiscal |
| CT05-F02 | Card Gestor | DisplayCard | — | Exibe dados do Gestor do Contrato: nome, cargo, portaria, periodo, status |
| CT05-F03 | Card Fiscal Tecnico | DisplayCard | — | Exibe dados do Fiscal Tecnico: nome, cargo, portaria, periodo, status |
| CT05-F04 | Card Fiscal Admin | DisplayCard | — | Exibe dados do Fiscal Administrativo ou badge "Nao designado" |
| CT05-F05 | Funcao Designacao | SelectInput | Sim | Opcoes: Gestor, Fiscal Tecnico, Fiscal Administrativo |
| CT05-F06 | Nome Completo | TextInput | Sim | Nome completo do designado. Autocomplete de responsaveis cadastrados (RF-003) |
| CT05-F07 | Cargo/Funcao | TextInput | Sim | Cargo ou funcao do designado na empresa |
| CT05-F08 | Portaria Designacao | TextInput | Sim | Numero e data da portaria de designacao |
| CT05-F09 | Data Inicio | DateInput | Sim | Data de inicio da designacao |
| CT05-F10 | Data Fim | DateInput | Sim | Data de termino da designacao (geralmente = vigencia do contrato) |
| CT05-F11 | Upload Portaria | FileUpload | Nao | Upload do PDF da portaria de designacao |
| CT05-F12 | Tabela Atividades | DataTable | — | Colunas: Data, Tipo (Atesto/Medicao/Parecer/Fiscalizacao), Responsavel, Descricao |
| CT05-F13 | Botao Nova Atividade | ActionButton | — | Abre modal para registrar atividade de gestao/fiscalizacao |
| CT05-F14 | Botao Editar Designacao | ActionButton secondary | — | Edita dados da designacao (exceto funcao) |
| CT05-F15 | Botao Encerrar Designacao | ActionButton danger | — | Encerra designacao antes do prazo com justificativa |

### Sequencia de Eventos

1. Usuario acessa detalhe de contrato na **ProducaoPage** e clica tab **"Gestor/Fiscal"**
2. Sistema exibe cards de designacao: **[CT05-F02]** Gestor, **[CT05-F03]** Fiscal Tecnico, **[CT05-F04]** Fiscal Admin
3. Cards preenchidos mostram dados completos; cards vazios mostram badge "Nao designado"
4. Usuario clica **[CT05-F01] Nova Designacao** — modal abre
5. Usuario seleciona **[CT05-F05]** funcao (ex: "Fiscal Tecnico")
6. Usuario preenche **[CT05-F06]** nome (autocomplete de responsaveis RF-003)
7. Sistema auto-preenche **[CT05-F07]** cargo se responsavel selecionado do cadastro
8. Usuario preenche **[CT05-F08]** portaria, **[CT05-F09]** e **[CT05-F10]** datas
9. Opcionalmente faz upload da portaria em **[CT05-F11]**
10. **Validacao:** nao permite designar mesma pessoa como Gestor e Fiscal (Art. 117, §5o)
11. Usuario salva — backend insere na tabela `contrato_designacoes`
12. Card correspondente atualiza com dados do designado
13. Para registrar atividade: usuario clica **[CT05-F13]** e preenche tipo/descricao
14. **[CT05-F12]** atualiza com nova atividade registrada
15. Historico de atividades disponivel para auditoria e relatorios

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — Novo caso de uso baseado na pesquisa do Art. 117 da Lei 14.133/2021. Modelo `ContratoDesignacao` nao existe. Necessario: criar modelo (funcao, nome, cargo, portaria, datas), criar modelo de atividades (tipo, descricao, data), endpoints CRUD, tab "Gestor/Fiscal" na ProducaoPage, validacao de incompatibilidade gestor x fiscal.

---

## [UC-CT06] Saldo de ARP / Controle de Carona (NOVO — Lei 14.133/2021)

**RF relacionado:** NOVO (Art. 82-86, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos uma ata de registro de preco salva (UC-AT01/AT03)
3. Dados de itens da ARP extraidos com quantidades registradas (UC-AT02)
4. Conhecimento dos limites legais de adesao (carona)

### Pos-condicoes
1. Saldo por item da ARP calculado e exibido
2. Consumo de participante e carona controlados separadamente
3. Solicitacoes de carona registradas com status
4. Alertas de esgotamento de saldo ou vigencia emitidos

### Layout da Tela — AtasPage > Aba "Saldo ARP"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ATAS DE PREGAO                                                           │
│ Busca, extracao e gestao de atas de registro de preco                   │
│                                                                          │
│ [Aba: Buscar] [Aba: Extrair] [Aba: Minhas Atas] [Aba: Saldo ARP ●]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CARD: Selecao da ARP ──────────────────────────────────────────────┐│
│ │ [SelectInput: Ata de Registro de Preco ▼]                             ││
│ │   "ARP PE 15/2025 — UFMG — Reagentes Hematologia"                   ││
│ │                                                                       ││
│ │ Vigencia: 15/03/2025 a 15/03/2026                                    ││
│ │ [Badge: 🟢 Vigente — 353 dias restantes]                              ││
│ │ [ProgressBar Vigencia: ████████████████████░░░░░░░ 3% consumido]     ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Saldo por Item ───────────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Item            │ Registrado│ Partic. │ Carona│ Saldo │ %       │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Reagente hemogr.│ 500 kit   │ 200     │ 50    │ 250   │ 50%     │   ││
│ │ │ [ProgressBar: ██████████████████████████░░░░ 50% consumido]     │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ Controle hematol│ 100 und   │ 40      │ 10    │ 50    │ 50%     │   ││
│ │ │ [ProgressBar: ██████████████████████████░░░░ 50% consumido]     │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ Ponteira pipeta │ 10000 un  │ 8000    │ 1500  │ 500   │ 95%     │   ││
│ │ │ [ProgressBar: █████████████████████████████ 95% consumido]      │   ││
│ │ │ [Badge: 🔴 Saldo critico — solicitar reposicao]                 │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Limites de Carona (Art. 86) ──────────────────────────────────┐│
│ │                                                                       ││
│ │ Limite individual por orgao carona: 50% dos itens registrados         ││
│ │ Limite global de carona: 2x (dobro) dos itens registrados             ││
│ │                                                                       ││
│ │ [ProgressBar Individual: ██████████████░░░░░░░ 33% de 50%]           ││
│ │ [ProgressBar Global:     ████████░░░░░░░░░░░░ 15% de 200%]           ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Solicitacoes de Carona ───────────────────────────────────────┐│
│ │ [ActionButton: + Nova Solicitacao]                                    ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Orgao Solicitante│ Item           │ Qtd  │ Status              │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ HC-UFPE           │ Reagente hemogr│ 30   │ [🟢 Autorizado]    │   ││
│ │ │ UFBA              │ Ponteira pipeta│ 500  │ [🟡 Pendente]      │   ││
│ │ │ UFRN              │ Controle hemat.│ 20   │ [🔴 Negado — saldo]│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Nova Solicitacao de Carona ──────────────────────────────────┐│
│ │                                                                       ││
│ │ [TextInput: Orgao Solicitante]  ___________                           ││
│ │ [SelectInput: Item ▼]  "Reagente hemograma"                           ││
│ │ [NumberInput: Quantidade Solicitada]  ___                              ││
│ │ [Display: Saldo Disponivel]  250 unidades                             ││
│ │ [Display: Limite Carona]  250 unidades (50% de 500)                   ││
│ │                                                                       ││
│ │ [ActionButton: Registrar Solicitacao]  [ActionButton: Cancelar]       ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CT06-F01 | Seletor ARP | SelectInput | Sim | Lista atas consultadas (atas_consultadas). Formato: "ARP {numero} — {orgao} — {titulo}" |
| CT06-F02 | Display Vigencia | Display + Badge | — | Periodo de vigencia da ARP com badge verde/vermelho e dias restantes |
| CT06-F03 | ProgressBar Vigencia | ProgressBar | — | Percentual de tempo consumido da vigencia da ARP |
| CT06-F04 | Tabela Saldo por Item | DataTable | — | Colunas: Item, Qtd Registrada, Consumo Participante, Consumo Carona, Saldo, % Consumido |
| CT06-F05 | ProgressBar Item | ProgressBar por linha | — | Percentual consumido por item. Verde (<70%), Amarelo (70-90%), Vermelho (>90%) |
| CT06-F06 | Badge Saldo Critico | Badge | — | Exibido quando saldo < 10% do registrado. Alerta para reposicao |
| CT06-F07 | ProgressBar Limite Indiv. | ProgressBar | — | Consumo de carona por orgao individual vs limite 50% (Art. 86) |
| CT06-F08 | ProgressBar Limite Global | ProgressBar | — | Consumo total de carona vs limite 2x (dobro) dos itens registrados |
| CT06-F09 | Botao Nova Solicitacao | ActionButton primary | — | Abre modal de registro de solicitacao de carona |
| CT06-F10 | Tabela Solicitacoes | DataTable | — | Colunas: Orgao Solicitante, Item, Quantidade, Status (Pendente/Autorizado/Negado) |
| CT06-F11 | Orgao Solicitante | TextInput | Sim | Nome do orgao que solicita adesao (carona) |
| CT06-F12 | Item Solicitado | SelectInput | Sim | Item da ARP solicitado. Mostra saldo disponivel |
| CT06-F13 | Quantidade Solicitada | NumberInput | Sim | Quantidade de itens solicitados pelo orgao carona |
| CT06-F14 | Display Saldo | Display readonly | — | Saldo atual do item selecionado |
| CT06-F15 | Display Limite | Display readonly | — | Limite de carona para o item (50% do registrado por orgao) |

### Sequencia de Eventos

1. Usuario acessa **AtasPage** e clica na aba **"Saldo ARP"**
2. Usuario seleciona ARP em **[CT06-F01]** — sistema carrega dados da ata
3. **[CT06-F02]** exibe vigencia com badge e **[CT06-F03]** progresso temporal
4. **[CT06-F04]** lista todos os itens da ARP com saldo calculado
5. Cada item exibe **[CT06-F05]** barra de consumo com cor por criticidade
6. Itens com saldo < 10% exibem **[CT06-F06]** badge de alerta critico
7. **[CT06-F07]** e **[CT06-F08]** mostram consumo vs limites legais de carona
8. **[CT06-F10]** lista solicitacoes de carona recebidas com status
9. Para registrar carona: usuario clica **[CT06-F09]** — modal abre
10. Usuario preenche **[CT06-F11]** orgao, seleciona **[CT06-F12]** item
11. **[CT06-F14]** mostra saldo e **[CT06-F15]** limite de carona em tempo real
12. Usuario preenche **[CT06-F13]** quantidade solicitada
13. **Validacao:** sistema verifica se quantidade nao excede saldo nem limite de carona
14. Se excede, sistema bloqueia e exibe motivo ("Saldo insuficiente" ou "Limite de carona excedido")
15. Usuario confirma — solicitacao registrada com status "Pendente" ou "Autorizado"

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — Novo caso de uso baseado na pesquisa dos Arts. 82-86 da Lei 14.133/2021. Modelo `ARPSaldo` nao existe. Necessario: criar modelo (ata_id, item, qtd_registrada, consumo_participante, consumo_carona), criar modelo de solicitacoes de carona, endpoints CRUD, aba "Saldo ARP" na AtasPage, calculo de limites legais, validacao de saldo.

---

---

# FASE 4 — CONTRATADO X REALIZADO

---

## [UC-CR01] Dashboard Contratado X Realizado

**RF relacionado:** RF-051
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um contrato cadastrado com entregas (UC-CT01 + UC-CT02)
3. Interface `ContratoComparativo` disponivel com campos: edital, orgao, produto, valorContratado, valorRealizado, variacao, status
4. Endpoint GET /api/dashboard/contratado-realizado implementado

### Pos-condicoes
1. Dashboard exibe comparativo visual de todos os contratos
2. Indicadores de desvio calculados e sinalizados
3. Dados agregados por periodo disponibilizados
4. Alertas de variacao critica configurados

### Layout da Tela — ContratadoRealizadoPage > Secao Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTRATADO X REALIZADO                                                   │
│ Comparativo de valores contratados vs efetivamente realizados           │
│                                                                          │
│ [Aba: Dashboard ●] [Aba: Atrasos] [Aba: Vencimentos]                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Total Contratado]  [Card: Total Realizado]                     ││
│ │    R$ 123.000,00             R$ 119.200,00                            ││
│ │                                                                       ││
│ │ [Card: Variacao %]        [Card: Contratos Ativos]                    ││
│ │    -3,1% [🟢 Economia]      4 contratos                              ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Filtros ──────────────────────────────────────────────────────┐│
│ │ [SelectInput: Periodo ▼]  [SelectInput: Status ▼]                     ││
│ │   "6 meses"                  "Todos"                                  ││
│ │   Opcoes: 3m | 6m | 12m | Todo o periodo                            ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Comparativo por Contrato ─────────────────────────────────────┐│
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Contrato    │ Orgao  │ Produto   │ Contratado │ Realizado│ Var. │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-032/2026 │ USP    │ Microscop.│ R$ 28.000  │ R$ 28.000│ 0,0%│   ││
│ │ │ [Badge: 🟢 Conforme]                                           │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-018/2026 │ UFMG   │ Centrifug.│ R$ 45.000  │ R$ 42.000│-6,7%│   ││
│ │ │ [Badge: 🟢 Economia de R$ 3.000]                               │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-020/2026 │ UNESP  │ Autoclave │ R$ 35.000  │ R$ 35.000│ 0,0%│   ││
│ │ │ [Badge: 🟡 Em andamento]                                       │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-015/2026 │ UNICAMP│ Reagentes │ R$ 15.000  │ R$ 14.200│-5,3%│   ││
│ │ │ [Badge: 🟢 Economia de R$ 800]                                 │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Totais ──                                                          ││
│ │ Contratado: R$ 123.000  |  Realizado: R$ 119.200  |  Var: -3,1%     ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Indicadores de Desvio ────────────────────────────────────────┐│
│ │                                                                       ││
│ │ Contratos conforme (var. 0%):        2 (50%)                          ││
│ │ Contratos com economia (var. < 0%):  2 (50%)                          ││
│ │ Contratos com estouro (var. > 0%):   0 (0%)                           ││
│ │ Maior economia:   PE-018/2026 — UFMG (-6,7% / R$ 3.000)             ││
│ │ Maior estouro:    — nenhum —                                          ││
│ │                                                                       ││
│ │ [Badge: 🟢 Portfolio saudavel — variacao dentro do esperado]          ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CR01-F01 | Stat Total Contratado | DisplayCard | — | Soma de `valorContratado` de todos os contratos no periodo |
| CR01-F02 | Stat Total Realizado | DisplayCard | — | Soma de `valorRealizado` de todos os contratos no periodo |
| CR01-F03 | Stat Variacao | DisplayCard | — | Percentual de variacao: ((realizado - contratado) / contratado) x 100. Badge verde (economia) ou vermelho (estouro) |
| CR01-F04 | Stat Contratos Ativos | DisplayCard | — | Contador de contratos no periodo selecionado |
| CR01-F05 | Filtro Periodo | SelectInput | Nao | Opcoes: 3 meses, 6 meses, 12 meses, Todo o periodo. Default: 6 meses |
| CR01-F06 | Filtro Status | SelectInput | Nao | Opcoes: Todos, Concluidos, Em Andamento. Default: Todos |
| CR01-F07 | Tabela Comparativa | DataTable | — | Colunas: Contrato, Orgao, Produto, Contratado, Realizado, Variacao %, Badge status |
| CR01-F08 | Badge Desvio | Badge colorido | — | Verde: conforme (var 0%) ou economia (var < 0%), Amarelo: em andamento, Vermelho: estouro (var > 5%) |
| CR01-F09 | Linha Totais | Display | — | Totalizadores: soma contratado, soma realizado, variacao global |
| CR01-F10 | Indicador Conformes | Display | — | Qtd e % de contratos com variacao = 0% |
| CR01-F11 | Indicador Economias | Display | — | Qtd e % de contratos com variacao < 0% (economia) |
| CR01-F12 | Indicador Estouros | Display | — | Qtd e % de contratos com variacao > 0% (estouro de custo) |
| CR01-F13 | Maior Economia | Display destaque | — | Contrato com maior economia absoluta e percentual |
| CR01-F14 | Maior Estouro | Display destaque | — | Contrato com maior estouro absoluto e percentual |
| CR01-F15 | Badge Saude Portfolio | Badge | — | Avaliacao geral: "saudavel" (<5% var media), "atencao" (5-10%), "critico" (>10%) |

### Sequencia de Eventos

1. Usuario acessa **ContratadoRealizadoPage** e visualiza aba **"Dashboard"** ativa por padrao
2. Sistema consulta endpoint GET /api/dashboard/contratado-realizado com parametros de periodo
3. **[CR01-F01]** a **[CR01-F04]** exibem stats agregados do periodo
4. **[CR01-F07]** exibe tabela comparativa com todos os contratos
5. Cada contrato mostra **[CR01-F08]** badge de desvio colorido
6. **[CR01-F09]** exibe totalizadores na base da tabela
7. **[CR01-F10]** a **[CR01-F12]** mostram distribuicao de conformes, economias e estouros
8. **[CR01-F13]** e **[CR01-F14]** destacam casos extremos
9. **[CR01-F15]** avalia saude geral do portfolio de contratos
10. Usuario altera **[CR01-F05]** periodo — dashboard recalcula integralmente
11. Usuario altera **[CR01-F06]** status — filtra contratos por estado
12. Dados sao calculados cruzando tabelas `contratos` e `contrato_entregas`

### Implementacao Atual
**⚠️ PARCIAL** — Mock frontend em `ContratadoRealizadoPage.tsx` com interface `ContratoComparativo` (edital, orgao, produto, valorContratado, valorRealizado, variacao, status), tabela comparativa, filtro de periodo e totais calculados. Pendente: endpoint GET /api/dashboard/contratado-realizado no backend, calculo real a partir das tabelas `contratos` e `contrato_entregas`, indicadores de desvio, badge de saude do portfolio.

---

## [UC-CR02] Pedidos em Atraso

**RF relacionado:** RF-052
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um contrato com entregas atrasadas (data_prevista < hoje e status != "entregue")
3. Interface `PedidoAtraso` disponivel com campos: contrato, orgao, prazo, diasAtraso
4. Tabela `contrato_entregas` com registros atrasados

### Pos-condicoes
1. Entregas atrasadas listadas com gravidade visual
2. Contato com orgao facilitado via botoes de acao
3. Alertas de atraso configurados e funcionais

### Layout da Tela — ContratadoRealizadoPage > Aba "Atrasos"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTRATADO X REALIZADO                                                   │
│ Comparativo de valores contratados vs efetivamente realizados           │
│                                                                          │
│ [Aba: Dashboard] [Aba: Atrasos ●] [Aba: Vencimentos]                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Total Atrasados] [Card: Gravidade Alta] [Card: Valor em Risco]││
│ │    5 entregas              2 (>15 dias)          R$ 60.000            ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Entregas em Atraso ───────────────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Gravidade ALTA (> 15 dias de atraso) ──                           ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Contrato    │ Orgao  │ Item          │ Prazo   │ Atraso │ Acao  │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-010/2026 │ UNICAMP│ Reagente TR-01│ 01/02/26│ 54 dias│ [C][A]│   ││
│ │ │ [Badge: 🔴 CRITICO — possivel sancao contratual]                │   ││
│ │ │─────────────────────────────────────────────────────────────────│   ││
│ │ │ PE-008/2026 │ UFBA   │ Analisador    │ 05/02/26│ 50 dias│ [C][A]│   ││
│ │ │ [Badge: 🔴 CRITICO — possivel sancao contratual]                │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Gravidade MEDIA (7 a 15 dias de atraso) ──                        ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Contrato    │ Orgao  │ Item          │ Prazo   │ Atraso │ Acao  │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-015/2026 │ USP    │ Kit calibracao│ 15/03/26│ 12 dias│ [C][A]│   ││
│ │ │ [Badge: 🟡 ATENCAO — contatar orgao com urgencia]               │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Gravidade BAIXA (< 7 dias de atraso) ──                          ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Contrato    │ Orgao  │ Item          │ Prazo   │ Atraso │ Acao  │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ PE-018/2026 │ UFMG   │ Centrifuga   │ 22/03/26│ 5 dias │ [C][A]│   ││
│ │ │ PE-020/2026 │ UNESP  │ Tubo coleta  │ 24/03/26│ 3 dias │ [C][A]│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ [C] = Contatar Orgao    [A] = Configurar Alerta                       ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Configuracao de Alertas de Atraso ────────────────────────────┐│
│ │                                                                       ││
│ │ [CheckBox: Alerta automatico ao atrasar]           [x]                ││
│ │ [CheckBox: Alerta diario para atrasos ativos]      [x]                ││
│ │ [CheckBox: Escalar para gestor apos 15 dias]       [ ]                ││
│ │                                                                       ││
│ │ [SelectInput: Canal de Notificacao ▼]  "Push + E-mail"                ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Configuracao]                                   ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CR02-F01 | Stat Total Atrasados | DisplayCard | — | Contagem de entregas com status "atrasado" em todos os contratos |
| CR02-F02 | Stat Gravidade Alta | DisplayCard | — | Entregas com atraso > 15 dias (risco de sancao contratual) |
| CR02-F03 | Stat Valor em Risco | DisplayCard | — | Soma de valor_total das entregas atrasadas |
| CR02-F04 | Secao Gravidade Alta | DataTable agrupado | — | Entregas > 15 dias atrasadas. Badge vermelho "CRITICO" |
| CR02-F05 | Secao Gravidade Media | DataTable agrupado | — | Entregas 7-15 dias atrasadas. Badge amarelo "ATENCAO" |
| CR02-F06 | Secao Gravidade Baixa | DataTable agrupado | — | Entregas < 7 dias atrasadas. Badge laranja (menor urgencia) |
| CR02-F07 | Badge Gravidade | Badge colorido | — | Vermelho (>15d), Amarelo (7-15d), Laranja (<7d) com texto descritivo |
| CR02-F08 | Botao Contatar | ActionButton | — | Abre modal com dados de contato do orgao (telefone, e-mail) para acao |
| CR02-F09 | Botao Config. Alerta | ActionButton secondary | — | Abre configuracao de alerta para a entrega especifica |
| CR02-F10 | Check Alerta Auto | CheckBox | — | Alerta automatico no momento que entrega atrasa (data_prevista < hoje) |
| CR02-F11 | Check Alerta Diario | CheckBox | — | Notificacao diaria enquanto entrega permanecer atrasada |
| CR02-F12 | Check Escalar | CheckBox | — | Escalar para nivel gerencial apos 15 dias de atraso |
| CR02-F13 | Canal Notificacao | SelectInput | Nao | Canal para alertas: Push, E-mail, Push + E-mail |
| CR02-F14 | Botao Salvar Config | ActionButton primary | — | Salva configuracao de alertas de atraso |

### Sequencia de Eventos

1. Usuario acessa **ContratadoRealizadoPage** e clica na aba **"Atrasos"**
2. Sistema calcula entregas atrasadas: data_prevista < hoje AND status != "entregue"
3. **[CR02-F01]** a **[CR02-F03]** exibem stats agregados de atrasos
4. Entregas agrupadas por gravidade: **[CR02-F04]** alta, **[CR02-F05]** media, **[CR02-F06]** baixa
5. Cada entrega exibe **[CR02-F07]** badge de gravidade com texto de alerta
6. Secoes ordenadas por gravidade (alta primeiro) e dentro de cada secao por dias de atraso (decrescente)
7. Usuario clica **[CR02-F08] Contatar** — modal exibe dados de contato do orgao e template de mensagem
8. Usuario clica **[CR02-F09] Config. Alerta** — abre secao de configuracao de alertas
9. Na secao de alertas, usuario marca opcoes **[CR02-F10]** a **[CR02-F12]** conforme necessidade
10. Usuario seleciona **[CR02-F13]** canal de notificacao preferido
11. Usuario clica **[CR02-F14] Salvar** — configuracao persiste no banco
12. Sistema monitora entregas e dispara alertas conforme configuracao
13. Quando entrega e registrada como realizada (UC-CT02), sai automaticamente da lista

### Implementacao Atual
**⚠️ PARCIAL** — Mock frontend em `ContratadoRealizadoPage.tsx` com interface `PedidoAtraso` (contrato, orgao, prazo, diasAtraso), tabela de atrasos com botao "Contatar". Dados mock incluem atrasos e proximos vencimentos. Pendente: endpoint real no backend que consulta `contrato_entregas` atrasadas, agrupamento por gravidade, alertas automaticos, modal de contato com orgao, dados reais substituindo mocks.

---

## [UC-CR03] Alertas de Vencimento Multi-tier (NOVO — Boas Praticas)

**RF relacionado:** NOVO (boas praticas de gestao contratual)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contratos, ARPs, garantias e entregas cadastrados com datas de vencimento
3. Sistema de notificacoes configurado (push + e-mail)
4. Tool `tool_configurar_alertas` operacional para extensao

### Pos-condicoes
1. Vencimentos proximos de todas as categorias listados de forma consolidada
2. Alertas multi-tier configurados com limiares e canais diferenciados por tipo
3. Escalacao automatica ativada para prazos criticos
4. Dashboard unificado de vencimentos acessivel em tempo real

### Layout da Tela — ContratadoRealizadoPage > Aba "Vencimentos"

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTRATADO X REALIZADO                                                   │
│ Comparativo de valores contratados vs efetivamente realizados           │
│                                                                          │
│ [Aba: Dashboard] [Aba: Atrasos] [Aba: Vencimentos ●]                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ STATS ROW ──────────────────────────────────────────────────────────┐│
│ │ [Card: Venc. 7 dias]  [Card: Venc. 15 dias]  [Card: Venc. 30 dias]  ││
│ │    3 itens               5 itens                12 itens              ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Vencimentos Proximos por Tipo ────────────────────────────────┐│
│ │                                                                       ││
│ │ ── Contratos ──                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Contrato    │ Orgao  │ Vencimento │ Dias │ Tipo           │ Esc. │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ CT-001/2026 │ USP    │ 01/04/2026 │ 5d   │ [🔴 Contrato]  │ [C]  │   ││
│ │ │ CT-003/2026 │ UNESP  │ 10/04/2026 │ 14d  │ [🟡 Contrato]  │ [C]  │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Atas de Registro de Preco ──                                      ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ ARP         │ Orgao  │ Vencimento │ Dias │ Tipo           │ Esc. │   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ ARP-015/2025│ UFMG   │ 15/04/2026 │ 19d  │ [🟡 ARP]       │ [C]  │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Garantias ──                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Garantia    │ Contrato │ Vencimento │ Dias │ Tipo           │ Esc.│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Seg. Fianca │ CT-001   │ 01/04/2026 │ 5d   │ [🔴 Garantia]  │ [C]│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Entregas ──                                                        ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Entrega     │ Contrato │ Vencimento │ Dias │ Tipo           │ Esc.│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Microscopio │ CT-001   │ 30/03/2026 │ 3d   │ [🔴 Entrega]   │ [C]│   ││
│ │ │ Centrifuga  │ CT-002   │ 02/04/2026 │ 6d   │ [🟡 Entrega]   │ [C]│   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ [C] = Configurar alerta para este item                                ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ CARD: Configuracao Multi-tier ──────────────────────────────────────┐│
│ │                                                                       ││
│ │ [ActionButton: Configurar Regras de Alerta]                           ││
│ │                                                                       ││
│ │ ┌─────────────────────────────────────────────────────────────────┐   ││
│ │ │ Tipo         │ Limiar 30d │ Limiar 15d │ Limiar 7d │ Limiar 1d│   ││
│ │ ├─────────────────────────────────────────────────────────────────┤   ││
│ │ │ Contrato     │ Sistema    │ E-mail     │ E-mail+WA │ Push+Tel │   ││
│ │ │ ARP          │ Sistema    │ E-mail     │ E-mail    │ Push     │   ││
│ │ │ Garantia     │ Sistema    │ E-mail     │ E-mail+WA │ Push+Tel │   ││
│ │ │ Entrega      │ —          │ Sistema    │ E-mail    │ Push     │   ││
│ │ └─────────────────────────────────────────────────────────────────┘   ││
│ │                                                                       ││
│ │ ── Escalacao ──                                                       ││
│ │ [CheckBox: Escalar para gerencia em vencimentos < 7 dias]  [x]       ││
│ │ [TextInput: E-mail gerencia]  gerencia@empresa.com                    ││
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ ┌─ MODAL: Configurar Regras por Tipo ──────────────────────────────────┐│
│ │                                                                       ││
│ │ [SelectInput: Tipo de Vencimento ▼]  "Contrato"                       ││
│ │                                                                       ││
│ │ ── Limiares e Canais ──                                               ││
│ │ [x] 30 dias  → Canal: [SelectInput: Sistema ▼]                       ││
│ │ [x] 15 dias  → Canal: [SelectInput: E-mail ▼]                        ││
│ │ [x] 7 dias   → Canal: [SelectInput: E-mail + WhatsApp ▼]             ││
│ │ [x] 1 dia    → Canal: [SelectInput: Push + Telefone ▼]               ││
│ │                                                                       ││
│ │ [CheckBox: Escalar automaticamente]  [x]                              ││
│ │ [TextInput: Destino escalacao]  "gerencia@empresa.com"                ││
│ │                                                                       ││
│ │ [ActionButton: Salvar Regra]  [ActionButton: Cancelar]                ││
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| CR03-F01 | Stat Venc. 7 dias | DisplayCard urgente | — | Contagem de itens vencendo nos proximos 7 dias (todos os tipos) |
| CR03-F02 | Stat Venc. 15 dias | DisplayCard alerta | — | Contagem de itens vencendo nos proximos 15 dias |
| CR03-F03 | Stat Venc. 30 dias | DisplayCard info | — | Contagem de itens vencendo nos proximos 30 dias |
| CR03-F04 | Secao Contratos | DataTable agrupado | — | Vencimentos de contratos nos proximos 30 dias. Badge vermelho (<7d), amarelo (7-30d) |
| CR03-F05 | Secao ARPs | DataTable agrupado | — | Vencimentos de atas de registro de preco |
| CR03-F06 | Secao Garantias | DataTable agrupado | — | Vencimentos de garantias contratuais (seguro-fianca, caucao, etc.) |
| CR03-F07 | Secao Entregas | DataTable agrupado | — | Entregas pendentes proximas do vencimento |
| CR03-F08 | Botao Config. Individual | ActionButton | — | Abre configuracao de alerta para item especifico |
| CR03-F09 | Tabela Regras Multi-tier | DataTable | — | Colunas: Tipo, canais por limiar (30d/15d/7d/1d). Visao consolidada |
| CR03-F10 | Tipo Vencimento | SelectInput | Sim | Opcoes: Contrato, ARP, Garantia, Entrega |
| CR03-F11 | Limiar 30d + Canal | CheckBox + SelectInput | Nao | Canal para alerta de 30 dias: Sistema, E-mail, WhatsApp, Push |
| CR03-F12 | Limiar 15d + Canal | CheckBox + SelectInput | Nao | Canal para alerta de 15 dias (escalacao media) |
| CR03-F13 | Limiar 7d + Canal | CheckBox + SelectInput | Nao | Canal para alerta de 7 dias (escalacao alta) |
| CR03-F14 | Limiar 1d + Canal | CheckBox + SelectInput | Nao | Canal para alerta de 1 dia (urgencia maxima) |
| CR03-F15 | Check Escalacao | CheckBox | Nao | Habilita escalacao automatica para nivel gerencial |
| CR03-F16 | E-mail Gerencia | TextInput | Condicional | E-mail para escalacao. Obrigatorio se escalacao ativada |
| CR03-F17 | Botao Salvar Regra | ActionButton primary | — | Salva configuracao de regras multi-tier para o tipo selecionado |

### Sequencia de Eventos

1. Usuario acessa **ContratadoRealizadoPage** e clica na aba **"Vencimentos"**
2. Sistema calcula vencimentos proximos de todas as categorias (30 dias a frente)
3. **[CR03-F01]** a **[CR03-F03]** exibem contadores por faixa de urgencia
4. Vencimentos agrupados por tipo: **[CR03-F04]** Contratos, **[CR03-F05]** ARPs, **[CR03-F06]** Garantias, **[CR03-F07]** Entregas
5. Cada item exibe badge de urgencia: vermelho (<7d), amarelo (7-15d), verde (15-30d)
6. Items ordenados por dias restantes (mais urgente primeiro) dentro de cada secao
7. **[CR03-F09]** mostra configuracao atual de regras por tipo e limiar
8. Usuario clica **"Configurar Regras de Alerta"** — modal abre
9. Usuario seleciona **[CR03-F10]** tipo e define canais para cada limiar **[CR03-F11]** a **[CR03-F14]**
10. Escalacao progressiva: limiares menores recebem canais mais urgentes (Sistema → E-mail → WhatsApp → Telefone)
11. Se **[CR03-F15]** escalacao ativada, usuario preenche **[CR03-F16]** e-mail gerencial
12. Usuario clica **[CR03-F17] Salvar** — regras persistidas no banco
13. Sistema monitora vencimentos e dispara alertas conforme regras configuradas
14. Escalacao automatica notifica gerencia quando vencimento < 7 dias sem acao
15. Dashboard atualiza em tempo real conforme datas se aproximam

### Implementacao Atual
**❌ NAO IMPLEMENTADO** — Novo caso de uso baseado em pesquisa de boas praticas de gestao contratual. Mock parcial em `ContratadoRealizadoPage.tsx` com `mockProximosVencimentos` (lista simples). Necessario: consolidacao de vencimentos de multiplas tabelas (contratos, atas_consultadas, contrato_entregas), modelo de regras multi-tier, integracao com `tool_configurar_alertas` expandida, canais de escalacao, aba "Vencimentos" completa.

---

---

# RESUMO DE IMPLEMENTACAO

| UC | Nome | Fase | RF Base | Status | Backend | Frontend | Prioridade |
|----|------|------|---------|--------|---------|----------|------------|
| UC-FU01 | Registrar Resultado | Fase 1 — Follow-Up | RF-017, RF-046 | ⚠️ PARCIAL | tool_registrar_resultado existe | Mock FollowupPage.tsx | Alta |
| UC-FU02 | Configurar Alertas de Prazo | Fase 1 — Follow-Up | RF-017 | ⚠️ PARCIAL | tool_configurar_alertas existe | Sem frontend dedicado | Media |
| UC-FU03 | Score Logistico | Fase 1 — Follow-Up | RF-011 | ❌ NAO IMPL. | Tool nao existe | Sem frontend | Media |
| UC-AT01 | Buscar Atas no PNCP | Fase 2 — Atas | RF-035 | ⚠️ PARCIAL | tool_buscar_atas_pncp existe | AtasPage nao existe | Alta |
| UC-AT02 | Extrair Resultados de Ata PDF | Fase 2 — Atas | RF-035 | ⚠️ PARCIAL | tool_baixar_ata + tool_extrair_ata existem | AtasPage nao existe | Alta |
| UC-AT03 | Dashboard de Atas Consultadas | Fase 2 — Atas | RF-035 | ⚠️ PARCIAL | Modelo AtaConsultada + CRUD existem | AtasPage nao existe | Media |
| UC-CT01 | Cadastrar Contrato | Fase 3 — Execucao | RF-046-01 | ⚠️ PARCIAL | Modelo Contrato existe | Mock ProducaoPage.tsx | Alta |
| UC-CT02 | Registrar Entrega + NF | Fase 3 — Execucao | RF-046-03 | ⚠️ PARCIAL | Modelo ContratoEntrega existe | Mock modal existe | Alta |
| UC-CT03 | Cronograma de Entregas | Fase 3 — Execucao | RF-046-04/05 | ❌ NAO IMPL. | Sem endpoint | Sem frontend | Media |
| UC-CT04 | Gestao de Aditivos | Fase 3 — Execucao | NOVO (Lei 14.133) | ❌ NAO IMPL. | Modelo nao existe | Sem frontend | Media |
| UC-CT05 | Designar Gestor/Fiscal | Fase 3 — Execucao | NOVO (Lei 14.133) | ❌ NAO IMPL. | Modelo nao existe | Sem frontend | Baixa |
| UC-CT06 | Saldo ARP / Carona | Fase 3 — Execucao | NOVO (Lei 14.133) | ❌ NAO IMPL. | Modelo nao existe | Sem frontend | Media |
| UC-CR01 | Dashboard Contratado x Realizado | Fase 4 — Contratado | RF-051 | ⚠️ PARCIAL | Sem endpoint | Mock ContratadoRealizadoPage.tsx | Alta |
| UC-CR02 | Pedidos em Atraso | Fase 4 — Contratado | RF-052 | ⚠️ PARCIAL | Sem endpoint | Mock parcial | Alta |
| UC-CR03 | Alertas Vencimento Multi-tier | Fase 4 — Contratado | NOVO (boas praticas) | ❌ NAO IMPL. | Sem modelo/endpoint | Mock parcial | Media |

---

## METRICAS DE COBERTURA

| Metrica | Valor |
|---------|-------|
| Total de Casos de Uso | 15 |
| Status PARCIAL (backend ou frontend existem) | 9 (60%) |
| Status NAO IMPLEMENTADO | 6 (40%) |
| Novos modelos necessarios | 3 (ContratoAditivo, ContratoDesignacao, ARPSaldo) |
| Novos endpoints necessarios | 8+ (CRUD contratos, entregas, aditivos, designacoes, saldo, dashboard) |
| Novas paginas frontend | 1 (AtasPage — com 4 abas) |
| Paginas a expandir | 2 (ProducaoPage — 4 abas, ContratadoRealizadoPage — 3 abas) |
| Tools backend existentes reutilizados | 5 (registrar_resultado, configurar_alertas, buscar_atas, baixar_ata, extrair_ata) |
| Novas tools backend | 1 (tool_calcular_score_logistico) |
| Requisitos da Lei 14.133 cobertos | Arts. 82-86, 117, 124-126 |

---

## DEPENDENCIAS ENTRE CASOS DE USO

```
UC-FU01 (Registrar Resultado)
    └──→ UC-CT01 (Cadastrar Contrato) — vitoria gera sugestao de contrato
            ├──→ UC-CT02 (Registrar Entrega) — contrato gera entregas
            │       └──→ UC-CT03 (Cronograma) — entregas alimentam cronograma
            ├──→ UC-CT04 (Aditivos) — contrato recebe aditivos
            ├──→ UC-CT05 (Gestor/Fiscal) — contrato recebe designacoes
            └──→ UC-CR01 (Dashboard) — contratos + entregas alimentam comparativo
                    ├──→ UC-CR02 (Atrasos) — entregas atrasadas sinalizadas
                    └──→ UC-CR03 (Vencimentos) — prazos consolidados

UC-AT01 (Buscar Atas)
    └──→ UC-AT02 (Extrair Dados) — ata buscada alimenta extracao
            └──→ UC-AT03 (Dashboard Atas) — atas salvas no dashboard
                    └──→ UC-CT06 (Saldo ARP) — atas com saldo controlado

UC-FU02 (Alertas de Prazo)
    └──→ UC-CR03 (Vencimentos Multi-tier) — extensao do conceito de alertas
```
