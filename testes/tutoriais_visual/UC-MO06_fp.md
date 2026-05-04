---
uc_id: UC-MO06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO06_visual_fp.yaml
---

# UC-MO06 — Tratar Monitoramentos com Erro (Fluxo Principal)

> **Predecessores:** UC-MO01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Validar tratamento de monitoramentos com erro

Monitoramentos com erro devem ter badge vermelho + acao 'Reprocessar'.

**Observe criticamente:**
- Badges de status (ativo/erro/pausado)
- Botao 'Reprocessar' aparece em itens com erro (FE valido se nao ha erros)

```yaml
id: passo_00_validar_estado_erro
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Reprocessar|Tentar Novamente/i.test(b.textContent||''));
          return btn ? 'reprocessar_disponivel' : 'sem_erros_atualmente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-MO06_visual_fp.yaml#passo_00_validar_estado_erro"
```
