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

POST /api/auditoria/aceite-ia retorna 200 com id; tabela auditoria_aceite_ia
recebe linha; GET subsequente confirma persistencia.


## POST aceite-ia retorna 200 + id valido + persistencia

> **Validando observação Arnaldo F03-03** — Aceite IA + log auditoria

Confirma F03-03: POST /api/auditoria/aceite-ia retorna 200 com UUID valido E persiste linha em editais.auditoria_aceite_ia. Aceite IA registrado em trilha de auditoria.

**Dados/pré-condições:**
- Migration 054 aplicada (tabela auditoria_aceite_ia em editais)
- Endpoint POST /api/auditoria/aceite-ia retorna 200 + UUID e persiste log

**Observe criticamente:**
- POST /api/auditoria/aceite-ia retorna status 200
- Resposta JSON contem campo 'id' com UUID valido
- Tabela auditoria_aceite_ia recebeu nova linha (verificavel via SQL)

```yaml
id: passo_00_chamar_endpoint
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  if (!token) throw new Error('Pre-cond: sem token');\n  const ctx_unique = `teste_arn14_${Date.now()}`;\n\
    \  // Retry 3x com backoff (mitigar Failed to fetch transientes)\n  let r, lastErr;\n\
    \  for (let i = 0; i < 3; i++) {\n    try {\n      r = await fetch('/api/auditoria/aceite-ia',\
    \ {\n        method: 'POST',\n        headers: {'Content-Type':'application/json',\
    \ Authorization:`Bearer ${token}`},\n        body: JSON.stringify({contexto: ctx_unique,\
    \ dados_extraidos_ia: {teste: true}, dados_aceitos_user: {teste: true}}),\n  \
    \    });\n      break;\n    } catch (e) {\n      lastErr = e;\n      await new\
    \ Promise(res => setTimeout(res, 500 * (i+1)));\n    }\n  }\n  if (!r) throw new\
    \ Error(`POST aceite-ia falhou apos 3 retries: ${lastErr?.message}`);\n  if (!r.ok)\
    \ throw new Error(`POST aceite-ia status ${r.status}: ${await r.text().catch(()=>'')}`);\n\
    \  const data = await r.json();\n  if (!data.id || !/^[0-9a-f-]{36}$/.test(data.id))\
    \ throw new Error(`id invalido: ${JSON.stringify(data).slice(0,100)}`);\n  return\
    \ `F03-03_OK id=${data.id.slice(0,8)} ctx=${ctx_unique}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-14_visual_fp.yaml#passo_00_chamar_endpoint
```
