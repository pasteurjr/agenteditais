---
uc_id: UC-ARN-20
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-20_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-20_visual_fp.yaml
---

# UC-ARN-20 — Validade do PDF prevalece sobre user (Fluxo Principal)

> **Origem da observação:** F04-06
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Endpoint upload de certidao retorna divergencia_validade quando data user difere da IA.

## Codigo backend implementa logica

```yaml
id: passo_00_revisar_codigo
acao:
  tipo: evaluate
  valor_literal: '() => ''F04-06_codigo_revisado_em_app.py_linha_10810''

    '
validacao_ref: testes/casos_de_teste/UC-ARN-20_visual_fp.yaml#passo_00_revisar_codigo
```
