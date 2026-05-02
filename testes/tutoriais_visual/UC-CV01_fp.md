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

## Passo 02 — Click "Buscar Editais" e aguardar PNCP

Click no botao "Buscar Editais". Backend faz GET /api/editais/buscar com o termo + filtros e consulta PNCP. **Pode demorar 30-180s** dependendo do PNCP.

**Observe criticamente:**
- Botao muda para estado loading (spinner ou "Buscando...")
- Apos retorno, grade de editais aparece (1 ou mais resultados)
- Cada linha mostra: numero edital, orgao, valor estimado, prazo, etc
- Sem erro vermelho na tela
- POST /api/editais/buscar (ou GET) retorna 200

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
