---
uc_id: UC-ARN-17
nome: "Coluna Ativa/Inativa de Fonte"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-03"
---

# UC-ARN-17 — Coluna Ativa/Inativa de Fonte

> **Origem:** observação **F04-03** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

EmpresaPage > tabela certidoes tem coluna Fonte com badge Ativa/Inativa.

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F04-03 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-03 esta aplicada.
