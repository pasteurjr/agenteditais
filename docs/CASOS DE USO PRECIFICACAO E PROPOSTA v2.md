# CASOS DE USO — PRECIFICACAO E PROPOSTA

**Data:** 24/03/2026
**Versao:** 2.0
**Base:** requisitos_completosv4.md (RF-039 a RF-041) + PDF SPRINT PRECO e PROPOSTA.pdf
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos.

---

## INDICE

### FASE 1 — PRECIFICACAO
- [UC-P01] Organizar Edital por Lotes
- [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)
- [UC-P03] Calculo Tecnico de Volumetria
- [UC-P04] Configurar Base de Custos (ERP + Tributario)
- [UC-P05] Montar Preco Base (Camada B)
- [UC-P06] Definir Valor de Referencia (Camada C)
- [UC-P07] Estruturar Lances (Camadas D e E)
- [UC-P08] Definir Estrategia Competitiva
- [UC-P09] Consultar Historico de Precos (Camada F)
- [UC-P10] Gestao de Comodato
- [UC-P11] Pipeline IA de Precificacao
- [UC-P12] Relatorio de Custos e Precos

### FASE 2 — PROPOSTA
- [UC-R01] Gerar Proposta Tecnica (Motor Automatico)
- [UC-R02] Upload de Proposta Externa
- [UC-R03] Personalizar Descricao Tecnica (A/B)
- [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)
- [UC-R05] Auditoria Documental + Smart Split
- [UC-R06] Exportar Dossie Completo
- [UC-R07] Gerenciar Status e Submissao

---

---

# FASE 1 — PRECIFICACAO

---

## [UC-P01] Organizar Edital por Lotes

**RF relacionado:** RF-039-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Itens do edital foram importados do PNCP (tabela `editais_itens`)

### Pos-condicoes
1. Lotes do edital estao cadastrados com especialidade
2. Itens do PNCP estao associados aos lotes
3. Cada lote tem parametros tecnicos definidos
4. Sistema esta pronto para a Selecao Inteligente (UC-P02)

### Layout da Tela — PrecificacaoPage > Aba "Lotes"

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRECIFICACAO                                                        │
│ Precificacao estrategica por lotes e camadas                       │
│                                                                     │
│ [Aba: Lotes] [Aba: Camadas] [Aba: Lances] [Aba: Historico]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ CARD: Selecao do Edital ──────────────────────────────────────┐ │
│ │ [SelectInput: Edital ▼]  "PE 2024/001 - Hospital Univ. SP"    │ │
│ │                          Opcoes: editais salvos (status=salvo) │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Lotes do Edital ────────────────────────────────────────┐ │
│ │ [ActionButton: + Novo Lote]  [ActionButton: Importar do PNCP] │ │
│ │                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Lote │ Especialidade │ Itens │ Valor Est. │ Status │ Acoes │ │ │
│ │ ├─────────────────────────────────────────────────────────────┤ │ │
│ │ │ 01   │ Hematologia   │ 12    │ R$ 450.000 │ ●Aberto│ [✏][🗑]│ │ │
│ │ │ 02   │ Bioquimica    │ 8     │ R$ 320.000 │ ●Aberto│ [✏][🗑]│ │ │
│ │ │ 03   │ Urinanalise   │ 5     │ R$ 150.000 │ ●Aberto│ [✏][🗑]│ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Detalhes do Lote (expande ao clicar) ──────────────────┐ │
│ │ Lote 01 — Hematologia                                          │ │
│ │                                                                 │ │
│ │ [TextInput: Especialidade]  "Hematologia"                      │ │
│ │ [TextArea: Descricao do Lote]                                  │ │
│ │                                                                 │ │
│ │ ── Itens vinculados ──                                         │ │
│ │ ┌───────────────────────────────────────────────────────────┐  │ │
│ │ │ # │ Descricao (PNCP) │ Qtd │ Unid │ Valor Unit. │ [🔗]  │  │ │
│ │ ├───────────────────────────────────────────────────────────┤  │ │
│ │ │ 1 │ Reagente hemogr. │ 500 │ Kit  │ R$ 120,00   │ [Vincular]│
│ │ │ 2 │ Controle hematol │ 100 │ Und  │ R$ 45,00    │ [Vincular]│
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ │                                                                 │ │
│ │ ── Parametros Tecnicos do Lote ──                              │ │
│ │ [TextInput: Tipo de Amostra]  "Sangue total"                   │ │
│ │ [NumberInput: Volume Exigido]  "50000" testes                  │ │
│ │ [TextInput: Equipamento Exigido]  "Analisador automatizado"    │ │
│ │ [TextArea: Observacoes Tecnicas]                               │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Lote]  [ActionButton: Cancelar]          │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P01-F01 | Edital | SelectInput | Sim | Lista editais salvos (status=salvo). Formato: "PE {numero} - {orgao}" |
| P01-F02 | Botao Novo Lote | ActionButton | — | Cria lote vazio para preenchimento manual |
| P01-F03 | Botao Importar do PNCP | ActionButton | — | Importa itens do PNCP e agrupa automaticamente por categoria |
| P01-F04 | Tabela de Lotes | DataTable | — | Colunas: Lote, Especialidade, Itens, Valor Est., Status, Acoes |
| P01-F05 | Botao Editar Lote | IconButton (✏) | — | Abre painel de detalhes do lote |
| P01-F06 | Botao Excluir Lote | IconButton (🗑) | — | Exclui lote com confirmacao |
| P01-F07 | Especialidade | TextInput | Sim | Especialidade do lote (Hematologia, Bioquimica etc.) |
| P01-F08 | Descricao do Lote | TextArea | Nao | Descricao livre do lote |
| P01-F09 | Tabela de Itens | DataTable | — | Itens PNCP vinculados ao lote |
| P01-F10 | Botao Vincular | ActionButton | — | Vincula item PNCP a produto do portfolio |
| P01-F11 | Tipo de Amostra | TextInput | Nao | Tipo de amostra do lote (sangue, urina etc.) |
| P01-F12 | Volume Exigido | NumberInput | Sim | Volume total de testes exigidos pelo edital |
| P01-F13 | Equipamento Exigido | TextInput | Nao | Equipamento requerido pelo edital |
| P01-F14 | Observacoes Tecnicas | TextArea | Nao | Notas tecnicas livres |
| P01-F15 | Botao Salvar Lote | ActionButton | — | Salva lote e itens vinculados |

### Sequencia de Eventos

1. Usuario acessa **PrecificacaoPage** e clica na aba **"Lotes"**
2. Usuario seleciona um edital no **[P01-F01] SelectInput Edital**
3. Sistema carrega os itens do PNCP vinculados a esse edital e exibe na **[P01-F04] Tabela de Lotes** (vazia se nenhum lote criado)
4. Usuario clica em **[P01-F03] Importar do PNCP** — sistema agrupa itens automaticamente por categoria e cria lotes-rascunho
5. Alternativamente, usuario clica em **[P01-F02] Novo Lote** para criar manualmente
6. Usuario clica em **[P01-F05] Editar Lote** em um lote da tabela — painel de detalhes expande
7. Usuario preenche **[P01-F07] Especialidade** (ex: "Hematologia")
8. Usuario preenche **[P01-F12] Volume Exigido** (ex: 50000 testes)
9. Usuario opcionalmente preenche **[P01-F11] Tipo de Amostra**, **[P01-F13] Equipamento Exigido** e **[P01-F14] Observacoes**
10. Na **[P01-F09] Tabela de Itens**, usuario clica **[P01-F10] Vincular** em cada item para associar a um produto do portfolio (abre modal de selecao de produto)
11. Usuario clica em **[P01-F15] Salvar Lote**
12. Sistema salva lote no banco e atualiza **[P01-F04] Tabela de Lotes** com status "Configurado"
13. Repete passos 6-12 para cada lote do edital

### Implementacao Atual
**✅ IMPLEMENTADO — Lotes por especialidade, itens PNCP, nome curto extraido, ignorar/reativar**

---

## [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)

**RF relacionado:** RF-039-07
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Lotes do edital estao configurados (UC-P01 concluido)
2. Portfolio de produtos esta cadastrado com specs tecnicas
3. Itens dos lotes tem parametros tecnicos definidos

### Pos-condicoes
1. Cada lote tem produtos do portfolio sugeridos pela IA
2. Usuario validou e confirmou a selecao
3. Match item-a-item esta registrado

### Layout da Tela — PrecificacaoPage > Modal "Selecao Inteligente"

