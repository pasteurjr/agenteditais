---
uc_id: UC-AN03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AN03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AN03_visual_fp.yaml
---

# UC-AN03 — Tempo Medio entre Etapas do Pipeline (Fluxo Principal)

> **Predecessores:** UC-AN01
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Validar metricas de tempo medio

**Validar screenshot:** dias/horas medios em cada stage

```yaml
id: passo_00_validar_tempos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Tempo|Etapas/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AN03_visual_fp.yaml#passo_00_validar_tempos"
```
