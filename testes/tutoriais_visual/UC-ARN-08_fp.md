---
uc_id: UC-ARN-08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml
---

# UC-ARN-08 — Sidebar persiste preferencia em localStorage (Fluxo Principal)

> **Origem da observação:** F01-08
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Expande secao Cadastros, verifica localStorage, simula reload (re-renderiza),
confirma que ainda esta expandido.


## Expande secao Cadastros

```yaml
id: passo_00_expandir_cadastros
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const cad = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Cadastros/i.test(b.textContent || ''));\n  if (!cad) throw new\
    \ Error('Cadastros nao achado');\n  if (!cad.classList.contains('expanded')) cad.click();\n\
    \  return 'expandido';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml#passo_00_expandir_cadastros
```


## Confere chave facilicita_sidebar_sections_v1

```yaml
id: passo_01_verificar_localstorage
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const v = localStorage.getItem('facilicita_sidebar_sections_v1');\n\
    \  if (!v) throw new Error('localStorage nao tem facilicita_sidebar_sections_v1');\n\
    \  const sections = JSON.parse(v);\n  if (!sections.includes('cadastros')) throw\
    \ new Error(`cadastros nao em ${v}`);\n  return `F01-08_localStorage_OK ${v}`;\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml#passo_01_verificar_localstorage
```
