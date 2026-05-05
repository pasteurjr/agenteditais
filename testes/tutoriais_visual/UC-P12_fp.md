---
uc_id: UC-P12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P12_visual_fp.yaml
---

# UC-P12 — Relatorio de Custos e Precos (markdown) (Fluxo Principal)

> **Predecessores:** UC-P04 OU P05
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Localizar botao 'Relatorio de Custos e Precos'

Botao no topo da aba Custos ou Lances.

```yaml
id: passo_00_localizar_botao_relatorio
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-P12_visual_fp.yaml#passo_00_localizar_botao_relatorio"
```

## Passo 01 — Click 'Relatorio de Custos e Precos' — abre nova aba

Sistema gera markdown com 9 secoes em popup/nova aba.

```yaml
id: passo_01_click_relatorio
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Relat[oó]rio de Custos e Pre[cç]os/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-P12_visual_fp.yaml#passo_01_click_relatorio"
```
