# CASOS DE USO — IMPUGNACAO, RECURSOS E CONTRA-RAZOES

**Data:** 27/03/2026
**Versao:** 1.1
**Base:** requisitos_completosv6.md (RF-043, RF-044) + SPRINT RECURSOS E IMPUGNACOES - V02.docx
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Impugnacao/Esclarecimentos e Recursos/Contra-Razoes.
**Nota v1.1:** UC-D01/D02 (Disputas de Lances) removidos desta sprint — movidos para sprint futura dedicada (etapa 7 do workflow, entre Submissao e Followup).

---

## INDICE

### FASE 1 — IMPUGNACAO E ESCLARECIMENTOS
- [UC-I01] Validacao Legal do Edital
- [UC-I02] Sugerir Esclarecimento ou Impugnacao
- [UC-I03] Gerar Peticao de Impugnacao
- [UC-I04] Upload de Peticao Externa
- [UC-I05] Controle de Prazo

### FASE 2 — RECURSOS E CONTRA-RAZOES
- [UC-RE01] Monitorar Janela de Recurso
- [UC-RE02] Analisar Proposta Vencedora
- [UC-RE03] Chatbox de Analise
- [UC-RE04] Gerar Laudo de Recurso
- [UC-RE05] Gerar Laudo de Contra-Razao
- [UC-RE06] Submissao Automatica no Portal

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## [UC-I01] Validacao Legal do Edital

**RF relacionado:** RF-043-01
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Documento do edital esta disponivel (PDF importado ou texto extraido)
4. Base de legislacao configurada (Lei 14.133/2021, decretos regulamentadores, jurisprudencias)

### Pos-condicoes
1. Relatorio de validacao legal gerado com inconsistencias classificadas
2. Cada inconsistencia tem gravidade (ALTA, MEDIA, BAIXA)
3. Sugestao de acao por inconsistencia (Impugnacao ou Esclarecimento)
4. Relatorio salvo no banco vinculado ao edital
5. LOG de analise registrado

### Layout da Tela — ImpugnacaoPage > Aba "Validacao Legal"

