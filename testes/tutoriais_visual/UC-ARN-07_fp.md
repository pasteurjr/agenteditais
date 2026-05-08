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
como inputs separados, e que SQL/API confirma colunas no banco.


## Navega para EmpresaPage via sidebar

> **Validando observação Arnaldo F01-07** — Endereco estruturado: 4 campos novos

Tester abre Sidebar > Configuracoes > Empresa. Tela carrega com dados Bio-Hosp e secao Endereco com 4 campos.

**Dados/pré-condições:**
- Empresa Bio-Hosp herdada Sprint 1 V7 com endereco preenchido
- Migration 051 aplicada (endereco_numero, endereco_complemento, bairro)
- EmpresaPage com 4 inputs separados de endereco

**Observe criticamente:**
- EmpresaPage abre com dados Bio-Hosp
- Secao 'Endereco' visivel apos 'Presenca Digital'

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const sec = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Configura/i.test(b.textContent || ''));\n  if (!sec) throw new\
    \ Error('Secao \"Configura\" nao achada');\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  const it = [...document.querySelectorAll('button.nav-item')]\n\
    \    .find(el => /^\\s*Empresa\\s*$/i.test(el.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!it) throw new Error('Item \"Empresa\" nao achado em \"Configura\"\
    ');\n  it.click();\n  await new Promise(r => setTimeout(r, 1500));\n  return 'navegou_2niveis_Configura_Empresa';\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_00_navegar_empresa
```


## F01-07: 4 campos de endereço (Logradouro/Número/Complemento/Bairro) com INPUTS

> **Validando observação Arnaldo F01-07** — Endereco estruturado: 4 campos novos

Antes (V6) endereco era um campo unico. Arnaldo pediu (F01-07) 4 campos estruturados separados. Verifica que existem 4 inputs (nao so labels).

**Observe criticamente:**
- Campo 'Logradouro' tem input separado (largo, linha inteira)
- Campo 'Numero' tem input proprio (curto, lado direito)
- Campo 'Complemento (opcional)' tem input separado
- Campo 'Bairro' tem input separado abaixo
- Cada campo aceita digitacao independente
- Layout em form-grid (2+ colunas) — nao uma textarea unica

```yaml
id: passo_01_verificar_4_campos
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F01-07: 4 inputs separados (nao apenas labels). Labels\
    \ reais: 'Logradouro (Rua/Avenida)', 'Número', 'Complemento (opcional)', 'Bairro'\n\
    \  const labels = [...document.querySelectorAll('label')];\n  const map = {\n\
    \    'Logradouro': /Logradouro/i,\n    'Numero': /^\\s*N[uú]mero\\s*$/i,\n   \
    \ 'Complemento': /Complemento/i,\n    'Bairro': /^\\s*Bairro\\s*$/i,\n  };\n \
    \ const faltam = [];\n  const ok = [];\n  for (const [nome, re] of Object.entries(map))\
    \ {\n    const lbl = labels.find(l => re.test(l.textContent || ''));\n    if (!lbl)\
    \ { faltam.push(nome+'_label'); continue; }\n    const wrapper = lbl.closest('.form-field')\
    \ || lbl.parentElement;\n    const inp = wrapper?.querySelector('input, textarea');\n\
    \    if (!inp) { faltam.push(nome+'_input'); continue; }\n    ok.push(`${nome}=${inp.tagName.toLowerCase()}(${(inp.value||'').slice(0,15)})`);\n\
    \  }\n  if (faltam.length) throw new Error(`F01-07 incompleto. Faltando: ${faltam.join(',\
    \ ')}`);\n  return `F01-07_4_inputs_OK ${ok.join(' | ')}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_01_verificar_4_campos
```


## F01-07 banco: API GET /api/crud/empresas retorna 3 colunas novas

> **Validando observação Arnaldo F01-07** — Endereco estruturado: 4 campos novos

Migration 051 adicionou 3 colunas. Confirma E2E que API retorna esses campos no JSON (form -> banco -> API).

**Observe criticamente:**
- API retorna campo endereco_numero (string ou null)
- API retorna campo endereco_complemento (string ou null)
- API retorna campo bairro (string ou null)
- Os valores na API conferem com o que aparece nos inputs da tela

```yaml
id: passo_02_verificar_dados_no_banco
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  // /api/auth/user retorna empresa do user atual (mais simples que /api/crud)\n\
    \  const r = await fetch('/api/auth/user', {headers:{Authorization:`Bearer ${token}`}});\n\
    \  if (!r.ok) throw new Error(`/api/auth/user ${r.status}`);\n  const u = await\
    \ r.json();\n  if (!u.has_empresa) throw new Error('Pre-cond: usuario sem empresa');\n\
    \  const e = u.empresa;\n  const cols = ['endereco_numero', 'endereco_complemento',\
    \ 'bairro'];\n  const faltando = cols.filter(c => !(c in e));\n  if (faltando.length)\
    \ throw new Error(`Colunas faltando no JSON: ${faltando.join(', ')}. Tem: ${Object.keys(e).filter(k=>k.startsWith('endereco_')||k==='bairro').join(',')}`);\n\
    \  return `F01-07_API_OK numero=${e.endereco_numero||'null'} compl=${e.endereco_complemento||'null'}\
    \ bairro=${e.bairro||'null'}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-07_visual_fp.yaml#passo_02_verificar_dados_no_banco
```
