---
uc_id: UC-CRM05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM05_visual_fp.yaml
---

# UC-CRM05 — KPIs do CRM (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "KPIs" (CRM)

Tab KPIs do CRM com 6+ stat cards.

**Observe criticamente:**
- Tab KPIs destacada
- Stat cards visiveis (Em Pipeline, Ganhos, Perdidos, Taxa, etc)

```yaml
id: passo_00_aba_kpis_crm
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^KPIs/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM05_visual_fp.yaml#passo_00_aba_kpis_crm"
```

## Passo 01 — Validar stat cards do CRM

**Observe criticamente:**
- 6+ cards visiveis

```yaml
id: passo_01_validar_kpis
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CRM05_visual_fp.yaml#passo_01_validar_kpis"
```
