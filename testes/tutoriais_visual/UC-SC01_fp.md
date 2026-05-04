---
uc_id: UC-SC01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SC01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SC01_visual_fp.yaml
---

# UC-SC01 — Score de Competitividade (PrecificacaoPage + CaptacaoPage) (Fluxo Principal)

> **Predecessores:** UC-CV01 + UC-P11
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Precificacao

Score de competitividade mostrado em PrecificacaoPage.

```yaml
id: passo_00_navegar_precif
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-SC01_visual_fp.yaml#passo_00_navegar_precif"
```
