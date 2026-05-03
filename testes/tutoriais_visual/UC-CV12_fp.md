---
uc_id: UC-CV12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV12_visual_fp.yaml
---

# UC-CV12 — Analisar mercado do orgao (Fluxo Principal)

> **PO:** IA processa ~30-180s.

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
          const tab = [...document.querySelectorAll('button')].find(b => /Aderencia|Lotes|Documentos|Riscos|Mercado/i.test(b.textContent || ''));
          if (tab) return 'edital ja selecionado';
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Sem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Abrir aba "Mercado"

```yaml
id: passo_01_abrir_aba_mercado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button.tab-panel-tab, button')];
          const btn = buttons.find(b => /^Mercado\s*$/i.test(b.textContent.trim() || ''));
          if (!btn) throw new Error('Aba Mercado nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_01_abrir_aba_mercado"
```

## Passo 02 — Click "Analisar Mercado" e aguardar IA

POST /api/editais/<id>/analisar-mercado.

```yaml
id: passo_02_analisar_mercado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Analisar Mercado|Reanalisar Mercado/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Analisar Mercado nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_02_analisar_mercado"
```
