---
uc_id: UC-ARN-04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml
---

# UC-ARN-04 — CNPJ readonly apos empresa salva (Fluxo Principal)

> **Origem da observação:** F01-04
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Cria empresa, recarrega EmpresaPage e verifica que input CNPJ esta disabled.


## Navega para EmpresaPage

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: navegacao
  url: /empresa
validacao_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml#passo_00_navegar_empresa
```


## Confere disabled no CNPJ se empresa ja salva

```yaml
id: passo_01_verificar_cnpj_readonly
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const labels = [...document.querySelectorAll('label')];\n\
    \  const cnpj = labels.find(l => /^\\s*CNPJ/i.test(l.textContent || ''));\n  if\
    \ (!cnpj) return 'cnpj_label_nao_achado';\n  const wrapper = cnpj.closest('.form-field')\
    \ || cnpj.parentElement;\n  const input = wrapper.querySelector('input');\n  if\
    \ (!input) throw new Error('Input CNPJ nao encontrado');\n  return input.disabled\
    \ ? 'cnpj_readonly_OK' : 'cnpj_editavel_OK_se_empresa_nova';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml#passo_01_verificar_cnpj_readonly
```
