---
uc_id: UC-FL05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FL05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FL05_visual_fp.yaml
---

# UC-FL05 — Ver Agenda de Disparos (Calendario) (Fluxo Principal)

> **Predecessores:** UC-FL01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Click na aba "Agenda" ou "Calendario"

Mostra calendario de disparos programados.

**Observe criticamente:**
- Tab Agenda/Calendario destacada
- Visualizacao tipo calendario ou timeline

```yaml
id: passo_00_aba_agenda
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Agenda|Calend/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-FL05_visual_fp.yaml#passo_00_aba_agenda"
```

## Passo 01 — Validar visualizacao de calendario

**Observe criticamente:**
- Calendario/timeline renderizado

```yaml
id: passo_01_validar_calendario
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL05_visual_fp.yaml#passo_01_validar_calendario"
```
