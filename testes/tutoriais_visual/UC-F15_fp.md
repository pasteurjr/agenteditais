---
uc_id: UC-F15
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F15_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F15_visual_fp.yaml
---

# UC-F15 — Configurar parametros comerciais (Fluxo Principal — escopo reduzido)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01+UC-F18, navega para Configuracoes>Parametrizacoes aba "Comercial" e preenche 3 cards (Tempo de Entrega, Mercado TAM/SAM/SOM, Custos e Margens). Cada card tem Salvar individual.
>
> **Pre-requisitos:** UC-F01+UC-F18, F14 ja rodou (ou parametros_score sera criado via ensureParamScore no 1o save).

## Passo 00 — Setup: navegar Parametrizacoes e abrir aba "Comercial"

Sidebar expande Configuracoes -> Parametrizacoes -> click tab "Comercial".

**Observe criticamente:**
- Sidebar com "CONFIGURACOES" expandida
- Tab "Comercial" fica destacada (active)
- 4-5 cards aparecem na aba: Regiao de Atuacao, Tempo de Entrega, Mercado (TAM/SAM/SOM), Custos e Margens, Modalidades
- Cada card tem inputs proprios + botao "Salvar" individual

```yaml
id: passo_00_setup_navegar_aba_comercial
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
    # Click na aba "Comercial"
    - tipo: click
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Comercial"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Comercial"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Tempo de Entrega"), h3:has-text("Tempo de Entrega")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F15_visual_fp.yaml#passo_00_setup_navegar_aba_comercial"
```

## Passo 01 — Preencher e salvar Tempo de Entrega

Card "Tempo de Entrega" — preenche prazo padrao (dias) e clica Salvar.

**Observe criticamente:**
- Card com inputs de prazo (numerico)
- Botao "Salvar" do card persiste o valor
- Feedback visual de sucesso apos salvar


```yaml
id: passo_01_preencher_e_salvar_tempo_entrega
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Prazo maximo aceito")) input.text-input'
      valor_from_dataset: "prazo_maximo"
      timeout: 5000
    - tipo: select
      seletor: 'div.form-field:has(.form-field-label:has-text("Frequencia maxima")) select.select-input'
      valor_from_dataset: "frequencia"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar Prazo/Frequencia")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F15_visual_fp.yaml#passo_01_preencher_e_salvar_tempo_entrega"
```

## Passo 02 — Preencher e salvar Mercado (TAM/SAM/SOM)

Card "Mercado" — TAM (total), SAM (servivel), SOM (obtenivel). Salvar.

**Observe criticamente:**
- 3 inputs numericos (R$ ou unidades)
- TAM > SAM > SOM (nao validado, mas convencao)
- Salvar persiste em parametros_score.tam/sam/som


```yaml
id: passo_02_preencher_e_salvar_mercado
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("TAM")) input.text-input'
      valor_from_dataset: "tam"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("SAM")) input.text-input'
      valor_from_dataset: "sam"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("SOM")) input.text-input'
      valor_from_dataset: "som"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar Mercado")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F15_visual_fp.yaml#passo_02_preencher_e_salvar_mercado"
```

## Passo 03 — Preencher e salvar Custos e Margens

Card "Custos e Margens" — custo fixo, custo variavel %, margem desejada %. Salvar.

**Observe criticamente:**
- Inputs com mascara percentual ou monetaria
- Salvar persiste valores que servirao de base pro motor de precificacao (Sprint 8)


```yaml
id: passo_03_preencher_e_salvar_custos
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Markup Padrao")) input.text-input'
      valor_from_dataset: "markup"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Custos Fixos Mensais")) input.text-input'
      valor_from_dataset: "custos_fixos"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Frete Base")) input.text-input'
      valor_from_dataset: "frete_base"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar Custos")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F15_visual_fp.yaml#passo_03_preencher_e_salvar_custos"
```