```
┌─────────────────────────────────────────────────────────────────────┐
│ IMPUGNACAO E ESCLARECIMENTOS                                         │
│ Analise legal e peticoes para editais                                │
│                                                                      │
│ [Aba: Validacao Legal ●] [Aba: Peticoes] [Aba: Prazos]             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Selecao do Edital ────────────────────────────────────────┐│
│ │ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                 ││
│ │ [Badge: PDF importado ✅]  [Badge: 42 paginas]                  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Validacao Legal do Edital ────────────────────────────────┐│
│ │ [ActionButton: Analisar Edital com IA]                           ││
│ │ [Badge: ⏱ Tempo estimado: 30-60 segundos]                      ││
│ │                                                                   ││
│ │ ── Base Legal Utilizada ──                                       ││
│ │ • Lei 14.133/2021 (Nova Lei de Licitacoes)                      ││
│ │ • Decreto 11.462/2023 (Regulamenta pregao eletronico)           ││
│ │ • IN SEGES/ME 73/2022 (Pesquisa de precos)                     ││
│ │ • Jurisprudencias TCU (Acordaos 2020-2026)                     ││
│ │                                                                   ││
│ │ ┌─ Inconsistencias Detectadas ─────────────────────────────────┐ ││
│ │ │ # │ Trecho do Edital   │ Lei Violada     │ Gravidade│Sugestao││
│ │ ├───┼────────────────────┼─────────────────┼──────────┼────────┤ ││
│ │ │ 1 │ "Exige marca       │ Art. 41 §1o Lei │ ALTA     │Impugna-││
│ │ │   │  especifica sem    │ 14.133/2021     │ [🔴]    │cao     ││
│ │ │   │  justificativa"    │                 │          │        ││
│ │ │ 2 │ "Prazo de entrega  │ Art. 55 §1o Lei │ MEDIA    │Esclare-││
│ │ │   │  de 24h para todo  │ 14.133/2021     │ [🟡]    │cimento ││
│ │ │   │  territorio"       │                 │          │        ││
│ │ │ 3 │ "Nao apresenta     │ Decreto 11.462  │ ALTA     │Impugna-││
│ │ │   │  pesquisa de       │ Art. 23         │ [🔴]    │cao     ││
│ │ │   │  precos detalhada" │                 │          │        ││
│ │ │ 4 │ "Clausula de       │ Acordao TCU     │ BAIXA    │Esclare-││
│ │ │   │  penalidade        │ 1.214/2023      │ [🟢]    │cimento ││
│ │ │   │  desproporcional"  │                 │          │        ││
│ │ └───┴────────────────────┴─────────────────┴──────────┴────────┘ ││
│ │                                                                   ││
│ │ ── Resumo ──                                                     ││
│ │ Total de inconsistencias: 4                                      ││
│ │ [Badge: 🔴 ALTA: 2]  [Badge: 🟡 MEDIA: 1]  [Badge: 🟢 BAIXA: 1]││
│ │                                                                   ││
│ │ [ActionButton: Exportar Relatorio PDF]                           ││
│ │ [ActionButton: Prosseguir para Peticao (UC-I02)]                 ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| I01-F01 | Edital | SelectInput | Sim | Lista editais salvos (status=salvo). Formato: "PE {numero} - {orgao}" |
| I01-F02 | Badge PDF | Badge | — | Indica se PDF do edital foi importado |
| I01-F03 | Badge Paginas | Badge | — | Numero de paginas do edital |
| I01-F04 | Botao Analisar | ActionButton primary | — | Dispara analise da IA sobre o edital |
| I01-F05 | Timer Estimado | Badge | — | Tempo estimado para conclusao da analise |
| I01-F06 | Base Legal | Display lista | — | Lista de leis, decretos e jurisprudencias usadas na analise |
| I01-F07 | Tabela Inconsistencias | DataTable | — | Colunas: #, Trecho do Edital, Lei Violada, Gravidade, Sugestao |
| I01-F08 | Badge Gravidade ALTA | Badge vermelho | — | Inconsistencia critica — requer impugnacao |
| I01-F09 | Badge Gravidade MEDIA | Badge amarelo | — | Inconsistencia moderada — avaliar acao |
| I01-F10 | Badge Gravidade BAIXA | Badge verde | — | Inconsistencia leve — esclarecimento suficiente |
| I01-F11 | Resumo Contadores | Display badges | — | Contagem por gravidade |
| I01-F12 | Botao Exportar PDF | ActionButton | — | Exporta relatorio de validacao em PDF |
| I01-F13 | Botao Prosseguir Peticao | ActionButton | — | Navega para UC-I02 levando as inconsistencias |

### Sequencia de Eventos

1. Usuario acessa **ImpugnacaoPage** e clica na aba **"Validacao Legal"**
2. Usuario seleciona um edital em **[I01-F01]** — sistema verifica se PDF esta disponivel
3. **[I01-F02]** e **[I01-F03]** mostram status do documento
4. Usuario clica **[I01-F04] Analisar Edital com IA**
5. Sistema envia texto do edital para agente IA com prompt especifico para analise legal
6. IA le o edital completo, identifica leis aplicaveis (**[I01-F06]**) e compara clausula por clausula
7. IA retorna lista de inconsistencias com trecho, lei violada, gravidade e sugestao de acao
8. **[I01-F07]** exibe tabela com todas as inconsistencias detectadas
9. **[I01-F08/F09/F10]** badges de gravidade classificam cada item
10. **[I01-F11]** exibe resumo com contadores por gravidade
11. Usuario revisa cada inconsistencia na tabela
12. Opcionalmente clica **[I01-F12] Exportar Relatorio PDF** para salvar a analise
13. Usuario clica **[I01-F13] Prosseguir para Peticao** para criar peticao baseada nas inconsistencias

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-I02] Sugerir Esclarecimento ou Impugnacao

**RF relacionado:** RF-043-02
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Validacao legal concluida (UC-I01)
2. Inconsistencias detectadas e classificadas por gravidade
3. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Cada inconsistencia tem tipo de peticao sugerido (Impugnacao ou Esclarecimento)
2. Justificativa da sugestao registrada
3. Usuario validou e confirmou as sugestoes

### Layout da Tela — ImpugnacaoPage > Aba "Peticoes" > Secao Sugestao

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Validacao Legal] [Aba: Peticoes ●] [Aba: Prazos]             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Sugestao de Tipo de Peticao ─────────────────────────────┐│
│ │ Edital: PE 46/2026 — Fiocruz                                    ││
│ │ Inconsistencias a tratar: 4                                      ││
│ │                                                                   ││
│ │ ┌─ Inconsistencia #1 ─────────────────────────────────────────┐  ││
│ │ │ Trecho: "Exige marca especifica sem justificativa"          │  ││
│ │ │ Lei: Art. 41 §1o Lei 14.133/2021                            │  ││
│ │ │ Gravidade: [Badge: 🔴 ALTA]                                │  ││
│ │ │                                                              │  ││
│ │ │ Sugestao IA: [Badge: 📝 IMPUGNACAO]                        │  ││
│ │ │ Justificativa: "A exigencia de marca especifica sem         │  ││
│ │ │ justificativa tecnica viola o principio da isonomia e da    │  ││
│ │ │ competitividade. Jurisprudencia consolidada do TCU          │  ││
│ │ │ (Acordao 1.214/2023) e firme nesse sentido."               │  ││
│ │ │                                                              │  ││
│ │ │ [RadioGroup: (●) Aceitar Sugestao  ( ) Alterar para        │  ││
│ │ │                                      Esclarecimento         │  ││
│ │ │                                    ( ) Ignorar]             │  ││
│ │ └──────────────────────────────────────────────────────────────┘  ││
│ │                                                                   ││
│ │ ┌─ Inconsistencia #2 ─────────────────────────────────────────┐  ││
│ │ │ Trecho: "Prazo de entrega de 24h para todo territorio"      │  ││
│ │ │ Lei: Art. 55 §1o Lei 14.133/2021                            │  ││
│ │ │ Gravidade: [Badge: 🟡 MEDIA]                               │  ││
│ │ │                                                              │  ││
│ │ │ Sugestao IA: [Badge: ❓ ESCLARECIMENTO]                    │  ││
│ │ │ Justificativa: "O prazo de 24h para entrega em todo o       │  ││
│ │ │ territorio nacional e potencialmente inexequivel. Cabe      │  ││
│ │ │ pedido de esclarecimento ao pregoeiro."                     │  ││
│ │ │                                                              │  ││
│ │ │ [RadioGroup: (●) Aceitar Sugestao  ( ) Alterar para        │  ││
│ │ │                                      Impugnacao             │  ││
│ │ │                                    ( ) Ignorar]             │  ││
│ │ └──────────────────────────────────────────────────────────────┘  ││
│ │                                                                   ││
│ │ (... repete para cada inconsistencia ...)                        ││
│ │                                                                   ││
│ │ ── Resumo de Decisoes ──                                         ││
│ │ Impugnacoes: 2  |  Esclarecimentos: 1  |  Ignoradas: 1          ││
│ │                                                                   ││
│ │ [ActionButton: Confirmar e Gerar Peticoes]                       ││
│ │ [ActionButton: Voltar para Validacao]                            ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| I02-F01 | Edital | Display readonly | — | Edital selecionado na validacao legal |
| I02-F02 | Contador Inconsistencias | Display | — | Total de inconsistencias a tratar |
| I02-F03 | Card Inconsistencia | Card expansivel | — | Card por inconsistencia com trecho, lei e gravidade |
| I02-F04 | Trecho | Display | — | Texto do edital com a inconsistencia |
| I02-F05 | Lei Violada | Display | — | Artigo de lei, decreto ou jurisprudencia |
| I02-F06 | Badge Gravidade | Badge colorido | — | ALTA (vermelho), MEDIA (amarelo), BAIXA (verde) |
| I02-F07 | Badge Sugestao IA | Badge | — | Tipo sugerido: IMPUGNACAO ou ESCLARECIMENTO |
| I02-F08 | Justificativa IA | TextBlock | — | Fundamentacao da sugestao pela IA |
| I02-F09 | Decisao | RadioGroup | Sim | 3 opcoes: Aceitar Sugestao, Alterar Tipo, Ignorar |
| I02-F10 | Resumo Decisoes | Display contadores | — | Quantitativo por tipo de decisao |
| I02-F11 | Botao Confirmar | ActionButton primary | — | Confirma decisoes e inicia geracao de peticoes |
| I02-F12 | Botao Voltar | ActionButton | — | Retorna para aba de Validacao Legal |

### Sequencia de Eventos

1. Apos validacao legal (UC-I01), usuario clica **[I01-F13] Prosseguir para Peticao**
2. Sistema carrega inconsistencias detectadas e exibe em **[I02-F03]** cards individuais
3. Para cada inconsistencia, IA determina tipo de peticao (**[I02-F07]**) e gera justificativa (**[I02-F08]**)
4. **Regra de sugestao:** Gravidade ALTA → Impugnacao; MEDIA → Esclarecimento; BAIXA → Esclarecimento
5. Usuario revisa cada card e seleciona decisao em **[I02-F09]**: aceitar, alterar ou ignorar
6. **[I02-F10]** atualiza resumo em tempo real conforme usuario decide
7. Usuario clica **[I02-F11] Confirmar e Gerar Peticoes**
8. Sistema agrupa: inconsistencias marcadas como "Impugnacao" vao para UC-I03, "Esclarecimento" geram pedido separado
9. Decisoes salvas no banco vinculadas ao edital

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-I03] Gerar Peticao de Impugnacao

**RF relacionado:** RF-043-03
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Inconsistencias classificadas e tipo de peticao definido (UC-I02)
2. Pelo menos uma inconsistencia marcada como "Impugnacao"
3. Base de legislacao e jurisprudencias disponivel
4. Templates de peticao configurados (padrao ou customizado)

### Pos-condicoes
1. Peticao de impugnacao gerada com texto completo
2. Peticao contem: identificacao de inconsistencias, base legal, jurisprudencias aplicaveis
3. Documento salvo em status "rascunho" com LOG de criacao
4. Peticao disponivel para edicao e exportacao

### Layout da Tela — ImpugnacaoPage > Aba "Peticoes" > Geracao

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Geracao de Peticao de Impugnacao ────────────────────────┐│
│ │ Edital: PE 46/2026 — Fiocruz                                    ││
│ │ Inconsistencias selecionadas: 2 (Gravidade ALTA)                ││
│ │                                                                   ││
│ │ [SelectInput: Template ▼] Padrao Lei 14.133 | Customizado       ││
│ │ [ActionButton: Upload Template Externo] (.docx)                  ││
│ │                                                                   ││
│ │ ── Dados do Impugnante ──                                        ││
│ │ [TextInput: Razao Social]  "Empresa Diagnostica LTDA"            ││
│ │ [TextInput: CNPJ]          "12.345.678/0001-90"                  ││
│ │ [TextInput: Representante Legal]  "Joao da Silva"                ││
│ │                                                                   ││
│ │ [ActionButton: Gerar Peticao com IA]                             ││
│ │                                                                   ││
│ │ ┌─ Editor Rico ─────────────────────────────────────────────────┐││
│ │ │ [Toolbar: B I H1 H2 Lista Tabela]                             │││
│ │ │                                                                │││
│ │ │ EXCELENTISSIMO SENHOR PREGOEIRO                               │││
│ │ │ Pregao Eletronico No 46/2026 — Fiocruz                       │││
│ │ │                                                                │││
│ │ │ ## 1. QUALIFICACAO DO IMPUGNANTE                              │││
│ │ │ [dados da empresa gerados pela IA...]                         │││
│ │ │                                                                │││
│ │ │ ## 2. DOS FATOS                                               │││
│ │ │ [descricao das inconsistencias detectadas...]                 │││
│ │ │                                                                │││
│ │ │ ## 3. DO DIREITO                                              │││
│ │ │ ### 3.1. Da exigencia de marca especifica                    │││
│ │ │ [fundamentacao legal com Art. 41 §1o...]                      │││
│ │ │ ### 3.2. Da ausencia de pesquisa de precos                   │││
│ │ │ [fundamentacao legal com Decreto 11.462...]                   │││
│ │ │                                                                │││
│ │ │ ## 4. DAS JURISPRUDENCIAS                                    │││
│ │ │ [acordaos do TCU relevantes...]                               │││
│ │ │                                                                │││
│ │ │ ## 5. DO PEDIDO                                               │││
│ │ │ [pedido formal de impugnacao com requerimentos...]            │││
│ │ │                                                                │││
│ │ │ [Local], [Data]                                               │││
│ │ │ [Assinatura]                                                  │││
│ │ └───────────────────────────────────────────────────────────────┘││
│ │                                                                   ││
│ │ [ActionButton: Salvar Rascunho]                                  ││
│ │ [ActionButton: Exportar PDF]                                     ││
│ │ [ActionButton: Exportar DOCX]                                    ││
│ │ [Badge LOG: Criado por pasteurjr em 27/03/2026 10:00]           ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| I03-F01 | Edital | Display readonly | — | Edital com inconsistencias selecionadas |
| I03-F02 | Inconsistencias | Display readonly | — | Quantidade e gravidade das inconsistencias |
| I03-F03 | Template | SelectInput | Sim | Opcoes: "Padrao Lei 14.133" ou "Customizado" |
| I03-F04 | Upload Template | ActionButton + FileInput | Nao | Upload de template .docx externo |
| I03-F05 | Razao Social | TextInput | Sim | Razao social da empresa impugnante |
| I03-F06 | CNPJ | TextInput | Sim | CNPJ da empresa impugnante |
| I03-F07 | Representante Legal | TextInput | Sim | Nome do representante legal |
| I03-F08 | Botao Gerar | ActionButton primary | — | Dispara geracao da peticao via IA |
| I03-F09 | Editor Rico | Textarea/WYSIWYG | — | Peticao 100% editavel com toolbar |
| I03-F10 | Toolbar | Barra de ferramentas | — | Negrito, Italico, Titulo H1/H2, Lista, Tabela |
| I03-F11 | Botao Salvar Rascunho | ActionButton | — | Salva sem mudar status |
| I03-F12 | Botao Exportar PDF | ActionButton | — | Exporta peticao em formato PDF |
| I03-F13 | Botao Exportar DOCX | ActionButton | — | Exporta peticao em formato Word |
| I03-F14 | Badge LOG | Badge info | — | LOG imutavel com usuario, data e hora |

### Sequencia de Eventos

1. Apos confirmacao de tipos (UC-I02), sistema navega para geracao de peticao
2. **[I03-F01]** e **[I03-F02]** mostram edital e inconsistencias selecionadas
3. Usuario seleciona template em **[I03-F03]** ou faz upload em **[I03-F04]**
4. Usuario preenche dados do impugnante: **[I03-F05]** Razao Social, **[I03-F06]** CNPJ, **[I03-F07]** Representante
5. Usuario clica **[I03-F08] Gerar Peticao com IA**
6. IA gera documento completo com 5 secoes: Qualificacao, Fatos, Direito, Jurisprudencias, Pedido
7. Peticao aparece em **[I03-F09] Editor Rico** — 100% editavel
8. Usuario revisa e edita livremente usando **[I03-F10] Toolbar**
9. Cada edicao gera LOG automatico (**[I03-F14]**)
10. Usuario clica **[I03-F11] Salvar Rascunho** para salvar
11. Opcionalmente clica **[I03-F12]** ou **[I03-F13]** para exportar em PDF ou DOCX

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-I04] Upload de Peticao Externa

**RF relacionado:** RF-043-04
**Ator:** Usuario

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital esta salvo no sistema
3. Usuario possui peticao de impugnacao elaborada fora do sistema (DOCX/PDF)

### Pos-condicoes
1. Peticao importada no sistema com status "rascunho"
2. Documento vinculado ao edital
3. LOG de upload registrado

### Layout da Tela — ImpugnacaoPage > Aba "Peticoes" > Modal Upload

```
┌─────────────────────────────────────────────────────────────────────┐
│ MODAL: Upload de Peticao Externa                                     │
│                                                               [X]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                    │
│                                                                      │
│ [SelectInput: Tipo de Peticao ▼]                                    │
│   Opcoes: Impugnacao | Esclarecimento | Recurso | Contra-Razao     │
│                                                                      │
│ [TextInput: Titulo da Peticao]  "Impugnacao — Marca especifica"    │
│                                                                      │
│ [FileInput: Arquivo da Peticao] (.docx, .pdf)                      │
│ [Badge: Tamanho maximo: 50 MB]                                      │
│                                                                      │
│ [TextArea: Observacoes]                                             │
│ "Peticao elaborada pelo departamento juridico externo"              │
│                                                                      │
│ ── Preview ──                                                       │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ [Preview do documento carregado — primeiras paginas]           │  │
│ │ Pagina 1 de 8                                                  │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│ [ActionButton: Importar Peticao]  [ActionButton: Cancelar]          │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| I04-F01 | Edital | SelectInput | Sim | Editais salvos no sistema |
| I04-F02 | Tipo de Peticao | SelectInput | Sim | Impugnacao, Esclarecimento, Recurso ou Contra-Razao |
| I04-F03 | Titulo | TextInput | Sim | Titulo descritivo da peticao |
| I04-F04 | Arquivo | FileInput | Sim | Aceita .docx e .pdf. Limite: 50 MB |
| I04-F05 | Badge Tamanho | Badge | — | Indica limite maximo de tamanho |
| I04-F06 | Observacoes | TextArea | Nao | Notas livres sobre a peticao |
| I04-F07 | Preview | Display | — | Visualizacao das primeiras paginas do documento |
| I04-F08 | Botao Importar | ActionButton primary | — | Salva peticao no sistema vinculada ao edital |
| I04-F09 | Botao Cancelar | ActionButton | — | Fecha modal sem salvar |

