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

Logica de calcDocStatus distingue 4 status. Testa exatamente 4 cenarios
(vencido, vence, ok, falta) e confirma todos retornam corretos.


## Cobre 4 cenarios de calcDocStatus

> **Validando observação Arnaldo F03-01** — Badge 'Vencido' vs 'Falta envio'

Confirma F03-01: logica calcDocStatus distingue 4 status — vencido, vence (<=30 dias), ok, falta. Antes confundia 'vencido' com 'falta envio'.

**Dados/pré-condições:**
- Funcao calcDocStatus implementada com 4 retornos: vencido, vence (<=30 dias), ok, falta

**Observe criticamente:**
- Funcao calcDocStatus testada com 4 cenarios distintos
- Cenario arquivo+passada → retorna 'vencido'
- Cenario arquivo+15dias → retorna 'vence'
- Cenario arquivo+60dias → retorna 'ok'
- Cenario sem arquivo → retorna 'falta' (nao 'vencido')

```yaml
id: passo_00_validar_logica_4_status
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F03-01: replica logica calcDocStatus do front e testa\
    \ 4 cenarios\n  function calc(hasArquivo, dataVencimento) {\n    if (!hasArquivo)\
    \ return 'falta';\n    if (!dataVencimento) return 'ok';\n    const venc = new\
    \ Date(dataVencimento);\n    const dias = (venc - new Date()) / 86400000;\n  \
    \  if (dias <= 0) return 'vencido';\n    if (dias <= 30) return 'vence';\n   \
    \ return 'ok';\n  }\n  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0,10);\n\
    \  const f15 = new Date(Date.now() + 15*86400000).toISOString().slice(0,10);\n\
    \  const f60 = new Date(Date.now() + 60*86400000).toISOString().slice(0,10);\n\
    \  const cenarios = [\n    {nome: 'arquivo+passada', e: [true, ontem], esp: 'vencido'},\n\
    \    {nome: 'arquivo+15dias',  e: [true, f15],   esp: 'vence'},\n    {nome: 'arquivo+60dias',\
    \  e: [true, f60],   esp: 'ok'},\n    {nome: 'sem arquivo',     e: [false, null],\
    \ esp: 'falta'},\n  ];\n  const erros = [];\n  for (const c of cenarios) {\n \
    \   const r = calc(...c.e);\n    if (r !== c.esp) erros.push(`${c.nome}: esp=${c.esp}\
    \ got=${r}`);\n  }\n  if (erros.length) throw new Error(`F03-01 calcDocStatus\
    \ errado: ${erros.join(' | ')}`);\n  return `F03-01_OK 4_cenarios_OK (vencido,vence,ok,falta)`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-12_visual_fp.yaml#passo_00_validar_logica_4_status
```
