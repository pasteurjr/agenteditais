---
uc_id: UC-CV13
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV13_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV13_visual_fp.yaml
---

# UC-CV13 — Usar IA na validacao: gerar resumo (Fluxo Principal)

> **PO:** DeepSeek processa ~30-180s.

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
validacao_ref: "testes/casos_de_teste/UC-CV13_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Abrir aba "IA"

```yaml
id: passo_01_abrir_aba_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button.tab-panel-tab, button')];
          // Aba "IA" exata (evita match com "IA" em texto longo)
          const btn = buttons.find(b => b.textContent.trim() === 'IA');
          if (!btn) throw new Error('Aba IA nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV13_visual_fp.yaml#passo_01_abrir_aba_ia"
```

## Passo 02 — Click "Gerar Resumo" e aguardar IA

POST /api/chat retorna texto do resumo via DeepSeek.

```yaml
id: passo_02_gerar_resumo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Gerar Resumo/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Gerar Resumo nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV13_visual_fp.yaml#passo_02_gerar_resumo"
```
