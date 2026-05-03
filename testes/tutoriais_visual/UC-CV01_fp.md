---
uc_id: UC-CV01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV01_visual_fp.yaml
---

# UC-CV01 — Buscar editais por termo, classificacao e score (Fluxo Principal)

> **PO:** acompanhe a execucao. A busca chama o PNCP (rede externa) — pode demorar 30-180s.
>
> **Cenario:** apos Sprint 1 ter cadastrado palavras-chave (UC-F16), pesos (UC-F14) e parametros comerciais (UC-F15), navega para Fluxo Comercial > Captacao. Preenche termo de busca (palavra do portfolio), clica "Buscar Editais", aguarda PNCP retornar, grade de editais aparece.
>
> **Pre-requisitos:** Sprint 1 inteira concluida — empresa, hierarquia (UC-F13), parametros score (UC-F14), palavras-chave (UC-F16) ja existem.

## Passo 00 — Setup: navegar para Fluxo Comercial > Captacao

Sidebar expande "Fluxo Comercial" (idempotente) -> click "Captacao". Pagina carrega com cabecalho "Captacao".

**Observe criticamente:**
- Sidebar com secao "FLUXO COMERCIAL" expandida
- Item "Captacao" recebe click
- CaptacaoPage carrega com cabecalho "Captacao"
- Card "Buscar Editais" visivel (campos: Termo/Produto, UF, Fonte, Area, Classe, Subclasse, Modalidade, Origem)
- Botao "Buscar Editais" (azul) presente

```yaml
id: passo_00_setup_navegar_captacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => {
              const t = b.querySelector('.nav-section-label')?.textContent.trim();
              return /Fluxo Comercial/i.test(t || '');
            });
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
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 15000
    - tipo: wait_for
      seletor: '.card-title:has-text("Buscar Editais"), h3:has-text("Buscar Editais")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_00_setup_navegar_captacao"
```

## Passo 01 — Preencher termo de busca

Digita o termo no campo "Termo / Produto". Termo eh uma palavra-chave do portfolio (cadastrada em UC-F16).

**Observe criticamente:**
- Campo "Termo / Produto" aceita o texto digitado
- Pode aparecer dropdown sugerindo produtos do portfolio (autocompletar)
- Campo nao limpa nem rejeita

```yaml
id: passo_01_preencher_termo
acao:
  sequencia:
    # Foca o campo e digita
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Termo / Produto")) input.form-input'
      valor_from_dataset: "termo_busca"
      timeout: 5000
    # Fecha dropdown se abriu
    - tipo: evaluate
      valor_literal: |
        () => { document.body.click(); return 'ok'; }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01_preencher_termo"
```

## Passo 01b — Selecionar Fonte = "PNCP"

Abre o SelectInput "Fonte" e escolhe a opcao com label "PNCP". Garante que a busca vai consultar **somente** PNCP, deixando a execucao deterministica.

**Observe criticamente:**
- Campo "Fonte" muda de "Todas as fontes" para "PNCP"
- Sem erro visual

```yaml
id: passo_01b_selecionar_fonte_pncp
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Acha o select cujo label e "Fonte"
          const fields = [...document.querySelectorAll('div.form-field')];
          const field = fields.find(f => /^Fonte$/i.test(f.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!field) throw new Error('campo Fonte nao encontrado');
          const select = field.querySelector('select');
          if (!select) throw new Error('select de Fonte nao encontrado');
          // Acha a option cujo label contem "PNCP"
          const opt = [...select.options].find(o => /PNCP/i.test(o.textContent || ''));
          if (!opt) throw new Error('opcao PNCP nao encontrada no select Fonte');
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return 'fonte=' + opt.textContent;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01b_selecionar_fonte_pncp"
```

## Passo 01c — Selecionar Analise de Score = "Score Hibrido"

Abre o SelectInput "Analise de Score" e escolhe "Score Hibrido". Isso faz o backend calcular score local + score profundo (DeepSeek) para os top N editais. Quando `tipoScore !== "nenhum"`, a tabela vem **ordenada por score desc** automaticamente — o primeiro `<tr>` sera sempre o edital com maior score.

**Observe criticamente:**
- Campo "Analise de Score" muda para "Score Hibrido"
- Aparece o filtro auxiliar "Qtd editais profundo" (default 5/10)

```yaml
id: passo_01c_selecionar_score_hibrido
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const field = fields.find(f => /Analise de Score/i.test(f.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!field) throw new Error('campo Analise de Score nao encontrado');
          const select = field.querySelector('select');
          if (!select) throw new Error('select de Score nao encontrado');
          const opt = [...select.options].find(o => /Score Hibrido/i.test(o.textContent || ''));
          if (!opt) throw new Error('opcao Score Hibrido nao encontrada');
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return 'score=' + opt.textContent;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_01c_selecionar_score_hibrido"
```

## Passo 02 — Click "Buscar Editais" e aguardar PNCP + Score Hibrido

Click no botao "Buscar Editais". Backend faz GET /api/editais/buscar com termo + Fonte=PNCP + tipoScore=hibrido. PNCP responde primeiro (~30-60s) e depois o backend calcula score profundo dos top N (DeepSeek). **Total pode chegar a 180s**.

**Observe criticamente:**
- Botao muda para estado loading (spinner ou "Buscando...")
- Apos retorno, grade de editais aparece **ordenada por score desc**
- Coluna "Score" populada (nao mais "—")
- Cada linha mostra: numero edital, orgao, valor estimado, prazo, score numerico
- Sem erro vermelho na tela
- GET /api/editais/buscar retorna 200

```yaml
id: passo_02_buscar_editais
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Buscar Editais/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Buscar Editais nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    # Aguarda backend responder — timeout generoso pra PNCP
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_02_buscar_editais"
```

## Passo 03 — Confirmar grade de resultados

Verifica que a grade tem pelo menos 1 linha com edital, OU mensagem clara "0 resultados" (caso PNCP nao tenha retornado nada com esse termo).

**Observe criticamente:**
- Tabela ou cards com editais aparece abaixo do botao "Buscar"
- Cada linha tem dados: numero, orgao, modalidade, valor, prazo
- OU mensagem "Nenhum resultado encontrado" claramente visivel
- Sem indicador de loading restante

```yaml
id: passo_03_confirmar_resultados
acao:
  sequencia:
    # Aceita: tabela com pelo menos uma linha OU mensagem de "nenhum resultado"
    - tipo: wait_for
      seletor: 'table tbody tr, .edital-card, [class*="empty"], [class*="no-results"]'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV01_visual_fp.yaml#passo_03_confirmar_resultados"
```
