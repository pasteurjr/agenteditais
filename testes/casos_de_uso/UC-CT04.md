---
uc_id: UC-CT04
nome: "Gestao de Aditivos"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1076
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT04 — Gestao de Aditivos

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1076).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-178, RN-179, RN-203, RN-207 [FALTANTE->V4]

**RF relacionado:** NOVO (Art. 124-126, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Valor original do contrato registrado

### Pos-condicoes
1. Aditivo registrado na tabela `contrato_aditivos`
2. Valor acumulado calculado e validado contra limites legais (25%)
3. Barra de progresso visual atualizada

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Aditivos"] (4a aba)
2. Se nenhum contrato selecionado: mensagem de selecao exibida
3. [Card: "Resumo de Aditivos"] (condicional) exibe: Valor Original, Limite 25%, Acrescimos, % Consumido
4. [Progresso: ProgressBar] (width: 100%, height: 12px) mostra percentual consumido do limite com cor dinamica:
   - Verde (#16a34a): pct < 50%
   - Amarelo (#eab308): 50% <= pct < 80%
   - Vermelho (#dc2626): pct >= 80%
5. [Card: "Aditivos"] lista aditivos existentes em tabela HTML customizada: Tipo, Data, Valor, Fundamentacao, Status
6. Usuario clica [Botao: "+ Novo Aditivo"] — [Modal: "Novo Aditivo"] abre
7. Seleciona [Select: "Tipo"] — opcoes: acrescimo, supressao, prazo, escopo
8. Preenche [TextInput: "Valor do Aditivo"] (placeholder "0.00")
9. Preenche [TextArea: "Justificativa"]
10. Seleciona [Select: "Fundamentacao Legal"] — opcoes: Art. 124-I, Art. 124-II, Art. 125, Art. 126
11. Clica [Botao: "Criar"] — aditivo registrado e barra de progresso atualizada
12. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Aditivo de prazo (sem valor financeiro):** No passo 7, usuario seleciona tipo "prazo". Campo "Valor do Aditivo" pode ser R$ 0,00. Aditivo registra apenas extensao temporal. ProgressBar de limite 25% nao e afetada.
- **FA-02 — Aditivo de supressao:** No passo 7, usuario seleciona tipo "supressao". Valor e registrado como negativo (reducao do contrato). ProgressBar recalcula considerando supressoes.
- **FA-03 — Contrato sem aditivos anteriores:** No passo 5, tabela "Aditivos" esta vazia. Card "Resumo" exibe Acrescimos=R$ 0,00 e %Consumido=0%. ProgressBar verde.

### Fluxos de Excecao (V5)

- **FE-01 — Valor do aditivo cumulativo excede 25% do valor original (RN-207):** No passo 11, backend calcula que soma dos aditivos + novo aditivo > 25% do valor original. Retorna warning RN-207 (Art. 124-126). Em modo warn-only, aditivo e criado com alerta "Limite de 25% excedido. Valor cumulativo: {pct}%."
- **FE-02 — Nenhum contrato selecionado:** Mensagem de selecao exibida. Nenhum card ou formulario visivel.
- **FE-03 — Justificativa vazia:** Sistema exibe validacao "Justificativa e obrigatoria para registro de aditivo." Modal nao fecha.
- **FE-04 — Fundamentacao legal nao selecionada:** Sistema exibe validacao "Selecione a fundamentacao legal do aditivo."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Aditivos" (4a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Card: "Resumo de Aditivos"] — condicional [ref: Passos 3, 4]
  [Secao: Grid 4 colunas]
    [Campo: "Valor Original"] — formatCurrency
    [Campo: "Limite 25%"] — formatCurrency
    [Campo: "Acrescimos"] — formatCurrency
    [Campo: "% Consumido"] — "{pct}%"
  [Progresso: ProgressBar] (width: 100%, height: 12px) [ref: Passo 4]
    [Indicador: verde] — pct < 50
    [Indicador: amarelo] — 50 <= pct < 80
    [Indicador: vermelho] — pct >= 80

[Card: "Aditivos"] [ref: Passo 5]
  [Botao: "+ Novo Aditivo"] (icone Plus) [ref: Passo 6]
  [Tabela: aditivos] — HTML customizada
    [Coluna: "Tipo"]
    [Coluna: "Data"] — formatDate
    [Coluna: "Valor"] — alinhado a direita, formatCurrency
    [Coluna: "Fundamentacao"]
    [Coluna: "Status"] — statusBadge

[Modal: "Novo Aditivo"] [ref: Passos 7-12]
  [Select: "Tipo"] [ref: Passo 7]
    opcoes: "acrescimo" (Acrescimo), "supressao" (Supressao), "prazo" (Prazo), "escopo" (Escopo)
  [TextInput: "Valor do Aditivo"] — placeholder "0.00" [ref: Passo 8]
  [TextArea: "Justificativa"] [ref: Passo 9]
  [Select: "Fundamentacao Legal"] [ref: Passo 10]
    opcoes: "" (Selecione...), "Art. 124-I", "Art. 124-II", "Art. 125", "Art. 126"
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Aditivos"] | 1 |
| [Card: "Resumo de Aditivos"] | 3 |
| [Progresso: ProgressBar] | 4 |
| [Card: "Aditivos"] / [Tabela: aditivos] | 5 |
| [Botao: "+ Novo Aditivo"] | 6 |
| [Modal: "Novo Aditivo"] | 7, 8, 9, 10, 11, 12 |
| [Select: "Tipo"] | 7 |
| [TextInput: "Valor do Aditivo"] | 8 |
| [TextArea: "Justificativa"] | 9 |
| [Select: "Fundamentacao Legal"] | 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**Implementado**

---
