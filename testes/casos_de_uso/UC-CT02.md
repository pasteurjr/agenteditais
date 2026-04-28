---
uc_id: UC-CT02
nome: "Registrar Entrega + NF"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 891
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CT02 — Registrar Entrega + NF

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 891).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-202, RN-203, RN-208 [FALTANTE->V4]

**RF relacionado:** RF-046-03
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato cadastrado e selecionado (UC-CT01)
3. Modelo `ContratoEntrega` com campos completos

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01**


### Pos-condicoes
1. Entrega registrada na tabela `contrato_entregas`
2. Status da entrega atualizado (pendente -> entregue)
3. Status do contrato recalculado automaticamente

### Sequencia de Eventos

1. Na ProducaoPage, usuario clica [Botao: "Selecionar"] em um contrato — [Banner] confirma selecao
2. Usuario clica na [Aba: "Entregas"] (2a aba)
3. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"] exibido
4. [Card: "Entregas — {numero_contrato}"] exibe lista de entregas do contrato selecionado
5. [Tabela: Entregas] exibe: Descricao, Qtd, Valor, Prevista, Realizada, NF, Status
6. [Coluna: "Status"] exibe badge por estado da entrega
7. Usuario clica [Botao: "+ Nova Entrega"] — [Modal: "Nova Entrega"] abre
8. Preenche: [TextInput: "Descricao"], [TextInput: "Quantidade"], [TextInput: "Valor Unitario"]
9. Preenche datas: [TextInput: "Data Prevista"], [TextInput: "Data Realizada"]
10. Opcionalmente preenche: [TextInput: "Nota Fiscal"], [TextInput: "Numero do Empenho"]
11. Clica [Botao: "Criar"] — entrega registrada e aparece na tabela
12. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Entrega parcial (sem data realizada):** No passo 9, usuario preenche apenas "Data Prevista" e deixa "Data Realizada" vazia. Entrega e criada com status "pendente". Pode ser atualizada posteriormente quando entrega ocorrer.
- **FA-02 — Entrega sem nota fiscal:** No passo 10, campo NF fica vazio. Entrega e criada normalmente. NF pode ser adicionada depois via edicao.
- **FA-03 — Multiplas entregas para o mesmo item:** Usuario registra N entregas com mesma descricao mas datas e quantidades diferentes (entregas parceladas). Todas aparecem na tabela separadamente.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum contrato selecionado:** No passo 2, ao clicar na aba "Entregas", sistema exibe mensagem "Selecione um contrato na aba 'Contratos'" (passo 3). Botao "+ Nova Entrega" nao aparece.
- **FE-02 — Valor de entrega excede saldo do contrato (RN-209):** No passo 11, backend valida que somatorio de entregas + nova entrega > valor do contrato. Retorna warning RN-209. Sistema exibe alerta "Valor da entrega excede saldo do contrato." Em modo warn-only, entrega e criada com aviso.
- **FE-03 — Data realizada anterior a data de inicio do contrato:** Sistema valida e exibe warning "Data de entrega anterior ao inicio do contrato."
- **FE-04 — Quantidade zero ou negativa:** Sistema rejeita e exibe erro "Quantidade deve ser maior que zero."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Entregas" (2a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Texto: "Selecione um contrato na aba 'Contratos'"] — exibido se nenhum contrato selecionado [ref: Passo 3]

[Card: "Entregas — {numero_contrato}"] [ref: Passo 4]
  [Botao: "+ Nova Entrega"] (icone Plus) [ref: Passo 7]

  [Tabela: Entregas] (DataTable) [ref: Passos 5, 6]
    [Coluna: "Descricao"] (key: descricao)
    [Coluna: "Qtd"] (key: quantidade)
    [Coluna: "Valor"] (key: valor_total, render: formatCurrency)
    [Coluna: "Prevista"] (key: data_prevista, render: formatDate)
    [Coluna: "Realizada"] (key: data_realizada, render: formatDate)
    [Coluna: "NF"] (key: nota_fiscal)
    [Coluna: "Status"] (key: status) — badge colorido [ref: Passo 6]

[Modal: "Nova Entrega"] [ref: Passos 8-12]
  [TextInput: "Descricao"] [ref: Passo 8]
  [TextInput: "Quantidade"] [ref: Passo 8]
  [TextInput: "Valor Unitario"] [ref: Passo 8]
  [TextInput: "Data Prevista"] — placeholder "2026-03-15" [ref: Passo 9]
  [TextInput: "Data Realizada"] — placeholder opcional [ref: Passo 9]
  [TextInput: "Nota Fiscal"] — opcional [ref: Passo 10]
  [TextInput: "Numero do Empenho"] — opcional [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Entregas"] | 2 |
| [Texto: "Selecione um contrato..."] | 3 |
| [Card: "Entregas — {numero}"] | 4 |
| [Tabela: Entregas] | 5 |
| [Coluna: "Status"] / badges | 6 |
| [Botao: "+ Nova Entrega"] | 7 |
| [Modal: "Nova Entrega"] | 8, 9, 10, 11, 12 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**Implementado**

---
