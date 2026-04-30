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

## Passo 00 — Setup: navegar para EmpresaPage

UC-F02 **assume UC-F01 ja foi executado no mesmo teste**. Empresa ja existe, esta vinculada ao user e selecionada como ativa. Setup so navega para EmpresaPage.

**Observe criticamente:**
- User permanece logado (sessao do UC-F01)
- EmpresaPage carrega com cabecalho "Dados da Empresa"

```yaml
id: passo_00_setup_empresa_e_login
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
