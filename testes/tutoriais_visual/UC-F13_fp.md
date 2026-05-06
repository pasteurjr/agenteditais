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
    # IDEMPOTENTE: o estado da sidebar pode estar qualquer coisa entrando aqui
    # (UC-F01 deixou Configuracoes expandida e talvez Cadastros tambem).
    # Click cego em "Cadastros" pode COLAPSAR em vez de expandir.
    # Solucao: usar evaluate pra clicar SO se nao tiver classe .expanded.
    - tipo: evaluate
      valor_literal: |
        () => {
          const sectionBtn = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => {
              const label = b.querySelector('.nav-section-label');
              return label && label.textContent.trim() === 'Cadastros';
            });
          if (!sectionBtn) throw new Error('botao Cadastros nao encontrado');
          if (!sectionBtn.classList.contains('expanded')) sectionBtn.click();
          return 'cadastros expandido';
        }
    - tipo: wait_for
      seletor: 'button.nav-subsection-header:has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    # Mesma estrategia pro Portfolio (subsection):
    - tipo: evaluate
      valor_literal: |
        () => {
          const subBtn = [...document.querySelectorAll('button.nav-subsection-header')]
            .find(b => {
              const label = b.querySelector('.nav-item-label');
              return label && label.textContent.trim() === 'Portfolio';
            });
          if (!subBtn) throw new Error('botao Portfolio (subsecao) nao encontrado');
          if (!subBtn.classList.contains('expanded')) subBtn.click();
          return 'portfolio expandido';
        }
    - tipo: wait_for
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Areas"))'
      timeout: 5000
    # Click direto no item Areas (idempotente: se ja na pagina, click nao quebra)
    - tipo: click
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Areas"))'
      timeout: 5000
    # Espera CrudPage Areas carregar.
    - tipo: wait_for
      seletor: 'h1:text-is("Areas de Produto")'
      timeout: 15000
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
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
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "area_1_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
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
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "area_2_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
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
    # Garante Cadastros + Portfolio expandidos (idempotente)
    - tipo: evaluate
      valor_literal: |
        () => {
          const cad = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => b.querySelector('.nav-section-label')?.textContent.trim() === 'Cadastros');
          if (cad && !cad.classList.contains('expanded')) cad.click();
          const port = [...document.querySelectorAll('button.nav-subsection-header')]
            .find(b => b.querySelector('.nav-item-label')?.textContent.trim() === 'Portfolio');
          if (port && !port.classList.contains('expanded')) port.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Classes"))'
      timeout: 5000
    - tipo: click
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Classes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:text-is("Classes de Produto")'
      timeout: 15000
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_03_navegar_classes"
```

## Passo 04 — Criar Classe "Monitoracao" vinculada a "Equipamentos Medico-Hospitalares"

A pagina Classes eh CHILD TABLE: o filtro pai (Area) fica em um card no topo (`.crud-parent-selector`), com um `<select>` que carrega areas da empresa via `/api/areas-produto`. Eh OBRIGATORIO escolher a area antes de "Novo" (botao fica desabilitado caso contrario). O form de Novo NAO mostra campo `area_id` — esse FK eh preenchido automaticamente pelo `handleNew` (parentFk auto-fill).

```yaml
id: passo_04_criar_classe_1
acao:
  sequencia:
    # 1. Selecionar a area no filtro pai (card crud-parent-selector).
    #    Aguarda <select> aparecer (1 elemento, nao multiple).
    - tipo: wait_for
      seletor: '.crud-parent-selector select'
      timeout: 10000
    # Pequena espera pra options carregarem via API GET /api/areas-produto
    - tipo: wait
      valor_literal: 1500
    - tipo: select
      seletor: '.crud-parent-selector select'
      valor_from_dataset: "classe_1_area"
      timeout: 5000
    # 2. Aguarda Novo ficar habilitado (sem opacity 0.5)
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    # 3. Preenche o nome (label = "Nome", input dentro de div.form-field)
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "classe_1_nome"
      timeout: 5000
    # 4. Salvar — botao Salvar fica no card-actions do form (action-button-primary)
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Monitoração'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_04_criar_classe_1"
```

## Passo 05 — Criar Classe "Reagentes Bioquimicos" sob "Diagnostico in Vitro"

```yaml
id: passo_05_criar_classe_2
acao:
  sequencia:
    # Troca a area do filtro pai (continua na CrudPage Classes — sidebar nao mexeu)
    - tipo: select
      seletor: '.crud-parent-selector select'
      valor_from_dataset: "classe_2_area"
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "classe_2_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Reagentes Bioquímicos'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_05_criar_classe_2"
```

## Passo 06 — Criar Classe "Reagentes e Kits Diagnosticos" sob "Diagnostico in Vitro"

A area do filtro JA eh "Diagnostico in Vitro" (do passo 05). So precisa Novo + Nome + Salvar.

```yaml
id: passo_06_criar_classe_3
acao:
  sequencia:
    # Garante que area do filtro continua em "Diagnostico in Vitro" (idempotente)
    - tipo: select
      seletor: '.crud-parent-selector select'
      valor_from_dataset: "classe_3_area"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "classe_3_nome"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
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
    - tipo: evaluate
      valor_literal: |
        () => {
          const cad = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => b.querySelector('.nav-section-label')?.textContent.trim() === 'Cadastros');
          if (cad && !cad.classList.contains('expanded')) cad.click();
          const port = [...document.querySelectorAll('button.nav-subsection-header')]
            .find(b => b.querySelector('.nav-item-label')?.textContent.trim() === 'Portfolio');
          if (port && !port.classList.contains('expanded')) port.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Subclasses"))'
      timeout: 5000
    - tipo: click
      seletor: 'div.nav-subsection-items button.nav-item:has(.nav-item-label:text-is("Subclasses"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:text-is("Subclasses de Produto")'
      timeout: 15000
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_07_navegar_subclasses"
```

## Passo 08 — Criar Subclasse "Monitor Multiparametrico" (NCM 9018.19.90)

```yaml
id: passo_08_criar_subclasse_1
acao:
  sequencia:
    # Subclasses tem 2 selects de filtro (grandparent Area + parent Classe).
    # Card .crud-parent-selector contem 2 <select>; pela ordem do DOM:
    #   - 1o select = grandparent (Area)
    #   - 2o select = parent (Classe), DISABLED ate area selecionada
    - tipo: wait_for
      seletor: '.crud-parent-selector select >> nth=0'
      timeout: 10000
    - tipo: wait
      valor_literal: 1500
    # 1. Selecionar Area no 1o select (grandparent)
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=0'
      valor_from_dataset: "subclasse_1_area"
      timeout: 5000
    # 2. Aguardar 2o select carregar (1.5s pra fetch GET classes filtradas)
    - tipo: wait
      valor_literal: 1500
    # 3. Selecionar Classe no 2o select (parent)
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=1'
      valor_from_dataset: "subclasse_1_classe"
      timeout: 5000
    # 4. Click Novo
    - tipo: wait_for
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    # 5. Preencher Nome (campo classe_id NAO aparece — auto-fill)
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "subclasse_1_nome"
      timeout: 5000
    # 6. Preencher NCMs (campo type=json — textarea, espera array JSON tipo ["9018.19.90"])
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("NCMs")) textarea.textarea-input'
      valor_literal: '["9018.19.90"]'
      timeout: 5000
    # 7. Salvar
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Monitor Multiparamétrico'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_08_criar_subclasse_1"
```

## Passo 09 — Criar Subclasse "Reagente para Glicose" sob Diagnostico/Reagentes Bioquimicos

```yaml
id: passo_09_criar_subclasse_2
acao:
  sequencia:
    # Troca area no grandparent (1o select)
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=0'
      valor_from_dataset: "subclasse_2_area"
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    # Troca classe no parent (2o select)
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=1'
      valor_from_dataset: "subclasse_2_classe"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "subclasse_2_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("NCMs")) textarea.textarea-input'
      valor_literal: '["3822.19.90"]'
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Reagente para Glicose'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_09_criar_subclasse_2"
```

## Passo 10 — Criar Subclasse "Kit de Hematologia" sob Diagnostico/Reagentes e Kits

```yaml
id: passo_10_criar_subclasse_3
acao:
  sequencia:
    # Area continua "Diagnostico in Vitro" (do passo 09); so troca a classe.
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=0'
      valor_from_dataset: "subclasse_3_area"
      timeout: 5000
    - tipo: wait
      valor_literal: 1500
    - tipo: select
      seletor: '.crud-parent-selector select >> nth=1'
      valor_from_dataset: "subclasse_3_classe"
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Novo")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("Nome")) input.text-input'
      valor_from_dataset: "subclasse_3_nome"
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:text-is("NCMs")) textarea.textarea-input'
      valor_literal: '["3822.19.90"]'
      timeout: 5000
    - tipo: click
      seletor: 'button.action-button-primary:has-text("Salvar")'
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
    # IDEMPOTENTE — expand-if-collapsed da secao Configuracoes (NAO toggle cego).
    # Importante: ha 2 "Portfolio" na sidebar; queremos o nav-item de Configuracoes,
    # NAO o nav-subsection-header de Cadastros.
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
    # Portfolio nav-item dentro de Configuracoes.
    # nav-item nao tem .nav-section-header nem .nav-subsection-header como classes —
    # mas pra extra seguranca filtramos com :not.
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    # PortfolioPage carregou.
    - tipo: wait_for
      seletor: 'h1:has-text("Portfolio"), h2:has-text("Portfolio")'
      timeout: 10000
    # Aba "Classificacao" (SEM acento — codigo da PortfolioPage.tsx renderiza assim)
    - tipo: wait_for
      seletor: 'button.ptab:has-text("Classificacao")'
      timeout: 5000
    - tipo: click
      seletor: 'button.ptab:has-text("Classificacao")'
      timeout: 5000
    - tipo: wait_for
      seletor: 'text=Equipamentos Médico-Hospitalares'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_11_visualizar_arvore"
