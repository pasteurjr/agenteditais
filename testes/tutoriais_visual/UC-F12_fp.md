---
uc_id: UC-F12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F12_visual_fp.yaml
---

# UC-F12 — Reprocessar metadados de captacao (Fluxo Principal)

> **PO:** acompanhe a execucao. A IA pode demorar 30-90s para processar.
>
> **Cenario:** apos UC-F07/F08, click no produto da grade pra abrir card "Detalhes". Click no botao "Reprocessar Metadados". Backend chama POST /api/produtos/:id/reprocessar-metadados que envia ao DeepSeek.
>
> **Pre-requisitos:** UC-F07 ou UC-F08 ja executado.

## Passo 00 — Setup: navegar para Portfolio

```yaml
id: passo_00_setup_navegar_portfolio
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
      seletor: 'table tbody tr button[title="Visualizar"]'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F12_visual_fp.yaml#passo_00_setup_navegar_portfolio"
```

## Passo 01 — Selecionar primeiro produto pra abrir card "Detalhes"

Click no primeiro produto/linha da grade.

**Observe criticamente:**
- Card "Detalhes: {nome}" aparece abaixo da grade ou em coluna lateral
- Mostra Nome, Fabricante, Modelo etc
- Botoes do header: Reprocessar IA, Verificar Completude, Precos de Mercado, Excluir

```yaml
id: passo_01_selecionar_produto
acao:
  sequencia:
    # Click na primeira linha/card de produto (table tr ou produto-card)
    - tipo: evaluate
      valor_literal: |
        () => {
          const rows = [...document.querySelectorAll('table tbody tr, .produto-card')];
          if (!rows.length) throw new Error('Nenhum produto na grade');
          rows[0].click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: '.card-title:has-text("Detalhes:"), h3:has-text("Detalhes:")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F12_visual_fp.yaml#passo_01_selecionar_produto"
```

## Passo 02 — Click "Reprocessar Metadados" e esperar IA

Botao "Reprocessar Metadados" no card de detalhes. POST /api/produtos/:id/reprocessar-metadados. Aguarda 30-90s.

**Observe criticamente:**
- Botao "Reprocessar Metadados" muda para "Reprocessando..." com spinner
- Apos 30-90s, processo termina
- POST retorna 200

```yaml
id: passo_02_reprocessar_metadados
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Reprocessar Metadados/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Reprocessar Metadados nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    # Aguarda spinner aparecer
    - tipo: wait_for
      seletor: 'button:has-text("Reprocessando")'
      timeout: 5000
    # AGUARDA processamento (ate 90s)
    - tipo: wait_for
      seletor: 'button:has-text("Reprocessar Metadados")'
      timeout: 120000
validacao_ref: "testes/casos_de_teste/UC-F12_visual_fp.yaml#passo_02_reprocessar_metadados"
```
