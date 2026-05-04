---
uc_id: UC-CR03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CR03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CR03_visual_fp.yaml
---

# UC-CR03 — Alertas de Vencimento Multi-tier (Fluxo Principal)

> **Predecessores:** UC-CT09
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Vencimentos" (multi-tier)

Mesma tab de UC-CT09 — 5 tiers de vencimento.

**Observe criticamente:**
- Tab Vencimentos com 5 tiers

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
validacao_ref: "testes/casos_de_teste/UC-CR03_visual_fp.yaml#passo_00_aba_vencimentos"
```

## Passo 01 — Validar tiers como alertas escalonados

Cada tier representa nivel de urgencia (90d -> aviso, 30d -> critico, etc).

**Observe criticamente:**
- 5 cards de tier visiveis

```yaml
id: passo_01_validar_alertas
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CR03_visual_fp.yaml#passo_01_validar_alertas"
```
