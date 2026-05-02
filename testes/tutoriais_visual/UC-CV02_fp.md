---
uc_id: UC-CV02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV02_visual_fp.yaml
---

# UC-CV02 — Explorar resultados e painel lateral do edital (Fluxo Principal)

> **Cenario:** apos UC-CV01 ter buscado e a grade ter resultados, click no botao "Ver detalhes" (icone Eye) do primeiro edital. Painel lateral abre com numero do edital, orgao, UF, modalidade, fonte, data abertura, etc.
>
> **Pre-requisitos:** UC-CV01 ja executado (grade tem resultados).

## Passo 00 — Setup: confirmar que estamos na CaptacaoPage com grade

```yaml
id: passo_00_confirmar_grade
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    # Grade ja deve ter linhas (CV01 carregou)
    - tipo: wait_for
      seletor: 'table tbody tr, .edital-card'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV02_visual_fp.yaml#passo_00_confirmar_grade"
```

## Passo 01 — Click "Ver detalhes" do primeiro edital

Click no botao com title="Ver detalhes" (icone Eye) da primeira linha da grade. Painel lateral abre.

**Observe criticamente:**
- Botao "Ver detalhes" (icone olho) presente na coluna de acoes
- Apos click, painel lateral aparece a direita
- Layout muda para "with-panel" (grade compacta + painel)
- Card do painel mostra numero do edital + orgao no header

```yaml
id: passo_01_abrir_painel_lateral
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button[title="Ver detalhes"]')];
          if (!buttons.length) {
            // fallback: clicar na primeira linha
            const tr = document.querySelector('table tbody tr');
            if (!tr) throw new Error('Nenhuma linha de edital pra clicar');
            tr.click();
            return 'clicado tr';
          }
          buttons[0].scrollIntoView({block: 'center'});
          buttons[0].click();
          return 'clicado botao';
        }
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: '.captacao-layout.with-panel, [class*="panel"], aside'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV02_visual_fp.yaml#passo_01_abrir_painel_lateral"
```
