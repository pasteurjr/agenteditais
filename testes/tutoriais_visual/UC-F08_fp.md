---
uc_id: UC-F08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F08_visual_fp.yaml
---

# UC-F08 — Editar produto e especificacoes (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico.
>
> **Cenario:** apos UC-F07 (cadastro IA), navega para Portfolio > Meus Produtos. Clica no botao Editar do primeiro produto. Modal abre com dados basicos preenchidos. Altera nome, fabricante, modelo, SKU, NCM, descricao. Salva. PUT /api/produtos/:id retorna 200.
>
> **Pre-requisitos:** UC-F07 ja executado (produto cadastrado).

## Passo 00 — Setup: navegar para Portfolio aba "Meus Produtos"

Sidebar Configuracoes -> Portfolio. Aba Meus Produtos por default.

**Observe criticamente:**
- Sidebar Configuracoes expandida (idempotente)
- Cabecalho "Portfolio" visivel
- Tab "Meus Produtos" ativa por default
- Lista de produtos exibida (1+ produto do F07)

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
    # Reseta filtros pra garantir que produto aparece na grade
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
    # Aguarda fetchProdutos() trazer 1+ produto (F07 ja criou) — DataTable
    # renderiza um <tr> com botoes title="Editar"/"Reprocessar IA"/etc.
    - tipo: wait_for
      seletor: 'table tbody tr button[title="Editar"]'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_00_setup_navegar_meus_produtos"
```

## Passo 01 — Abrir modal Editar do primeiro produto

Click no botao Editar (icone Edit2) do primeiro produto da lista. Modal "Editar: {nome}" abre com dados carregados.

**Observe criticamente:**
- Modal abre centralizado
- Titulo do modal comeca com "Editar: " seguido do nome do produto
- Campos basicos preenchidos com dados atuais (Nome, Fabricante, Modelo, SKU, NCM, Descricao)
- Selects Area/Classe/Subclasse podem estar preenchidos
- Botoes Salvar (primary) e Cancelar visiveis no rodape

```yaml
id: passo_01_abrir_modal_editar
acao:
  sequencia:
    # Click no botao "Editar" do primeiro card/linha de produto
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button[title="Editar"]')];
          if (!buttons.length) throw new Error('Nenhum botao Editar encontrado em produtos');
          buttons[0].click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Editar:")'
      timeout: 10000
    # Aguarda dados carregarem (loader some)
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_01_abrir_modal_editar"
```

## Passo 02 — Editar campos basicos e salvar

Substitui valores em Nome, Fabricante, Modelo, SKU, NCM, Descricao e clica Salvar. Backend processa PUT.

**Observe criticamente:**
- Cada campo recebe novo valor (clear + fill — sem concatenacao)
- Botao Salvar habilitado (nome nao vazio)
- Apos click, modal fecha automaticamente
- PUT em /api/crud/produtos/:id retorna 200

```yaml
id: passo_02_editar_e_salvar
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Nome")) input.text-input'
      valor_from_dataset: "novo_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Fabricante")) input.text-input'
      valor_from_dataset: "novo_fabricante"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Modelo")) input.text-input'
      valor_from_dataset: "novo_modelo"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("SKU")) input.text-input'
      valor_from_dataset: "novo_codigo"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("NCM")) input.text-input'
      valor_from_dataset: "novo_ncm"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Descricao")) input.text-input'
      valor_from_dataset: "nova_descricao"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for_hidden
      seletor: 'div.modal-overlay'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_02_editar_e_salvar"
```

## Passo 03 — Confirmar atualizacao na grade

Verifica que o produto na grade reflete o novo nome.

**Observe criticamente:**
- Grade de produtos atualizada
- Nome novo (`Monitor MultiParam Pro Edicao Visual`) aparece em algum card

```yaml
id: passo_03_confirmar_grade_atualizada
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'text=Monitor MultiParam Pro Edicao Visual'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_03_confirmar_grade_atualizada"
```
