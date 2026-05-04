---
uc_id: UC-ME02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ME02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ME02_visual_fp.yaml
---

# UC-ME02 — Distribuicao Geografica do Mercado (CRMPage aba Mapa) (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Fluxo Comercial > CRM

ME02 expansao na aba Mapa do CRM (Leaflet).

**Observe criticamente:**
- CRMPage carrega

```yaml
id: passo_00_navegar_crm_mapa
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
      seletor: 'button.nav-item:has(.nav-item-label:text-is("CRM"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("CRM"))'
      timeout: 5000
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-ME02_visual_fp.yaml#passo_00_navegar_crm_mapa"
```

## Passo 01 — Click aba Mapa + validar Leaflet

**Validar screenshot:** mapa OSM com circulos por UF (CircleMarker). Tamanho proporcional ao N de editais. Popup ao clicar.

```yaml
id: passo_01_aba_mapa
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Mapa/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-ME02_visual_fp.yaml#passo_01_aba_mapa"
```
