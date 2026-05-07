---
uc_id: UC-ARN-22
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-22_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-22_visual_fp.yaml
---

# UC-ARN-22 — CRF FGTS persiste arquivo_path (Fluxo Principal)

> **Origem da observação:** F04-08
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Backend sempre salva path quando scraper retorna PDF, independente do status.

## Logica em app.py:12930

```yaml
id: passo_00_revisar_codigo
acao:
  tipo: evaluate
  valor_literal: '() => ''F04-08_codigo_app.py_linha_12930''

    '
validacao_ref: testes/casos_de_teste/UC-ARN-22_visual_fp.yaml#passo_00_revisar_codigo
```
