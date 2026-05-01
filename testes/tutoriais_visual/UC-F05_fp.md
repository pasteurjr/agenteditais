---
uc_id: UC-F05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F05_visual_fp.yaml
---

# UC-F05 — Gerir responsaveis da empresa (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01+UC-F18, navega para EmpresaPage > Card Responsaveis (ultimo card da pagina), abre o Modal "Adicionar Responsavel" 3 vezes e cadastra: Representante Legal, Preposto e Responsavel Tecnico. Confirma que os 3 aparecem na tabela.
>
> **Pre-requisitos:** UC-F01 + UC-F18 ja executados. Card Responsaveis acessivel.

## Passo 00 — Setup: navegar para EmpresaPage e localizar Card Responsaveis

User esta logado, com empresa ativa. Sidebar expande Configuracoes -> Empresa, EmpresaPage carrega, scroll para o card "Responsaveis" (ultimo card da pagina).

**Observe criticamente:**
- Sidebar com secao "CONFIGURACOES" expandida (idempotente)
- EmpresaPage carrega com cabecalho "Dados da Empresa"
- Card "Responsaveis" visivel (ultimo da pagina) com botao "+ Adicionar Responsavel"
- Tabela inicialmente vazia ("Nenhum responsavel cadastrado") OU com itens de execucoes anteriores

```yaml
id: passo_00_setup_navegar_responsaveis
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
    # Scrolla ate o card "Responsaveis" (ultimo card da pagina)
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /^Responsaveis$|Responsáveis$/i.test((el.textContent || '').trim()));
          if (!card) throw new Error('Card Responsaveis nao encontrado');
          card.scrollIntoView({block: 'center', behavior: 'instant'});
          return 'scrolled';
        }
    - tipo: wait_for
      seletor: 'button.action-button:has-text("Adicionar")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_00_setup_navegar_responsaveis"
```

## Passo 01 — Abrir Modal "Adicionar Responsavel" (1a vez, para Resp 1)

Click no botao "+ Adicionar Responsavel" do Card Responsaveis. Modal "Adicionar Responsavel" abre com campos: Tipo (select), Nome, CPF, Email, Telefone.

**Observe criticamente:**
- Modal aparece centralizado com overlay escurecido
- Titulo "Adicionar Responsavel" no header do modal
- Select "Tipo" com opcoes: Representante Legal, Preposto, Responsavel Tecnico, Outros
- Campos vazios prontos pra preenchimento
- Botoes "Salvar" (primary) e "Cancelar" no rodape


Click no botao "+ Adicionar" do header do Card Responsaveis. Modal "Adicionar Responsavel" abre com 6 campos: Tipo, Nome (req), Cargo, CPF, Email (req), Telefone, e botoes Cancelar/Salvar.

```yaml
id: passo_01_abrir_modal_resp1
acao:
  sequencia:
    # IMPORTANTE: Card "Responsaveis" tem botao "Adicionar" no header. Usa proximidade
    # ao titulo pra evitar conflito com outros botoes "Adicionar" da pagina (Emails/Telefones).
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /^Responsaveis$|Responsáveis$/i.test((el.textContent || '').trim()));
          if (!card) throw new Error('Card Responsaveis nao encontrado');
          // Procura a div pai do Card e dentro dela o botao Adicionar do header
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          if (!container) throw new Error('container .card de Responsaveis nao encontrado');
          const btn = container.querySelector('button.action-button');
          if (!btn) throw new Error('Botao Adicionar do Card Responsaveis nao encontrado');
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Adicionar Responsavel")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_01_abrir_modal_resp1"
```

## Passo 02 — Preencher Resp 1 (Representante Legal) e Salvar

Tipo = "Representante Legal", Nome/CPF/Email/Telefone vindos do dataset (Resp 1). Click Salvar. Modal fecha, primeira linha aparece na tabela.

**Observe criticamente:**
- Select "Tipo" muda para "Representante Legal"
- Nome e demais campos digitados sem erro de mascara
- Botao Salvar dispara POST -> backend cria registro em `empresa_responsaveis`
- Modal fecha sozinho apos sucesso
- Tabela ganha 1a linha com nome e tipo do responsavel


```yaml
id: passo_02_preencher_resp1_representante
acao:
  sequencia:
    # Tipo: SelectInput (value interno = "representante_legal")
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo")) select.select-input'
      valor_from_dataset: "resp1_tipo_value"
      timeout: 5000
    # Nome (obrigatorio)
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Nome")) input.text-input'
      valor_from_dataset: "resp1_nome"
      timeout: 5000
    # Cargo
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Cargo")) input.text-input'
      valor_from_dataset: "resp1_cargo"
      timeout: 5000
    # CPF
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("CPF")) input.text-input'
      valor_from_dataset: "resp1_cpf"
      timeout: 5000
    # Email (obrigatorio)
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Email")) input.text-input'
      valor_from_dataset: "resp1_email"
      timeout: 5000
    # Telefone
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Telefone")) input.text-input'
      valor_from_dataset: "resp1_telefone"
      timeout: 5000
    # Salvar
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    # Confirma que linha do Resp 1 apareceu na tabela
    - tipo: wait_for
      seletor: 'text=Marcos Antonio Ferreira'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_02_preencher_resp1_representante"
```

