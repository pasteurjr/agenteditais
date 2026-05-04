---
uc_id: UC-ME04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ME04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ME04_visual_fp.yaml
---

# UC-ME04 — Detectar Itens Intrusos em Edital via IA (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Validar acao "Detectar Intrusos" (IA)

**COMPORTAMENTO IA**: identifica itens fora do escopo do produto/specs.

**Validar screenshot:**
- Botao 'Detectar Intrusos' OU 'Analisar' presente
- Endpoint disponivel via UI

```yaml
id: passo_00_validar_acao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Detectar Intrusos|Analisar Intrusos|Itens Intrusos/i.test(b.textContent||''));
          return btn ? 'presente' : 'ausente_nesta_pagina';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-ME04_visual_fp.yaml#passo_00_validar_acao"
```
