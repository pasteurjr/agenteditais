---
uc_id: UC-ARN-08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml
---

# UC-ARN-08 — Sidebar persiste preferencia em localStorage (Fluxo Principal)

> **Origem da observação:** F01-08
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Expande secao Cadastros, verifica localStorage tem 'cadastros' na lista,
simula reload, confirma que ainda esta expandido.


## Garante secao Cadastros expandida (idempotente)

> **Validando observação Arnaldo F01-08** — Sidebar persiste preferencia em localStorage

Tester clica secao 'Cadastros' na sidebar para expandir (idempotente: se ja expandido, mantem).

**Dados/pré-condições:**
- Sidebar tem secao 'Cadastros'
- Frontend salva preferencia em localStorage chave 'facilicita_sidebar_sections_v1'

**Observe criticamente:**
- Sidebar tem secao 'Cadastros' clicavel
- Apos clicar, secao expande mostrando subitens
- Classe CSS .expanded eh aplicada apos click

```yaml
id: passo_00_expandir_cadastros
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const cad = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Cadastros/i.test(b.textContent || ''));\n  if (!cad) throw new\
    \ Error('Secao Cadastros nao achada');\n  // Idempotente: garante expanded=true\n\
    \  if (!cad.classList.contains('expanded')) { cad.click(); await new Promise(r=>setTimeout(r,400));\
    \ }\n  // Aguarda transition: ate 20 tentativas\n  for (let i = 0; i < 20; i++)\
    \ {\n    if (cad.classList.contains('expanded')) break;\n    await new Promise(r=>setTimeout(r,100));\n\
    \  }\n  if (!cad.classList.contains('expanded')) throw new Error(`Cadastros nao\
    \ expandiu. classes: ${cad.className}`);\n  return 'cadastros_expandido_OK';\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml#passo_00_expandir_cadastros
```


## localStorage facilicita_sidebar_sections_v1 contem 'cadastros'

> **Validando observação Arnaldo F01-08** — Sidebar persiste preferencia em localStorage

Confirma F01-08: preferencia de secoes expandidas persiste em localStorage chave 'facilicita_sidebar_sections_v1'. Reload da pagina mantem estado.

**Observe criticamente:**
- localStorage tem chave 'facilicita_sidebar_sections_v1'
- Valor eh JSON valido (array de strings)
- Array contem 'cadastros' apos expandir (persistencia funciona)
- Reload da pagina mantem secao expandida

```yaml
id: passo_01_verificar_localstorage
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F01-08: chave EXATA confirmada via DOM real: 'facilicita_sidebar_sections_v1'\n\
    \  const v = localStorage.getItem('facilicita_sidebar_sections_v1');\n  if (!v)\
    \ throw new Error('localStorage NAO tem chave facilicita_sidebar_sections_v1 —\
    \ F01-08 nao implementado');\n  let arr;\n  try { arr = JSON.parse(v); } catch\
    \ { throw new Error(`localStorage nao eh JSON valido: ${v}`); }\n  if (!Array.isArray(arr))\
    \ throw new Error(`Esperado Array, achou ${typeof arr}: ${v}`);\n  if (!arr.includes('cadastros'))\
    \ {\n    throw new Error(`Chave existe mas 'cadastros' NAO esta na lista (esperado\
    \ depois de expandir): ${v}`);\n  }\n  return `F01-08_localStorage_OK array contem\
    \ cadastros: [${arr.join(',')}]`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-08_visual_fp.yaml#passo_01_verificar_localstorage
```
