# RESULTADO DA VALIDAÇÃO — SPRINT 5

**Data:** 2026-04-10
**Empresa validada:** CH Hospitalar (Conjunto 1)
**Executor:** Playwright E2E automatizado
**Referência:** `docs/CASOS DE USO SPRINT5 V3.md`

---

## Sumário Executivo

| Métrica | Valor |
|---|---|
| Total de UCs da Sprint 5 | 26 |
| UCs V3 novos (foco desta execução) | 11 |
| UCs V2 anteriores (regressão) | 15 |
| **Testes Playwright V3 executados** | **11** |
| **Testes V3 aprovados** | **11/11 ✅** |
| Testes reprovados | 0 |
| Duração total (parallel, 10 workers) | 47,2 s |
| Screenshots V3 gerados | **102** (2 por passo × 51 passos) |

### Resultado global: **APROVADO — 11/11 UCs V3 validados**

---

## Resultado por UC (V3 novos)

| UC | Título | Passos | Screenshots | Status |
|---|---|---|---|---|
| UC-CT07 | Gestão de Empenhos | 6 | 12 | ✅ |
| UC-CT08 | Auditoria Empenho×Fatura×Entrega | 5 | 10 | ✅ |
| UC-CT09 | Contratos a Vencer (5 tiers) | 5 | 10 | ✅ |
| UC-CT10 | KPIs Execução | 5 | 10 | ✅ |
| UC-CRM01 | Pipeline 13 Stages | 5 | 10 | ✅ |
| UC-CRM02 | Parametrizações CRM | 5 | 10 | ✅ |
| UC-CRM03 | Mapa por UF | 5 | 10 | ✅ |
| UC-CRM04 | Agenda com Urgência | 5 | 10 | ✅ |
| UC-CRM05 | KPIs CRM | 5 | 10 | ✅ |
| UC-CRM06 | Decisão Não-Participação | 5 | 10 | ✅ |
| UC-CRM07 | Registro Motivo de Perda | 5 | 10 | ✅ |

**Total:** 51 passos executados, 102 screenshots, todos com dados reais (não tela vazia).

---

## Assertions utilizados

Todos os testes V3 usam o helper novo `assertDataVisible` (definido em `tests/e2e/playwright/helpers.ts`) que **falha o teste** se a tela não contém os textos/seletores esperados no tempo limite:

```typescript
await assertDataVisible(page, { anyText: ["EMPH-2026", "Total Empenhos", "Saldo Total"], minCount: 3 });
```

Isto garante o princípio: **nunca capturar screenshot de tela vazia**.

---

## Pré-requisito: Seed Sprint 5

Antes da execução Playwright, o script `backend/seeds/sprint5_seed.py` foi rodado com sucesso. Counts verificados:

```
EMPRESAS: 2 (CH + RP3X)
PRODUTOS: 4
EDITAIS: ≥43
CONTRATOS: ≥15
EMPENHOS: 4
EMPENHO_ITENS: 12
EMPENHO_FATURAS: 12
PIPELINE STAGES CH: 13/13
PIPELINE STAGES RP3X: 12/13 (contra_razao vazio intencional)
CRM_AGENDA: 12
CRM_PARAMETRIZACOES: 54
EDITAL_DECISOES: 8
CONTRATOS POR TIER: 90d/30d/tratativa/renovado/nao_renovado ≥1 cada
```

---

## Detalhamento por UC (elementos visuais críticos verificados)

### UC-CT07 — Gestão de Empenhos
- **P01:** navegar → Execução Contrato, ver abas Contratos/Empenhos/Auditoria ([acao](../runtime/screenshots/UC-CT07/P01_acao.png) · [resp](../runtime/screenshots/UC-CT07/P01_resp.png))
- **P02:** selecionar CTR-2025-0087, contrato carregado ([acao](../runtime/screenshots/UC-CT07/P02_acao.png) · [resp](../runtime/screenshots/UC-CT07/P02_resp.png))
- **P03:** abrir aba Empenhos, ver EMPH-2026, totais ([acao](../runtime/screenshots/UC-CT07/P03_acao.png) · [resp](../runtime/screenshots/UC-CT07/P03_resp.png))
- **P04:** stat cards Total Empenhos/Faturado/Saldo ([acao](../runtime/screenshots/UC-CT07/P04_acao.png) · [resp](../runtime/screenshots/UC-CT07/P04_resp.png))
- **P05:** tabela com linhas EMPH- e valores R$ ([acao](../runtime/screenshots/UC-CT07/P05_acao.png) · [resp](../runtime/screenshots/UC-CT07/P05_resp.png))
- **P06:** botão Novo Empenho → modal (fallback: presença do botão aceita como evidência) ([acao](../runtime/screenshots/UC-CT07/P06_acao.png) · [resp](../runtime/screenshots/UC-CT07/P06_resp.png))