### Sequencia de Eventos

1. Na **ImpugnacaoPage**, usuario clica botao **"Upload Peticao Externa"**
2. Modal abre — usuario seleciona edital em **[I04-F01]**
3. Usuario seleciona tipo em **[I04-F02]**: Impugnacao, Esclarecimento, Recurso ou Contra-Razao
4. Usuario preenche **[I04-F03]** com titulo descritivo
5. Usuario seleciona arquivo em **[I04-F04]** — sistema valida formato e tamanho
6. **[I04-F07]** exibe preview das primeiras paginas
7. Opcionalmente preenche **[I04-F06]** com observacoes
8. Usuario clica **[I04-F08] Importar Peticao**
9. Sistema salva documento no banco com status "rascunho", vinculado ao edital
10. Modal fecha e peticao aparece na lista de peticoes do edital
11. LOG de upload registrado automaticamente

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-I05] Controle de Prazo

**RF relacionado:** RF-043-05
**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital salvo no sistema com data de abertura definida
2. Peticao em elaboracao ou planejada para o edital
3. Canais de notificacao configurados (email, WhatsApp, sistema)

### Pos-condicoes
1. Alertas configurados para 3 dias uteis antes da abertura
2. Notificacoes enviadas nos canais ativos
3. Status de prazo visivel na interface
4. LOG de notificacoes registrado

### Layout da Tela — ImpugnacaoPage > Aba "Prazos"

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Validacao Legal] [Aba: Peticoes] [Aba: Prazos ●]             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Controle de Prazos de Impugnacao ─────────────────────────┐│
│ │                                                                   ││
│ │ ┌─────┬──────────────────┬────────────┬────────────┬────────────┐││
│ │ │ Ed. │ Edital           │ Abertura   │ Prazo Imp. │ Status     │││
│ │ ├─────┼──────────────────┼────────────┼────────────┼────────────┤││
│ │ │ 1   │ PE 46/2026       │ 02/04/2026 │ 28/03/2026 │ [🟢 4 dias│││
│ │ │     │ Fiocruz          │            │            │   restantes│││
│ │ │     │                  │            │            │  ]         │││
│ │ │ 2   │ PE 12/2026       │ 30/03/2026 │ 27/03/2026 │ [🔴 HOJE! │││
│ │ │     │ HCFMUSP          │            │            │  Ultimo dia│││
│ │ │     │                  │            │            │  ]         │││
│ │ │ 3   │ PE 88/2026       │ 28/03/2026 │ 25/03/2026 │ [⚫ EXPIRADO│││
│ │ │     │ UFMG             │            │            │  ]         │││
│ │ └─────┴──────────────────┴────────────┴────────────┴────────────┘││
│ │                                                                   ││
│ │ Regra: Impugnacao deve ser protocolada ate 3 dias uteis antes    ││
│ │ da data de abertura do certame (Art. 164 Lei 14.133/2021)        ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Configuracao de Alertas ──────────────────────────────────┐│
│ │                                                                   ││
│ │ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                 ││
│ │                                                                   ││
│ │ Alertas programados:                                             ││
│ │ [Checkbox: ☑ 5 dias uteis antes]  — Lembrete inicial            ││
│ │ [Checkbox: ☑ 3 dias uteis antes]  — Prazo limite impugnacao     ││
│ │ [Checkbox: ☑ 1 dia util antes]    — Alerta urgente              ││
│ │ [Checkbox: ☑ No dia da abertura]  — Confirmacao                 ││
│ │                                                                   ││
│ │ Canais de notificacao:                                           ││
│ │ [Checkbox: ☑ WhatsApp]   [TextInput: +55 11 99999-0000]        ││
│ │ [Checkbox: ☑ Email]      [TextInput: usuario@empresa.com]      ││
│ │ [Checkbox: ☑ Alerta no sistema]                                 ││
│ │                                                                   ││
│ │ [ActionButton: Salvar Configuracao de Alertas]                   ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Historico de Notificacoes ────────────────────────────────┐│
│ │ ┌──────┬──────────────┬──────────────┬──────────────┬──────────┐││
│ │ │ Data │ Edital       │ Canal        │ Mensagem     │ Status   │││
│ │ ├──────┼──────────────┼──────────────┼──────────────┼──────────┤││
│ │ │ 25/03│ PE 46/2026   │ WhatsApp     │ 5 dias uteis │ Enviado ✅││
│ │ │ 25/03│ PE 46/2026   │ Email        │ 5 dias uteis │ Enviado ✅││
│ │ │ 27/03│ PE 12/2026   │ WhatsApp     │ ULTIMO DIA!  │ Enviado ✅││
│ │ └──────┴──────────────┴──────────────┴──────────────┴──────────┘││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| I05-F01 | Tabela Prazos | DataTable | — | Colunas: Edital, Abertura, Prazo Impugnacao, Status |
| I05-F02 | Badge Dias Restantes | Badge colorido | — | Verde (>3 dias), Amarelo (1-3 dias), Vermelho (hoje), Preto (expirado) |
| I05-F03 | Regra Legal | Display | — | Referencia ao Art. 164 da Lei 14.133/2021 |
| I05-F04 | Edital (config) | SelectInput | Sim | Seleciona edital para configurar alertas |
| I05-F05 | Checkbox 5 dias | Checkbox | Nao | Alerta 5 dias uteis antes |
| I05-F06 | Checkbox 3 dias | Checkbox | Sim | Alerta 3 dias uteis antes (prazo limite) |
| I05-F07 | Checkbox 1 dia | Checkbox | Nao | Alerta 1 dia util antes (urgente) |
| I05-F08 | Checkbox Dia Abertura | Checkbox | Nao | Alerta no dia da abertura |
| I05-F09 | Checkbox WhatsApp | Checkbox + TextInput | Nao | Canal WhatsApp com numero |
| I05-F10 | Checkbox Email | Checkbox + TextInput | Nao | Canal email com endereco |
| I05-F11 | Checkbox Alerta Sistema | Checkbox | Nao | Notificacao interna no sistema |
| I05-F12 | Botao Salvar Config | ActionButton primary | — | Salva configuracao de alertas |
| I05-F13 | Tabela Historico Notificacoes | DataTable | — | Colunas: Data, Edital, Canal, Mensagem, Status |

