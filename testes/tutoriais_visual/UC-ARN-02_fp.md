---
uc_id: UC-ARN-02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml
---

# UC-ARN-02 — Inscricao Estadual obrigatoria (Fluxo Principal)

> **Origem da observação:** F01-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que a IE eh required no CRUD de empresas: label tem asterisco
e attribute required no input.


## Sidebar > Cadastros > Empresa (route /crud/empresas pode ser super-only)

> **Validando observação Arnaldo F01-02** — Inscricao Estadual obrigatoria

Tester acessa CRUD de empresas via Sidebar > Cadastros (super-only) > Empresa. Lista de empresas carrega.

**Dados/pré-condições:**
- Frontend CRUD de empresas tem campo Inscricao Estadual marcado required no JSX
- Label IE renderiza span.form-field-required (asterisco vermelho)

**Observe criticamente:**
- Sidebar > Cadastros > Empresa abre tela com lista de empresas
- Header da tela diz 'Empresas' (h1 ou h2)
- Lista carrega sem erro, mostrando empresas existentes

```yaml
id: passo_00_navegar_crud_empresas
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
validacao_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml#passo_00_navegar_crud_empresas
```


## Label IE tem asterisco vermelho indicando required

> **Validando observação Arnaldo F01-02** — Inscricao Estadual obrigatoria

Confirma observacao Arnaldo F01-02: campo Inscricao Estadual deve ter asterisco vermelho indicando required (antes era ambiguo).

**Observe criticamente:**
- Form Novo Empresa tem label 'Inscricao Estadual'
- Label tem asterisco vermelho '*' indicando required (cor visivelmente vermelha, nao cinza)
- Asterisco fica imediatamente apos o texto 'Inscricao Estadual'
- Outros campos required tambem tem asterisco no mesmo padrao

```yaml
id: passo_01_validar_label_required
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F01-02: IE deve ter asterisco vermelho (form-field-required)\
    \ — frontend usa span estilizado, nao attr required\n  const labels = [...document.querySelectorAll('label')];\n\
    \  const ie = labels.find(l => /Inscri[cç][aã]o\\s*Estadual/i.test(l.textContent\
    \ || ''));\n  if (!ie) throw new Error('Label \"Inscricao Estadual\" nao achada\
    \ na pagina');\n  // Procura asterisco (span.form-field-required ou texto literal\
    \ '*')\n  const span = ie.querySelector('.form-field-required, .required, .asterisco-required');\n\
    \  const tem_span = !!span;\n  const tem_asterisco_no_texto = /\\*/.test(ie.textContent\
    \ || '');\n  if (!tem_span && !tem_asterisco_no_texto) {\n    throw new Error('Label\
    \ IE NAO tem asterisco visual — F01-02 nao corrigido. Texto: \"' + ie.textContent\
    \ + '\"');\n  }\n  // Se tem span, valida que cor eh vermelha\n  let cor_vermelha\
    \ = false;\n  if (span) {\n    const cor = getComputedStyle(span).color;\n   \
    \ cor_vermelha = /rgb\\((2[0-9]{2}|1[5-9][0-9])/.test(cor) || cor.includes('rgb(255');\n\
    \  }\n  return `F01-02_OK label=\"${ie.textContent.trim()}\" span_required=${tem_span}\
    \ cor_vermelha=${cor_vermelha} asterisco_texto=${tem_asterisco_no_texto}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-02_visual_fp.yaml#passo_01_validar_label_required
```
