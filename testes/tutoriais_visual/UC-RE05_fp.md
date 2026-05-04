---
uc_id: UC-RE05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE05_visual_fp.yaml
---

# UC-RE05 — Gerar Laudo de Contra-Razao (Fluxo Principal)

> **Predecessores:** UC-R01 OU UC-R02 + UC-CV03
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Permanecer na tab Laudos

Mesmo cenario de RE04, com geracao de contra-razao em vez de recurso.

**Observe criticamente:**
- Tab Laudos ativa

```yaml
id: passo_00_aba_laudos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-RE05_visual_fp.yaml#passo_00_aba_laudos"
```

## Passo 01 — Validar opcao de gerar contra-razao (alem de recurso)

No modal Novo Laudo deve haver opcao de tipo (recurso/contra-razao).

**Observe criticamente:**
- Botao Novo Laudo abre opcoes
- **COMPORTAMENTO IA**: contra-razao argumenta defesa contra recurso de terceiros

```yaml
id: passo_01_validar_dropdown_tipo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toLowerCase();
          const tem = /contra-razao|contra-razão|contrarrazao/i.test(txt);
          return tem ? 'opcao_visivel' : 'opcao_ainda_nao_visivel (precisa abrir modal Novo Laudo)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-RE05_visual_fp.yaml#passo_01_validar_dropdown_tipo"
```
