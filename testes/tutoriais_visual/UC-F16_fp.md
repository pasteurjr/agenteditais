---
uc_id: UC-F16
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F16_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F16_visual_fp.yaml
---

# UC-F16 — Configurar fontes, palavras-chave e NCMs (Fluxo Principal)

> **PO:** acompanhe a execucao. Cada parada eh um marco logico — voce decide aprovar/reprovar e opcionalmente comenta.
>
> **Cenario:** apos UC-F01+UC-F18, navega para Configuracoes>Parametrizacoes aba "Fontes de Busca". A aba contem 3 cards empilhados (Fontes de Editais, Palavras-chave de Busca, NCMs para Busca). Cadastra palavras-chave de busca via botao "+ Editar" -> input -> Salvar; cadastra NCMs via "+ Adicionar NCM" -> input -> Salvar.
>
> **Pre-requisitos:**
> - UC-F01 + UC-F18 ja executados (empresa criada, vinculada e ativa)
> - paramScore da empresa pode estar vazio ou ja com algumas palavras (cenario inicial: vazio)

## Passo 00 — Setup: navegar Parametrizacoes aba "Fontes de Busca"

Navega pela sidebar (Configuracoes -> Parametrizacoes), espera a pagina carregar com cabecalho "Parametrizacoes", troca para aba "Fontes de Busca" e confirma que o card "Palavras-chave de Busca" esta no DOM.

**Observe criticamente:**
- Sidebar com secao "CONFIGURACOES" expandida (idempotente)
- Item "Parametrizacoes" recebe click e leva pra `ParametrizacoesPage`
- Cabecalho "Parametrizacoes" visivel com tabs (Score, Comercial, Fontes de Busca, Notificacoes, Preferencias, Classes)
- Tab "Fontes de Busca" fica destacada (active)
- 3 cards aparecem empilhados em ordem: "Fontes de Editais", "Palavras-chave de Busca", "NCMs para Busca"

```yaml
id: passo_00_setup_navegar_aba_fontes
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
    - tipo: click
      seletor: 'button.tab-panel-tab:has(.tab-label:has-text("Fontes de Busca"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.tab-panel-tab.active:has(.tab-label:has-text("Fontes de Busca"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.card-title:has-text("Palavras-chave"), h3:has-text("Palavras-chave")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_00_setup_navegar_aba_fontes"
```

## Passo 01 — Editar palavras-chave e salvar

Localiza o card "Palavras-chave de Busca", clica no botao "+ Editar" (tag-add), preenche o input com a string CSV de palavras-chave do dataset e clica "Salvar". Apos salvar, o card volta ao modo visualizacao com as tags renderizadas.

**Observe criticamente:**
- Botao "+ Editar" eh um `<button class="tag tag-add">` dentro do `tags-container`
- Click revela form-field com label "Palavras-chave (separadas por virgula)" + input + botoes Salvar/Cancelar
- Input fica preenchido com palavras existentes (ou vazio se cenario inicial)
- Apos salvar, modo visualizacao volta com cada palavra como `<span class="tag">`
- Toast/feedback "Salvo com sucesso" pode aparecer brevemente
- `paramScore.palavras_chave` no banco recebe array das palavras

```yaml
id: passo_01_editar_e_salvar_palavras_chave
acao:
  sequencia:
    # Click no botao "+ Editar" (tag) do Card Palavras-chave
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Palavras-chave/i.test(el.textContent || ''));
          if (!card) throw new Error('Card Palavras-chave nao encontrado');
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          if (!container) throw new Error('Container .card nao encontrado');
          container.scrollIntoView({block: 'center'});
          // Procura botao com "Editar" (tag-add)
          const buttons = [...container.querySelectorAll('button')];
          const btn = buttons.find(b => /Editar/i.test(b.textContent || ''));
          if (!btn) {
            const labels = buttons.map(b => (b.textContent || '').trim()).join(' | ');
            throw new Error('Botao Editar nao encontrado em Palavras-chave. Botoes: ' + labels);
          }
          btn.click();
          return 'clicked';
        }
    # Aguarda input de palavras-chave aparecer
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("Palavras-chave (separadas por virgula)")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Palavras-chave (separadas por virgula)")) input.text-input'
      valor_from_dataset: "palavras_chave"
      timeout: 5000
    # Click no botao Salvar mais proximo (do card de palavras-chave)
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Palavras-chave/i.test(el.textContent || ''));
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const buttons = [...container.querySelectorAll('button.action-button-primary')];
          const btn = buttons.find(b => /Salvar/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Salvar nao encontrado em Palavras-chave');
          btn.click();
          return 'saved';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_01_editar_e_salvar_palavras_chave"
```

## Passo 02 — Adicionar NCMs e salvar

Mesmo padrao do passo anterior, mas no card "NCMs para Busca". Scroll, click no botao "+ Adicionar NCM" (tag-add), preenche input com CSV de NCMs e clica "Salvar".

**Observe criticamente:**
- Card "NCMs para Busca" tem subtitulo "Extraidos automaticamente das classes/subclasses do portfolio"
- Botao do card tem texto "+ Adicionar NCM" (nao "+ Editar")
- Form-field tem label "NCMs (separados por virgula)" + placeholder com exemplo (ex: "9011.10.00, 9011.20.00, 8421.19.10")
- NCMs validos seguem padrao 4-2-2 (8 digitos com pontos)
- Apos salvar, cada NCM vira `<span class="tag">` no `tags-container`
- `paramScore.ncms_busca` no banco recebe array dos NCMs

```yaml
id: passo_02_editar_e_salvar_ncms
acao:
  sequencia:
    # Scroll ate o card NCMs
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /NCMs para Busca/i.test(el.textContent || ''));
          if (!card) throw new Error('Card NCMs nao encontrado');
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          if (!container) throw new Error('Container .card NCMs nao encontrado');
          container.scrollIntoView({block: 'center'});
          const buttons = [...container.querySelectorAll('button')];
          const btn = buttons.find(b => /Adicionar NCM|Editar/i.test(b.textContent || ''));
          if (!btn) {
            const labels = buttons.map(b => (b.textContent || '').trim()).join(' | ');
            throw new Error('Botao Adicionar/Editar NCM nao encontrado. Botoes: ' + labels);
          }
          btn.click();
          return 'opened';
        }
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("NCMs (separados por virgula)")) input.text-input'
      timeout: 5000
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("NCMs (separados por virgula)")) input.text-input'
      valor_from_dataset: "ncms"
      timeout: 5000
    # Salvar
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /NCMs para Busca/i.test(el.textContent || ''));
          let container = card;
          while (container && !container.classList.contains('card')) container = container.parentElement;
          const buttons = [...container.querySelectorAll('button.action-button-primary')];
          const btn = buttons.find(b => /Salvar/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Salvar nao encontrado em NCMs');
          btn.click();
          return 'saved';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F16_visual_fp.yaml#passo_02_editar_e_salvar_ncms"
```
