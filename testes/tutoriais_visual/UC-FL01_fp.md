---
uc_id: UC-FL01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FL01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FL01_visual_fp.yaml
---

# UC-FL01 — Visualizar Dashboard de Alertas Ativos (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Setup: navegar Indicadores > Flags

Sidebar -> Indicadores -> Flags (alertas). FlagsPage carrega.

**Observe criticamente:**
- FlagsPage com cabecalho
- StatCards de alertas ativos
- Tabela/cards com alertas

```yaml
id: passo_00_navegar_flags
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Flags"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Flags"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-FL01_visual_fp.yaml#passo_00_navegar_flags"
```

## Passo 01 — Validar dashboard de alertas

Pagina mostra alertas ativos (pode estar vazio se sem dados).

**Observe criticamente:**
- Algum stat card visivel (Ativos, Disparados, Silenciados)

```yaml
id: passo_01_validar_dashboard
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-FL01_visual_fp.yaml#passo_01_validar_dashboard"
```
