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

## Passo 00 — Garantir PropostaPage carregada

Permanece em PropostaPage.

**Observe criticamente:**
- Botao 'Upload Proposta Externa' no header

```yaml
id: passo_00_garantir_proposta_page
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1, h2'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-R02_visual_fp.yaml#passo_00_garantir_proposta_page"
```

## Passo 01 — Localizar botao "Upload Proposta Externa"

Apenas valida que o botao existe (nao executa upload real, exigiria arquivo).

**Observe criticamente:**
- Botao 'Upload Proposta Externa' presente no header da PropostaPage

```yaml
id: passo_01_localizar_botao_upload
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Upload Proposta Externa/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_upload';
          // So valida presenca, nao clica (abre modal)
          return 'botao_presente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-R02_visual_fp.yaml#passo_01_localizar_botao_upload"
```
