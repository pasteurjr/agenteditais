---
uc_id: UC-CR02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CR02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CR02_visual_fp.yaml
---

# UC-CR02 — Pedidos em Atraso (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Validar tabela/secao de pedidos atrasados

ProducaoPage tab Entregas destaca atrasos em vermelho.

**Observe criticamente:**
- Tabela com coluna 'Status' ou 'Atraso'
- Linhas com badge vermelho (atraso) destacadas

```yaml
id: passo_00_validar_atrasos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CR02_visual_fp.yaml#passo_00_validar_atrasos"
```
