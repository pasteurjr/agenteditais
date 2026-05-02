---
uc_id: UC-CV05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV05_visual_fp.yaml
---

# UC-CV05 — Exportar resultados (Fluxo Principal)

> **Cenario:** apos UC-CV01 ter buscado, click no botao "Exportar CSV". Frontend gera CSV client-side e dispara download (sem chamada de rede).
>
> **Pre-requisitos:** UC-CV01.

## Passo 00 — Confirmar grade na CaptacaoPage

```yaml
id: passo_00_confirmar_grade
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'table tbody tr, .edital-card'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV05_visual_fp.yaml#passo_00_confirmar_grade"
```

## Passo 01 — Click "Exportar CSV"

Sem rede. Sucesso = botao foi clicado e nao deu erro JS.

**Observe criticamente:**
- Botao "Exportar CSV" presente
- Click nao dispara erro

```yaml
id: passo_01_exportar_csv
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Exportar CSV/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Exportar CSV nao encontrado');
          btn.scrollIntoView({block: 'center'});
          // Mock anchor.click pra nao baixar arquivo de verdade
          const origClick = HTMLAnchorElement.prototype.click;
          HTMLAnchorElement.prototype.click = function() { console.log('CSV export click intercepted'); };
          try { btn.click(); } finally {
            setTimeout(() => { HTMLAnchorElement.prototype.click = origClick; }, 100);
          }
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-CV05_visual_fp.yaml#passo_01_exportar_csv"
```
