---
uc_id: UC-CV09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV09_visual_fp.yaml
---

# UC-CV09 — Importar itens e extrair lotes via IA (Fluxo Principal)

> **PO:** DeepSeek processa PDF do edital — pode demorar 30-180s.
>
> **Cenario:** apos CV07 selecionar edital, clica aba "Lotes", click "Extrair Lotes via IA". Backend baixa PDF + extrai estrutura via IA + cria registros em editais_lotes.
>
> **Pre-requisitos:** CV07.

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
          if (!tr) throw new Error('Nem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Click aba "Lotes"

```yaml
id: passo_01_abrir_aba_lotes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button.tab-panel-tab, button')];
          const btn = buttons.find(b => /^Lotes/i.test(b.textContent.trim() || '') || /^\s*Lotes\s*\(/i.test(b.textContent || ''));
          if (!btn) throw new Error('Aba Lotes nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_01_abrir_aba_lotes"
```

## Passo 02 — Click "Extrair Lotes via IA"

POST /api/editais/<id>/lotes/extrair com timeout 240s.

**Observe criticamente:**
- Botao "Extrair Lotes via IA" presente na aba
- Backend retorna 200/201 (lista de lotes pode estar vazia se PDF nao tem itens)

```yaml
id: passo_02_extrair_lotes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Extrair Lotes via IA|Extraindo/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Extrair Lotes nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_02_extrair_lotes"
```
