---
uc_id: UC-SM02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SM02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SM02_visual_fp.yaml
---

# UC-SM02 — Gerenciar Templates de Email (Fluxo Principal)

> **Predecessores:** UC-SM01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Click na aba "Templates"

Templates de email para alertas, notificacoes.

**Observe criticamente:**
- Tab Templates destacada
- Lista de templates

```yaml
id: passo_00_aba_templates
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Templates/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-SM02_visual_fp.yaml#passo_00_aba_templates"
```
