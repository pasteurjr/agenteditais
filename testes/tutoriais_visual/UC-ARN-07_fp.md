---
uc_id: UC-ARN-07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml
---

# UC-ARN-07 — Endereco estruturado: 4 campos novos (Fluxo Principal)

> **Origem da observação:** F01-07
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que EmpresaPage tem campos Logradouro/Numero/Complemento/Bairro
separados, e que CEP popula automaticamente via ViaCEP.


## Navega para EmpresaPage

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: navegacao
  url: /empresa
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_00_navegar_empresa
```


## Logradouro, Numero, Complemento, Bairro presentes

```yaml
id: passo_01_verificar_4_campos
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const txt = document.body.innerText;\n  const faltando\
    \ = [];\n  for (const campo of ['Logradouro', 'Número', 'Complemento', 'Bairro'])\
    \ {\n    if (!txt.includes(campo)) faltando.push(campo);\n  }\n  if (faltando.length)\
    \ throw new Error(`Campos faltando: ${faltando.join(', ')}`);\n  return 'F01-07_4_campos_OK';\n\
    }\n"
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_01_verificar_4_campos
```


## SQL confirma colunas no banco

```yaml
id: passo_02_verificar_dados_no_banco
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/crud/empresas?limit=1', {headers:{Authorization:`Bearer\
    \ ${token}`}});\n  const data = await r.json();\n  const e = (data.items || [])[0];\n\
    \  if (!e) return 'sem_empresa_ainda';\n  const tem_colunas = 'endereco_numero'\
    \ in e && 'endereco_complemento' in e && 'bairro' in e;\n  if (!tem_colunas) throw\
    \ new Error(`Colunas faltando no JSON: ${Object.keys(e).filter(k=>k.startsWith('endereco_')||k==='bairro')}`);\n\
    \  return `F01-07_banco_OK numero=${e.endereco_numero} complemento=${e.endereco_complemento}\
    \ bairro=${e.bairro}`;\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_02_verificar_dados_no_banco
```
