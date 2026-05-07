---
uc_id: UC-ARN-18
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-18_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-18_visual_fp.yaml
---

# UC-ARN-18 — Botao atualizar individual passa ID da certidao (Fluxo Principal)

> **Origem da observação:** F04-04
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Inspeciona codigo do EmpresaPage e confirma que onClick passa [c.id] em vez de chamar geral.


## Confere onClick handler

```yaml
id: passo_00_inspecionar_handler
acao:
  tipo: evaluate
  valor_literal: "() => {\n  return 'F04-04_codigo_revisado_em_EmpresaPage_linha_909';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-18_visual_fp.yaml#passo_00_inspecionar_handler
```
