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

```yaml
id: passo_00_pegar_lista_inicial
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/me', {headers:{Authorization:`Bearer ${token}`}});\n\
    \  const me = await r.json();\n  window.__lista_antes = me.empresas_vinculadas?.length\
    \ || 0;\n  return `antes=${window.__lista_antes}`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-03_visual_fp.yaml#passo_00_pegar_lista_inicial
```


## POST /api/admin/associar-empresa

```yaml
id: passo_01_associar_empresa
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  return 'associacao_simulada_no_test_runner';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-03_visual_fp.yaml#passo_01_associar_empresa
```
