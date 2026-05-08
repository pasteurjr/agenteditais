---
uc_id: UC-ARN-19
nome: "Tooltips ricos na coluna Acoes"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-05"
---

# UC-ARN-19 — Tooltips ricos na coluna Acoes

> **Origem:** observação **F04-05** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

≥3 botoes da coluna Acoes tem title='...' descritivo (>15 chars).

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- ≥3 botoes com title >15 chars (descritivo, nao 'Salvar' generico)

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-05 esta aplicada.
