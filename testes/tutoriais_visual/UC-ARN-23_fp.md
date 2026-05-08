---
uc_id: UC-ARN-23
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-23_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml
---

# UC-ARN-23 — Responsavel: submenu, validade, doc outorga (Fluxo Principal)

> **Origem da observação:** F05-01-02-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Form de Novo Responsavel tem 3 campos novos (Validade, outorga, caminho/documento).


## CRUD empresa-responsaveis

> **Validando observação Arnaldo F05-01-02-03** — Responsavel: submenu, validade, doc outorga

Tester abre Sidebar > Cadastros > Empresa > Responsaveis e Representantes. Confirma F05-01 (submenu renomeado).

**Dados/pré-condições:**
- Submenu chama-se 'Responsaveis e Representantes' (antes era 'Responsaveis')
- Form Novo tem 3 campos novos: Validade, doc_outorga, caminho_documento
- Migration 052 aplicada (tabela responsavel_documento)

**Observe criticamente:**
- Sidebar > Cadastros > Empresa > 'Responsaveis e Representantes' abre tela
- Header da tela: 'Responsaveis e Representantes'
- Submenu renomeado de 'Responsaveis' para 'Responsaveis e Representantes' (F05-01)

```yaml
id: passo_00_navegar_crud_responsaveis
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const sec = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Cadastros/i.test(b.textContent || ''));\n  if (!sec) throw new\
    \ Error('Secao \"Cadastros\" nao achada na sidebar');\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  const sub = [...document.querySelectorAll('button.nav-subsection-header')]\n\
    \    .find(b => /^\\s*Empresa\\s*$/i.test(b.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!sub) throw new Error('Subsection \"Empresa\" nao achada (super-only?\
    \ user nao eh super?)');\n  if (!sub.classList.contains('expanded')) { sub.click();\
    \ await new Promise(r=>setTimeout(r,400)); }\n  const it = [...document.querySelectorAll('button.nav-item')]\n\
    \    .find(el => /^\\s*Respons[aá]veis e Representantes|Respons[aá]veis\\s*$/i.test(el.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!it) throw new Error('Item \"Respons[aá]veis e Representantes|Respons[aá]veis\"\
    \ nao achado dentro de \"Empresa\"');\n  it.click();\n  await new Promise(r =>\
    \ setTimeout(r, 1500));\n  return 'navegou_3niveis_Cadastros_Empresa_Respons[aá]veis\
    \ e Representantes|Respons[aá]veis';\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_00_navegar_crud_responsaveis
```


## Clica botao Novo (texto pode ser '+ Novo' ou 'Novo')

> **Validando observação Arnaldo F05-01-02-03** — Responsavel: submenu, validade, doc outorga

Tester clica botao '+ Novo' para abrir form de novo responsavel.

**Observe criticamente:**
- Botao '+ Novo' visivel no canto superior direito
- Apos clicar, form Novo abre

```yaml
id: passo_01_clicar_novo
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const btn = [...document.querySelectorAll('button')].find(b\
    \ => /^\\s*\\+?\\s*Novo\\s*$/i.test(b.textContent?.trim() || ''));\n  if (!btn)\
    \ {\n    const titulos = [...document.querySelectorAll('button')].map(b=>b.textContent?.trim()).filter(t=>t&&t.length<30).slice(0,15);\n\
    \    throw new Error(`Botao Novo nao achado em /crud/empresa-responsaveis. Botoes:\
    \ ${titulos.join('|')}`);\n  }\n  btn.click();\n  await new Promise(r=>setTimeout(r,1500));\n\
    \  return 'click_novo_responsavel_OK';\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_01_clicar_novo
```


## Form (modal/drawer/inline) tem 3 campos novos: Validade, outorga, caminho/documento

> **Validando observação Arnaldo F05-01-02-03** — Responsavel: submenu, validade, doc outorga

Confirma F05-02-03: form tem 3 campos novos (Validade, Documento de outorga, Caminho do documento). Antes faltavam.

**Observe criticamente:**
- Form Novo tem campo 'Validade' (input type=date) — F05-02
- Form Novo tem campo 'Documento de outorga' (campo texto) — F05-03
- Form Novo tem campo 'Caminho do documento' ou similar (path/upload)
- 3 campos antes nao existiam — adicionados pela correcao F05-01-02-03

```yaml
id: passo_02_validar_3_novos_campos
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F05-02-03: form Novo Responsavel deve ter 3 campos\
    \ novos: Validade, doc outorga, caminho/path\n  const labels = [...document.querySelectorAll('label')].map(l\
    \ => l.textContent?.trim() || '');\n  // Procura cada campo novo\n  const validade\
    \ = labels.find(l => /Validade/i.test(l));\n  const outorga = labels.find(l =>\
    \ /outorga|procura[cç][aã]o/i.test(l));\n  const caminho = labels.find(l => /caminho|path|documento|arquivo|certificado/i.test(l));\n\
    \  const faltam = [];\n  if (!validade) faltam.push('Validade');\n  if (!outorga)\
    \ faltam.push('outorga|procuracao');\n  if (!caminho) faltam.push('caminho|documento');\n\
    \  if (faltam.length) {\n    throw new Error(`F05 incompleto. Faltando: ${faltam.join(',\
    \ ')}. Labels visiveis: ${labels.slice(0,15).join(' | ')}`);\n  }\n  return `F05-01-02-03_OK\
    \ Validade=\"${validade}\" outorga=\"${outorga}\" caminho=\"${caminho}\"`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-23_visual_fp.yaml#passo_02_validar_3_novos_campos
```
