---
uc_id: UC-SC04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SC04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SC04_visual_fp.yaml
---

# UC-SC04 — Tempo Medio do 1o Empenho (ContratadoRealizadoPage) (Fluxo Principal)

> **Predecessores:** UC-CT07
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Contratado X Realizado

Tempo medio do 1o empenho em ContratadoRealizadoPage.

```yaml
id: passo_00_navegar_cr
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Contratado X Realizado"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Contratado X Realizado"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-SC04_visual_fp.yaml#passo_00_navegar_cr"
```
