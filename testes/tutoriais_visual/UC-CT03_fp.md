---
uc_id: UC-CT03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT03_visual_fp.yaml
---

# UC-CT03 — Acompanhar Cronograma de Entregas (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Cronograma"

Tab Cronograma com timeline de entregas planejadas vs realizadas.

**Observe criticamente:**
- Tab Cronograma destacada

```yaml
id: passo_00_aba_cronograma
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Cronograma/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT03_visual_fp.yaml#passo_00_aba_cronograma"
```

## Passo 01 — Validar visualizacao de cronograma

Lista/grafico mostra prazos de entrega.

**Observe criticamente:**
- Cronograma renderizado (pode estar vazio se nao ha contrato selecionado)

```yaml
id: passo_01_validar_visualizacao
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT03_visual_fp.yaml#passo_01_validar_visualizacao"
```
