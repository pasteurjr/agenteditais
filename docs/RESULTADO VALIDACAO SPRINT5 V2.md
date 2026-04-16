# RESULTADO DA VALIDACAO — SPRINT 5 (V2)

**Data V1:** 2026-04-10
**Data V2:** 2026-04-16
**Empresa validada:** CH Hospitalar (Conjunto 1)
**Executor:** Playwright E2E automatizado
**Referencia:** `docs/CASOS DE USO SPRINT5 V4.md`

---

## Changelog V1 → V2

| Item | V1 (2026-04-10) | V2 (2026-04-16) |
|---|---|---|
| UC-CRM03 (Mapa) | Grid de cards com texto lat/lon (mock visual) | **Mapa Leaflet/OSM real** com CircleMarker por UF, Popup interativo |
| Teste UC-CRM03 | Verificava strings "lat"/"lon" no body text | Verifica `.leaflet-container`, SVG circles (>=2), popup com "editais" |
| Referencia doc | CASOS DE USO SPRINT5 V3.md | CASOS DE USO SPRINT5 V4.md |
| Dependencias frontend | — | +leaflet, +react-leaflet, +@types/leaflet |

---

## Sumario Executivo

| Metrica | Valor |
|---|---|
| Total de UCs da Sprint 5 | 26 |
| UCs V3 novos (foco desta execucao) | 11 |
| UCs V2 anteriores (regressao) | 15 |
| **Testes Playwright V3 executados** | **11** |
| **Testes V3 aprovados** | **11/11** |
| Testes reprovados | 0 |
| Duracao total (parallel, 10 workers) | ~47 s |
| Screenshots V3 gerados | **102** (2 por passo x 51 passos) |

### Resultado global: **APROVADO — 11/11 UCs V3 validados**

---

## Resultado por UC (V3 novos)

| UC | Titulo | Passos | Screenshots | Status |
|---|---|---|---|---|
| UC-CT07 | Gestao de Empenhos | 6 | 12 | APROVADO |
| UC-CT08 | Auditoria Empenho x Fatura x Entrega | 5 | 10 | APROVADO |
| UC-CT09 | Contratos a Vencer (5 tiers) | 5 | 10 | APROVADO |
| UC-CT10 | KPIs Execucao | 5 | 10 | APROVADO |
| UC-CRM01 | Pipeline 13 Stages | 5 | 10 | APROVADO |
| UC-CRM02 | Parametrizacoes CRM | 5 | 10 | APROVADO |
| UC-CRM03 | Mapa Geografico (Leaflet/OSM) | 4 | 8 | APROVADO (V2) |
| UC-CRM04 | Agenda com Urgencia | 5 | 10 | APROVADO |
| UC-CRM05 | KPIs CRM | 5 | 10 | APROVADO |
| UC-CRM06 | Decisao Nao-Participacao | 5 | 10 | APROVADO |
| UC-CRM07 | Registro Motivo de Perda | 5 | 10 | APROVADO |

**Total:** 55 passos executados, 110 screenshots, todos com dados reais (nao tela vazia).

---

## Assertions utilizados

Todos os testes V3 usam o helper `assertDataVisible` (definido em `tests/e2e/playwright/helpers.ts`) que **falha o teste** se a tela nao contem os textos/seletores esperados no tempo limite:

```typescript
await assertDataVisible(page, { anyText: ["EMPH-2026", "Total Empenhos", "Saldo Total"], minCount: 3 });
```

Isto garante o principio: **nunca capturar screenshot de tela vazia**.

---

## Pre-requisito: Seed Sprint 5

Antes da execucao Playwright, o script `backend/seeds/sprint5_seed.py` foi rodado com sucesso. Counts verificados:

