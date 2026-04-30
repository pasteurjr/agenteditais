---
uc_id: UC-F16
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F16_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F16_visual_fp.yaml
---

# UC-F16 — Configurar fontes, palavras-chave e NCMs (Fluxo Principal)

> **Cenario:** apos UC-F01+UC-F18, navega para Configuracoes>Parametrizacoes aba "Fontes de Busca". Cadastra palavras-chave e NCMs de busca via "+ Editar" e "+ Adicionar NCM" -> textarea -> Salvar.

## Passo 00 — Setup: navegar Parametrizacoes aba "Fontes de Busca"

```yaml
id: passo_00_setup_navegar_aba_fontes
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Parametrizacoes")'
      timeout: 15000
    - tipo: click
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Fontes de Busca"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Fontes de Busca"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Palavras-chave"), h3:has-text("Palavras-chave")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_00_setup_navegar_aba_fontes"
```

## Passo 01 — Editar palavras-chave e salvar

```yaml
id: passo_01_editar_e_salvar_palavras_chave
acao:
  sequencia:
    # Click no botao "+ Editar" (tag) do Card Palavras-chave
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Palavras-chave/i.test(el.textContent || ''));
          if (!card) throw new Error('Card Palavras-chave nao encontrado');
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          // Procura botao "+ Editar"
          const buttons = [...container.querySelectorAll('button')];
          const btn = buttons.find(b => /\\+\\s*Editar/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao + Editar nao encontrado');
          btn.click();
          return 'clicked';
        }
    # Aguarda input de palavras-chave aparecer
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("Palavras-chave (separadas por virgula)")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Palavras-chave (separadas por virgula)")) input.text-input'
      valor_from_dataset: "palavras_chave"
      timeout: 5000
    # Click no botao Salvar mais proximo (do card de palavras-chave)
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Palavras-chave/i.test(el.textContent || ''));
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const buttons = [...container.querySelectorAll('button.action-button-primary')];
          const btn = buttons.find(b => /Salvar/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Salvar nao encontrado em Palavras-chave');
          btn.click();
          return 'saved';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_01_editar_e_salvar_palavras_chave"
```

## Passo 02 — Adicionar NCMs e salvar

```yaml
id: passo_02_editar_e_salvar_ncms
acao:
  sequencia:
    # Scroll ate o card NCMs
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /NCMs para Busca/i.test(el.textContent || ''));
          if (!card) throw new Error('Card NCMs nao encontrado');
          card.scrollIntoView({block: 'center', behavior: 'instant'});
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const buttons = [...container.querySelectorAll('button')];
          const btn = buttons.find(b => /\\+\\s*Adicionar NCM|\\+\\s*Editar/i.test(b.textContent || ''));
          if (btn) btn.click();
          return 'opened';
        }
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("NCMs (separados por virgula)")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("NCMs (separados por virgula)")) input.text-input'
      valor_from_dataset: "ncms"
      timeout: 5000
    # Salvar
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /NCMs para Busca/i.test(el.textContent || ''));
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const buttons = [...container.querySelectorAll('button.action-button-primary')];
          const btn = buttons.find(b => /Salvar/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Salvar nao encontrado em NCMs');
          btn.click();
          return 'saved';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_02_editar_e_salvar_ncms"
```
