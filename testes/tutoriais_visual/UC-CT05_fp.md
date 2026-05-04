---
uc_id: UC-CT05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT05_visual_fp.yaml
---

# UC-CT05 — Designar Gestor/Fiscal (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Gestor/Fiscal" (Designacoes)

Tab com lista de designacoes do contrato.

**Observe criticamente:**
- Tab destacada
- Tabela com gestor e fiscal designados

```yaml
id: passo_00_aba_designacoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Gestor.*Fiscal|Designa/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT05_visual_fp.yaml#passo_00_aba_designacoes"
```

## Passo 01 — Validar tabela com designacoes

Mostra cada pessoa designada como gestor/fiscal.

**Observe criticamente:**
- Tabela visivel

```yaml
id: passo_01_validar_lista
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT05_visual_fp.yaml#passo_01_validar_lista"
```
