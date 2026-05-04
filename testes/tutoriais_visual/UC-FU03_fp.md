---
uc_id: UC-FU03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FU03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FU03_visual_fp.yaml
---

# UC-FU03 — Score Logistico (Historico do Edital) (Fluxo Principal)

> **Predecessores:** UC-FU01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Voltar para tab Resultados

Tab Resultados onde aparece linha do tempo de cada edital.

**Observe criticamente:**
- Tab Resultados ativa

```yaml
id: passo_00_voltar_resultados
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Resultados/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-FU03_visual_fp.yaml#passo_00_voltar_resultados"
```

## Passo 01 — Validar tabela com historico/scores logisticos

Cada edital tem score logistico (entrega/prazo/UF/distancia) calculado.

**Observe criticamente:**
- Tabela de resultados/historicos visivel

```yaml
id: passo_01_validar_tabela
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-FU03_visual_fp.yaml#passo_01_validar_tabela"
```
