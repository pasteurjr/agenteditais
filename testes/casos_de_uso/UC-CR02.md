---
uc_id: UC-CR02
nome: "Pedidos em Atraso"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1913
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CR02 — Pedidos em Atraso

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1913).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-052
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato com entregas atrasadas

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01**
- **UC-CT02**


### Pos-condicoes
1. Entregas atrasadas listadas com severidade visual
2. Stat cards de atraso calculados
3. Acoes de contato disponiveis

### Sequencia de Eventos

1. Na ContratadoRealizadoPage, usuario localiza a [Secao: "Pedidos em Atraso"] (Card abaixo do Dashboard)
2. [Card: "Pedidos em Atraso"] (icone AlertTriangle) exibe a secao
3. [Secao: Stat Cards] exibe: Total Atrasados, Alta Severidade (>30d), Valor em Risco — todos em vermelho
4. Se sem atrasos: [Texto: "Nenhum pedido em atraso"] (textAlign: center, color: #64748b)
5. Entregas agrupadas por severidade em tabelas separadas com headers coloridos:
   - [Tabela: CRITICO] (header bg: #fecaca, color: #991b1b) — alta severidade
   - [Tabela: ATENCAO] (header bg: #fef08a, color: #92400e) — media severidade
   - [Tabela: OBSERVACAO] (header bg: #fed7aa, color: #9a3412) — baixa severidade
6. Cada tabela exibe: Contrato, Orgao, Entrega, Data Prevista, Dias Atraso, Valor
7. [Coluna: "Dias Atraso"] exibe "{dias_atraso}d" em vermelho bold

### Fluxos Alternativos (V5)

- **FA-01 — Nenhum pedido em atraso:** No passo 4, mensagem "Nenhum pedido em atraso" e exibida. Stat Cards: Total=0, Alta Sev.=0, Valor em Risco=R$ 0,00. Nenhuma tabela de severidade renderizada.
- **FA-02 — Apenas atrasos de baixa severidade (< 7 dias):** Apenas tabela "OBSERVACAO" exibida. Tabelas CRITICO e ATENCAO nao aparecem. Stat Card "Alta Severidade" exibe 0.
- **FA-03 — Todos os atrasos de alta severidade (> 30 dias):** Apenas tabela "CRITICO" exibida com todos os itens. Stat Card "Alta Severidade" igual a "Total Atrasados".

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar dados de atraso:** Requisicao falha. Stat Cards exibem "-". Tabelas nao renderizadas. Alerta de erro exibido.
- **FE-02 — Contrato com data prevista nula:** Entrega sem data prevista nao aparece em atrasos (nao e possivel calcular dias de atraso).

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 2 — Pedidos em Atraso (abaixo do Dashboard)

#### Layout da Tela

```
[Card: "Pedidos em Atraso"] (icone AlertTriangle) [ref: Passo 2]

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 3]
    [Card: "Total Atrasados"] (fontSize: 24, color: #dc2626, bg: #fef2f2, border: #fecaca)
    [Card: "Alta Severidade (>30d)"] (fontSize: 24, color: #dc2626, bg: #fef2f2)
    [Card: "Valor em Risco"] (fontSize: 20, color: #dc2626, bg: #fef2f2)

  [Texto: "Nenhum pedido em atraso"] — se sem atrasos [ref: Passo 4]

  [Tabela: CRITICO ({N})] [ref: Passo 5]
    [Header: "CRITICO ({N})"] (bg: #fecaca, color: #991b1b, fontWeight: 700)
    [Coluna: "Contrato"] (key: contrato_numero)
    [Coluna: "Orgao"] (key: orgao)
    [Coluna: "Entrega"] (key: entrega)
    [Coluna: "Data Prevista"] (key: data_prevista, render: formatDate)
    [Coluna: "Dias Atraso"] (key: dias_atraso) — "{dias}d" [ref: Passo 7]
      (color: #dc2626, fontWeight: 600)
    [Coluna: "Valor"] (key: valor, render: formatCurrency)

  [Tabela: ATENCAO ({N})] [ref: Passo 5]
    [Header: "ATENCAO ({N})"] (bg: #fef08a, color: #92400e, fontWeight: 700)
    [mesmas colunas do CRITICO]

  [Tabela: OBSERVACAO ({N})] [ref: Passo 5]
    [Header: "OBSERVACAO ({N})"] (bg: #fed7aa, color: #9a3412, fontWeight: 700)
    [mesmas colunas do CRITICO]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Pedidos em Atraso"] | 2 |
| [Stat Cards: Total/Alta Sev./Valor] | 3 |
| [Texto: "Nenhum pedido em atraso"] | 4 |
| [Tabelas CRITICO/ATENCAO/OBSERVACAO] | 5, 6 |
| [Coluna: "Dias Atraso"] | 7 |

### Implementacao Atual
**Implementado**

---
