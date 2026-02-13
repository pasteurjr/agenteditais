# Plano: Telas Funcionais para o facilicita.ia

## Objetivo

Transformar os prompts do dropdown em telas funcionais com UI interativa, organizadas nos submenus da sidebar. O usuario podera interagir tanto via UI (botoes, formularios, tabelas) quanto via chat.

---

## Mapeamento: Sidebar -> Telas -> Prompts

### SECAO 1: FLUXO COMERCIAL

---

#### 1.1 Dashboard (Tela Inicial)
**Ja implementado** - Cards de KPIs, funil, alertas, calendario

---

#### 1.2 Captacao
**Objetivo**: Buscar novos editais na web e salvar no sistema

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ CAPTACAO DE EDITAIS                                    [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ BUSCAR EDITAIS ─────────────────────────────────────────────┐│
│ │ Termo: [____________________] UF: [Todas▼] Fonte: [PNCP▼]   ││
│ │ [x] Incluir encerrados  [x] Calcular score de aderencia      ││
│ │                                          [🔍 Buscar Editais] ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ RESULTADOS (15 editais encontrados) ────────────────────────┐│
│ │ [Salvar Todos] [Salvar Recomendados] [Exportar CSV]          ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ □ | Numero      | Orgao        | Objeto      | Score | Acoes ││
│ │───┼─────────────┼──────────────┼─────────────┼───────┼───────││
│ │ □ | PE-001/2026 | UFMG         | Microscopi..| 85%   | 👁️💾  ││
│ │ □ | PE-045/2026 | CEMIG        | Equip. lab..| 72%   | 👁️💾  ││
│ │ □ | CC-012/2026 | Pref. BH     | Material...| 45%   | 👁️💾  ││
│ │ ...                                                          ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Componentes**:
- Formulario de busca (termo, UF, fonte, opcoes)
- Tabela de resultados com selecao multipla
- Botoes: Buscar, Salvar Todos, Salvar Selecionados, Salvar Recomendados
- Modal de detalhes do edital
- Indicador de score de aderencia (cor por faixa)

**Prompts Mapeados**:
- `buscar_editais_web` -> Botao "Buscar" com score
- `buscar_editais_simples` -> Checkbox "Calcular score" desmarcado
- `buscar_editais_todos` -> Checkbox "Incluir encerrados"
- `buscar_links_editais` -> Campo "Termo/Area"
- `salvar_editais` -> Botao "Salvar Todos"
- `salvar_editais_recomendados` -> Botao "Salvar Recomendados"
- `salvar_edital_especifico` -> Icone 💾 na linha

---

#### 1.3 Validacao
**Objetivo**: Analisar editais salvos, resumir, verificar requisitos

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ VALIDACAO DE EDITAIS                                   [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ MEUS EDITAIS ───────────────────────────────────────────────┐│
│ │ Buscar: [____________] Status: [Todos▼] Ordenar: [Data▼]    ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Numero      | Orgao    | Abertura   | Status     | Acoes     ││
│ │─────────────┼──────────┼────────────┼────────────┼───────────││
│ │ PE-001/2026 | UFMG     | 15/02/2026 | 🟡 Novo    | 📋🔍💬📥  ││
│ │ PE-045/2026 | CEMIG    | 20/02/2026 | 🟢 Validado| 📋🔍💬📥  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ DETALHES DO EDITAL: PE-001/2026 ────────────────────────────┐│
│ │ [Resumir] [Baixar PDF] [Calcular Aderencia] [Mudar Status▼]  ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Orgao: UFMG                                                  ││
│ │ Objeto: Aquisicao de microscopios...                         ││
│ │ Valor: R$ 150.000,00                                         ││
│ │ Abertura: 15/02/2026 14:00                                   ││
│ │ Modalidade: Pregao Eletronico                                ││
│ │─────────────────────────────────────────────────────────────-││
│ │ RESUMO (gerado pela IA):                                     ││
│ │ Este edital visa a aquisicao de 5 microscopios opticos...    ││
│ │─────────────────────────────────────────────────────────────-││
│ │ PERGUNTAR AO EDITAL:                                         ││
│ │ [Qual o prazo de entrega?________________________] [Perguntar]││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Componentes**:
- Lista de editais salvos com filtros
- Painel de detalhes do edital selecionado
- Botao "Resumir" -> Gera resumo via IA
- Botao "Baixar PDF"
- Campo "Perguntar ao edital" -> Chat contextual
- Dropdown "Mudar Status" (novo/analisando/validado/descartado)

**Prompts Mapeados**:
- `listar_editais` -> Carregamento inicial da tabela
- `listar_editais_status` -> Filtro de status
- `resumir_edital` -> Botao "Resumir"
- `perguntar_edital` -> Campo de pergunta
- `baixar_pdf_edital` -> Botao "Baixar PDF"
- `atualizar_edital` -> Dropdown de status

---

#### 1.4 Precificacao
**Objetivo**: Consultar precos de mercado, historico, recomendacao

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ PRECIFICACAO                                           [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ CONSULTAR PRECOS ───────────────────────────────────────────┐│
│ │ Produto/Termo: [____________________] [🔍 Buscar no PNCP]    ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ PRECOS DE MERCADO ──────────────────────────────────────────┐│
│ │ Termo: "microscopio optico"                                  ││
│ │ Preco medio: R$ 12.500,00 | Min: R$ 8.000 | Max: R$ 18.000   ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Data       | Orgao      | Valor      | Vencedor              ││
│ │────────────┼────────────┼────────────┼───────────────────────││
│ │ 10/01/2026 | UFMG       | R$ 11.200  | Lab Solutions         ││
│ │ 05/01/2026 | USP        | R$ 13.800  | TechMed               ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ RECOMENDACAO DE PRECO ──────────────────────────────────────┐│
│ │ Edital: [PE-001/2026▼] Produto: [Microscopio XYZ▼]           ││
│ │                                          [💡 Recomendar Preco]││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ RECOMENDACAO:                                                ││
│ │ Preco sugerido: R$ 11.500,00                                 ││
│ │ Faixa competitiva: R$ 10.000 - R$ 13.000                     ││
│ │ Justificativa: Baseado em 12 licitacoes similares...         ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ MEU HISTORICO DE PRECOS ────────────────────────────────────┐│
│ │ [Ver Todos] [Exportar]                                       ││
│ │ Produto         | Ult. Preco | Data       | Resultado        ││
│ │─────────────────┼────────────┼────────────┼──────────────────││
│ │ Microscopio ABC | R$ 11.000  | 15/01/2026 | 🏆 Ganho         ││
│ │ Centrifuga XYZ  | R$ 8.500   | 10/01/2026 | ❌ Perdido       ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `buscar_precos_pncp` -> Botao "Buscar no PNCP"
- `historico_precos` -> Secao "Meu Historico"
- `recomendar_preco` -> Botao "Recomendar Preco"

---

#### 1.5 Proposta
**Objetivo**: Gerar e gerenciar propostas tecnicas

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ GERACAO DE PROPOSTAS                                   [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ GERAR NOVA PROPOSTA ────────────────────────────────────────┐│
│ │ Edital: [PE-001/2026 - UFMG - Microscopios▼]                 ││
│ │ Produto: [Microscopio Optico ABC-500▼]                       ││
│ │ Preco Unitario: R$ [___________]                             ││
│ │ Quantidade: [___] (edital pede: 5 unidades)                  ││
│ │                                                              ││
│ │ [💡 Sugerir Preco]              [📝 Gerar Proposta Tecnica]  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ MINHAS PROPOSTAS ───────────────────────────────────────────┐│
│ │ Buscar: [____________] Status: [Todas▼]                      ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Edital      | Produto       | Valor Total  | Data     | Acoes││
│ │─────────────┼───────────────┼──────────────┼──────────┼──────││
│ │ PE-001/2026 | Microscopio   | R$ 55.000    | 10/02    | 👁️📥🗑️││
│ │ PE-045/2026 | Centrifuga    | R$ 42.500    | 08/02    | 👁️📥🗑️││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ PREVIEW DA PROPOSTA ────────────────────────────────────────┐│
│ │ [Baixar DOCX] [Baixar PDF] [Editar] [Enviar por Email]       ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ PROPOSTA TECNICA                                             ││
│ │ Edital: PE-001/2026                                          ││
│ │ Produto: Microscopio Optico ABC-500                          ││
│ │ ...                                                          ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `gerar_proposta` -> Formulario + Botao "Gerar Proposta"
- `listar_propostas` -> Tabela "Minhas Propostas"
- `excluir_proposta` -> Icone 🗑️

---

#### 1.6 Submissao
**Objetivo**: Preparar e enviar propostas aos portais

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ SUBMISSAO DE PROPOSTAS                                 [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ PROPOSTAS PRONTAS PARA ENVIO ───────────────────────────────┐│
│ │ Edital      | Produto     | Valor     | Abertura   | Status  ││
│ │─────────────┼─────────────┼───────────┼────────────┼─────────││
│ │ PE-001/2026 | Microscopio | R$ 55.000 | 15/02 14h  | ⏳ Aguard││
│ │ PE-045/2026 | Centrifuga  | R$ 42.500 | 20/02 10h  | ✅ Enviada│
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ CHECKLIST DE SUBMISSAO: PE-001/2026 ────────────────────────┐│
│ │ [x] Proposta tecnica gerada                                  ││
│ │ [x] Preco definido                                           ││
│ │ [ ] Documentos anexados (0/5)                                ││
│ │ [ ] Revisao final                                            ││
│ │                                                              ││
│ │ [Anexar Documento] [Marcar como Enviada] [Abrir Portal PNCP] ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Observacao**: Esta tela e mais de organizacao/checklist. A submissao real e feita manualmente no portal.

---

#### 1.7 Lances
**Objetivo**: Acompanhar pregoes em andamento (sessoes de lances)

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ACOMPANHAMENTO DE LANCES                               [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ PREGOES HOJE ───────────────────────────────────────────────┐│
│ │ 🔴 PE-001/2026 - UFMG - 14:00 (em 2 horas)                   ││
│ │ 🟢 PE-088/2026 - USP - 10:00 (em andamento)                  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ HISTORICO DE LANCES ────────────────────────────────────────┐│
│ │ Edital      | Data       | Nosso Lance | Vencedor   | Result ││
│ │─────────────┼────────────┼─────────────┼────────────┼────────││
│ │ PE-050/2026 | 05/02/2026 | R$ 45.000   | R$ 43.500  | ❌     ││
│ │ PE-032/2026 | 01/02/2026 | R$ 28.000   | R$ 28.000  | 🏆     ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

#### 1.8 Followup
**Objetivo**: Acompanhar editais apos submissao

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ FOLLOWUP POS-SUBMISSAO                                 [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ AGUARDANDO RESULTADO ───────────────────────────────────────┐│
│ │ Edital      | Orgao    | Submetido em | Dias      | Acoes    ││
│ │─────────────┼──────────┼──────────────┼───────────┼──────────││
│ │ PE-001/2026 | UFMG     | 15/02/2026   | 5 dias    | 📞 🔔    ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ REGISTRAR RESULTADO ────────────────────────────────────────┐│
│ │ Edital: [PE-001/2026▼]                                       ││
│ │ Resultado: ( ) Vitoria  ( ) Derrota  ( ) Cancelado           ││
│ │                                                              ││
│ │ [Se vitoria]                                                 ││
│ │ Valor final: R$ [___________]                                ││
│ │                                                              ││
│ │ [Se derrota]                                                 ││
│ │ Vencedor: [_______________] Valor: R$ [___________]          ││
│ │ Motivo: [Preco▼]                                             ││
│ │                                                              ││
│ │                                          [Registrar Resultado]││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `registrar_vitoria` -> Radio "Vitoria" + Formulario
- `registrar_derrota` -> Radio "Derrota" + Formulario
- `registrar_cancelado` -> Radio "Cancelado"
- `consultar_resultado` -> Tabela de resultados

---

#### 1.9 Impugnacao
**Objetivo**: Gerenciar impugnacoes e recursos

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ IMPUGNACOES E RECURSOS                                 [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ EDITAIS COM PRAZO DE IMPUGNACAO ────────────────────────────┐│
│ │ Edital      | Orgao    | Prazo Impug. | Dias Rest. | Acoes   ││
│ │─────────────┼──────────┼──────────────┼────────────┼─────────││
│ │ PE-001/2026 | UFMG     | 12/02/2026   | 2 dias     | ⚠️ Criar││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ CRIAR IMPUGNACAO ───────────────────────────────────────────┐│
│ │ Edital: [PE-001/2026▼]                                       ││
│ │ Tipo: ( ) Impugnacao do Edital  ( ) Recurso Administrativo   ││
│ │ Motivo: [_______________________________________________]    ││
│ │ Fundamentacao: [                                         ]   ││
│ │                [                                         ]   ││
│ │                                                              ││
│ │ [💡 Gerar Texto com IA]                  [Salvar Rascunho]   ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `chat_impugnacao` -> Botao "Gerar Texto com IA"
- `chat_recurso` -> Botao para recursos

---

#### 1.10 Producao
**Objetivo**: Gerenciar contratos ganhos em execucao

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTRATOS EM PRODUCAO                                  [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ CONTRATOS ATIVOS ───────────────────────────────────────────┐│
│ │ Edital      | Orgao    | Valor      | Prazo Entrega | Status ││
│ │─────────────┼──────────┼────────────┼───────────────┼────────││
│ │ PE-032/2026 | USP      | R$ 28.000  | 20/03/2026    | 🟢 OK  ││
│ │ PE-018/2026 | UFMG     | R$ 45.000  | 15/03/2026    | 🟡 Aten││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ DETALHES DO CONTRATO ───────────────────────────────────────┐│
│ │ Edital: PE-032/2026 | Orgao: USP                             ││
│ │ Produto: Microscopio ABC-500 | Qtd: 2                        ││
│ │ Valor: R$ 28.000,00                                          ││
│ │ Prazo: 20/03/2026 (35 dias restantes)                        ││
│ │                                                              ││
│ │ [Registrar Entrega] [Anexar NF] [Ver Historico]              ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### SECAO 2: INDICADORES

---

#### 2.1 Flags
**Objetivo**: Visualizar alertas, pendencias e items que precisam atencao

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ FLAGS E ALERTAS                                        [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ ALERTAS ATIVOS ─────────────────────────────────────────────┐│
│ │ 🔴 3 editais vencem em 24h                                   ││
│ │ 🟡 5 propostas pendentes de envio                            ││
│ │ 🟢 2 contratos com entrega proxima                           ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ MEUS ALERTAS CONFIGURADOS ──────────────────────────────────┐│
│ │ [+ Novo Alerta]                                              ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Edital      | Tipo         | Antecedencia | Status   | Acoes ││
│ │─────────────┼──────────────┼──────────────┼──────────┼───────││
│ │ PE-001/2026 | Abertura     | 24h, 1h      | ✅ Ativo | 🗑️    ││
│ │ PE-045/2026 | Impugnacao   | 48h          | ✅ Ativo | 🗑️    ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ CRIAR ALERTA ───────────────────────────────────────────────┐│
│ │ Edital: [PE-001/2026▼]                                       ││
│ │ Tipo: [Abertura▼]                                            ││
│ │ Antecedencia: [x] 24h  [x] 1h  [ ] 15min                     ││
│ │                                            [Criar Alerta]    ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `dashboard_prazos` -> Secao "Alertas Ativos"
- `listar_alertas` -> Tabela "Meus Alertas"
- `configurar_alertas` -> Formulario "Criar Alerta"
- `cancelar_alerta` -> Icone 🗑️

---

#### 2.2 Monitoria
**Objetivo**: Configurar monitoramento automatico de novos editais

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ MONITORAMENTO AUTOMATICO                               [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ MONITORAMENTOS ATIVOS ──────────────────────────────────────┐│
│ │ [+ Novo Monitoramento]                                       ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Termo            | UFs      | Freq.  | Ultimos | Status      ││
│ │──────────────────┼──────────┼────────┼─────────┼─────────────││
│ │ microscopio      | SP, MG   | 6h     | 3 novos | 🟢 Ativo    ││
│ │ equipamento lab  | Todos    | 12h    | 0 novos | 🟢 Ativo    ││
│ │ centrifuga       | RJ       | 24h    | 1 novo  | ⏸️ Pausado  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ CRIAR MONITORAMENTO ────────────────────────────────────────┐│
│ │ Termo de busca: [____________________]                       ││
│ │ Estados (UF): [x] SP [x] MG [ ] RJ [ ] ... [Todos]          ││
│ │ Frequencia: ( ) 2h  (x) 6h  ( ) 12h  ( ) 24h                 ││
│ │ Notificar por: [x] Sistema  [x] Email                        ││
│ │                                       [Criar Monitoramento]  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ ULTIMOS EDITAIS ENCONTRADOS ────────────────────────────────┐│
│ │ Termo: microscopio | Encontrados: 3 | Ultima busca: 10:30    ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ PE-099/2026 | UNICAMP | Microscopio eletronico | 👁️ 💾      ││
│ │ PE-100/2026 | UNESP   | Microscopio optico     | 👁️ 💾      ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `listar_monitoramentos` -> Tabela "Monitoramentos Ativos"
- `configurar_monitoramento` -> Formulario "Criar Monitoramento"
- `configurar_monitoramento_uf` -> Checkboxes de UF
- `desativar_monitoramento` -> Botao pausar/desativar

---

#### 2.3 Concorrencia
**Objetivo**: Analisar concorrentes e seus historicos

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ANALISE DE CONCORRENTES                                [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ CONCORRENTES CONHECIDOS ────────────────────────────────────┐│
│ │ Empresa          | Vitorias | Derrotas | Taxa    | Acoes     ││
│ │──────────────────┼──────────┼──────────┼─────────┼───────────││
│ │ Lab Solutions    | 15       | 8        | 65%     | 🔍 📊     ││
│ │ TechMed Brasil   | 12       | 10       | 55%     | 🔍 📊     ││
│ │ MedEquip         | 8        | 12       | 40%     | 🔍 📊     ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ DETALHES: Lab Solutions ────────────────────────────────────┐│
│ │ Razao Social: Lab Solutions Ltda                             ││
│ │ CNPJ: 12.345.678/0001-00                                     ││
│ │ Atuacao: Equipamentos laboratoriais                          ││
│ │                                                              ││
│ │ HISTORICO:                                                   ││
│ │ Data       | Edital      | Valor      | Resultado            ││
│ │────────────┼─────────────┼────────────┼──────────────────────││
│ │ 05/02/2026 | PE-050/2026 | R$ 43.500  | 🏆 Venceu            ││
│ │ 01/02/2026 | PE-032/2026 | R$ 30.000  | ❌ Perdeu (nos)      ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `listar_concorrentes` -> Tabela principal
- `analisar_concorrente` -> Painel de detalhes

---

#### 2.4 Mercado
**Objetivo**: Tendencias de mercado, precos, demanda

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ANALISE DE MERCADO                                     [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ TENDENCIAS ─────────────────────────────────────────────────┐│
│ │ [Grafico de linha: Editais por mes]                          ││
│ │ Jan: 45 | Fev: 52 | Mar: 48 | ...                            ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ CATEGORIAS MAIS DEMANDADAS ─────────────────────────────────┐│
│ │ Categoria              | Qtd Editais | Valor Medio           ││
│ │────────────────────────┼─────────────┼───────────────────────││
│ │ Equipamentos Lab       | 45          | R$ 85.000             ││
│ │ Material Hospitalar    | 38          | R$ 120.000            ││
│ │ TI e Informatica       | 32          | R$ 65.000             ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ EVOLUCAO DE PRECOS ─────────────────────────────────────────┐│
│ │ Produto: [Microscopio▼]  Periodo: [Ultimos 6 meses▼]         ││
│ │ [Grafico de linha: Preco ao longo do tempo]                  ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `mindsdb_editais_mes` -> Grafico de tendencias
- `mindsdb_produtos_categoria` -> Categorias demandadas
- `mindsdb_preco_medio_categoria` -> Evolucao de precos

---

#### 2.5 Contratado X Realizado
**Objetivo**: Comparar valores contratados vs realizados

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTRATADO X REALIZADO                                 [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ RESUMO ─────────────────────────────────────────────────────┐│
│ │ Total Contratado: R$ 450.000,00                              ││
│ │ Total Realizado:  R$ 380.000,00                              ││
│ │ Variacao: -15.5% (economia)                                  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ DETALHAMENTO ───────────────────────────────────────────────┐│
│ │ Contrato    | Contratado   | Realizado    | Variacao         ││
│ │─────────────┼──────────────┼──────────────┼──────────────────││
│ │ PE-032/2026 | R$ 28.000    | R$ 28.000    | 0%               ││
│ │ PE-018/2026 | R$ 45.000    | R$ 42.000    | -6.7%            ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.6 Pedidos em Atraso
**Objetivo**: Visualizar entregas pendentes e atrasadas

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ PEDIDOS EM ATRASO                                      [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ ATRASADOS ──────────────────────────────────────────────────┐│
│ │ 🔴 2 contratos com entrega atrasada                          ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Contrato    | Orgao    | Prazo      | Atraso    | Acoes      ││
│ │─────────────┼──────────┼────────────┼───────────┼────────────││
│ │ PE-010/2026 | UFMG     | 01/02/2026 | 9 dias    | 📞 Contato ││
│ │ PE-015/2026 | USP      | 05/02/2026 | 5 dias    | 📞 Contato ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ PROXIMOS VENCIMENTOS ───────────────────────────────────────┐│
│ │ 🟡 3 contratos vencem em 7 dias                              ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Contrato    | Orgao    | Prazo      | Dias Rest.             ││
│ │─────────────┼──────────┼────────────┼────────────────────────││
│ │ PE-020/2026 | CEMIG    | 17/02/2026 | 7 dias                 ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.7 Perdas
**Objetivo**: Analisar derrotas e motivos

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ANALISE DE PERDAS                                      [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ RESUMO ─────────────────────────────────────────────────────┐│
│ │ Total de perdas: 12 editais                                  ││
│ │ Valor total perdido: R$ 850.000,00                           ││
│ │ Taxa de perda: 35%                                           ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ MOTIVOS DAS PERDAS ─────────────────────────────────────────┐│
│ │ [Grafico pizza]                                              ││
│ │ Preco: 60% | Tecnico: 25% | Documentacao: 10% | Outros: 5%   ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ HISTORICO DE PERDAS ────────────────────────────────────────┐│
│ │ Edital      | Orgao    | Motivo      | Diferenca  | Vencedor ││
│ │─────────────┼──────────┼─────────────┼────────────┼──────────││
│ │ PE-050/2026 | UFMG     | Preco       | R$ 1.500   | LabSol   ││
│ │ PE-040/2026 | USP      | Tecnico     | -          | TechMed  ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `mindsdb_vitorias_derrotas` -> Resumo
- `consultar_todos_resultados` -> Historico

---

### SECAO 3: CONFIGURACOES

---

#### 3.1 Empresa
**Objetivo**: Dados cadastrais da empresa

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ DADOS DA EMPRESA                                       [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ INFORMACOES BASICAS ────────────────────────────────────────┐│
│ │ Razao Social: [_________________________________]            ││
│ │ Nome Fantasia: [________________________________]            ││
│ │ CNPJ: [__.___.___/____-__]                                   ││
│ │ Inscricao Estadual: [_______________]                        ││
│ │                                                              ││
│ │ Endereco: [_________________________________]                ││
│ │ Cidade: [_______________] UF: [__] CEP: [_____-___]          ││
│ │ Telefone: [(__) _____-____]                                  ││
│ │ Email: [_______________________@__________]                  ││
│ │                                                              ││
│ │                                            [Salvar Alteracoes]││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ RESPONSAVEIS ───────────────────────────────────────────────┐│
│ │ [+ Adicionar Responsavel]                                    ││
│ │ Nome          | Cargo        | Email           | Acoes       ││
│ │───────────────┼──────────────┼─────────────────┼─────────────││
│ │ Joao Silva    | Diretor      | joao@empresa    | ✏️ 🗑️       ││
│ │ Maria Santos  | Comercial    | maria@empresa   | ✏️ 🗑️       ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

#### 3.2 Portfolio
**Objetivo**: Gerenciar produtos e servicos cadastrados

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ PORTFOLIO DE PRODUTOS                                  [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ MEUS PRODUTOS ──────────────────────────────────────────────┐│
│ │ [+ Cadastrar Produto] [📎 Upload PDF] [🌐 Buscar na Web]     ││
│ │ Buscar: [____________] Categoria: [Todas▼]                   ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Nome              | Categoria   | Completude | Acoes         ││
│ │───────────────────┼─────────────┼────────────┼───────────────││
│ │ Microscopio ABC   | Laboratorio | 95%        | 👁️ ✏️ 🔄 🗑️   ││
│ │ Centrifuga XYZ    | Laboratorio | 80%        | 👁️ ✏️ 🔄 🗑️   ││
│ │ Autoclave 123     | Hospitalar  | 100%       | 👁️ ✏️ 🔄 🗑️   ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ DETALHES: Microscopio ABC ──────────────────────────────────┐│
│ │ [Editar] [Reprocessar] [Verificar Completude] [Excluir]      ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Nome: Microscopio Optico ABC-500                             ││
│ │ Fabricante: ABC Instruments                                  ││
│ │ Categoria: Laboratorio                                       ││
│ │ Modelo: ABC-500                                              ││
│ │                                                              ││
│ │ ESPECIFICACOES TECNICAS:                                     ││
│ │ - Aumento: 40x a 1000x                                       ││
│ │ - Iluminacao: LED                                            ││
│ │ - Objetivas: 4x, 10x, 40x, 100x                              ││
│ │ ...                                                          ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `listar_produtos` -> Tabela de produtos
- `upload_manual` -> Botao "Upload PDF"
- `buscar_produto_web` -> Botao "Buscar na Web"
- `reprocessar_produto` -> Icone 🔄
- `verificar_completude` -> Botao "Verificar Completude"
- `excluir_produto` -> Icone 🗑️
- `atualizar_produto` -> Icone ✏️

---

#### 3.3 Parametrizacoes
**Objetivo**: Configuracoes gerais do sistema

**Layout da Tela**:
```
┌─────────────────────────────────────────────────────────────────┐
│ PARAMETRIZACOES                                        [? Ajuda]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ FONTES DE EDITAIS ──────────────────────────────────────────┐│
│ │ [+ Cadastrar Fonte]                                          ││
│ │ Nome     | Tipo    | URL              | Status    | Acoes    ││
│ │──────────┼─────────┼──────────────────┼───────────┼──────────││
│ │ PNCP     | API     | api.pncp.gov.br  | ✅ Ativa  | ⏸️       ││
│ │ ComprasNET| Scraper| comprasnet.gov   | ✅ Ativa  | ⏸️       ││
│ │ BEC-SP   | Scraper | bec.sp.gov.br    | ❌ Inativa| ▶️       ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ NOTIFICACOES ───────────────────────────────────────────────┐│
│ │ Email para notificacoes: [________________@_______]          ││
│ │ Receber por: [x] Email  [x] Sistema  [ ] SMS                 ││
│ │ Frequencia resumo: [Diario▼]                                 ││
│ │                                            [Salvar]          ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ PREFERENCIAS ───────────────────────────────────────────────┐│
│ │ Tema: ( ) Escuro  (x) Claro                                  ││
│ │ Idioma: [Portugues▼]                                         ││
│ │ Fuso horario: [America/Sao_Paulo▼]                           ││
│ │                                            [Salvar]          ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Prompts Mapeados**:
- `listar_fontes` -> Tabela de fontes
- `cadastrar_fonte` -> Botao "+ Cadastrar Fonte"
- `ativar_fonte` / `desativar_fonte` -> Icones ▶️ / ⏸️
- `configurar_notificacoes` -> Secao "Notificacoes"

---

## Ordem de Implementacao

### Sprint 3A: Telas Essenciais (Fluxo Principal)
1. **Portfolio** (Produtos) - Base para todo o sistema
2. **Captacao** (Busca de editais) - Entrada de dados
3. **Validacao** (Analise de editais) - Core do negocio
4. **Proposta** (Geracao de propostas) - Saida principal

### Sprint 3B: Telas de Suporte
5. **Precificacao** - Apoio a decisao
6. **Followup** - Registro de resultados
7. **Flags** (Alertas) - Sprint 2 ja tem backend
8. **Monitoria** - Sprint 2 ja tem backend

### Sprint 3C: Telas Analiticas
9. **Concorrencia** - Inteligencia competitiva
10. **Mercado** - Tendencias
11. **Perdas** - Aprendizado
12. **Contratado X Realizado** - Controle

### Sprint 3D: Configuracoes
13. **Empresa** - Dados cadastrais
14. **Parametrizacoes** - Fontes e preferencias

### Sprint 3E: Telas Complementares
15. **Submissao** - Checklist
16. **Lances** - Acompanhamento
17. **Impugnacao** - Recursos
18. **Producao** - Contratos

---

## Arquivos a Criar

```
frontend/src/pages/
├── CaptacaoPage.tsx
├── ValidacaoPage.tsx
├── PrecificacaoPage.tsx
├── PropostaPage.tsx
├── SubmissaoPage.tsx
├── LancesPage.tsx
├── FollowupPage.tsx
├── ImpugnacaoPage.tsx
├── ProducaoPage.tsx
├── FlagsPage.tsx
├── MonitoriaPage.tsx
├── ConcorrenciaPage.tsx
├── MercadoPage.tsx
├── ContratadoRealizadoPage.tsx
├── AtrasoPage.tsx
├── PerdasPage.tsx
├── EmpresaPage.tsx
├── PortfolioPage.tsx
└── ParametrizacoesPage.tsx

frontend/src/components/
├── DataTable.tsx          (tabela reutilizavel)
├── FormField.tsx          (campo de formulario)
├── Modal.tsx              (modal reutilizavel)
├── Card.tsx               (card reutilizavel)
├── StatusBadge.tsx        (badge de status)
├── ScoreBar.tsx           (barra de score)
├── ActionButton.tsx       (botao de acao)
└── FilterBar.tsx          (barra de filtros)

frontend/src/api/
└── client.ts              (adicionar endpoints)

backend/
└── app.py                 (adicionar endpoints REST)
```

---

## Verificacao

Para cada tela:
1. Acessar via menu lateral
2. Verificar carregamento de dados
3. Testar acoes CRUD (criar, ler, atualizar, deletar)
4. Testar integracao com chat (botao "Perguntar ao agente")
5. Verificar responsividade (mobile)
