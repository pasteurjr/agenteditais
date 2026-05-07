---
uc_id: UC-ARN-17
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-17_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml
---

# UC-ARN-17 — Coluna Ativa/Inativa de Fonte (Fluxo Principal)

> **Origem da observação:** F04-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

EmpresaPage > tabela certidoes tem coluna Fonte com badge Ativa/Inativa.

## EmpresaPage

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: navegacao
  url: /empresa
validacao_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml#passo_00_navegar_empresa
```


## Tabela certidoes tem header 'Fonte' OU badge 'Ativa'

```yaml
id: passo_01_validar_coluna
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const txt = document.body.innerText;\n  const tem_fonte\
    \ = /Fonte\\b/.test(txt);\n  const tem_badge = /Ativa\\b|Inativa\\b/.test(txt);\n\
    \  if (!tem_fonte && !tem_badge) throw new Error('Coluna Fonte ou badge Ativa\
    \ nao encontrado');\n  return 'F04-03_coluna_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml#passo_01_validar_coluna
```
