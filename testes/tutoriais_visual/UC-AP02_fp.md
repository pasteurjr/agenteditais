---
uc_id: UC-AP02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AP02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AP02_visual_fp.yaml
---

# UC-AP02 — Sugestoes da IA Baseadas em Aprendizado (Fluxo Principal)

> **Predecessores:** UC-AP01
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Localizar aba/secao "Sugestoes"

**COMPORTAMENTO IA**: gera sugestoes baseadas em historico de feedbacks aprovados/rejeitados.

**Validar screenshot:** Cards de sugestao com score de confianca

```yaml
id: passo_00_aba_sugestoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Sugest/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AP02_visual_fp.yaml#passo_00_aba_sugestoes"
```