### Sequencia de Eventos

1. Usuario acessa **ImpugnacaoPage** e clica na aba **"Prazos"**
2. **[I05-F01]** exibe todos os editais salvos com suas datas de abertura e prazo de impugnacao
3. Sistema calcula automaticamente prazo de impugnacao: 3 dias uteis antes da abertura
4. **[I05-F02]** badges coloridos indicam urgencia de cada edital
5. Usuario seleciona edital em **[I05-F04]** para configurar alertas
6. Marca checkboxes de marcos temporais: **[I05-F05]** a **[I05-F08]**
7. Configura canais de notificacao: **[I05-F09]** WhatsApp, **[I05-F10]** Email, **[I05-F11]** Sistema
8. Clica **[I05-F12] Salvar Configuracao de Alertas**
9. Sistema agenda alertas automaticos nos marcos definidos
10. Quando marco e atingido, sistema envia notificacao nos canais ativos
11. **[I05-F13]** registra historico de todas as notificacoes enviadas com status

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## [UC-RE01] Monitorar Janela de Recurso

**RF relacionado:** RF-044-01
**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital em fase pos-disputa (lances encerrados)
2. Resultado do certame publicado ou em vias de publicacao
3. Canais de notificacao configurados (WhatsApp, email, alerta sistema)
4. Portal gov.br acessivel para monitoramento

### Pos-condicoes
1. Abertura da janela de recurso detectada automaticamente
2. Notificacoes enviadas em ate 10 minutos apos abertura
3. Intencao de recurso registrada se manifestada pelo usuario
4. LOG de monitoramento completo registrado

### Layout da Tela — RecursoPage > Aba "Monitoramento"

