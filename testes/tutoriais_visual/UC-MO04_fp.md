---
uc_id: UC-MO04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO04_visual_fp.yaml
---

# UC-MO04 — Verificar Pendencias PNCP de Edital (sob demanda) (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Validar acao "Verificar Pendencias PNCP"

Acao por edital salvo, retorna alertas/pendencias do PNCP.

**Observe criticamente:**
- Botao/link 'Verificar Pendencias' OU 'Pendencias PNCP'

```yaml
id: passo_00_validar_acao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Pendencias PNCP|Verificar Pendencias/i.test(b.textContent||''));
          return btn ? 'presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-MO04_visual_fp.yaml#passo_00_validar_acao"
```
