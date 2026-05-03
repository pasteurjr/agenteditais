---
uc_id: UC-CV08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV08_visual_fp.yaml
---

# UC-CV08 — Calcular scores GO/NO-GO (Fluxo Principal)

> **PO:** DeepSeek processa ~30-180s.
>
> **Cenario:** apos CV07 selecionar edital, click "Calcular Scores IA". Backend chama DeepSeek e retorna 6 dimensoes + decisao GO/NO-GO baseada nos limiares do UC-F14 (Sprint 1).
>
> **Pre-requisitos:** CV07 (edital selecionado), F14 (limiares).

## Passo 00 — Confirmar edital selecionado e tab Aderencia

```yaml
id: passo_00_confirmar_edital_selecionado
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao")'
      timeout: 10000
    # Se nenhum edital selecionado, seleciona o primeiro
    - tipo: evaluate
      valor_literal: |
        () => {
          const tab = [...document.querySelectorAll('button')].find(b => /Aderencia|Lotes|Documentos|Riscos|Mercado/i.test(b.textContent || ''));
          if (tab) return 'edital ja selecionado';
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Nem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV08_visual_fp.yaml#passo_00_confirmar_edital_selecionado"
```

## Passo 01 — Click "Calcular Scores IA" e aguardar DeepSeek

POST /api/editais/<id>/scores-validacao com timeout 240s.

**Observe criticamente:**
- Botao "Calcular Scores IA" (ou "Recalcular Scores IA") presente
- Backend chama POST /scores-validacao
- Retorna 200 com dimensoes calculadas

```yaml
id: passo_01_calcular_scores
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Calcular Scores IA|Recalcular Scores IA/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Calcular Scores IA nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    # Aguarda DeepSeek (timeout 240s)
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV08_visual_fp.yaml#passo_01_calcular_scores"
```
