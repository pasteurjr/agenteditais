---
uc_id: UC-P01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P01_visual_fp.yaml
---

# UC-P01 — Organizar Edital por Lotes (Fluxo Principal)

> **Predecessores:** UC-CV03 + UC-CV09
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Setup: navegar Fluxo Comercial > Precificacao

Sidebar > Fluxo Comercial > Precificacao. PrecificacaoPage carrega.

**Observe criticamente:**
- Sidebar com Fluxo Comercial expandido
- PrecificacaoPage com cabecalho "Precificacao" (com cedilha)
- Sub-titulo "Custos, precos, lances e estrategia competitiva"
- Card "Edital" visivel com Select "Selecione o edital" + botao "Criar Lotes"


```yaml
id: passo_00_navegar_precificacao
acao:
  sequencia:
    # IDEMPOTENTE: garante secao "Fluxo Comercial" expandida
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1, h2, .page-header h1, .page-header h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_00_navegar_precificacao"
```

## Passo 01 — Selecionar primeiro edital salvo (herdado da Sprint 2)

Abre Select "Selecione o edital" e escolhe o primeiro option (edital salvo do CV03 com maior score).

**Observe criticamente:**
- Select tem opcoes (edital salvo herdado)
- Apos selecao, tabs Lotes/Custos/Lances/Estrategia/Historico aparecem
- Aba "Lotes" ativa por default com badge ✅/⚠️/❌


```yaml
id: passo_01_selecionar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Selecione o edital/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Selecione o edital ausente');
          const sel = f.querySelector('select');
          if (!sel) throw new Error('select ausente');
          const opts = [...sel.options].filter(o => o.value);
          if (!opts.length) throw new Error('Sem editais salvos — precisa rodar UC-CV03 antes');
          sel.value = opts[0].value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'edital=' + opts[0].textContent.trim().slice(0, 40);
        }
    - tipo: wait
      valor_literal: 2000
    # Confere que tabs apareceram
    - tipo: wait_for
      seletor: 'button.tab-panel-tab, button[class*="tab"]'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_01_selecionar_edital"
```

## Passo 02 — Validar aba Lotes carregada com lote(s) herdado(s) da Sprint 2

Aba Lotes deve estar ativa (default). Lote criado em UC-CV09 (Sprint 2 Lote B) deve aparecer.

**Observe criticamente:**
- Cards de lote presentes (pelo menos 1, oriundo CV09)
- Cada card tem toggle de expansao (chevron)
- Badge de status do lote (configurado/pendente)


```yaml
id: passo_02_validar_aba_lotes_ativa
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'button:has-text("Lotes")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          // Procura cards de lote (h3 ou title contendo "Lote")
          const titulos = [...document.querySelectorAll('h3, h4, .card-title, [class*="card"] [class*="title"]')];
          const cards_lote = titulos.filter(el => /Lote\s+\d|Lote\s+0/i.test(el.textContent || ''));
          return cards_lote.length > 0 ? `${cards_lote.length} cards de lote` : 'nenhum card visivel ainda';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_02_validar_aba_lotes_ativa"
```

## Passo 03 — Expandir Card 'Lote 1' clicando no chevron

Click no toggle de expansao do primeiro lote. Secao "Parametros Tecnicos" + Tabela de Itens devem aparecer.

**Observe criticamente:**
- Apos click, chevron muda (down/up)
- Secao "Parametros Tecnicos" visivel com 5 campos: Especialidade, Volume Exigido, Tipo de Amostra, Equipamento Exigido, Descrição/Observações
- Tabela "Itens do Lote" visivel com colunas: #, Descrição, Qtd, Valor Unit., Produto Vinculado, Ações


