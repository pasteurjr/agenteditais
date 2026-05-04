---
uc_id: UC-HC01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-HC01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-HC01_visual_fp.yaml
---

# UC-HC01 — Health Check do Sistema (rota /health) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Validar qualquer pagina autenticada (sistema saudavel)

Se a pagina carrega, /health do backend respondeu OK (UI usa /api/health internamente).

```yaml
id: passo_00_validar_pagina_qualquer
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-HC01_visual_fp.yaml#passo_00_validar_pagina_qualquer"
```
