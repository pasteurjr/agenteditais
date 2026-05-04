---
uc_id: UC-CRM07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM07_visual_fp.yaml
---

# UC-CRM07 — Registrar Motivo de Perda (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Voltar para tab Pipeline

Motivo de perda registra-se no pipeline em editais perdidos.

**Observe criticamente:**
- Tab Pipeline ativa

```yaml
id: passo_00_voltar_pipeline
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Pipeline/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM07_visual_fp.yaml#passo_00_voltar_pipeline"
```

## Passo 01 — Validar secao de perdidos com botao Registrar Motivo

Pipeline final tem editais classificados como perdidos.

**Observe criticamente:**
- Card 'Perdidos' OU stage final visivel
- Botao 'Registrar Motivo' aparece em editais perdidos (se houver)

```yaml
id: passo_01_validar_pipeline_perdidos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-CRM07_visual_fp.yaml#passo_01_validar_pipeline_perdidos"
```
