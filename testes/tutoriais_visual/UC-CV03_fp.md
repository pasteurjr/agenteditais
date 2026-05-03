---
uc_id: UC-CV03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV03_visual_fp.yaml
---

# UC-CV03 — Salvar edital, itens e scores (Fluxo Principal)

> **Cenario:** apos UC-CV01 ter buscado com Score Hibrido (grade ordenada por score desc), click no botao "Salvar edital" (icone Save) do **edital com maior score** (primeira linha). Backend cria registro em editais_salvos via crudCreate. Pode aparecer prompt "deseja baixar PDF?" — cancelamos.
>
> **Pre-requisitos:** UC-CV01 ja executado.

## Passo 00 — Confirmar grade na CaptacaoPage

```yaml
id: passo_00_confirmar_grade
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'table tbody tr, .edital-card'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV03_visual_fp.yaml#passo_00_confirmar_grade"
```

## Passo 01 — Click "Salvar edital" do edital com maior score

Backend cria edital_salvo via POST /api/crud/editais. **Como a grade vem ordenada por score desc** (CV01 usou Score Hibrido), a primeira linha eh o edital com maior pontuacao — ele eh quem sera salvo, garantindo que CV07/CV08 trabalhem com o melhor candidato. Pode aparecer dialog.confirm("baixar PDF?") — auto-aceita lida pelo executor.

**Observe criticamente:**
- Botao "Salvar edital" (icone Save) presente na coluna de acoes da primeira linha
- Primeira linha = edital com maior score
- Apos click, request POST /api/crud/editais retorna 201
- Pode abrir alert/confirm — auto-aceito
- ID do edital persiste em editais_salvos vinculado a empresa_id da Sprint 1

```yaml
id: passo_01_salvar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button[title="Salvar edital"]')];
          if (!buttons.length) throw new Error('Nenhum botao "Salvar edital" encontrado');
          buttons[0].scrollIntoView({block: 'center'});
          buttons[0].click();
          return 'clicked';
        }
    # Aguarda chamada API + possivel dialog
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-CV03_visual_fp.yaml#passo_01_salvar_edital"
```
