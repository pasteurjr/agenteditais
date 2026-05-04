---
uc_id: UC-CT08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT08_visual_fp.yaml
---

# UC-CT08 — Auditoria Empenhos x Faturas x Pedidos (NOVO V3) (Fluxo Principal)

> **Predecessores:** UC-CT07
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Auditoria"

Tab Auditoria com 5 totais e tabela de conciliacao.

**Observe criticamente:**
- Tab Auditoria destacada
- 5 stat cards: Empenhado, Faturado, Pago, Entregue, Saldo

```yaml
id: passo_00_aba_auditoria
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Auditoria/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT08_visual_fp.yaml#passo_00_aba_auditoria"
```

## Passo 01 — Validar cards de totais + botao Exportar CSV

Stats consolidam todas linhas. Botao exporta CSV.

**Observe criticamente:**
- Cards de totais visiveis (mesmo que zerados)
- Botao 'Exportar CSV' presente

```yaml
id: passo_01_validar_cards
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Exportar CSV/i.test(b.textContent||''));
          return btn ? 'csv_presente' : 'sem_csv';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT08_visual_fp.yaml#passo_01_validar_cards"
```
