---
uc_id: UC-R07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R07_visual_fp.yaml
---

# UC-R07 — Gerenciar Status e Submissao (Fluxo Principal)

> **Predecessores:** UC-R01 OU R02
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Garantir proposta aberta

Botoes status: Salvar Rascunho, Enviar Revisao, Aprovar.

```yaml
id: passo_00_proposta_aberta
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-R07_visual_fp.yaml#passo_00_proposta_aberta"
```

## Passo 01 — Validar botoes Salvar Rascunho / Enviar Revisao / Aprovar

3 botoes de gestao de status.

```yaml
id: passo_01_validar_botoes_status
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const sr = buttons.find(b => /Salvar Rascunho/i.test(b.textContent || ''));
          const er = buttons.find(b => /Enviar para Revis[ãa]o/i.test(b.textContent || ''));
          const ap = buttons.find(b => /^Aprovar$/i.test((b.textContent||'').trim()));
          return 'sr=' + (!!sr) + ' er=' + (!!er) + ' ap=' + (!!ap);
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-R07_visual_fp.yaml#passo_01_validar_botoes_status"
```
