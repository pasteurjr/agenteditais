---
uc_id: UC-ARN-14
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-14_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-14_visual_fp.yaml
---

# UC-ARN-14 — Aceite IA + log auditoria (Fluxo Principal)

> **Origem da observação:** F03-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

POST /api/auditoria/aceite-ia com auth + tabela auditoria_aceite_ia recebe linha.

## POST aceite-ia

```yaml
id: passo_00_chamar_endpoint
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/auditoria/aceite-ia', {\n    method: 'POST',\n\
    \    headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},\n\
    \    body: JSON.stringify({\n      contexto: 'teste_arn14',\n      dados_extraidos_ia:\
    \ {teste: true},\n      dados_aceitos_user: {teste: true},\n    }),\n  });\n \
    \ if (!r.ok) throw new Error(`POST aceite-ia ${r.status}: ${await r.text()}`);\n\
    \  const data = await r.json();\n  if (!data.id) throw new Error('Endpoint nao\
    \ retornou id');\n  return `F03-03_aceite_OK id=${data.id.slice(0,8)}`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-14_visual_fp.yaml#passo_00_chamar_endpoint
```
