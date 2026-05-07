---
uc_id: UC-ARN-06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-06_visual_fp.yaml
---

# UC-ARN-06 — Documentos vem do upload IA do cadastro (Fluxo Principal)

> **Origem da observação:** F01-06
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Apos UploadLoteIA contexto=cadastro_empresa, valida que documentos
classificados aparecem em empresa-documentos.


## UploadLoteIA contexto=documentos visivel

```yaml
id: passo_00_validar_componente_upload_documentos
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const tem = /Upload em Massa|Cadastro Autom[áa]tico/i.test(document.body.innerText);\n\
    \  if (!tem) throw new Error('UploadLoteIA documentos nao encontrado');\n  return\
    \ 'ok';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-06_visual_fp.yaml#passo_00_validar_componente_upload_documentos
```
