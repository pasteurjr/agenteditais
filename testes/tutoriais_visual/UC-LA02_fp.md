---
uc_id: UC-LA02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA02_visual_fp.yaml
---

# UC-LA02 — Sugestao de Lance em Tempo Real (Fluxo Principal)

> **Predecessores:** UC-LA01
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Validar PrecificacaoPage com sugestao IA

Sugestao IA aparece em tempo real apos vinculo selecionado.

**Validar screenshot:** Card 'Precificacao Assistida por IA' (UC-P11) mostra sugestoes em tempo real.

```yaml
id: passo_00_pagina_carregada
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-LA02_visual_fp.yaml#passo_00_pagina_carregada"
```
