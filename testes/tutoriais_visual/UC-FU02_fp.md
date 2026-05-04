---
uc_id: UC-FU02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FU02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FU02_visual_fp.yaml
---

# UC-FU02 — Configurar Alertas de Prazo (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Alertas"

Tab Alertas mostra regras de notificacao por prazo.

**Observe criticamente:**
- Tab Alertas destacada
- Lista de regras de alerta (D-30/D-15/D-5)

```yaml
id: passo_00_aba_alertas
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Alertas/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-FU02_visual_fp.yaml#passo_00_aba_alertas"
```

## Passo 01 — Validar botao "Atualizar" para recarregar regras

Botao recarrega lista de regras + consolidado de alertas pendentes.

**Observe criticamente:**
- Botao 'Atualizar' presente

```yaml
id: passo_01_validar_botao_atualizar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^Atualizar$/i.test((b.textContent||'').trim()));
          return btn ? 'presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FU02_visual_fp.yaml#passo_01_validar_botao_atualizar"
```
