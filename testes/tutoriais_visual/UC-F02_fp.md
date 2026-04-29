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

## Passo 00 — Setup: navegar para EmpresaPage

UC-F02 **assume UC-F01 ja foi executado no mesmo teste** (ou em sessao previa do mesmo user). Ou seja: empresa criada (UC-F01), vinculada ao user (UC-F18 invocado por UC-F01), selecionada como ativa (passo 04c do UC-F01). User esta no shell autenticado, com empresa ativa, e provavelmente ja viu EmpresaPage. Este setup so navega/garante que estamos na pagina certa.

**Observe criticamente:**
- User permanece logado (sessao do UC-F01)
- Item "Empresa" da secao "Configuracoes" da sidebar visivel
- EmpresaPage carrega com cabecalho "Dados da Empresa"

```yaml
id: passo_00_setup_empresa_e_login
acao:
  sequencia:
    # Garante secao Configuracoes expandida (idempotente — se ja estiver, click colapsa
    # e o wait_for falha rapido; defesa: tenta abrir e re-tenta wait).
    - tipo: click
      seletor: '.nav-section-label:has-text("Configuracoes"), .nav-section-label:has-text("Configurações"), button.nav-section-header:has-text("Configuracoes"), button.nav-section-header:has-text("Configurações")'
      timeout: 10000
    # Espera item "Empresa" da Configuracoes (button.nav-item, text-is exato)
    - tipo: wait_for
      seletor: 'button.nav-item .nav-item-label:text-is("Empresa")'
      timeout: 10000
    # Click no item Empresa
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Empresa"))'
      timeout: 5000
    # Aguarda EmpresaPage carregar
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
