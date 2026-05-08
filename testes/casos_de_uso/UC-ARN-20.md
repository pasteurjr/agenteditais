---
uc_id: UC-ARN-20
nome: "Validade do PDF prevalece sobre user"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-06"
---

# UC-ARN-20 — Validade do PDF prevalece sobre user

> **Origem:** observação **F04-06** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Endpoint upload de certidao retorna divergencia_validade quando data
digitada pelo user difere da data extraida do PDF (IA).


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Endpoint /api/empresa-certidoes/upload existe (nao 404)

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-06 esta aplicada.
