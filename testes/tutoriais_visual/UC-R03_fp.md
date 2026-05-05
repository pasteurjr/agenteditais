---
uc_id: UC-R03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R03_visual_fp.yaml
---

# UC-R03 — Personalizar Descricao Tecnica (Toggle A/B) (Fluxo Principal)

> **Predecessores:** UC-R01
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Click na primeira linha da tabela 'Minhas Propostas'

Abre Card 'Proposta Selecionada' com secoes.

```yaml
id: passo_00_selecionar_proposta
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const tr = document.querySelector('table tbody tr');
          if (!tr) return 'sem_propostas';
          tr.click();
          return 'selecionada';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-R03_visual_fp.yaml#passo_00_selecionar_proposta"
```

## Passo 01 — Localizar secao 'Descricao Tecnica' com toggle Modo

Toggle entre 'edital' (default) e 'personalizado'.

```yaml
id: passo_01_localizar_descricao_tecnica
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-R03_visual_fp.yaml#passo_01_localizar_descricao_tecnica"
```
