---
uc_id: UC-ARN-02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml
---

# UC-ARN-02 — Inscricao Estadual obrigatoria (Fluxo Principal)

> **Origem da observação:** F01-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que a IE eh required no CRUD de empresas.
Tenta criar empresa SEM IE -> erro 400. Cria COM IE -> 201.


## Navega para CRUD de empresas

```yaml
id: passo_00_navegar_crud_empresas
acao:
  tipo: navegacao
  url: /crud/empresas
validacao_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml#passo_00_navegar_crud_empresas
```


## Label IE tem asterisco

```yaml
id: passo_01_validar_label_required
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const labels = [...document.querySelectorAll('label')];\n\
    \  const ie = labels.find(l => /Inscri[cç][aã]o\\s*Estadual/i.test(l.textContent\
    \ || ''));\n  if (!ie) throw new Error('Label IE nao encontrada');\n  const asterisco\
    \ = ie.querySelector('.form-field-required, .required');\n  if (!asterisco) throw\
    \ new Error('IE nao tem asterisco (nao eh required no front)');\n  return 'ie_eh_required';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml#passo_01_validar_label_required
```