```yaml
id: passo_03_expandir_lote_1
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Frontend: cabecalho do lote tem <strong>Lote N</strong> em div com cursor:pointer
          const strongs = [...document.querySelectorAll('strong')];
          const strong_lote = strongs.find(el => /Lote\s+\d/i.test(el.textContent || ''));
          if (!strong_lote) {
            const titulos = [...document.querySelectorAll('h3, h4, .card-title')];
            const tl = titulos.find(el => /Lote\s+\d/i.test(el.textContent || ''));
            if (!tl) throw new Error('Nenhum card de Lote encontrado');
            (tl.closest('div') || tl.parentElement).click();
            return 'expandido_via_h';
          }
          let clickable = strong_lote.parentElement;
          while (clickable && getComputedStyle(clickable).cursor !== 'pointer' && clickable.parentElement) {
            clickable = clickable.parentElement;
            if (clickable.tagName === 'BODY') break;
          }
          if (!clickable || clickable.tagName === 'BODY') {
            clickable = strong_lote.closest('div');
          }
          clickable.scrollIntoView({block:'center'});
          clickable.click();
          return 'expandido_lote_via_strong';
        }
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("Especialidade")) input, div.form-field:has(.form-field-label:has-text("Volume")) input'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_03_expandir_lote_1"
```

## Passo 04 — Preencher 5 campos: Especialidade, Volume, Tipo Amostra, Equipamento, Observações

Preenche os 5 campos do form do Lote 1 com valores reais.

**Observe criticamente:**
- "Especialidade": "Hematologia"
- "Volume Exigido": "50000"
- "Tipo de Amostra": "Sangue total"
- "Equipamento Exigido": "Analisador bioquimico"
- "Descricao/Observacoes": "Lote prioritario"
- Cada campo aceita digitação sem erro


```yaml
id: passo_04_preencher_parametros_tecnicos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const setVal = (label_re, val) => {
            const f = fields.find(x => new RegExp(label_re, 'i').test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
            if (!f) return false;
            const inp = f.querySelector('input');
            if (!inp) return false;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(inp, val);
            inp.dispatchEvent(new Event('input', {bubbles: true}));
            inp.dispatchEvent(new Event('change', {bubbles: true}));
            return true;
          };
          const r1 = setVal('^Especialidade$', 'Hematologia');
          const r2 = setVal('Volume Exigido', '50000');
          const r3 = setVal('Tipo de Amostra', 'Sangue total');
          const r4 = setVal('Equipamento Exigido', 'Analisador bioquimico');
          const r5 = setVal('Observa[cç][oõ]es|Descri[cç][aã]o', 'Lote prioritario');
          return JSON.stringify({esp:r1, vol:r2, amo:r3, eq:r4, obs:r5});
        }
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_04_preencher_parametros_tecnicos"
```

## Passo 05 — Click 'Atualizar Lote' — POST /api/crud/lotes ou /precificacao

Click no botao "Atualizar Lote" (verde com Check icon). Backend persiste parametros tecnicos.

**Observe criticamente:**
- Botao "Atualizar Lote" presente, habilitado, primary
- Apos click, request POST/PATCH para backend de lotes (status 200/201)
- Sem mensagem de erro vermelha


```yaml
id: passo_05_atualizar_lote
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Atualizar Lote/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_atualizar';
          if (btn.disabled) return 'botao_disabled';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_05_atualizar_lote"
```

## Passo 06 — Validar tabela 'Itens do Edital' visivel sob o lote

Apos expandir o lote, a tabela de itens deve estar visivel.

**Observe criticamente:**
- Heading "Itens do Edital" presente
- Tabela com pelo menos 1 linha (ou mensagem 'sem itens' valida)
- Colunas tipicas: #, Descrição, Qtd, Valor Unit., Produto, Ações


```yaml
id: passo_06_validar_tabela_itens
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const headings = [...document.querySelectorAll('h3, h4')];
          const itens_heading = headings.find(el => /Itens do Edital|Itens do Lote/i.test(el.textContent || ''));
          if (!itens_heading) return 'sem_heading_itens';
          itens_heading.scrollIntoView({block: 'center'});
          return 'tabela_visivel';
        }
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_06_validar_tabela_itens"
```
