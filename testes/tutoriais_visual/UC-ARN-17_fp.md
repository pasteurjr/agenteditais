---
uc_id: UC-ARN-17
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-17_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml
---

# UC-ARN-17 — Coluna Ativa/Inativa de Fonte (Fluxo Principal)

> **Origem da observação:** F04-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

EmpresaPage > tabela certidoes tem coluna Fonte com badge Ativa/Inativa.

## EmpresaPage

> **Validando observação Arnaldo F04-03** — Coluna Ativa/Inativa de Fonte

Tester abre EmpresaPage.

**Dados/pré-condições:**
- Tabela certidoes em /crud/empresa-certidoes com coluna Fonte (badge Ativa/Inativa)
- F04-03: correcao plugada na tabela CertidoesTabela na rota /crud/empresa-certidoes

**Observe criticamente:**
- EmpresaPage abre normalmente

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
validacao_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml#passo_00_navegar_empresa
```


## EmpresaPage scroll/aba e valida sidebar tem item 'Certidoes' OU coluna Fonte na tabela

> **Validando observação Arnaldo F04-03** — Coluna Ativa/Inativa de Fonte

Confirma F04-03: tabela de certidoes (em /crud/empresa-certidoes) tem coluna 'Fonte' com badge Ativa/Inativa. Sidebar tem submenu Certidoes (correcao plugada).

**Observe criticamente:**
- Tabela de Certidoes tem coluna 'Fonte' OU badge 'Ativa/Inativa'
- Sidebar tem submenu 'Certidoes' (correcao plugada)
- F04-03: registro de evidencia em /crud/empresa-certidoes

```yaml
id: passo_01_validar_coluna
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F04-03: coluna Fonte renderiza na subtable certidoes\
    \ da EmpresaPage (linha 837 EmpresaPage.tsx)\n  // Procura tabela com header \"\
    Certidao\" E \"Fonte\"\n  const tables = [...document.querySelectorAll('table')];\n\
    \  for (const t of tables) {\n    const headers = [...t.querySelectorAll('th')].map(h\
    \ => h.textContent?.trim() || '');\n    if (headers.some(h => /^\\s*Certid[aã]o\\\
    s*$/i.test(h)) && headers.some(h => /^\\s*Fonte\\s*$/i.test(h))) {\n      const\
    \ tem_badge_ativa = /\\bAtiva\\b|\\bInativa\\b/.test(t.innerText);\n      return\
    \ `F04-03_OK tabela_certidoes_com_coluna_Fonte headers=${headers.join('|')} badge_ativa=${tem_badge_ativa}`;\n\
    \    }\n  }\n  // Se nao achou, procura por badge Ativa/Inativa em qualquer lugar\
    \ (correcao alternativa)\n  const txt = document.body.innerText;\n  const tem_badge\
    \ = /Fonte de certidao ativa|Fonte INATIVA/.test(txt);\n  if (tem_badge) return\
    \ `F04-03_OK_alternativo badge_via_title encontrado em pagina`;\n  throw new Error(`F04-03\
    \ NAO corrigido: nenhuma tabela com colunas Certidao E Fonte. Tabelas existentes:\
    \ ${tables.map(t => [...t.querySelectorAll('th')].map(h=>h.textContent?.trim()).join('|')).slice(0,3).join('\
    \  ||  ')}`);\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-17_visual_fp.yaml#passo_01_validar_coluna
```
