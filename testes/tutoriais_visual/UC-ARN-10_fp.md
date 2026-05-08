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

Confirma via getComputedStyle que ≥3 botoes nao-disabled tem cursor:pointer.


## ≥3 botoes ativos com cursor:pointer

> **Validando observação Arnaldo F02-02** — Cursor pointer global em elementos clicaveis

Confirma F02-02: CSS global aplica cursor:pointer em todos botoes nao-disabled. Verifica em ≥3 elementos visiveis na tela atual.

**Dados/pré-condições:**
- CSS global aplica cursor:pointer em button:not(:disabled), a, [role=button]

**Observe criticamente:**
- Mouse sobre botoes nao-disabled mostra cursor de mao (pointer)
- ≥3 botoes na tela atual com cursor:pointer
- Botoes disabled tem cursor:not-allowed (nao-pointer)

```yaml
id: passo_00_validar_cursor_pointer
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F02-02: cursor:pointer global em botoes nao-disabled\n\
    \  const buttons = [...document.querySelectorAll('button:not(:disabled)')].slice(0,\
    \ 10);\n  if (buttons.length < 3) throw new Error(`Pre-cond: <3 botoes ativos\
    \ visiveis (${buttons.length})`);\n  const com = [], sem = [];\n  for (const b\
    \ of buttons) {\n    const cur = getComputedStyle(b).cursor;\n    const lbl =\
    \ (b.textContent || b.getAttribute('aria-label') || '').slice(0,25).trim();\n\
    \    if (cur === 'pointer') com.push(lbl);\n    else sem.push(`${lbl}=${cur}`);\n\
    \  }\n  if (com.length < 3) throw new Error(`Esperado >=3 botoes com cursor:pointer,\
    \ achou ${com.length}. Sem pointer: ${sem.slice(0,3).join('|')}`);\n  return `F02-02_OK\
    \ ${com.length}/${buttons.length} botoes com cursor:pointer`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-10_visual_fp.yaml#passo_00_validar_cursor_pointer
```
