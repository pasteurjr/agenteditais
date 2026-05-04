---
uc_id: UC-SC05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SC05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SC05_visual_fp.yaml
---

# UC-SC05 — DRE do Contrato (ContratadoRealizadoPage + Precificacao) (Fluxo Principal)

> **Predecessores:** UC-CT07
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Garantir ContratadoRealizadoPage carregada

DRE do contrato em ContratadoRealizadoPage.

```yaml
id: passo_00_garantir_cr
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-SC05_visual_fp.yaml#passo_00_garantir_cr"
```
