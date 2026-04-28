---
uc_id: UC-F02
variacao: fa02
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F02_visual_fa02.yaml
---

# UC-F02 — FA-02: Adicionar 2 emails, remover o primeiro, salvar

> **PO:** confirma que remocao de email funciona (Icone X). Ao salvar, lista persiste so com email restante.

## Passo 00 — Setup: login + criar empresa + abrir EmpresaPage

Mesmo setup. Login + criacao + EmpresaPage.

**Observe criticamente:**
- EmpresaPage carregada com "Dados da Empresa"

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
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa02.yaml#passo_00_setup_empresa_e_login"
```

## Passo 01 — Adicionar 2 emails

O browser adiciona 2 emails (atendimento e comercial) na lista de "Emails de Contato".

**Observe criticamente:**
- Apos adicionar, ambos os emails aparecem na lista
- Cada email tem botao X de remover

```yaml
id: passo_01_adicionar_dois_emails
acao:
  sequencia:
    - tipo: fill
      seletor: 'input[placeholder="Novo email..."]'
      valor_from_dataset: "contatos.email_valido"
      timeout: 5000
    - tipo: click
      seletor: 'button:has-text("Adicionar"):below(.form-section-title:has-text("Emails"))'
      alternativa: '.form-section-title:has-text("Emails de Contato") ~ .multi-field-list button:has-text("Adicionar")'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("atendimento+")'
      timeout: 5000
    - tipo: fill
      seletor: 'input[placeholder="Novo email..."]'
      valor_from_dataset: "contatos.email_extra"
      timeout: 5000
    - tipo: click
      seletor: 'button:has-text("Adicionar"):below(.form-section-title:has-text("Emails"))'
      alternativa: '.form-section-title:has-text("Emails de Contato") ~ .multi-field-list button:has-text("Adicionar")'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("comercial+")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa02.yaml#passo_01_adicionar_dois_emails"
```

## Passo 02 — Remover o primeiro email

O browser clica no botao X ao lado do primeiro email (atendimento) pra remove-lo. Apenas o segundo (comercial) permanece.

**Observe criticamente:**
- Apos clicar X no primeiro email, ele desaparece da lista
- O segundo email (comercial) continua na lista

```yaml
id: passo_02_remover_primeiro_email
acao:
  sequencia:
    - tipo: click
      seletor: '.multi-field-item:has-text("atendimento+") button[title="Remover"]'
      alternativa: '.multi-field-item:has-text("atendimento+") .btn-icon-small'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("comercial+")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa02.yaml#passo_02_remover_primeiro_email"
```

## Passo 03 — Salvar apos remocao

O browser clica em "Salvar Alteracoes". Backend deve persistir apenas o email restante (comercial).

**Observe criticamente:**
- Indicador "Salvo!" em verde
- Network: PUT /api/crud/empresas status 200, payload deve conter so 1 email

```yaml
id: passo_03_salvar_apos_remocao
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'span:has-text("Salvo!")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa02.yaml#passo_03_salvar_apos_remocao"
```
