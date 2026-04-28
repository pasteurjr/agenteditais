---
uc_id: UC-F02
variacao: fa03
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F02_visual_fa03.yaml
---

# UC-F02 — FA-03: Adicionar contatos, deixar area padrao em branco, salvar

> **PO:** confirma que area de atuacao padrao eh **opcional** — sistema aceita salvar com a opcao "Selecione uma area..." mantida.

## Passo 00 — Setup: login + criar empresa + abrir EmpresaPage

Mesmo setup das outras variacoes.

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
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa03.yaml#passo_00_setup_empresa_e_login"
```

## Passo 01 — Adicionar email + telefone (sem mexer na area)

O browser adiciona um email e um telefone, mas **nao toca** no select de area padrao.

**Observe criticamente:**
- Email aparece na lista
- Telefone aparece na lista
- Select "Area de Atuacao Padrao" mantem "Selecione uma area..."

```yaml
id: passo_01_adicionar_contatos
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
      seletor: 'input[placeholder="Novo telefone..."]'
      valor_from_dataset: "contatos.telefone_valido"
      timeout: 5000
    - tipo: click
      seletor: 'button:has-text("Adicionar"):below(.form-section-title:has-text("Celulares"))'
      alternativa: '.form-section-title:has-text("Celulares") ~ .multi-field-list button:has-text("Adicionar")'
      timeout: 5000
    - tipo: wait_for
      seletor: '.multi-field-item span:has-text("4999")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa03.yaml#passo_01_adicionar_contatos"
```

## Passo 02 — Verificar que area padrao continua nao selecionada

O browser apenas confirma visualmente que o select esta com "Selecione uma area..." (valor vazio).

**Observe criticamente:**
- Select "Area de Atuacao Padrao" visivel
- Valor selecionado eh "" (option default)

```yaml
id: passo_02_nao_selecionar_area
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'label:has-text("Area de Atuacao Padrao")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa03.yaml#passo_02_nao_selecionar_area"
```

## Passo 03 — Salvar sem area padrao

O browser clica "Salvar Alteracoes". Backend deve aceitar com `area_padrao_id = null`.

**Observe criticamente:**
- Indicador "Salvo!" em verde
- Network: PUT /api/crud/empresas status 200

```yaml
id: passo_03_salvar_sem_area
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Salvar Alteracoes")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'span:has-text("Salvo!")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F02_visual_fa03.yaml#passo_03_salvar_sem_area"
```
