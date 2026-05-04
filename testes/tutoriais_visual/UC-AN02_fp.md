---
uc_id: UC-AN02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AN02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AN02_visual_fp.yaml
---

# UC-AN02 — Taxas de Conversao Detalhadas (Fluxo Principal)

> **Predecessores:** UC-AN01
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Localizar aba/secao de taxas

**Validar screenshot:** percentuais de conversao stage->stage (ex: Em Analise -> Proposta = 65%)

```yaml
id: passo_00_aba_taxas
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Taxas|Conversao/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AN02_visual_fp.yaml#passo_00_aba_taxas"
```
