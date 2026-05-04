---
uc_id: UC-CRM04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM04_visual_fp.yaml
---

# UC-CRM04 — Agenda/Timeline de Etapas (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Agenda"

Tab Agenda com timeline de etapas/datas.

**Observe criticamente:**
- Tab Agenda destacada
- Timeline ou lista de itens

```yaml
id: passo_00_aba_agenda
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Agenda/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM04_visual_fp.yaml#passo_00_aba_agenda"
```

## Passo 01 — Validar itens da agenda

Pelo menos 6 itens com datas + badges de urgencia.

**Observe criticamente:**
- Itens visiveis (badge critica/alta/normal/baixa)

```yaml
id: passo_01_validar_itens
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CRM04_visual_fp.yaml#passo_01_validar_itens"
```