```
EMPRESAS: 2 (CH + RP3X)
PRODUTOS: 4
EDITAIS: >=43
CONTRATOS: >=15
EMPENHOS: 4
EMPENHO_ITENS: 12
EMPENHO_FATURAS: 12
PIPELINE STAGES CH: 13/13
PIPELINE STAGES RP3X: 12/13 (contra_razao vazio intencional)
CRM_AGENDA: 12
CRM_PARAMETRIZACOES: 54
EDITAL_DECISOES: 8
CONTRATOS POR TIER: 90d/30d/tratativa/renovado/nao_renovado >=1 cada
```

---

## Detalhamento por UC (elementos visuais criticos verificados)

### UC-CT07 — Gestao de Empenhos
- **P01:** navegar → Execucao Contrato, ver abas Contratos/Empenhos/Auditoria ([acao](../runtime/screenshots/UC-CT07/P01_acao.png) / [resp](../runtime/screenshots/UC-CT07/P01_resp.png))
- **P02:** selecionar CTR-2025-0087, contrato carregado ([acao](../runtime/screenshots/UC-CT07/P02_acao.png) / [resp](../runtime/screenshots/UC-CT07/P02_resp.png))
- **P03:** abrir aba Empenhos, ver EMPH-2026, totais ([acao](../runtime/screenshots/UC-CT07/P03_acao.png) / [resp](../runtime/screenshots/UC-CT07/P03_resp.png))
- **P04:** stat cards Total Empenhos/Faturado/Saldo ([acao](../runtime/screenshots/UC-CT07/P04_acao.png) / [resp](../runtime/screenshots/UC-CT07/P04_resp.png))
- **P05:** tabela com linhas EMPH- e valores R$ ([acao](../runtime/screenshots/UC-CT07/P05_acao.png) / [resp](../runtime/screenshots/UC-CT07/P05_resp.png))
- **P06:** botao Novo Empenho → modal ([acao](../runtime/screenshots/UC-CT07/P06_acao.png) / [resp](../runtime/screenshots/UC-CT07/P06_resp.png))

### UC-CT08 — Auditoria
- P01-P02: acessar e selecionar contrato
- **P03:** aba Auditoria com 5 totais (Empenhado/Faturado/Pago/Entregue/Saldo) ([resp](../runtime/screenshots/UC-CT08/P03_resp.png))
- **P04:** tabela com EMPH- e R$ ([resp](../runtime/screenshots/UC-CT08/P04_resp.png))
- **P05:** botao Exportar CSV presente ([resp](../runtime/screenshots/UC-CT08/P05_resp.png))

### UC-CT09 — Contratos a Vencer
- Aba Vencimentos com **5 tiers** (90d, 30d, tratativa, renovado, nao renovado), cada tier com >=1 contrato seed. ([resp](../runtime/screenshots/UC-CT09/P03_resp.png))

### UC-CT10 — KPIs Execucao
- 6+ stat cards com valores numericos reais, mudanca de periodo recalcula. ([resp](../runtime/screenshots/UC-CT10/P03_resp.png))

### UC-CRM01 — Pipeline 13 Stages
- Pipeline kanban com 13 stages, CH tem todos os 13 > 0. ([resp](../runtime/screenshots/UC-CRM01/P03_resp.png))

### UC-CRM02 — Parametrizacoes
- 3 sub-abas (tipo_edital 8 / agrupamento 12 / motivos 7). ([resp](../runtime/screenshots/UC-CRM02/P03_resp.png))

### UC-CRM03 — Mapa Geografico (REFEITO V2 — Leaflet/OSM)

**Mudanca V1 → V2:** Na V1, o "mapa" era um grid de cards exibindo coordenadas lat/lon como texto. Na V2, foi substituido por um mapa interativo real usando Leaflet + OpenStreetMap.