```
┌─────────────────────────────────────────────────────────────────────┐
│ MODAL: Selecao Inteligente — Lote 01: Hematologia                  │
│                                                               [X]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ LADO ESQUERDO: Itens do Edital ───┐ ┌─ LADO DIREITO: Match ──┐ │
│ │                                      │ │                        │ │
│ │ Item 1: Reagente hemograma          │ │ Produto Sugerido:      │ │
│ │ • Tipo amostra: Sangue total        │ │ [Badge: 92% match]     │ │
│ │ • Volume: 50.000 testes             │ │                        │ │
│ │ • ANVISA: Obrigatorio               │ │ ○ Kit Hemograma XR200  │ │
│ │                                      │ │   Fabricante: Wiener   │ │
│ │ ─────────────────────────           │ │   ANVISA: 12345678     │ │
│ │                                      │ │   [Badge: ● Verde]    │ │
│ │ Item 2: Controle hematologico       │ │                        │ │
│ │ • Tipo: Controle interno            │ │ ○ Kit Controle HM-500  │ │
│ │ • Volume: 1.000 unidades            │ │   Fabricante: Wiener   │ │
│ │                                      │ │   [Badge: 87% match]  │ │
│ └──────────────────────────────────────┘ └────────────────────────┘ │
│                                                                     │
│ ┌─ PARAMETROS OBRIGATORIOS DESTACADOS ──────────────────────────┐  │
│ │ ⚠ Faixa de medicao: 0-200 mg/dL — VERIFICAR no produto       │  │
│ │ ⚠ Tipo de amostra: Sangue total EDTA — OK (compativel)       │  │
│ │ ✅ Registro ANVISA ativo — Valido ate 12/2027                  │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─ ALERTA ───────────────────────────────────────────────────────┐ │
│ │ ⚠ [ACAO HUMANA] Validacao obrigatoria: confirme cada match    │ │
│ │   antes de prosseguir.                                         │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [ActionButton: Confirmar Selecao]  [ActionButton: Cancelar]       │
│  [ActionButton: Re-analisar com IA]                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| P02-F01 | Painel Itens do Edital | Lista readonly | Itens do lote com parametros tecnicos |
| P02-F02 | Painel Match IA | Lista com radio buttons | Produtos sugeridos pela IA com % de match |
| P02-F03 | Badge Match % | Badge colorido | Verde (>80%), Amarelo (60-80%), Vermelho (<60%) |
| P02-F04 | Parametros Obrigatorios | Lista de alertas | Alertas sobre parametros criticos do edital |
| P02-F05 | Alerta Acao Humana | Banner warning | Lembra que validacao humana e obrigatoria |
| P02-F06 | Botao Confirmar Selecao | ActionButton primary | Salva o match validado pelo usuario |
| P02-F07 | Botao Re-analisar | ActionButton secondary | Pede nova analise da IA com parametros ajustados |
| P02-F08 | Botao Cancelar | ActionButton | Fecha modal sem salvar |

### Sequencia de Eventos

1. Na tela de Lotes (UC-P01), usuario clica em um lote configurado
2. Usuario clica no botao **"Selecao Inteligente"** no card do lote
3. Sistema abre o **Modal Selecao Inteligente** e dispara o agente IA
4. IA analisa itens do lote (**[P02-F01]**) vs portfolio e retorna sugestoes em **[P02-F02]**
5. Para cada item, IA mostra produto sugerido com **[P02-F03] Badge Match %**
6. Sistema destaca parametros obrigatorios em **[P02-F04]** (faixa de medicao, tipo amostra, ANVISA)
7. **[P02-F05] Alerta** lembra usuario que deve validar cada match
8. Usuario revisa cada sugestao — pode aceitar o produto sugerido ou trocar manualmente (radio buttons)
9. Se insatisfeito, usuario clica **[P02-F07] Re-analisar** para nova rodada da IA
10. Usuario clica **[P02-F06] Confirmar Selecao** — sistema salva match lote x produtos
11. Modal fecha e lote mostra status "Selecionado" na tabela de lotes

### Implementacao Atual
**✅ IMPLEMENTADO — Vincular manual + IA auto-link + Buscar Web + ANVISA (com modais)**

---

## [UC-P03] Calculo Tecnico de Volumetria

**RF relacionado:** RF-039-02
**Ator:** Usuario

### Pre-condicoes
1. Lote configurado com itens e produtos vinculados (UC-P01 + UC-P02)
2. Produtos tem campo "rendimento por kit" preenchido no portfolio

### Pos-condicoes
1. Quantidade de kits calculada com arredondamento ceil para cada item
2. Custo total de kits calculado
3. Dados alimentam as camadas de preco (UC-P05)

### Layout da Tela — PrecificacaoPage > Aba "Camadas" > Secao Volumetria

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Lotes] [Aba: Camadas ●] [Aba: Lances] [Aba: Historico]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ CARD: Camada A — Base de Calculo ─────────────────────────────┐ │
│ │ Lote: [SelectInput: Lote ▼] "01 - Hematologia"                │ │
│ │ Item: [SelectInput: Item ▼] "Reagente hemograma — Kit XR200"  │ │
│ │                                                                 │ │
│ │ ── Motor de Volumetria ──                                      │ │
│ │ ┌───────────────────────────────────────────────────────────┐  │ │
│ │ │ [NumberInput] Volume do Edital:        [50000] testes     │  │ │
│ │ │ [NumberInput] Repeticoes Amostras:     [2]                │  │ │
│ │ │ [NumberInput] Repeticoes Calibradores: [3]                │  │ │
│ │ │ [NumberInput] Repeticoes Controles:    [2]                │  │ │
│ │ │ [NumberInput] Rendimento por Kit:      [500] testes/kit   │  │ │
│ │ │                                                           │  │ │
│ │ │ [ActionButton: Calcular]                                  │  │ │
│ │ │                                                           │  │ │
│ │ │ ── Resultado ──                                           │  │ │
│ │ │ Volume Real Ajustado:    50.007 testes                    │  │ │
│ │ │ Quantidade de Kits:      101 kits (arredondado ↑)         │  │ │
│ │ │ Formula: (50000 + 2 + 3 + 2) / 500 = 100,014 → 101      │  │ │
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Volumetria]                              │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P03-F01 | Lote | SelectInput | Sim | Lotes configurados do edital selecionado |
| P03-F02 | Item | SelectInput | Sim | Itens do lote com produto vinculado |
| P03-F03 | Volume do Edital | NumberInput | Sim | Quantidade de testes exigida pelo edital |
| P03-F04 | Repeticoes Amostras | NumberInput | Sim | Repeticoes adicionais de amostras |
| P03-F05 | Repeticoes Calibradores | NumberInput | Sim | Repeticoes de calibracao do equipamento |
| P03-F06 | Repeticoes Controles | NumberInput | Sim | Repeticoes de controle de qualidade |
| P03-F07 | Rendimento por Kit | NumberInput | Sim | Testes por kit (vem do portfolio, editavel) |
| P03-F08 | Botao Calcular | ActionButton | — | Executa formula de volumetria |
| P03-F09 | Volume Real Ajustado | Display readonly | — | Resultado: soma dos inputs |
| P03-F10 | Quantidade de Kits | Display readonly destaque | — | Resultado: ceil(ajustado/rendimento) |
| P03-F11 | Formula | Display readonly | — | Mostra formula aplicada |
| P03-F12 | Botao Salvar Volumetria | ActionButton primary | — | Salva resultado no banco |

### Sequencia de Eventos

1. Usuario clica na aba **"Camadas"** na PrecificacaoPage
2. Usuario seleciona um lote em **[P03-F01]**
3. Usuario seleciona um item em **[P03-F02]** — sistema pre-preenche **[P03-F07] Rendimento** do portfolio
4. **[P03-F03] Volume do Edital** vem pre-preenchido do lote (UC-P01, campo Volume Exigido)
5. Usuario preenche **[P03-F04]**, **[P03-F05]**, **[P03-F06]** com dados das repeticoes
6. Usuario clica **[P03-F08] Calcular**
7. Sistema calcula: `Volume Real Ajustado = P03-F03 + P03-F04 + P03-F05 + P03-F06`
8. Sistema calcula: `Kits = ceil(Ajustado / P03-F07)` e exibe em **[P03-F10]**
9. **[P03-F11]** mostra a formula com valores
10. Usuario clica **[P03-F12] Salvar Volumetria** — dados gravados por item

### Implementacao Atual
**✅ IMPLEMENTADO — Deteccao automatica, rendimento das especificacoes, pergunta ao usuario**

---

## [UC-P04] Configurar Base de Custos (ERP + Tributario)

**RF relacionado:** RF-039-03 + RF-039-04
**Ator:** Usuario

### Pre-condicoes
1. Volumetria calculada (UC-P03)
2. Produto tem NCM cadastrado no portfolio

### Pos-condicoes
1. Custo base do item definido (via ERP ou manual)
2. Regras tributarias aplicadas (isencao ICMS se NCM 3822)
3. Preco base validado pelo usuario

### Layout da Tela — PrecificacaoPage > Aba "Camadas" > Secao Custos

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Camada A — Base de Custos ──────────────────────────────┐ │
│ │                                                                 │ │
│ │ ── Integracao ERP ──                                           │ │
│ │ [ActionButton: Importar do ERP]                                │ │
│ │ Custo importado: R$ 85,00 (Preco de compra fornecedor)        │ │
│ │ Fonte: ERP Argus/Supra  |  Data: 13/03/2026                   │ │
│ │                                                                 │ │
│ │ ── Motor Tributario ──                                         │ │
│ │ NCM do Produto: [TextInput: 3822.00.90] (readonly, do cadastro)│ │
│ │ ┌───────────────────────────────────────────────────────────┐  │ │
│ │ │ [Badge: ✅ ISENCAO IDENTIFICADA]                          │  │ │
│ │ │ NCM 3822 — Isencao de ICMS para reagentes diagnosticos   │  │ │
│ │ │ Base legal: Convenio ICMS 100/97                          │  │ │
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ │                                                                 │ │
│ │ Aliquotas:                                                     │ │
│ │ [NumberInput: ICMS %]     [0,00] ← isento                     │ │
│ │ [NumberInput: IPI %]      [0,00]                               │ │
│ │ [NumberInput: PIS %]      [1,65]                               │ │
│ │ [NumberInput: COFINS %]   [7,60]                               │ │
│ │                                                                 │ │
│ │ ⚠ [ACAO HUMANA] Campo editavel para validacao final            │ │
│ │ [NumberInput: Custo Base Final] [R$ 85,00] ← editavel         │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Base de Custos]                          │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P04-F01 | Botao Importar do ERP | ActionButton | — | Busca custo do item no ERP integrado |
| P04-F02 | Custo Importado | Display | — | Valor importado do ERP com fonte e data |
| P04-F03 | NCM | TextInput readonly | — | NCM do produto (vem do portfolio) |
| P04-F04 | Badge Isencao | Badge | — | Verde se isencao identificada, neutro se nao |
| P04-F05 | ICMS % | NumberInput | Sim | Aliquota ICMS (0 se isento) |
| P04-F06 | IPI % | NumberInput | Sim | Aliquota IPI |
| P04-F07 | PIS % | NumberInput | Sim | Aliquota PIS |
| P04-F08 | COFINS % | NumberInput | Sim | Aliquota COFINS |
| P04-F09 | Custo Base Final | NumberInput editavel | Sim | Custo apos ajustes tributarios — validacao humana |
| P04-F10 | Botao Salvar | ActionButton primary | — | Salva custos no banco |

### Sequencia de Eventos

1. Na aba "Camadas", apos volumetria, usuario ve secao **Camada A — Base de Custos**
2. Usuario clica **[P04-F01] Importar do ERP** — sistema consulta ERP e exibe custo em **[P04-F02]**
3. Se ERP indisponivel, usuario preenche **[P04-F09]** manualmente
4. Sistema exibe **[P04-F03] NCM** do produto e verifica automaticamente regras tributarias
5. Se NCM 3822, sistema exibe **[P04-F04] Badge Isencao** e zera **[P04-F05] ICMS**
6. Demais aliquotas (**[P04-F06]** a **[P04-F08]**) vem pre-preenchidas mas sao editaveis
7. Usuario revisa e ajusta **[P04-F09] Custo Base Final** se necessario
8. Usuario clica **[P04-F10] Salvar Base de Custos**

### Implementacao Atual
**✅ IMPLEMENTADO — Custo manual, NCM automatico, ICMS isencao, tributos editaveis**

---

## [UC-P05] Montar Preco Base (Camada B)

**RF relacionado:** RF-039-08
**Ator:** Usuario

### Pre-condicoes
1. Base de custos definida (UC-P04)

### Pos-condicoes
1. Preco base definido por uma das 3 opcoes
2. Flag de reutilizacao definida

### Layout da Tela — PrecificacaoPage > Aba "Camadas" > Secao Preco Base

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Camada B — Preco Base ──────────────────────────────────┐ │
│ │                                                                 │ │
│ │ Modo de Input:                                                 │ │
│ │ (●) Manual  ( ) Upload Tabela  ( ) Custo + Markup             │ │
│ │                                                                 │ │
│ │ ── Se Manual ──                                                │ │
│ │ [NumberInput: Preco Base Unitario]  [R$ 150,00]               │ │
│ │                                                                 │ │
│ │ ── Se Upload Tabela ──                                        │ │
│ │ [FileInput: Tabela de Precos]  (.csv, .xlsx)                  │ │
│ │ [Preview da tabela importada com mapeamento de colunas]       │ │
│ │                                                                 │ │
│ │ ── Se Custo + Markup ──                                       │ │
│ │ Custo Base (Camada A): R$ 85,00 (readonly)                    │ │
│ │ [NumberInput: Markup %]  [76,47%]                             │ │
│ │ Preco Base Calculado: R$ 150,00                               │ │
│ │                                                                 │ │
│ │ [Checkbox: ☑ Reutilizar este Preco Base em outros editais]    │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Preco Base]                              │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P05-F01 | Modo de Input | RadioGroup | Sim | 3 opcoes: Manual, Upload Tabela, Custo+Markup |
| P05-F02 | Preco Base Unitario | NumberInput | Sim (se manual) | Valor digitado pelo usuario |
| P05-F03 | Tabela de Precos | FileInput | Sim (se upload) | Aceita .csv e .xlsx |
| P05-F04 | Markup % | NumberInput | Sim (se custo+markup) | Percentual sobre custo base |
| P05-F05 | Preco Base Calculado | Display | — | Custo × (1 + markup/100) |
| P05-F06 | Flag Reutilizar | Checkbox | Nao | Se marcado, preco base fica salvo para reutilizar |
| P05-F07 | Botao Salvar | ActionButton primary | — | Salva preco base |

### Sequencia de Eventos

1. Apos salvar custos (UC-P04), usuario ve **Camada B — Preco Base**
2. Usuario seleciona modo em **[P05-F01]**: Manual, Upload ou Custo+Markup
3. **Se Manual:** preenche **[P05-F02]** com valor desejado
4. **Se Upload:** seleciona arquivo em **[P05-F03]**, sistema parseia e exibe preview
5. **Se Custo+Markup:** preenche **[P05-F04]**, sistema calcula em **[P05-F05]**
6. Opcionalmente marca **[P05-F06]** para reutilizar em outros editais
7. Clica **[P05-F07] Salvar Preco Base**

### Implementacao Atual
**✅ IMPLEMENTADO — Manual, Custo+Markup, Upload CSV, flag reutilizar**

---

## [UC-P06] Definir Valor de Referencia (Camada C)

**RF relacionado:** RF-039-09
**Ator:** Usuario

### Pre-condicoes
1. Preco Base definido (UC-P05)

### Pos-condicoes
1. Target estrategico definido

### Layout da Tela — PrecificacaoPage > Aba "Camadas" > Secao Target

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Camada C — Valor de Referencia (Target) ────────────────┐ │
│ │                                                                 │ │
│ │ Valor de Referencia do Edital:                                 │ │
│ │ [Badge: Disponivel no edital ✅] R$ 145,00 (importado)        │ │
│ │     OU                                                         │ │
│ │ [Badge: Nao disponivel ⚠]                                     │ │
│ │ [NumberInput: % sobre Preco Base]  [95%]                      │ │
│ │ Target Calculado: R$ 142,50                                    │ │
│ │                                                                 │ │
│ │ ── Comparativo ──                                              │ │
│ │ Custo Base (A):      R$ 85,00                                  │ │
│ │ Preco Base (B):      R$ 150,00                                 │ │
│ │ Target (C):          R$ 145,00  ← seu alvo na disputa         │ │
│ │ Margem sobre custo:  70,6%                                     │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Target]                                  │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P06-F01 | Badge Disponibilidade | Badge | — | Verde se edital tem valor ref., amarelo se nao |
| P06-F02 | Valor Referencia Edital | Display | — | Importado automaticamente do edital |
| P06-F03 | % sobre Preco Base | NumberInput | Sim (se nao disponivel) | Percentual para calcular target |
| P06-F04 | Target Calculado | Display | — | Resultado do calculo |
| P06-F05 | Comparativo | Display 3 linhas | — | Mostra camadas A, B, C lado a lado |
| P06-F06 | Margem sobre custo | Display | — | (Target - Custo) / Custo × 100 |
| P06-F07 | Botao Salvar Target | ActionButton primary | — | Salva target estrategico |

### Sequencia de Eventos

1. Apos Preco Base (UC-P05), usuario ve **Camada C — Valor de Referencia**
2. Sistema verifica se edital tem `valor_referencia` no banco
3. **Se disponivel:** exibe **[P06-F01]** verde e **[P06-F02]** com valor importado
4. **Se nao disponivel:** exibe **[P06-F01]** amarelo e campo **[P06-F03]** para percentual
5. Usuario ajusta percentual em **[P06-F03]** — **[P06-F04]** recalcula em tempo real
6. **[P06-F05]** mostra comparativo das 3 camadas e **[P06-F06]** mostra margem
7. Usuario clica **[P06-F07] Salvar Target**

### Implementacao Atual
**✅ IMPLEMENTADO — Auto-importacao edital + % sobre base + IA sugere**

---

## [UC-P07] Estruturar Lances (Camadas D e E)

**RF relacionado:** RF-039-10
**Ator:** Usuario

### Pre-condicoes
1. Camadas A, B e C definidas (UC-P04 a UC-P06)

### Pos-condicoes
1. Valor Inicial do Lance definido
2. Valor Minimo do Lance definido
3. Sistema pronto para bloquear lances abaixo do minimo

### Layout da Tela — PrecificacaoPage > Aba "Lances"

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Lotes] [Aba: Camadas] [Aba: Lances ●] [Aba: Historico]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ CARD: Camada D — Valor Inicial do Lance ──────────────────────┐ │
│ │ [Badge: ⚠ MANDATORIO]                                         │ │
│ │                                                                 │ │
│ │ Modo: (●) Valor Absoluto  ( ) % Desconto sobre Base           │ │
│ │                                                                 │ │
│ │ [NumberInput: Valor Inicial]  [R$ 145,00]                     │ │
│ │   OU                                                           │ │
│ │ [NumberInput: % Desconto]  [3,33%] → R$ 145,00               │ │
│ │                                                                 │ │
│ │ Este e o ponto de partida do leilao.                          │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Camada E — Valor Minimo do Lance ───────────────────────┐ │
│ │ [Badge: ⚠ MANDATORIO]                                         │ │
│ │                                                                 │ │
│ │ Modo: (●) Valor Absoluto  ( ) % Desconto Maximo               │ │
│ │                                                                 │ │
│ │ [NumberInput: Valor Minimo]  [R$ 95,00]                       │ │
│ │   OU                                                           │ │
│ │ [NumberInput: % Desconto Max]  [36,67%] → R$ 95,00            │ │
│ │                                                                 │ │
│ │ ⛔ Limite de seguranca. Sistema BLOQUEIA lances abaixo deste.  │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Resumo Visual ─────────────────────────────────────────┐  │
│ │                                                                │  │
│ │  Custo(A)    Base(B)    Minimo(E)   Target(C)   Inicial(D)   │  │
│ │  R$85       R$150      R$95        R$145       R$145         │  │
│ │  ████████████████████████████████████████████████████████████ │  │
│ │  |←── Margem Minima ──→|←── Faixa de Disputa ──→|           │  │
│ │                                                                │  │
│ │ Margem Minima (sobre custo): 11,8%                            │  │
│ │ Faixa de Disputa: R$ 95,00 — R$ 145,00 (52,6% de amplitude) │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ [ActionButton: Salvar Estrutura de Lances]                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P07-F01 | Modo Valor Inicial | RadioGroup | Sim | Absoluto ou % desconto |
| P07-F02 | Valor Inicial | NumberInput | Sim | Primeiro lance (R$) |
| P07-F03 | % Desconto Inicial | NumberInput | Sim (se %) | Desconto sobre Preco Base |
| P07-F04 | Modo Valor Minimo | RadioGroup | Sim | Absoluto ou % desconto max |
| P07-F05 | Valor Minimo | NumberInput | Sim | Piso — abaixo = prejuizo |
| P07-F06 | % Desconto Max | NumberInput | Sim (se %) | Desconto maximo aceitavel |
| P07-F07 | Barra Visual Resumo | Display grafico | — | Barra horizontal mostrando camadas |
| P07-F08 | Margem Minima | Display | — | (Minimo - Custo) / Custo × 100 |
| P07-F09 | Faixa de Disputa | Display | — | Range entre minimo e inicial |
| P07-F10 | Botao Salvar | ActionButton primary | — | Salva estrutura de lances |

### Sequencia de Eventos

1. Usuario clica na aba **"Lances"**
2. Em **Camada D**, seleciona modo **[P07-F01]** (absoluto ou %)
3. Preenche **[P07-F02]** ou **[P07-F03]** — sistema calcula o outro automaticamente
4. Em **Camada E**, seleciona modo **[P07-F04]**
5. Preenche **[P07-F05]** ou **[P07-F06]** — sistema calcula o outro
6. **Validacao:** se Minimo >= Inicial, sistema exibe erro "Valor minimo deve ser menor que inicial"
7. **Validacao:** se Minimo < Custo(A), sistema exibe warning "Lance abaixo do custo!"
8. **[P07-F07]** atualiza em tempo real mostrando todas as camadas na barra
9. **[P07-F08]** e **[P07-F09]** calculam automaticamente
10. Usuario clica **[P07-F10] Salvar Estrutura de Lances**

### Implementacao Atual
**✅ IMPLEMENTADO — Absoluto/percentual, barra visual**

---

## [UC-P08] Definir Estrategia Competitiva

**RF relacionado:** RF-039-11
**Ator:** Usuario

### Pre-condicoes
1. Lances configurados (UC-P07)

### Pos-condicoes
1. Estrategia definida por edital/lote
2. Sistema sabe como se comportar na disputa

### Layout da Tela — PrecificacaoPage > Aba "Lances" > Secao Estrategia

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Estrategia Competitiva ─────────────────────────────────┐ │
│ │                                                                 │ │
│ │ Selecione a estrategia para este edital:                       │ │
│ │                                                                 │ │
│ │ ┌───────────────────────────────┐ ┌───────────────────────────┐ │ │
│ │ │ (●) QUERO GANHAR              │ │ ( ) NAO GANHEI NO MINIMO │ │ │
│ │ │                               │ │                           │ │ │
│ │ │ Lances agressivos automaticos│ │ Reposicionamento auto.   │ │ │
│ │ │ ate atingir Valor Minimo (E) │ │ para melhor colocacao    │ │ │
│ │ │                               │ │ apos o 1o lugar          │ │ │
│ │ │ [✅ Recomendado para editais │ │                           │ │ │
│ │ │    com margem confortavel]   │ │ [Ideal quando margem e   │ │ │
│ │ │                               │ │  apertada]               │ │ │
│ │ └───────────────────────────────┘ └───────────────────────────┘ │ │
│ │                                                                 │ │
│ │ ── Simulacao de Cenarios ──                                    │ │
│ │ [ActionButton: Simular Disputa]                                │ │
│ │                                                                 │ │
│ │ Cenario 1: Voce ganha no 3o lance (R$ 120,00) — Margem: 41%  │ │
│ │ Cenario 2: Concorrente iguala no minimo — Reposiciona 2o lugar│ │
│ │ Cenario 3: Voce ganha no minimo (R$ 95,00) — Margem: 12%     │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Estrategia]                              │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| P08-F01 | Estrategia | RadioCard (2 opcoes) | Sim | "Quero Ganhar" ou "Nao Ganhei no Minimo" |
| P08-F02 | Botao Simular | ActionButton | — | Roda simulacao de cenarios |
| P08-F03 | Lista de Cenarios | Display lista | — | 3 cenarios simulados com margem |
| P08-F04 | Botao Salvar | ActionButton primary | — | Salva estrategia |

### Sequencia de Eventos

1. Apos lances (UC-P07), usuario ve **Estrategia Competitiva** na mesma aba
2. Seleciona estrategia em **[P08-F01]** — cards visuais com descricao de cada opcao
3. Opcionalmente clica **[P08-F02] Simular** — IA gera 3 cenarios em **[P08-F03]**
4. Clica **[P08-F04] Salvar Estrategia**

### Implementacao Atual
**⚙️ PARCIAL — Perfis existem, simulacao basica**

---

## [UC-P09] Consultar Historico de Precos (Camada F)

**RF relacionado:** RF-039-12
**Ator:** Usuario

### Pre-condicoes
1. Produto selecionado (em qualquer etapa da precificacao)

### Pos-condicoes
1. Usuario visualizou historico e usou como referencia consultiva

### Layout da Tela — PrecificacaoPage > Aba "Historico"

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Lotes] [Aba: Camadas] [Aba: Lances] [Aba: Historico ●]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ CARD: Filtros ────────────────────────────────────────────────┐ │
│ │ [TextInput: Produto/Termo]  [SelectInput: Orgao ▼]            │ │
│ │ [DateInput: De]  [DateInput: Ate]  [SelectInput: Margem ▼]    │ │
│ │ [ActionButton: Filtrar]  [ActionButton: Exportar CSV]          │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Evolucao de Precos (Grafico SVG) ──────────────────────┐ │
│ │ [Grafico de linha com area sombreada]                          │ │
│ │ Eixo X: Data  |  Eixo Y: Preco                                │ │
│ │ Linha: Preco medio  |  Area: Margem                           │ │
│ │ Legenda: Preco medio R$ X | Variacao +/-Y%                    │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ CARD: Tabela de Historico ────────────────────────────────────┐ │
│ │ ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐            │ │
│ │ │ Data │Orgao │Prod. │Valor │Venc. │Nosso │Result│            │ │
│ │ ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │ │
│ │ │ ...  │ ...  │ ...  │ ...  │ ...  │ ...  │🏆/❌ │            │ │
│ │ └──────┴──────┴──────┴──────┴──────┴──────┴──────┘            │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| P09-F01 | Produto/Termo | TextInput | Busca por produto ou termo |
| P09-F02 | Orgao | SelectInput | Filtro por orgao publico |
| P09-F03 | Data De | DateInput | Inicio do periodo |
| P09-F04 | Data Ate | DateInput | Fim do periodo |
| P09-F05 | Margem | SelectInput | Filtro: Todas, Com margem, Sem margem |
| P09-F06 | Botao Filtrar | ActionButton | Aplica filtros |
| P09-F07 | Botao Exportar CSV | ActionButton | Exporta historico filtrado |
| P09-F08 | Grafico SVG | Chart | Evolucao temporal com linha e area |
| P09-F09 | Tabela Historico | DataTable | 7 colunas: Data, Orgao, Produto, Valor, Vencedor, Nosso Preco, Resultado |

### Sequencia de Eventos

1. Usuario clica aba **"Historico"**
2. Preenche **[P09-F01]** com termo de busca e opcionalmente filtra por **[P09-F02]** a **[P09-F05]**
3. Clica **[P09-F06] Filtrar** — sistema busca em `precos_historicos` e PNCP
4. **[P09-F08] Grafico** renderiza evolucao temporal
5. **[P09-F09] Tabela** mostra detalhes com resultado (ganho/perdido)
6. Opcionalmente clica **[P09-F07] Exportar CSV**

### Implementacao Atual
**✅ IMPLEMENTADO — Busca + stats + CSV export**

---

## [UC-P10] Gestao de Comodato

**RF relacionado:** RF-039-13
**Ator:** Usuario

### Pre-condicoes
1. Edital envolve comodato de equipamento

### Pos-condicoes
1. Dados de comodato registrados (manual)

### Layout da Tela — PrecificacaoPage > Secao Comodato (dentro de Lances ou modal)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Comodato — Fase 1 (Manual Assistido) ──────────────────┐ │
│ │ [Badge: Processo manual — IA futura no roadmap]                │ │
│ │                                                                 │ │
│ │ [TextInput: Equipamento]  "Analisador XYZ-3000"               │ │
│ │ [NumberInput: Valor do Equipamento]  [R$ 250.000,00]          │ │
│ │ [NumberInput: Prazo Contrato (meses)]  [60]                   │ │
│ │ [NumberInput: Valor Mensal Amortizacao]  [R$ 4.166,67] (calc) │ │
│ │ [TextArea: Condicoes Especiais]                                │ │
│ │                                                                 │ │
│ │ [ActionButton: Salvar Comodato]                                │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementacao Atual
**⚙️ PARCIAL — CRUD + amortizacao, sem IA**

---

## [UC-P11] Pipeline IA de Precificacao

**RF relacionado:** RF-039-14
**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Vinculo item-produto existente

### Pos-condicoes
1. Insights salvos no banco, campos pre-preenchidos

### Fluxo Principal

1. Usuario seleciona vinculo item-produto
2. Sistema busca insights salvos no banco
3. Se nao tem insights salvos: busca historico local → atas PNCP → contratos
4. IA gera justificativa de precificacao
5. Salva insights no banco
6. Pre-preenche campos A-E (Custo, Preco Base, Referencia, Lance Inicial, Lance Minimo)
7. Usuario revisa e ajusta valores sugeridos

### Layout da Tela — PrecificacaoPage > Card "Precificacao Assistida por IA"

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Precificacao Assistida por IA ────────────────────────┐   │
│ │                                                                │   │
│ │ ── 5 Sugestoes de Preco ──                                   │   │
│ │ ┌─────────────────────────────────────────────────────────┐   │   │
│ │ │ Sugestao │ Valor      │ Fonte             │ Confianca   │   │   │
│ │ ├─────────────────────────────────────────────────────────┤   │   │
│ │ │ A-Custo  │ R$ 85,00   │ Historico local   │ ●●●●○ 80%  │   │   │
│ │ │ B-Base   │ R$ 150,00  │ Custo+Markup 76%  │ ●●●●● 95%  │   │   │
│ │ │ C-Ref    │ R$ 145,00  │ Ata PNCP 2025     │ ●●●●○ 85%  │   │   │
│ │ │ D-Inic   │ R$ 145,00  │ Ref. edital       │ ●●●●○ 80%  │   │   │
│ │ │ E-Min    │ R$ 95,00   │ Margem minima 12% │ ●●●○○ 70%  │   │   │
│ │ └─────────────────────────────────────────────────────────┘   │   │
│ │                                                                │   │
│ │ ── Atas Expandiveis ──                                        │   │
│ │ ▸ Ata PE 2025/001 - Hospital Univ. SP (R$ 142,00)           │   │
│ │ ▸ Ata PE 2024/089 - HCFMUSP (R$ 148,50)                    │   │
│ │ ▸ Ata PE 2024/055 - UFMG (R$ 139,00)                       │   │
│ │                                                                │   │
│ │ ── Vencedores e Concorrentes ──                               │   │
│ │ Vencedor mais frequente: Empresa ABC (3 de 5 atas)           │   │
│ │ Concorrentes: Empresa XYZ, Empresa DEF                       │   │
│ │                                                                │   │
│ │ ── Justificativa IA ──                                        │   │
│ │ "Com base em 5 atas PNCP dos ultimos 12 meses, o preco      │   │
│ │  medio praticado e R$ 143,10. Considerando custo de R$ 85    │   │
│ │  e margem minima de 12%, recomenda-se lance inicial em       │   │
│ │  R$ 145,00 com piso em R$ 95,00."                            │   │
│ │                                                                │   │
│ │ [ActionButton: Aplicar Sugestoes] [ActionButton: Recalcular] │   │
│ └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| P11-F01 | Tabela Sugestoes A-E | DataTable | 5 sugestoes com valor, fonte e confianca |
| P11-F02 | Atas Expandiveis | Accordion | Atas PNCP com detalhes ao expandir |
| P11-F03 | Vencedores | Display | Vencedor mais frequente nas atas |
| P11-F04 | Concorrentes | Display | Empresas concorrentes identificadas |
| P11-F05 | Justificativa IA | TextBlock | Texto gerado pela IA com fundamentacao |
| P11-F06 | Botao Aplicar | ActionButton primary | Aplica sugestoes nos campos A-E |
| P11-F07 | Botao Recalcular | ActionButton secondary | Solicita nova analise da IA |

### Sequencia de Eventos

1. Usuario seleciona vinculo item-produto na PrecificacaoPage
2. Sistema busca insights salvos no banco para esse vinculo
3. Se nao encontra insights salvos, dispara pipeline: historico local → atas PNCP → contratos
4. IA gera justificativa com base nos dados coletados
5. Sistema salva insights no banco para reutilizacao futura
6. **[P11-F01]** exibe 5 sugestoes de preco (camadas A-E) com fonte e confianca
7. **[P11-F02]** mostra atas PNCP encontradas, expandiveis com detalhes
8. **[P11-F03]** e **[P11-F04]** mostram vencedores e concorrentes
9. **[P11-F05]** exibe justificativa gerada pela IA
10. Usuario revisa sugestoes e clica **[P11-F06] Aplicar Sugestoes** para pre-preencher campos A-E
11. Alternativamente, clica **[P11-F07] Recalcular** para nova rodada de analise
12. Usuario ajusta valores manualmente nos campos de cada camada

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-P12] Relatorio de Custos e Precos

**RF relacionado:** RF-039-15
**Ator:** Usuario

### Pre-condicoes
1. Vinculo selecionado com dados de custos/precos

### Pos-condicoes
1. Relatorio MD gerado com opcao de download

### Fluxo Principal

1. Usuario clica "Relatorio de Custos e Precos"
2. Sistema gera relatorio MD completo
3. Abre nova aba com o relatorio renderizado
4. Toolbar com opcoes Baixar MD + Baixar PDF

### Layout da Tela — Nova aba com relatorio

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ TOOLBAR ────────────────────────────────────────────────────┐   │
│ │ [ActionButton: Baixar MD]  [ActionButton: Baixar PDF]        │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─ RELATORIO DE CUSTOS E PRECOS ───────────────────────────────┐   │
│ │                                                                │   │
│ │ ── 1. Identificacao ──                                        │   │
│ │ Edital: PE 2024/001 | Orgao: Hospital Univ. SP               │   │
│ │ Item: Reagente hemograma | Produto: Kit XR200                 │   │
│ │                                                                │   │
│ │ ── 2. Conversao de Quantidade ──                              │   │
│ │ Volume edital: 50.000 testes                                  │   │
│ │ Rendimento: 500 testes/kit → 101 kits                         │   │
│ │                                                                │   │
│ │ ── 3. Analise de Mercado IA ──                                │   │
│ │ Fontes consultadas: 5 atas PNCP, 3 contratos                 │   │
│ │ Preco medio: R$ 143,10 | Min: R$ 135,00 | Max: R$ 152,00    │   │
│ │                                                                │   │
│ │ ── 4. Sugestoes A-E ──                                        │   │
│ │ A-Custo: R$ 85,00 | B-Base: R$ 150,00 | C-Ref: R$ 145,00   │   │
│ │ D-Inicial: R$ 145,00 | E-Minimo: R$ 95,00                    │   │
│ │                                                                │   │
│ │ ── 5. Explicacao dos Calculos ──                              │   │
│ │ Markup: 76,47% sobre custo base                               │   │
│ │ Margem minima: 11,8% (Lance E vs Custo A)                    │   │
│ │                                                                │   │
│ │ ── 6. Concorrentes ──                                         │   │
│ │ Empresa ABC | Empresa XYZ | Empresa DEF                      │   │
│ │                                                                │   │
│ │ ── 7. Vencedores Detalhados ──                                │   │
│ │ Empresa ABC: 3/5 atas, preco medio R$ 141,00                 │   │
│ │                                                                │   │
│ │ ── 8. Justificativa IA ──                                     │   │
│ │ "Com base em analise de 5 atas PNCP..."                       │   │
│ │                                                                │   │
│ │ ── 9. Valores Definidos ──                                    │   │
│ │ Valores finais confirmados pelo usuario                       │   │
│ │                                                                │   │
│ └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| P12-F01 | Botao Baixar MD | ActionButton | Download do relatorio em formato Markdown |
| P12-F02 | Botao Baixar PDF | ActionButton | Download do relatorio em formato PDF |
| P12-F03 | Secao Identificacao | Display | Edital, orgao, item, produto |
| P12-F04 | Secao Conversao | Display | Volumetria e rendimento |
| P12-F05 | Secao Analise Mercado | Display | Dados de atas e contratos PNCP |
| P12-F06 | Secao Sugestoes A-E | Display | Valores sugeridos por camada |
| P12-F07 | Secao Calculos | Display | Explicacao de markup e margens |
| P12-F08 | Secao Concorrentes | Display | Empresas concorrentes identificadas |
| P12-F09 | Secao Vencedores | Display | Detalhes dos vencedores com estatisticas |
| P12-F10 | Secao Justificativa | Display | Texto da justificativa gerada pela IA |
| P12-F11 | Secao Valores Definidos | Display | Valores finais confirmados |

### Sequencia de Eventos

1. Na PrecificacaoPage, usuario clica **"Relatorio de Custos e Precos"**
2. Sistema coleta todos os dados do vinculo: identificacao, conversao, analise IA, sugestoes, calculos
3. Sistema gera documento Markdown completo com todas as 9 secoes
4. Nova aba abre com o relatorio renderizado
5. **[P12-F01]** permite download do relatorio em formato MD
6. **[P12-F02]** permite download do relatorio em formato PDF
7. Usuario pode revisar e utilizar o relatorio para fundamentacao da proposta

### Implementacao Atual
**✅ IMPLEMENTADO**

---

---

# FASE 2 — PROPOSTA

---

## [UC-R01] Gerar Proposta Tecnica (Motor Automatico)

**RF relacionado:** RF-040-01
**Ator:** Usuario

### Pre-condicoes
1. Precificacao completa (camadas A-F definidas para pelo menos 1 lote)
2. Edital salvo com dados do orgao
3. Produto com specs tecnicas no portfolio

### Pos-condicoes
1. Proposta tecnica gerada com dados cruzados (preco + edital)
2. Proposta em status "rascunho", 100% editavel
3. LOG de criacao registrado

### Layout da Tela — PropostaPage (evolucao)

```
┌─────────────────────────────────────────────────────────────────────┐
│ GERACAO DE PROPOSTAS                                                │
│ Criar e gerenciar propostas tecnicas                               │
│                                         [ActionButton: Nova Proposta]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ MODAL: Gerar Nova Proposta ──────────────────────────────────┐  │
│ │                                                                │  │
│ │ [SelectInput: Edital ▼]  "PE 2024/001 - Hospital Univ. SP"   │  │
│ │ [SelectInput: Lote ▼]    "01 - Hematologia"  (novo!)         │  │
│ │ [SelectInput: Produto ▼] "Kit Hemograma XR200"               │  │
│ │                                                                │  │
│ │ ── Dados de Precificacao (auto-preenchidos) ──                │  │
│ │ Preco Unitario:  R$ 145,00 (da Camada D)  [editavel]        │  │
│ │ Quantidade:      101 kits (da Volumetria)  [editavel]        │  │
│ │ Valor Total:     R$ 14.645,00 (calculado)                    │  │
│ │                                                                │  │
│ │ ── Template ──                                                │  │
│ │ [SelectInput: Template ▼] "Padrao Orgao Federal"             │  │
│ │ [ActionButton: Upload Template Externo]                       │  │
│ │                                                                │  │
│ │ [ActionButton: Gerar Proposta] [ActionButton: Cancelar]      │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─ CARD: Editor da Proposta (apos geracao) ─────────────────────┐  │
│ │ [Toolbar: Negrito|Italico|Titulo|Lista|Tabela]                │  │
│ │                                                                │  │
│ │ ┌──────────────────────────────────────────────────────────┐  │  │
│ │ │ PROPOSTA TECNICA                                         │  │  │
│ │ │                                                          │  │  │
│ │ │ EDITAL: PE 2024/001                                     │  │  │
│ │ │ ORGAO: Hospital Universitario de Sao Paulo              │  │  │
│ │ │ LOTE: 01 - Hematologia                                  │  │  │
│ │ │                                                          │  │  │
│ │ │ 1. IDENTIFICACAO DO PROPONENTE                          │  │  │
│ │ │ [dados da empresa...]                                   │  │  │
│ │ │                                                          │  │  │
│ │ │ 2. DESCRICAO TECNICA DO PRODUTO                        │  │  │
│ │ │ [specs do portfolio...]                                 │  │  │
│ │ │                                                          │  │  │
│ │ │ 3. PROPOSTA COMERCIAL                                  │  │  │
│ │ │ Preco Unitario: R$ 145,00                              │  │  │
│ │ │ Quantidade: 101 kits                                   │  │  │
│ │ │ Valor Total: R$ 14.645,00                              │  │  │
│ │ │                                                          │  │  │
│ │ │ 4. CONDICOES DE ENTREGA                                │  │  │
│ │ │ [prazo, frete, garantia...]                             │  │  │
│ │ │                                                          │  │  │
│ │ │ 5. VALIDADE DA PROPOSTA                                │  │  │
│ │ │ [60 dias...]                                            │  │  │
│ │ └──────────────────────────────────────────────────────────┘  │  │
│ │                                                                │  │
│ │ [ActionButton: Salvar Rascunho]                               │  │
│ │ [ActionButton: Enviar para Revisao]                           │  │
│ └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| R01-F01 | Edital | SelectInput | Sim | Editais salvos |
| R01-F02 | Lote | SelectInput | Sim | Lotes do edital (NOVO — nao existe hoje) |
| R01-F03 | Produto | SelectInput | Sim | Produtos vinculados ao lote |
| R01-F04 | Preco Unitario | NumberInput | Sim | Pre-preenchido da Camada D, editavel |
| R01-F05 | Quantidade | NumberInput | Sim | Pre-preenchido da Volumetria, editavel |
| R01-F06 | Valor Total | Display calculado | — | F04 × F05 |
| R01-F07 | Template | SelectInput | Nao | Templates pre-configurados |
| R01-F08 | Upload Template | ActionButton + FileInput | Nao | Upload de template .docx externo |
| R01-F09 | Botao Gerar | ActionButton primary | — | Dispara motor de geracao IA |
| R01-F10 | Editor Rico | Textarea/WYSIWYG | — | Proposta 100% editavel com toolbar |
| R01-F11 | Toolbar | Barra de ferramentas | — | Negrito, Italico, Titulo, Lista, Tabela |
| R01-F12 | Botao Salvar Rascunho | ActionButton | — | Salva sem mudar status |
| R01-F13 | Botao Enviar Revisao | ActionButton | — | Muda status para "revisao" |

