---
uc_id: UC-CV11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV11_visual_fp.yaml
---

# UC-CV11 — Analisar riscos (Fluxo Principal)

> **PO:** IA processa ~30-180s.
>
> **Cenario:** apos CV07 selecionar edital, abre aba "Riscos", click "Analisar Riscos do Edital". Backend chama IA.

## Passo 00 — Confirmar edital selecionado

```yaml
id: passo_00_confirmar_selecionado
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const tab = document.querySelector('button:has-text("Riscos"), button.tab-panel-tab');
          if (tab) return 'edital ja selecionado';
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Sem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV11_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Abrir aba "Riscos"

```yaml
id: passo_01_abrir_aba_riscos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button.tab-panel-tab, button')];
          const btn = buttons.find(b => /^Riscos\s*$/i.test(b.textContent.trim() || ''));
          if (!btn) throw new Error('Aba Riscos nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV11_visual_fp.yaml#passo_01_abrir_aba_riscos"
```

## Passo 02 — Click "Analisar Riscos" e aguardar IA

POST /api/editais/<id>/analisar-riscos com timeout 240s.

```yaml
id: passo_02_analisar_riscos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Analisar Riscos|Reanalisar Riscos/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Analisar Riscos nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV11_visual_fp.yaml#passo_02_analisar_riscos"
```
