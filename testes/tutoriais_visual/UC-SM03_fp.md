---
uc_id: UC-SM03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SM03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SM03_visual_fp.yaml
---

# UC-SM03 — Consultar Fila de Envio e Reenviar Manualmente (Fluxo Principal)

> **Predecessores:** UC-SM01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Click na aba "Fila" ou "Envios"

Fila de emails pendentes/enviados/erro.

**Observe criticamente:**
- Tab Fila/Envios destacada
- Tabela com status (pendente/enviado/erro)
- Botao Reenviar em itens com erro

```yaml
id: passo_00_aba_fila
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Fila|^Envios/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-SM03_visual_fp.yaml#passo_00_aba_fila"
```
