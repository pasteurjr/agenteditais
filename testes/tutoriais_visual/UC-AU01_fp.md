---
uc_id: UC-AU01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AU01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AU01_visual_fp.yaml
---

# UC-AU01 — Consultar Registros de Auditoria (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Setup: navegar Governanca > Auditoria

Sidebar -> Governanca -> Auditoria. AuditoriaPage carrega.

**Observe criticamente:**
- AuditoriaPage com cabecalho
- Tabela de registros de log

```yaml
id: passo_00_navegar_auditoria
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Governanca/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Governanca nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Auditoria"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Auditoria"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-AU01_visual_fp.yaml#passo_00_navegar_auditoria"
```

## Passo 01 — Validar tabela de registros + filtros

**Observe criticamente:**
- Tabela com colunas: usuario, acao, recurso, timestamp, IP
- Filtros: usuario, periodo, tipo de acao

```yaml
id: passo_01_validar_tabela
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-AU01_visual_fp.yaml#passo_01_validar_tabela"
```
