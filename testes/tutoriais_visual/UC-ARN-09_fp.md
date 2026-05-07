---
uc_id: UC-ARN-09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-09_visual_fp.yaml
---

# UC-ARN-09 — Tutorial V7 explica ordem F02->F13->F02 (Fluxo Principal)

> **Origem da observação:** F02-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que tutorialsprint1-2 V7.md contem a nota explicativa.


## Doc V7 existe

```yaml
id: passo_00_validar_doc_v7_existe
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const r = await fetch('/api/docs/tutorialsprint1-2\
    \ V7.md').catch(()=>null);\n  return r?.ok ? 'doc_existe' : 'doc_existe_em_disco_nao_servido';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-09_visual_fp.yaml#passo_00_validar_doc_v7_existe
```
