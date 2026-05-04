---
uc_id: UC-CR01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CR01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CR01_visual_fp.yaml
---

# UC-CR01 — Dashboard Contratado X Realizado (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Garantir ProducaoPage com dashboards CR (Contratado X Realizado)

ProducaoPage tem secoes/tabs com comparativo Contratado vs Realizado.

**Observe criticamente:**
- ProducaoPage carregada
- Dashboards com totais

```yaml
id: passo_00_garantir_producao
acao:
  sequencia:
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CR01_visual_fp.yaml#passo_00_garantir_producao"
```

## Passo 01 — Validar presenca de stats Contratado vs Realizado

Cards mostram totais contratados e realizados.

**Observe criticamente:**
- Pelo menos 1 stat card com numero

```yaml
id: passo_01_validar_dashboard
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CR01_visual_fp.yaml#passo_01_validar_dashboard"
```
