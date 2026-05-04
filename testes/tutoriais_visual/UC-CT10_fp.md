---
uc_id: UC-CT10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT10_visual_fp.yaml
---

# UC-CT10 — KPIs de Execucao (NOVO V3) (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "KPIs" (de execucao)

Tab KPIs com 6+ stat cards.

**Observe criticamente:**
- Tab KPIs destacada
- Stat cards com numeros (pode ter '-' se sem dados)

```yaml
id: passo_00_aba_kpis
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
validacao_ref: "testes/casos_de_teste/UC-CT10_visual_fp.yaml#passo_00_aba_kpis"
```

## Passo 01 — Validar stat cards de KPIs

KPIs: contratos ativos, valor total, % execucao, atrasos, etc.

**Observe criticamente:**
- 6+ stat cards visiveis

```yaml
id: passo_01_validar_kpis
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT10_visual_fp.yaml#passo_01_validar_kpis"
```
