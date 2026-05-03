---
uc_id: UC-P12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P12_visual_fp.yaml
---

# UC-P12 — Relatorio de Custos e Precos (markdown nova aba) (Fluxo Principal)

> **Predecessores:** UC-P04 OU UC-P05
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar botao "Relatorio de Custos e Precos"

Botao geralmente esta no topo da aba Custos e Precos ou Lances.

**Observe criticamente:**
- Botao 'Relatorio de Custos e Precos' visivel

```yaml
id: passo_00_localizar_botao
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P12_visual_fp.yaml#passo_00_localizar_botao"
```

## Passo 01 — Click "Relatorio de Custos e Precos" (abre nova aba)

Sistema gera markdown e abre em nova aba.

**Observe criticamente:**
- Apos click, popup/nova aba abre com relatorio completo (9 secoes)
- Toolbar permite baixar MD ou PDF

```yaml
id: passo_01_click_relatorio
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Relat[oó]rio de Custos e Pre[cç]os/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_relatorio';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-P12_visual_fp.yaml#passo_01_click_relatorio"
```
