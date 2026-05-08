---
uc_id: UC-ARN-10
nome: "Cursor pointer global em elementos clicaveis"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F02-02"
---

# UC-ARN-10 — Cursor pointer global em elementos clicaveis

> **Origem:** observação **F02-02** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Confirma via getComputedStyle que ≥3 botoes nao-disabled tem cursor:pointer.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- ≥3 botoes nao-disabled tem cursor:pointer (sem qualquer outro valor)

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F02-02 esta aplicada.