### Sequencia de Eventos

1. Usuario clica **"Nova Proposta"** no header da PropostaPage
2. Modal abre — usuario seleciona **[R01-F01] Edital**
3. Sistema carrega lotes do edital em **[R01-F02]** — usuario seleciona lote
4. Sistema carrega produtos do lote em **[R01-F03]** — usuario seleciona produto
5. **[R01-F04]** e **[R01-F05]** sao pre-preenchidos automaticamente da precificacao
6. **[R01-F06]** calcula valor total em tempo real
7. Opcionalmente seleciona **[R01-F07] Template** ou faz upload em **[R01-F08]**
8. Clica **[R01-F09] Gerar Proposta** — motor IA cruza precificacao + edital + specs
9. Sistema gera proposta e exibe em **[R01-F10] Editor Rico**
10. Usuario edita livremente usando **[R01-F11] Toolbar** — proposta e 100% editavel
11. Cada edicao gera LOG automatico (usuario, data, alteracao)
12. Usuario clica **[R01-F12] Salvar Rascunho** ou **[R01-F13] Enviar para Revisao**

### Implementacao Atual
**⚙️ PARCIAL.** Existe: `tool_gerar_proposta` (`tools.py:2879`) que gera texto via IA, PropostaPage com modal de criacao (Edital, Produto, Preco, Quantidade), tabela de propostas, preview com export PDF/DOCX. **Falta:** campo Lote, pre-preenchimento de camadas, template selecionavel, editor rico (hoje e `<pre>` readonly), LOG de edicoes, cruzamento com dados de precificacao.

