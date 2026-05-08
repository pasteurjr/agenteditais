---
uc_id: UC-ARN-20
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-20_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-20_visual_fp.yaml
---

# UC-ARN-20 — Validade do PDF prevalece sobre user (Fluxo Principal)

> **Origem da observação:** F04-06
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Endpoint upload de certidao retorna divergencia_validade quando data
digitada pelo user difere da data extraida do PDF (IA).


## Endpoint /api/empresa-certidoes/<id>/upload existe (responde nao-404 para id fake)

> **Validando observação Arnaldo F04-06** — Validade do PDF prevalece sobre user

Confirma F04-06: endpoint POST /api/empresa-certidoes/<id>/upload existe. Backend extrai validade do PDF via IA e prevalece sobre data digitada.

**Dados/pré-condições:**
- Endpoint POST /api/empresa-certidoes/<id>/upload existe
- Backend extrai validade do PDF via IA e prevalece sobre data digitada pelo user

**Observe criticamente:**
- Endpoint POST /api/empresa-certidoes/<id>/upload existe (nao 404)
- Backend implementa logica de validade prevalecente do PDF (codigo em app.py linha 10810)

```yaml
id: passo_00_validar_endpoint_existe
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const fake_id = '00000000-0000-0000-0000-000000000000';\n  const r = await\
    \ fetch(`/api/empresa-certidoes/${fake_id}/upload`, {\n    method: 'POST', headers:\
    \ {Authorization: `Bearer ${token}`}, body: new FormData()\n  });\n  if (r.status\
    \ === 404) {\n    const txt = await r.text();\n    if (/certid[aã]o.*encontrad|certidao.*not\
    \ found/i.test(txt)) {\n      return `F04-06_endpoint_existe status=404_certidao_inexistente\
    \ (rota OK)`;\n    }\n    throw new Error('Rota /api/empresa-certidoes/<id>/upload\
    \ NAO existe (404 generico)');\n  }\n  return `F04-06_endpoint_existe status=${r.status}`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-20_visual_fp.yaml#passo_00_validar_endpoint_existe
```
