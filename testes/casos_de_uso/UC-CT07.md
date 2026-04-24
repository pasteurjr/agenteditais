---
uc_id: UC-CT07
nome: "Gestao de Empenhos *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1292
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT07 — Gestao de Empenhos *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1292).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-167, RN-169, RN-170, RN-171, RN-203, RN-209 [FALTANTE->V4], RN-210 [FALTANTE->V4]

**RF relacionado:** RF-046-01
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato cadastrado e selecionado (UC-CT01) com status "vigente"
3. Contrato classificado como venda recorrente (consumiveis ao longo do fluxo de execucao)
4. Itens do contrato cadastrados com valores unitarios

### Pos-condicoes
1. Empenho registrado com numero, valor e data
2. Entregas vinculadas ao empenho com notas de entrega
3. Saldo do empenho calculado automaticamente (valor empenhado - somatorio entregas)
4. Alerta gerado para itens sem valor no contrato que consomem alem do previsto (potencial prejuizo)
5. Historico de empenhos disponivel para auditoria

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Empenhos"] (nova aba, 6a posicao)
2. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"] exibido
3. [Card: "Itens do Contrato"] exibe [Tabela: itens] com: Item, Descricao, Qtd Contratada, Valor Unit., Valor Total, Tipo (consumivel/equipamento)
4. [Card: "Empenhos — {numero_contrato}"] exibe lista de empenhos do contrato
5. [Tabela: Empenhos] exibe: Numero Empenho, Data, Valor Empenhado, Valor Entregue, Saldo, Status
6. [Coluna: "Saldo"] exibe valor calculado automaticamente (empenhado - entregue) com cor dinamica:
   - Verde (#16a34a): saldo > 30% do empenhado
   - Amarelo (#eab308): saldo entre 10% e 30%
   - Vermelho (#dc2626): saldo < 10% (necessidade de novo empenho)
7. [Coluna: "Status"] exibe badge: Aberto (azul), Parcial (amarelo), Consumido (verde), Excedido (vermelho)
8. Usuario clica [Botao: "+ Novo Empenho"] — [Modal: "Novo Empenho"] abre
9. Preenche: [TextInput: "Numero do Empenho"], [TextInput: "Valor (R$)"], [TextInput: "Data do Empenho"]
10. Opcionalmente preenche [TextArea: "Observacoes"]
11. Clica [Botao: "Criar"] — empenho registrado e aparece na tabela
12. Usuario clica [Botao: "Detalhes"] em um empenho — [Card Expandido: "Entregas do Empenho {numero}"] abre abaixo
13. [Tabela: Entregas do Empenho] exibe: Data Entrega, Nota de Entrega, Itens, Qtd, Valor, Fatura Vinculada
14. Usuario clica [Botao: "+ Registrar Entrega"] — [Modal: "Nova Entrega contra Empenho"] abre
15. Preenche: [TextInput: "Nota de Entrega"], [TextInput: "Data"], [Select: "Item"], [TextInput: "Quantidade"], [TextInput: "Valor"]
16. Clica [Botao: "Registrar"] — entrega vinculada ao empenho, saldo recalculado
17. [Alerta: "Item sem valor contratual"] (icone AlertTriangle, cor vermelho) exibido condicionalmente ao lado de itens como Calibradores, Controles que geram consumo sem receita — indicando potencial prejuizo ao gestor
18. [Botao: "Cancelar"] fecha qualquer modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Empenho parcial (valor menor que o total do contrato):** Usuario cria empenho com valor inferior ao contrato. Sistema aceita normalmente. Saldo do contrato indica necessidade de empenhos futuros.
- **FA-02 — Contrato sem itens cadastrados:** No passo 3, Card "Itens do Contrato" exibe tabela vazia. Usuario pode criar empenho mesmo sem itens detalhados.
- **FA-03 — Empenho sem entregas vinculadas:** Empenho e criado mas nenhuma entrega e registrada contra ele. Status permanece "Aberto" e saldo e 100% do valor empenhado.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum contrato selecionado:** Mensagem "Selecione um contrato na aba 'Contratos'" exibida. Nenhum card ou tabela renderizada.
- **FE-02 — Numero de empenho duplicado:** Backend detecta duplicidade. Retorna erro. Sistema exibe alerta "Numero de empenho ja cadastrado."
- **FE-03 — Valor de entrega excede saldo do empenho (RN-209):** Ao registrar entrega (passo 16), somatorio de entregas + nova > valor empenhado. Backend retorna warning RN-209. Em modo warn-only, entrega e criada com alerta "Entrega excede saldo do empenho."
- **FE-04 — Item sem valor contratual gerando consumo (RN-210):** Itens como Calibradores/Controles nao possuem valor no contrato mas geram consumo fisico. Alerta visual (passo 17) sinaliza potencial prejuizo.

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Empenhos" (6a aba — nova)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"]

[Texto: "Selecione um contrato na aba 'Contratos'"] — condicional [ref: Passo 2]

[Card: "Itens do Contrato"] [ref: Passo 3]
  [Tabela: itens] (DataTable)
    [Coluna: "Item"] (key: codigo_item)
    [Coluna: "Descricao"] (key: descricao)
    [Coluna: "Qtd Contratada"] (key: quantidade_contratada)
    [Coluna: "Valor Unit."] (key: valor_unitario, render: formatCurrency)
    [Coluna: "Valor Total"] (key: valor_total, render: formatCurrency)
    [Coluna: "Tipo"] (key: tipo) — badge
      [Badge: "consumivel"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "equipamento"] (bg: #f3e8ff, fg: #7c3aed)
    [Alerta: "Sem valor contratual"] — condicional, icone AlertTriangle [ref: Passo 17]

[Card: "Empenhos — {numero_contrato}"] [ref: Passos 4, 5]
  [Botao: "+ Novo Empenho"] (icone Plus) [ref: Passo 8]
  [Tabela: Empenhos] (DataTable) [ref: Passos 5, 6, 7]
    [Coluna: "Numero Empenho"] (key: numero_empenho, sortable)
    [Coluna: "Data"] (key: data_empenho, render: formatDate)
    [Coluna: "Valor Empenhado"] (key: valor_empenhado, render: formatCurrency)
    [Coluna: "Valor Entregue"] (key: valor_entregue, render: formatCurrency)
    [Coluna: "Saldo"] (key: saldo) — cor dinamica [ref: Passo 6]
      [Texto: verde] — saldo > 30%
      [Texto: amarelo] — 10% <= saldo <= 30%
      [Texto: vermelho] — saldo < 10%
    [Coluna: "Status"] (key: status) — badge [ref: Passo 7]
      [Badge: "Aberto"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "Parcial"] (bg: #fef3c7, fg: #92400e)
      [Badge: "Consumido"] (bg: #dcfce7, fg: #166534)
      [Badge: "Excedido"] (bg: #fee2e2, fg: #991b1b)
    [Coluna: "Acao"]
      [Botao: "Detalhes"] (size: sm) [ref: Passo 12]

[Card Expandido: "Entregas do Empenho {numero}"] — condicional [ref: Passos 12, 13]
  [Botao: "+ Registrar Entrega"] (icone Plus) [ref: Passo 14]
  [Tabela: Entregas do Empenho] [ref: Passo 13]
    [Coluna: "Data Entrega"] (render: formatDate)
    [Coluna: "Nota de Entrega"]
    [Coluna: "Itens"]
    [Coluna: "Qtd"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Fatura Vinculada"]

[Modal: "Novo Empenho"] [ref: Passos 8-11]
  [TextInput: "Numero do Empenho"] — placeholder "2026NE000123" [ref: Passo 9]
  [TextInput: "Valor (R$)"] — placeholder "0.00" [ref: Passo 9]
  [TextInput: "Data do Empenho"] — placeholder "2026-04-01" [ref: Passo 9]
  [TextArea: "Observacoes"] — opcional [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Criar"] [ref: Passo 11]

[Modal: "Nova Entrega contra Empenho"] [ref: Passos 14-16]
  [TextInput: "Nota de Entrega"] [ref: Passo 15]
  [TextInput: "Data"] — placeholder "2026-04-15" [ref: Passo 15]
  [Select: "Item"] — opcoes dinamicas: itens do contrato [ref: Passo 15]
  [TextInput: "Quantidade"] [ref: Passo 15]
  [TextInput: "Valor (R$)"] [ref: Passo 15]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Registrar"] [ref: Passo 16]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Empenhos"] | 1 |
| [Texto: "Selecione um contrato..."] | 2 |
| [Card: "Itens do Contrato"] / [Tabela: itens] | 3 |
| [Card: "Empenhos — {numero}"] | 4 |
| [Tabela: Empenhos] | 5 |
| [Coluna: "Saldo"] / cor dinamica | 6 |
| [Coluna: "Status"] / badges | 7 |
| [Botao: "+ Novo Empenho"] | 8 |
| [Modal: "Novo Empenho"] | 9, 10, 11 |
| [Botao: "Detalhes"] | 12 |
| [Card Expandido: "Entregas do Empenho"] | 12, 13 |
| [Botao: "+ Registrar Entrega"] | 14 |
| [Modal: "Nova Entrega contra Empenho"] | 15, 16 |
| [Alerta: "Sem valor contratual"] | 17 |
| [Botao: "Cancelar"] | 18 |

### Implementacao Atual
**Nao Implementado**

---
