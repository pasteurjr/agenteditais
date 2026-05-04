---
uc_id: UC-LA01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-LA01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-LA01_visual_fp.yaml
---

# UC-LA01 — Simulador de Lance Deterministico (PrecificacaoPage) (Fluxo Principal)

> **Predecessores:** UC-P07
> **Sprint:** 9 — Lances + Scores + HC
> **Validacao screenshots:** auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Fluxo Comercial > Precificacao

PrecificacaoPage tem o simulador deterministico embutido (calcula cenarios de lance offline).

```yaml
id: passo_00_navegar_precificacao
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
validacao_ref: "testes/casos_de_teste/UC-LA01_visual_fp.yaml#passo_00_navegar_precificacao"
```

## Passo 01 — Validar PrecificacaoPage carregada (simulador embutido)

Tab 'Lances' contem cenarios calculados.

**Validar screenshot:** Tab Lances ou cards de simulacao com cenarios deterministicos.

```yaml
id: passo_01_validar_carregamento
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-LA01_visual_fp.yaml#passo_01_validar_carregamento"
```
