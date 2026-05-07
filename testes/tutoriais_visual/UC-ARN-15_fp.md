---
uc_id: UC-ARN-15
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-15_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-15_visual_fp.yaml
---

# UC-ARN-15 — Filtro fontes-certidoes por UF da empresa (Fluxo Principal)

> **Origem da observação:** F04-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Empresa SP nao deve ver fontes UF=MG/PR/RS no listar fontes-certidoes.


## GET fontes-certidoes

```yaml
id: passo_00_listar_fontes
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/crud/fontes-certidoes?limit=200', {\n    headers:\
    \ {Authorization:`Bearer ${token}`}\n  });\n  const data = await r.json();\n \
    \ const items = data.items || [];\n  const ufs_outras = items.filter(f => f.uf\
    \ && !['SP', '', null].includes(f.uf)).map(f=>f.uf);\n  if (ufs_outras.length)\
    \ throw new Error(`Empresa SP nao deveria ver fontes UF: ${[...new Set(ufs_outras)].join(',')}`);\n\
    \  return `F04-01_filtro_UF_OK ${items.length} fontes (federais sem UF)`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-15_visual_fp.yaml#passo_00_listar_fontes
```
