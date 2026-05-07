---
uc_id: UC-ARN-25
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-25_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-25_visual_fp.yaml
---

# UC-ARN-25 — E2E: upload IA + aceite + log auditoria (Fluxo Principal)

> **Origem da observação:** F03-03-e2e
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Smoke E2E: aceite-ia endpoint funcional + tabela existe + auth ok.


## E2E aceite IA registra log

```yaml
id: passo_00_e2e_aceite
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/auditoria/aceite-ia', {\n    method: 'POST',\n\
    \    headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},\n\
    \    body: JSON.stringify({\n      contexto: 'arn25_e2e',\n      recurso_id: 'test-'\
    \ + Date.now(),\n      dados_extraidos_ia: {tipo: 'contrato_social', razao_social:\
    \ 'Teste E2E'},\n      dados_aceitos_user: {tipo: 'contrato_social', razao_social:\
    \ 'Teste E2E'},\n    }),\n  });\n  if (!r.ok) throw new Error(`E2E aceite falhou:\
    \ ${r.status}`);\n  const data = await r.json();\n  return `F03-03_e2e_OK id=${data.id?.slice(0,8)}`;\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-25_visual_fp.yaml#passo_00_e2e_aceite
```
