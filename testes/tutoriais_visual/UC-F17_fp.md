---
uc_id: UC-F17
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F17_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F17_visual_fp.yaml
---

# UC-F17 — Configurar notificacoes e preferencias (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01+UC-F18, navega aba "Notificacoes" e preenche email + 3 checkboxes + frequencia, salva. Depois aba "Preferencias", configura tema/idioma/fuso, salva.

## Passo 00 — Setup: navegar Parametrizacoes aba "Notificacoes"

Sidebar -> Parametrizacoes -> click tab "Notificacoes".

**Observe criticamente:**
- Tab "Notificacoes" ativa
- Card "Configuracoes de Notificacao" aparece com inputs: Email, checkboxes (notificar por email/push/sms), Frequencia (select: diario/semanal/mensal)

```yaml
id: passo_00_setup_navegar_aba_notificacoes
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Parametrizacoes")'
      timeout: 15000
    # Click na aba "Notificacoes"
    - tipo: click
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Notificacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Notificacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Configuracoes de Notificacao"), h3:has-text("Configuracoes de Notificacao")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F17_visual_fp.yaml#passo_00_setup_navegar_aba_notificacoes"
```

## Passo 01 — Preencher e salvar notificacoes

Preenche email de notificacao + select de frequencia + click Salvar.

**Observe criticamente:**
- Input email aceita formato valido (validacao no submit)
- Select Frequencia: opcoes Diario / Semanal / Mensal
- Botao Salvar dispara POST -> backend persiste preferencias do user
- Apos salvar, feedback de sucesso

```yaml
id: passo_01_preencher_e_salvar_notificacoes
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Email para notificacoes")) input.text-input'
      valor_from_dataset: "email_notif"
      timeout: 5000
    # Frequencia (select)
    - tipo: select
      seletor: 'div.form-field:has(.form-field-label:has-text("Frequencia do resumo")) select.select-input'
      valor_from_dataset: "frequencia_resumo_value"
      timeout: 5000
    # Salvar (botao Salvar dentro do Card de Notificacoes - so existe 1 nesta aba)
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F17_visual_fp.yaml#passo_01_preencher_e_salvar_notificacoes"
```

## Passo 02 — Navegar aba "Preferencias"

Click na tab "Preferencias". Card "Preferencias do Sistema" aparece com radios (tema), select (idioma), select (fuso).

**Observe criticamente:**
- Tab "Preferencias" ativa
- Card "Preferencias do Sistema" presente
- Radios de tema: Claro / Escuro
- Selects: Idioma (pt-BR/en-US) e Fuso (America/Sao_Paulo etc.)

```yaml
id: passo_02_navegar_aba_preferencias
acao:
  sequencia:
    - tipo: click
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Preferencias"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Preferencias"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Preferencias do Sistema"), h3:has-text("Preferencias do Sistema")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F17_visual_fp.yaml#passo_02_navegar_aba_preferencias"
```

## Passo 03 — Preencher e salvar preferencias

Click no radio "Escuro", select Idioma e Fuso, depois Salvar.

**Observe criticamente:**
- Apos click no radio Escuro, tema muda visualmente (background escuro)
- Idioma e Fuso persistidos
- Botao Salvar persiste em users.preferences (ou similar)
- Mudanca de tema pode aplicar imediatamente (live)

```yaml
id: passo_03_preencher_e_salvar_preferencias
acao:
  sequencia:
    # Tema (radio): clica em Escuro ou Claro
    - tipo: evaluate
      valor_literal: |
        () => {
          const labels = [...document.querySelectorAll('label.radio-wrapper')];
          const escuro = labels.find(l => /Escuro/i.test(l.textContent || ''));
          if (!escuro) throw new Error('Radio Escuro nao encontrado');
          const radio = escuro.querySelector('input[type="radio"]');
          radio.click();
          return 'tema_escuro';
        }
    # Idioma (select)
    - tipo: select
      seletor: 'div.form-field:has(.form-field-label:has-text("Idioma")) select.select-input'
      valor_from_dataset: "idioma_value"
      timeout: 5000
    # Fuso horario (select)
    - tipo: select
      seletor: 'div.form-field:has(.form-field-label:has-text("Fuso horario")) select.select-input'
      valor_from_dataset: "fuso_value"
      timeout: 5000
    # Salvar
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F17_visual_fp.yaml#passo_03_preencher_e_salvar_preferencias"
```
