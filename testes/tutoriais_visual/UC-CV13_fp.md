---
uc_id: UC-CV13
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV13_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV13_visual_fp.yaml
---

# UC-CV13 — Gerar Resumo IA do edital (chat) (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Click aba 'IA' / 'Resumo'

Tab IA.

```yaml
id: passo_00_aba_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^IA(\s|$)|Resumo IA/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba IA ausente');
          btn.click();
          return 'aba_ia';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV13_visual_fp.yaml#passo_00_aba_ia"
```

## Passo 01 — Click 'Gerar Resumo' — POST /api/chat (DeepSeek)

**EFEITO REAL:** POST /api/chat retorna 200 com resumo textual.

```yaml
id: passo_01_clicar_gerar_resumo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Gerar Resumo|Resumir Edital/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Gerar Resumo ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_gerar_resumo';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-CV13_visual_fp.yaml#passo_01_clicar_gerar_resumo"
```
