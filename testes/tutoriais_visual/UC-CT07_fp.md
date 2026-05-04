---
uc_id: UC-CT07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT07_visual_fp.yaml
---

# UC-CT07 — Gestao de Empenhos (NOVO V3) (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Empenhos"

Tab Empenhos com tabela de empenhos do contrato.

**Observe criticamente:**
- Tab Empenhos destacada
- Tabela de empenhos (pode estar vazia)

```yaml
id: passo_00_aba_empenhos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Empenhos/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CT07_visual_fp.yaml#passo_00_aba_empenhos"
```

## Passo 01 — Validar botao "Novo Empenho"

Botao abre modal pra cadastrar empenho.

**Observe criticamente:**
- Botao 'Novo Empenho' presente OU lista de empenhos
- Cada empenho tem badge SEM VALOR se item sem valor unitario

```yaml
id: passo_01_validar_botao_novo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Novo Empenho/i.test(b.textContent||''));
          return btn ? 'presente' : 'ausente (sem contrato)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CT07_visual_fp.yaml#passo_01_validar_botao_novo"
```
