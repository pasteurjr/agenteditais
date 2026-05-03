---
uc_id: UC-CV07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV07_visual_fp.yaml
---

# UC-CV07 — Listar editais salvos e selecionar (Fluxo Principal)

> **Cenario:** apos Lote A CV03 ter salvo edital, navega para Fluxo Comercial > Validacao. Lista "Meus Editais" mostra editais salvos. Click no primeiro pra abrir o painel de analise.
>
> **Pre-requisitos:** Lote A executado (CV03 ja persistiu pelo menos 1 edital).

## Passo 00 — Setup: navegar para Validacao

```yaml
id: passo_00_setup_navegar_validacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent || ''));
          if (!fc) throw new Error('Secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Validacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Validacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao"), h2:has-text("Validacao")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_00_setup_navegar_validacao"
```

## Passo 01 — Confirmar lista "Meus Editais" tem dados

GET /api/editais/salvos retorna lista. Tabela renderiza editais salvos.

**Observe criticamente:**
- Card "Meus Editais" presente
- Tabela com pelo menos 1 linha (edital salvo pelo Lote A)

```yaml
id: passo_01_confirmar_lista
acao:
  sequencia:
    - tipo: wait_for
      seletor: '.card-title:has-text("Meus Editais"), h3:has-text("Meus Editais")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'table tbody tr'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_01_confirmar_lista"
```

## Passo 02 — Selecionar primeiro edital

Click na primeira linha pra abrir o painel de analise (tabs Aderencia/Lotes/Documentos/etc).

**Observe criticamente:**
- Apos click, tabs aparecem
- Tab "Aderencia" ativa por default

```yaml
id: passo_02_selecionar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Nenhuma linha de edital');
          tr.scrollIntoView({block: 'center'});
          tr.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Aderencia")), button:has-text("Aderencia")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_02_selecionar_edital"
```