---

## [UC-R02] Upload de Proposta Externa

**RF relacionado:** RF-040-02
**Ator:** Usuario

### Pre-condicoes
1. Usuario tem proposta elaborada fora do sistema (DOCX/PDF)

### Pos-condicoes
1. Proposta importada no sistema com status "rascunho"

### Layout — PropostaPage > Modal "Upload Externo"

```
┌─────────────────────────────────────────────────────────────────────┐
│ MODAL: Upload de Proposta Externa                                   │
│                                                                     │
│ [SelectInput: Edital ▼]                                            │
│ [SelectInput: Produto ▼]                                           │
│ [FileInput: Arquivo da Proposta] (.docx, .pdf)                     │
│ [NumberInput: Preco Unitario]                                      │
│ [NumberInput: Quantidade]                                          │
│                                                                     │
│ [ActionButton: Importar] [ActionButton: Cancelar]                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementacao Atual
**❌ NAO IMPLEMENTADO.** Upload de documentos existe na SubmissaoPage (para anexos), mas nao como alternativa de entrada na PropostaPage.

---

## [UC-R03] Personalizar Descricao Tecnica (A/B)

**RF relacionado:** RF-040-03
**Ator:** Usuario

### Pre-condicoes
1. Proposta gerada (UC-R01)

### Pos-condicoes
1. Descricao tecnica personalizada com LOG e backup

### Layout — PropostaPage > Editor > Secao Descricao Tecnica

```
┌─────────────────────────────────────────────────────────────────────┐
│ ── Descricao Tecnica do Produto ──                                  │
│                                                                     │
│ [Toggle A/B]  ● Opcao A (Texto do Edital)  ○ Opcao B (Personalizado)│
│                                                                     │
│ ── SE OPCAO A (padrao) ──                                          │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ "Analisador hematologico automatizado com capacidade minima   │  │
│ │  de 80 parametros, processamento de 120 amostras/hora..."     │  │
│ │ [Badge: Texto literal do edital — aderencia total]            │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ── SE OPCAO B ──                                                   │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ [TextArea editavel]                                            │  │
│ │ "O Kit Hemograma XR200 da Wiener e um reagente de alta..."    │  │
│ │                                                                │  │
│ │ [Badge: ⚠ TEXTO PERSONALIZADO — Versao original salva]       │  │
│ │ [Link: Ver versao original do edital]                         │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ [Badge Info: LOG registrado — usuario: pasteurjr, data: 13/03/26]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| R03-F01 | Toggle A/B | RadioGroup | Opcao A (edital) ou Opcao B (personalizado) |
| R03-F02 | Texto Edital | Display readonly | Texto literal extraido do edital |
| R03-F03 | Texto Personalizado | TextArea | Campo livre para descricao propria |
| R03-F04 | Badge Alerta | Badge warning | Indica que texto foi alterado |
| R03-F05 | Link Versao Original | Link | Abre modal com texto original do edital |
| R03-F06 | Badge LOG | Badge info | Mostra usuario e data da alteracao |

