---
uc_id: UC-CRM02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM02_visual_fp.yaml
---

# UC-CRM02 — Parametrizacoes do CRM (Tipos/Agrupamentos/Motivos) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Parametrizacoes"

Tab com 3 sub-abas: Tipos de Edital, Agrupamentos, Motivos de Derrota.

**Observe criticamente:**
- Tab Parametrizacoes destacada
- Sub-tabs visiveis

```yaml
id: passo_00_aba_param
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Parametriza/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM02_visual_fp.yaml#passo_00_aba_param"
```

## Passo 01 — Validar sub-abas (Tipos / Agrupamentos / Motivos)

**Observe criticamente:**
- Sub-abas Tipos / Agrupamentos / Motivos visiveis
- Cada uma tem lista + botao Novo

```yaml
id: passo_01_validar_subabas
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toLowerCase();
          const tem = /tipos|agrupamentos|motivos/i.test(txt);
          return tem ? 'sub_abas_visiveis' : 'sub_abas_nao_visiveis';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CRM02_visual_fp.yaml#passo_01_validar_subabas"
```
