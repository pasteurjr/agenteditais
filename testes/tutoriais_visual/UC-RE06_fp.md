---
uc_id: UC-RE06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE06_visual_fp.yaml
---

# UC-RE06 — Submissao Assistida no Portal (Fluxo Principal)

> **Predecessores:** UC-I03 OU UC-RE04 OU UC-RE05
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Permanecer na tab Laudos

Submissao acontece via botoes do laudo aberto.

**Observe criticamente:**
- Card 'Laudo Selecionado' (se laudo aberto) tem botoes de submissao

```yaml
id: passo_00_aba_laudos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-RE06_visual_fp.yaml#passo_00_aba_laudos"
```

## Passo 01 — Validar botao "Enviar para Revisao" / "Submeter"

Botao envia o laudo finalizado para o portal/sistema.

**Observe criticamente:**
- Botao 'Enviar para Revisao' OU 'Submeter' presente
- (Submissao real depende de laudo previamente gerado)

```yaml
id: passo_01_validar_botao_submissao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Enviar para Revis[ãa]o|Submeter|Salvar Rascunho/i.test(b.textContent || ''));
          return btn ? 'botao_submissao_presente' : 'sem_botao (laudo nao aberto)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-RE06_visual_fp.yaml#passo_01_validar_botao_submissao"
```
