---
uc_id: UC-ARN-24
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-24_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml
---

# UC-ARN-24 — UNIQUE area/classe + erro amigavel (Fluxo Principal)

> **Origem da observação:** F13-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

POST /api/crud/areas-produto duas vezes com mesmo nome -> 2a retorna 409
com mensagem "Ja existe uma Area com este nome".


## POST area 1 (deve dar 200)

```yaml
id: passo_00_criar_area_1
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/crud/areas-produto', {\n    method: 'POST',\n \
    \   headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},\n\
    \    body: JSON.stringify({nome: 'AREA TESTE ARN24'}),\n  });\n  if (!r.ok &&\
    \ r.status !== 409) throw new Error(`POST 1 falhou: ${r.status}`);\n  window.__arn24_id\
    \ = (await r.json()).id;\n  return r.status === 409 ? 'ja_existe' : 'criada';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_00_criar_area_1
```


## POST area duplicada (deve dar 409)

```yaml
id: passo_01_criar_area_duplicada
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/crud/areas-produto', {\n    method: 'POST',\n \
    \   headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},\n\
    \    body: JSON.stringify({nome: 'AREA TESTE ARN24'}),\n  });\n  if (r.status\
    \ !== 409) throw new Error(`Esperado 409, achou ${r.status}`);\n  const data =\
    \ await r.json();\n  if (!/Area|UNIQUE|unicidade|j[áa] existe/i.test(data.error\
    \ || '')) {\n    throw new Error(`Mensagem nao amigavel: ${data.error}`);\n  }\n\
    \  return `F13-01_unique_OK msg=\"${(data.error || '').slice(0,80)}\"`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_01_criar_area_duplicada
```


## Apaga a area de teste

```yaml
id: passo_02_cleanup
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  if (!window.__arn24_id) return 'sem_id_skip';\n\
    \  const token = localStorage.getItem('editais_ia_access_token');\n  await fetch(`/api/crud/areas-produto/${window.__arn24_id}`,\
    \ {\n    method: 'DELETE',\n    headers: {Authorization:`Bearer ${token}`}\n \
    \ });\n  return 'cleanup_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_02_cleanup
```