```

## Passo 12 — Cadastrar Mascara de Campos da subclasse "Monitor Multiparametro" (NOVO em V6)

Configura `campos_mascara` (8 campos) na subclasse via PUT direto na API. Equivalente
ao Passo 4.1-4.3 dos tutoriais humanos V6. Sem isso o cadastro de produto (UC-F08)
nao tem orientacao dos campos esperados — bug historico que Arnaldo reportou.

```yaml
id: passo_12_cadastrar_mascara_monitor
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/subclasses-produto?limit=100', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`GET subclasses ${r.status}`);
          const data = await r.json();
          const items = data.items || [];
          const monitor = items.find(s => /Monitor Multipar/i.test(s.nome || ''));
          if (!monitor) throw new Error(`Subclasse Monitor nao encontrada (total=${items.length})`);

          const mascara = [
            { campo: "Tela", tipo: "texto", unidade: "polegadas", obrigatorio: true },
            { campo: "Parâmetros Monitorados", tipo: "texto", obrigatorio: true },
            { campo: "Tipo de Paciente", tipo: "select", opcoes: ["Adulto","Pediátrico","Neonatal"], obrigatorio: true },
            { campo: "Bateria Interna", tipo: "decimal", unidade: "horas" },
            { campo: "Peso", tipo: "decimal", unidade: "kg" },
            { campo: "Alimentação", tipo: "texto", unidade: "V" },
            { campo: "Classe ANVISA", tipo: "select", opcoes: ["I","II","III","IV"], obrigatorio: true },
            { campo: "Registro ANVISA", tipo: "texto", obrigatorio: true }
          ];

          const r2 = await fetch(`/api/crud/subclasses-produto/${monitor.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
            body: JSON.stringify({ ...monitor, campos_mascara: mascara })
          });
          if (!r2.ok) throw new Error(`PUT subclasse ${r2.status}: ${(await r2.text()).substring(0,200)}`);

          const r3 = await fetch(`/api/crud/subclasses-produto/${monitor.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const final = await r3.json();
          const m = final.campos_mascara || [];
          if (m.length !== 8) throw new Error(`Esperado 8 campos na mascara, achou ${m.length}`);

          window.__test_mascara_monitor_id = monitor.id;
          return `mascara_monitor_OK subclasse=${monitor.nome.substring(0,30)} campos=${m.length}`;
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-F13_visual_fp.yaml#passo_12_cadastrar_mascara_monitor"
```

