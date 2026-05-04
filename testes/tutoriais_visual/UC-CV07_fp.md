---
uc_id: UC-CV07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV07_visual_fp.yaml
---

# UC-CV07 — Listar editais salvos em ValidacaoPage e selecionar (maior score) (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Setup: navegar Fluxo Comercial > Validacao

ValidacaoPage. Card 'Meus Editais' com tabela editais salvos.

**Observe criticamente:**
- Cabecalho 'Validacao'
- Tabela com pelo menos 1 edital salvo (de CV03)


```yaml
id: passo_00_navegar_validacao
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Validacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Validacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1, h2, .page-header h1, .page-header h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_00_navegar_validacao"
```

## Passo 01 — EFEITO REAL: validar tabela 'Meus Editais' tem >=1 linha

**EFEITO:**
- table tbody tr count >= 1 (CV03 salvou edital)


```yaml
id: passo_01_validar_lista_editais_salvos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const rows = document.querySelectorAll('table tbody tr');
          if (rows.length < 1) throw new Error('NENHUM edital salvo na lista');
          return `${rows.length} editais salvos`;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_01_validar_lista_editais_salvos"
```

## Passo 02 — Click PRIMEIRA linha (edital de maior score salvo)

**EFEITO REAL:** apos click, tabs aparecem (Aderencia/Lotes/Documentos/Riscos/Mercado/IA).

```yaml
id: passo_02_selecionar_primeiro_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('sem linhas');
          tr.scrollIntoView({block: 'center'});
          tr.click();
          return 'clicked_primeira_linha';
        }
    - tipo: wait
      valor_literal: 2500
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_02_selecionar_primeiro_edital"
```

## Passo 03 — EFEITO REAL: tabs aparecem (Aderencia ativa default)

Tabs do edital selecionado.

```yaml
id: passo_03_validar_tabs_aderencia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const tabs_alvo = ['Aderencia', 'Lotes', 'Documentos', 'Riscos', 'Mercado'];
          const found = tabs_alvo.filter(t => buttons.some(b => new RegExp(t, 'i').test(b.textContent || '')));
          if (found.length < 3) throw new Error(`Apenas ${found.length}/5 tabs visiveis: ${found.join(',')}`);
          return `tabs_visiveis: ${found.join(',')}`;
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV07_visual_fp.yaml#passo_03_validar_tabs_aderencia"
```
