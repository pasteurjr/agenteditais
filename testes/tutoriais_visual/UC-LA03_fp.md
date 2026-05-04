---
uc_id: UC-LA03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA03_visual_fp.yaml
---

# UC-LA03 — Sala Virtual de Disputa (LancesPage + Simulador) (Fluxo Principal)

> **Predecessores:** UC-CV03 + Simulador
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Fluxo Comercial > Disputa Lances

LancesPage = sala virtual de pregao.

**Validar screenshot:** Cabecalho com 'Lances' OU 'Disputa' visivel.

```yaml
id: passo_00_navegar_lances
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Disputa Lances"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Disputa Lances"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-LA03_visual_fp.yaml#passo_00_navegar_lances"
```

## Passo 01 — Validar elementos da Sala Virtual

Tabela de lances + ranking + cronometro.

**Validar screenshot:** elementos de sala virtual presentes (lista de pregoes, status, ranking).

```yaml
id: passo_01_validar_sala
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-LA03_visual_fp.yaml#passo_01_validar_sala"
```
