---
uc_id: UC-CT09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT09_visual_fp.yaml
---

# UC-CT09 — Contratos a Vencer (NOVO V3) (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Vencimentos"

Tab Vencimentos com 5 cards (90d, 30d, em tratativa, renovado, nao renovado).

**Observe criticamente:**
- Tab Vencimentos destacada
- 5 cards de tier

```yaml
id: passo_00_aba_vencimentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Vencimentos/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT09_visual_fp.yaml#passo_00_aba_vencimentos"
```

## Passo 01 — Validar 5 tiers de vencimento

Cada tier mostra contagem + lista de contratos.

**Observe criticamente:**
- 5 cards de tier visiveis

```yaml
id: passo_01_validar_tiers
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT09_visual_fp.yaml#passo_01_validar_tiers"
```
