---
uc_id: UC-F10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F10_visual_fp.yaml
---

# UC-F10 — Consultar ANVISA via IA (Fluxo Principal)

> **PO:** A IA demora 30-90s para buscar.
>
> **Cenario:** PortfolioPage > botao "Buscar ANVISA" no header. Modal abre. Preenche numero de registro. Click "Buscar via IA". Sistema cria sessao "busca-anvisa" e envia prompt ao DeepSeek. Resposta inline aparece.
>
> **Pre-requisitos:** apenas login.

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
validacao_ref: "testes/casos_de_teste/UC-F10_visual_fp.yaml#passo_00_setup_navegar_portfolio"
```

## Passo 01 — Abrir modal "Buscar ANVISA"

Click no botao "Buscar ANVISA" no header da PortfolioPage.

**Observe criticamente:**
- Modal "Registros de Produtos pela ANVISA" abre
- Campos: Numero de Registro ANVISA + ou Nome do Produto
- Botoes: Cancelar, "Buscar via IA"

```yaml
id: passo_01_abrir_modal_anvisa
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Buscar ANVISA/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Buscar ANVISA nao encontrado');
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("ANVISA")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F10_visual_fp.yaml#passo_01_abrir_modal_anvisa"
```

## Passo 02 — Preencher numero e Buscar via IA

Digita numero de registro. Click "Buscar via IA". Modal fecha. DeepSeek processa.

**Observe criticamente:**
- Numero preenchido no campo "Numero de Registro ANVISA"
- Botao "Buscar via IA" habilitado
- Apos click, modal fecha
- POST /api/sessions retorna 200/201
- POST /api/chat retorna 200/201 (resposta da IA)
- Aguarda 30-90s
- Resposta inline aparece na pagina (markdown)

```yaml
id: passo_02_preencher_e_buscar_anvisa
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Numero de Registro ANVISA")) input.text-input'
      valor_from_dataset: "anvisa_registro"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Buscar via IA")'
      timeout: 5000
    - tipo: wait_for_hidden
      seletor: 'div.modal-overlay'
      timeout: 8000
    # Aguarda IA processar busca ANVISA (DeepSeek + busca web) — 180s
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-F10_visual_fp.yaml#passo_02_preencher_e_buscar_anvisa"
```
