---
uc_id: UC-FL04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FL04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FL04_visual_fp.yaml
---

# UC-FL04 — Cancelar/Silenciar Alerta (Fluxo Principal)

> **Predecessores:** UC-FL01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Garantir tabela de alertas com acoes

**Observe criticamente:**
- Coluna Acoes com botoes Cancelar/Silenciar (se ha alertas)

```yaml
id: passo_00_garantir_flags
acao:
  sequencia:
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL04_visual_fp.yaml#passo_00_garantir_flags"
```

## Passo 01 — Validar botoes Cancelar/Silenciar

**Observe criticamente:**
- Pelo menos 1 botao Cancelar OU Silenciar visivel em alguma linha (ou estado vazio)

```yaml
id: passo_01_validar_acoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Cancelar|Silenciar|Desativar/i.test(b.textContent||''));
          return btn ? 'acoes_presentes' : 'sem_alertas_para_acionar';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL04_visual_fp.yaml#passo_01_validar_acoes"
```
