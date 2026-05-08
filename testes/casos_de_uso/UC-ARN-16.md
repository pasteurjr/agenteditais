---
uc_id: UC-ARN-16
nome: "Label 'Requer credencial' clara"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-02"
---

# UC-ARN-16 — Label 'Requer credencial' clara

> **Origem:** observação **F04-02** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Form Novo do CRUD fontes-certidoes tem label nova com 'credencial'.

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Modal abre apos click E contem label 'credencial'

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-02 esta aplicada.
