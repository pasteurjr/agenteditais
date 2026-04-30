---
uc_id: UC-F13
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F13_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F13_visual_fp.yaml
---

# UC-F13 V8 — Gerir e consultar classificacao Area/Classe/Subclasse (Fluxo Principal) — Trilha Visual

> **PO:** acompanhe a execucao. UC-F13 V8 cria a hierarquia Area→Classe→Subclasse pra empresa do ciclo (criada e vinculada por UC-F01 + UC-F18). Cada CRUD eh empresa_scoped — empresa nova nasce sem nada.
>
> **Cenario:** apos UC-F01 (que criou empresa, vinculou e selecionou), navegar pelos 3 CRUDs em Cadastros → Portfolio: Areas, Classes, Subclasses. Cria 2 areas, 3 classes, 3 subclasses na ordem certa. No fim, visualiza a arvore consolidada na PortfolioPage aba Classificacao.

---

## Passo 00 — Setup: navegar para CRUD de Areas de Produto

UC-F13 **assume UC-F01 ja foi executado no mesmo teste**. Empresa esta criada, vinculada ao user e selecionada como ativa. Sidebar tem secao "Cadastros" disponivel.

**Observe criticamente:**
- Sidebar mostra secao "Cadastros" (a partir do shell autenticado da empresa)
- Subseccao "Portfolio" expande
- Item "Areas" leva ao CRUD de areas_produto
- Pagina CRUD "Areas de Produto" carrega com botao Novo

```yaml
id: passo_00_setup_navegar_areas
acao:
  sequencia:
    - tipo: click
      seletor: '.nav-section-label:has-text("Cadastros"), button.nav-section-header:has-text("Cadastros")'
      timeout: 10000
    - tipo: wait_for
      seletor: '.nav-subsection-header:has-text("Portfolio"), button.nav-subsection-header:has-text("Portfolio")'
      timeout: 5000
    - tipo: click
      seletor: '.nav-subsection-header:has-text("Portfolio"), button.nav-subsection-header:has-text("Portfolio")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.nav-item .nav-item-label:text-is("Areas")'
      timeout: 5000
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Areas"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Áreas de Produto"), h2:has-text("Áreas de Produto"), h1:has-text("Areas de Produto"), h2:has-text("Areas de Produto")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_00_setup_navegar_areas"
```

## Passo 01 — Criar Area "Equipamentos Medico-Hospitalares"

Cria a primeira area no CRUD `areas-produto`. POST /api/crud/areas-produto.

**Observe criticamente:**
- Botao Novo expande formulario com campo Nome
- Apos preencher e Salvar, area aparece na listagem

```yaml
id: passo_01_criar_area_1
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Nome"), input[name="nome"]'
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "area_1_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Equipamentos Médico-Hospitalares'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_01_criar_area_1"
```

## Passo 02 — Criar Area "Diagnostico in Vitro e Laboratorio"

Cria a segunda area.

**Observe criticamente:**
- 2 areas listadas no CRUD apos salvar

```yaml
id: passo_02_criar_area_2
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Nome"), input[name="nome"]'
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "area_2_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Diagnóstico in Vitro'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_02_criar_area_2"
```

## Passo 03 — Navegar para CRUD de Classes

Sidebar (ja com Portfolio expandido), click no item "Classes".

```yaml
id: passo_03_navegar_classes
acao:
  sequencia:
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Classes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Classes"), h2:has-text("Classes")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_03_navegar_classes"
```

## Passo 04 — Criar Classe "Monitoracao" vinculada a "Equipamentos Medico-Hospitalares"

Select de Area carrega via API filtrada pela empresa atual — area criada no passo 01 ja eh opcao.

```yaml
id: passo_04_criar_classe_1
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Área"), label:has-text("Area"), select[name="area_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="area_id"]'
      alternativa: 'label:has-text("Área") ~ select, label:has-text("Area") ~ select'
      valor_from_dataset: "classe_1_area"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "classe_1_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Monitoração'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_04_criar_classe_1"
```

## Passo 05 — Criar Classe "Reagentes Bioquimicos"

