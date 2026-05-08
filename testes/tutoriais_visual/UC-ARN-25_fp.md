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

E2E completo do aceite-ia: endpoint funcional + retorna id + payload completo aceito.


## POST aceite-ia com payload completo retorna 200 + id UUID

> **Validando observação Arnaldo F03-03-e2e** — E2E: upload IA + aceite + log auditoria

F03-03 E2E: POST /api/auditoria/aceite-ia com payload completo (contexto, recurso_id, dados_ia, dados_user). Esperado: 200 + UUID + linha persistida em auditoria_aceite_ia.

**Dados/pré-condições:**
- Endpoint POST /api/auditoria/aceite-ia funcional E2E
- Aceita payload completo: contexto, recurso_id, dados_extraidos_ia, dados_aceitos_user

**Observe criticamente:**
- POST /api/auditoria/aceite-ia com payload completo retorna 200
- Resposta contem id (UUID valido)
- Tabela auditoria_aceite_ia tem nova linha com contexto='arn25_e2e'
- Endpoint funcional E2E confirmado (F03-03)

```yaml
id: passo_00_e2e_aceite
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const recurso_id = `test-${Date.now()}`;\n  const r = await fetch('/api/auditoria/aceite-ia',\
    \ {\n    method: 'POST',\n    headers: {'Content-Type':'application/json', Authorization:`Bearer\
    \ ${token}`},\n    body: JSON.stringify({\n      contexto: 'arn25_e2e', recurso_id,\n\
    \      dados_extraidos_ia: {tipo: 'contrato_social', razao_social: 'Teste E2E'},\n\
    \      dados_aceitos_user: {tipo: 'contrato_social', razao_social: 'Teste E2E'},\n\
    \    }),\n  });\n  if (!r.ok) throw new Error(`E2E falhou: ${r.status}`);\n  const\
    \ data = await r.json();\n  if (!data.id || !/^[0-9a-f-]{36}$/.test(data.id))\
    \ throw new Error(`id invalido: ${JSON.stringify(data)}`);\n  return `F03-03_e2e_OK\
    \ id=${data.id.slice(0,8)} recurso=${recurso_id}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-25_visual_fp.yaml#passo_00_e2e_aceite
```