### Sequencia de Eventos

1. No editor da proposta, usuario localiza secao "Descricao Tecnica"
2. Por padrao, **[R03-F01]** esta em Opcao A e **[R03-F02]** mostra texto do edital
3. Se usuario muda para Opcao B, sistema salva versao original como backup
4. **[R03-F03]** fica editavel — usuario escreve descricao personalizada
5. **[R03-F04]** aparece automaticamente indicando alteracao
6. **[R03-F06]** registra automaticamente LOG (usuario, data, hora)
7. **[R03-F05]** permite ver texto original a qualquer momento

### Implementacao Atual
**❌ NAO IMPLEMENTADO.** A proposta gerada e texto corrido sem distincao A/B. Nao ha backup de versao original nem LOG de alteracoes de texto.

---

## [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)

**RF relacionado:** RF-040-04
**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Proposta em elaboracao com produtos selecionados
2. Produtos tem campo `registro_anvisa` preenchido

### Pos-condicoes
1. Cada produto tem status ANVISA visivel (verde/amarelo/vermelho)
2. Produtos com registro vencido estao BLOQUEADOS
3. LOG de validacao registrado

### Layout — PropostaPage > Secao Auditoria ou Card Lateral

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Auditoria ANVISA ──────────────────────────────────────┐  │
│ │ [Badge: Alta Confiabilidade — impacta confianca do cliente]    │  │
│ │                                                                │  │
│ │ ┌──────────────────────────────────────────────────────────┐  │  │
│ │ │ Produto        │ Registro  │ Validade   │ Status        │  │  │
│ │ ├──────────────────────────────────────────────────────────┤  │  │
│ │ │ Kit XR200      │ 12345678  │ 12/2027    │ ● Verde       │  │  │
│ │ │ Controle HM500 │ 87654321  │ 03/2026    │ ● Amarelo ⚠  │  │  │
│ │ │ Diluente D-100 │ 11111111  │ 01/2025    │ ● Vermelho ⛔│  │  │
│ │ │                │           │            │ [BLOQUEADO]   │  │  │
│ │ └──────────────────────────────────────────────────────────┘  │  │
│ │                                                                │  │
│ │ ⛔ 1 produto com registro VENCIDO — nao pode ser incluido     │  │
│ │                                                                │  │
│ │ [ActionButton: Verificar Registros]                            │  │
│ │ [Badge: LOG de validacao registrado — 13/03/2026 14:30]       │  │
│ └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Descricao |
|----|----------|------|-----------|
| R04-F01 | Tabela ANVISA | DataTable | Produto, Registro, Validade, Status |
| R04-F02 | Semaforo Verde | Badge verde | Registro valido — pronto para uso |
| R04-F03 | Semaforo Amarelo | Badge amarelo | Em processo — atencao |
| R04-F04 | Semaforo Vermelho | Badge vermelho | Vencido — BLOQUEIO |
| R04-F05 | Alerta Bloqueio | Banner erro | Indica produto bloqueado |
| R04-F06 | Botao Verificar | ActionButton | Consulta base ANVISA interna |
| R04-F07 | Badge LOG | Badge info | Confirma LOG de validacao registrado |

