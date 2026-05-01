---
uc_id: UC-F14
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F14_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F14_visual_fp.yaml
---

# UC-F14 — Configurar pesos e limiares de score (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01+UC-F18 (empresa ativa selecionada), navega para Configuracoes > Parametrizacoes, aba "Score". Preenche os 6 pesos das dimensoes (somando 1.00), salva. Preenche os 6 limiares (final/tecnico/juridico GO/NO-GO), salva.
>
> **Pre-requisitos:** UC-F01+UC-F18 ja executados (predecessores registrados em 30/04/2026). parametros_score eh empresa-scoped — frontend cria registro automaticamente no 1o save via ensureParamScore().

## Passo 00 — Setup: navegar para Parametrizacoes (aba Score por default)

Sidebar expande Configuracoes -> Parametrizacoes, ParametrizacoesPage carrega na aba "Score" por default.

**Observe criticamente:**
- Sidebar com "CONFIGURACOES" expandida (idempotente)
- Cabecalho "Parametrizacoes" + 6 tabs: Score | Comercial | Fontes de Busca | Notificacoes | Preferencias | Classes
- Tab "Score" ativa por default
- Card "Pesos das Dimensoes" com 6 inputs (Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial) que devem somar 1.00
- Card "Limiares de Decisao GO / NO-GO" com 6 inputs (final-go/no-go, tecnico-go/no-go, juridico-go/no-go)

```yaml
id: passo_00_setup_navegar_parametrizacoes
acao:
  sequencia:
    # IDEMPOTENTE: garante secao Configuracoes expandida
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
    # Click no item Parametrizacoes (nav-item de Configuracoes)
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Parametrizacoes")'
      timeout: 15000
    # Aba "Score" eh a default (1a). Confirma que esta ativa.
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Score"))'
      timeout: 5000
    # Aguarda os cards carregarem (loadingParamScore == false)
    - tipo: wait_for
      seletor: '.card-title:has-text("Pesos das Dimensoes"), h3:has-text("Pesos das Dimensoes")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F14_visual_fp.yaml#passo_00_setup_navegar_parametrizacoes"
```

## Passo 01 — Preencher os 6 pesos das dimensoes

Digita os 6 pesos no card "Pesos das Dimensoes" (Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial). Soma deve ser 1.00.

**Observe criticamente:**
- Cada input aceita decimal (formato 0.XX)
- Soma final = 1.00 (regra de negocio: validacao no frontend antes do submit)
- Pesos refletem a estrategia de avaliacao do edital (peso maior = dimensao mais importante)


**Observe criticamente:**
- 6 campos number visiveis: Peso Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
- Cada um aceita valores decimais com placeholder de exemplo
- Soma deve totalizar 1.00 (texto "Soma atual: 1.00" deve ficar verde apos preencher)

```yaml
id: passo_01_preencher_pesos
acao:
  sequencia:
    # 6 FILLs nos campos numericos. Como sao TextInput type=number:
    # input do FormField com label exato.
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Tecnico")) input.text-input'
      valor_from_dataset: "peso_tecnico"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Documental")) input.text-input'
      valor_from_dataset: "peso_documental"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Complexidade")) input.text-input'
      valor_from_dataset: "peso_complexidade"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Juridico")) input.text-input'
      valor_from_dataset: "peso_juridico"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Logistico")) input.text-input'
      valor_from_dataset: "peso_logistico"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Peso Comercial")) input.text-input'
      valor_from_dataset: "peso_comercial"
      timeout: 5000
    # Aguarda indicador de soma atualizar
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-F14_visual_fp.yaml#passo_01_preencher_pesos"
```

## Passo 02 — Salvar Pesos

Click no botao "Salvar Pesos" do card. POST envia os 6 pesos pro backend.

**Observe criticamente:**
- Botao "Salvar Pesos" (variant primary) dentro do card
- Apos click, feedback de sucesso aparece
- `parametros_score.peso_*` no banco recebe os valores
- 1a vez = backend cria o registro (ensureParamScore)


Click no botao "Salvar Pesos". Backend recebe POST/PUT em /api/crud/parametros-score.

```yaml
id: passo_02_salvar_pesos
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar Pesos")'
      timeout: 5000
    # Aguarda banner verde "Salvo!" aparecer no topo da pagina
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F14_visual_fp.yaml#passo_02_salvar_pesos"
```

## Passo 03 — Preencher os 6 limiares (Final, Tecnico, Juridico)

Card "Limiares de Decisao GO / NO-GO" — preenche 6 inputs (final go/no-go, tecnico go/no-go, juridico go/no-go) com valores entre 0 e 100.

**Observe criticamente:**
- Cada par "go > no-go" estabelece a faixa de aceitacao
- Editais com score < no-go = rejeitados; > go = aprovados; entre = manual
- Inputs aceitam inteiro 0-100


**IMPORTANTE:** os 6 campos tem o MESMO label ("Minimo para GO" ou "Maximo para NO-GO") repetido 3 vezes (uma por secao). Tenho que diferenciar pela ORDEM de aparecimento no DOM:
- nth=0: Score Final - Minimo para GO
- nth=1: Score Final - Maximo para NO-GO
- nth=2: Score Tecnico - Minimo para GO
- nth=3: Score Tecnico - Maximo para NO-GO
- nth=4: Score Juridico - Minimo para GO
- nth=5: Score Juridico - Maximo para NO-GO

```yaml
id: passo_03_preencher_limiares
acao:
  sequencia:
    # Score Final
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Minimo para GO")) input.text-input >> nth=0'
      valor_from_dataset: "limiar_final_go"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Maximo para NO-GO")) input.text-input >> nth=0'
      valor_from_dataset: "limiar_final_nogo"
      timeout: 5000
    # Score Tecnico
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Minimo para GO")) input.text-input >> nth=1'
      valor_from_dataset: "limiar_tecnico_go"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Maximo para NO-GO")) input.text-input >> nth=1'
      valor_from_dataset: "limiar_tecnico_nogo"
      timeout: 5000
    # Score Juridico
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Minimo para GO")) input.text-input >> nth=2'
      valor_from_dataset: "limiar_juridico_go"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Maximo para NO-GO")) input.text-input >> nth=2'
      valor_from_dataset: "limiar_juridico_nogo"
      timeout: 5000
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-F14_visual_fp.yaml#passo_03_preencher_limiares"
```

## Passo 04 — Salvar Limiares

Click "Salvar Limiares". `parametros_score.limiar_*` recebe os valores.

**Observe criticamente:**
- Apos click, feedback de sucesso
- 6 limiares persistidos
- Edital pos-salvar usa esses limiares pra classificar GO/NO-GO automaticamente


```yaml
id: passo_04_salvar_limiares
acao:
  sequencia:
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar Limiares")'
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F14_visual_fp.yaml#passo_04_salvar_limiares"
```
