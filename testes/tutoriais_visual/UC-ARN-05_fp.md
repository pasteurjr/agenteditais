---
uc_id: UC-ARN-05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-05_visual_fp.yaml
---

# UC-ARN-05 — Sidebar Configuracoes mantem labels curtos (Fluxo Principal)

> **Origem da observação:** F01-05
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Confirma que sidebar tem itens 'Empresa', 'Portfolio', 'Parametrizacoes', 'Selecionar Empresa'
como labels curtos (compatibilidade com tutoriais existentes).


## Verifica labels exatos na sidebar Configuracoes expandida

> **Validando observação Arnaldo F01-05** — Sidebar Configuracoes mantem labels curtos

Confirma F01-05: sidebar mantem labels curtos (Empresa, Portfolio, Parametrizacoes, Selecionar Empresa) — nao versoes longas com parenteses.

**Dados/pré-condições:**
- Sidebar lateral com secao Configuracoes
- Itens esperados: Empresa, Portfolio, Parametrizacoes, Selecionar Empresa

**Observe criticamente:**
- Sidebar > Configuracoes contem item 'Empresa' (label curto, nao 'Dados da Empresa (visao integrada)')
- Sidebar > Configuracoes contem item 'Portfolio'
- Sidebar > Configuracoes contem item 'Parametrizacoes'
- Sidebar > Configuracoes contem item 'Selecionar Empresa'
- Labels sao curtos, sem texto longo entre parenteses

```yaml
id: passo_00_validar_labels
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  // Garante Configuracoes expandida\n  const cfg\
    \ = [...document.querySelectorAll('button.nav-section-header')]\n    .find(b =>\
    \ /Configura/i.test(b.textContent || ''));\n  if (!cfg) throw new Error('Secao\
    \ Configuracoes nao achada');\n  if (!cfg.classList.contains('expanded')) { cfg.click();\
    \ await new Promise(r=>setTimeout(r,400)); }\n  // Pega itens DEPOIS de expandir\n\
    \  await new Promise(r=>setTimeout(r,200));\n  const all_items = [...document.querySelectorAll('button.nav-item')]\n\
    \    .map(el => el.querySelector('.nav-item-label')?.textContent?.trim() || el.textContent?.trim()\
    \ || '');\n  const esperados = ['Empresa', 'Portfolio', 'Parametrizacoes', 'Selecionar\
    \ Empresa'];\n  const faltam = esperados.filter(e => !all_items.some(i => i ===\
    \ e));\n  if (faltam.length) throw new Error(`Labels faltando em Configuracoes:\
    \ ${faltam.join(', ')}. Encontrados: ${all_items.join('|').slice(0,300)}`);\n\
    \  return `F01-05_OK labels_curtos_OK ${esperados.join('|')}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-05_visual_fp.yaml#passo_00_validar_labels
```
