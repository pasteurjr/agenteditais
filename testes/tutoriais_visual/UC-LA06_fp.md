---
uc_id: UC-LA06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA06_visual_fp.yaml
---

# UC-LA06 — Envio Automatico de Lances (Robo de Lances) (Fluxo Principal)

> **Predecessores:** UC-LA03
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Garantir LancesPage carregada

Robo de lances envia automaticamente baseado em perfil + parametros.

**Validar screenshot:** opcao de robo/automacao visivel ou config disponivel.

```yaml
id: passo_00_garantir_lances
acao:
  sequencia:
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-LA06_visual_fp.yaml#passo_00_garantir_lances"
```
