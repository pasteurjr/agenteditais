---
uc_id: UC-CV10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV10_visual_fp.yaml
---

# UC-CV10 — Confrontar documentacao do edital com empresa via IA (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Click aba 'Documentos'

Tab Documentos ativa.

```yaml
id: passo_00_aba_documentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Documentos/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba Documentos ausente');
          btn.click();
          return 'aba_documentos';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV10_visual_fp.yaml#passo_00_aba_documentos"
```

## Passo 01 — Click 'Identificar Documentos' — POST /extrair-requisitos (IA)

**EFEITO REAL:** POST /extrair-requisitos retorna 200/201 (ou 400 se sem PDF — FE-04 valido).

```yaml
id: passo_01_clicar_identificar_documentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Identificar Documentos|Reidentificar Documentos/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Identificar Documentos ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_identificar';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-CV10_visual_fp.yaml#passo_01_clicar_identificar_documentos"
```
