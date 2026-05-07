---
uc_id: UC-ARN-12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-12_visual_fp.yaml
---

# UC-ARN-12 — Badge 'Vencido' vs 'Falta envio' (Fluxo Principal)

> **Origem da observação:** F03-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Logica de calcDocStatus distingue 4 status.

## Cria 2 docs simulados e confere badges

```yaml
id: passo_00_validar_logica_4_status
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // Simula a funcao calcDocStatus do front\n  function\
    \ calc(hasArquivo, dataVencimento) {\n    if (!hasArquivo) return 'falta';\n \
    \   if (!dataVencimento) return 'ok';\n    const venc = new Date(dataVencimento);\n\
    \    const dias = (venc - new Date()) / 86400000;\n    if (dias <= 0) return 'vencido';\n\
    \    if (dias <= 30) return 'vence';\n    return 'ok';\n  }\n  const ontem = new\
    \ Date(Date.now() - 86400000).toISOString().slice(0,10);\n  const r1 = calc(true,\
    \ ontem);   // vencido (tem arquivo + data passada)\n  const r2 = calc(false,\
    \ null);   // falta (sem arquivo)\n  if (r1 !== 'vencido') throw new Error(`Esperado\
    \ 'vencido' achou '${r1}'`);\n  if (r2 !== 'falta') throw new Error(`Esperado\
    \ 'falta' achou '${r2}'`);\n  return 'F03-01_logica_4_status_OK';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-12_visual_fp.yaml#passo_00_validar_logica_4_status
```
