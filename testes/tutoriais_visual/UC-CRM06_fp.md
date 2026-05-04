---
uc_id: UC-CRM06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM06_visual_fp.yaml
---

# UC-CRM06 — Registrar Decisao de Nao-Participacao (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Decisoes"

Tab Decisoes lista decisoes de declinar/nao participar.

**Observe criticamente:**
- Tab Decisoes destacada
- Lista de decisoes registradas

```yaml
id: passo_00_aba_decisoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Decis/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM06_visual_fp.yaml#passo_00_aba_decisoes"
```

## Passo 01 — Validar lista/tabela de decisoes

Cada decisao tem motivo + justificativa (>=20 chars).

**Observe criticamente:**
- Lista visivel (pode estar vazia se nao ha decisoes)

```yaml
id: passo_01_validar_lista
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CRM06_visual_fp.yaml#passo_01_validar_lista"
```
