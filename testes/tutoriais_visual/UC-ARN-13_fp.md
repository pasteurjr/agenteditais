---
uc_id: UC-ARN-13
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-13_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml
---

# UC-ARN-13 — Upload em massa documentos IA (Fluxo Principal)

> **Origem da observação:** F03-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

UploadLoteIA contexto=documentos em EmpresaPage.

## EmpresaPage

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: navegacao
  url: /empresa
validacao_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml#passo_00_navegar_empresa
```


## Componente upload visivel

```yaml
id: passo_01_validar_upload_lote
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const tem = /Cadastro Autom[áa]tico|Upload em Massa/i.test(document.body.innerText);\n\
    \  if (!tem) throw new Error('UploadLoteIA documentos nao renderiza');\n  return\
    \ 'F03-02_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml#passo_01_validar_upload_lote
```