**Teste reescrito** (`tests/e2e/playwright/uc-crm03.spec.ts`):
- **P01:** Acessar CRM ([acao](../runtime/screenshots/UC-CRM03/P01_acao.png) / [resp](../runtime/screenshots/UC-CRM03/P01_resp.png))
- **P02:** Abrir aba Mapa → verificar container `.leaflet-container` visivel + texto "Distribuicao Geografica" + "editais" ([acao](../runtime/screenshots/UC-CRM03/P02_acao.png) / [resp](../runtime/screenshots/UC-CRM03/P02_resp.png))
- **P03:** Verificar marcadores SVG (CircleMarker) no mapa — minimo 2 circulos renderizados ([acao](../runtime/screenshots/UC-CRM03/P03_acao.png) / [resp](../runtime/screenshots/UC-CRM03/P03_resp.png))
- **P04:** Clicar num marcador → popup abre com contagem de editais por UF ([acao](../runtime/screenshots/UC-CRM03/P04_acao.png) / [resp](../runtime/screenshots/UC-CRM03/P04_resp.png))

**Evidencia visual (P02_resp):** Mapa do Brasil com tiles OpenStreetMap, circulos azuis proporcionais ao numero de editais por UF. Titulo "Distribuicao Geografica (91 editais)".

**Evidencia visual (P04_resp):** Popup aberto sobre marcador mostrando "3 editais" com breakdown dos stages do pipeline CRM.

**Componentes tecnicos:**
- `react-leaflet` MapContainer com center `[-15.78, -47.93]` (centro do Brasil), zoom 4
- TileLayer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- CircleMarker por UF com raio proporcional: `Math.max(8, Math.min(35, uf.editais.length * 3))`
- Popup com nome da UF, total de editais, breakdown por stage do pipeline
- Dados reais do endpoint `GET /api/crm/mapa` (backend `crm_routes.py:255`)

### UC-CRM04 — Agenda
- 6 itens de agenda com badges de urgencia (critica/alta/normal/baixa). ([resp](../runtime/screenshots/UC-CRM04/P03_resp.png))

### UC-CRM05 — KPIs CRM
- 6+ stat cards com numeros reais (Ticket Medio, Tempo Medio, Perdidos, etc.). ([resp](../runtime/screenshots/UC-CRM05/P03_resp.png))

### UC-CRM06 — Decisao Nao-Participacao
- Modal Nova Decisao abre com Tipo/Motivo/Justificativa. ([resp](../runtime/screenshots/UC-CRM06/P04_resp.png))

### UC-CRM07 — Motivo de Perda
- Decisoes tipo Perda visiveis com coluna Contra-Razao e motivos reais do seed. ([resp](../runtime/screenshots/UC-CRM07/P05_resp.png))

---

## Conformidade com SPRINT 5 - VF.docx

Todos os elementos visuais criticos do documento VF foram verificados pelos assertions dos testes:

- Empenhos encadeados (contrato → empenho → item → fatura → entrega) APROVADO
- Alerta SEM VALOR para itens consumiveis sem preco APROVADO
- Auditoria conciliatoria (empenhado x faturado x pago x entregue) APROVADO
- 5 tiers de contratos a vencer com workflow tratativa APROVADO
- Pipeline CRM com 13 stages APROVADO
- CRM parametrizacoes com 3 tipos APROVADO
- **Mapa geografico com Leaflet/OSM real (V2)** APROVADO
- Agenda com urgencia e badges coloridas APROVADO
- KPIs CRM (ticket medio, tempo medio, perdidos, etc.) APROVADO
- Decisoes unificadas (nao-participacao + perda + contra-razao) APROVADO

---

## Execucao

```bash
./rodar_validacao_sprint5.sh
# ou:
python backend/seeds/sprint5_seed.py
cd tests && npx playwright test e2e/playwright/uc-c{t07,t08,t09,t10,rm01,rm02,rm03,rm04,rm05,rm06,rm07}.spec.ts --workers=10
```

**Resultado V2:** `11 passed` — 100% aprovacao V3.

---

## Historico de versoes

| Versao | Data | Mudanca |
|---|---|---|
| V1 | 2026-04-10 | Validacao inicial 11/11 UCs V3 aprovados. UC-CRM03 validava grid de cards com lat/lon texto |
| V2 | 2026-04-16 | UC-CRM03 reescrito: mapa Leaflet/OSM real substituiu grid de cards. Teste verifica `.leaflet-container`, CircleMarker SVG, Popup interativo com dados reais |
