---
uc_id: UC-AN05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AN05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AN05_visual_fp.yaml
---

# UC-AN05 — Analise de Perdas com Recomendacoes IA (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Perdas

PerdasPage com analise + recomendacoes IA.

**Validar screenshot:**
- Cabecalho 'Perdas'
- Lista de perdas
- Recomendacoes da IA

```yaml
id: passo_00_navegar_perdas
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Perdas"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Perdas"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-AN05_visual_fp.yaml#passo_00_navegar_perdas"
```

## Passo 01 — Validar recomendacoes IA

**COMPORTAMENTO IA**: gera recomendacoes baseadas em padroes de perda.

**Validar screenshot:** Cards/lista de recomendacoes textuais

```yaml
id: passo_01_validar_recomendacoes
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-AN05_visual_fp.yaml#passo_01_validar_recomendacoes"
```
