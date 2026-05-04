---
uc_id: UC-I02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I02_visual_fp.yaml
---

# UC-I02 — Sugerir Esclarecimento ou Impugnacao (Fluxo Principal)

> **Predecessores:** UC-I01
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Garantir tab Validacao Legal com analise carregada (de I01)

Permanece em ImpugnacaoPage tab Validacao Legal.

**Observe criticamente:**
- Aba Validacao Legal ativa
- Findings de I01 visiveis ou cards de sugestao

```yaml
id: passo_00_garantir_validacao_carregada
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-I02_visual_fp.yaml#passo_00_garantir_validacao_carregada"
```

## Passo 01 — Validar presenca de sugestoes (esclarecimento/impugnacao)

Sistema deve mostrar findings classificados como 'esclarecimento' ou 'impugnacao'.

**Observe criticamente:**
- Cards de sugestao com tipo (esclarecimento/impugnacao)
- Severidade indicada (baixa/media/alta)
- **COMPORTAMENTO IA**: classifica corretamente o tipo de acao recomendada

```yaml
id: passo_01_validar_sugestoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toLowerCase();
          const tem_sug = /esclarecimento|impugna[cç][aã]o|sugest[aã]o/i.test(txt);
          return tem_sug ? 'sugestoes_visiveis' : 'sem_sugestoes_visiveis';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-I02_visual_fp.yaml#passo_01_validar_sugestoes"
```
