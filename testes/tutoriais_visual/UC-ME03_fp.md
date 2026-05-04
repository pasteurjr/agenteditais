---
uc_id: UC-ME03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ME03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ME03_visual_fp.yaml
---

# UC-ME03 — Participacao de Mercado — Share vs Concorrentes (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Concorrencia

ConcorrenciaPage com share da empresa vs concorrentes.

**Validar screenshot:**
- Cabecalho 'Concorrencia'
- Grafico/tabela de share
- Lista de concorrentes

```yaml
id: passo_00_navegar_concorrencia
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Concorrencia"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Concorrencia"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-ME03_visual_fp.yaml#passo_00_navegar_concorrencia"
```

## Passo 01 — Validar visualizacao de share

**Validar screenshot:** elementos visuais de comparacao (barras/donut/tabela)

```yaml
id: passo_01_validar_share
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-ME03_visual_fp.yaml#passo_01_validar_share"
```