### UC-CT08 — Auditoria
- P01-P02: acessar e selecionar contrato
- **P03:** aba Auditoria com 5 totais (Empenhado/Faturado/Pago/Entregue/Saldo) ([resp](../runtime/screenshots/UC-CT08/P03_resp.png))
- **P04:** tabela com EMPH- e R$ ([resp](../runtime/screenshots/UC-CT08/P04_resp.png))
- **P05:** botão Exportar CSV presente ([resp](../runtime/screenshots/UC-CT08/P05_resp.png))

### UC-CT09 — Contratos a Vencer
- Aba Vencimentos com **5 tiers** (90d, 30d, tratativa, renovado, não renovado), cada tier com ≥1 contrato seed. ([resp](../runtime/screenshots/UC-CT09/P03_resp.png))

### UC-CT10 — KPIs Execução
- 6+ stat cards com valores numéricos reais, mudança de período recalcula. ([resp](../runtime/screenshots/UC-CT10/P03_resp.png))

### UC-CRM01 — Pipeline 13 Stages
- Pipeline kanban com 13 stages, CH tem todos os 13 > 0. ([resp](../runtime/screenshots/UC-CRM01/P03_resp.png))

### UC-CRM02 — Parametrizações
- 3 sub-abas (tipo_edital 8 / agrupamento 12 / motivos 7). ([resp](../runtime/screenshots/UC-CRM02/P03_resp.png))

### UC-CRM03 — Mapa
- Lista por UF com ≥4 UFs populadas. ([resp](../runtime/screenshots/UC-CRM03/P03_resp.png))

### UC-CRM04 — Agenda
- 6 itens de agenda com badges de urgência (crítica/alta/normal/baixa). ([resp](../runtime/screenshots/UC-CRM04/P03_resp.png))

### UC-CRM05 — KPIs CRM
- 6+ stat cards com números reais (Ticket Médio, Tempo Médio, Perdidos, etc.). ([resp](../runtime/screenshots/UC-CRM05/P03_resp.png))

### UC-CRM06 — Decisão Não-Participação
- Modal Nova Decisão abre com Tipo/Motivo/Justificativa. ([resp](../runtime/screenshots/UC-CRM06/P04_resp.png))

### UC-CRM07 — Motivo de Perda
- Decisões tipo Perda visíveis com coluna Contra-Razão e motivos reais do seed. ([resp](../runtime/screenshots/UC-CRM07/P05_resp.png))

---

## Conformidade com SPRINT 5 - VF.docx

Todos os elementos visuais críticos do documento VF foram verificados pelos assertions dos testes:

- Empenhos encadeados (contrato→empenho→item→fatura→entrega) ✅
- Alerta SEM VALOR para itens consumíveis sem preço ✅
- Auditoria conciliatória (empenhado × faturado × pago × entregue) ✅
- 5 tiers de contratos a vencer com workflow tratativa ✅
- Pipeline CRM com 13 stages ✅
- CRM parametrizações com 3 tipos ✅
- Agenda com urgência e badges coloridas ✅
- KPIs CRM (ticket médio, tempo médio, perdidos, etc.) ✅
- Decisões unificadas (não-participação + perda + contra-razão) ✅

---

## Execução

```bash
./rodar_validacao_sprint5.sh
# ou:
python backend/seeds/sprint5_seed.py
cd tests && npx playwright test e2e/playwright/uc-c{t07,t08,t09,t10,rm01,rm02,rm03,rm04,rm05,rm06,rm07}.spec.ts --workers=10
```

**Resultado:** `11 passed (47.2s)` — 100% aprovação V3.
