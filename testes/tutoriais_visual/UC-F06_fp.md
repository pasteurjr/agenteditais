---
uc_id: UC-F06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F06_visual_fp.yaml
---

# UC-F06 — Listar, filtrar e inspecionar produtos (Fluxo Principal)

> **Cenario:** apos UC-F07/F08, navega para Portfolio > Meus Produtos. Filtra por Area "Equipamentos Medico-Hospitalares" (criada via F13). Click no primeiro produto para abrir card "Detalhes".
>
> **Pre-requisitos:** UC-F07 ou UC-F08 ja executado, UC-F13 ja executado.

## Passo 00 — Setup: navegar para Portfolio > Meus Produtos

```yaml
id: passo_00_setup_navegar_meus_produtos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const cfg = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => {
              const t = b.querySelector('.nav-section-label')?.textContent.trim();
              return t === 'Configuracoes' || t === 'Configurações';
            });
          if (!cfg) throw new Error('secao Configuracoes nao encontrada');
          if (!cfg.classList.contains('expanded')) cfg.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.ptab.active:has-text("Meus Produtos")'
      timeout: 15000
    - tipo: wait_for
      seletor: 'table tbody tr button[title="Visualizar"]'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F06_visual_fp.yaml#passo_00_setup_navegar_meus_produtos"
```

## Passo 01 — Filtrar por Area

Filtra a lista por Area selecionando "Equipamentos..." no select.

**Observe criticamente:**
- Select "Area" muda valor
- Lista de produtos pode reduzir (ou continuar igual se todos pertencem a essa area)
- Filtros de Classe e Subclasse podem habilitar

```yaml
id: passo_01_filtrar_area
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Acha label "Área:" e seu select irmao
          const labels = [...document.querySelectorAll('label')];
          const lbl = labels.find(l => /Área|Area/i.test(l.textContent || ''));
          if (!lbl) throw new Error('Label Area nao encontrado');
          const sel = lbl.parentElement.querySelector('select');
          if (!sel) throw new Error('Select Area nao encontrado');
          // Pega primeira option nao vazia
          const op = [...sel.options].find(o => o.value && o.text && /Equipamentos|Diagnostico|Medico/i.test(o.text));
          if (!op) throw new Error('Nenhuma area do dataset disponivel no select');
          sel.value = op.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return 'filtrado: ' + op.text;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-F06_visual_fp.yaml#passo_01_filtrar_area"
```

## Passo 02 — Selecionar primeiro produto e ver detalhes

Click no primeiro produto da grade filtrada para abrir card "Detalhes".

**Observe criticamente:**
- Card "Detalhes: {nome}" aparece
- Mostra dados completos do produto

```yaml
id: passo_02_inspecionar_produto
acao:
  sequencia:
    # Reseta TODOS os selects de filtro com value preenchido — solucao
    # robusta sem depender de match exato do label
    - tipo: evaluate
      valor_literal: |
        () => {
          // Pega selects que estao no header de filtros (geralmente proximos
          // ao FilterBar/searchInput, antes do <table>)
          const table = document.querySelector('table');
          if (!table) return 'sem table';
          const selects = [...document.querySelectorAll('select')].filter(s => {
            // Apenas selects ANTES da table no DOM
            return s.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING;
          });
          let resetados = 0;
          for (const sel of selects) {
            if (sel.value && sel.value !== '') {
              sel.value = '';
              sel.dispatchEvent(new Event('change', {bubbles: true}));
              resetados++;
            }
          }
          return `${resetados} filtros resetados`;
        }
    - tipo: wait
      valor_literal: 800
    # Aguarda grade renderizar
    - tipo: wait_for
      seletor: 'table tbody tr button[title="Visualizar"]'
      timeout: 10000
    # Click no botao "Visualizar" da primeira linha
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('table tbody tr button[title="Visualizar"]')];
          if (!buttons.length) throw new Error('Nenhum botao Visualizar na grade');
          buttons[0].scrollIntoView({block: 'center'});
          buttons[0].click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: '.card-title:has-text("Detalhes:"), h3:has-text("Detalhes:")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F06_visual_fp.yaml#passo_02_inspecionar_produto"
```