```yaml
id: passo_05_criar_classe_2
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Área"), label:has-text("Area"), select[name="area_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="area_id"]'
      alternativa: 'label:has-text("Área") ~ select, label:has-text("Area") ~ select'
      valor_from_dataset: "classe_2_area"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "classe_2_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Reagentes Bioquímicos'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_05_criar_classe_2"
```

## Passo 06 — Criar Classe "Reagentes e Kits Diagnosticos"

```yaml
id: passo_06_criar_classe_3
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Área"), label:has-text("Area"), select[name="area_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="area_id"]'
      alternativa: 'label:has-text("Área") ~ select, label:has-text("Area") ~ select'
      valor_from_dataset: "classe_3_area"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "classe_3_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Reagentes e Kits'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_06_criar_classe_3"
```

## Passo 07 — Navegar para CRUD de Subclasses

```yaml
id: passo_07_navegar_subclasses
acao:
  sequencia:
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Subclasses"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Subclasses"), h2:has-text("Subclasses")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_07_navegar_subclasses"
```

## Passo 08 — Criar Subclasse "Monitor Multiparametrico" (NCM 9018.19.90)

```yaml
id: passo_08_criar_subclasse_1
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Classe"), select[name="classe_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="classe_id"]'
      alternativa: 'label:has-text("Classe") ~ select'
      valor_from_dataset: "subclasse_1_classe"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "subclasse_1_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="ncm"], label:has-text("NCM") ~ input, label:has-text("NCM") + input'
      valor_from_dataset: "subclasse_1_ncm"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Monitor Multiparamétrico'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_08_criar_subclasse_1"
```

## Passo 09 — Criar Subclasse "Reagente para Glicose" (NCM 3822.19.90)

```yaml
id: passo_09_criar_subclasse_2
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Classe"), select[name="classe_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="classe_id"]'
      alternativa: 'label:has-text("Classe") ~ select'
      valor_from_dataset: "subclasse_2_classe"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "subclasse_2_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="ncm"], label:has-text("NCM") ~ input, label:has-text("NCM") + input'
      valor_from_dataset: "subclasse_2_ncm"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Reagente para Glicose'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_09_criar_subclasse_2"
```

## Passo 10 — Criar Subclasse "Kit de Hematologia" (NCM 3822.19.90)

```yaml
id: passo_10_criar_subclasse_3
acao:
  sequencia:
    - tipo: click
      seletor: 'button:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'label:has-text("Classe"), select[name="classe_id"]'
      timeout: 10000
    - tipo: select
      seletor: 'select[name="classe_id"]'
      alternativa: 'label:has-text("Classe") ~ select'
      valor_from_dataset: "subclasse_3_classe"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="nome"], label:has-text("Nome") ~ input, label:has-text("Nome") + input'
      valor_from_dataset: "subclasse_3_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'input[name="ncm"], label:has-text("NCM") ~ input, label:has-text("NCM") + input'
      valor_from_dataset: "subclasse_3_ncm"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar"), button:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Kit de Hematologia'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_10_criar_subclasse_3"
```

## Passo 11 — Visualizar arvore consolidada (PortfolioPage aba Classificacao)

Apos criar tudo, navegar para PortfolioPage e conferir arvore.

**Observe criticamente:**
- Aba "Classificacao" aparece na PortfolioPage
- 2 areas listadas: Equipamentos Medico-Hospitalares + Diagnostico in Vitro
- Ao expandir, classes e subclasses aparecem
- NCMs visiveis nas subclasses

```yaml
id: passo_11_visualizar_arvore
acao:
  sequencia:
    - tipo: click
      seletor: 'button.nav-section-header:has-text("Configuracoes"), button.nav-section-header:has-text("Configurações"), .nav-section-label:has-text("Configuracoes"), .nav-section-label:has-text("Configurações")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.nav-item .nav-item-label:text-is("Portfolio")'
      timeout: 5000
    - tipo: click
      seletor: 'button.nav-item:has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Classificação'
      timeout: 10000
    - tipo: click
      seletor: 'text=Classificação'
      alternativa: 'button:has-text("Classificação"), [role="tab"]:has-text("Classificação")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Equipamentos Médico-Hospitalares'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_11_visualizar_arvore"
```
