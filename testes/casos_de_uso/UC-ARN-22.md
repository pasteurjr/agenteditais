---
uc_id: UC-ARN-22
nome: "CRF FGTS persiste arquivo_path"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-08"
---

# UC-ARN-22 — CRF FGTS persiste arquivo_path

> **Origem:** observação **F04-08** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Backend sempre salva path quando scraper retorna PDF, independente do status.

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F04-08 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-08 esta aplicada.
