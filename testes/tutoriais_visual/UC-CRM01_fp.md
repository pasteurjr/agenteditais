---
uc_id: UC-CRM01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM01_visual_fp.yaml
---

# UC-CRM01 — Pipeline de Cards do CRM (13 stages) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Setup: navegar Fluxo Comercial > CRM

Sidebar -> click CRM. CRMPage carrega com tab Pipeline default.

**Observe criticamente:**
- CRMPage carrega
- Tabs: Pipeline / Parametrizacoes / Mapa / Agenda / KPIs / Decisoes

```yaml
id: passo_00_navegar_crm
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("CRM"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("CRM"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CRM01_visual_fp.yaml#passo_00_navegar_crm"
```

## Passo 01 — Validar Pipeline com 13 cards

Pipeline mostra 13 stages com badges numericos.

**Observe criticamente:**
- Pipeline visivel com cards
- Pelo menos algum card visivel (pode ser <13 se sem dados)

```yaml
id: passo_01_validar_pipeline
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM01_visual_fp.yaml#passo_01_validar_pipeline"
```
