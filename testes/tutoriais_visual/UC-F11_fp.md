---
uc_id: UC-F11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F11_visual_fp.yaml
---

# UC-F11 — Verificar completude tecnica do produto (Fluxo Principal)

> **Cenario:** apos UC-F07/F08, navega para Portfolio > Meus Produtos. Clica botao "Verificar Completude" do primeiro produto. Modal "Completude: {nome}" abre com 3 indicadores (Geral, Dados Basicos, Especificacoes). Fecha modal.
>
> **Pre-requisitos:** UC-F07 ou UC-F08 ja executado (produto cadastrado).

## Passo 00 — Setup: navegar para Portfolio aba "Meus Produtos"

Sidebar Configuracoes -> Portfolio.

**Observe criticamente:**
- PortfolioPage carrega com cabecalho "Portfolio"
- Tab "Meus Produtos" ativa
- Lista com 1+ produto

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
    - tipo: evaluate
      valor_literal: |
        () => {
          const labels = [...document.querySelectorAll('label')];
          for (const lbl of labels) {
            const t = (lbl.textContent || '').trim();
            if (/^(Área|Area|Classe|Subclasse)\s*:?$/i.test(t)) {
              const sel = lbl.parentElement.querySelector('select');
              if (sel && sel.value) {
                sel.value = '';
                sel.dispatchEvent(new Event('change', {bubbles: true}));
              }
            }
          }
          return 'filtros resetados';
        }
    - tipo: wait
      valor_literal: 800
    - tipo: wait_for
      seletor: 'table tbody tr button[title="Verificar Completude"]'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F11_visual_fp.yaml#passo_00_setup_navegar_meus_produtos"
```

## Passo 01 — Acionar "Verificar Completude" no primeiro produto

Click no botao "Verificar Completude" (icone Search). Modal abre. Backend chama GET /api/produtos/:id/completude.

**Observe criticamente:**
- Modal abre com titulo comecando "Completude:" ou "Verificando completude..."
- Apos resposta, 3 indicadores aparecem (Geral, Dados Basicos, Especificacoes) com percentuais
- Tabelas "Dados Basicos" e (se aplicavel) "Especificacoes" com check/alert por campo

```yaml
id: passo_01_verificar_completude
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button[title="Verificar Completude"]')];
          if (!buttons.length) throw new Error('Nenhum botao Verificar Completude');
          buttons[0].click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Completude")'
      timeout: 15000
    # Aguarda chamada da API completar
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-F11_visual_fp.yaml#passo_01_verificar_completude"
```

## Passo 02 — Fechar modal Completude

Click em "Fechar". Modal some.

**Observe criticamente:**
- Botao "Fechar" no rodape do modal
- Apos click, overlay do modal some
- Pagina volta para grade de produtos

```yaml
id: passo_02_fechar_modal
acao:
  sequencia:
    - tipo: click
      seletor: 'div.modal-footer button:has-text("Fechar")'
      timeout: 5000
    - tipo: wait_for_hidden
      seletor: 'div.modal-overlay'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F11_visual_fp.yaml#passo_02_fechar_modal"
```