### Sequencia de Eventos

1. Ao gerar proposta, sistema automaticamente verifica registros ANVISA dos produtos
2. **[R04-F01]** exibe tabela com status de cada produto
3. **[R04-F02/F03/F04]** mostram semaforo por produto
4. Se produto tem registro vencido, **[R04-F05]** exibe alerta e sistema **BLOQUEIA** inclusao
5. Usuario pode clicar **[R04-F06]** para re-verificar (consulta base interna)
6. **[R04-F07]** confirma que LOG imutavel foi registrado (data, fonte, resultado)

### Implementacao Atual
**❌ NAO IMPLEMENTADO.** Campos `registro_anvisa` e `anvisa_status` existem no modelo Produto (`models.py:148-149`) mas sem semaforo visual, sem bloqueio automatico, sem LOG de validacao.

---

## [UC-R05] Auditoria Documental + Smart Split

**RF relacionado:** RF-040-05
**Ator:** Usuario

### Pre-condicoes
1. Proposta gerada
2. Documentos do produto cadastrados no portfolio

### Pos-condicoes
1. Todos os documentos exigidos identificados e validados
2. PDFs fracionados se necessario
3. Checklist pronto para validacao humana

### Layout — PropostaPage ou SubmissaoPage > Card Auditoria Documental

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Auditoria Documental e Checklist Inteligente ──────────┐  │
│ │                                                                │  │
│ │ ── 1. Identificacao ──                                        │  │
│ │ Documentos exigidos no edital:                                │  │
│ │ ☑ Instrucoes de Uso              [Carregado ✅]              │  │
│ │ ☑ Registro ANVISA                [Carregado ✅]              │  │
│ │ ☑ Manual Tecnico                 [Carregado ✅]              │  │
│ │ ☐ FISPQ                          [FALTANDO ❌]              │  │
│ │                                                                │  │
│ │ ── 2. Validacao e Adequacao ──                                │  │
│ │ Limite upload do portal: 25 MB por arquivo                    │  │
│ │ ┌────────────────────────────────────────────────────────┐    │  │
│ │ │ Documento          │ Tamanho │ Status         │ Acao   │    │  │
│ │ ├────────────────────────────────────────────────────────┤    │  │
│ │ │ Manual Tecnico.pdf │ 45 MB   │ ⚠ Excede limite│ [Split]│    │  │
│ │ │ Registro ANVISA    │ 2 MB    │ ✅ OK          │        │    │  │
│ │ │ Instrucoes Uso     │ 8 MB    │ ✅ OK          │        │    │  │
│ │ └────────────────────────────────────────────────────────┘    │  │
│ │                                                                │  │
│ │ [ActionButton: Fracionar Automaticamente (Smart Split)]       │  │
│ │ Resultado: Manual_parte1.pdf (24MB) + Manual_parte2.pdf (21MB)│  │
│ │                                                                │  │
│ │ ── 3. Checklist Final ──                                      │  │
│ │ [ACAO HUMANA] Validacao final da relacao de documentos        │  │
│ │ [ActionButton: Aprovar Checklist] [ActionButton: Upload Doc]  │  │
│ └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementacao Atual
**❌ NAO IMPLEMENTADO.** A SubmissaoPage tem checklist basico (4 itens: proposta tecnica, preco definido, documentos anexados, revisao final) mas sem: identificacao automatica de docs exigidos, validacao de tamanho, Smart Split, nem fracionamento.