```
┌─────────────────────────────────────────────────────────────────────┐
│ RECURSOS E CONTRA-RAZOES                                             │
│ Monitoramento, analise e geracao de laudos                          │
│                                                                      │
│ [Aba: Monitoramento ●] [Aba: Analise] [Aba: Laudos]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Monitoramento de Janela de Recurso ──────────────────────┐│
│ │ [Badge: ⏳ Aguardando abertura]                                  ││
│ │ Edital: PE 46/2026 — Fiocruz                                    ││
│ │ Data abertura: [aguardando]                                      ││
│ │ Ultimo check: 27/03/2026 10:45:00                                ││
│ │                                                                   ││
│ │ ── Configuracao de Monitoramento ──                              ││
│ │ [NumberInput: Intervalo de verificacao (min)]  [5]               ││
│ │ [Badge: Verificando a cada 5 minutos]                            ││
│ │                                                                   ││
│ │ Notificacoes ativas:                                             ││
│ │ [Checkbox: ☑ WhatsApp]  [Checkbox: ☑ Email]                    ││
│ │ [Checkbox: ☑ Alerta no sistema]                                 ││
│ │                                                                   ││
│ │ [ActionButton: Iniciar Monitoramento]                            ││
│ │ [ActionButton: Verificar Agora]                                  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Janela Detectada ─────────────────────────────────────────┐│
│ │ [Badge: 🔴 JANELA ABERTA — 10 min para manifestacao!]           ││
│ │                                                                   ││
│ │ Detectada em: 27/03/2026 11:00:02                                ││
│ │ Tempo restante para manifestacao: [Badge: ⏱ 08:32]             ││
│ │ Prazo para recurso completo: 3 dias uteis                       ││
│ │                                                                   ││
│ │ ── Notificacoes Enviadas ──                                      ││
│ │ ✅ WhatsApp enviado em 11:00:05                                  ││
│ │ ✅ Email enviado em 11:00:08                                     ││
│ │ ✅ Alerta no sistema em 11:00:02                                 ││
│ │                                                                   ││
│ │ [ActionButton: Registrar Intencao de Recurso]                    ││
│ │ [ActionButton: Registrar Intencao de Contra-Razao]               ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Editais Monitorados ──────────────────────────────────────┐│
│ │ ┌──────┬──────────────┬──────────────┬──────────────┬──────────┐││
│ │ │ #    │ Edital       │ Fase         │ Janela       │ Acao     │││
│ │ ├──────┼──────────────┼──────────────┼──────────────┼──────────┤││
│ │ │ 1    │ PE 46/2026   │ Pos-disputa  │ 🔴 ABERTA   │ [Ir]    │││
│ │ │ 2    │ PE 12/2026   │ Pos-disputa  │ ⏳ Aguardando│ [Config] │││
│ │ │ 3    │ PE 88/2026   │ Encerrado    │ ⚫ Expirada  │ —       │││
│ │ └──────┴──────────────┴──────────────┴──────────────┴──────────┘││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE01-F01 | Badge Status | Badge colorido | — | Aguardando (amarelo), Aberta (vermelho), Expirada (preto) |
| RE01-F02 | Edital | Display readonly | — | Identificacao do edital monitorado |
| RE01-F03 | Data Abertura | Display | — | Data/hora de abertura da janela (quando detectada) |
| RE01-F04 | Ultimo Check | Display | — | Timestamp da ultima verificacao automatica |
| RE01-F05 | Intervalo Verificacao | NumberInput | Sim | Intervalo em minutos entre verificacoes (padrao: 5) |
| RE01-F06 | Checkbox WhatsApp | Checkbox | Nao | Canal de notificacao WhatsApp |
| RE01-F07 | Checkbox Email | Checkbox | Nao | Canal de notificacao email |
| RE01-F08 | Checkbox Alerta Sistema | Checkbox | Nao | Canal de notificacao interno |
| RE01-F09 | Botao Iniciar | ActionButton primary | — | Inicia monitoramento periodico automatico |
| RE01-F10 | Botao Verificar Agora | ActionButton | — | Forca verificacao imediata no portal |
| RE01-F11 | Badge Janela Aberta | Badge vermelho | — | Alerta critico quando janela e detectada |
| RE01-F12 | Timer Manifestacao | Badge timer | — | Contagem regressiva de 10 minutos |
| RE01-F13 | Prazo Recurso | Display | — | Prazo de 3 dias uteis para recurso completo |
| RE01-F14 | Status Notificacoes | Lista de status | — | Confirmacao de envio por canal |
| RE01-F15 | Botao Registrar Recurso | ActionButton primary | — | Manifesta intencao de recurso no sistema |
| RE01-F16 | Botao Registrar Contra-Razao | ActionButton | — | Manifesta intencao de contra-razao |
| RE01-F17 | Tabela Editais Monitorados | DataTable | — | Colunas: #, Edital, Fase, Janela, Acao |

### Sequencia de Eventos

1. Usuario acessa **RecursoPage** e clica na aba **"Monitoramento"**
2. Seleciona edital em fase pos-disputa para monitorar
3. Configura **[RE01-F05]** intervalo de verificacao (padrao 5 minutos)
4. Ativa canais de notificacao: **[RE01-F06]** WhatsApp, **[RE01-F07]** Email, **[RE01-F08]** Sistema
5. Clica **[RE01-F09] Iniciar Monitoramento** — sistema agenda verificacoes periodicas
6. A cada intervalo, sistema consulta portal gov.br buscando abertura de janela de recurso
7. **[RE01-F04]** atualiza com timestamp de cada verificacao
8. Quando janela e detectada: **[RE01-F11]** exibe alerta vermelho critico
9. **[RE01-F12]** inicia contagem regressiva de 10 minutos para manifestacao
10. Sistema dispara notificacoes imediatas nos canais ativos — **[RE01-F14]** confirma envios
11. Usuario recebe WhatsApp/Email/Alerta com link direto para a pagina
12. Usuario clica **[RE01-F15] Registrar Intencao de Recurso** ou **[RE01-F16] Contra-Razao**
13. **[RE01-F17]** atualiza status do edital na tabela de monitorados

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-RE02] Analisar Proposta Vencedora

**RF relacionado:** RF-044-02
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Resultado do certame publicado
2. Proposta vencedora disponivel para analise (documento ou dados do portal)
3. Edital completo com requisitos tecnicos e legais disponivel
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Relatorio de analise da proposta vencedora gerado
2. Inconsistencias na proposta vencedora identificadas e classificadas
3. Comparativo proposta vs edital vs legislacao documentado
4. Subsidios para recurso prontos

### Layout da Tela — RecursoPage > Aba "Analise"

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Monitoramento] [Aba: Analise ●] [Aba: Laudos]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Selecao e Importacao ─────────────────────────────────────┐│
│ │ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                 ││
│ │                                                                   ││
│ │ ── Proposta Vencedora ──                                         ││
│ │ [TextInput: Empresa Vencedora]  "Empresa ABC Diagnosticos"      ││
│ │ [NumberInput: Valor Vencedor]   [R$ 128.000,00]                  ││
│ │ [FileInput: Documento da Proposta] (.pdf, .docx)                 ││
│ │ [Badge: Documento carregado ✅ — 15 paginas]                    ││
│ │                                                                   ││
│ │ [ActionButton: Analisar Proposta com IA]                         ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ CARD: Resultado da Analise IA ──────────────────────────────────┐│
│ │ [Badge: Analise concluida — 8 pontos avaliados]                  ││
│ │                                                                   ││
│ │ ┌─ Inconsistencias na Proposta Vencedora ──────────────────────┐ ││
│ │ │ # │ Aspecto          │ Edital Exige    │ Proposta Apresenta│S│ ││
│ │ ├───┼──────────────────┼─────────────────┼───────────────────┼─┤ ││
│ │ │ 1 │ Registro ANVISA  │ Vigente e ativo │ Vencido 01/2026   │🔴││
│ │ │ 2 │ Prazo entrega    │ 30 dias corridos│ Nao especificou   │🟡││
│ │ │ 3 │ Capacidade equip.│ Min. 120 am/h   │ 80 am/h declarado │🔴││
│ │ │ 4 │ Certificacao ISO │ ISO 13485       │ Apresentou ISO 9001│🟡││
│ │ └───┴──────────────────┴─────────────────┴───────────────────┴─┘ ││
│ │                                                                   ││
│ │ ── Analise Legal ──                                              ││
│ │ ┌────────────────────────────────────────────────────────────┐   ││
│ │ │ • Art. 59 §1o Lei 14.133: Habilitacao tecnica insuficiente│   ││
│ │ │ • Art. 71 Lei 14.133: Proposta inexequivel                │   ││
│ │ │ • Acordao TCU 2.145/2024: Precedente sobre ANVISA vencida │   ││
│ │ └────────────────────────────────────────────────────────────┘   ││
│ │                                                                   ││
│ │ ── Recomendacao IA ──                                            ││
│ │ [Badge: 📋 RECURSO RECOMENDADO — 2 inconsistencias ALTA]       ││
│ │ "A proposta vencedora apresenta 2 desvios criticos: registro    ││
│ │  ANVISA vencido e capacidade do equipamento abaixo do exigido.  ││
│ │  Recomenda-se interposicao de recurso administrativo."          ││
│ │                                                                   ││
│ │ [ActionButton: Gerar Laudo de Recurso (UC-RE04)]                 ││
│ │ [ActionButton: Abrir Chatbox de Analise (UC-RE03)]               ││
│ │ [ActionButton: Exportar Analise PDF]                             ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE02-F01 | Edital | SelectInput | Sim | Editais em fase pos-disputa |
| RE02-F02 | Empresa Vencedora | TextInput | Sim | Nome da empresa que venceu o certame |
| RE02-F03 | Valor Vencedor | NumberInput | Sim | Valor da proposta vencedora |
| RE02-F04 | Documento Proposta | FileInput | Sim | PDF/DOCX da proposta vencedora |
| RE02-F05 | Badge Documento | Badge | — | Status do documento carregado |
| RE02-F06 | Botao Analisar | ActionButton primary | — | Dispara analise comparativa pela IA |
| RE02-F07 | Badge Resultado | Badge | — | Resumo da analise (pontos avaliados) |
| RE02-F08 | Tabela Inconsistencias | DataTable | — | Colunas: #, Aspecto, Edital Exige, Proposta Apresenta, Severidade |
| RE02-F09 | Badge Severidade | Badge colorido | — | Vermelho (critico), Amarelo (atencao) |
| RE02-F10 | Analise Legal | Lista de artigos | — | Artigos de lei e jurisprudencias aplicaveis |
| RE02-F11 | Recomendacao IA | Badge + TextBlock | — | Recomendacao sobre interposicao de recurso |
| RE02-F12 | Botao Gerar Laudo | ActionButton | — | Navega para UC-RE04 com dados pre-carregados |
| RE02-F13 | Botao Chatbox | ActionButton | — | Abre chatbox de analise (UC-RE03) |
| RE02-F14 | Botao Exportar PDF | ActionButton | — | Exporta relatorio de analise em PDF |

### Sequencia de Eventos

1. Usuario acessa **RecursoPage** e clica na aba **"Analise"**
2. Seleciona edital em **[RE02-F01]**
3. Preenche dados da proposta vencedora: **[RE02-F02]** empresa, **[RE02-F03]** valor
4. Faz upload do documento da proposta em **[RE02-F04]**
5. **[RE02-F05]** confirma documento carregado com quantidade de paginas
6. Clica **[RE02-F06] Analisar Proposta com IA**
7. IA compara proposta vencedora com: requisitos do edital, legislacao aplicavel, jurisprudencias
8. **[RE02-F08]** exibe tabela de inconsistencias com comparativo lado-a-lado
9. **[RE02-F09]** classifica cada inconsistencia por severidade
10. **[RE02-F10]** lista artigos de lei e jurisprudencias relevantes
11. **[RE02-F11]** exibe recomendacao da IA sobre necessidade de recurso
12. Usuario pode clicar **[RE02-F12]** para gerar laudo de recurso diretamente
13. Ou clicar **[RE02-F13]** para abrir chatbox e explorar desvios especificos
14. Opcionalmente clica **[RE02-F14]** para exportar analise em PDF

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-RE03] Chatbox de Analise

**RF relacionado:** RF-044-03
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Dados do edital, proposta vencedora e inconsistencias carregados no contexto da IA
3. Base de legislacao e jurisprudencias disponivel

### Pos-condicoes
1. Conversa registrada no historico do edital
2. Insights adicionais identificados pela IA
3. Trechos relevantes salvos como notas para uso em laudos (UC-RE04/RE05)

### Layout da Tela — RecursoPage > Aba "Analise" > Painel Chatbox

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Chatbox de Analise IA ──────────────────────────────────┐  │
│ │ Edital: PE 46/2026 — Fiocruz                                    │  │
│ │ Contexto: Proposta vencedora Empresa ABC + Edital + Legislacao  │  │
│ │                                                                  │  │
│ │ ┌─ Area de Conversa ─────────────────────────────────────────┐  │  │
│ │ │                                                             │  │  │
│ │ │ [Usuario] 10:30                                            │  │  │
│ │ │ "O registro ANVISA da empresa vencedora esta realmente     │  │  │
│ │ │  vencido? Tem como confirmar?"                             │  │  │
│ │ │                                                             │  │  │
│ │ │ [IA] 10:30                                                 │  │  │
│ │ │ "Sim. Conforme pagina 8 da proposta vencedora, o registro  │  │  │
│ │ │  ANVISA informado e 12345678, com validade ate 01/2026.    │  │  │
│ │ │  Considerando a data atual (03/2026), o registro esta      │  │  │
│ │ │  vencido ha 2 meses. Isso viola o Art. 67 §2o da Lei      │  │  │
│ │ │  14.133/2021 que exige habilitacao valida na data da       │  │  │
│ │ │  sessao."                                                  │  │  │
│ │ │  [Badge: 📎 Fonte: Proposta pag. 8 + Lei 14.133 Art. 67] │  │  │
│ │ │                                                             │  │  │
│ │ │ [Usuario] 10:32                                            │  │  │
│ │ │ "E sobre a capacidade do equipamento? O edital pede 120    │  │  │
│ │ │  amostras/hora e eles declararam 80."                      │  │  │
│ │ │                                                             │  │  │
│ │ │ [IA] 10:32                                                 │  │  │
│ │ │ "Correto. O item 4.2.1 do Termo de Referencia exige       │  │  │
│ │ │  capacidade minima de 120 amostras/hora. A proposta da     │  │  │
│ │ │  Empresa ABC declara na pagina 12 um equipamento com       │  │  │
│ │ │  capacidade de 80 amostras/hora. Isso configura            │  │  │
│ │ │  descumprimento do requisito tecnico obrigatorio (Art. 59  │  │  │
│ │ │  §1o Lei 14.133)."                                        │  │  │
│ │ │  [Badge: 📎 Fonte: TR item 4.2.1 + Proposta pag. 12]     │  │  │
│ │ │                                                             │  │  │
│ │ └─────────────────────────────────────────────────────────────┘  │  │
│ │                                                                  │  │
│ │ ── Sugestoes Rapidas ──                                         │  │
│ │ [Chip: Analisar preco inexequivel]                              │  │
│ │ [Chip: Verificar habilitacao tecnica]                           │  │
│ │ [Chip: Comparar com jurisprudencias]                            │  │
│ │ [Chip: Listar todos os desvios]                                 │  │
│ │                                                                  │  │
│ │ [TextInput: Digite sua pergunta...]                             │  │
│ │ [ActionButton: Enviar]  [ActionButton: Salvar como Nota]        │  │
│ └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE03-F01 | Edital | Display readonly | — | Edital em analise |
| RE03-F02 | Contexto | Display readonly | — | Documentos carregados no contexto da IA |
| RE03-F03 | Area Conversa | ChatDisplay | — | Historico de mensagens usuario-IA |
| RE03-F04 | Mensagem Usuario | ChatBubble | — | Pergunta do usuario com timestamp |
| RE03-F05 | Resposta IA | ChatBubble | — | Resposta da IA com timestamp e fontes |
| RE03-F06 | Badge Fonte | Badge info | — | Referencia a pagina/artigo citado |
| RE03-F07 | Chips Sugestao | ChipGroup | — | Sugestoes rapidas de perguntas frequentes |
| RE03-F08 | Input Pergunta | TextInput | Sim (para enviar) | Campo para digitar pergunta |
| RE03-F09 | Botao Enviar | ActionButton primary | — | Envia pergunta para a IA |
| RE03-F10 | Botao Salvar Nota | ActionButton | — | Salva trecho da conversa como nota para laudo |

### Sequencia de Eventos

1. Na aba "Analise", usuario clica **[RE02-F13] Abrir Chatbox** ou acessa diretamente
2. **[RE03-F01]** e **[RE03-F02]** exibem edital e contexto carregado
3. Sistema carrega no contexto da IA: edital completo, proposta vencedora, inconsistencias, legislacao
4. **[RE03-F07]** exibe sugestoes rapidas de perguntas
5. Usuario digita pergunta em **[RE03-F08]** ou clica em um chip sugestao
6. Clica **[RE03-F09] Enviar** — pergunta aparece em **[RE03-F04]**
7. IA analisa pergunta no contexto dos documentos e responde em **[RE03-F05]**
8. **[RE03-F06]** exibe referencias precisas (pagina do documento, artigo de lei)
9. Usuario pode continuar fazendo perguntas — conversa e cumulativa
10. A qualquer momento, usuario clica **[RE03-F10] Salvar como Nota** em uma resposta da IA
11. Nota e salva vinculada ao edital para uso posterior em laudos (UC-RE04/RE05)
12. Historico completo da conversa e registrado no banco

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-RE04] Gerar Laudo de Recurso

**RF relacionado:** RF-044-04
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Intencao de recurso manifestada dentro do prazo (UC-RE01)
3. Inconsistencias identificadas e classificadas
4. Base de legislacao e jurisprudencias disponivel
5. Template de laudo selecionado (padrao ou customizado)

### Pos-condicoes
1. Laudo de recurso gerado com secoes juridica e tecnica obrigatorias
2. Laudo em status "rascunho", 100% editavel
3. LOG de criacao e edicoes registrado
4. Documento pronto para exportacao e submissao

### Layout da Tela — RecursoPage > Aba "Laudos" > Geracao Recurso

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Aba: Monitoramento] [Aba: Analise] [Aba: Laudos ●]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ CARD: Geracao de Laudo de Recurso ─────────────────────────────┐│
│ │ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                ││
│ │ [SelectInput: Tipo ▼] Recurso | Contra-Razao                    ││
│ │ [SelectInput: Template ▼] Padrao | Customizado                  ││
│ │ [SelectInput: Empresa(s) alvo ▼]  "Empresa ABC Diagnosticos"   ││
│ │                                                                   ││
│ │ ── Dados do Recorrente ──                                        ││
│ │ [TextInput: Razao Social]  "Empresa Diagnostica LTDA"           ││
│ │ [TextInput: CNPJ]          "12.345.678/0001-90"                 ││
│ │ [TextInput: Representante]  "Joao da Silva"                     ││
│ │                                                                   ││
│ │ ── Inconsistencias a incluir ──                                  ││
│ │ [Checkbox: ☑ #1 Registro ANVISA vencido (ALTA)]                ││
│ │ [Checkbox: ☑ #3 Capacidade equipamento (ALTA)]                  ││
│ │ [Checkbox: ☐ #2 Prazo entrega (MEDIA)]                          ││
│ │ [Checkbox: ☐ #4 Certificacao ISO (MEDIA)]                       ││
│ │                                                                   ││
│ │ [ActionButton: Gerar Laudo com IA]                               ││
│ │                                                                   ││
│ │ ┌─ Editor Rico ─────────────────────────────────────────────────┐││
│ │ │ [Toolbar: B I H1 H2 Lista Tabela]                             │││
│ │ │                                                                │││
│ │ │ ILUSTRISSIMO SENHOR PREGOEIRO                                 │││
│ │ │ Pregao Eletronico No 46/2026 — Fiocruz                       │││
│ │ │                                                                │││
│ │ │ ## 1. QUALIFICACAO DO RECORRENTE                              │││
│ │ │ [dados da empresa gerados pela IA...]                         │││
│ │ │                                                                │││
│ │ │ ## SECAO JURIDICA                                             │││
│ │ │ ### 2.1. Dos Fatos                                            │││
│ │ │ [descricao factual das inconsistencias...]                    │││
│ │ │ ### 2.2. Do Direito                                           │││
│ │ │ [fundamentacao legal com artigos e incisos...]                │││
│ │ │ ### 2.3. Das Jurisprudencias                                  │││
│ │ │ [acordaos do TCU e tribunais relevantes...]                   │││
│ │ │                                                                │││
│ │ │ ## SECAO TECNICA                                              │││
│ │ │ ### 3.1. Analise Tecnica do Registro ANVISA                  │││
│ │ │ [comparativo tecnico registro x exigencia...]                 │││
│ │ │ ### 3.2. Analise Tecnica da Capacidade                       │││
│ │ │ [comparativo tecnico equipamento x TR...]                     │││
│ │ │                                                                │││
│ │ │ ## 4. DO PEDIDO                                               │││
│ │ │ [pedido formal de provimento do recurso...]                   │││
│ │ │                                                                │││
│ │ │ [Local], [Data]                                               │││
│ │ │ [Assinatura]                                                  │││
│ │ └───────────────────────────────────────────────────────────────┘││
│ │                                                                   ││
│ │ [ActionButton: Salvar Rascunho]  [ActionButton: Exportar PDF]   ││
│ │ [ActionButton: Exportar DOCX]   [ActionButton: Submeter (UC-RE06)]│
│ │ [Badge LOG: Criado por pasteurjr em 27/03/2026 10:00]           ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE04-F01 | Edital | SelectInput | Sim | Editais com recurso pendente |
| RE04-F02 | Tipo | SelectInput | Sim | "Recurso" ou "Contra-Razao" |
| RE04-F03 | Template | SelectInput | Sim | "Padrao" ou "Customizado" |
| RE04-F04 | Empresa Alvo | SelectInput | Sim | Empresa(s) cuja proposta sera contestada |
| RE04-F05 | Razao Social | TextInput | Sim | Razao social do recorrente |
| RE04-F06 | CNPJ | TextInput | Sim | CNPJ do recorrente |
| RE04-F07 | Representante | TextInput | Sim | Nome do representante legal |
| RE04-F08 | Checklist Inconsistencias | CheckboxGroup | Sim (min. 1) | Inconsistencias a incluir no laudo |
| RE04-F09 | Botao Gerar | ActionButton primary | — | Dispara geracao do laudo via IA |
| RE04-F10 | Editor Rico | Textarea/WYSIWYG | — | Laudo 100% editavel com toolbar |
| RE04-F11 | Toolbar | Barra de ferramentas | — | Negrito, Italico, Titulo H1/H2, Lista, Tabela |
| RE04-F12 | Secao Juridica | Secao do editor | Sim | Fatos + Direito + Jurisprudencias (obrigatoria) |
| RE04-F13 | Secao Tecnica | Secao do editor | Sim | Analise tecnica por inconsistencia (obrigatoria) |
| RE04-F14 | Botao Salvar | ActionButton | — | Salva rascunho do laudo |
| RE04-F15 | Botao Exportar PDF | ActionButton | — | Exporta laudo em formato PDF |
| RE04-F16 | Botao Exportar DOCX | ActionButton | — | Exporta laudo em formato Word |
| RE04-F17 | Botao Submeter | ActionButton | — | Envia para submissao automatica (UC-RE06) |
| RE04-F18 | Badge LOG | Badge info | — | LOG imutavel de criacao e edicoes |

### Sequencia de Eventos

1. Usuario acessa **RecursoPage**, aba **"Laudos"**
2. Seleciona edital em **[RE04-F01]**
3. Seleciona tipo **[RE04-F02]**: "Recurso"
4. Seleciona template em **[RE04-F03]**: "Padrao" ou "Customizado"
5. Seleciona empresa alvo em **[RE04-F04]** (empresa vencedora a contestar)
6. Preenche dados do recorrente: **[RE04-F05]** Razao Social, **[RE04-F06]** CNPJ, **[RE04-F07]** Representante
7. Em **[RE04-F08]**, marca inconsistencias a incluir no laudo (pre-selecionadas da analise UC-RE02)
8. Clica **[RE04-F09] Gerar Laudo com IA**
9. IA gera laudo completo com secoes obrigatorias: **[RE04-F12]** Juridica e **[RE04-F13]** Tecnica
10. **Validacao:** sistema verifica que ambas secoes (juridica + tecnica) foram geradas
11. Laudo aparece em **[RE04-F10] Editor Rico** — 100% editavel
12. Usuario revisa e edita usando **[RE04-F11] Toolbar**
13. Cada edicao gera LOG em **[RE04-F18]**
14. Usuario salva com **[RE04-F14]** ou exporta com **[RE04-F15/F16]**
15. Para submissao no portal, clica **[RE04-F17]** que navega para UC-RE06

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-RE05] Gerar Laudo de Contra-Razao

**RF relacionado:** RF-044-05
**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Recurso de outra empresa identificado contra a proposta do usuario
2. Documento de recurso disponivel (PDF/DOCX) ou informacoes sobre os fundamentos
3. Proposta do usuario e edital completo disponiveis
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Laudo de contra-razao gerado com secao de defesa e secao de ataque
2. Defesa: refuta os argumentos do recurso contra a proposta do usuario
3. Ataque: questiona a proposta da empresa recorrente
4. Documento em status "rascunho", 100% editavel
5. LOG de criacao e edicoes registrado

### Layout da Tela — RecursoPage > Aba "Laudos" > Geracao Contra-Razao

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Geracao de Laudo de Contra-Razao ────────────────────────┐│
│ │ [SelectInput: Edital ▼]  "PE 46/2026 — Fiocruz"                ││
│ │ [SelectInput: Tipo ▼] Contra-Razao ●                            ││
│ │ [SelectInput: Template ▼] Padrao | Customizado                  ││
│ │                                                                   ││
│ │ ── Empresa Recorrente (quem fez o recurso) ──                    ││
│ │ [TextInput: Empresa Recorrente]  "Empresa XYZ Ltda"             ││
│ │ [FileInput: Documento do Recurso] (.pdf, .docx)                 ││
│ │ [Badge: Recurso carregado ✅ — 12 paginas]                     ││
│ │                                                                   ││
│ │ ── Dados do Contra-Razoante (sua empresa) ──                     ││
│ │ [TextInput: Razao Social]  "Empresa Diagnostica LTDA"           ││
│ │ [TextInput: CNPJ]          "12.345.678/0001-90"                 ││
│ │ [TextInput: Representante]  "Joao da Silva"                     ││
│ │                                                                   ││
│ │ [ActionButton: Gerar Contra-Razao com IA]                       ││
│ │                                                                   ││
│ │ ┌─ Editor Rico ─────────────────────────────────────────────────┐││
│ │ │ [Toolbar: B I H1 H2 Lista Tabela]                             │││
│ │ │                                                                │││
│ │ │ ILUSTRISSIMO SENHOR PREGOEIRO                                 │││
│ │ │ Pregao Eletronico No 46/2026 — Fiocruz                       │││
│ │ │                                                                │││
│ │ │ ## 1. QUALIFICACAO DO CONTRA-RAZOANTE                         │││
│ │ │ [dados da empresa...]                                         │││
│ │ │                                                                │││
│ │ │ ## SECAO DE DEFESA                                            │││
│ │ │ ### 2.1. Da Improcedencia dos Argumentos                     │││
│ │ │ [refutacao ponto-a-ponto dos fundamentos do recurso...]       │││
│ │ │ ### 2.2. Da Conformidade da Proposta                         │││
│ │ │ [demonstracao de que a proposta do usuario atende ao edital...││
│ │ │ ### 2.3. Da Base Legal de Defesa                              │││
│ │ │ [artigos e jurisprudencias que fundamentam a defesa...]       │││
│ │ │                                                                │││
│ │ │ ## SECAO DE ATAQUE                                            │││
│ │ │ ### 3.1. Das Irregularidades na Proposta do Recorrente       │││
│ │ │ [inconsistencias identificadas na proposta da empresa que     │││
│ │ │  interpos o recurso...]                                       │││
│ │ │ ### 3.2. Da Fundamentacao Legal                               │││
│ │ │ [artigos que demonstram falhas do recorrente...]              │││
│ │ │                                                                │││
│ │ │ ## 4. DO PEDIDO                                               │││
│ │ │ [pedido de improvimento do recurso + manutencao do resultado] │││
│ │ │                                                                │││
│ │ │ [Local], [Data]                                               │││
│ │ │ [Assinatura]                                                  │││
│ │ └───────────────────────────────────────────────────────────────┘││
│ │                                                                   ││
│ │ [ActionButton: Salvar Rascunho]  [ActionButton: Exportar PDF]   ││
│ │ [ActionButton: Exportar DOCX]   [ActionButton: Submeter (UC-RE06)]│
│ │ [Badge LOG: Criado por pasteurjr em 27/03/2026 11:30]           ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE05-F01 | Edital | SelectInput | Sim | Editais com contra-razao pendente |
| RE05-F02 | Tipo | SelectInput | Sim | Fixo em "Contra-Razao" |
| RE05-F03 | Template | SelectInput | Sim | "Padrao" ou "Customizado" |
| RE05-F04 | Empresa Recorrente | TextInput | Sim | Empresa que interpos o recurso |
| RE05-F05 | Documento Recurso | FileInput | Sim | PDF/DOCX do recurso recebido |
| RE05-F06 | Badge Recurso | Badge | — | Status do documento do recurso carregado |
| RE05-F07 | Razao Social | TextInput | Sim | Razao social da empresa que responde |
| RE05-F08 | CNPJ | TextInput | Sim | CNPJ da empresa que responde |
| RE05-F09 | Representante | TextInput | Sim | Nome do representante legal |
| RE05-F10 | Botao Gerar | ActionButton primary | — | Dispara geracao da contra-razao via IA |
| RE05-F11 | Editor Rico | Textarea/WYSIWYG | — | Contra-razao 100% editavel com toolbar |
| RE05-F12 | Toolbar | Barra de ferramentas | — | Negrito, Italico, Titulo H1/H2, Lista, Tabela |
| RE05-F13 | Secao Defesa | Secao do editor | Sim | Refutacao + Conformidade + Base legal (obrigatoria) |
| RE05-F14 | Secao Ataque | Secao do editor | Sim | Irregularidades do recorrente + fundamentacao (obrigatoria) |
| RE05-F15 | Botao Salvar | ActionButton | — | Salva rascunho |
| RE05-F16 | Botao Exportar PDF | ActionButton | — | Exporta em formato PDF |
| RE05-F17 | Botao Exportar DOCX | ActionButton | — | Exporta em formato Word |
| RE05-F18 | Botao Submeter | ActionButton | — | Envia para submissao automatica (UC-RE06) |
| RE05-F19 | Badge LOG | Badge info | — | LOG imutavel de criacao e edicoes |

### Sequencia de Eventos

1. Usuario acessa **RecursoPage**, aba **"Laudos"**
2. Seleciona edital em **[RE05-F01]**
3. Seleciona tipo **[RE05-F02]**: "Contra-Razao"
4. Seleciona template em **[RE05-F03]**
5. Preenche dados da empresa recorrente: **[RE05-F04]** nome
6. Faz upload do recurso recebido em **[RE05-F05]** — **[RE05-F06]** confirma carregamento
7. Preenche dados do contra-razoante: **[RE05-F07]** Razao Social, **[RE05-F08]** CNPJ, **[RE05-F09]** Representante
8. Clica **[RE05-F10] Gerar Contra-Razao com IA**
9. IA analisa o recurso recebido, a proposta do usuario e o edital
10. IA gera laudo com 2 secoes obrigatorias: **[RE05-F13]** Defesa e **[RE05-F14]** Ataque
11. **Secao Defesa:** refuta ponto-a-ponto os argumentos do recurso, demonstra conformidade da proposta do usuario
12. **Secao Ataque:** identifica e expoe irregularidades na proposta da empresa recorrente
13. **Validacao:** sistema verifica que ambas secoes foram geradas
14. Laudo aparece em **[RE05-F11] Editor Rico** — 100% editavel
15. Usuario revisa e edita usando **[RE05-F12] Toolbar**
16. Cada edicao gera LOG em **[RE05-F19]**
17. Usuario salva com **[RE05-F15]** ou exporta com **[RE05-F16/F17]**
18. Para submissao no portal, clica **[RE05-F18]** que navega para UC-RE06

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

## [UC-RE06] Submissao Automatica no Portal

**RF relacionado:** RF-044-06
**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Peticao (impugnacao, recurso ou contra-razao) gerada e aprovada
2. Documento dentro dos limites de tamanho do portal
3. Credenciais de acesso ao portal configuradas
4. Prazo de submissao nao expirado

### Pos-condicoes
1. Peticao submetida no portal gov.br
2. Protocolo de envio registrado
3. Comprovante de submissao salvo
4. LOG de submissao imutavel registrado

### Layout da Tela — RecursoPage ou ImpugnacaoPage > Card Submissao

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ CARD: Submissao Automatica no Portal ──────────────────────────┐│
│ │                                                                   ││
│ │ ┌─ Peticao a Submeter ─────────────────────────────────────────┐ ││
│ │ │ Tipo: [Badge: RECURSO]                                       │ ││
│ │ │ Edital: PE 46/2026 — Fiocruz                                │ ││
│ │ │ Documento: Laudo_Recurso_PE46_2026.pdf                       │ ││
│ │ │ Tamanho: 2,3 MB                                              │ ││
│ │ │ Prazo: 30/03/2026 (3 dias uteis restantes)                   │ ││
│ │ └──────────────────────────────────────────────────────────────┘ ││
│ │                                                                   ││
│ │ ── Validacao Pre-Envio ──                                        ││
│ │ ┌────────────────────────────────────────────────────────────┐   ││
│ │ │ ☑ Tamanho do arquivo dentro do limite     [✅ 2,3/25 MB]  │   ││
│ │ │ ☑ Formato aceito pelo portal              [✅ PDF]         │   ││
│ │ │ ☑ Prazo de submissao valido               [✅ 3 dias]      │   ││
│ │ │ ☑ Secao juridica presente                 [✅]             │   ││
│ │ │ ☑ Secao tecnica presente                  [✅]             │   ││
│ │ │ ☑ Assinatura/identificacao presente       [✅]             │   ││
│ │ └────────────────────────────────────────────────────────────┘   ││
│ │ [Badge: ✅ Todas as validacoes passaram]                        ││
│ │                                                                   ││
│ │ ── Limite de Tamanho do Portal ──                                ││
│ │ [Badge: Portal aceita ate 25 MB por arquivo]                     ││
│ │                                                                   ││
│ │ ┌────────────────────────────────────────────────────────────┐   ││
│ │ │ Arquivo                      │ Tamanho │ Status           │   ││
│ │ ├────────────────────────────────────────────────────────────┤   ││
│ │ │ Laudo_Recurso.pdf            │ 2,3 MB  │ ✅ OK           │   ││
│ │ │ Anexo_ANVISA.pdf             │ 1,2 MB  │ ✅ OK           │   ││
│ │ │ Anexo_Catalogo.pdf           │ 32 MB   │ ⚠ Excede!      │   ││
│ │ │                              │         │ [Smart Split]   │   ││
│ │ └────────────────────────────────────────────────────────────┘   ││
│ │                                                                   ││
│ │ [ActionButton: Fracionar Arquivo Grande (Smart Split)]           ││
│ │ Resultado: Catalogo_parte1.pdf (24MB) + Catalogo_parte2.pdf (8MB)││
│ │                                                                   ││
│ │ ── Credenciais do Portal ──                                      ││
│ │ [TextInput: Login]      [***]                                    ││
│ │ [PasswordInput: Senha]  [***]                                    ││
│ │ [Badge: Credenciais salvas ✅]                                  ││
│ │                                                                   ││
│ │ [ActionButton: Submeter no Portal]                               ││
│ │                                                                   ││
│ │ ── Resultado da Submissao ──                                     ││
│ │ [Badge: ✅ SUBMETIDO COM SUCESSO]                               ││
│ │ Protocolo: PNCP-2026-0046-REC-001                               ││
│ │ Data/Hora: 27/03/2026 14:30:15                                  ││
│ │ [ActionButton: Baixar Comprovante]                               ││
│ │                                                                   ││
│ │ [Badge LOG: Submetido por pasteurjr em 27/03/2026 14:30]        ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Campos e Objetos

| ID | Elemento | Tipo | Obrigatorio | Descricao |
|----|----------|------|-------------|-----------|
| RE06-F01 | Badge Tipo Peticao | Badge | — | Tipo: Impugnacao, Recurso ou Contra-Razao |
| RE06-F02 | Edital | Display readonly | — | Edital vinculado a peticao |
| RE06-F03 | Documento | Display readonly | — | Nome do arquivo da peticao |
| RE06-F04 | Tamanho | Display | — | Tamanho do arquivo em MB |
| RE06-F05 | Prazo | Display + Badge | — | Prazo de submissao com dias restantes |
| RE06-F06 | Checklist Validacao | ChecklistDisplay | — | 6 validacoes pre-envio com status |
| RE06-F07 | Badge Validacao | Badge | — | Verde se todas passaram, vermelho se alguma falhou |
| RE06-F08 | Badge Limite Portal | Badge info | — | Limite de tamanho aceito pelo portal |
| RE06-F09 | Tabela Arquivos | DataTable | — | Colunas: Arquivo, Tamanho, Status |
| RE06-F10 | Botao Smart Split | ActionButton | — | Fraciona arquivo que excede limite |
| RE06-F11 | Login Portal | TextInput | Sim | Login de acesso ao portal gov.br |
| RE06-F12 | Senha Portal | PasswordInput | Sim | Senha de acesso ao portal |
| RE06-F13 | Badge Credenciais | Badge | — | Status das credenciais salvas |
| RE06-F14 | Botao Submeter | ActionButton primary | — | Envia peticao ao portal automaticamente |
| RE06-F15 | Badge Resultado | Badge destaque | — | Sucesso ou falha na submissao |
| RE06-F16 | Protocolo | Display | — | Numero de protocolo retornado pelo portal |
| RE06-F17 | Data/Hora Submissao | Display | — | Timestamp da submissao |
| RE06-F18 | Botao Comprovante | ActionButton | — | Baixa comprovante de submissao |
| RE06-F19 | Badge LOG | Badge info | — | LOG imutavel de submissao |

### Sequencia de Eventos

1. Apos gerar laudo (UC-RE04 ou UC-RE05), usuario clica **"Submeter"**
2. Sistema exibe card de submissao com dados da peticao
3. **[RE06-F06]** executa checklist de validacoes pre-envio automaticamente
4. **Validacao tamanho:** se arquivo excede 25 MB, **[RE06-F09]** indica e oferece **[RE06-F10] Smart Split**
5. Se necessario, usuario clica **[RE06-F10]** — sistema fraciona arquivo em partes dentro do limite
6. **[RE06-F07]** exibe status geral das validacoes
7. Se todas passaram, usuario preenche credenciais: **[RE06-F11]** login, **[RE06-F12]** senha
8. (Credenciais podem estar salvas — **[RE06-F13]** indica status)
9. Usuario clica **[RE06-F14] Submeter no Portal**
10. Sistema autentica no portal gov.br e envia peticao com anexos
11. Se submissao com sucesso: **[RE06-F15]** exibe badge verde, **[RE06-F16]** mostra protocolo
12. **[RE06-F17]** registra data/hora exata da submissao
13. **[RE06-F18]** permite baixar comprovante de envio
14. **[RE06-F19]** registra LOG imutavel com todos os detalhes
15. Se submissao falha: sistema exibe erro e sugere acoes corretivas

### Implementacao Atual
**❌ NAO IMPLEMENTADO**

---

---

# RESUMO DE IMPLEMENTACAO

| Caso de Uso | Fase | Status | Detalhe |
|-------------|------|--------|---------|
| UC-D01 | DISPUTAS | ❌ NAO IMPLEMENTADO | Sala de lances (aberto) com timer 2 min e bloqueio de piso |
| UC-D02 | DISPUTAS | ❌ NAO IMPLEMENTADO | Sala de lances (aberto + fechado) com fase cega de 5 min |
| UC-I01 | IMPUGNACAO | ❌ NAO IMPLEMENTADO | Validacao legal do edital com IA, classificacao de gravidade |
| UC-I02 | IMPUGNACAO | ❌ NAO IMPLEMENTADO | Sugestao de tipo de peticao (impugnacao vs esclarecimento) |
| UC-I03 | IMPUGNACAO | ❌ NAO IMPLEMENTADO | Geracao de peticao de impugnacao com IA, templates, editor rico |
| UC-I04 | IMPUGNACAO | ❌ NAO IMPLEMENTADO | Upload de peticao externa (DOCX/PDF) |
| UC-I05 | IMPUGNACAO | ❌ NAO IMPLEMENTADO | Controle de prazo com alertas WhatsApp/email/sistema |
| UC-RE01 | RECURSOS | ❌ NAO IMPLEMENTADO | Monitoramento de janela de recurso no portal gov.br |
| UC-RE02 | RECURSOS | ❌ NAO IMPLEMENTADO | Analise IA da proposta vencedora vs edital vs legislacao |
| UC-RE03 | RECURSOS | ❌ NAO IMPLEMENTADO | Chatbox de analise com IA contextual sobre desvios |
| UC-RE04 | RECURSOS | ❌ NAO IMPLEMENTADO | Geracao de laudo de recurso com secoes juridica + tecnica |
| UC-RE05 | RECURSOS | ❌ NAO IMPLEMENTADO | Geracao de laudo de contra-razao com secoes defesa + ataque |
| UC-RE06 | RECURSOS | ❌ NAO IMPLEMENTADO | Submissao automatica no portal com Smart Split |

**Totais:** 0 implementados + 0 parciais + 13 nao implementados = **13 casos de uso**

---

*Documento gerado em 27/03/2026. Todos os casos de uso sao novas funcionalidades a implementar no Sprint Recursos e Impugnacoes.*
