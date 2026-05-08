---
uc_id: UC-ARN-11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml
---

# UC-ARN-11 — Upload em Massa Portfolio por IA (Fluxo Principal)

> **Origem da observação:** F02-03
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

UploadLoteIA contexto=portfolio plugado em PortfolioPage.

## Navega Portfolio

> **Validando observação Arnaldo F02-03** — Upload em Massa Portfolio por IA

Tester abre Sidebar > Configuracoes > Portfolio. PortfolioPage carrega com 3 abas: Produtos, Cadastro por IA, Classificacao.

**Dados/pré-condições:**
- PortfolioPage com aba 'Cadastro por IA' (activeTab='cadastroIA')
- Componente UploadLoteIA contexto=portfolio plugado nessa aba (linha 1184 PortfolioPage.tsx)

**Observe criticamente:**
- Sidebar > Configuracoes > Portfolio abre PortfolioPage
- Tres abas visiveis no topo: 'Produtos', 'Cadastro por IA', 'Classificacao'
- Aba 'Produtos' ativa por default

```yaml
id: passo_00_navegar_portfolio
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const sec = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Configura/i.test(b.textContent || ''));\n  if (!sec) throw new\
    \ Error('Secao \"Configura\" nao achada');\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  const it = [...document.querySelectorAll('button.nav-item')]\n\
    \    .find(el => /^\\s*Portfolio\\s*$/i.test(el.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!it) throw new Error('Item \"Portfolio\" nao achado em \"Configura\"\
    ');\n  it.click();\n  await new Promise(r => setTimeout(r, 1500));\n  return 'navegou_2niveis_Configura_Portfolio';\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml#passo_00_navegar_portfolio
```


## Clica aba 'Cadastro por IA' E confirma UploadLoteIA portfolio renderiza

> **Validando observação Arnaldo F02-03** — Upload em Massa Portfolio por IA

Tester clica aba 'Cadastro por IA'. Componente UploadLoteIA contexto=portfolio aparece (F02-03 plugado em PortfolioPage:1184).

**Observe criticamente:**
- Apos clicar aba 'Cadastro por IA', conteudo muda
- Card '🤖 Upload em Lote por IA (NOVO)' aparece
- Subtitle mencionando 'catalogos/manuais/registros' visivel
- Componente UploadLoteIA renderiza com botao de selecionar arquivos

```yaml
id: passo_01_validar_upload_lote
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  // F02-03: aba \"Cadastro por IA\" deve mostrar\
    \ heading \"Upload em Lote por IA (NOVO)\"\n  const aba = [...document.querySelectorAll('button')].find(b\
    \ => /Cadastro por IA/i.test(b.textContent || ''));\n  if (!aba) throw new Error('Aba\
    \ \"Cadastro por IA\" nao achada em PortfolioPage');\n  aba.click();\n  await\
    \ new Promise(r=>setTimeout(r,800));\n  const txt = document.body.innerText;\n\
    \  const heading_NOVO = /Upload em Lote por IA \\(NOVO\\)/i.test(txt);\n  const\
    \ heading_componente = /Upload em Massa de Portf[óo]lio.*IA classifica.*cat[áa]logos/i.test(txt);\n\
    \  if (!heading_NOVO && !heading_componente) {\n    throw new Error('Aba aberta\
    \ mas headings F02-03 NAO renderizam — UploadLoteIA portfolio nao plugado');\n\
    \  }\n  return `F02-03_OK aba_aberta heading_NOVO=${heading_NOVO} heading_componente=${heading_componente}`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-11_visual_fp.yaml#passo_01_validar_upload_lote
```