---

## [UC-R06] Exportar Dossie Completo

**RF relacionado:** RF-041-01
**Ator:** Usuario

### Pre-condicoes
1. Proposta aprovada
2. Auditoria ANVISA e Documental concluidas
3. Todos os documentos validados

### Pos-condicoes
1. Pacote completo gerado (PDF + Word + Anexos)
2. Documentos ja fracionados para limites do portal

### Layout — PropostaPage ou SubmissaoPage > Card Exportacao

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Exportacao e Submissao Final ──────────────────────────┐  │
│ │                                                                │  │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐   │  │
│ │ │  [Icon PDF]  │ │ [Icon DOC]   │ │ [Icon ANEXOS]        │   │  │
│ │ │  Proposta    │ │ Proposta     │ │ Pacote de Anexos     │   │  │
│ │ │  PDF         │ │ Word         │ │ (auditado+fracionado)│   │  │
│ │ │  [Baixar]    │ │ [Baixar]     │ │ [Baixar ZIP]         │   │  │
│ │ └──────────────┘ └──────────────┘ └──────────────────────────┘   │  │
│ │                                                                │  │
│ │ [ActionButton: Baixar Dossie Completo (tudo em ZIP)]          │  │
│ │                                                                │  │
│ │ Conteudo do dossie:                                           │  │
│ │ • Proposta tecnica e comercial (PDF)                          │  │
│ │ • Proposta editavel (Word)                                    │  │
│ │ • Registro ANVISA (2 MB)                                      │  │
│ │ • Instrucoes de Uso (8 MB)                                    │  │
│ │ • Manual Tecnico parte 1 (24 MB)                              │  │
│ │ • Manual Tecnico parte 2 (21 MB)                              │  │
│ │ • Total: 6 arquivos, 78 MB                                    │  │
│ └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementacao Atual
**⚙️ PARCIAL.** Export de proposta individual PDF/DOCX existe (`app.py:8739` via weasyprint e python-docx). **Falta:** pacote consolidado com anexos, ZIP com dossie completo, fracionamento incluido.

