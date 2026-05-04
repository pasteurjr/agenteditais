---
uc_id: UC-MO01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO01_visual_fp.yaml
---

# UC-MO01 — Visualizar Dashboard de Monitoramentos Ativos (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Setup: navegar Indicadores > Monitoria

Sidebar -> Indicadores -> Monitoria. MonitoriaPage carrega.

**Observe criticamente:**
- MonitoriaPage com cabecalho
- Lista de monitoramentos ativos (PNCP)

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
validacao_ref: "testes/casos_de_teste/UC-MO01_visual_fp.yaml#passo_00_navegar_monitoria"
```

## Passo 01 — Validar dashboard com monitoramentos

**Observe criticamente:**
- Tabela/cards com monitoramentos (oriundos da Sprint 2 UC-CV06 — pelo menos 1 monitoramento existe da empresa demo herdada)

```yaml
id: passo_01_validar_dashboard
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-MO01_visual_fp.yaml#passo_01_validar_dashboard"
```
