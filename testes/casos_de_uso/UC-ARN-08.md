---
uc_id: UC-ARN-08
nome: "Sidebar persiste preferencia em localStorage"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-08"
---

# UC-ARN-08 — Sidebar persiste preferencia em localStorage

> **Origem:** observação **F01-08** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Expande secao Cadastros, verifica localStorage, simula reload (re-renderiza),
confirma que ainda esta expandido.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F01-08 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-08 esta aplicada.
