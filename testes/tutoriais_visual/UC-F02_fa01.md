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

## Passo 00 — Setup: navegar para EmpresaPage

UC-F02 **assume UC-F01 ja foi executado no mesmo teste**. Empresa ja existe, esta vinculada ao user e selecionada como ativa. Setup so navega para EmpresaPage.

**Observe criticamente:**
- User permanece logado (sessao do UC-F01)
- EmpresaPage carrega com cabecalho "Dados da Empresa"

```yaml
id: passo_00_setup_empresa_e_login
acao:
  sequencia:
    - tipo: click
      seletor: '.nav-section-label:has-text("Configuracoes"), .nav-section-label:has-text("Configurações"), button.nav-section-header:has-text("Configuracoes"), button.nav-section-header:has-text("Configurações")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'button.nav-item .nav-item-label:text-is("Empresa")'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Empresa"))'
      timeout: 5000
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
