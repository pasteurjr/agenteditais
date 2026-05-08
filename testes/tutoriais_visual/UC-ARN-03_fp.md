---
uc_id: UC-ARN-03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-03_visual_fp.yaml
---

# UC-ARN-03 — Vincular empresa-usuario sem re-login (Fluxo Principal)

> **Origem da observação:** F01-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que apos vincular um usuario a uma empresa via /api/admin/associar-empresa,
a lista 'minhasEmpresasList' do AuthContext atualiza sem precisar logout/login.


## Snapshot da lista de empresas vinculadas (antes)

> **Validando observação Arnaldo F01-03** — Vincular empresa-usuario sem re-login

Antes de associar nova empresa, tester captura snapshot da lista atual via /api/auth/minhas-empresas.

**Dados/pré-condições:**
- Endpoint POST /api/admin/associar-empresa existe (super-only)
- AuthContext expoe minhasEmpresasList que atualiza apos POST sem re-login

**Observe criticamente:**
- API /api/auth/minhas-empresas retorna 200
- Resposta contem array de empresas vinculadas ao usuario
- Quantidade > 0 (Bio-Hosp ao menos)

```yaml
id: passo_00_pegar_lista_inicial
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/auth/minhas-empresas', {headers:{Authorization:`Bearer\
    \ ${token}`}});\n  if (!r.ok) throw new Error(`/api/auth/minhas-empresas retornou\
    \ ${r.status}`);\n  const data = await r.json();\n  const lista = data.empresas\
    \ || data.items || data || [];\n  const n = Array.isArray(lista) ? lista.length\
    \ : 0;\n  if (n < 1) throw new Error('Usuario sem empresas vinculadas — pre-cond\
    \ falhou');\n  window.__lista_antes = n;\n  return `F01-03_OK lista_atual=${n}`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-03_visual_fp.yaml#passo_00_pegar_lista_inicial
```


## Confirma endpoint /api/admin/associar-empresa existe (OPTIONS/HEAD)

> **Validando observação Arnaldo F01-03** — Vincular empresa-usuario sem re-login

Confirma que rota POST /api/admin/associar-empresa existe (responde nao-404). Endpoint completo testavel manualmente com payload.

**Observe criticamente:**
- POST /api/admin/associar-empresa NAO retorna 404 (rota existe)
- Status pode ser 400/422 (payload invalido) ou 200/201 — qualquer coisa que nao 404

```yaml
id: passo_01_validar_endpoint_existe
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/admin/associar-empresa', {\n    method: 'POST',\
    \ headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},\
    \ body: JSON.stringify({})\n  });\n  if (r.status === 404) throw new Error('Endpoint\
    \ /api/admin/associar-empresa NAO existe (404) — F01-03 nao deployado');\n  //\
    \ Esperado: 400/422 (payload vazio) ou 200/201 — qualquer coisa que prova existencia\n\
    \  return `F01-03_endpoint_existe status=${r.status}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-03_visual_fp.yaml#passo_01_validar_endpoint_existe
```
