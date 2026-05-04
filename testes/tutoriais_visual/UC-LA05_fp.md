---
uc_id: UC-LA05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA05_visual_fp.yaml
---

# UC-LA05 — Deteccao Automatica de Abertura de Sessao (MonitoriaPage) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Monitoria

Sistema detecta automaticamente quando edital monitorado abre sessao de disputa.

```yaml
id: passo_00_navegar_monitoria
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Indicadores/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Indicadores nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Monitoria"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Monitoria"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-LA05_visual_fp.yaml#passo_00_navegar_monitoria"
```
