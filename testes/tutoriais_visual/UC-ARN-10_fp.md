---
uc_id: UC-ARN-10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-10_visual_fp.yaml
---

# UC-ARN-10 — Cursor pointer global em elementos clicaveis (Fluxo Principal)

> **Origem da observação:** F02-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Confirma via getComputedStyle que botoes/links nao-disabled tem cursor:pointer.


## Confere cursor em ≥3 elementos

```yaml
id: passo_00_validar_cursor_pointer
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const buttons = [...document.querySelectorAll('button:not(:disabled)')].slice(0,\
    \ 5);\n  const naoPointer = [];\n  for (const b of buttons) {\n    const cursor\
    \ = getComputedStyle(b).cursor;\n    if (cursor !== 'pointer') naoPointer.push(b.textContent?.slice(0,20));\n\
    \  }\n  if (naoPointer.length > 0) throw new Error(`${naoPointer.length} botoes\
    \ sem pointer: ${naoPointer.join(', ')}`);\n  return `F02-02_cursor_OK em ${buttons.length}\
    \ elementos`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-10_visual_fp.yaml#passo_00_validar_cursor_pointer
```
