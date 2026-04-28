---
uc_id: UC-CR01
nome: "Dashboard Contratado X Realizado"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1799
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CR01 — Dashboard Contratado X Realizado

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1799).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-051
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato cadastrado com entregas (UC-CT01 + UC-CT02)
3. Endpoint GET /api/dashboard/contratado-realizado implementado

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01**


### Pos-condicoes
1. Dashboard exibe comparativo visual de todos os contratos
2. Indicadores de desvio calculados e sinalizados
3. Saude do portfolio avaliada

### Sequencia de Eventos

1. Usuario acessa ContratadoRealizadoPage (`/app/contratado-realizado`) via menu
2. [Cabecalho: "Contratado X Realizado"] com paragrafo "Dashboard, pedidos em atraso e vencimentos"
3. [Botao: "Enviar ao Chat"] e [Botao: refresh (icone RefreshCw)] disponiveis no header direito
4. [Card: "Dashboard Contratado x Realizado"] (icone BarChart2) e a secao principal
5. [Secao: Filtros sticky] permite selecionar: [Select: "Periodo"] e [TextInput: "Orgao"]
6. Se carregando: [Loader2 animate-spin] + "Carregando dashboard..." exibidos
7. [Secao: Stat Cards] exibe: Total Contratado, Total Realizado, Variacao %, Saude Portfolio
8. [Card: "Saude Portfolio"] exibe badge: Saudavel (verde), Atencao (amarelo), Critico (vermelho)
9. [Tabela: Contratos] exibe: Contrato, Orgao, Contratado R$, Realizado R$, Variacao %, Status
10. [Coluna: "Variacao %"] exibe badge colorido com icone TrendingUp/TrendingDown
11. [Linha de Totais] exibe: Total Contratado, Total Realizado, Var: {pct}%
12. Usuario ajusta filtro de periodo em [Select: "Periodo"] — dashboard recalcula automaticamente

### Fluxos Alternativos (V5)

- **FA-01 — Filtro por orgao especifico:** No passo 5, usuario digita nome de orgao no TextInput. Tabela e Stat Cards recalculam mostrando apenas contratos do orgao filtrado.
- **FA-02 — Portfolio 100% saudavel:** Variacao de todos os contratos <= 5%. Badge "Saudavel" em verde. Nenhum contrato com destaque negativo.
- **FA-03 — Enviar ao Chat:** Usuario clica "Enviar ao Chat" (passo 3). Dados do dashboard sao enviados para o modulo de chat IA para analise.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum contrato com entregas:** Tabela vazia. Stat Cards: Total Contratado e Realizado R$ 0,00. Variacao 0%. Saude "Saudavel" (sem desvios).
- **FE-02 — Erro ao carregar dashboard:** Requisicao GET falha. Loader exibido indefinidamente ate timeout. Alerta de erro exibido com icone AlertTriangle.
- **FE-03 — Portfolio com saude "Critico":** Variacao media > 15%. Badge "Critico" em vermelho. Contratos divergentes destacados na tabela.

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 1 — Dashboard

#### Layout da Tela

```
[Cabecalho da Pagina] (classe "page-header") [ref: Passo 2]
  [Icone: BarChart2 (24px)]
  [Titulo h1: "Contratado X Realizado"]
  [Texto p: "Dashboard, pedidos em atraso e vencimentos"]
  [Botao: "Enviar ao Chat"] (btn btn-secondary) [ref: Passo 3]
  [Botao: refresh] (icone RefreshCw, btn btn-secondary) [ref: Passo 3]

[Card: "Dashboard Contratado x Realizado"] (icone BarChart2) [ref: Passo 4]

  [Secao: Filtros sticky] [ref: Passo 5]
    [Select: "Periodo"] [ref: Passos 5, 12]
      opcoes: "1m" (Ultimo mes), "3m" (Ultimos 3 meses), "6m" (Ultimos 6 meses), "12m" (Ultimos 12 meses), "tudo" (Tudo)
    [TextInput: "Orgao"] — placeholder "Filtrar por orgao..." [ref: Passo 5]

  [Loader2 animate-spin + "Carregando dashboard..."] — condicional [ref: Passo 6]
  [Alerta de Erro] (icone AlertTriangle) — condicional

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 7]
    [Card: "Total Contratado"] (fontSize: 22, fontWeight: 700)
    [Card: "Total Realizado"] (fontSize: 22, fontWeight: 700)
    [Card: "Variacao %"] (icone TrendingUp/TrendingDown, cor verde se <= 0, vermelho se > 0)
    [Card: "Saude Portfolio"] (icone Shield) [ref: Passo 8]
      [Badge: "Saudavel"] (bg: #bbf7d0, text: #16a34a)
      [Badge: "Atencao"] (bg: #fef08a, text: #ca8a04)
      [Badge: "Critico"] (bg: #fecaca, text: #dc2626)

  [Tabela: Contratos] (DataTable) [ref: Passos 9, 10]
    [Coluna: "Contrato"] (key: numero, sortable)
    [Coluna: "Orgao"] (key: orgao, sortable)
    [Coluna: "Contratado (R$)"] (key: valor_contratado, render: formatCurrency)
    [Coluna: "Realizado (R$)"] (key: valor_realizado, render: formatCurrency)
    [Coluna: "Variacao %"] (key: variacao_pct, sortable) [ref: Passo 10]
      [Badge: verde] (status-badge-success) — <= 5%
      [Badge: amarelo] (status-badge-warning) — > 5% e <= 15%
      [Badge: vermelho] (status-badge-danger) — > 15%
      [Icone: TrendingUp / TrendingDown]
    [Coluna: "Status"] (key: status) — statusBadge

  [Linha de Totais] [ref: Passo 11]
    [Texto: "Total Contratado: {formatCurrency}"]
    [Texto: "Total Realizado: {formatCurrency}"]
    [Texto: "Var: {pct}%"] (verde se <= 0, vermelho se > 0)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Cabecalho da Pagina] | 2 |
| [Botao: "Enviar ao Chat"] / [Botao: refresh] | 3 |
| [Card: "Dashboard Contratado x Realizado"] | 4 |
| [Select: "Periodo"] / [TextInput: "Orgao"] | 5, 12 |
| [Loader2] | 6 |
| [Stat Cards] | 7 |
| [Card: "Saude Portfolio"] / badges | 8 |
| [Tabela: Contratos] | 9 |
| [Coluna: "Variacao %"] / badges | 10 |
| [Linha de Totais] | 11 |

### Implementacao Atual
**Implementado**

---
