---
uc_id: UC-CL03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CL03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CL03_visual_fp.yaml
---

# UC-CL03 — Visualizar Classes no Portfolio (Fluxo Principal)

> **Predecessores:** UC-CL01
> **Sprint:** 8 — Dispensas, Classes IA, Mascaras
> **Validacao screenshots:** cada passo captura before/after para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Configuracoes > Portfolio

PortfolioPage com produtos da empresa.

**Validar screenshot:**
- PortfolioPage carregada
- Coluna 'Classe' nos produtos

```yaml
id: passo_00_navegar_portfolio
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Configuracoes/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Configuracoes nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CL03_visual_fp.yaml#passo_00_navegar_portfolio"
```

## Passo 01 — Validar coluna "Classe" presente

**Validar screenshot:**
- Tabela com coluna Classe + valores (ou '-' se sem classe)

```yaml
id: passo_01_validar_classe_coluna
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '');
          const tem = /Classe|Categoria/i.test(txt);
          return tem ? 'classe_visivel' : 'classe_ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CL03_visual_fp.yaml#passo_01_validar_classe_coluna"
```
