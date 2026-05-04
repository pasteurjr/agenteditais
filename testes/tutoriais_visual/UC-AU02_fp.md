---
uc_id: UC-AU02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AU02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AU02_visual_fp.yaml
---

# UC-AU02 — Investigar Alteracoes Sensiveis em Parametrizacoes (Fluxo Principal)

> **Predecessores:** UC-AU01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Aplicar filtro "alteracoes sensiveis"

Filtra log para mostrar apenas alteracoes em parametros criticos (pesos, score, RNs).

**Observe criticamente:**
- Filtro 'Sensiveis' OU 'Parametrizacoes' disponivel
- Tabela mostra diff antes/depois

```yaml
id: passo_00_filtrar_sensiveis
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Sensiv|Parametriz/i.test(b.textContent||''));
          return btn ? 'filtro_presente' : 'filtro_via_select';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-AU02_visual_fp.yaml#passo_00_filtrar_sensiveis"
```
