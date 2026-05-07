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


## Verifica labels exatos

```yaml
id: passo_00_validar_labels
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const cfg = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Configuracoes|Configurações/i.test(b.textContent || ''));\n \
    \ if (!cfg) throw new Error('Configuracoes nao achado');\n  if (!cfg.classList.contains('expanded'))\
    \ cfg.click();\n  const items = [...document.querySelectorAll('button.nav-item\
    \ .nav-item-label')]\n    .map(e => e.textContent.trim());\n  const esperados\
    \ = ['Empresa', 'Portfolio', 'Parametrizacoes', 'Selecionar Empresa'];\n  const\
    \ faltam = esperados.filter(e => !items.some(i => i === e || i.includes(e)));\n\
    \  if (faltam.length) throw new Error(`Labels faltando: ${faltam.join(', ')}`);\n\
    \  return 'labels_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-05_visual_fp.yaml#passo_00_validar_labels
```
