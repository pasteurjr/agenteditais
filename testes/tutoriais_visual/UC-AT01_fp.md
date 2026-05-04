---
uc_id: UC-AT01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AT01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AT01_visual_fp.yaml
---

# UC-AT01 — Buscar Atas no PNCP (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Setup: navegar Fluxo Comercial > Atas de Pregao

Sidebar -> click Atas de Pregao. AtasPage carrega.

**Observe criticamente:**
- AtasPage carrega
- Tabs: Buscar / Extrair / Minhas Atas / Saldo ARP

```yaml
id: passo_00_navegar_atas
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Atas de Pregao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Atas de Pregao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-AT01_visual_fp.yaml#passo_00_navegar_atas"
```

## Passo 01 — Permanecer na tab Buscar (default)

Tab Buscar tem campo de busca + botao Buscar.

**Observe criticamente:**
- Tab Buscar ativa
- Campo de termo + botao Buscar

```yaml
id: passo_01_aba_buscar
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-AT01_visual_fp.yaml#passo_01_aba_buscar"
```
