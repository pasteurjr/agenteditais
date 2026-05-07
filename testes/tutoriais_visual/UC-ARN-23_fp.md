---
uc_id: UC-ARN-23
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-23_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml
---

# UC-ARN-23 — Responsavel: submenu, validade, doc outorga (Fluxo Principal)

> **Origem da observação:** F05-01-02-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que: (1) submenu chama-se 'Responsaveis e Representantes';
(2) form tem campo documento_validade; (3) tem campo documento_path.


## CRUD empresa-responsaveis

```yaml
id: passo_00_navegar_crud_responsaveis
acao:
  tipo: navegacao
  url: /crud/empresa-responsaveis
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_00_navegar_crud_responsaveis
```


## Abre form Novo

```yaml
id: passo_01_clicar_novo
acao:
  tipo: click
  seletor: button:has-text("Novo")
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_01_clicar_novo
```


## 3 campos novos no form

```yaml
id: passo_02_validar_3_novos_campos
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const txt = document.body.innerText;\n  const faltando\
    \ = [];\n  for (const campo of ['Validade', 'outorga', 'caminho']) {\n    if (!new\
    \ RegExp(campo, 'i').test(txt)) faltando.push(campo);\n  }\n  if (faltando.length)\
    \ throw new Error(`Campos faltando: ${faltando.join(', ')}`);\n  return 'F05-02-03_3_campos_OK';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_02_validar_3_novos_campos
```
