---
uc_id: UC-ARN-12
nome: "Badge 'Vencido' vs 'Falta envio'"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F03-01"
---

# UC-ARN-12 — Badge 'Vencido' vs 'Falta envio'

> **Origem:** observação **F03-01** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Logica de calcDocStatus distingue 4 status. Testa exatamente 4 cenarios
(vencido, vence, ok, falta) e confirma todos retornam corretos.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Logica calcDocStatus retorna 4 status diferentes nos 4 cenarios

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F03-01 esta aplicada.
