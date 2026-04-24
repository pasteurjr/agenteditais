---
uc_id: UC-FU03
nome: "Score Logistico"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 342
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-FU03 — Score Logistico

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 342).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-011
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Parametros logisticos configurados (distancia, prazo, capacidade)
3. Edital com dados de entrega definidos

### Pos-condicoes
1. Score logistico calculado via API e exibido com valor numerico
2. Componentes do score detalhados (distancia, prazo, capacidade)
3. Subsidio adicional para decisao de participar do certame

### Sequencia de Eventos

1. Usuario acessa FollowupPage — score logistico calculado automaticamente via API (`/api/score-logistico`)
2. [Secao: Stat Cards] exibe card com Score Logistico calculado
3. [Card: "Score Logistico"] exibe valor numerico com descricao dos componentes
4. Componentes avaliados: distancia (entre empresa e orgao), prazo de entrega (viabilidade), capacidade produtiva
5. Usuario interpreta o score ao lado dos demais indicadores da pagina

### Fluxos Alternativos (V5)

- **FA-01 — Parametros logisticos parcialmente configurados:** API calcula score com os componentes disponiveis. Componentes faltantes exibem "N/A" no detalhamento. Score final calculado proporcionalmente aos componentes existentes.
- **FA-02 — Score logistico igual a zero:** Todos os componentes retornam valor minimo (distancia muito grande, prazo inviavel, capacidade zero). Card exibe "0" com cor vermelha indicando inviabilidade logistica.

### Fluxos de Excecao (V5)

- **FE-01 — API de score logistico indisponivel:** Requisicao GET para `/api/score-logistico` falha (timeout ou erro). Card exibe "N/A" no lugar do valor numerico. Demais Stat Cards funcionam normalmente.
- **FE-02 — Nenhum edital com dados de entrega:** API retorna score vazio por falta de dados de entrada. Card exibe "N/A" e componentes ficam todos em branco.

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Area de Stat Cards — card de Score Logistico

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards] [ref: Passos 2, 3]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)
  [Card: "Score Logistico"] — valor via /api/score-logistico [ref: Passos 1, 3]
    [Texto: valor numerico] — ex: "87" ou "N/A" [ref: Passo 3]
    [Texto: componentes] — distancia, prazo, capacidade [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Score Logistico"] | 2, 3 |
| [Texto: valor numerico] | 3 |
| [Texto: componentes distancia/prazo/capacidade] | 4 |

### Implementacao Atual
**Implementado**

---

# FASE 2 — ATAS DE PREGAO

---
