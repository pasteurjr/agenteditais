---
uc_id: UC-AT03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AT03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AT03_visual_fp.yaml
---

# UC-AT03 — Dashboard de Atas Consultadas (Fluxo Principal)

> **Predecessores:** UC-AT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Minhas Atas"

Tab com tabela de atas ja consultadas/salvas.

**Observe criticamente:**
- Tab Minhas Atas destacada
- Tabela de atas visivel (pode estar vazia)

```yaml
id: passo_00_aba_minhas
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Minhas Atas/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AT03_visual_fp.yaml#passo_00_aba_minhas"
```

## Passo 01 — Validar tabela de atas

Lista atas com data, orgao, UF, vencedor.

**Observe criticamente:**
- Tabela visivel

```yaml
id: passo_01_validar_tabela
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-AT03_visual_fp.yaml#passo_01_validar_tabela"
```
