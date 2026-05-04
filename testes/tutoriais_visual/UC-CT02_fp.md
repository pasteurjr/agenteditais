---
uc_id: UC-CT02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT02_visual_fp.yaml
---

# UC-CT02 — Registrar Entrega + NF (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Entregas"

Tab Entregas com tabela de entregas + botao Nova Entrega.

**Observe criticamente:**
- Tab Entregas destacada
- Tabela de entregas

```yaml
id: passo_00_aba_entregas
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Entregas/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT02_visual_fp.yaml#passo_00_aba_entregas"
```

## Passo 01 — Validar botao "Nova Entrega"

Botao abre modal pra registrar entrega + NF.

**Observe criticamente:**
- Botao 'Nova Entrega' presente

```yaml
id: passo_01_validar_botao_nova
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Nova Entrega|Registrar Entrega/i.test(b.textContent||''));
          return btn ? 'presente' : 'ausente (FE: sem contrato selecionado)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT02_visual_fp.yaml#passo_01_validar_botao_nova"
```
