---
uc_id: UC-F02
variacao: fa01
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F02_visual_fa01.yaml
---

# UC-F02 — FA-01: Salvar sem email nem telefone (campos opcionais)

> **PO:** confirma que o sistema aceita salvar empresa **sem nenhum email ou telefone** — campos sao opcionais (nullable=True).

## Passo 00 — Setup: login + criar empresa minima + abrir EmpresaPage

Mesmo setup do FP. Login + cria empresa via FA-07.A + seleciona + abre EmpresaPage.

**Observe criticamente:**
- Login OK, empresa criada, EmpresaPage carregada com cabecalho "Dados da Empresa"

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
    - tipo: fill
      seletor: 'input[type="password"]'
      valor_from_contexto: "usuario.senha"
    - tipo: click
      seletor: 'button[type="submit"]'
    - tipo: wait_for
      seletor: 'h1:has-text("Voce nao tem empresas vinculadas"), h1:has-text("Sem empresa vinculada")'
      timeout: 15000
    - tipo: click
      seletor: 'button:has-text("Criar Nova Empresa")'
    - tipo: wait_for
      seletor: 'button:has-text("Novo")'
      timeout: 10000
    - tipo: click
      seletor: 'button:has-text("Novo")'
    - tipo: wait_for
      seletor: 'label:has-text("CNPJ")'
      timeout: 10000
    - tipo: fill
      seletor: 'input[name="cnpj"], label:has-text("CNPJ") ~ input'
      valor_from_dataset: "empresa.cnpj"
    - tipo: fill
      seletor: 'input[name="razao_social"], label:has-text("Razao Social") ~ input'
      valor_from_dataset: "empresa.razao_social"
    - tipo: click
      seletor: 'button:has-text("Salvar")'
    - tipo: wait_for
      seletor: 'a:has-text("DEMO"), .empresa-card:has-text("DEMO")'
      timeout: 15000
    - tipo: click
      seletor: 'a:has-text("DEMO"), .empresa-card:has-text("DEMO")'
    - tipo: wait_for
      seletor: 'a[href*="/empresa"], .nav-item-label:has-text("Empresa")'
      timeout: 10000
    - tipo: click
      seletor: 'a[href*="/empresa"], .nav-item-label:has-text("Empresa")'
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa01.yaml#passo_00_setup_empresa_e_login"
```

## Passo 01 — Pular adicao de email e telefone

O browser **nao adiciona** nenhum email nem telefone. Apenas verifica que as secoes existem na tela e seguem vazias.

**Observe criticamente:**
- Secao "Emails de Contato" visivel (mesmo vazia)
- Secao "Celulares / Telefones" visivel (mesmo vazia)
- Sem mensagem de erro pedindo preencher

```yaml
id: passo_01_pular_email_telefone
acao:
  sequencia:
    - tipo: wait_for
      seletor: '.form-section-title:has-text("Emails de Contato")'
      timeout: 5000
    - tipo: wait_for
      seletor: '.form-section-title:has-text("Celulares")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa01.yaml#passo_01_pular_email_telefone"
```

## Passo 02 — Salvar sem contatos

O browser clica em "Salvar Alteracoes". Backend deve aceitar (campos opcionais).

**Observe criticamente:**
- Botao "Salvar Alteracoes" clicavel
- Indicador "Salvo!" em verde aparece
- Network: PUT /api/crud/empresas status 200

```yaml
id: passo_02_salvar_sem_contatos
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'span:has-text("Salvo!")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa01.yaml#passo_02_salvar_sem_contatos"
```
