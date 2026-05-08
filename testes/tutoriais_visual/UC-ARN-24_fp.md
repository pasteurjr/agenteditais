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
com mensagem amigavel. Cleanup ao final.


## POST area 1 (deve criar OU ja existir)

> **Validando observação Arnaldo F13-01** — UNIQUE area/classe + erro amigavel

Cria primeira area com nome unico timestamped. Esperado: 200/201 com ID.

**Dados/pré-condições:**
- Migration 053 aplicada (UNIQUE constraint area por empresa)
- Backend retorna mensagem amigavel 'Ja existe uma Area com este nome'

**Observe criticamente:**
- POST /api/crud/areas-produto cria nova area com sucesso (200/201)
- Resposta tem id (UUID) da area criada

```yaml
id: passo_00_criar_area_1
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const nome = `AREA TESTE ARN24 ${Date.now()}`;\n  window.__arn24_nome = nome;\n\
    \  const r = await fetch('/api/crud/areas-produto', {\n    method: 'POST', headers:\
    \ {'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:\
    \ JSON.stringify({nome})\n  });\n  if (!r.ok) throw new Error(`POST 1 falhou:\
    \ ${r.status} ${await r.text().catch(()=>'')}`);\n  const data = await r.json();\n\
    \  if (!data.id) throw new Error('1a area sem id');\n  window.__arn24_id = data.id;\n\
    \  return `area1_criada id=${data.id.slice(0,8)} nome=${nome}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_00_criar_area_1
```


## POST area duplicada retorna erro com mensagem amigavel (status 400 ou 409)

> **Validando observação Arnaldo F13-01** — UNIQUE area/classe + erro amigavel

ESTE E O PASSO CORE DA F13-01. Tenta criar area com mesmo nome. Esperado: 400/409 com mensagem amigavel ('Ja existe uma Area...'). Antes retornava erro tecnico 500.

**Observe criticamente:**
- Tentar criar area com mesmo nome retorna erro 400 ou 409
- Mensagem retornada eh AMIGAVEL: 'Ja existe uma Area com este nome' ou similar
- NAO eh erro tecnico tipo 'IntegrityError UNIQUE constraint'
- F13-01: correcao confirmada (UNIQUE constraint + mensagem amigavel)

```yaml
id: passo_01_criar_area_duplicada
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const nome = window.__arn24_nome;\n  if (!nome) throw new Error('passo_00 falhou');\n\
    \  const r = await fetch('/api/crud/areas-produto', {\n    method: 'POST', headers:\
    \ {'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:\
    \ JSON.stringify({nome})\n  });\n  if (r.status === 200 || r.status === 201) {\n\
    \    throw new Error(`F13-01 NAO corrigido: duplicata aceita (status ${r.status})`);\n\
    \  }\n  if (r.status !== 400 && r.status !== 409) {\n    throw new Error(`F13-01\
    \ status inesperado: ${r.status}`);\n  }\n  const data = await r.json();\n  const\
    \ msg = data.error || data.message || data.detail || '';\n  // Mensagem amigavel\
    \ deve mencionar \"Area\" e \"existe\" ou \"Subclasse\"\n  if (!/^Ja existe.*Area|Ja\
    \ existe.*[áa]rea|Subclasses para variacoes/i.test(msg)) {\n    throw new Error(`F13-01\
    \ status ${r.status} mas mensagem nao amigavel: \"${msg}\"`);\n  }\n  return `F13-01_OK\
    \ status=${r.status} msg_amigavel=\"${msg.slice(0,80)}\"`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_01_criar_area_duplicada
```


## Apaga a area de teste

> **Validando observação Arnaldo F13-01** — UNIQUE area/classe + erro amigavel

Cleanup: deleta a area de teste pra nao poluir banco entre runs.

**Observe criticamente:**
- DELETE /api/crud/areas-produto/<id> remove a area de teste
- Banco volta ao estado anterior

```yaml
id: passo_02_cleanup
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  if (!window.__arn24_id) return 'sem_id';\n  const\
    \ token = localStorage.getItem('editais_ia_access_token');\n  const r = await\
    \ fetch(`/api/crud/areas-produto/${window.__arn24_id}`, {\n    method: 'DELETE',\
    \ headers: {Authorization:`Bearer ${token}`}\n  });\n  return `cleanup status=${r.status}`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-24_visual_fp.yaml#passo_02_cleanup
```
