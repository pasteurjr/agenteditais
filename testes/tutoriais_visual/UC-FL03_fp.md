---
uc_id: UC-FL03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FL03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FL03_visual_fp.yaml
---

# UC-FL03 — Listar e Filtrar Historico de Alertas (Fluxo Principal)

> **Predecessores:** UC-FL01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Garantir FlagsPage com lista historica

**Observe criticamente:**
- Tabela de alertas (ativos + historicos)
- Filtros disponiveis (status, tipo, periodo)

```yaml
id: passo_00_garantir_flags
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL03_visual_fp.yaml#passo_00_garantir_flags"
```

## Passo 01 — Validar presenca de filtros

**Observe criticamente:**
- Selects/inputs de filtro (status, tipo, periodo)

```yaml
id: passo_01_validar_filtros
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL03_visual_fp.yaml#passo_01_validar_filtros"
```
