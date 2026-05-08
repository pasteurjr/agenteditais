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
Confirma que a API faz o filtro server-side.


## GET fontes-certidoes nao retorna UF de outros estados

> **Validando observação Arnaldo F04-01** — Filtro fontes-certidoes por UF da empresa

Confirma F04-01: empresa SP nao ve fontes de outras UFs (filtro server-side). Antes via fontes MG/PR/RS sem filtro.

**Dados/pré-condições:**
- Empresa Bio-Hosp tem UF=SP
- Backend filtra fontes-certidoes server-side: federais (UF NULL) + UF da empresa
- NAO deve retornar fontes UF=MG/PR/RS/etc para empresa SP

**Observe criticamente:**
- Empresa Bio-Hosp tem UF=SP (verificado via /api/empresa/atual)
- GET /api/crud/fontes-certidoes retorna apenas: federais (UF NULL) + UF SP
- ZERO fontes UF=MG, PR, RS ou outras estaduais na resposta

```yaml
id: passo_00_listar_fontes
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  // Pega UF da empresa\n  const r1 = await fetch('/api/auth/user', {headers:{Authorization:`Bearer\
    \ ${token}`}});\n  if (!r1.ok) throw new Error(`/api/auth/user ${r1.status}`);\n\
    \  const u = await r1.json();\n  if (!u.has_empresa) throw new Error('Pre-cond:\
    \ sem empresa');\n  const empresa_uf = (u.empresa.uf || '').toUpperCase();\n \
    \ if (!empresa_uf) throw new Error('Empresa sem UF');\n  // Lista fontes\n  const\
    \ r2 = await fetch('/api/crud/fontes-certidoes?limit=200', {headers:{Authorization:`Bearer\
    \ ${token}`}});\n  if (!r2.ok) throw new Error(`API fontes ${r2.status}`);\n \
    \ const data = await r2.json();\n  const items = data.items || data.dados || [];\n\
    \  const invalidas = items.filter(f => f.uf && f.uf.toUpperCase() !== empresa_uf).map(f\
    \ => `${f.nome||f.id}=${f.uf}`);\n  if (invalidas.length) {\n    throw new Error(`F04-01\
    \ NAO corrigido: empresa UF=${empresa_uf} VE ${invalidas.length} fontes outras\
    \ UFs: ${invalidas.slice(0,5).join('|')}`);\n  }\n  const federais = items.filter(f\
    \ => !f.uf).length;\n  return `F04-01_OK empresa_uf=${empresa_uf} total=${items.length}\
    \ federais=${federais} estaduais_${empresa_uf}=${items.length-federais}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-15_visual_fp.yaml#passo_00_listar_fontes
```
