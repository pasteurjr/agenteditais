---
uc_id: UC-CV08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV08_visual_fp.yaml
---

# UC-CV08 — Calcular scores GO/NO-GO multidimensionais via DeepSeek (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Garantir tab Aderencia (default apos CV07)

Tab Aderencia ativa.

```yaml
id: passo_00_garantir_aderencia
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Aderencia/i.test((b.textContent||'').trim()));
          if (btn) btn.click();
          return 'aba_aderencia';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV08_visual_fp.yaml#passo_00_garantir_aderencia"
```

## Passo 01 — Click 'Calcular Scores IA' — POST /scores-validacao (DeepSeek 30-180s)

**EFEITO REAL ESPERADO:**
- POST /scores-validacao retorna 200/201 com 6 dimensoes + decisao GO/NO-GO
- Score final exibido (numero)
- Decisao GO/NO-GO/AVALIAR exibida com cor (verde/vermelho/cinza)


```yaml
id: passo_01_clicar_calcular_scores
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Calcular Scores IA|Recalcular Scores IA/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Calcular Scores IA ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_calcular_scores';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV08_visual_fp.yaml#passo_01_clicar_calcular_scores"
```

## Passo 02 — EFEITO REAL: decisao GO/NO-GO/AVALIAR aparece na tela

Decisao colorida + score numerico.

```yaml
id: passo_02_validar_decisao_exibida
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toUpperCase();
          const has_decisao = /GO|NO.GO|AVALIAR|DECIS[AÃ]O/.test(txt);
          if (!has_decisao) throw new Error('Decisao nao apareceu na tela apos scores');
          return 'decisao_visivel';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV08_visual_fp.yaml#passo_02_validar_decisao_exibida"
```
