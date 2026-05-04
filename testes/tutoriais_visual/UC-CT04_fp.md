---
uc_id: UC-CT04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT04_visual_fp.yaml
---

# UC-CT04 — Gestao de Aditivos (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Aditivos"

Tab Aditivos com lista de termos aditivos do contrato.

**Observe criticamente:**
- Tab Aditivos destacada

```yaml
id: passo_00_aba_aditivos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Aditivos/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT04_visual_fp.yaml#passo_00_aba_aditivos"
```

## Passo 01 — Validar botao Novo Aditivo

Botao abre modal pra registrar aditivo (prazo/valor/objeto).

**Observe criticamente:**
- Botao 'Novo Aditivo' OU lista visivel

```yaml
id: passo_01_validar_botao
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT04_visual_fp.yaml#passo_01_validar_botao"
```
