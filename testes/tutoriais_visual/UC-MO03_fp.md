---
uc_id: UC-MO03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO03_visual_fp.yaml
---

# UC-MO03 — Analisar Documentos da Empresa (sob demanda) (Fluxo Principal)

> **Predecessores:** UC-F01 (docs cadastrados)
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Localizar secao/aba "Analisar Documentos"

**COMPORTAMENTO IA**: analisa docs (certidoes, atestados) detectando vencimentos, RNs faltantes.

**Observe criticamente:**
- Botao 'Analisar Documentos' OU secao dedicada

```yaml
id: passo_00_validar_secao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Analisar Documentos|Analise de Documentos/i.test(b.textContent||''));
          return btn ? 'presente' : 'ausente_nesta_pagina';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-MO03_visual_fp.yaml#passo_00_validar_secao"
```
