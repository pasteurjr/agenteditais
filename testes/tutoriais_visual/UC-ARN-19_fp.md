---
uc_id: UC-ARN-19
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-19_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml
---

# UC-ARN-19 — Tooltips ricos na coluna Acoes (Fluxo Principal)

> **Origem da observação:** F04-05
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

≥3 botoes da coluna Acoes tem title='...' descritivo (>15 chars).

## EmpresaPage

> **Validando observação Arnaldo F04-05** — Tooltips ricos na coluna Acoes

Tester abre EmpresaPage onde tabela de certidoes mostra coluna Acoes com tooltips.

**Dados/pré-condições:**
- Botoes da coluna Acoes tem attribute title=... com texto >15 chars descritivo
- Anteriormente os tooltips eram curtos ou inexistentes

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
validacao_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml#passo_00_navegar_empresa
```


## ≥1 tooltip rico em algum botao (qualquer pagina) — confirma cultura de tooltip

> **Validando observação Arnaldo F04-05** — Tooltips ricos na coluna Acoes

Confirma F04-05: ≥1 botao da coluna Acoes com tooltip rico (>15 chars descritivo). Antes alguns botoes sem title ou com texto curto.

**Observe criticamente:**
- ≥1 botao com attribute title contendo texto >15 chars
- Tooltips sao descritivos (nao apenas 'Salvar' generico)
- Cultura de tooltip presente na aplicacao

```yaml
id: passo_01_validar_tooltips
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F04-05: >=3 botoes com title >15 chars (descritivo,\
    \ nao \"Salvar\")\n  const botoes = [...document.querySelectorAll('button[title]')];\n\
    \  const titles = botoes.map(b => b.title || '').filter(t => t.length > 0);\n\
    \  const ricos = titles.filter(t => t.length > 15);\n  if (ricos.length < 3) {\n\
    \    throw new Error(`F04-05 incompleto: <3 tooltips ricos. Tem ${ricos.length}\
    \ ricos / ${titles.length} total. Curtos: ${titles.filter(t=>t.length<=15).slice(0,5).join('|')}`);\n\
    \  }\n  return `F04-05_OK ${ricos.length}_tooltips_ricos exemplos: ${ricos.slice(0,3).map(t=>t.slice(0,40)).join('\
    \ || ')}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-19_visual_fp.yaml#passo_01_validar_tooltips
```
