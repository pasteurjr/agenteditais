---
uc_id: UC-CV11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV11_visual_fp.yaml
---

# UC-CV11 — Analisar riscos do edital via IA (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Click aba 'Riscos'

Tab Riscos.

```yaml
id: passo_00_aba_riscos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Riscos/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba Riscos ausente');
          btn.click();
          return 'aba_riscos';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV11_visual_fp.yaml#passo_00_aba_riscos"
```

## Passo 01 — Click 'Analisar Riscos' — POST /analisar-riscos (IA)

**EFEITO REAL:** POST retorna 200/201 com lista de riscos. Tela mostra cards/lista.

```yaml
id: passo_01_clicar_analisar_riscos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Analisar Riscos|Reanalisar Riscos/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Analisar Riscos ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_analisar_riscos';
        }
    - tipo: wait
      valor_literal: 120000
validacao_ref: "testes/casos_de_teste/UC-CV11_visual_fp.yaml#passo_01_clicar_analisar_riscos"
```
