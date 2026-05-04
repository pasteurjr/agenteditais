---
uc_id: UC-MO05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO05_visual_fp.yaml
---

# UC-MO05 — Ver Eventos Capturados por Monitoramento (Fluxo Principal)

> **Predecessores:** UC-MO01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Localizar aba/secao "Eventos"

Lista eventos capturados pelos monitoramentos (novas publicacoes do PNCP).

**Observe criticamente:**
- Tab/secao Eventos visivel
- Cards/linhas de eventos (pode estar vazio)

```yaml
id: passo_00_aba_eventos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Eventos|Capturados/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-MO05_visual_fp.yaml#passo_00_aba_eventos"
```
