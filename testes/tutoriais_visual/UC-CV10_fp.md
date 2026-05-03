---
uc_id: UC-CV10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV10_visual_fp.yaml
---

# UC-CV10 — Confrontar documentacao com empresa (Fluxo Principal)

> **PO:** "Identificar Documentos Exigidos pelo Edital" usa IA — pode demorar 60-180s.
>
> **Cenario:** apos CV07 selecionar edital, abre aba "Documentos". Click "Identificar Documentos Exigidos pelo Edital" pra IA extrair requisitos. Lista de documentacao necessaria aparece com status (atende/nao atende) confrontando com docs da empresa Sprint 1 (UC-F03).
>
> **Pre-requisitos:** CV07, F03 (docs empresa).

## Passo 00 — Confirmar edital selecionado

```yaml
id: passo_00_confirmar_selecionado
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const tab = [...document.querySelectorAll('button')].find(b => /Aderencia|Lotes|Documentos|Riscos|Mercado/i.test(b.textContent || ''));
          if (tab) return 'edital ja selecionado';
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Sem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV10_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Abrir aba "Documentos"

```yaml
id: passo_01_abrir_aba_documentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button.tab-panel-tab, button')];
          const btn = buttons.find(b => /^Documentos\s*$/i.test(b.textContent.trim() || ''));
          if (!btn) throw new Error('Aba Documentos nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV10_visual_fp.yaml#passo_01_abrir_aba_documentos"
```

## Passo 02 — Click "Identificar Documentos" e aguardar IA

POST /api/editais/<id>/extrair-requisitos com IA. Backend confronta com docs F03.

**Observe criticamente:**
- Botao "Identificar Documentos Exigidos pelo Edital" presente
- Backend retorna 200/201
- Lista de documentacao aparece com status atende/nao atende

```yaml
id: passo_02_identificar_docs
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Identificar Documentos|Reidentificar Documentos/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Identificar Documentos nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV10_visual_fp.yaml#passo_02_identificar_docs"
```
