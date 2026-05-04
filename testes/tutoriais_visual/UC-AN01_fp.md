---
uc_id: UC-AN01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AN01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AN01_visual_fp.yaml
---

# UC-AN01 — Funil de Conversao do Pipeline CRM (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Analytics

AnalyticsPage com funil do pipeline.

**Validar screenshot:**
- Cabecalho 'Analytics'
- Funil visualizado (barras decrescentes ou stages)
- Numeros por stage

```yaml
id: passo_00_navegar_analytics
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Analytics"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Analytics"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-AN01_visual_fp.yaml#passo_00_navegar_analytics"
```

## Passo 01 — Validar funil + dados do pipeline

**Validar screenshot:** funil renderizado com stages do pipeline CRM (13 stages da Sprint 5)

```yaml
id: passo_01_validar_funil
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-AN01_visual_fp.yaml#passo_01_validar_funil"
```
