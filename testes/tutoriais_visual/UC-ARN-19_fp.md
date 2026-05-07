---
uc_id: UC-ARN-19
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-19_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml
---

# UC-ARN-19 — Tooltips ricos na coluna Acoes (Fluxo Principal)

> **Origem da observação:** F04-05
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

≥4 botoes da coluna Acoes tem title='...' descritivo.

## EmpresaPage

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: navegacao
  url: /empresa
validacao_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml#passo_00_navegar_empresa
```


## Conta botoes com title rico

```yaml
id: passo_01_validar_tooltips
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const titles = [...document.querySelectorAll('button[title]')].map(b\
    \ => b.title);\n  const ricos = titles.filter(t => t && t.length > 15);\n  if\
    \ (ricos.length < 3) throw new Error(`Esperado >= 3 tooltips ricos, achou ${ricos.length}`);\n\
    \  return `F04-05_tooltips_OK ${ricos.length}`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml#passo_01_validar_tooltips
```
