---
uc_id: UC-AN04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AN04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AN04_visual_fp.yaml
---

# UC-AN04 — ROI Estimado do Sistema (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Validar card/secao ROI

**Validar screenshot:** ROI estimado com valor R$ ou % (economia + receita gerada pelo sistema)

```yaml
id: passo_00_validar_roi
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toUpperCase();
          return /ROI|RETORNO/i.test(txt) ? 'roi_visivel' : 'roi_ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-AN04_visual_fp.yaml#passo_00_validar_roi"
```
