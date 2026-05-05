---
uc_id: UC-R02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R02_visual_fp.yaml
---

# UC-R02 — Upload de Proposta Externa (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Garantir PropostaPage

Botao 'Upload Proposta Externa' no header.

```yaml
id: passo_00_garantir_proposta_page
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1, h2'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-R02_visual_fp.yaml#passo_00_garantir_proposta_page"
```

## Passo 01 — Validar botao 'Upload Proposta Externa' presente

Botao abre modal de upload.

```yaml
id: passo_01_validar_botao_upload
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Upload Proposta Externa/i.test(b.textContent || ''));
          return btn ? 'botao_presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-R02_visual_fp.yaml#passo_01_validar_botao_upload"
```
