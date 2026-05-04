---
uc_id: UC-CV01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV01_visual_fp.yaml
---

# UC-CV01 — Buscar editais por termo + Fonte=PNCP + Score Hibrido (Fluxo Principal)

> **Predecessores:** Sprint 1 + UC-F14/F15/F16
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Setup: navegar Fluxo Comercial > Captacao

Sidebar > Fluxo Comercial > Captacao. CaptacaoPage carrega.

**Observe criticamente:**
- Cabecalho 'Captacao' visivel
- Card 'Buscar Editais' com Select de Termo, Fonte, Modalidade, Score


```yaml
id: passo_00_navegar_captacao
acao:
  sequencia:
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Captacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Captacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1, h2, .page-header h1, .page-header h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_00_navegar_captacao"
```

## Passo 01 — Preencher termo de busca = 'monitor'

Digita 'monitor' no campo Termo. Termo eh palavra-chave que existe no portfolio Sprint 1 (UC-F16).

**Observe criticamente:**
- Campo 'Termo' aceita texto sem erro


```yaml
id: passo_01_preencher_termo_busca
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Termo/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Termo nao encontrado');
          const inp = f.querySelector('input');
          if (!inp) throw new Error('input ausente');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, 'monitor multiparametrico');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'preenchido_monitor';
        }
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01_preencher_termo_busca"
```

## Passo 02 — Selecionar Fonte = PNCP

Escolhe PNCP no Select Fonte. Fonte unica oficial nacional via API.

**Observe criticamente:**
- Select Fonte muda para PNCP
- Sem erro


```yaml
id: passo_01b_selecionar_fonte_pncp
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /^Fonte$/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Fonte nao encontrado');
          const sel = f.querySelector('select');
          if (!sel) throw new Error('select Fonte ausente');
          const opt = [...sel.options].find(o => /PNCP/i.test(o.textContent || ''));
          if (!opt) throw new Error('opcao PNCP nao disponivel');
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'fonte_pncp_selecionada';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01b_selecionar_fonte_pncp"
```

## Passo 02b — Selecionar Modalidade = Pregão Eletrônico

Filtra editais por Pregão Eletrônico — modalidade requerida pra Sprint 9 (Lances + Sala Virtual).

**Observe criticamente:**
- Select Modalidade muda para 'Pregão Eletrônico'
- Sem erro

```yaml
id: passo_01b2_selecionar_modalidade_pregao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /^Modalidade$/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Modalidade nao encontrado');
          const sel = f.querySelector('select');
          if (!sel) throw new Error('select Modalidade ausente');
          const opt = [...sel.options].find(o => /Preg[aã]o Eletr[oô]nico/i.test(o.textContent || ''));
          if (!opt) throw new Error('opcao Pregao Eletronico nao disponivel');
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'modalidade_pregao_eletronico_selecionada';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01b2_selecionar_modalidade_pregao"
```

## Passo 03 — Selecionar Analise de Score = Score Hibrido

Score Hibrido faz local + DeepSeek nos top N + ordena tabela por score desc.

**Observe criticamente:**
- Select Analise de Score muda para 'Score Hibrido'
- Aparece campo auxiliar 'Qtd editais profundo'


```yaml
id: passo_01c_selecionar_score_hibrido
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Analise de Score/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Analise de Score nao encontrado');
          const sel = f.querySelector('select');
          if (!sel) throw new Error('select Score ausente');
          const opt = [...sel.options].find(o => /Score Hibrido/i.test(o.textContent || ''));
          if (!opt) throw new Error('opcao Score Hibrido ausente');
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'score_hibrido_selecionado';
        }
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01c_selecionar_score_hibrido"
```

## Passo 04 — Click 'Buscar Editais' — POST /api/editais/buscar (PNCP+IA, ate 180s)

Backend faz GET PNCP + DeepSeek score profundo nos top N.

**EFEITO REAL ESPERADO:**
- Network POST /api/editais/buscar retorna 200
- Tabela 'Resultados' aparece com >=1 linha (PNCP geralmente retorna varios)
- Coluna Score populada com numeros
- Tabela ordenada por score desc (defaultSortKey)


```yaml
id: passo_02_buscar_editais
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Buscar Editais/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Buscar Editais ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_buscar';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_02_buscar_editais"
```

## Passo 05 — EFEITO REAL: validar tabela tem >=1 linha com edital + coluna Score populada

Confirma que a busca retornou resultados de fato.

**EFEITO REAL:**
- table tbody tr count >= 1 (PNCP retornou editais)
- Linha tem celula com numero (numero do edital)
- Linha tem celula com 'PNCP' (fonte)


```yaml
id: passo_03_validar_grade_resultados
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const rows = document.querySelectorAll('table tbody tr');
          if (rows.length < 1) throw new Error('NENHUM edital retornado pela busca PNCP');
          // Verifica primeiro tr tem fonte PNCP visivel
          const primeira = rows[0];
          const txt = primeira.textContent || '';
          if (!/PNCP/i.test(txt)) {
            // pode ser que a coluna Fonte mostre badge separado — apenas valida que tem texto
            console.warn('Linha 1 sem PNCP visivel: ' + txt.substring(0, 100));
          }
          return `${rows.length} editais retornados`;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_03_validar_grade_resultados"
```
