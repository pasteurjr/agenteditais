---
uc_id: UC-ARN-21
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-21_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-21_visual_fp.yaml
---

# UC-ARN-21 — Magic bytes %PDF rejeita HTML (Fluxo Principal)

> **Origem da observação:** F04-07
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Upload de arquivo nao-PDF retorna 400 com magic_bytes_invalidos.

## Helper _arquivo_eh_pdf_valido existe

```yaml
id: passo_00_validar_helper
acao:
  tipo: evaluate
  valor_literal: '() => ''F04-07_helper_app.py_linha_62''

    '
validacao_ref: testes/casos_de_teste/UC-ARN-21_visual_fp.yaml#passo_00_validar_helper
```
