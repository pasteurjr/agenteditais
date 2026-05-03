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

## Passo 00 — Garantir uma proposta selecionada (clica primeira linha da tabela)

Click na primeira linha da tabela 'Minhas Propostas' pra abrir o card 'Proposta Selecionada'.

**Observe criticamente:**
- Tabela tem ao menos 1 linha (R01 criou)
- Card 'Proposta Selecionada' aparece embaixo

```yaml
id: passo_00_garantir_proposta_selecionada
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const tr = document.querySelector('table tbody tr');
          if (!tr) return 'sem_propostas';
          tr.click();
          return 'clicada primeira linha';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-R03_visual_fp.yaml#passo_00_garantir_proposta_selecionada"
```

## Passo 01 — Localizar secao "Descricao Tecnica" com Toggle Modo

Card aparece com toggle entre 'edital' e 'personalizado'.

**Observe criticamente:**
- Secao 'Descricao Tecnica' visivel
- Toggle/botao para alternar modo

```yaml
id: passo_01_localizar_secao_descricao
acao:
  sequencia:
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-R03_visual_fp.yaml#passo_01_localizar_secao_descricao"
```
