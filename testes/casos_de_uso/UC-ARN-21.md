---
uc_id: UC-ARN-21
nome: "Magic bytes %PDF rejeita HTML"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-07"
---

# UC-ARN-21 — Magic bytes %PDF rejeita HTML

> **Origem:** observação **F04-07** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Upload de arquivo nao-PDF retorna 400 com magic_bytes_invalidos.

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F04-07 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-07 esta aplicada.
