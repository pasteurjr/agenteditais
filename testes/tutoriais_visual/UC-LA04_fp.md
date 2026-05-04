---
uc_id: UC-LA04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA04_visual_fp.yaml
---

# UC-LA04 — Lance Aberto + Fechado (modalidade aberto+fechado) (Fluxo Principal)

> **Predecessores:** UC-LA03
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Garantir LancesPage com pregao aberto+fechado

Sprint 10 simulador suporta modalidade 'aberto_fechado'.

**Validar screenshot:** suporte a modo aberto+fechado deve estar visivel ou navegavel.

```yaml
id: passo_00_garantir_lances
acao:
  sequencia:
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-LA04_visual_fp.yaml#passo_00_garantir_lances"
```
