---
uc_id: UC-ARN-15
nome: "Filtro fontes-certidoes por UF da empresa"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-01"
---

# UC-ARN-15 — Filtro fontes-certidoes por UF da empresa

> **Origem:** observação **F04-01** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Empresa SP nao deve ver fontes UF=MG/PR/RS no listar fontes-certidoes.
Confirma que a API faz o filtro server-side.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- API retorna apenas federais + UF da propria empresa

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-01 esta aplicada.
