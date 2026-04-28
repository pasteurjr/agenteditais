---
uc_id: UC-F02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F02_visual_fp.yaml
---

# UC-F02 — Gerir contatos e area padrao (Fluxo Principal) — Trilha Visual

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta antes de continuar.
>
> **Cenario:** super sem vinculos cria empresa via FA-07.A, seleciona a empresa, abre EmpresaPage, adiciona email, telefone, seleciona area padrao e salva.

## Passo 00 — Setup: login + criar empresa minima + abrir EmpresaPage

O browser vai logar com o usuario do ciclo, criar empresa minima via fluxo FA-07.A do UC-F01 e abrir a EmpresaPage onde o UC-F02 acontece. Sem isso, nao ha empresa pra editar.

**Observe criticamente:**
- Login bem-sucedido — sem mensagem de credencial invalida
- Tela "Voce nao tem empresas vinculadas" aparece (super sem vinculos)
- Apos clicar "Criar Nova Empresa" e salvar via CRUD, empresa aparece na lista
- Apos selecionar a empresa, EmpresaPage carrega com cabecalho "Dados da Empresa"

```yaml
id: passo_00_setup_empresa_e_login
acao:
  sequencia:
    - tipo: navigate
      url: "/"
      timeout: 15000
    - tipo: wait_for
      seletor: 'input[type="email"]'
      timeout: 10000
    - tipo: fill
      seletor: 'input[type="email"]'
      valor_from_contexto: "usuario.email"
      timeout: 5000
    - tipo: fill
      seletor: 'input[type="password"]'
      valor_from_contexto: "usuario.senha"
      timeout: 5000
    - tipo: click
      seletor: 'button[type="submit"]'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Voce nao tem empresas vinculadas"), h1:has-text("Sem empresa vinculada")'
      timeout: 15000
    - tipo: click
      seletor: 'button:has-text("Criar Nova Empresa")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button:has-text("Novo")'
      timeout: 10000
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("CNPJ")'
      timeout: 10000
    - tipo: fill
      seletor: 'input[name="cnpj"], label:has-text("CNPJ") + input, label:has-text("CNPJ") ~ input'
      valor_from_dataset: "empresa.cnpj"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="razao_social"], label:has-text("Razao Social") + input, label:has-text("Razao Social") ~ input'
      valor_from_dataset: "empresa.razao_social"
      timeout: 5000
    - tipo: click
      seletor: 'button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'a:has-text("DEMO"), .empresa-card:has-text("DEMO"), text=DEMO'
      timeout: 15000
    - tipo: click
      seletor: 'a:has-text("DEMO"), .empresa-card:has-text("DEMO")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'a[href*="/empresa"], .nav-item-label:has-text("Empresa")'
      timeout: 10000
    - tipo: click
      seletor: 'a[href*="/empresa"], .nav-item-label:has-text("Empresa")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fp.yaml#passo_00_setup_empresa_e_login"
```

## Passo 01 — Adicionar email de contato

O browser digita um email valido no campo "Novo email..." e clica "Adicionar". O email novo aparece na lista de "Emails de Contato".

**Observe criticamente:**
- Campo "Novo email..." aceita o texto digitado
- Apos clicar "Adicionar", email aparece na lista com botao X de remover
- Campo "Novo email..." volta vazio
- Sem mensagem de erro vermelha

```yaml
id: passo_01_adicionar_email
acao:
  sequencia:
    - tipo: fill
      seletor: 'input[placeholder="Novo email..."]'
      valor_from_dataset: "contatos.email_valido"
      timeout: 5000
    - tipo: click
      seletor: '.form-section-title:has-text("Emails de Contato") ~ .multi-field-list .multi-field-add button:has-text("Adicionar")'
      alternativa: 'button:has-text("Adicionar"):below(.form-section-title:has-text("Emails de Contato"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("atendimento+")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fp.yaml#passo_01_adicionar_email"
```

## Passo 02 — Adicionar telefone

O browser digita um telefone no campo "Novo telefone..." e clica "Adicionar". O telefone aparece na lista de "Celulares / Telefones".

**Observe criticamente:**
- Campo "Novo telefone..." aceita o texto
- Apos clicar "Adicionar", telefone aparece na lista
- Campo volta vazio

```yaml
id: passo_02_adicionar_telefone
acao:
  sequencia:
    - tipo: fill
      seletor: 'input[placeholder="Novo telefone..."]'
      valor_from_dataset: "contatos.telefone_valido"
      timeout: 5000
    - tipo: click
      seletor: '.form-section-title:has-text("Celulares / Telefones") ~ .multi-field-list .multi-field-add button:has-text("Adicionar")'
      alternativa: 'button:has-text("Adicionar"):below(.form-section-title:has-text("Celulares"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("4999")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fp.yaml#passo_02_adicionar_telefone"
```

## Passo 03 — Selecionar area de atuacao padrao

O browser abre o select "Area de Atuacao Padrao" e escolhe a primeira opcao disponivel (ignorando "Selecione uma area..."). Se a lista estiver vazia, registra observacao.

**Observe criticamente:**
- Select "Area de Atuacao Padrao" tem ao menos 1 opcao alem de "Selecione..."
- Apos selecionar, valor aparece no select

```yaml
id: passo_03_selecionar_area_padrao
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'label:has-text("Area de Atuacao Padrao") ~ select, label:has-text("Area de Atuacao Padrao") + select'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fp.yaml#passo_03_selecionar_area_padrao"
```

## Passo 04 — Salvar Alteracoes

O browser clica em "Salvar Alteracoes" no rodape do card "Informacoes Cadastrais". Backend faz PUT na empresa e indicador "Salvo!" verde aparece.

**Observe criticamente:**
- Botao "Salvar Alteracoes" visivel (variant primary)
- Apos clicar, botao entra em loading
- Indicador "Salvo!" em verde aparece ao lado do botao
- Sem mensagem vermelha de erro
- Network tab mostra PUT /api/crud/empresas com status 200

```yaml
id: passo_04_salvar_alteracoes
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'span:has-text("Salvo!")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fp.yaml#passo_04_salvar_alteracoes"
```
