---
uc_id: UC-RE04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE04_visual_fp.yaml
---

# UC-RE04 — Gerar Laudo de Recurso (Fluxo Principal)

> **Predecessores:** UC-RE02 + UC-RE01
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Click na tab "Laudos"

Tab Laudos com lista + botoes Novo/Upload.

**Observe criticamente:**
- Tab Laudos destacada
- Botoes 'Novo Laudo' e 'Upload Laudo'

```yaml
id: passo_00_aba_laudos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^Laudos/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-RE04_visual_fp.yaml#passo_00_aba_laudos"
```

## Passo 01 — Validar botao "Novo Laudo" (geracao IA)

Botao abre modal/inline pra gerar laudo via IA.

**Observe criticamente:**
- Botao 'Novo Laudo' presente
- **COMPORTAMENTO IA**: gera laudo juridico estruturado com fundamentacao baseada na analise da proposta vencedora

```yaml
id: passo_01_validar_botao_novo_laudo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Novo Laudo/i.test(b.textContent || ''));
          return btn ? 'presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-RE04_visual_fp.yaml#passo_01_validar_botao_novo_laudo"
```
