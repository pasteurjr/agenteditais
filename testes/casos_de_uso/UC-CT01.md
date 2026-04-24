---
uc_id: UC-CT01
nome: "Cadastrar Contrato"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 778
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT01 — Cadastrar Contrato

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 778).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-203, RN-216 [FALTANTE->V4]

**RF relacionado:** RF-046-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Modelo `Contrato` existe no banco
3. Resultado de vitoria registrado em UC-FU01 (desejavel)

### Pos-condicoes
1. Contrato cadastrado com todos os campos obrigatorios
2. Status inicial "vigente"
3. Entregas e aditivos podem ser cadastrados

### Sequencia de Eventos

1. Usuario acessa ProducaoPage (`/app/producao`) via menu lateral "Execucao"
2. [Titulo: "Execucao de Contratos"] exibe a pagina com 5 abas
3. [Secao: Stat Cards — grid 4] exibe: Total (azul), Vigentes (verde), A Vencer 30d (amarelo), Valor Total (roxo)
4. [Aba: "Contratos"] esta ativa por padrao — [Card com Tabela: "Contratos"] exibe lista
5. [Tabela: Contratos] exibe: Numero, Orgao, Objeto (truncado 50 chars), Valor, Termino, Status, Acao
6. [Coluna: "Status"] exibe badge colorido: vigente (verde), encerrado (neutro), rescindido (vermelho), suspenso (amarelo)
7. [Coluna: "Acao"] exibe [Botao: "Selecionar"] — primary se ja selecionado, secondary caso contrario
8. Usuario clica [Botao: "+ Novo Contrato"] — [Modal: "Novo Contrato"] abre
9. Preenche: [TextInput: "Numero do Contrato"], [TextInput: "Orgao"], [TextArea: "Objeto"], [TextInput: "Valor Total"]
10. Preenche datas: [TextInput: "Inicio"] e [TextInput: "Termino"] (formato "2026-01-01")
11. Clica [Botao: "Criar"] — contrato criado e aparece na tabela
12. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Contrato sem aditivo previsto:** Contrato e criado apenas com campos obrigatorios. Aba "Aditivos" permanece vazia. Nenhuma restricao para criar contrato sem aditivos.
- **FA-02 — Contrato com data de inicio retroativa:** Usuario informa data de inicio anterior a data atual (ex: contrato que ja estava em vigor). Sistema aceita normalmente pois contratos podem ser cadastrados retrospectivamente.
- **FA-03 — Contrato com valor zero (comodato):** Contratos de comodato podem ter valor total R$ 0,00. Sistema aceita e Stat Card "Valor Total" nao e afetado.

### Fluxos de Excecao (V5)

- **FE-01 — Numero de contrato duplicado:** No passo 11, backend detecta que numero de contrato ja existe. Retorna erro 409. Sistema exibe alerta "Numero de contrato ja cadastrado. Use um numero diferente." Modal permanece aberto.
- **FE-02 — Campos obrigatorios vazios:** Usuario clica "Criar" sem preencher numero, orgao ou datas. Sistema exibe validacao inline nos campos faltantes. Modal nao fecha.
- **FE-03 — Data de termino anterior a data de inicio:** Sistema valida e exibe erro "Data de termino deve ser posterior a data de inicio."
- **FE-04 — Valor total negativo:** Sistema rejeita e exibe erro "Valor total deve ser maior ou igual a zero."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Contratos" (1a aba)

#### Layout da Tela

```
[Titulo: "Execucao de Contratos"] (h2, fontSize: 22, fontWeight: 700)

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
  [Card: "Total"] (icone Package, cor: #3b82f6)
  [Card: "Vigentes"] (icone CheckCircle, cor: #16a34a)
  [Card: "A Vencer (30d)"] (icone Clock, cor: #eab308)
  [Card: "Valor Total"] (icone BarChart2, cor: #8b5cf6)

[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Banner: "Contrato selecionado: {numero} — {orgao}"] — condicional, background: #eff6ff [ref: Passo 7]

[Card: "Contratos"] [ref: Passos 4, 5]
  [Botao: "+ Novo Contrato"] (icone Plus) [ref: Passo 8]

  [Tabela: Contratos] (DataTable) [ref: Passos 5, 6]
    [Coluna: "Numero"] (key: numero_contrato, sortable)
    [Coluna: "Orgao"] (key: orgao, sortable)
    [Coluna: "Objeto"] (key: objeto) — truncado em 50 chars
    [Coluna: "Valor"] (key: valor_total, render: formatCurrency)
    [Coluna: "Termino"] (key: data_fim, render: formatDate)
    [Coluna: "Status"] (key: status) — badge colorido [ref: Passo 6]
      [Badge: "vigente"] (bg: #dcfce7, fg: #166534)
      [Badge: "encerrado"] (bg: #f3f4f6, fg: #374151)
      [Badge: "rescindido"] (bg: #fee2e2, fg: #991b1b)
      [Badge: "suspenso"] (bg: #fef3c7, fg: #92400e)
    [Coluna: "Acao"]
      [Botao: "Selecionar"] (size: sm) [ref: Passo 7]

[Modal: "Novo Contrato"] [ref: Passos 9-12]
  [TextInput: "Numero do Contrato"] — placeholder "CT-2026/001" [ref: Passo 9]
  [TextInput: "Orgao"] [ref: Passo 9]
  [TextArea: "Objeto"] [ref: Passo 9]
  [TextInput: "Valor Total"] — placeholder "0.00" [ref: Passo 9]
  [TextInput: "Inicio"] — placeholder "2026-01-01" [ref: Passo 10]
  [TextInput: "Termino"] — placeholder "2026-12-31" [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Total/Vigentes/A Vencer/Valor Total] | 3 |
| [Aba: "Contratos"] | 4 |
| [Tabela: Contratos] | 5 |
| [Coluna: "Status"] / badges | 6 |
| [Botao: "Selecionar"] | 7 |
| [Botao: "+ Novo Contrato"] | 8 |
| [Modal: "Novo Contrato"] | 9, 10, 11, 12 |
| campos do modal | 9, 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**Implementado**

---