## Passo 03 — Abrir Modal "Adicionar Responsavel" (2a vez, para Resp 2)

Mesmo padrao do passo 01: click no botao "+ Adicionar Responsavel". Modal abre vazio.

**Observe criticamente:**
- Modal abre limpo (campos zerados)
- Tabela continua mostrando o Resp 1 ja cadastrado em background


```yaml
id: passo_03_abrir_modal_resp2
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /^Responsaveis$|Responsáveis$/i.test((el.textContent || '').trim()));
          if (!card) throw new Error('Card Responsaveis nao encontrado');
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const btn = container.querySelector('button.action-button');
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Adicionar Responsavel")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_03_abrir_modal_resp2"
```

## Passo 04 — Preencher Resp 2 (Preposto) e Salvar

Tipo = "Preposto", restante vindo do dataset (Resp 2). Salvar. Tabela passa a ter 2 linhas.

**Observe criticamente:**
- Select "Tipo" muda para "Preposto"
- Tabela apos salvar exibe 2 linhas: Representante Legal + Preposto


```yaml
id: passo_04_preencher_resp2_preposto
acao:
  sequencia:
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo")) select.select-input'
      valor_from_dataset: "resp2_tipo_value"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Nome")) input.text-input'
      valor_from_dataset: "resp2_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Cargo")) input.text-input'
      valor_from_dataset: "resp2_cargo"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("CPF")) input.text-input'
      valor_from_dataset: "resp2_cpf"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Email")) input.text-input'
      valor_from_dataset: "resp2_email"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Telefone")) input.text-input'
      valor_from_dataset: "resp2_telefone"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'text=Carla Regina Souza'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_04_preencher_resp2_preposto"
```

## Passo 05 — Abrir Modal "Adicionar Responsavel" (3a vez, para Resp 3)

Click pela 3a vez. Modal abre limpo.

**Observe criticamente:**
- Modal abre limpo apos os 2 cadastros anteriores
- Tabela com 2 linhas em background


```yaml
id: passo_05_abrir_modal_resp3
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /^Responsaveis$|Responsáveis$/i.test((el.textContent || '').trim()));
          if (!card) throw new Error('Card Responsaveis nao encontrado');
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const btn = container.querySelector('button.action-button');
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.modal h2:has-text("Adicionar Responsavel")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_05_abrir_modal_resp3"
```

## Passo 06 — Preencher Resp 3 (Responsavel Tecnico) e Salvar

Tipo = "Responsavel Tecnico", restante vindo do dataset (Resp 3). Salvar.

**Observe criticamente:**
- Select "Tipo" muda para "Responsavel Tecnico"
- Apos salvar, tabela tem 3 linhas (todas as funcoes cobertas)


```yaml
id: passo_06_preencher_resp3_tecnico
acao:
  sequencia:
    - tipo: select
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Tipo")) select.select-input'
      valor_from_dataset: "resp3_tipo_value"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Nome")) input.text-input'
      valor_from_dataset: "resp3_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Cargo")) input.text-input'
      valor_from_dataset: "resp3_cargo"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("CPF")) input.text-input'
      valor_from_dataset: "resp3_cpf"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Email")) input.text-input'
      valor_from_dataset: "resp3_email"
      timeout: 5000
    - tipo: fill
      seletor: 'div.modal-body div.form-field:has(.form-field-label:has-text("Telefone")) input.text-input'
      valor_from_dataset: "resp3_telefone"
      timeout: 5000
    - tipo: click
      seletor: 'div.modal-footer button.btn-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'text=Paulo Roberto Menezes'
      timeout: 8000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_06_preencher_resp3_tecnico"
```

## Passo 07 — Verificar lista final com 3 responsaveis

Asserts visuais que a tabela tem 3 linhas com Representante Legal + Preposto + Responsavel Tecnico.

**Observe criticamente:**
- Tabela com exatamente 3 linhas
- Cada linha mostra Tipo + Nome
- Botao "+ Adicionar Responsavel" continua disponivel pra futuras adicoes
- Card pode mostrar contador "(3)" no titulo


```yaml
id: passo_07_verificar_lista_3_responsaveis
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3, h2')];
          const card = titulos.find(el => /^Responsaveis$|Responsáveis$/i.test((el.textContent || '').trim()));
          if (card) card.scrollIntoView({block: 'center', behavior: 'instant'});
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'text=Marcos Antonio Ferreira'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Carla Regina Souza'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Paulo Roberto Menezes'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F05_visual_fp.yaml#passo_07_verificar_lista_3_responsaveis"
```