---

## [UC-R07] Gerenciar Status e Submissao

**RF relacionado:** RF-041 (Submissao geral)
**Ator:** Usuario

### Pre-condicoes
1. Proposta criada (qualquer status)

### Pos-condicoes
1. Proposta progrediu no fluxo de status

### Fluxo de Status

```
rascunho → revisao → aprovada → enviada
```

### Layout — SubmissaoPage (existente, com evolucao)

```
┌─────────────────────────────────────────────────────────────────────┐
│ SUBMISSAO DE PROPOSTAS                                              │
│ Preparacao e envio de propostas aos portais                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ CARD: Propostas Prontas para Envio ──────────────────────────┐  │
│ │ ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐           │  │
│ │ │Edital│Orgao │Prod. │Valor │Abertura│Status│Progr.│           │  │
│ │ └──────┴──────┴──────┴──────┴──────┴──────┴──────┘           │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─ CARD: Checklist de Submissao ────────────────────────────────┐  │
│ │                                                                │  │
│ │ Edital: PE 2024/001 | Orgao: Hospital Univ. | Valor: R$14.645│  │
│ │                                                                │  │
│ │ ☑ Proposta tecnica gerada                                    │  │
│ │ ☑ Preco definido                                              │  │
│ │ ☑ Documentos anexados (3/3)                                   │  │
│ │ ☐ Revisao final                                               │  │
│ │                                                                │  │
│ │ [Anexar Documento] [Marcar Enviada] [Aprovar] [Abrir Portal]  │  │
│ └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementacao Atual
**✅ IMPLEMENTADO.** A SubmissaoPage existe com: tabela de propostas, checklist 4 itens (proposta tecnica, preco, documentos, revisao), botoes Anexar Documento (modal com tipo/arquivo/obs), Marcar como Enviada, Aprovar, Abrir Portal PNCP. Status: aguardando → enviada → aprovada. **Limitacoes:** upload de documento apenas incrementa contador (nao salva arquivo real), checklist e basico (nao detecta docs do edital automaticamente).

---

---

# RESUMO DE IMPLEMENTACAO

| Caso de Uso | Fase | Status | Detalhe |
|-------------|------|--------|---------|
| UC-P01 | PRECIFICACAO | ✅ IMPLEMENTADO | Lotes por especialidade, itens PNCP, nome curto extraido, ignorar/reativar |
| UC-P02 | PRECIFICACAO | ✅ IMPLEMENTADO | Vincular manual + IA auto-link + Buscar Web + ANVISA (com modais) |
| UC-P03 | PRECIFICACAO | ✅ IMPLEMENTADO | Deteccao automatica, rendimento das especificacoes, pergunta ao usuario |
| UC-P04 | PRECIFICACAO | ✅ IMPLEMENTADO | Custo manual, NCM automatico, ICMS isencao, tributos editaveis |
| UC-P05 | PRECIFICACAO | ✅ IMPLEMENTADO | Manual, Custo+Markup, Upload CSV, flag reutilizar |
| UC-P06 | PRECIFICACAO | ✅ IMPLEMENTADO | Auto-importacao edital + % sobre base + IA sugere |
| UC-P07 | PRECIFICACAO | ✅ IMPLEMENTADO | Absoluto/percentual, barra visual |
| UC-P08 | PRECIFICACAO | ⚙️ PARCIAL | Perfis existem, simulacao basica |
| UC-P09 | PRECIFICACAO | ✅ IMPLEMENTADO | Busca + stats + CSV export |
| UC-P10 | PRECIFICACAO | ⚙️ PARCIAL | CRUD + amortizacao, sem IA |
| UC-P11 | PRECIFICACAO | ✅ IMPLEMENTADO | Pipeline IA: historico + atas PNCP + justificativa + pre-preenche A-E |
| UC-P12 | PRECIFICACAO | ✅ IMPLEMENTADO | Relatorio MD com 9 secoes + download MD/PDF |
| UC-R01 | PROPOSTA | ⚙️ PARCIAL | Motor basico existe. Faltam lotes, camadas, templates, editor rico |
| UC-R02 | PROPOSTA | ❌ NAO IMPLEMENTADO | Nao existe upload de proposta externa |
| UC-R03 | PROPOSTA | ❌ NAO IMPLEMENTADO | Nao existe A/B com backup |
| UC-R04 | PROPOSTA | ❌ NAO IMPLEMENTADO | Campos ANVISA existem sem semaforo/bloqueio |
| UC-R05 | PROPOSTA | ❌ NAO IMPLEMENTADO | Checklist basico existe sem Smart Split |
| UC-R06 | PROPOSTA | ⚙️ PARCIAL | Export PDF/DOCX existe. Falta dossie completo |
| UC-R07 | PROPOSTA | ✅ IMPLEMENTADO | SubmissaoPage com checklist e fluxo de status |

**Totais:** 10 implementados + 4 parciais + 5 nao implementados = **19 casos de uso**

---

*Documento gerado em 24/03/2026. Cada caso de uso foi verificado contra o codebase atual.*
