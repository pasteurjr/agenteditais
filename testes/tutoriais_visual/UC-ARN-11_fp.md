---
uc_id: UC-ARN-11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml
---

# UC-ARN-11 — Upload em Massa Portfolio por IA (Fluxo Principal)

> **Origem da observação:** F02-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

UploadLoteIA contexto=portfolio plugado em PortfolioPage.

## Navega Portfolio

```yaml
id: passo_00_navegar_portfolio
acao:
  tipo: navegacao
  url: /portfolio
validacao_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml#passo_00_navegar_portfolio
```


## Componente Upload em Lote IA renderiza

```yaml
id: passo_01_validar_upload_lote
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const tem = /Upload em Lote|Upload em Massa/i.test(document.body.innerText);\n\
    \  if (!tem) throw new Error('UploadLoteIA portfolio nao renderiza');\n  return\
    \ 'F02-03_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml#passo_01_validar_upload_lote
```
