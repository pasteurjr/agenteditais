---
uc_id: UC-ARN-16
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-16_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml
---

# UC-ARN-16 — Label 'Requer credencial' clara (Fluxo Principal)

> **Origem da observação:** F04-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

CRUD fontes-certidoes tem label nova com 'credencial' (nao mais ambiguo).

## CRUD fontes-certidoes

```yaml
id: passo_00_navegar_crud_fontes
acao:
  tipo: navegacao
  url: /crud/fontes-certidoes
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_00_navegar_crud_fontes
```


## Abre form Novo

```yaml
id: passo_01_clicar_novo
acao:
  tipo: click
  seletor: button:has-text("Novo")
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_01_clicar_novo
```


## Label requer_autenticacao contem 'credencial'

```yaml
id: passo_02_verificar_label_clara
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const labels = [...document.querySelectorAll('label')].map(l\
    \ => l.textContent || '');\n  const tem = labels.some(l => /credencial/i.test(l));\n\
    \  if (!tem) throw new Error('Label nao contem \"credencial\"');\n  return 'F04-02_label_clara_OK';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_02_verificar_label_clara
```
