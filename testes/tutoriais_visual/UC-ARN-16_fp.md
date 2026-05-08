---
uc_id: UC-ARN-16
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-16_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml
---

# UC-ARN-16 — Label 'Requer credencial' clara (Fluxo Principal)

> **Origem da observação:** F04-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Form Novo do CRUD fontes-certidoes tem label nova com 'credencial'.

## CRUD fontes-certidoes

> **Validando observação Arnaldo F04-02** — Label 'Requer credencial' clara

Tester abre Sidebar > Cadastros > Empresa > Fontes de Certidoes. CRUD carrega.

**Dados/pré-condições:**
- CRUD fontes-certidoes acessivel via Sidebar > Cadastros > Empresa > Fontes de Certidoes
- Form Novo tem label com texto 'credencial' (substituiu 'requer_autenticacao' confuso)

**Observe criticamente:**
- Sidebar > Cadastros > Empresa > 'Fontes de Certidoes' abre CRUD
- Header da tela: 'Fontes de Certidoes' ou similar
- Lista de fontes existentes carrega

```yaml
id: passo_00_navegar_crud_fontes
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
    \    .find(el => /^\\s*Fontes de Certidoes\\s*$/i.test(el.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!it) throw new Error('Item \"Fontes de Certidoes\" nao achado\
    \ dentro de \"Empresa\"');\n  it.click();\n  await new Promise(r => setTimeout(r,\
    \ 1500));\n  return 'navegou_3niveis_Cadastros_Empresa_Fontes de Certidoes';\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_00_navegar_crud_fontes
```


## Clica botao Novo (texto pode ser '+ Novo' ou 'Novo')

> **Validando observação Arnaldo F04-02** — Label 'Requer credencial' clara

Tester clica botao '+ Novo' para abrir form de criacao de fonte.

**Observe criticamente:**
- Botao '+ Novo' visivel no canto superior direito
- Apos clicar, form Novo abre (modal/drawer/inline)

```yaml
id: passo_01_clicar_novo
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const btn = [...document.querySelectorAll('button')].find(b\
    \ => /^\\s*\\+?\\s*Novo\\s*$/i.test(b.textContent?.trim() || ''));\n  if (!btn)\
    \ throw new Error('Botao Novo nao encontrado em /crud/fontes-certidoes');\n  btn.click();\n\
    \  await new Promise(r=>setTimeout(r,1000));\n  return 'click_novo_OK';\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_01_clicar_novo
```


## Label 'credencial' presente em algum lugar da pagina (modal ou inline)

> **Validando observação Arnaldo F04-02** — Label 'Requer credencial' clara

Confirma F04-02: form Novo tem label contendo 'credencial' (substituiu rotulo antigo confuso 'requer_autenticacao').

**Observe criticamente:**
- Form Novo tem label contendo a palavra 'credencial' em algum campo
- Ex: 'Requer credencial' ou 'Credencial necessaria'
- Substituiu o label antigo confuso 'requer_autenticacao'

```yaml
id: passo_02_verificar_label_clara
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // Label EXATA no DOM real: \"Requer credencial para\
    \ acessar (marque se NÃO for público)\"\n  const labels = [...document.querySelectorAll('label')].map(l\
    \ => l.textContent?.trim() || '');\n  const lbl_credencial = labels.filter(l =>\
    \ /Requer\\s+credencial\\s+para\\s+acessar/i.test(l));\n  if (lbl_credencial.length\
    \ === 0) {\n    throw new Error(`F04-02 nao corrigido: label especifica \"Requer\
    \ credencial para acessar\" NAO encontrada. Labels: ${labels.slice(0,12).join('\
    \ | ')}`);\n  }\n  return `F04-02_OK label=\"${lbl_credencial[0].slice(0,80)}\"\
    `;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-16_visual_fp.yaml#passo_02_verificar_label_clara
```
